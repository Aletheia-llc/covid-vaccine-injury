import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, checkRateLimitSync, getClientIP } from './rate-limit'

// Mock the logger to prevent console output during tests
vi.mock('./logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('checkRateLimitSync (in-memory)', () => {
  beforeEach(() => {
    // Reset the rate limit store by waiting for cleanup or using unique identifiers
  })

  it('allows first request', () => {
    const result = checkRateLimitSync(`test-${Date.now()}-1`, {
      windowMs: 60000,
      maxRequests: 5,
    })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('decrements remaining count', () => {
    const id = `test-${Date.now()}-2`
    const config = { windowMs: 60000, maxRequests: 5 }

    checkRateLimitSync(id, config)
    const result2 = checkRateLimitSync(id, config)
    expect(result2.remaining).toBe(3)

    const result3 = checkRateLimitSync(id, config)
    expect(result3.remaining).toBe(2)
  })

  it('blocks after max requests', () => {
    const id = `test-${Date.now()}-3`
    const config = { windowMs: 60000, maxRequests: 3 }

    checkRateLimitSync(id, config) // 1
    checkRateLimitSync(id, config) // 2
    checkRateLimitSync(id, config) // 3

    const result = checkRateLimitSync(id, config) // Should be blocked
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('uses default config if not provided', () => {
    const result = checkRateLimitSync(`test-${Date.now()}-4`)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(9) // Default is 10 max requests
  })

  it('returns reset time in the future', () => {
    const now = Date.now()
    const result = checkRateLimitSync(`test-${Date.now()}-5`, {
      windowMs: 60000,
      maxRequests: 5,
    })
    expect(result.resetTime).toBeGreaterThan(now)
    expect(result.resetTime).toBeLessThanOrEqual(now + 60000)
  })

  it('isolates different identifiers', () => {
    const config = { windowMs: 60000, maxRequests: 2 }
    const id1 = `test-${Date.now()}-6a`
    const id2 = `test-${Date.now()}-6b`

    checkRateLimitSync(id1, config)
    checkRateLimitSync(id1, config)
    const blocked = checkRateLimitSync(id1, config)
    expect(blocked.success).toBe(false)

    // id2 should still be allowed
    const allowed = checkRateLimitSync(id2, config)
    expect(allowed.success).toBe(true)
  })
})

describe('checkRateLimit (async)', () => {
  it('falls back to memory when Upstash is not configured', async () => {
    // Without UPSTASH_REDIS_REST_URL, it should use memory
    const result = await checkRateLimit(`test-async-${Date.now()}`, {
      windowMs: 60000,
      maxRequests: 5,
    })
    expect(result.success).toBe(true)
  })
})

describe('getClientIP', () => {
  function createMockRequest(headers: Record<string, string>): Request {
    return {
      headers: {
        get: (name: string) => headers[name.toLowerCase()] || null,
      },
    } as unknown as Request
  }

  it('prioritizes x-vercel-forwarded-for header', () => {
    const request = createMockRequest({
      'x-vercel-forwarded-for': '1.2.3.4',
      'x-forwarded-for': '5.6.7.8',
    })
    expect(getClientIP(request)).toBe('1.2.3.4')
  })

  it('uses x-real-ip as fallback', () => {
    const request = createMockRequest({
      'x-real-ip': '1.2.3.4',
    })
    expect(getClientIP(request)).toBe('1.2.3.4')
  })

  it('uses x-forwarded-for when other headers missing', () => {
    const request = createMockRequest({
      'x-forwarded-for': '1.2.3.4, 5.6.7.8',
    })
    // Takes the last IP (closest to server)
    expect(getClientIP(request)).toBe('5.6.7.8')
  })

  it('validates IPv4 format', () => {
    const request = createMockRequest({
      'x-vercel-forwarded-for': '999.999.999.999',
    })
    // Invalid IP, should fall back
    expect(getClientIP(request)).not.toBe('999.999.999.999')
  })

  it('returns fallback hash for unknown IPs', () => {
    const request = createMockRequest({
      'user-agent': 'TestAgent/1.0',
    })
    const ip = getClientIP(request)
    expect(ip).toMatch(/^unknown-[0-9a-f]+$/)
  })

  it('generates consistent hash for same user-agent', () => {
    const request1 = createMockRequest({
      'user-agent': 'TestAgent/1.0',
      accept: 'text/html',
    })
    const request2 = createMockRequest({
      'user-agent': 'TestAgent/1.0',
      accept: 'text/html',
    })
    expect(getClientIP(request1)).toBe(getClientIP(request2))
  })
})
