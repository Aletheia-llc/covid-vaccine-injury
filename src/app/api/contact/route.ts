import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateOrigin, csrfErrorResponse } from '@/lib/csrf'
import { sanitizeName, sanitizeEmail, sanitizeComment } from '@/lib/sanitize'

type SubjectType = 'general' | 'story' | 'media' | 'legislative' | 'other'

export async function POST(request: Request) {
  // CSRF protection: validate request origin
  if (!validateOrigin(request)) {
    return csrfErrorResponse()
  }

  try {
    // Rate limiting: 5 contact submissions per hour per IP
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`contact:${clientIP}`, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5
    })

    if (!rateLimit.success) {
      return NextResponse.redirect(new URL('/?error=rate-limited', request.url))
    }

    const formData = await request.formData()

    const rawName = formData.get('name') as string
    const rawEmail = formData.get('email') as string
    const subject = formData.get('subject') as SubjectType
    const rawMessage = formData.get('message') as string

    if (!rawName || !rawEmail || !subject || !rawMessage) {
      return NextResponse.redirect(new URL('/?error=missing-fields', request.url))
    }

    // Sanitize user input
    const name = sanitizeName(rawName)
    const email = sanitizeEmail(rawEmail)
    const message = sanitizeComment(rawMessage)

    // Validate sanitized values
    if (!name || !email || !message) {
      return NextResponse.redirect(new URL('/?error=invalid-input', request.url))
    }

    // Validate subject is one of allowed values
    const validSubjects: SubjectType[] = ['general', 'story', 'media', 'legislative', 'other']
    if (!validSubjects.includes(subject)) {
      return NextResponse.redirect(new URL('/?error=invalid-input', request.url))
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

    return NextResponse.redirect(new URL('/?success=true', request.url))
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.redirect(new URL('/?error=server-error', request.url))
  }
}
