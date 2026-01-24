import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock dependencies
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 9, resetTime: Date.now() + 60000 }),
  getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/lib/csrf', () => ({
  validateCsrfToken: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/lib/error-reporting', () => ({
  reportError: vi.fn(),
}))

// Mock Stripe
const mockCreate = vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' })
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: mockCreate,
        },
      },
    })),
  }
})

describe('POST /api/checkout', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_1234567890abcdefghijklmnopqrstuvwxyz',
      NEXT_PUBLIC_SITE_URL: 'https://example.com',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const createRequest = (body: object) => {
    return new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(JSON.stringify(body).length),
      },
      body: JSON.stringify(body),
    })
  }

  it('creates a one-time checkout session', async () => {
    const request = createRequest({ amount: 50, recurring: false })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBe('https://checkout.stripe.com/test')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        submit_type: 'donate',
      })
    )
  })

  it('creates a recurring subscription checkout', async () => {
    const request = createRequest({ amount: 25, recurring: true })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBe('https://checkout.stripe.com/test')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
      })
    )
  })

  it('rejects amount below minimum ($5)', async () => {
    const request = createRequest({ amount: 3 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Minimum donation is $5')
  })

  it('rejects amount above maximum ($1M)', async () => {
    const request = createRequest({ amount: 1500000 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('contact us directly')
  })

  it('rejects non-numeric amount', async () => {
    const request = createRequest({ amount: 'fifty' })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('rejects negative amount', async () => {
    const request = createRequest({ amount: -50 })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('rejects Infinity amount', async () => {
    const request = createRequest({ amount: Infinity })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 403 when CSRF validation fails', async () => {
    const { validateCsrfToken } = await import('@/lib/csrf')
    vi.mocked(validateCsrfToken).mockResolvedValueOnce(false)

    const request = createRequest({ amount: 50 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toContain('Security validation failed')
  })

  it('returns 429 when rate limited', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit')
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      remaining: 0,
      resetTime: Date.now() + 30000,
    })

    const request = createRequest({ amount: 50 })
    const response = await POST(request)

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBeDefined()
  })

  it('returns 500 when Stripe is not configured', async () => {
    delete process.env.STRIPE_SECRET_KEY

    const request = createRequest({ amount: 50 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('not configured')
  })

  it('includes X-Request-ID header on error responses', async () => {
    const { validateCsrfToken } = await import('@/lib/csrf')
    vi.mocked(validateCsrfToken).mockResolvedValueOnce(false)

    const request = createRequest({ amount: 50 })
    const response = await POST(request)

    expect(response.headers.get('X-Request-ID')).toBeDefined()
  })

  it('converts amount to cents for Stripe', async () => {
    const request = createRequest({ amount: 99.99 })
    await POST(request)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 9999, // $99.99 = 9999 cents
            }),
          }),
        ]),
      })
    )
  })
})
