// Simple in-memory rate limiter for API endpoints
// For production with multiple instances, consider using Redis

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  maxRequests: number  // Max requests per window
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitMap.set(key, {
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
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment counter
  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Validates that a string looks like a valid IP address (IPv4 or IPv6)
 */
function isValidIP(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/

  if (ipv4Pattern.test(ip)) {
    // Validate each octet is 0-255
    const parts = ip.split('.')
    return parts.every(part => {
      const num = parseInt(part, 10)
      return num >= 0 && num <= 255
    })
  }

  return ipv6Pattern.test(ip)
}

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
    const ips = forwarded.split(',').map(ip => ip.trim())
    // Use the last IP in the chain (closest to our server)
    // Note: This assumes our infrastructure adds to the end
    const lastIp = ips[ips.length - 1]
    if (isValidIP(lastIp)) {
      return lastIp
    }
    // Fallback to first IP if last is invalid
    const firstIp = ips[0]
    if (isValidIP(firstIp)) {
      return firstIp
    }
  }

  // Fallback - use a hash of user agent + accept headers for some uniqueness
  // This isn't perfect but provides some protection against unknown IPs
  const userAgent = request.headers.get('user-agent') || ''
  const accept = request.headers.get('accept') || ''
  return `unknown-${hashString(userAgent + accept)}`
}

/**
 * Simple string hash for fallback identification
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8)
}
