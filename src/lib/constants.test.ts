import { describe, it, expect } from 'vitest'
import {
  TIME,
  RATE_LIMITS,
  REQUEST_SIZE_LIMITS,
  VALIDATION,
  SECURITY,
  UI,
} from './constants'

describe('Constants', () => {
  describe('TIME constants', () => {
    it('defines correct time values', () => {
      expect(TIME.SECOND).toBe(1000)
      expect(TIME.MINUTE).toBe(60 * 1000)
      expect(TIME.HOUR).toBe(60 * 60 * 1000)
      expect(TIME.DAY).toBe(24 * 60 * 60 * 1000)
    })

    it('uses consistent units (milliseconds)', () => {
      expect(TIME.MINUTE).toBe(TIME.SECOND * 60)
      expect(TIME.HOUR).toBe(TIME.MINUTE * 60)
      expect(TIME.DAY).toBe(TIME.HOUR * 24)
    })
  })

  describe('RATE_LIMITS constants', () => {
    it('has required rate limit configurations', () => {
      expect(RATE_LIMITS.DEFAULT).toBeDefined()
      expect(RATE_LIMITS.SURVEY).toBeDefined()
      expect(RATE_LIMITS.CONTACT).toBeDefined()
      expect(RATE_LIMITS.SUBSCRIBE).toBeDefined()
      expect(RATE_LIMITS.CHECKOUT).toBeDefined()
      expect(RATE_LIMITS.CSRF).toBeDefined()
      expect(RATE_LIMITS.HEALTH).toBeDefined()
      expect(RATE_LIMITS.REPRESENTATIVES).toBeDefined()
    })

    it('has valid rate limit structure', () => {
      Object.values(RATE_LIMITS).forEach((config) => {
        expect(config).toHaveProperty('windowMs')
        expect(config).toHaveProperty('maxRequests')
        expect(typeof config.windowMs).toBe('number')
        expect(typeof config.maxRequests).toBe('number')
        expect(config.windowMs).toBeGreaterThan(0)
        expect(config.maxRequests).toBeGreaterThan(0)
      })
    })

    it('uses stricter limits for sensitive operations', () => {
      // Survey and contact should have lower request counts
      expect(RATE_LIMITS.SURVEY.maxRequests).toBeLessThanOrEqual(
        RATE_LIMITS.DEFAULT.maxRequests
      )
      expect(RATE_LIMITS.CONTACT.maxRequests).toBeLessThanOrEqual(
        RATE_LIMITS.DEFAULT.maxRequests
      )
    })

    it('uses longer windows for form submissions', () => {
      // Form submissions should have hour-long windows
      expect(RATE_LIMITS.SURVEY.windowMs).toBe(TIME.HOUR)
      expect(RATE_LIMITS.CONTACT.windowMs).toBe(TIME.HOUR)
      expect(RATE_LIMITS.SUBSCRIBE.windowMs).toBe(TIME.HOUR)
    })
  })

  describe('REQUEST_SIZE_LIMITS constants', () => {
    it('defines size limits for all endpoints', () => {
      expect(REQUEST_SIZE_LIMITS.CHECKOUT).toBeDefined()
      expect(REQUEST_SIZE_LIMITS.SUBSCRIBE).toBeDefined()
      expect(REQUEST_SIZE_LIMITS.SURVEY).toBeDefined()
      expect(REQUEST_SIZE_LIMITS.CONTACT).toBeDefined()
      expect(REQUEST_SIZE_LIMITS.WEBHOOK).toBeDefined()
    })

    it('uses reasonable size limits', () => {
      // All should be under 1MB
      Object.values(REQUEST_SIZE_LIMITS).forEach((limit) => {
        expect(limit).toBeLessThanOrEqual(1024 * 1024)
        expect(limit).toBeGreaterThan(0)
      })
    })

    it('uses smaller limits for simple payloads', () => {
      expect(REQUEST_SIZE_LIMITS.CHECKOUT).toBeLessThan(
        REQUEST_SIZE_LIMITS.SURVEY
      )
    })
  })

  describe('VALIDATION constants', () => {
    it('defines email validation limits', () => {
      expect(VALIDATION.MAX_EMAIL_LENGTH).toBe(254) // RFC 5321
    })

    it('defines name validation limits', () => {
      expect(VALIDATION.MAX_NAME_LENGTH).toBe(100)
    })

    it('defines comment validation limits', () => {
      expect(VALIDATION.MAX_COMMENT_LENGTH).toBe(5000)
    })

    it('defines ZIP code validation', () => {
      expect(VALIDATION.ZIP_CODE_LENGTH).toBe(5)
    })

    it('defines secret minimum length', () => {
      expect(VALIDATION.MIN_SECRET_LENGTH).toBe(32)
    })

    it('defines donation amount limits', () => {
      expect(VALIDATION.MIN_DONATION_AMOUNT).toBe(5)
      expect(VALIDATION.MAX_DONATION_AMOUNT).toBe(1_000_000)
    })
  })

  describe('SECURITY constants', () => {
    it('defines CSRF token expiry', () => {
      expect(SECURITY.CSRF_TOKEN_EXPIRY_MS).toBe(TIME.HOUR)
    })

    it('defines reCAPTCHA score threshold', () => {
      expect(SECURITY.RECAPTCHA_MIN_SCORE).toBe(0.7)
      expect(SECURITY.RECAPTCHA_MIN_SCORE).toBeGreaterThan(0)
      expect(SECURITY.RECAPTCHA_MIN_SCORE).toBeLessThan(1)
    })

    it('defines legislators cache duration', () => {
      expect(SECURITY.LEGISLATORS_CACHE_MS).toBe(24 * TIME.HOUR)
    })
  })

  describe('UI constants', () => {
    it('defines roulette spin duration', () => {
      expect(UI.ROULETTE_SPIN_DURATION_MS).toBe(2000)
    })
  })

  describe('Type safety', () => {
    it('constants are readonly (as const)', () => {
      // TypeScript ensures these are readonly at compile time
      // This test documents the expected behavior
      expect(Object.isFrozen(TIME)).toBe(false) // as const doesn't freeze
      expect(typeof TIME.SECOND).toBe('number')
    })
  })
})
