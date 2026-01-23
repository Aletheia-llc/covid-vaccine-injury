import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { reportError } from '@/lib/error-reporting'
import { log } from '@/lib/logger'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

// Maximum request body size (1KB - checkout requests should be tiny)
const MAX_REQUEST_SIZE = 1024
// Maximum donation amount ($1 million - reasonable upper bound)
const MAX_DONATION_AMOUNT = 1000000

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = getClientIP(request)

    // Check rate limit (10 checkout attempts per minute)
    const rateCheck = checkRateLimit(ip, { maxRequests: 10, windowMs: 60000 })
    if (!rateCheck.success) {
      log.security('checkout_rate_limited', { ipPrefix: ip.substring(0, 8) })
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
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
      log.security('stripe_checkout_not_configured')
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Validate key format (log server-side only, never expose to client)
    if (!stripeKey.startsWith('sk_test_') && !stripeKey.startsWith('sk_live_')) {
      log.security('stripe_checkout_invalid_key_format')
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

      log.success('stripe_checkout_created', { recurring: true, amount })
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

      log.success('stripe_checkout_created', { recurring: false, amount })
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
