import pino from 'pino'

/**
 * Structured JSON logger for production use.
 *
 * Features:
 * - JSON output in production for log aggregation (Vercel, DataDog, etc.)
 * - Pretty output in development for readability
 * - Request context support (requestId, action, userId)
 * - Automatic redaction of sensitive fields
 * - Child loggers for scoped context
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.info({ action: 'userSignup', email: 'user@example.com' }, 'User signed up')
 *   logger.error({ err, action: 'stripeWebhook' }, 'Webhook processing failed')
 */

const isProduction = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1'

// Redact sensitive fields from logs
const redactPaths = [
  'password',
  'token',
  'secret',
  'apiKey',
  'authorization',
  'cookie',
  'creditCard',
  'ssn',
  '*.password',
  '*.token',
  '*.secret',
  '*.apiKey',
  'headers.authorization',
  'headers.cookie',
]

// Base logger configuration
const baseConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  // Add standard fields to every log
  base: {
    env: process.env.NODE_ENV,
    ...(isVercel && {
      vercelEnv: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
    }),
  },
  // Customize timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
  // Format error objects properly
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
    }),
  },
}

// Create the logger instance
// In development, use pino-pretty for human-readable output
// In production, output JSON for log aggregation
export const logger = pino(baseConfig)

/**
 * Create a child logger with request context.
 * Use this at the start of API routes to add request-specific fields.
 *
 * @example
 * const log = createRequestLogger({ requestId: crypto.randomUUID(), path: '/api/checkout' })
 * log.info('Processing checkout request')
 */
export function createRequestLogger(context: {
  requestId?: string
  path?: string
  method?: string
  userId?: string
  ip?: string
}) {
  return logger.child({
    ...context,
    // Hash IP for privacy if provided
    ...(context.ip && { ipHash: hashForLog(context.ip) }),
  })
}

/**
 * Create a child logger for a specific action/module.
 * Use this for consistent logging within a feature area.
 *
 * @example
 * const log = createActionLogger('stripeWebhook')
 * log.info({ eventType: 'checkout.session.completed' }, 'Processing Stripe event')
 */
export function createActionLogger(action: string) {
  return logger.child({ action })
}

/**
 * Hash a value for logging (e.g., IP addresses for privacy).
 * Uses a simple hash - not cryptographically secure, just for privacy.
 */
function hashForLog(value: string): string {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8)
}

/**
 * Log levels reference:
 * - fatal: Application crash, immediate action required
 * - error: Error that needs attention but app continues
 * - warn: Unexpected situation but handled gracefully
 * - info: Important business events (signups, donations, etc.)
 * - debug: Detailed debugging information
 * - trace: Very detailed tracing (rarely used)
 */

// Type-safe convenience methods with common patterns
export const log = {
  /**
   * Log a successful action
   */
  success: (action: string, data?: Record<string, unknown>) => {
    logger.info({ action, success: true, ...data }, `${action} completed successfully`)
  },

  /**
   * Log a failed action with error
   */
  failure: (action: string, error: unknown, data?: Record<string, unknown>) => {
    logger.error(
      {
        action,
        success: false,
        err: error instanceof Error ? error : new Error(String(error)),
        ...data,
      },
      `${action} failed`
    )
  },

  /**
   * Log an API request
   */
  request: (method: string, path: string, data?: Record<string, unknown>) => {
    logger.info({ method, path, type: 'request', ...data }, `${method} ${path}`)
  },

  /**
   * Log an API response
   */
  response: (method: string, path: string, status: number, durationMs?: number) => {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    logger[level](
      { method, path, status, durationMs, type: 'response' },
      `${method} ${path} -> ${status}`
    )
  },

  /**
   * Log a security event (rate limit, auth failure, etc.)
   */
  security: (event: string, data?: Record<string, unknown>) => {
    logger.warn({ event, type: 'security', ...data }, `Security event: ${event}`)
  },

  /**
   * Log info level message
   */
  info: (message: string, data?: Record<string, unknown>) => {
    logger.info(data || {}, message)
  },

  /**
   * Log error level message
   */
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    logger.error(
      {
        ...(data || {}),
        ...(error ? { err: error instanceof Error ? error : new Error(String(error)) } : {}),
      },
      message
    )
  },

  /**
   * Log warning level message
   */
  warn: (message: string, data?: Record<string, unknown>) => {
    logger.warn(data || {}, message)
  },

  /**
   * Log debug level message
   */
  debug: (message: string, data?: Record<string, unknown>) => {
    logger.debug(data || {}, message)
  },
}

export default logger
