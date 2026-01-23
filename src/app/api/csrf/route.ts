import { NextResponse } from 'next/server'
import { setCsrfCookie } from '@/lib/csrf'

/**
 * GET /api/csrf
 * Returns a CSRF token and sets it in a cookie
 * Client should include this token in subsequent POST requests
 */
export async function GET() {
  const token = await setCsrfCookie()

  return NextResponse.json({ csrfToken: token })
}
