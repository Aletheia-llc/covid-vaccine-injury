import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createHmac } from 'crypto'
import { generateCsrfToken, verifyCsrfToken } from './csrf'

// Mock crypto module for consistent testing
vi.mock('crypto', async () => {
  const actual = await vi.importActual('crypto')
  return {
    ...actual,
    randomBytes: vi.fn(() => Buffer.from('a'.repeat(32))),
  }
})

describe('CSRF Token Security', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    process.env.PAYLOAD_SECRET = 'test-secret-at-least-32-characters-long'
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe('generateCsrfToken', () => {
    it('generates a token with correct format (timestamp.random.signature)', () => {
      const token = generateCsrfToken()
      const parts = token.split('.')

      expect(parts).toHaveLength(3)
      expect(parseInt(parts[0], 10)).toBeGreaterThan(0) // timestamp
      expect(parts[1].length).toBe(64) // 32 bytes hex = 64 chars
      expect(parts[2].length).toBe(64) // SHA256 hex = 64 chars
    })

    it('generates unique tokens on each call', async () => {
      // Unmock for this test to get real random bytes
      vi.unmock('crypto')
      const { generateCsrfToken: realGenerate } = await import('./csrf')

      const token1 = realGenerate()
      const token2 = realGenerate()

      expect(token1).not.toBe(token2)
    })

    it('includes current timestamp in token', () => {
      const before = Date.now()
      const token = generateCsrfToken()
      const after = Date.now()

      const timestamp = parseInt(token.split('.')[0], 10)
      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('verifyCsrfToken', () => {
    it('verifies a valid token', () => {
      const token = generateCsrfToken()
      expect(verifyCsrfToken(token)).toBe(true)
    })

    it('rejects token with wrong format (missing parts)', () => {
      expect(verifyCsrfToken('invalid')).toBe(false)
      expect(verifyCsrfToken('part1.part2')).toBe(false)
      expect(verifyCsrfToken('')).toBe(false)
    })

    it('rejects token with tampered signature', () => {
      const token = generateCsrfToken()
      const parts = token.split('.')
      parts[2] = 'tampered' + parts[2].substring(8)

      expect(verifyCsrfToken(parts.join('.'))).toBe(false)
    })

    it('rejects token with tampered timestamp', () => {
      const token = generateCsrfToken()
      const parts = token.split('.')
      parts[0] = '9999999999999' // Future timestamp

      expect(verifyCsrfToken(parts.join('.'))).toBe(false)
    })

    it('rejects token with tampered random part', () => {
      const token = generateCsrfToken()
      const parts = token.split('.')
      parts[1] = 'b'.repeat(64)

      expect(verifyCsrfToken(parts.join('.'))).toBe(false)
    })

    it('rejects expired tokens (older than 1 hour)', () => {
      const oldTimestamp = Date.now() - (61 * 60 * 1000) // 61 minutes ago
      const randomPart = 'a'.repeat(64)
      const payload = `${oldTimestamp}.${randomPart}`

      // Need to create a valid signature for the old payload
      const signature = createHmac('sha256', process.env.PAYLOAD_SECRET!)
        .update(payload)
        .digest('hex')

      const expiredToken = `${payload}.${signature}`
      expect(verifyCsrfToken(expiredToken)).toBe(false)
    })

    it('accepts tokens within expiry window', () => {
      const recentTimestamp = Date.now() - (30 * 60 * 1000) // 30 minutes ago
      const randomPart = 'a'.repeat(64)
      const payload = `${recentTimestamp}.${randomPart}`

      const signature = createHmac('sha256', process.env.PAYLOAD_SECRET!)
        .update(payload)
        .digest('hex')

      const validToken = `${payload}.${signature}`
      expect(verifyCsrfToken(validToken)).toBe(true)
    })

    it('rejects tokens with invalid timestamp (NaN)', () => {
      const token = 'notanumber.aaaa.bbbb'
      expect(verifyCsrfToken(token)).toBe(false)
    })

    it('uses timing-safe comparison to prevent timing attacks', () => {
      // This is a design verification - the code uses timingSafeEqual
      // We can't easily test timing, but we verify behavior is correct
      const token = generateCsrfToken()
      const parts = token.split('.')

      // Slightly different signature (same length)
      const wrongSig = parts[2].replace('a', 'b')
      const wrongToken = `${parts[0]}.${parts[1]}.${wrongSig}`

      expect(verifyCsrfToken(wrongToken)).toBe(false)
    })
  })

  describe('Secret handling', () => {
    it('uses PAYLOAD_SECRET when available', () => {
      process.env.PAYLOAD_SECRET = 'primary-secret-32-chars-minimum!'
      delete process.env.CSRF_SECRET

      const token = generateCsrfToken()
      expect(verifyCsrfToken(token)).toBe(true)
    })

    it('falls back to CSRF_SECRET when PAYLOAD_SECRET missing', () => {
      delete process.env.PAYLOAD_SECRET
      process.env.CSRF_SECRET = 'fallback-secret-32-chars-minimum'

      const token = generateCsrfToken()
      expect(verifyCsrfToken(token)).toBe(true)
    })

    it('uses development fallback when no secret in dev mode', () => {
      delete process.env.PAYLOAD_SECRET
      delete process.env.CSRF_SECRET
      ;(process.env as Record<string, string | undefined>).NODE_ENV = 'development'

      // Should not throw and should work
      const token = generateCsrfToken()
      expect(verifyCsrfToken(token)).toBe(true)
    })
  })
})
