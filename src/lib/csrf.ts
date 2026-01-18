import { NextRequest } from 'next/server'

/**
 * Validates the origin of a request to prevent CSRF attacks.
 * Checks that the Origin or Referer header matches our allowed domains.
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
  // This prevents requests from non-browser contexts without explicit headers
  return false
}

/**
 * Returns a 403 Forbidden response for CSRF violations
 */
export function csrfErrorResponse() {
  return new Response(JSON.stringify({ error: 'Invalid request origin' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}
