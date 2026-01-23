import dns from 'dns'
import { promisify } from 'util'

const resolveMx = promisify(dns.resolveMx)

// Cache for MX lookups to avoid repeated DNS queries
const mxCache = new Map<string, { valid: boolean; timestamp: number }>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const DNS_TIMEOUT_MS = 3000 // 3 second timeout for DNS lookups

/**
 * Wrap a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DNS lookup timeout')), ms)),
  ])
}

// Common disposable/temporary email domains to block
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'throwaway.email',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'temp-mail.org',
  'fakeinbox.com',
  'trashmail.com',
  'yopmail.com',
  'dispostable.com',
  'maildrop.cc',
  'getairmail.com',
  'mohmal.com',
  'tempail.com',
  'emailondeck.com',
  'getnada.com',
  'guerrillamail.info',
  'sharklasers.com',
  'grr.la',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org',
  'spam4.me',
  'throwawaymail.com',
  'mailcatch.com',
  'mintemail.com',
  'tempmailaddress.com',
  'tempinbox.com',
  'disposableemailaddresses.com',
  'mailnesia.com',
  'tempomail.fr',
  'mytemp.email',
  'fakemail.net',
  'emailfake.com',
  'tempmailo.com',
  'fakemailgenerator.com',
])

/**
 * Extract domain from email address
 */
function extractDomain(email: string): string | null {
  const parts = email.toLowerCase().trim().split('@')
  if (parts.length !== 2) return null
  return parts[1]
}

/**
 * Check if domain has valid MX records (with timeout)
 */
async function hasMxRecords(domain: string): Promise<boolean> {
  try {
    const records = await withTimeout(resolveMx(domain), DNS_TIMEOUT_MS)
    return records && records.length > 0
  } catch {
    // DNS lookup failed, timed out, or domain doesn't exist
    return false
  }
}

/**
 * Check if email domain is a known disposable email provider
 */
function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain)
}

/**
 * Verify email domain has valid MX records
 * Returns { valid: boolean, reason?: string }
 *
 * Uses caching to avoid excessive DNS lookups
 */
export async function verifyEmailDomain(
  email: string
): Promise<{ valid: boolean; reason?: string }> {
  const domain = extractDomain(email)

  if (!domain) {
    return { valid: false, reason: 'Invalid email format' }
  }

  // Check cache first
  const cached = mxCache.get(domain)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    if (!cached.valid) {
      return { valid: false, reason: 'Email domain does not accept mail' }
    }
    return { valid: true }
  }

  // Check for disposable email domains
  if (isDisposableDomain(domain)) {
    mxCache.set(domain, { valid: false, timestamp: Date.now() })
    return { valid: false, reason: 'Disposable email addresses are not allowed' }
  }

  // Verify MX records exist
  const hasMx = await hasMxRecords(domain)
  mxCache.set(domain, { valid: hasMx, timestamp: Date.now() })

  if (!hasMx) {
    return { valid: false, reason: 'Email domain does not accept mail' }
  }

  return { valid: true }
}

/**
 * Quick sync check for obviously invalid domains
 * Use this for client-side or quick validation before full DNS check
 */
export function quickDomainCheck(email: string): { valid: boolean; reason?: string } {
  const domain = extractDomain(email)

  if (!domain) {
    return { valid: false, reason: 'Invalid email format' }
  }

  // Check for disposable domains
  if (isDisposableDomain(domain)) {
    return { valid: false, reason: 'Disposable email addresses are not allowed' }
  }

  // Check for obvious typos in common domains
  const commonTypos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'hotmal.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
    'iclod.com': 'icloud.com',
    'icoud.com': 'icloud.com',
  }

  if (commonTypos[domain]) {
    return {
      valid: false,
      reason: `Did you mean ${email.split('@')[0]}@${commonTypos[domain]}?`,
    }
  }

  return { valid: true }
}
