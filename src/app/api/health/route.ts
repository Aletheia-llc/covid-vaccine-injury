import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { RATE_LIMITS } from '@/lib/constants'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    required: { configured: number; total: number }
    optional: { configured: number; total: number }
  }
  timestamp: string
  version?: string
}

/**
 * Health check endpoint for monitoring and load balancer health probes.
 * Returns overall system health status without exposing specific configuration details.
 *
 * GET /api/health
 *
 * Response:
 * - 200: System healthy or degraded
 * - 429: Rate limited
 * - 503: System unhealthy (critical components failing)
 */
export async function GET(request: NextRequest) {
  // Rate limiting: 100 requests per minute per IP (generous for health checks)
  const clientIP = getClientIP(request)
  const rateLimit = await checkRateLimit(`health:${clientIP}`, RATE_LIMITS.HEALTH)

  if (!rateLimit.success) {
    const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.max(1, retryAfterSeconds)) }
      }
    )
  }

  let hasFailure = false
  let hasWarning = false

  // Check required environment variables
  const requiredEnvVars = ['DATABASE_URL', 'PAYLOAD_SECRET']
  const optionalEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
    'RECAPTCHA_SECRET_KEY',
    'NEXT_PUBLIC_SENTRY_DSN',
  ]

  // Count configured required env vars
  let requiredConfigured = 0
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      requiredConfigured++
    } else {
      hasFailure = true
    }
  }

  // Count configured optional env vars
  let optionalConfigured = 0
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      optionalConfigured++
    } else {
      hasWarning = true
    }
  }

  // Check SITE_PASSWORD if it's configured (for staging sites)
  if (process.env.SITE_PASSWORD && process.env.SITE_PASSWORD.length < 8) {
    hasFailure = true
  }

  // Determine overall status
  let status: HealthCheck['status'] = 'healthy'
  if (hasFailure) {
    status = 'unhealthy'
  } else if (hasWarning) {
    status = 'degraded'
  }

  // Return aggregated info without exposing which specific vars are missing
  const healthResponse: HealthCheck = {
    status,
    checks: {
      required: { configured: requiredConfigured, total: requiredEnvVars.length },
      optional: { configured: optionalConfigured, total: optionalEnvVars.length },
    },
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
  }

  // Return 503 if unhealthy, 200 otherwise
  return NextResponse.json(healthResponse, {
    status: status === 'unhealthy' ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
