'use client'

import { useCallback, useState, useEffect } from 'react'

// Site key from environment - must be configured in .env
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

// Extend Window interface for reCAPTCHA (supports both v3 and Enterprise)
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
      enterprise?: {
        ready: (callback: () => void) => void
        execute: (siteKey: string, options: { action: string }) => Promise<string>
      }
    }
  }
}

// Valid actions
export type RecaptchaAction =
  | 'LOGIN'
  | 'SIGNUP'
  | 'CONTACT'
  | 'SUBSCRIBE'
  | 'SURVEY'
  | 'DONATE'
  | 'NEWSLETTER'

interface UseRecaptchaReturn {
  executeRecaptcha: (action: RecaptchaAction) => Promise<string | null>
  isReady: boolean
  error: string | null
}

/**
 * Hook for executing reCAPTCHA Enterprise challenges
 *
 * @example
 * ```tsx
 * const { executeRecaptcha, isReady } = useRecaptcha()
 *
 * const handleSubmit = async () => {
 *   const token = await executeRecaptcha('SIGNUP')
 *   if (token) {
 *     // Include token in form submission
 *     await submitForm({ ...formData, recaptchaToken: token })
 *   }
 * }
 * ```
 */
export function useRecaptcha(): UseRecaptchaReturn {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if reCAPTCHA is loaded (supports both v3 and Enterprise)
  useEffect(() => {
    const checkReady = () => {
      // Check for standard v3 or Enterprise
      const grecaptcha = window.grecaptcha
      if (grecaptcha?.ready || grecaptcha?.enterprise?.ready) {
        const readyFn = grecaptcha.enterprise?.ready || grecaptcha.ready
        readyFn(() => {
          setIsReady(true)
          setError(null)
        })
      }
    }

    // Check immediately
    checkReady()

    // Also check after a short delay (script might still be loading)
    const timeoutId = setTimeout(checkReady, 1000)

    // Check periodically for lazy-loaded script
    const intervalId = setInterval(() => {
      if (window.grecaptcha?.ready || window.grecaptcha?.enterprise?.ready) {
        clearInterval(intervalId)
        checkReady()
      }
    }, 500)

    // Clean up after 10 seconds
    const cleanupId = setTimeout(() => {
      clearInterval(intervalId)
      if (!isReady) {
        setError('reCAPTCHA failed to load')
      }
    }, 10000)

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(cleanupId)
      clearInterval(intervalId)
    }
  }, [isReady])

  const executeRecaptcha = useCallback(async (action: RecaptchaAction): Promise<string | null> => {
    const grecaptcha = window.grecaptcha
    // Support both standard v3 and Enterprise
    const executeFn = grecaptcha?.enterprise?.execute || grecaptcha?.execute

    if (!executeFn) {
      setError('reCAPTCHA not loaded')
      return null
    }

    try {
      const token = await executeFn(RECAPTCHA_SITE_KEY, {
        action,
      })
      setError(null)
      return token
    } catch (err) {
      const message = err instanceof Error ? err.message : 'reCAPTCHA execution failed'
      setError(message)
      return null
    }
  }, [])

  return {
    executeRecaptcha,
    isReady,
    error,
  }
}

/**
 * Utility to execute reCAPTCHA without the hook (for one-off usage)
 * Returns null if reCAPTCHA is not available or not configured
 */
export async function executeRecaptchaAction(action: RecaptchaAction): Promise<string | null> {
  // If no site key configured, skip
  if (!RECAPTCHA_SITE_KEY) {
    return null
  }

  const grecaptcha = window.grecaptcha
  const executeFn = grecaptcha?.enterprise?.execute || grecaptcha?.execute
  const readyFn = grecaptcha?.enterprise?.ready || grecaptcha?.ready

  if (!executeFn || !readyFn) {
    return null
  }

  return new Promise((resolve) => {
    readyFn(async () => {
      try {
        const token = await executeFn(RECAPTCHA_SITE_KEY, {
          action,
        })
        resolve(token)
      } catch {
        resolve(null)
      }
    })
  })
}
