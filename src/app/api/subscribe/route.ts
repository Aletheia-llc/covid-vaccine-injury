import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateCsrfToken } from '@/lib/csrf'
import { sanitizeName, sanitizeEmail, sanitizePhone, sanitizeZip } from '@/lib/sanitize'
import { verifyRecaptchaTokenSimple } from '@/lib/recaptcha'
import { createRequestLogger } from '@/lib/logger'
import { RATE_LIMITS, REQUEST_SIZE_LIMITS } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const log = createRequestLogger({ requestId, path: '/api/subscribe', method: 'POST' })

  // CSRF protection: validate token
  const csrfValid = await validateCsrfToken(request)
  if (!csrfValid) {
    log.warn('CSRF validation failed')
    return NextResponse.json(
      { error: 'Security validation failed. Please refresh and try again.' },
      { status: 403, headers: { 'X-Request-ID': requestId } }
    )
  }

  try {
    // Check content-length to reject oversized requests early
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > REQUEST_SIZE_LIMITS.SUBSCRIBE) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }

    // Rate limiting: 10 subscription attempts per hour per IP
    const clientIP = getClientIP(request)
    const rateLimit = await checkRateLimit(`subscribe:${clientIP}`, RATE_LIMITS.SUBSCRIBE)

    if (!rateLimit.success) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.max(1, retryAfterSeconds)) }
        }
      )
    }

    const body = await request.json()

    // Verify reCAPTCHA token - required when reCAPTCHA is configured
    const recaptchaConfigured = !!(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY)
    const recaptchaToken = body.recaptchaToken

    if (recaptchaConfigured) {
      if (!recaptchaToken) {
        log.warn({ event: 'subscribe_recaptcha_missing' }, 'reCAPTCHA token required but not provided')
        return NextResponse.json(
          { error: 'Security verification required. Please enable JavaScript and try again.' },
          { status: 400, headers: { 'X-Request-ID': requestId } }
        )
      }

      const recaptchaResult = await verifyRecaptchaTokenSimple(recaptchaToken)
      if (!recaptchaResult.success) {
        log.warn({ event: 'subscribe_recaptcha_failed', error: recaptchaResult.error }, 'reCAPTCHA verification failed')
        return NextResponse.json(
          { error: 'Security verification failed. Please try again.' },
          { status: 400, headers: { 'X-Request-ID': requestId } }
        )
      }
    }

    const { name: rawName, email: rawEmail, phone: rawPhone, zip: rawZip } = body

    // Sanitize all input
    const name = sanitizeName(rawName)
    const email = sanitizeEmail(rawEmail)
    const phone = sanitizePhone(rawPhone)
    const zip = sanitizeZip(rawZip)

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email validation (after sanitization)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Validate ZIP if provided (must be exactly 5 digits after sanitization)
    if (zip && zip.length !== 5) {
      return NextResponse.json({ error: 'Please enter a valid 5-digit ZIP code' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Try to create first, then handle duplicate key error
    // This avoids the race condition of check-then-act pattern
    try {
      await payload.create({
        collection: 'subscribers',
        data: {
          name,
          email,
          phone: phone || undefined,
          zip: zip || undefined,
          source: 'website',
          status: 'active',
        },
      })
      return NextResponse.json(
        { success: true, message: 'Thank you for subscribing!' },
        { headers: { 'X-Request-ID': requestId } }
      )
    } catch (createError) {
      // Check if this is a duplicate key error
      const errorMessage = createError instanceof Error ? createError.message : String(createError)
      const isDuplicate = errorMessage.includes('unique') ||
                          errorMessage.includes('duplicate') ||
                          errorMessage.includes('already exists')

      if (isDuplicate) {
        // Email already exists - check if unsubscribed and can be reactivated
        const existing = await payload.find({
          collection: 'subscribers',
          where: { email: { equals: email } },
          limit: 1,
        })

        if (existing.docs.length > 0 && existing.docs[0].status === 'unsubscribed') {
          await payload.update({
            collection: 'subscribers',
            id: existing.docs[0].id,
            data: {
              name,
              phone: phone || undefined,
              zip: zip || undefined,
              status: 'active',
            },
          })
          return NextResponse.json(
            { success: true, message: 'Welcome back! Your subscription has been reactivated.' },
            { headers: { 'X-Request-ID': requestId } }
          )
        }

        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 400, headers: { 'X-Request-ID': requestId } }
        )
      }

      // Not a duplicate error - rethrow
      throw createError
    }
  } catch (error) {
    log.error({ err: error, event: 'subscribe_failed' }, 'Subscribe failed')
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500, headers: { 'X-Request-ID': requestId } }
    )
  }
}
