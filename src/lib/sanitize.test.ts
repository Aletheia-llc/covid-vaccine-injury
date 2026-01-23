import { describe, it, expect } from 'vitest'
import {
  sanitizeText,
  sanitizeEmail,
  sanitizeZip,
  sanitizePhone,
  sanitizeName,
  sanitizeComment,
} from './sanitize'

describe('sanitizeText', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeText(null)).toBe('')
    expect(sanitizeText(undefined)).toBe('')
    expect(sanitizeText('')).toBe('')
  })

  it('removes HTML tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('alert(&quot;xss&quot;)')
    expect(sanitizeText('<div>Hello</div>')).toBe('Hello')
    expect(sanitizeText('<a href="evil">click</a>')).toBe('click')
  })

  it('encodes special HTML characters', () => {
    expect(sanitizeText('a & b')).toBe('a &amp; b')
    expect(sanitizeText('a < b')).toBe('a &lt; b')
    expect(sanitizeText('a > b')).toBe('a &gt; b')
    expect(sanitizeText('say "hello"')).toBe('say &quot;hello&quot;')
    expect(sanitizeText("it's fine")).toBe("it&#x27;s fine")
  })

  it('removes javascript: protocol', () => {
    expect(sanitizeText('javascript:alert(1)')).toBe('alert(1)')
    expect(sanitizeText('JAVASCRIPT:void(0)')).toBe('void(0)')
  })

  it('removes data: protocol', () => {
    expect(sanitizeText('data:text/html,<script>')).toBe('text/html,')
  })

  it('removes event handlers', () => {
    expect(sanitizeText('onload=alert(1)')).toBe('alert(1)')
    expect(sanitizeText('onclick=evil()')).toBe('evil()')
    expect(sanitizeText('ONERROR=bad')).toBe('bad')
  })

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello')
  })
})

describe('sanitizeEmail', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeEmail(null)).toBe('')
    expect(sanitizeEmail(undefined)).toBe('')
    expect(sanitizeEmail('')).toBe('')
  })

  it('converts to lowercase', () => {
    expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com')
  })

  it('removes invalid characters', () => {
    expect(sanitizeEmail('user<script>@example.com')).toBe('userscript@example.com')
    expect(sanitizeEmail("user'or'1=1@evil.com")).toBe('useror11@evil.com')
  })

  it('preserves valid email characters', () => {
    expect(sanitizeEmail('user+tag@example.com')).toBe('user+tag@example.com')
    expect(sanitizeEmail('user.name@sub.example.com')).toBe('user.name@sub.example.com')
    expect(sanitizeEmail('user-name@example.com')).toBe('user-name@example.com')
  })

  it('truncates to max email length', () => {
    const longEmail = 'a'.repeat(300) + '@example.com'
    expect(sanitizeEmail(longEmail).length).toBeLessThanOrEqual(254)
  })

  it('trims whitespace', () => {
    expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com')
  })
})

describe('sanitizeZip', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeZip(null)).toBe('')
    expect(sanitizeZip(undefined)).toBe('')
    expect(sanitizeZip('')).toBe('')
  })

  it('removes non-digit characters', () => {
    expect(sanitizeZip('90210')).toBe('90210')
    expect(sanitizeZip('902-10')).toBe('90210')
    expect(sanitizeZip('9O21O')).toBe('921') // O is not 0
    expect(sanitizeZip('abc90210xyz')).toBe('90210')
  })

  it('truncates to 5 digits', () => {
    expect(sanitizeZip('902101234')).toBe('90210')
  })
})

describe('sanitizePhone', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizePhone(null)).toBe('')
    expect(sanitizePhone(undefined)).toBe('')
    expect(sanitizePhone('')).toBe('')
  })

  it('allows valid phone characters', () => {
    expect(sanitizePhone('(555) 123-4567')).toBe('(555) 123-4567')
    expect(sanitizePhone('+1 555-123-4567')).toBe('+1 555-123-4567')
  })

  it('removes invalid characters', () => {
    expect(sanitizePhone('555.123.4567')).toBe('5551234567')
    // "call:" is removed, and leading space is trimmed
    expect(sanitizePhone('call: 555-1234')).toBe('555-1234')
  })

  it('truncates to max length', () => {
    const longPhone = '1'.repeat(30)
    expect(sanitizePhone(longPhone).length).toBeLessThanOrEqual(20)
  })
})

describe('sanitizeName', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeName(null)).toBe('')
    expect(sanitizeName(undefined)).toBe('')
    expect(sanitizeName('')).toBe('')
  })

  it('allows letters and common name characters', () => {
    expect(sanitizeName('John Doe')).toBe('John Doe')
    expect(sanitizeName("O'Connor")).toBe("O'Connor")
    expect(sanitizeName('Mary-Jane')).toBe('Mary-Jane')
  })

  it('allows unicode letters', () => {
    expect(sanitizeName('José García')).toBe('José García')
    expect(sanitizeName('Müller')).toBe('Müller')
  })

  it('removes numbers and special characters', () => {
    expect(sanitizeName('John123')).toBe('John')
    expect(sanitizeName('John<script>')).toBe('Johnscript')
  })

  it('truncates to max length', () => {
    const longName = 'A'.repeat(150)
    expect(sanitizeName(longName).length).toBeLessThanOrEqual(100)
  })
})

describe('sanitizeComment', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeComment(null)).toBe('')
    expect(sanitizeComment(undefined)).toBe('')
    expect(sanitizeComment('')).toBe('')
  })

  it('removes HTML tags', () => {
    expect(sanitizeComment('<p>Hello</p>')).toBe('Hello')
    expect(sanitizeComment('<script>evil()</script>')).toBe('evil()')
  })

  it('removes script injection patterns', () => {
    expect(sanitizeComment('javascript:alert(1)')).toBe('alert(1)')
    expect(sanitizeComment('data:text/html')).toBe('text/html')
    expect(sanitizeComment('onclick=bad')).toBe('bad')
    expect(sanitizeComment('onmouseover = evil')).toBe('evil')
  })

  it('preserves normal text', () => {
    const comment = "I had a severe reaction & needed medical care. It's been difficult."
    expect(sanitizeComment(comment)).toBe(comment)
  })

  it('truncates to max length', () => {
    const longComment = 'A'.repeat(6000)
    expect(sanitizeComment(longComment).length).toBeLessThanOrEqual(5000)
  })
})
