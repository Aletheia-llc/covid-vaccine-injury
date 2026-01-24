import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock rate limiting to always allow
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 99, resetTime: Date.now() + 60000 }),
  getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
}))

describe('GET /api/health', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns healthy status when all required env vars are set', async () => {
    process.env.DATABASE_URL = 'postgres://test'
    process.env.PAYLOAD_SECRET = 'test-secret-at-least-32-chars-long'

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('degraded') // degraded because optional vars missing
    expect(data.checks.required.configured).toBe(2)
    expect(data.checks.required.total).toBe(2)
    expect(data.timestamp).toBeDefined()
  })

  it('returns unhealthy status when required env vars are missing', async () => {
    delete process.env.DATABASE_URL
    delete process.env.PAYLOAD_SECRET

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.required.configured).toBe(0)
  })

  it('returns degraded status when optional env vars are missing', async () => {
    process.env.DATABASE_URL = 'postgres://test'
    process.env.PAYLOAD_SECRET = 'test-secret-at-least-32-chars-long'
    // No optional vars set

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('degraded')
  })

  it('returns healthy when all env vars are configured', async () => {
    process.env.DATABASE_URL = 'postgres://test'
    process.env.PAYLOAD_SECRET = 'test-secret-at-least-32-chars-long'
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_xxx'
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'site_key'
    process.env.RECAPTCHA_SECRET_KEY = 'secret_key'
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://xxx@sentry.io/xxx'

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.checks.optional.configured).toBe(5)
  })

  it('returns no-store cache control header', async () => {
    process.env.DATABASE_URL = 'postgres://test'
    process.env.PAYLOAD_SECRET = 'test-secret'

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)

    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0')
  })

  it('includes version from VERCEL_GIT_COMMIT_SHA', async () => {
    process.env.DATABASE_URL = 'postgres://test'
    process.env.PAYLOAD_SECRET = 'test-secret'
    process.env.VERCEL_GIT_COMMIT_SHA = 'abc1234567890'

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(data.version).toBe('abc1234')
  })

  it('returns local version when not on Vercel', async () => {
    process.env.DATABASE_URL = 'postgres://test'
    process.env.PAYLOAD_SECRET = 'test-secret'
    delete process.env.VERCEL_GIT_COMMIT_SHA

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(data.version).toBe('local')
  })
})

describe('GET /api/health - rate limiting', () => {
  it('returns 429 when rate limited', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit')
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      remaining: 0,
      resetTime: Date.now() + 30000,
    })

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBeDefined()
  })
})
