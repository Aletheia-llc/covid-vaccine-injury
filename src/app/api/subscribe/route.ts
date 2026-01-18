import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
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
    const { name, email, phone, zip } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Validate ZIP if provided
    if (zip && !/^\d{5}$/.test(zip)) {
      return NextResponse.json({ error: 'Please enter a valid 5-digit ZIP code' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if email already exists
    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email.toLowerCase() } },
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
            name: name.trim(),
            phone: phone?.trim() || undefined,
            zip: zip?.trim() || undefined,
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
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || undefined,
        zip: zip?.trim() || undefined,
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
