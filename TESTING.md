# Testing Guide

This document describes the testing strategy, tools, and procedures for the U.S. COVID Vaccine Injuries application.

## Overview

| Test Type | Framework | Location | Command |
|-----------|-----------|----------|---------|
| Unit Tests | Vitest 3.2.3 | `src/**/*.test.ts` | `npm run test:unit` |
| E2E Tests | Playwright 1.56.1 | `tests/e2e/` | `npm run test:e2e` |
| Type Checking | TypeScript 5.7.3 | N/A | `npm run typecheck` |
| Linting | ESLint 9.x | N/A | `npm run lint` |

## Quick Start

```bash
# Run all checks (recommended before committing)
npm run typecheck && npm run lint && npm run test:unit

# Run unit tests with watch mode
npm run test:unit:watch

# Run E2E tests with visible browser
npm run test:e2e:headed

# Run E2E tests with interactive UI
npm run test:e2e:ui
```

## Unit Tests

### Running Unit Tests

```bash
npm run test:unit           # Run once
npm run test:unit:watch     # Watch mode for development
npm run test:unit:coverage  # Generate coverage report
```

### Test File Location

Place test files next to the code they test:

```
src/lib/
├── sanitize.ts
├── sanitize.test.ts    # Tests for sanitize.ts
├── csrf.ts
├── csrf.test.ts        # Tests for csrf.ts
├── rate-limit.ts
├── rate-limit.test.ts  # Tests for rate-limit.ts
├── recaptcha.ts
├── recaptcha.test.ts   # Tests for recaptcha.ts
├── constants.ts
├── constants.test.ts   # Tests for constants.ts
├── env-validation.ts
├── env-validation.test.ts
└── validation.ts
    validation.test.ts
```

### Writing Unit Tests

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sanitizeEmail, sanitizeName } from './sanitize'

describe('sanitizeEmail', () => {
  it('returns valid email unchanged', () => {
    expect(sanitizeEmail('user@example.com')).toBe('user@example.com')
  })

  it('converts to lowercase', () => {
    expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com')
  })

  it('returns empty string for invalid email', () => {
    expect(sanitizeEmail('not-an-email')).toBe('')
  })

  it('trims whitespace', () => {
    expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com')
  })

  it('handles undefined input', () => {
    expect(sanitizeEmail(undefined)).toBe('')
  })
})
```

### Mocking

Mock external dependencies and environment variables:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock a module
vi.mock('./logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    security: vi.fn(),
  },
  createRequestLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}))

// Mock environment variables
beforeEach(() => {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://test-redis.upstash.io')
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-token')
})

afterEach(() => {
  vi.unstubAllEnvs()
})
```

### Testing Async Functions

```typescript
describe('checkRateLimit', () => {
  it('returns success when under limit', async () => {
    const result = await checkRateLimit('test-id', {
      windowMs: 60000,
      maxRequests: 10,
    })

    expect(result.success).toBe(true)
    expect(result.remaining).toBeGreaterThan(0)
  })
})
```

## E2E Tests

### Running E2E Tests

```bash
npm run test:e2e            # Run all E2E tests (headless)
npm run test:e2e:headed     # Run with visible browser
npm run test:e2e:ui         # Interactive Playwright UI
```

### E2E Test Structure

```
tests/e2e/
├── smoke.spec.ts       # Basic smoke tests (health, csrf, page loads)
└── flows/              # User flow tests
    ├── survey.spec.ts
    ├── contact.spec.ts
    └── donate.spec.ts
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('Survey Flow', () => {
  test('can submit a survey response', async ({ page }) => {
    await page.goto('/survey')

    // Fill out required fields
    await page.getByRole('radio', { name: 'Yes' }).first().click()

    // Submit form
    await page.getByRole('button', { name: 'Submit' }).click()

    // Verify success
    await expect(page.getByText('Thank you')).toBeVisible()
  })

  test('shows validation errors for required fields', async ({ page }) => {
    await page.goto('/survey')

    // Submit without filling fields
    await page.getByRole('button', { name: 'Submit' }).click()

    // Verify error message
    await expect(page.getByText('required')).toBeVisible()
  })
})
```

### Playwright Configuration

See `playwright.config.ts` for configuration. Key settings:

- **Browsers**: Chromium, Firefox, WebKit, mobile viewports
- **Base URL**: `http://localhost:3000` (or `PLAYWRIGHT_BASE_URL` env var)
- **Retries**: 2 on CI, 0 locally
- **Web Server**: Auto-starts dev server before tests

## Security Testing

Security-critical code requires dedicated tests. These verify that security controls work correctly.

### CSRF Protection Tests

```typescript
describe('CSRF Protection', () => {
  it('generates valid token format', () => {
    const token = generateCsrfToken()
    const parts = token.split('.')

    expect(parts).toHaveLength(3)
    expect(parts[0]).toMatch(/^\d+$/)  // timestamp
    expect(parts[1]).toMatch(/^[a-f0-9]+$/)  // random hex
    expect(parts[2]).toMatch(/^[a-f0-9]+$/)  // signature
  })

  it('verifies valid token', () => {
    const token = generateCsrfToken()
    expect(verifyCsrfToken(token)).toBe(true)
  })

  it('rejects expired token', () => {
    // Token from 2 hours ago
    const oldTimestamp = Date.now() - 2 * 60 * 60 * 1000
    const token = `${oldTimestamp}.abc123.signature`

    expect(verifyCsrfToken(token)).toBe(false)
  })

  it('rejects tampered token', () => {
    const token = generateCsrfToken()
    const tampered = token.replace('a', 'b')

    expect(verifyCsrfToken(tampered)).toBe(false)
  })
})
```

### Rate Limiting Tests

```typescript
describe('Rate Limiting', () => {
  it('allows requests under limit', async () => {
    const result = await checkRateLimit('test-user', {
      windowMs: 60000,
      maxRequests: 5,
    })

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('blocks requests over limit', async () => {
    const config = { windowMs: 60000, maxRequests: 2 }

    // Use up the limit
    await checkRateLimit('test-user-2', config)
    await checkRateLimit('test-user-2', config)

    // Next request should be blocked
    const result = await checkRateLimit('test-user-2', config)

    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('includes retry-after time', async () => {
    const config = { windowMs: 60000, maxRequests: 1 }

    await checkRateLimit('test-user-3', config)
    const result = await checkRateLimit('test-user-3', config)

    expect(result.resetTime).toBeGreaterThan(Date.now())
  })
})
```

### Input Sanitization Tests

```typescript
describe('Input Sanitization', () => {
  describe('sanitizeName', () => {
    it('allows alphanumeric and spaces', () => {
      expect(sanitizeName('John Doe')).toBe('John Doe')
    })

    it('removes special characters', () => {
      expect(sanitizeName('John<script>alert(1)</script>')).toBe('Johnscriptalert1script')
    })

    it('truncates to max length', () => {
      const longName = 'a'.repeat(150)
      expect(sanitizeName(longName).length).toBeLessThanOrEqual(100)
    })
  })

  describe('sanitizeEmail', () => {
    it('normalizes to lowercase', () => {
      expect(sanitizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com')
    })

    it('rejects invalid format', () => {
      expect(sanitizeEmail('not-an-email')).toBe('')
    })
  })

  describe('sanitizeZip', () => {
    it('extracts digits only', () => {
      expect(sanitizeZip('90210-1234')).toBe('90210')
    })

    it('returns empty for too short', () => {
      expect(sanitizeZip('123')).toBe('')
    })
  })
})
```

## Coverage Requirements

### Current Status

| Area | Coverage | Target |
|------|----------|--------|
| Security libs | ~70% | 90% |
| API routes | ~40% | 70% |
| Components | ~20% | 50% |

### Priority Areas

1. **Must have 90%+ coverage:**
   - `src/lib/csrf.ts`
   - `src/lib/rate-limit.ts`
   - `src/lib/sanitize.ts`
   - `src/lib/auth.ts`
   - `src/lib/validation.ts`

2. **Should have 70%+ coverage:**
   - All API routes (`src/app/api/`)
   - `src/lib/recaptcha.ts`
   - `src/lib/env-validation.ts`

3. **Nice to have:**
   - React components
   - Utility functions
   - Animation hooks

### Viewing Coverage

```bash
npm run test:unit:coverage

# Open coverage report in browser
open coverage/index.html
```

## CI/CD Integration

Tests run automatically on every push and PR via GitHub Actions.

### CI Workflow

```yaml
# .github/workflows/ci.yml
- name: Type check
  run: npm run typecheck

- name: Lint
  run: npm run lint

- name: Unit tests
  run: npm run test:unit

- name: E2E tests
  run: npm run test:e2e
```

### Required Checks

PRs cannot be merged until:

- [ ] TypeScript compilation passes
- [ ] ESLint passes with no errors
- [ ] All unit tests pass
- [ ] All E2E smoke tests pass

## Test Data

### Test Environment Variables

Set these in CI or for local testing:

```bash
# Required for tests
DATABASE_URL=postgresql://test:test@localhost:5432/test
PAYLOAD_SECRET=test-secret-at-least-32-characters-long
CI=true

# Optional - tests will skip if not set
UPSTASH_REDIS_REST_URL=
STRIPE_SECRET_KEY=
```

### Fixtures

For consistent test data, use fixtures:

```typescript
// tests/fixtures/survey.ts
export const validSurveyResponse = {
  q1: 'yes',
  q2: 'yes',
  q3: 'severe',
  email: 'test@example.com',
  zipCode: '90210',
}

export const invalidSurveyResponse = {
  q1: 'invalid-value',
}

// tests/fixtures/subscribe.ts
export const validSubscription = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '5551234567',
  zip: '90210',
}
```

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npx vitest run src/lib/sanitize.test.ts

# Run tests matching a pattern
npx vitest run -t "sanitizeEmail"

# Debug with console output
npx vitest run --reporter=verbose

# Run single test in isolation
npx vitest run src/lib/csrf.test.ts -t "generates valid token"
```

### E2E Tests

```bash
# Run specific test file
npx playwright test smoke.spec.ts

# Run with trace on failure
npx playwright test --trace on

# Debug with Playwright Inspector
npx playwright test --debug

# View trace after test failure
npx playwright show-trace trace.zip
```

## Troubleshooting

### Common Issues

**Tests fail with "Cannot find module"**
- Run `npm install` to ensure dependencies are installed
- Check that TypeScript paths are configured in `vitest.config.mts`

**E2E tests timeout waiting for server**
- Ensure no other process is using port 3000
- Check that `DATABASE_URL` is set correctly
- Try running `npm run dev` manually first

**Rate limit tests are flaky**
- Use unique identifiers per test: `test-${Date.now()}-${Math.random()}`
- Reset rate limit store in `beforeEach`
- Use in-memory rate limiter for tests

**Tests pass locally but fail in CI**
- Check for environment variable differences
- Ensure tests don't depend on local state
- Use `CI=true` locally to match CI behavior

**CSRF tests fail with "Invalid signature"**
- Ensure `PAYLOAD_SECRET` is set consistently
- Mock the secret in tests for reproducibility

## Adding New Tests

### Checklist

- [ ] Test file is next to the code it tests
- [ ] Tests are isolated (no shared state)
- [ ] Tests have descriptive names
- [ ] Edge cases are covered
- [ ] Error cases are covered
- [ ] Mocks are properly cleaned up
- [ ] Async operations are properly awaited

### Test Naming Convention

```typescript
describe('functionName', () => {
  it('does something when condition', () => {})
  it('returns null when input is invalid', () => {})
  it('throws error when required param missing', () => {})
})
```

### Testing API Routes

For API route tests, create a test helper:

```typescript
// tests/helpers/api.ts
import { NextRequest } from 'next/server'

export function createMockRequest(options: {
  method?: string
  body?: object
  headers?: Record<string, string>
}): NextRequest {
  const { method = 'POST', body, headers = {} } = options

  return new NextRequest('http://localhost:3000/api/test', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}
```
