import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers
  const headers = response.headers

  // Prevent clickjacking attacks
  headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')

  // Enable XSS filter in older browsers
  headers.set('X-XSS-Protection', '1; mode=block')

  // Control referrer information
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Restrict browser features
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // Note: Content Security Policy is defined in next.config.mjs to avoid conflicts
  // The consolidated CSP there includes all required domains (Stripe, Sentry, reCAPTCHA, Vercel Analytics, etc.)

  // HSTS - enforce HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  return response
}

// Apply middleware to all routes except static files and API routes that need different handling
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
