/**
 * Shared Validation Functions
 * Used by both client components and server actions
 */

/**
 * Validate email format
 * RFC 5321 limits email to 254 characters
 * Requires valid local part, @ symbol, domain, and TLD (min 2 chars)
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false

  // Check max length (RFC 5321)
  if (email.length > 254) return false

  // More strict email regex:
  // - Local part: alphanumeric, dots, hyphens, underscores, plus signs
  // - Domain: alphanumeric and hyphens, must start/end with alphanumeric
  // - TLD: at least 2 characters, letters only
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Validate ZIP code format (US 5-digit or 5+4)
 */
export function isValidZip(zip: string): boolean {
  if (!zip) return false
  return /^\d{5}(-\d{4})?$/.test(zip)
}

/**
 * Validate ZIP code format (optional field version - returns true if empty)
 */
export function isValidZipOptional(zip: string): boolean {
  if (!zip) return true
  return isValidZip(zip)
}

/**
 * Validate phone number format
 * Accepts various formats, requires at least 10 digits
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false
  const phoneRegex = /^[\d\s\-\(\)\.+]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

/**
 * Validate phone number format (optional field version - returns true if empty)
 */
export function isValidPhoneOptional(phone: string): boolean {
  if (!phone) return true
  return isValidPhone(phone)
}

/**
 * Normalize email to lowercase and trim whitespace
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Normalize phone number to digits only
 * Returns null if less than 10 digits
 */
export function normalizePhone(phone: string | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 ? digits : null
}

/**
 * Validate name (non-empty, reasonable length)
 */
export function isValidName(name: string): boolean {
  if (!name) return false
  const trimmed = name.trim()
  return trimmed.length >= 1 && trimmed.length <= 100
}

/**
 * Validate message/comment (non-empty, reasonable length)
 */
export function isValidMessage(message: string, minLength = 10, maxLength = 5000): boolean {
  if (!message) return false
  const trimmed = message.trim()
  return trimmed.length >= minLength && trimmed.length <= maxLength
}
