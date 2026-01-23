/**
 * Application Constants
 *
 * Centralized configuration for rate limits, request sizes, timeouts,
 * and other magic numbers used throughout the application.
 */

// =============================================================================
// Time Constants (in milliseconds)
// =============================================================================

export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const

// =============================================================================
// Rate Limiting
// =============================================================================

/**
 * Rate limit configurations by endpoint type.
 * Each config specifies the time window and max requests allowed.
 */
export const RATE_LIMITS = {
  /** Default rate limit for generic endpoints */
  DEFAULT: {
    windowMs: TIME.MINUTE,
    maxRequests: 10,
  },

  /** Survey submissions - strict to prevent spam */
  SURVEY: {
    windowMs: TIME.HOUR,
    maxRequests: 5,
  },

  /** Contact form - strict to prevent spam */
  CONTACT: {
    windowMs: TIME.HOUR,
    maxRequests: 5,
  },

  /** Newsletter subscriptions */
  SUBSCRIBE: {
    windowMs: TIME.HOUR,
    maxRequests: 10,
  },

  /** Stripe checkout attempts */
  CHECKOUT: {
    windowMs: TIME.MINUTE,
    maxRequests: 10,
  },

  /** CSRF token generation */
  CSRF: {
    windowMs: TIME.MINUTE,
    maxRequests: 30,
  },

  /** Health check endpoint - generous for monitoring */
  HEALTH: {
    windowMs: TIME.MINUTE,
    maxRequests: 100,
  },

  /** Representative lookup */
  REPRESENTATIVES: {
    windowMs: TIME.HOUR,
    maxRequests: 30,
  },
} as const

// =============================================================================
// Request Size Limits (in bytes)
// =============================================================================

/**
 * Maximum request body sizes by endpoint.
 * Requests exceeding these limits are rejected with 413.
 */
export const REQUEST_SIZE_LIMITS = {
  /** Checkout requests - minimal data needed */
  CHECKOUT: 1 * 1024, // 1KB

  /** Subscribe requests */
  SUBSCRIBE: 4 * 1024, // 4KB

  /** Survey submissions */
  SURVEY: 16 * 1024, // 16KB

  /** Contact form messages */
  CONTACT: 16 * 1024, // 16KB

  /** Webhook payloads */
  WEBHOOK: 64 * 1024, // 64KB
} as const

// =============================================================================
// Validation Limits
// =============================================================================

export const VALIDATION = {
  /** Maximum email address length (RFC 5321) */
  MAX_EMAIL_LENGTH: 254,

  /** Maximum name length */
  MAX_NAME_LENGTH: 100,

  /** Maximum comment/message length */
  MAX_COMMENT_LENGTH: 5000,

  /** ZIP code length (US) */
  ZIP_CODE_LENGTH: 5,

  /** Minimum password/secret length */
  MIN_SECRET_LENGTH: 32,

  /** Minimum donation amount in dollars */
  MIN_DONATION_AMOUNT: 5,

  /** Maximum donation amount in dollars */
  MAX_DONATION_AMOUNT: 1_000_000,
} as const

// =============================================================================
// Security
// =============================================================================

export const SECURITY = {
  /** CSRF token expiry time */
  CSRF_TOKEN_EXPIRY_MS: TIME.HOUR,

  /** reCAPTCHA minimum score threshold (0.0 - 1.0) */
  RECAPTCHA_MIN_SCORE: 0.7,

  /** Legislators data cache duration */
  LEGISLATORS_CACHE_MS: 24 * TIME.HOUR,
} as const

// =============================================================================
// Pagination
// =============================================================================

export const PAGINATION = {
  /** Default page size for list queries */
  DEFAULT_PAGE_SIZE: 20,

  /** Maximum page size allowed */
  MAX_PAGE_SIZE: 100,

  /** Survey stats query limit */
  SURVEY_STATS_LIMIT: 1000,

  /** Survey export limit */
  SURVEY_EXPORT_LIMIT: 10_000,
} as const

// =============================================================================
// UI/Animation
// =============================================================================

export const UI = {
  /** Roulette spin animation duration */
  ROULETTE_SPIN_DURATION_MS: 2000,
} as const
