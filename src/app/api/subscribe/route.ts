import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateOrigin, csrfErrorResponse } from '@/lib/csrf'
import { sanitizeName, sanitizeEmail, sanitizePhone, sanitizeZip } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  // CSRF protection: validate request origin
  if (!validateOrigin(request)) {
    return csrfErrorResponse()
  }

  try {
    // Rate limiting: 10 subscription attempts per hour per IP
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`subscribe:${clientIP}`, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
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

    // Check if email already exists
    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      // If they unsubscribed before, reactivate
      const existingDoc = existing.docs[0]
      if (existingDoc.status === 'unsubscribed') {
        await payload.update({
          collection: 'subscribers',
          id: existingDoc.id,
          data: {
            name,
            phone: phone || undefined,
            zip: zip || undefined,
            status: 'active',
          },
        })
        return NextResponse.json({ success: true, message: 'Welcome back! Your subscription has been reactivated.' })
      }
      return NextResponse.json({ error: 'This email is already subscribed' }, { status: 400 })
    }

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

    return NextResponse.json({ success: true, message: 'Thank you for subscribing!' })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }
}
