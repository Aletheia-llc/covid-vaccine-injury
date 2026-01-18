import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 survey submissions per hour per IP
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`survey:${clientIP}`, {
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
      comments,
      zip,
      email
    } = body

    // Validate required field
    if (!q1) {
      return NextResponse.json(
        { error: 'Please answer the first question' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    await payload.create({
      collection: 'survey-responses',
      data: {
        q1: q1 || undefined,
        q2: q2 || undefined,
        q3: q3 || undefined,
        q4: q4 || undefined,
        q5: q5 || undefined,
        q6: q6 || undefined,
        q7: q7 || undefined,
        q8: q8 || undefined,
        q9: q9 && q9.length > 0 ? q9 : undefined,
        comments: comments || undefined,
        zip: zip || undefined,
        email: email || undefined,
        status: 'new'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Survey submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit survey. Please try again.' },
      { status: 500 }
    )
  }
}
