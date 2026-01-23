import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateCsrfToken } from '@/lib/csrf'
import { sanitizeEmail, sanitizeZip, sanitizeComment } from '@/lib/sanitize'
import { verifyRecaptchaTokenSimple } from '@/lib/recaptcha'
import { createRequestLogger } from '@/lib/logger'
import { RATE_LIMITS, REQUEST_SIZE_LIMITS } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const log = createRequestLogger({ requestId, path: '/api/survey', method: 'POST' })

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
    if (contentLength && parseInt(contentLength, 10) > REQUEST_SIZE_LIMITS.SURVEY) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }

    // Rate limiting: 5 survey submissions per hour per IP
    const clientIP = getClientIP(request)
    const rateLimit = await checkRateLimit(`survey:${clientIP}`, RATE_LIMITS.SURVEY)

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

    const body = await request.json()

    // Verify reCAPTCHA token - required when reCAPTCHA is configured
    const recaptchaConfigured = !!(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY)
    const recaptchaToken = body.recaptchaToken

    if (recaptchaConfigured) {
      if (!recaptchaToken) {
        log.warn({ event: 'survey_recaptcha_missing' }, 'reCAPTCHA token required but not provided')
        return NextResponse.json(
          { error: 'Security verification required. Please enable JavaScript and try again.' },
          { status: 400, headers: { 'X-Request-ID': requestId } }
        )
      }

      const recaptchaResult = await verifyRecaptchaTokenSimple(recaptchaToken)
      if (!recaptchaResult.success) {
        log.warn({ event: 'survey_recaptcha_failed', error: recaptchaResult.error }, 'reCAPTCHA verification failed')
        return NextResponse.json(
          { error: 'Security verification failed. Please try again.' },
          { status: 400, headers: { 'X-Request-ID': requestId } }
        )
      }
    }

    const {
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      q7,
      q8,
      q9,
      comments: rawComments,
      zip: rawZip,
      email: rawEmail
    } = body

    // Define valid options for each question (must match SurveyResponses collection)
    const validQ1 = ['yes', 'no', 'unsure'] as const
    const validQ2 = ['yes', 'no'] as const
    const validQ3 = ['me', 'immediate', 'acquaintance'] as const
    const validQ4 = ['mild', 'moderate', 'severe', 'permanent', 'death'] as const
    const validQ5 = ['yes', 'partially', 'no'] as const
    const validQ6 = ['yes', 'no-unaware', 'no-deadline', 'no-complex', 'no-other'] as const
    const validQ7 = ['pending', 'denied-deadline', 'denied-records', 'denied-proof', 'compensated'] as const
    const validQ8 = ['yes', 'somewhat', 'no'] as const
    const validQ9 = ['vicp-transfer', 'deadline', 'pain-suffering', 'attorney-fees', 'judicial-review', 'injury-table'] as const

    // Validate required field
    if (!q1 || !validQ1.includes(q1)) {
      return NextResponse.json(
        { error: 'Please answer the first question' },
        { status: 400 }
      )
    }

    // Validate optional select fields - returns the value if valid, undefined otherwise
    // Logs a warning if an invalid value was submitted (potential data quality issue or tampering)
    const validateOption = <T extends string>(
      value: string | undefined,
      validOptions: readonly T[],
      fieldName: string
    ): T | undefined => {
      if (!value) return undefined
      if ((validOptions as readonly string[]).includes(value)) {
        return value as T
      }
      // Log invalid value for monitoring (could indicate form tampering)
      log.warn({
        event: 'survey_invalid_option',
        field: fieldName,
        value: String(value).substring(0, 50), // Truncate for safety
      }, 'Invalid survey option submitted')
      return undefined
    }

    // Validate q9 array
    type Q9Option = typeof validQ9[number]
    const validateQ9 = (values: string[] | undefined): Q9Option[] | undefined => {
      if (!values || !Array.isArray(values)) return undefined
      const filtered = values.filter((v): v is Q9Option => {
        const isValid = (validQ9 as readonly string[]).includes(v)
        if (!isValid && v) {
          log.warn({
            event: 'survey_invalid_option',
            field: 'q9',
            value: String(v).substring(0, 50),
          }, 'Invalid survey option submitted')
        }
        return isValid
      })
      return filtered.length > 0 ? filtered : undefined
    }

    // Sanitize free-form inputs
    const comments = sanitizeComment(rawComments)
    const zip = sanitizeZip(rawZip)
    const email = sanitizeEmail(rawEmail)

    const payload = await getPayload({ config })

    await payload.create({
      collection: 'survey-responses',
      data: {
        q1: validateOption(q1, validQ1, 'q1'),
        q2: validateOption(q2, validQ2, 'q2'),
        q3: validateOption(q3, validQ3, 'q3'),
        q4: validateOption(q4, validQ4, 'q4'),
        q5: validateOption(q5, validQ5, 'q5'),
        q6: validateOption(q6, validQ6, 'q6'),
        q7: validateOption(q7, validQ7, 'q7'),
        q8: validateOption(q8, validQ8, 'q8'),
        q9: validateQ9(q9),
        comments: comments || undefined,
        zip: zip || undefined,
        email: email || undefined,
        status: 'new'
      }
    })

    return NextResponse.json(
      { success: true },
      { headers: { 'X-Request-ID': requestId } }
    )
  } catch (error) {
    log.error({ err: error, event: 'survey_submission_failed' }, 'Survey submission failed')
    return NextResponse.json(
      { error: 'Failed to submit survey. Please try again.' },
      { status: 500, headers: { 'X-Request-ID': requestId } }
    )
  }
}
