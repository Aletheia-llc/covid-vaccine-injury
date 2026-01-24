import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 29, resetTime: Date.now() + 60000 }),
  getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
}))

// Mock CSRF token generation
vi.mock('@/lib/csrf', () => ({
  setCsrfCookie: vi.fn().mockResolvedValue('mock-csrf-token-123'),
}))

describe('GET /api/csrf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a CSRF token', async () => {
    const request = new NextRequest('http://localhost:3000/api/csrf')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.csrfToken).toBe('mock-csrf-token-123')
  })

  it('calls setCsrfCookie to generate token', async () => {
    const { setCsrfCookie } = await import('@/lib/csrf')

    const request = new NextRequest('http://localhost:3000/api/csrf')
    await GET(request)

    expect(setCsrfCookie).toHaveBeenCalledTimes(1)
  })

  it('returns 429 when rate limited', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit')
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      remaining: 0,
      resetTime: Date.now() + 45000,
    })

    const request = new NextRequest('http://localhost:3000/api/csrf')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('Too many requests')
    expect(response.headers.get('Retry-After')).toBeDefined()
  })

  it('uses correct rate limit key', async () => {
    const { checkRateLimit, getClientIP } = await import('@/lib/rate-limit')
    vi.mocked(getClientIP).mockReturnValue('192.168.1.100')

    const request = new NextRequest('http://localhost:3000/api/csrf')
    await GET(request)

    expect(checkRateLimit).toHaveBeenCalledWith(
      'csrf:192.168.1.100',
      expect.any(Object)
    )
  })
})
