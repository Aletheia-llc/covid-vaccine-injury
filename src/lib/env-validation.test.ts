import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { validateEnv, assertValidEnv, getConfiguredServices } from './env-validation'

describe('Environment Validation', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    // Set minimum required env vars
    process.env.DATABASE_URL = 'postgres://localhost:5432/test'
    process.env.PAYLOAD_SECRET = 'a'.repeat(32)
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('validateEnv', () => {
    describe('required environment variables', () => {
      it('passes with valid required env vars', () => {
        const result = validateEnv()

        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('fails when DATABASE_URL is missing', () => {
        delete process.env.DATABASE_URL

        const result = validateEnv()

        expect(result.valid).toBe(false)
        expect(result.errors).toContainEqual(
          expect.stringContaining('DATABASE_URL')
        )
      })

      it('fails when DATABASE_URL is invalid format', () => {
        process.env.DATABASE_URL = 'mysql://localhost' // Not postgres

        const result = validateEnv()

        expect(result.valid).toBe(false)
        expect(result.errors).toContainEqual(
          expect.stringContaining('DATABASE_URL')
        )
      })

      it('fails when PAYLOAD_SECRET is missing', () => {
        delete process.env.PAYLOAD_SECRET

        const result = validateEnv()

        expect(result.valid).toBe(false)
        expect(result.errors).toContainEqual(
          expect.stringContaining('PAYLOAD_SECRET')
        )
      })

      it('fails when PAYLOAD_SECRET is too short', () => {
        process.env.PAYLOAD_SECRET = 'short'

        const result = validateEnv()

        expect(result.valid).toBe(false)
        expect(result.errors).toContainEqual(
          expect.stringContaining('32 characters')
        )
      })
    })

    describe('optional environment variables', () => {
      it('returns warnings for missing optional vars in development', () => {
        const result = validateEnv()

        expect(result.valid).toBe(true)
        expect(result.warnings.length).toBeGreaterThan(0)
        expect(result.warnings).toContainEqual(
          expect.stringContaining('UPSTASH_REDIS')
        )
      })

      it('passes in production even without optional vars (graceful degradation)', () => {
        ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'

        const result = validateEnv()

        // Should pass because no optional vars are marked as productionRequired
        // Upstash, reCAPTCHA, Stripe etc. are all optional with graceful fallbacks
        expect(result.valid).toBe(true)
        // But should still have warnings about missing optional services
        expect(result.warnings.length).toBeGreaterThan(0)
      })

      it('skips production checks during build phase', () => {
        ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
        process.env.NEXT_PHASE = 'phase-production-build'

        const result = validateEnv()

        // Should not fail for missing Upstash during build
        const upstashErrors = result.errors.filter(e => e.includes('UPSTASH'))
        expect(upstashErrors).toHaveLength(0)
      })
    })

    describe('format validation', () => {
      it('validates STRIPE_SECRET_KEY format', () => {
        process.env.STRIPE_SECRET_KEY = 'invalid_key'

        const result = validateEnv()

        expect(result.warnings).toContainEqual(
          expect.stringContaining('STRIPE_SECRET_KEY')
        )
      })

      it('accepts valid STRIPE_SECRET_KEY format', () => {
        process.env.STRIPE_SECRET_KEY = 'sk_test_1234567890abcdef'

        const result = validateEnv()

        const stripeWarnings = result.warnings.filter(w =>
          w.includes('STRIPE_SECRET_KEY') && w.includes('Invalid format')
        )
        expect(stripeWarnings).toHaveLength(0)
      })

      it('validates STRIPE_WEBHOOK_SECRET format', () => {
        process.env.STRIPE_WEBHOOK_SECRET = 'invalid'

        const result = validateEnv()

        expect(result.warnings).toContainEqual(
          expect.stringContaining('STRIPE_WEBHOOK_SECRET')
        )
      })

      it('accepts valid STRIPE_WEBHOOK_SECRET format', () => {
        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_1234567890'

        const result = validateEnv()

        const webhookWarnings = result.warnings.filter(w =>
          w.includes('STRIPE_WEBHOOK_SECRET') && w.includes('Invalid format')
        )
        expect(webhookWarnings).toHaveLength(0)
      })

      it('validates ADMIN_API_KEY minimum length', () => {
        process.env.ADMIN_API_KEY = 'short'

        const result = validateEnv()

        expect(result.warnings).toContainEqual(
          expect.stringContaining('ADMIN_API_KEY')
        )
      })
    })
  })

  describe('assertValidEnv', () => {
    it('does not throw when env is valid', () => {
      expect(() => assertValidEnv()).not.toThrow()
    })

    it('throws when required env vars are missing', () => {
      delete process.env.DATABASE_URL

      expect(() => assertValidEnv()).toThrow('Invalid environment configuration')
    })

    it('logs warnings to console', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      assertValidEnv()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('logs errors before throwing', () => {
      delete process.env.DATABASE_URL
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => assertValidEnv()).toThrow()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('getConfiguredServices', () => {
    it('reports database as configured when DATABASE_URL set', () => {
      const services = getConfiguredServices()
      expect(services.database).toBe(true)
    })

    it('reports redis as configured when both Upstash vars set', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token123'

      const services = getConfiguredServices()
      expect(services.redis).toBe(true)
    })

    it('reports redis as not configured when only URL set', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io'
      delete process.env.UPSTASH_REDIS_REST_TOKEN

      const services = getConfiguredServices()
      expect(services.redis).toBe(false)
    })

    it('reports recaptcha as configured when both keys set', () => {
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'site-key'
      process.env.RECAPTCHA_SECRET_KEY = 'secret-key'

      const services = getConfiguredServices()
      expect(services.recaptcha).toBe(true)
    })

    it('reports stripe as configured when secret key set', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const services = getConfiguredServices()
      expect(services.stripe).toBe(true)
    })

    it('reports sentry as configured when DSN set', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/123'

      const services = getConfiguredServices()
      expect(services.sentry).toBe(true)
    })

    it('reports all services as not configured when no optional vars set', () => {
      const services = getConfiguredServices()

      expect(services.redis).toBe(false)
      expect(services.recaptcha).toBe(false)
      expect(services.stripe).toBe(false)
      expect(services.sentry).toBe(false)
      expect(services.adminApi).toBe(false)
    })
  })
})
