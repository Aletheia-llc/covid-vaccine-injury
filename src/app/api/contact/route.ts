import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateCsrfToken } from '@/lib/csrf'
import { sanitizeName, sanitizeEmail, sanitizeComment } from '@/lib/sanitize'
import { verifyRecaptchaTokenSimple } from '@/lib/recaptcha'
import { createRequestLogger } from '@/lib/logger'
import { RATE_LIMITS } from '@/lib/constants'

type SubjectType = 'general' | 'story' | 'media' | 'legislative' | 'other'

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  const log = createRequestLogger({ requestId, path: '/api/contact', method: 'POST' })

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
    // Rate limiting: 5 contact submissions per hour per IP
    const clientIP = getClientIP(request)
    const rateLimit = await checkRateLimit(`contact:${clientIP}`, RATE_LIMITS.CONTACT)

    if (!rateLimit.success) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.max(1, retryAfterSeconds)) }
        }
      )
    }

    // Support both JSON and FormData for flexibility
    const contentType = request.headers.get('content-type') || ''
    let rawName: string
    let rawEmail: string
    let subject: SubjectType
    let rawMessage: string
    let recaptchaToken: string | undefined

    if (contentType.includes('application/json')) {
      const body = await request.json()
      rawName = body.name
      rawEmail = body.email
      subject = body.subject
      rawMessage = body.message
      recaptchaToken = body.recaptchaToken
    } else {
      const formData = await request.formData()
      rawName = formData.get('name') as string
      rawEmail = formData.get('email') as string
      subject = formData.get('subject') as SubjectType
      rawMessage = formData.get('message') as string
      recaptchaToken = formData.get('recaptchaToken') as string | undefined
    }

    // Verify reCAPTCHA token - required when reCAPTCHA is configured
    const recaptchaConfigured = !!(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY)

    if (recaptchaConfigured) {
      if (!recaptchaToken) {
        log.warn({ event: 'contact_recaptcha_missing' }, 'reCAPTCHA token required but not provided')
        return NextResponse.json(
          { error: 'Security verification required. Please enable JavaScript and try again.' },
          { status: 400, headers: { 'X-Request-ID': requestId } }
        )
      }

      const recaptchaResult = await verifyRecaptchaTokenSimple(recaptchaToken)
      if (!recaptchaResult.success) {
        log.warn({ event: 'contact_recaptcha_failed', error: recaptchaResult.error }, 'reCAPTCHA verification failed')
        return NextResponse.json(
          { error: 'Security verification failed. Please try again.' },
          { status: 400, headers: { 'X-Request-ID': requestId } }
        )
      }
    }

    if (!rawName || !rawEmail || !subject || !rawMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, subject, and message are required.' },
        { status: 400 }
      )
    }

    // Sanitize user input
    const name = sanitizeName(rawName)
    const email = sanitizeEmail(rawEmail)
    const message = sanitizeComment(rawMessage)

    // Validate sanitized values
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Invalid input. Please check your name, email, and message.' },
        { status: 400 }
      )
    }

    // Validate subject is one of allowed values
    const validSubjects: SubjectType[] = ['general', 'story', 'media', 'legislative', 'other']
    if (!validSubjects.includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject type.' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    await payload.create({
      collection: 'form-submissions',
      data: {
        name,
        email,
        subject,
        message,
        status: 'new',
      },
    })

    return NextResponse.json(
      { success: true, message: 'Your message has been sent.' },
      { headers: { 'X-Request-ID': requestId } }
    )
  } catch (error) {
    log.error({ err: error, event: 'contact_form_submission' }, 'Contact form submission failed')
    return NextResponse.json(
      { error: 'Unable to send message. Please try again later.' },
      { status: 500, headers: { 'X-Request-ID': requestId } }
    )
  }
}
