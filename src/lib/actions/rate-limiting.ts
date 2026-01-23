'use server'

/**
 * Rate Limiting Module
 * Server-side rate limiting using Supabase for persistence and horizontal scaling
 *
 * IMPORTANT: This requires the rate_limits table and check_rate_limit function
 * to be created in your Supabase database. See the migration plan for SQL.
 */

import { headers } from 'next/headers'
import { log } from '../logger'
import { getSupabase } from './supabase-client'

// Rate limiting constants
const RATE_LIMIT_WINDOW_SECONDS = 60 // 1 minute
const RATE_LIMIT_MAX = 5 // Max 5 submissions per minute per IP

// In-memory fallback for development or when Supabase is not configured
const inMemoryLimits = new Map<string, { count: number; resetTime: number }>()

/**
 * Hash IP address for privacy (we don't store raw IPs)
 */
export async function hashIP(ip: string): Promise<string> {
  const crypto = await import('crypto')
  return crypto.createHash('sha256').update(ip).digest('hex')
}

/**
 * Get client IP from request headers
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers()

  // On Vercel, use the trusted x-vercel-forwarded-for header first
  const vercelForwarded = headersList.get('x-vercel-forwarded-for')
  if (vercelForwarded) {
    return vercelForwarded.split(',')[0].trim()
  }

  // x-real-ip is typically set by reverse proxies
  const realIP = headersList.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // x-forwarded-for fallback
  const forwarded = headersList.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  return 'unknown'
}

/**
 * In-memory rate limiting fallback (for development)
 */
function checkInMemoryRateLimit(ipHash: string): { allowed: boolean; error?: string } {
  const now = Date.now()
  const windowMs = RATE_LIMIT_WINDOW_SECONDS * 1000
  const entry = inMemoryLimits.get(ipHash)

  if (!entry || now > entry.resetTime) {
    inMemoryLimits.set(ipHash, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, error: 'Too many submissions. Please try again in a minute.' }
  }

  entry.count++
  return { allowed: true }
}

/**
 * Check rate limit using Supabase for persistence and horizontal scaling
 * Uses atomic PostgreSQL function to prevent race conditions
 *
 * Falls back to in-memory rate limiting in development if Supabase is not configured
 */
export async function checkRateLimit(
  maxRequests: number = RATE_LIMIT_MAX,
  windowSeconds: number = RATE_LIMIT_WINDOW_SECONDS
): Promise<{ allowed: boolean; error?: string }> {
  try {
    const ip = await getClientIP()
    const ipHash = await hashIP(ip)

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      // In development, use in-memory fallback
      if (process.env.NODE_ENV === 'development') {
        log.debug('Using in-memory rate limiting (Supabase not configured)')
        return checkInMemoryRateLimit(ipHash)
      }
      // In production, fail CLOSED - deny request if rate limiting is not configured
      log.security('rate_limit_not_configured', {})
      return { allowed: false, error: 'Service temporarily unavailable. Please try again.' }
    }

    const supabase = getSupabase()

    // Call atomic rate limit function - handles insert/update/window reset in one query
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_ip_hash: ipHash,
      p_window_seconds: windowSeconds,
      p_max_requests: maxRequests,
    })

    if (error) {
      // Log only safe info - don't expose full error object
      log.security('rate_limit_rpc_error', { errorCode: error.code || 'unknown' })

      // In development, fall back to in-memory
      if (process.env.NODE_ENV === 'development') {
        log.debug('Falling back to in-memory rate limiting due to RPC error')
        return checkInMemoryRateLimit(ipHash)
      }

      // In production, fail CLOSED - deny request if rate limiting is broken
      return { allowed: false, error: 'Service temporarily unavailable. Please try again.' }
    }

    // RPC returns array with single row: { allowed: boolean, current_count: number }
    const result = data?.[0]
    if (!result) {
      // Fail CLOSED - deny request if no result returned
      return { allowed: false, error: 'Service temporarily unavailable. Please try again.' }
    }

    if (!result.allowed) {
      log.security('rate_limit_exceeded', { ipHash: ipHash.substring(0, 8) })
      return { allowed: false, error: 'Too many submissions. Please try again in a minute.' }
    }

    return { allowed: true }
  } catch (err) {
    // Fail CLOSED - deny request if rate limiting check fails (security best practice)
    log.failure('rate_limit_check', err)

    // In development, allow the request to proceed for easier testing
    if (process.env.NODE_ENV === 'development') {
      log.debug('Allowing request in development despite rate limit error')
      return { allowed: true }
    }

    return { allowed: false, error: 'Service temporarily unavailable. Please try again.' }
  }
}

/**
 * Cleanup function for in-memory rate limits (call periodically in development)
 */
export function cleanupInMemoryLimits(): void {
  const now = Date.now()
  for (const [key, entry] of inMemoryLimits.entries()) {
    if (now > entry.resetTime) {
      inMemoryLimits.delete(key)
    }
  }
}
