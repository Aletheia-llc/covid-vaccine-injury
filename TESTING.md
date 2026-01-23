# Testing Guide

This document describes the testing strategy, tools, and procedures for the U.S. COVID Vaccine Injuries application.

## Overview

| Test Type | Framework | Location | Command |
|-----------|-----------|----------|---------|
| Unit Tests | Vitest | `src/**/*.test.ts` | `npm run test:unit` |
| E2E Tests | Playwright | `tests/e2e/` | `npm run test:e2e` |
| Type Checking | TypeScript | N/A | `npm run typecheck` |
| Linting | ESLint | N/A | `npm run lint` |

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
├── rate-limit.ts
├── rate-limit.test.ts  # Tests for rate-limit.ts
```

### Writing Unit Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sanitizeEmail } from './sanitize'

describe('sanitizeEmail', () => {
  it('returns valid email unchanged', () => {
    expect(sanitizeEmail('user@example.com')).toBe('user@example.com')
  })

  it('returns null for invalid email', () => {
    expect(sanitizeEmail('not-an-email')).toBeNull()
  })

  it('trims whitespace', () => {
    expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com')
  })
})
```

### Mocking

Mock external dependencies and environment variables:

```typescript
// Mock a module
vi.mock('./logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    security: vi.fn(),
  },
}))

// Mock environment variables
beforeEach(() => {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://test-redis.upstash.io')
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
└── flows/              # User flow tests (future)
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

### Required Security Tests

```typescript
// tests/security/csrf.test.ts
describe('CSRF Protection', () => {
  test('rejects request without token', async () => {
    const response = await fetch('/api/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q1: 'yes' }),
    })
    expect(response.status).toBe(403)
  })

  test('rejects request with invalid token', async () => {
    const response = await fetch('/api/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'invalid-token',
      },
      body: JSON.stringify({ q1: 'yes' }),
    })
    expect(response.status).toBe(403)
  })

  test('accepts request with valid token', async () => {
    // Get valid token first
    const csrfResponse = await fetch('/api/csrf')
    const { csrfToken } = await csrfResponse.json()

    const response = await fetch('/api/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ q1: 'yes' }),
    })
    expect(response.status).toBe(200)
  })
})
```

### Rate Limiting Tests

```typescript
describe('Rate Limiting', () => {
  test('allows requests under limit', async () => {
    // First request should succeed
    const response = await fetch('/api/survey', { method: 'POST', ... })
    expect(response.status).toBe(200)
  })

  test('blocks requests over limit', async () => {
    // Make max requests
    for (let i = 0; i < 5; i++) {
      await fetch('/api/survey', { method: 'POST', ... })
    }

    // Next request should be blocked
    const response = await fetch('/api/survey', { method: 'POST', ... })
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBeDefined()
  })
})
```

### Input Sanitization Tests

```typescript
describe('Input Sanitization', () => {
  test('removes script tags', () => {
    const input = '<script>alert("xss")</script>Hello'
    expect(sanitizeComment(input)).toBe('Hello')
  })

  test('removes javascript: protocol', () => {
    const input = '<a href="javascript:alert(1)">click</a>'
    expect(sanitizeComment(input)).not.toContain('javascript:')
  })

  test('handles nested tags', () => {
    const input = '<div><script>bad</script></div>'
    expect(sanitizeComment(input)).not.toContain('<script>')
  })
})
```

## Coverage Requirements

### Current Status

| Area | Coverage | Target |
|------|----------|--------|
| Overall | ~40% | 70% |
| Security libs | ~60% | 90% |
| API routes | ~20% | 70% |
| Components | ~10% | 50% |

### Priority Areas

1. **Must have 90%+ coverage:**
   - `src/lib/csrf.ts`
   - `src/lib/rate-limit.ts`
   - `src/lib/sanitize.ts`
   - `src/lib/auth.ts`

2. **Should have 70%+ coverage:**
   - All API routes (`src/app/api/`)
   - `src/lib/recaptcha.ts`
   - `src/lib/validation.ts`

3. **Nice to have:**
   - React components
   - Utility functions

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
  q3: 'me',
  email: 'test@example.com',
  zip: '90210',
}

export const invalidSurveyResponse = {
  q1: 'invalid-value',
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
```

### E2E Tests

```bash
# Run specific test file
npx playwright test smoke.spec.ts

# Run with trace on failure
npx playwright test --trace on

# Debug with Playwright Inspector
npx playwright test --debug
```

## Troubleshooting

### Common Issues

**Tests fail with "Cannot find module"**
- Run `npm install` to ensure dependencies are installed
- Check that TypeScript paths are configured in `vitest.config.mts`

**E2E tests timeout waiting for server**
- Ensure no other process is using port 3000
- Check that `DATABASE_URL` is set correctly

**Rate limit tests are flaky**
- Use unique identifiers per test: `test-${Date.now()}-${testId}`
- Reset rate limit store in `beforeEach`

**Tests pass locally but fail in CI**
- Check for environment variable differences
- Ensure tests don't depend on local state
- Use `CI=true` locally to match CI behavior

## Adding New Tests

### Checklist

- [ ] Test file is next to the code it tests
- [ ] Tests are isolated (no shared state)
- [ ] Tests have descriptive names
- [ ] Edge cases are covered
- [ ] Error cases are covered
- [ ] Mocks are properly cleaned up

### Test Naming Convention

```typescript
describe('functionName', () => {
  it('does something when condition', () => {})
  it('returns null when input is invalid', () => {})
  it('throws error when required param missing', () => {})
})
```
