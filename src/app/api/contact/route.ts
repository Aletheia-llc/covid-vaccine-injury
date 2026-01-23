import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateOrigin, csrfErrorResponse } from '@/lib/csrf'
import { sanitizeName, sanitizeEmail, sanitizeComment } from '@/lib/sanitize'
import { log } from '@/lib/logger'

type SubjectType = 'general' | 'story' | 'media' | 'legislative' | 'other'

export async function POST(request: Request) {
  // CSRF protection: validate request origin
  if (!validateOrigin(request)) {
    return csrfErrorResponse()
  }

  try {
    // Rate limiting: 5 contact submissions per hour per IP
    const clientIP = getClientIP(request)
    const rateLimit = await checkRateLimit(`contact:${clientIP}`, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5
    })

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

    if (contentType.includes('application/json')) {
      const body = await request.json()
      rawName = body.name
      rawEmail = body.email
      subject = body.subject
      rawMessage = body.message
    } else {
      const formData = await request.formData()
      rawName = formData.get('name') as string
      rawEmail = formData.get('email') as string
      subject = formData.get('subject') as SubjectType
      rawMessage = formData.get('message') as string
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

    return NextResponse.json({ success: true, message: 'Your message has been sent.' })
  } catch (error) {
    log.failure('contact_form_submission', error)
    return NextResponse.json(
      { error: 'Unable to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
