import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

type SubjectType = 'general' | 'story' | 'media' | 'legislative' | 'other'

export async function POST(request: Request) {
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

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as SubjectType
    const message = formData.get('message') as string

    if (!name || !email || !subject || !message) {
      return NextResponse.redirect(new URL('/?error=missing-fields', request.url))
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
