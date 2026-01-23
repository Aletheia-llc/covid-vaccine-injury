/**
 * reCAPTCHA Enterprise Server-Side Verification
 *
 * Verifies reCAPTCHA tokens by creating an assessment via the reCAPTCHA Enterprise API.
 * Requires RECAPTCHA_SECRET_KEY environment variable.
 */

import { log } from './logger'

// reCAPTCHA configuration - all values must come from environment variables
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
const RECAPTCHA_PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID

// Minimum score threshold (0.0 to 1.0)
// Scores below this are considered suspicious
// 0.7 is a balanced threshold - higher than default 0.5 for better security
const MIN_SCORE_THRESHOLD = 0.7

// Valid actions that we expect from forms
const VALID_ACTIONS = new Set([
  'LOGIN',
  'SIGNUP',
  'CONTACT',
  'SUBSCRIBE',
  'SURVEY',
  'DONATE',
  'NEWSLETTER',
])

interface RecaptchaAssessmentResponse {
  tokenProperties?: {
    valid: boolean
    hostname?: string
    action?: string
    createTime?: string
  }
  riskAnalysis?: {
    score: number
    reasons?: string[]
  }
  event?: {
    token: string
    siteKey: string
    expectedAction?: string
  }
  name?: string
  error?: {
    code: number
    message: string
    status: string
  }
}

interface VerificationResult {
  success: boolean
  score?: number
  action?: string
  error?: string
}

/**
 * Verify a reCAPTCHA Enterprise token
 *
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - The expected action (e.g., 'LOGIN', 'SIGNUP')
 * @returns Verification result with success status and score
 */
export async function verifyRecaptchaToken(
  token: string,
  expectedAction: string
): Promise<VerificationResult> {
  // If secret key is not configured, skip verification in development
  if (!RECAPTCHA_SECRET_KEY) {
    if (process.env.NODE_ENV === 'development') {
      log.security('recaptcha_not_configured_dev', { action: expectedAction })
      return { success: true, score: 1.0, action: expectedAction }
    }
    log.security('recaptcha_not_configured', {})
    return { success: false, error: 'reCAPTCHA not configured' }
  }

  if (!token) {
    return { success: false, error: 'No reCAPTCHA token provided' }
  }

  if (!VALID_ACTIONS.has(expectedAction)) {
    log.security('recaptcha_invalid_action', { action: expectedAction })
    return { success: false, error: 'Invalid action' }
  }

  try {
    // Use reCAPTCHA Enterprise API
    const projectId = RECAPTCHA_PROJECT_ID || 'your-project-id'
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${RECAPTCHA_SECRET_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: {
          token,
          siteKey: RECAPTCHA_SITE_KEY,
          expectedAction,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      log.security('recaptcha_api_error', {
        status: response.status,
        error: errorText.substring(0, 100),
      })
      return { success: false, error: 'reCAPTCHA verification failed' }
    }

    const data: RecaptchaAssessmentResponse = await response.json()

    // Check for API errors
    if (data.error) {
      log.security('recaptcha_assessment_error', {
        code: data.error.code,
        status: data.error.status,
      })
      return { success: false, error: 'reCAPTCHA assessment failed' }
    }

    // Validate token properties
    if (!data.tokenProperties?.valid) {
      log.security('recaptcha_invalid_token', {
        action: data.tokenProperties?.action,
      })
      return { success: false, error: 'Invalid reCAPTCHA token' }
    }

    // Validate action matches
    if (data.tokenProperties.action !== expectedAction) {
      log.security('recaptcha_action_mismatch', {
        expected: expectedAction,
        actual: data.tokenProperties.action,
      })
      return { success: false, error: 'reCAPTCHA action mismatch' }
    }

    // Check risk score
    const score = data.riskAnalysis?.score ?? 0
    if (score < MIN_SCORE_THRESHOLD) {
      log.security('recaptcha_low_score', {
        score,
        action: expectedAction,
        reasons: data.riskAnalysis?.reasons,
      })
      return {
        success: false,
        score,
        action: expectedAction,
        error: 'Suspicious activity detected',
      }
    }

    // Success
    log.success('recaptcha_verified', { score, action: expectedAction })
    return {
      success: true,
      score,
      action: expectedAction,
    }
  } catch (error) {
    log.security('recaptcha_verification_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'reCAPTCHA verification error' }
  }
}

/**
 * Simple verification using the standard reCAPTCHA API (fallback)
 * Use this if you don't have Enterprise API access
 */
export async function verifyRecaptchaTokenSimple(token: string): Promise<VerificationResult> {
  if (!RECAPTCHA_SECRET_KEY) {
    if (process.env.NODE_ENV === 'development') {
      return { success: true, score: 1.0 }
    }
    return { success: false, error: 'reCAPTCHA not configured' }
  }

  if (!token) {
    return { success: false, error: 'No reCAPTCHA token provided' }
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    })

    const data = await response.json()

    if (!data.success) {
      log.security('recaptcha_simple_failed', {
        errorCodes: data['error-codes'],
      })
      return { success: false, error: 'reCAPTCHA verification failed' }
    }

    const score = data.score ?? 1.0
    if (score < MIN_SCORE_THRESHOLD) {
      log.security('recaptcha_simple_low_score', { score })
      return { success: false, score, error: 'Suspicious activity detected' }
    }

    return { success: true, score, action: data.action }
  } catch (error) {
    log.security('recaptcha_simple_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'reCAPTCHA verification error' }
  }
}
