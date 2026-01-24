import { cookies } from 'next/headers'
import { randomBytes, createHmac, timingSafeEqual } from 'crypto'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

/**
 * Get CSRF secret from environment.
 * Throws in production if not configured - never use a default secret.
 */
function getCsrfSecret(): string {
  const secret = process.env.PAYLOAD_SECRET || process.env.CSRF_SECRET
  if (!secret) {
    // In development, allow a fallback for easier local testing
    if (process.env.NODE_ENV !== 'production') {
      return 'development-only-csrf-secret-do-not-use-in-production'
    }
    throw new Error(
      'CSRF secret not configured. Set PAYLOAD_SECRET or CSRF_SECRET environment variable.'
    )
  }
  return secret
}

/**
 * Generate a CSRF token
 * Format: timestamp.randomBytes.signature
 */
export function generateCsrfToken(): string {
  const timestamp = Date.now().toString()
  const randomPart = randomBytes(32).toString('hex')
  const payload = `${timestamp}.${randomPart}`
  const signature = createHmac('sha256', getCsrfSecret()).update(payload).digest('hex')

  return `${payload}.${signature}`
}

/**
 * Verify a CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [timestamp, randomPart, signature] = parts
    const payload = `${timestamp}.${randomPart}`

    // Verify signature
    const expectedSignature = createHmac('sha256', getCsrfSecret()).update(payload).digest('hex')
    const signatureBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (signatureBuffer.length !== expectedBuffer.length) return false
    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return false

    // Check expiry
    const tokenTime = parseInt(timestamp, 10)
    if (isNaN(tokenTime)) return false
    if (Date.now() - tokenTime > TOKEN_EXPIRY_MS) return false

    return true
  } catch {
    return false
  }
}

/**
 * Set CSRF token cookie (call from API routes that render forms)
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken()
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })

  return token
}

/**
 * Get CSRF token from cookie
 */
export async function getCsrfFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null
}

/**
 * Validate CSRF token from request
 * Compares token from header/body with token from cookie
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  try {
    // In development, fall back to origin validation if no cookie
    // This helps during hot reload when cookies may be cleared
    if (process.env.NODE_ENV === 'development') {
      const origin = request.headers.get('origin')
      const referer = request.headers.get('referer')
      if (origin?.includes('localhost') || referer?.includes('localhost')) {
        return true
      }
    }

    // Get token from cookie
    const cookieToken = await getCsrfFromCookie()
    if (!cookieToken) return false

    // Get token from header or body
    let requestToken = request.headers.get(CSRF_HEADER_NAME)

    // If not in header, try to get from body (for form submissions)
    if (!requestToken) {
      const contentType = request.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        // Clone request to read body without consuming it
        const clonedRequest = request.clone()
        try {
          const body = await clonedRequest.json()
          requestToken = body._csrf || body.csrfToken
        } catch {
          // Body parsing failed
        }
      }
    }

    if (!requestToken) return false

    // Both tokens must be valid
    if (!verifyCsrfToken(cookieToken)) return false
    if (!verifyCsrfToken(requestToken)) return false

    // Tokens must match (timing-safe comparison)
    const cookieBuffer = Buffer.from(cookieToken)
    const requestBuffer = Buffer.from(requestToken)

    if (cookieBuffer.length !== requestBuffer.length) return false
    return timingSafeEqual(cookieBuffer, requestBuffer)
  } catch {
    return false
  }
}

/**
 * Higher-order function to wrap API handlers with CSRF protection
 * Use for POST/PUT/DELETE routes that accept user input
 */
export function withCsrfProtection(
  handler: (request: Request) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    // Only check CSRF for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const isValid = await validateCsrfToken(request)
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    return handler(request)
  }
}

/**
 * Returns a 403 Forbidden response for CSRF violations
 *
 * @deprecated Since v1.1.0. Will be removed in v2.0.0.
 *   Use withCsrfProtection() HOF instead, which handles responses automatically.
 *
 * Migration example:
 *   Before: if (!validateOrigin(request)) return csrfErrorResponse()
 *   After:  export const POST = withCsrfProtection(async (request) => { ... })
 */
export function csrfErrorResponse() {
  return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}

// =============================================================================
// BACKWARD COMPATIBILITY - Origin-based validation (for existing API routes)
// =============================================================================
// These functions are kept for backward compatibility with existing code.
// New code should use token-based CSRF protection (validateCsrfToken).
//
// MIGRATION GUIDE:
// 1. Client: Fetch token from GET /api/csrf before form submission
// 2. Client: Include token in x-csrf-token header or body._csrf field
// 3. Server: Use withCsrfProtection() HOF or call validateCsrfToken()
//
// Origin-based validation will be removed in v2.0.0.
// =============================================================================

import { NextRequest } from 'next/server'

/**
 * Validates the origin of a request to prevent CSRF attacks.
 * Checks that the Origin or Referer header matches our allowed domains.
 *
 * @deprecated Since v1.1.0. Will be removed in v2.0.0.
 *   Use token-based CSRF protection instead: validateCsrfToken() or withCsrfProtection()
 *
 * Note: Origin-based validation is less secure than token-based validation because
 * some browsers don't send Origin headers and Referer can be spoofed in some cases.
 */
export function validateOrigin(request: NextRequest | Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    if (origin?.includes('localhost') || referer?.includes('localhost')) {
      return true
    }
  }

  // Define allowed origins
  const allowedOrigins = [
    'https://covidvaccineinjury.us',
    'https://www.covidvaccineinjury.us',
    // Vercel preview deployments
    'https://covidvaccineinjury.vercel.app',
  ]

  // Also allow Vercel preview URLs
  const vercelPreviewPattern = /^https:\/\/covidvaccineinjury-[a-z0-9-]+\.vercel\.app$/

  // Check origin header first
  if (origin) {
    if (allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
      return true
    }
    return false
  }

  // Fall back to referer if no origin (some browsers don't send origin)
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const refererOrigin = refererUrl.origin
      if (allowedOrigins.includes(refererOrigin) || vercelPreviewPattern.test(refererOrigin)) {
        return true
      }
    } catch {
      return false
    }
  }

  // If neither header is present, reject the request
  return false
}
