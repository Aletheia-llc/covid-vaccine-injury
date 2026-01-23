import { NextRequest, NextResponse } from 'next/server'
import { setCsrfCookie } from '@/lib/csrf'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { RATE_LIMITS } from '@/lib/constants'

/**
 * GET /api/csrf
 * Returns a CSRF token and sets it in a cookie
 * Client should include this token in subsequent POST requests
 */
export async function GET(request: NextRequest) {
  // Rate limiting: 30 requests per minute per IP (prevents token farming)
  const clientIP = getClientIP(request)
  const rateLimit = await checkRateLimit(`csrf:${clientIP}`, RATE_LIMITS.CSRF)

  if (!rateLimit.success) {
    const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.max(1, retryAfterSeconds)) }
      }
    )
  }

  const token = await setCsrfCookie()

  return NextResponse.json({ csrfToken: token })
}
