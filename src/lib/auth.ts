import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers, cookies } from 'next/headers'

/**
 * Check if the request is from an authenticated admin user.
 * Supports both:
 * 1. Payload CMS session cookie (for admin panel)
 * 2. API key header (for external API access)
 */
export async function isAdminAuthenticated(request?: NextRequest): Promise<boolean> {
  // Method 1: Check API key header
  const apiKey = process.env.ADMIN_API_KEY
  if (apiKey) {
    const headersList = request ? request.headers : await headers()
    const providedKey = headersList.get('x-api-key')
    if (providedKey && providedKey === apiKey) {
      return true
    }
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
 * Returns a 401 Unauthorized response
 */
export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}
