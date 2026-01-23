import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidZip,
  isValidZipOptional,
  isValidPhone,
  isValidPhoneOptional,
  normalizeEmail,
  normalizePhone,
  isValidName,
  isValidMessage,
} from './validation'

describe('isValidEmail', () => {
  it('returns false for empty/null values', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail(null as unknown as string)).toBe(false)
    expect(isValidEmail(undefined as unknown as string)).toBe(false)
  })

  it('validates correct email formats', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('user.name@example.com')).toBe(true)
    expect(isValidEmail('user+tag@example.com')).toBe(true)
    expect(isValidEmail('user@sub.example.com')).toBe(true)
    expect(isValidEmail('user@example.co.uk')).toBe(true)
  })

  it('rejects invalid email formats', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('user@.com')).toBe(false)
    expect(isValidEmail('user@example')).toBe(false)
    expect(isValidEmail('user@example.c')).toBe(false) // TLD too short
  })

  it('rejects emails exceeding max length', () => {
    const longEmail = 'a'.repeat(250) + '@example.com'
    expect(isValidEmail(longEmail)).toBe(false)
  })
})

describe('isValidZip', () => {
  it('returns false for empty values', () => {
    expect(isValidZip('')).toBe(false)
  })

  it('validates 5-digit ZIP codes', () => {
    expect(isValidZip('90210')).toBe(true)
    expect(isValidZip('00000')).toBe(true)
    expect(isValidZip('99999')).toBe(true)
  })

  it('validates ZIP+4 format', () => {
    expect(isValidZip('90210-1234')).toBe(true)
  })

  it('rejects invalid ZIP formats', () => {
    expect(isValidZip('9021')).toBe(false) // Too short
    expect(isValidZip('902100')).toBe(false) // Too long
    expect(isValidZip('9021O')).toBe(false) // Letter O
    expect(isValidZip('90210-')).toBe(false) // Incomplete +4
    expect(isValidZip('90210-12')).toBe(false) // Incomplete +4
  })
})

describe('isValidZipOptional', () => {
  it('returns true for empty values', () => {
    expect(isValidZipOptional('')).toBe(true)
    expect(isValidZipOptional(null as unknown as string)).toBe(true)
  })

  it('validates when value is provided', () => {
    expect(isValidZipOptional('90210')).toBe(true)
    expect(isValidZipOptional('invalid')).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('returns false for empty values', () => {
    expect(isValidPhone('')).toBe(false)
  })

  it('validates phone numbers with various formats', () => {
    expect(isValidPhone('5551234567')).toBe(true)
    expect(isValidPhone('555-123-4567')).toBe(true)
    expect(isValidPhone('(555) 123-4567')).toBe(true)
    expect(isValidPhone('+1 555 123 4567')).toBe(true)
    expect(isValidPhone('555.123.4567')).toBe(true)
  })

  it('requires at least 10 digits', () => {
    expect(isValidPhone('555-1234')).toBe(false) // Only 7 digits
    expect(isValidPhone('123456789')).toBe(false) // 9 digits
    expect(isValidPhone('1234567890')).toBe(true) // 10 digits
  })

  it('rejects invalid characters', () => {
    expect(isValidPhone('555-CALL-NOW')).toBe(false)
  })
})

describe('isValidPhoneOptional', () => {
  it('returns true for empty values', () => {
    expect(isValidPhoneOptional('')).toBe(true)
    expect(isValidPhoneOptional(null as unknown as string)).toBe(true)
  })

  it('validates when value is provided', () => {
    expect(isValidPhoneOptional('555-123-4567')).toBe(true)
    expect(isValidPhoneOptional('invalid')).toBe(false)
  })
})

describe('normalizeEmail', () => {
  it('converts to lowercase', () => {
    expect(normalizeEmail('User@Example.COM')).toBe('user@example.com')
  })

  it('trims whitespace', () => {
    expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com')
  })
})

describe('normalizePhone', () => {
  it('returns null for empty values', () => {
    expect(normalizePhone('')).toBe(null)
    expect(normalizePhone(undefined)).toBe(null)
  })

  it('extracts digits only', () => {
    expect(normalizePhone('(555) 123-4567')).toBe('5551234567')
    expect(normalizePhone('+1 555-123-4567')).toBe('15551234567')
  })

  it('returns null if less than 10 digits', () => {
    expect(normalizePhone('555-1234')).toBe(null)
  })
})

describe('isValidName', () => {
  it('returns false for empty values', () => {
    expect(isValidName('')).toBe(false)
    expect(isValidName('   ')).toBe(false) // Whitespace only
  })

  it('validates reasonable name lengths', () => {
    expect(isValidName('J')).toBe(true) // Single letter
    expect(isValidName('John Doe')).toBe(true)
    expect(isValidName('A'.repeat(100))).toBe(true) // Max length
  })

  it('rejects names exceeding max length', () => {
    expect(isValidName('A'.repeat(101))).toBe(false)
  })
})

describe('isValidMessage', () => {
  it('returns false for empty values', () => {
    expect(isValidMessage('')).toBe(false)
    expect(isValidMessage('   ')).toBe(false)
  })

  it('validates based on min/max length', () => {
    expect(isValidMessage('Short')).toBe(false) // Below default min (10)
    expect(isValidMessage('This is a valid message.')).toBe(true)
  })

  it('allows custom min/max lengths', () => {
    expect(isValidMessage('Hi', 1, 100)).toBe(true)
    expect(isValidMessage('A'.repeat(6000), 10, 5000)).toBe(false)
  })
})
