import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { reportError } from '@/lib/error-reporting'
import { createRequestLogger } from '@/lib/logger'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateCsrfToken } from '@/lib/csrf'

// Maximum request body size (1KB - checkout requests should be tiny)
const MAX_REQUEST_SIZE = 1024
// Maximum donation amount ($1 million - reasonable upper bound)
const MAX_DONATION_AMOUNT = 1000000

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const log = createRequestLogger({ requestId, path: '/api/checkout', method: 'POST' })

  // CSRF protection: validate token
  const csrfValid = await validateCsrfToken(request)
  if (!csrfValid) {
    log.warn({
      event: 'csrf_validation_failed',
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer')
    }, 'CSRF validation failed')
    return NextResponse.json(
      { error: 'Security validation failed. Please refresh and try again.' },
      { status: 403, headers: { 'X-Request-ID': requestId } }
    )
  }

  try {
    // Get client IP for rate limiting
    const ip = getClientIP(request)

    // Check rate limit (10 checkout attempts per minute)
    const rateCheck = await checkRateLimit(ip, { maxRequests: 10, windowMs: 60000 })
    if (!rateCheck.success) {
      log.warn({ event: 'checkout_rate_limited', ipPrefix: ip.substring(0, 8) }, 'Rate limit exceeded')
      const retryAfterSeconds = Math.ceil((rateCheck.resetTime - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.max(1, retryAfterSeconds)) }
        }
      )
    }

    // Check content-length to reject oversized requests early
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    const { amount, recurring } = body

    // Validate amount: must be a finite positive number, minimum $5, maximum $1M
    if (
      typeof amount !== 'number' ||
      !Number.isFinite(amount) ||
      amount < 5 ||
      amount > MAX_DONATION_AMOUNT
    ) {
      if (typeof amount === 'number' && amount > MAX_DONATION_AMOUNT) {
        return NextResponse.json(
          { error: 'For donations over $1,000,000, please contact us directly' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: 'Minimum donation is $5' }, { status: 400 })
    }

    // Validate recurring flag if provided
    if (recurring !== undefined && typeof recurring !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    // Check for API key
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      log.error({ event: 'stripe_checkout_not_configured' }, 'Stripe API key missing')
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Validate key format more thoroughly (log server-side only, never expose to client)
    // Stripe secret keys are: sk_test_ or sk_live_ followed by 24+ alphanumeric chars
    const stripeKeyPattern = /^sk_(test|live)_[a-zA-Z0-9]{24,}$/
    if (!stripeKeyPattern.test(stripeKey)) {
      log.error({
        event: 'stripe_checkout_invalid_key_format',
        keyLength: stripeKey.length,
        prefix: stripeKey.substring(0, 8),
      }, 'Invalid Stripe key format')
      return NextResponse.json(
        { error: 'Payment system configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeKey)
    const baseUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || 'https://covidvaccineinjury.org'
    ).trim()

    if (recurring) {
      // Create a recurring donation (subscription)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Monthly Donation - COVID Vaccine Injury Advocacy',
                description:
                  'Your recurring gift supports advocacy for fair vaccine injury compensation.',
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/donate`,
        billing_address_collection: 'required',
      })

      log.info({ event: 'stripe_checkout_created', recurring: true, amount }, 'Checkout session created')
      return NextResponse.json({ url: session.url })
    } else {
      // Create a one-time donation
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Donation - COVID Vaccine Injury Advocacy',
                description:
                  'Your gift supports advocacy for fair vaccine injury compensation for all Americans.',
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/donate`,
        billing_address_collection: 'required',
        submit_type: 'donate',
      })

      log.info({ event: 'stripe_checkout_created', recurring: false, amount }, 'Checkout session created')
      return NextResponse.json({ url: session.url })
    }
  } catch (error) {
    reportError(error, { action: 'stripeCheckout' })
    return NextResponse.json(
      { error: 'Unable to process donation. Please try again or contact support.' },
      { status: 500 }
    )
  }
}
