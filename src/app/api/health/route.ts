import { NextResponse } from 'next/server'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn'
      message?: string
    }
  }
  timestamp: string
  version?: string
}

/**
 * Health check endpoint for monitoring and load balancer health probes.
 * Returns overall system health status and individual component checks.
 *
 * GET /api/health
 *
 * Response:
 * - 200: System healthy or degraded
 * - 503: System unhealthy (critical components failing)
 */
export async function GET() {
  const checks: HealthCheck['checks'] = {}
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

  // Check required env vars (failure = unhealthy)
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      checks[`env:${envVar}`] = {
        status: 'fail',
        message: 'Required environment variable not set',
      }
      hasFailure = true
    } else {
      checks[`env:${envVar}`] = { status: 'pass' }
    }
  }

  // Check optional env vars (missing = warning)
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      checks[`env:${envVar}`] = {
        status: 'warn',
        message: 'Optional environment variable not set',
      }
      hasWarning = true
    } else {
      checks[`env:${envVar}`] = { status: 'pass' }
    }
  }

  // Check SITE_PASSWORD if it's configured (for staging sites)
  if (process.env.SITE_PASSWORD) {
    if (process.env.SITE_PASSWORD.length < 8) {
      checks['security:sitePassword'] = {
        status: 'fail',
        message: 'SITE_PASSWORD too short (min 8 characters)',
      }
      hasFailure = true
    } else {
      checks['security:sitePassword'] = { status: 'pass' }
    }
  }

  // Determine overall status
  let status: HealthCheck['status'] = 'healthy'
  if (hasFailure) {
    status = 'unhealthy'
  } else if (hasWarning) {
    status = 'degraded'
  }

  const healthResponse: HealthCheck = {
    status,
    checks,
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
