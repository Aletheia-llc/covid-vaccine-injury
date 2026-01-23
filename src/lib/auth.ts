import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers, cookies } from 'next/headers'
import { timingSafeEqual } from 'crypto'

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Returns true if both strings are equal, false otherwise.
 */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8')
    const bufB = Buffer.from(b, 'utf8')

    // If lengths differ, we still need to do a comparison to avoid timing leaks
    // but we know the result will be false
    if (bufA.length !== bufB.length) {
      // Compare against itself to maintain constant time
      timingSafeEqual(bufA, bufA)
      return false
    }

    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/**
 * Check if the request is from an authenticated admin user.
 * Supports both:
 * 1. Payload CMS session cookie (for admin panel)
 * 2. API key header (for external API access)
 */
export async function isAdminAuthenticated(request?: NextRequest): Promise<boolean> {
  // Method 1: Check API key header (using timing-safe comparison)
  const apiKey = process.env.ADMIN_API_KEY
  const headersList = request ? request.headers : await headers()
  const providedKey = headersList.get('x-api-key')

  // Always perform a constant-time comparison to prevent timing attacks,
  // even when one or both keys are missing/empty
  if (apiKey && providedKey) {
    if (safeCompare(providedKey, apiKey)) {
      return true
    }
  } else if (apiKey || providedKey) {
    // One key exists but not the other - still do a dummy comparison
    // to maintain constant time behavior
    safeCompare('dummy-key-for-timing', 'dummy-key-for-timing')
  }

  // Method 2: Check Payload session cookie
  try {
    const payload = await getPayload({ config })
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (token) {
      const { user } = await payload.auth({ headers: await headers() })
      if (user) {
        return true
      }
    }
  } catch {
    // Auth check failed, not authenticated
  }

  return false
}

/**
 * Returns a 401 Unauthorized response with helpful auth guidance
 */
export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({
      error: 'Unauthorized',
      message: 'Authentication required. Use a valid Payload CMS session or include x-api-key header.',
    }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
