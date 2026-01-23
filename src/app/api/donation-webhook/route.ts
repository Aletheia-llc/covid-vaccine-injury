import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual, createHmac } from 'crypto'
import { reportError } from '@/lib/error-reporting'
import { log } from '@/lib/logger'

// Environment variables
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

// Maximum allowed request body size (64KB - generous for webhook payloads)
const MAX_BODY_SIZE = 64 * 1024

interface StripeCheckoutSession {
  customer_details?: {
    email?: string
    name?: string
    phone?: string
    address?: {
      postal_code?: string
    }
  }
  amount_total?: number
}

interface StripeEvent {
  id: string
  type: string
  data: {
    object: StripeCheckoutSession
  }
}

/**
 * Verify Stripe webhook signature using crypto
 */
async function verifyStripeSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<StripeEvent | null> {
  try {
    // Parse the signature header
    const parts = signature.split(',')
    const timestampPart = parts.find((p) => p.startsWith('t='))
    const signaturePart = parts.find((p) => p.startsWith('v1='))

    if (!timestampPart || !signaturePart) {
      return null
    }

    const timestamp = timestampPart.slice(2)
    const expectedSig = signaturePart.slice(3)

    // Check timestamp is within 5 minutes
    const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp)
    if (timestampAge > 300) {
      log.security('stripe_webhook_timestamp_expired', { timestampAge })
      return null
    }

    // Compute expected signature
    const payload = `${timestamp}.${rawBody}`
    const computedSig = createHmac('sha256', secret).update(payload).digest('hex')

    // Compare signatures using timing-safe comparison
    if (!timingSafeEqual(Buffer.from(expectedSig), Buffer.from(computedSig))) {
      log.security('stripe_webhook_signature_mismatch')
      return null
    }

    return JSON.parse(rawBody) as StripeEvent
  } catch (err) {
    log.failure('stripe_webhook_verification', err)
    return null
  }
}

/**
 * POST /api/donation-webhook
 *
 * Handles Stripe webhooks for donation events.
 * Configure Stripe to send checkout.session.completed events to this endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    // Prevent DoS via large payloads
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }

    const rawBody = await request.text()
    const stripeSignature = request.headers.get('stripe-signature')

    if (!STRIPE_WEBHOOK_SECRET) {
      log.security('stripe_webhook_not_configured')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      )
    }

    if (!stripeSignature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    const stripeEvent = await verifyStripeSignature(
      rawBody,
      stripeSignature,
      STRIPE_WEBHOOK_SECRET
    )

    if (!stripeEvent) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Handle checkout.session.completed
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object
      const email = session.customer_details?.email
      const amount = session.amount_total ? session.amount_total / 100 : 0

      log.success('donation_received', {
        eventId: stripeEvent.id,
        email: email ? `${email.substring(0, 3)}***` : 'unknown',
        amount,
      })

      // Here you could:
      // - Store donation in database
      // - Send confirmation email
      // - Update analytics

      return NextResponse.json({
        success: true,
        message: 'Donation recorded',
      })
    }

    // Acknowledge other Stripe events without processing
    return NextResponse.json({ received: true })
  } catch (error) {
    reportError(error, { action: 'donationWebhook' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Health check endpoint - does not expose configuration details
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'donation-webhook',
  })
}
