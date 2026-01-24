import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock dependencies
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 9, resetTime: Date.now() + 3600000 }),
  getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/lib/csrf', () => ({
  validateCsrfToken: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/lib/recaptcha', () => ({
  verifyRecaptchaTokenSimple: vi.fn().mockResolvedValue({ success: true }),
}))

// Mock Payload CMS
vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    create: vi.fn().mockResolvedValue({ id: 'test-id' }),
    find: vi.fn().mockResolvedValue({ docs: [] }),
    update: vi.fn().mockResolvedValue({ id: 'test-id' }),
  }),
}))

vi.mock('@/payload.config', () => ({
  default: {},
}))

describe('POST /api/subscribe', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    delete process.env.RECAPTCHA_SECRET_KEY
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const createRequest = (body: object) => {
    return new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(JSON.stringify(body).length),
      },
      body: JSON.stringify(body),
    })
  }

  it('successfully subscribes a new user', async () => {
    const request = createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('Thank you')
  })

  it('validates required name field', async () => {
    const request = createRequest({
      name: '',
      email: 'jane@example.com',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Name')
  })

  it('validates required email field', async () => {
    const request = createRequest({
      name: 'Jane Doe',
      email: '',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Email')
  })

  it('validates email format', async () => {
    const request = createRequest({
      name: 'Jane Doe',
      email: 'not-an-email',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('valid email')
  })

  it('validates ZIP code format when provided', async () => {
    const request = createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
      zip: '123', // Invalid - too short
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('ZIP')
  })

  it('accepts valid 5-digit ZIP code', async () => {
    const request = createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
      zip: '12345',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
  })

  it('returns 403 when CSRF validation fails', async () => {
    const { validateCsrfToken } = await import('@/lib/csrf')
    vi.mocked(validateCsrfToken).mockResolvedValueOnce(false)

    const request = createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
    })
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
      resetTime: Date.now() + 3600000,
    })

    const request = createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
    })
    const response = await POST(request)

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBeDefined()
  })

  it('includes X-Request-ID header', async () => {
    const request = createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
    })
    const response = await POST(request)

    expect(response.headers.get('X-Request-ID')).toBeDefined()
  })

  it('accepts optional phone number', async () => {
    const request = createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '555-123-4567',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
  })

  it('requires reCAPTCHA when configured', async () => {
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'

    const request = createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Security verification required')
  })
})
