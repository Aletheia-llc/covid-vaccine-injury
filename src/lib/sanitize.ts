/**
 * Input sanitization utilities to prevent XSS and other injection attacks
 */

/**
 * Removes potentially dangerous HTML/script content from user input.
 * This is a basic sanitizer - for rich text, use a proper HTML sanitizer library.
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return ''

  return input
    // Remove any HTML tags
    .replace(/<[^>]*>/g, '')
    // Encode special HTML characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Remove potential script injection patterns
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Trim whitespace
    .trim()
}

/**
 * Sanitizes an email address - only allows valid email characters
 */
export function sanitizeEmail(input: string | undefined | null): string {
  if (!input) return ''

  // Only allow characters valid in email addresses
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._+-]/g, '')
    .substring(0, 254) // Max email length per RFC
}

/**
 * Sanitizes a ZIP code - only allows 5 digits
 */
export function sanitizeZip(input: string | undefined | null): string {
  if (!input) return ''

  return input.replace(/\D/g, '').substring(0, 5)
}

/**
 * Sanitizes a phone number - only allows digits, spaces, dashes, parens, plus
 */
export function sanitizePhone(input: string | undefined | null): string {
  if (!input) return ''

  return input
    .replace(/[^0-9+\-() ]/g, '')
    .trim()
    .substring(0, 20)
}

/**
 * Sanitizes a name - allows letters, spaces, hyphens, apostrophes
 */
export function sanitizeName(input: string | undefined | null): string {
  if (!input) return ''

  return input
    // Allow unicode letters, spaces, hyphens, apostrophes
    .replace(/[^\p{L}\s'-]/gu, '')
    .trim()
    .substring(0, 100)
}

/**
 * Sanitizes a general text field (comments, messages)
 * Allows more characters but still prevents XSS
 */
export function sanitizeComment(input: string | undefined | null): string {
  if (!input) return ''

  return input
    // Remove any HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove potential script injection patterns
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Trim and limit length
    .trim()
    .substring(0, 5000)
}
