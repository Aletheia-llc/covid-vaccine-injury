/**
 * Environment Variable Validation
 *
 * Validates required and optional environment variables at startup.
 * Provides clear error messages for missing or invalid configuration.
 */

import { VALIDATION } from './constants'

export interface EnvValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Required environment variables - application won't start without these
 */
const REQUIRED_ENV_VARS = [
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL connection string',
    validate: (value: string) => value.startsWith('postgres'),
    errorHint: 'Must be a valid PostgreSQL connection string starting with "postgres"',
  },
  {
    name: 'PAYLOAD_SECRET',
    description: 'Encryption secret for Payload CMS',
    validate: (value: string) => value.length >= VALIDATION.MIN_SECRET_LENGTH,
    errorHint: `Must be at least ${VALIDATION.MIN_SECRET_LENGTH} characters`,
  },
] as const

interface OptionalEnvVar {
  name: string
  description: string
  productionRequired: boolean
  validate?: (value: string) => boolean
  errorHint?: string
}

/**
 * Optional environment variables - warnings only if missing
 */
const OPTIONAL_ENV_VARS: OptionalEnvVar[] = [
  {
    name: 'UPSTASH_REDIS_REST_URL',
    description: 'Upstash Redis URL for rate limiting',
    productionRequired: false,  // Rate limiting falls back gracefully
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    description: 'Upstash Redis token',
    productionRequired: false,  // Rate limiting falls back gracefully
  },
  {
    name: 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
    description: 'reCAPTCHA v3 site key',
    productionRequired: false,
  },
  {
    name: 'RECAPTCHA_SECRET_KEY',
    description: 'reCAPTCHA v3 secret key',
    productionRequired: false,
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key for donations',
    productionRequired: false,
    validate: (value: string) => /^sk_(test|live)_/.test(value),
    errorHint: 'Must start with "sk_test_" or "sk_live_"',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook signing secret',
    productionRequired: false,
    validate: (value: string) => value.startsWith('whsec_'),
    errorHint: 'Must start with "whsec_"',
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    description: 'Sentry error tracking DSN',
    productionRequired: false,
  },
  {
    name: 'ADMIN_API_KEY',
    description: 'API key for admin endpoints',
    productionRequired: false,
    validate: (value: string) => value.length >= 32,
    errorHint: 'Must be at least 32 characters',
  },
]

/**
 * Validate all environment variables and return results
 */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  // Only enforce production requirements in actual runtime production
  // During build (next build), skip production-only checks
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
  const isProduction = process.env.NODE_ENV === 'production' && !isBuildTime

  // Check required environment variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.name]

    if (!value) {
      errors.push(`Missing required env var: ${envVar.name} - ${envVar.description}`)
      continue
    }

    if (envVar.validate && !envVar.validate(value)) {
      errors.push(`Invalid ${envVar.name}: ${envVar.errorHint}`)
    }
  }

  // Check optional environment variables
  for (const envVar of OPTIONAL_ENV_VARS) {
    const value = process.env[envVar.name]

    if (!value) {
      if (isProduction && envVar.productionRequired) {
        errors.push(`Missing production-required env var: ${envVar.name} - ${envVar.description}`)
      } else {
        warnings.push(`Optional env var not set: ${envVar.name} - ${envVar.description}`)
      }
      continue
    }

    if (envVar.validate && !envVar.validate(value)) {
      warnings.push(`Invalid format for ${envVar.name}: ${envVar.errorHint}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate environment variables and throw if invalid.
 * Call this at application startup.
 */
export function assertValidEnv(): void {
  const result = validateEnv()

  // Log warnings
  if (result.warnings.length > 0) {
    console.warn('Environment variable warnings:')
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`))
  }

  // Throw on errors
  if (!result.valid) {
    console.error('Environment variable errors:')
    result.errors.forEach((error) => console.error(`  - ${error}`))
    throw new Error(
      `Invalid environment configuration. ${result.errors.length} error(s) found. See logs above.`
    )
  }
}

/**
 * Get a summary of configured services
 */
export function getConfiguredServices(): Record<string, boolean> {
  return {
    database: !!process.env.DATABASE_URL,
    redis: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    recaptcha: !!(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY),
    stripe: !!process.env.STRIPE_SECRET_KEY,
    stripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
    sentry: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    adminApi: !!process.env.ADMIN_API_KEY,
  }
}
