import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateOrigin, csrfErrorResponse } from '@/lib/csrf'
import { sanitizeEmail, sanitizeZip, sanitizeComment } from '@/lib/sanitize'
import { verifyRecaptchaTokenSimple } from '@/lib/recaptcha'
import { log } from '@/lib/logger'

export async function POST(request: NextRequest) {
  // CSRF protection: validate request origin
  if (!validateOrigin(request)) {
    return csrfErrorResponse()
  }

  try {
    // Rate limiting: 5 survey submissions per hour per IP
    const clientIP = getClientIP(request)
    const rateLimit = await checkRateLimit(`survey:${clientIP}`, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Verify reCAPTCHA token (if configured)
    const recaptchaToken = body.recaptchaToken
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptchaTokenSimple(recaptchaToken)
      if (!recaptchaResult.success) {
        log.security('survey_recaptcha_failed', { error: recaptchaResult.error })
        return NextResponse.json(
          { error: 'Security verification failed. Please try again.' },
          { status: 400 }
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
    const validateOption = <T extends string>(value: string | undefined, validOptions: readonly T[]): T | undefined => {
      if (!value) return undefined
      return (validOptions as readonly string[]).includes(value) ? (value as T) : undefined
    }

    // Validate q9 array
    type Q9Option = typeof validQ9[number]
    const validateQ9 = (values: string[] | undefined): Q9Option[] | undefined => {
      if (!values || !Array.isArray(values)) return undefined
      const filtered = values.filter((v): v is Q9Option => (validQ9 as readonly string[]).includes(v))
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
        q1: validateOption(q1, validQ1),
        q2: validateOption(q2, validQ2),
        q3: validateOption(q3, validQ3),
        q4: validateOption(q4, validQ4),
        q5: validateOption(q5, validQ5),
        q6: validateOption(q6, validQ6),
        q7: validateOption(q7, validQ7),
        q8: validateOption(q8, validQ8),
        q9: validateQ9(q9),
        comments: comments || undefined,
        zip: zip || undefined,
        email: email || undefined,
        status: 'new'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    log.failure('survey_submission', error)
    return NextResponse.json(
      { error: 'Failed to submit survey. Please try again.' },
      { status: 500 }
    )
  }
}
