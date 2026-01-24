import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from './route'

// Mock dependencies
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 4, resetTime: Date.now() + 3600000 }),
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
  }),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

describe('POST /api/contact', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    // Disable reCAPTCHA for most tests
    delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    delete process.env.RECAPTCHA_SECRET_KEY
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const createRequest = (body: object, contentType = 'application/json') => {
    return new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      body: JSON.stringify(body),
    })
  }

  it('successfully submits a contact form', async () => {
    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'general',
      message: 'This is a test message.',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('sent')
  })

  it('validates required fields', async () => {
    const request = createRequest({
      name: '',
      email: '',
      subject: '',
      message: '',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('required')
  })

  it('validates subject type', async () => {
    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'invalid-subject',
      message: 'Test message',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('subject')
  })

  it('accepts all valid subject types', async () => {
    const validSubjects = ['general', 'story', 'media', 'legislative', 'other']

    for (const subject of validSubjects) {
      vi.clearAllMocks()
      const request = createRequest({
        name: 'John Doe',
        email: 'john@example.com',
        subject,
        message: 'Test message',
      })
      const response = await POST(request)

      expect(response.status).toBe(200)
    }
  })

  it('returns 403 when CSRF validation fails', async () => {
    const { validateCsrfToken } = await import('@/lib/csrf')
    vi.mocked(validateCsrfToken).mockResolvedValueOnce(false)

    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'general',
      message: 'Test message',
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
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'general',
      message: 'Test message',
    })
    const response = await POST(request)

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBeDefined()
  })

  it('sanitizes input to prevent XSS', async () => {
    const { getPayload } = await import('payload')
    const mockCreate = vi.fn().mockResolvedValue({ id: 'test' })
    vi.mocked(getPayload).mockResolvedValue({ create: mockCreate } as never)

    const request = createRequest({
      name: '<script>alert("xss")</script>John',
      email: 'john@example.com',
      subject: 'general',
      message: '<img src=x onerror=alert(1)>Test message',
    })
    await POST(request)

    // Verify sanitized data was passed to create
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: expect.not.stringContaining('<script>'),
          message: expect.not.stringContaining('<img'),
        }),
      })
    )
  })

  it('includes X-Request-ID header', async () => {
    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'general',
      message: 'Test message',
    })
    const response = await POST(request)

    expect(response.headers.get('X-Request-ID')).toBeDefined()
    expect(response.headers.get('X-Request-ID')).toMatch(/^[a-f0-9-]{36}$/)
  })

  it('requires reCAPTCHA when configured', async () => {
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'

    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'general',
      message: 'Test message',
      // No recaptchaToken provided
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Security verification required')
  })
})
