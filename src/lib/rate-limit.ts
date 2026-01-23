/**
 * Rate Limiting Module
 *
 * Provides rate limiting for API endpoints with multiple backend options:
 * 1. Upstash Redis (recommended for production on Vercel)
 * 2. In-memory fallback (for local development only)
 *
 * Usage:
 *   const result = await checkRateLimit(ip, { windowMs: 3600000, maxRequests: 5 })
 *   if (!result.success) {
 *     return new Response('Too many requests', { status: 429 })
 *   }
 */

import { log } from './logger'

// ============================================================================
// Types
// ============================================================================

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// ============================================================================
// In-Memory Fallback (for development only)
// ============================================================================

const memoryStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now()
      for (const [key, entry] of memoryStore.entries()) {
        if (now > entry.resetTime) {
          memoryStore.delete(key)
        }
      }
    },
    5 * 60 * 1000
  )
}

function checkMemoryRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = memoryStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    memoryStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

// ============================================================================
// Upstash Redis Implementation
// ============================================================================

async function checkUpstashRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult | null> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!upstashUrl || !upstashToken) {
    return null // Not configured
  }

  try {
    const key = `rate_limit:${identifier}`
    const windowSeconds = Math.ceil(config.windowMs / 1000)

    // Use Upstash REST API to increment and set expiry atomically
    // INCR + EXPIRE pattern
    const incrResponse = await fetch(`${upstashUrl}/incr/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
      },
    })

    if (!incrResponse.ok) {
      throw new Error(`Upstash INCR failed: ${incrResponse.status}`)
    }

    const incrData = (await incrResponse.json()) as { result: number }
    const count = incrData.result

    // Set expiry if this is a new key (count === 1)
    if (count === 1) {
      await fetch(`${upstashUrl}/expire/${encodeURIComponent(key)}/${windowSeconds}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
        },
      })
    }

    // Get TTL for reset time
    const ttlResponse = await fetch(`${upstashUrl}/ttl/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
      },
    })

    let resetTime = Date.now() + config.windowMs
    if (ttlResponse.ok) {
      const ttlData = (await ttlResponse.json()) as { result: number }
      if (ttlData.result > 0) {
        resetTime = Date.now() + ttlData.result * 1000
      }
    }

    const remaining = Math.max(0, config.maxRequests - count)
    const success = count <= config.maxRequests

    return {
      success,
      remaining,
      resetTime,
    }
  } catch (error) {
    log.error('upstash_rate_limit_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return null // Fall back to memory
  }
}

// ============================================================================
// Main Rate Limit Function
// ============================================================================

// Default rate limit: 10 requests per minute
// This is a conservative default for unlabeled/generic endpoints.
// Individual endpoints should specify their own limits based on expected usage:
// - Forms (survey, contact, subscribe): 5-10 per hour
// - Lookups (representatives): 30 per hour
// - Checkout: 10 per minute
// - Health checks: 100 per minute
// - CSRF tokens: 30 per minute
const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60000,   // 1 minute
  maxRequests: 10,   // 10 requests
}

/**
 * Check rate limit for an identifier (usually IP address).
 * Uses Upstash Redis if configured, otherwise falls back to in-memory.
 *
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration (default: 10 requests per minute)
 * @returns Rate limit result with success status, remaining requests, and reset time
 *
 * @example
 * // Use default rate limit (10 req/min)
 * const result = await checkRateLimit(clientIP)
 *
 * @example
 * // Custom rate limit for forms (5 req/hour)
 * const result = await checkRateLimit(`form:${clientIP}`, {
 *   windowMs: 60 * 60 * 1000,
 *   maxRequests: 5
 * })
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): Promise<RateLimitResult> {
  // Try Upstash first (production)
  const upstashResult = await checkUpstashRateLimit(identifier, config)
  if (upstashResult) {
    return upstashResult
  }

  // Fall back to memory in development only - FAIL CLOSED in production
  if (process.env.NODE_ENV === 'development') {
    log.info('rate_limit_fallback', {
      message: 'Using in-memory rate limiting (development only)',
    })
    return checkMemoryRateLimit(identifier, config)
  } else {
    // FAIL CLOSED in production - don't allow requests without proper rate limiting
    // In-memory rate limiting doesn't work across serverless function instances
    log.security('rate_limit_unavailable', {
      message: 'CRITICAL: Upstash not configured or unavailable. Denying request for security.',
      identifier: identifier.substring(0, 20),
    })
    return {
      success: false,
      remaining: 0,
      resetTime: Date.now() + 60000,
    }
  }
}

/**
 * Synchronous rate limit check - uses memory only.
 * Use this only when async is not possible.
 * @deprecated Use checkRateLimit() instead for production safety
 */
export function checkRateLimitSync(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): RateLimitResult {
  return checkMemoryRateLimit(identifier, config)
}

// ============================================================================
// IP Extraction Utilities
// ============================================================================

/**
 * Validates that a string looks like a valid IP address (IPv4 or IPv6)
 */
function isValidIP(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/

  if (ipv4Pattern.test(ip)) {
    const parts = ip.split('.')
    return parts.every((part) => {
      const num = parseInt(part, 10)
      return num >= 0 && num <= 255
    })
  }

  return ipv6Pattern.test(ip)
}

/**
 * Simple string hash for fallback identification
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).substring(0, 8)
}

/**
 * Extract client IP from request headers.
 * Prioritizes trusted headers set by infrastructure over client-provided ones.
 *
 * @param request - The incoming request
 * @returns Client IP address or hashed fallback identifier
 */
export function getClientIP(request: Request): string {
  // On Vercel, use the trusted x-vercel-forwarded-for header first
  // This header is set by Vercel's edge network and cannot be spoofed
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')
  if (vercelForwarded) {
    const ip = vercelForwarded.split(',')[0].trim()
    if (isValidIP(ip)) {
      return ip
    }
  }

  // x-real-ip is typically set by reverse proxies and is more trustworthy
  const realIP = request.headers.get('x-real-ip')
  if (realIP && isValidIP(realIP)) {
    return realIP
  }

  // x-forwarded-for can be spoofed, but use the rightmost IP as it's
  // most likely added by our trusted infrastructure
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim())
    const lastIp = ips[ips.length - 1]
    if (isValidIP(lastIp)) {
      return lastIp
    }
    const firstIp = ips[0]
    if (isValidIP(firstIp)) {
      return firstIp
    }
  }

  // Fallback - use a hash of multiple headers for better uniqueness
  // Include: user-agent, accept, accept-language, accept-encoding, and a timestamp component
  // This is still not as good as a real IP but provides more variation than user-agent alone
  const userAgent = request.headers.get('user-agent') || ''
  const accept = request.headers.get('accept') || ''
  const acceptLang = request.headers.get('accept-language') || ''
  const acceptEnc = request.headers.get('accept-encoding') || ''
  const secChUa = request.headers.get('sec-ch-ua') || '' // Client hints (browser-specific)
  const secChUaPlatform = request.headers.get('sec-ch-ua-platform') || ''

  // Combine multiple headers for a more unique fingerprint
  const fingerprint = `${userAgent}|${accept}|${acceptLang}|${acceptEnc}|${secChUa}|${secChUaPlatform}`

  log.warn('rate_limit_ip_fallback', {
    message: 'Could not determine client IP, using header fingerprint',
    fingerprintHash: hashString(fingerprint),
  })

  return `unknown-${hashString(fingerprint)}`
}
