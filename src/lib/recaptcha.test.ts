import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock logger to prevent console output
vi.mock('./logger', () => ({
  log: {
    security: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('reCAPTCHA Verification', () => {
  const originalEnv = process.env
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    global.fetch = mockFetch
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('verifyRecaptchaTokenSimple', () => {
    it('returns success for valid token with high score', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, score: 0.9 }),
      })

      const { verifyRecaptchaTokenSimple } = await import('./recaptcha')
      const result = await verifyRecaptchaTokenSimple('valid-token')

      expect(result.success).toBe(true)
      expect(result.score).toBe(0.9)
    })

    it('rejects token with low score (below 0.7 threshold)', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, score: 0.3 }),
      })

      const { verifyRecaptchaTokenSimple } = await import('./recaptcha')
      const result = await verifyRecaptchaTokenSimple('low-score-token')

      expect(result.success).toBe(false)
      expect(result.score).toBe(0.3)
      expect(result.error).toBe('Suspicious activity detected')
    })

    it('rejects when Google API returns success: false', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
      })

      const { verifyRecaptchaTokenSimple } = await import('./recaptcha')
      const result = await verifyRecaptchaTokenSimple('invalid-token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('reCAPTCHA verification failed')
    })

    it('returns failure when no token provided', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'

      const { verifyRecaptchaTokenSimple } = await import('./recaptcha')
      const result = await verifyRecaptchaTokenSimple('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('No reCAPTCHA token provided')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('handles network errors gracefully', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { verifyRecaptchaTokenSimple } = await import('./recaptcha')
      const result = await verifyRecaptchaTokenSimple('valid-token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('reCAPTCHA verification error')
    })

    it('sends correct request to Google API', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, score: 0.9 }),
      })

      const { verifyRecaptchaTokenSimple } = await import('./recaptcha')
      await verifyRecaptchaTokenSimple('test-token')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.google.com/recaptcha/api/siteverify',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      )
    })

    describe('when not configured', () => {
      it('returns success in development mode', async () => {
        delete process.env.RECAPTCHA_SECRET_KEY
        ;(process.env as Record<string, string | undefined>).NODE_ENV = 'development'

        const { verifyRecaptchaTokenSimple } = await import('./recaptcha')
        const result = await verifyRecaptchaTokenSimple('any-token')

        expect(result.success).toBe(true)
        expect(result.score).toBe(1.0)
        expect(mockFetch).not.toHaveBeenCalled()
      })

      it('returns failure in production mode', async () => {
        delete process.env.RECAPTCHA_SECRET_KEY
        ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'

        const { verifyRecaptchaTokenSimple } = await import('./recaptcha')
        const result = await verifyRecaptchaTokenSimple('any-token')

        expect(result.success).toBe(false)
        expect(result.error).toBe('reCAPTCHA not configured')
      })
    })
  })

  describe('verifyRecaptchaToken (Enterprise)', () => {
    it('returns success for valid token with high score', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'
      process.env.RECAPTCHA_PROJECT_ID = 'test-project'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          tokenProperties: { valid: true, action: 'LOGIN' },
          riskAnalysis: { score: 0.9 },
        }),
      })

      const { verifyRecaptchaToken } = await import('./recaptcha')
      const result = await verifyRecaptchaToken('valid-token', 'LOGIN')

      expect(result.success).toBe(true)
      expect(result.score).toBe(0.9)
      expect(result.action).toBe('LOGIN')
    })

    it('rejects invalid action types', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'
      process.env.RECAPTCHA_PROJECT_ID = 'test-project'

      const { verifyRecaptchaToken } = await import('./recaptcha')
      const result = await verifyRecaptchaToken('token', 'INVALID_ACTION')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid action')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('accepts all valid action types', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'
      process.env.RECAPTCHA_PROJECT_ID = 'test-project'

      const validActions = ['LOGIN', 'SIGNUP', 'CONTACT', 'SUBSCRIBE', 'SURVEY', 'DONATE', 'NEWSLETTER']

      for (const action of validActions) {
        vi.resetModules()
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            tokenProperties: { valid: true, action },
            riskAnalysis: { score: 0.9 },
          }),
        })

        const { verifyRecaptchaToken } = await import('./recaptcha')
        const result = await verifyRecaptchaToken('token', action)
        expect(result.success).toBe(true)
      }
    })

    it('rejects when token action mismatches expected action', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'
      process.env.RECAPTCHA_PROJECT_ID = 'test-project'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          tokenProperties: { valid: true, action: 'LOGIN' },
          riskAnalysis: { score: 0.9 },
        }),
      })

      const { verifyRecaptchaToken } = await import('./recaptcha')
      const result = await verifyRecaptchaToken('token', 'SIGNUP')

      expect(result.success).toBe(false)
      expect(result.error).toBe('reCAPTCHA action mismatch')
    })

    it('rejects when token is invalid', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'
      process.env.RECAPTCHA_PROJECT_ID = 'test-project'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          tokenProperties: { valid: false },
        }),
      })

      const { verifyRecaptchaToken } = await import('./recaptcha')
      const result = await verifyRecaptchaToken('invalid-token', 'LOGIN')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid reCAPTCHA token')
    })

    it('rejects when API returns error', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'
      process.env.RECAPTCHA_PROJECT_ID = 'test-project'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          error: { code: 400, message: 'Bad request', status: 'INVALID_ARGUMENT' },
        }),
      })

      const { verifyRecaptchaToken } = await import('./recaptcha')
      const result = await verifyRecaptchaToken('token', 'LOGIN')

      expect(result.success).toBe(false)
      expect(result.error).toBe('reCAPTCHA assessment failed')
    })

    it('rejects when API request fails', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'
      process.env.RECAPTCHA_PROJECT_ID = 'test-project'

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal server error'),
      })

      const { verifyRecaptchaToken } = await import('./recaptcha')
      const result = await verifyRecaptchaToken('token', 'LOGIN')

      expect(result.success).toBe(false)
      expect(result.error).toBe('reCAPTCHA verification failed')
    })

    it('requires RECAPTCHA_PROJECT_ID for Enterprise API', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key'
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key'
      delete process.env.RECAPTCHA_PROJECT_ID

      const { verifyRecaptchaToken } = await import('./recaptcha')
      const result = await verifyRecaptchaToken('token', 'LOGIN')

      expect(result.success).toBe(false)
      expect(result.error).toBe('reCAPTCHA configuration error')
    })
  })
})
