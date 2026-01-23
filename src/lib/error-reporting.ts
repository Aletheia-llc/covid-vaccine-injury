import * as Sentry from '@sentry/nextjs'
import { logger } from './logger'

/**
 * Report an error to Sentry with optional context.
 * Use this for server-side errors that should be tracked.
 *
 * Integrates with both Pino (structured logging) and Sentry (error tracking).
 */
export function reportError(
  error: unknown,
  context?: {
    action?: string
    userId?: string
    extra?: Record<string, unknown>
  }
) {
  // Structured logging with Pino
  logger.error(
    {
      err: error instanceof Error ? error : new Error(String(error)),
      action: context?.action,
      userId: context?.userId,
      ...context?.extra,
    },
    context?.action ? `${context.action} failed` : 'Error occurred'
  )

  // Send to Sentry with context
  Sentry.withScope((scope) => {
    if (context?.action) {
      scope.setTag('action', context.action)
    }
    if (context?.userId) {
      scope.setUser({ id: context.userId })
    }
    if (context?.extra) {
      scope.setExtras(context.extra)
    }

    if (error instanceof Error) {
      Sentry.captureException(error)
    } else {
      Sentry.captureMessage(String(error), 'error')
    }
  })
}

/**
 * Report a warning-level issue (non-critical but worth tracking)
 */
export function reportWarning(message: string, extra?: Record<string, unknown>) {
  // Structured logging with Pino
  logger.warn({ ...extra }, message)

  // Send to Sentry
  Sentry.withScope((scope) => {
    if (extra) {
      scope.setExtras(extra)
    }
    Sentry.captureMessage(message, 'warning')
  })
}

/**
 * Log an info-level event (not sent to Sentry, just logged)
 */
export function reportInfo(message: string, extra?: Record<string, unknown>) {
  logger.info({ ...extra }, message)
}
