# Contributing to U.S. COVID Vaccine Injuries

Thank you for your interest in contributing to this project. This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to help vaccine-injured Americans get fair compensation.

## Getting Started

### Prerequisites

- Node.js 20.x
- npm or pnpm 9+
- PostgreSQL database (local or Supabase)
- Git

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR-USERNAME/covid-vaccine-injury.git
   cd covid-vaccine-injury
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your local configuration. At minimum, you need:
   - `DATABASE_URL`: PostgreSQL connection string
   - `PAYLOAD_SECRET`: Any 32+ character string for local dev

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

### First-Time Admin Setup

When you first access `/admin`, you'll be prompted to create an admin user. This user is stored in your local database.

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-export-button` - New features
- `fix/survey-validation-error` - Bug fixes
- `docs/update-api-docs` - Documentation
- `refactor/simplify-rate-limiter` - Code improvements

### Making Changes

1. **Create a new branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   Follow the code style guidelines below.

3. **Run checks before committing**

   ```bash
   npm run typecheck    # TypeScript type checking
   npm run lint         # ESLint
   npm run test:unit    # Unit tests
   ```

4. **Commit your changes**

   Write clear, concise commit messages:

   ```
   Add CSV export button to survey stats page

   - Add download button component
   - Connect to /api/survey/export endpoint
   - Add loading state during download
   ```

5. **Push and create a Pull Request**

   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a PR on GitHub with a clear description of your changes.

## Code Style Guidelines

### TypeScript

- Use strict TypeScript - avoid `any` types
- Define interfaces for all data structures
- Use type guards for runtime validation

```typescript
// Good
interface SurveyResponse {
  q1: 'yes' | 'no' | 'unsure'
  email?: string
}

// Bad
const response: any = await request.json()
```

### React Components

- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic into custom hooks

```typescript
// Good - focused component
function SurveyQuestion({ question, value, onChange }: QuestionProps) {
  return (
    <div className="survey-question">
      <label>{question}</label>
      <RadioGroup value={value} onChange={onChange} />
    </div>
  )
}

// Bad - component doing too much
function SurveyForm() {
  // 500 lines of mixed concerns
}
```

### API Routes

Follow the established security pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { createRequestLogger } from '@/lib/logger'
import { RATE_LIMITS, REQUEST_SIZE_LIMITS } from '@/lib/constants'

export async function POST(request: NextRequest) {
  // 1. Generate request ID for tracing
  const requestId = crypto.randomUUID()
  const log = createRequestLogger({ requestId, path: '/api/endpoint', method: 'POST' })

  // 2. CSRF protection (token-based)
  const csrfValid = await validateCsrfToken(request)
  if (!csrfValid) {
    log.warn({ event: 'csrf_validation_failed' }, 'CSRF validation failed')
    return NextResponse.json(
      { error: 'Security validation failed. Please refresh and try again.' },
      { status: 403, headers: { 'X-Request-ID': requestId } }
    )
  }

  // 3. Request size check
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > REQUEST_SIZE_LIMITS.ENDPOINT) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })
  }

  // 4. Rate limiting
  const clientIP = getClientIP(request)
  const rateLimit = await checkRateLimit(`endpoint:${clientIP}`, RATE_LIMITS.ENDPOINT)
  if (!rateLimit.success) {
    const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  // 5. Parse and validate input
  const body = await request.json()

  // 6. reCAPTCHA verification (if configured)
  // ...

  // 7. Input sanitization
  // ...

  // 8. Business logic
  // ...

  // 9. Return response with request ID
  return NextResponse.json(
    { success: true },
    { headers: { 'X-Request-ID': requestId } }
  )
}
```

### CSS

- Use CSS custom properties (variables) for colors and spacing
- Follow BEM-like naming for classes
- Keep styles scoped to components when possible

```css
/* Good */
.survey-question {
  padding: var(--spacing-md);
}

.survey-question__label {
  color: var(--text-primary);
}

/* Bad */
.question {
  padding: 16px;
}
```

### Logging

Use the structured logger, never `console.log`:

```typescript
import { log, createRequestLogger } from '@/lib/logger'

// Global logger
log.info('survey_submitted', { zipCode, questionCount: 9 })
log.error('database_error', { error: err.message })
log.security('rate_limit_exceeded', { ip: clientIP })

// Request-scoped logger (includes requestId)
const routeLog = createRequestLogger({ requestId, path, method })
routeLog.info('request_received', { body: sanitizedBody })
routeLog.warn('validation_failed', { field: 'email' })
```

### Constants

Use centralized constants from `src/lib/constants.ts`:

```typescript
import { RATE_LIMITS, REQUEST_SIZE_LIMITS, VALIDATION } from '@/lib/constants'

// Good - using centralized config
if (name.length > VALIDATION.MAX_NAME_LENGTH) {
  return error
}

// Bad - magic numbers
if (name.length > 100) {
  return error
}
```

## Testing

### Unit Tests

Write unit tests for utility functions and business logic:

```bash
npm run test:unit           # Run once
npm run test:unit:watch     # Watch mode
npm run test:unit:coverage  # With coverage report
```

Place test files next to the code they test:

```
src/lib/
├── sanitize.ts
├── sanitize.test.ts    # Tests for sanitize.ts
├── csrf.ts
├── csrf.test.ts        # Tests for csrf.ts
```

### E2E Tests

Write Playwright tests for critical user flows:

```bash
npm run test:e2e        # Run all E2E tests
npm run test:e2e:ui     # Interactive UI mode
npm run test:e2e:headed # Visible browser
```

E2E tests are in the `tests/e2e/` directory.

### What to Test

- **Must test**: Security functions, data validation, API routes
- **Should test**: Business logic, state management
- **Nice to have**: UI components, edge cases

### Test Coverage

Security-critical code requires high test coverage:

| Module | Target Coverage |
|--------|-----------------|
| `src/lib/csrf.ts` | 90%+ |
| `src/lib/rate-limit.ts` | 90%+ |
| `src/lib/sanitize.ts` | 90%+ |
| `src/lib/auth.ts` | 90%+ |
| API routes | 70%+ |

## Pull Request Guidelines

### Before Submitting

- [ ] All checks pass (`npm run typecheck && npm run lint && npm run test:unit`)
- [ ] Code follows the style guidelines
- [ ] New features have tests
- [ ] Documentation is updated if needed
- [ ] No console.log statements
- [ ] No hardcoded secrets

### PR Description

Include:

1. **What** - Brief description of changes
2. **Why** - Motivation or issue being fixed
3. **How** - Technical approach (if complex)
4. **Testing** - How you verified the changes

### Review Process

1. Automated checks must pass
2. At least one maintainer review required
3. Address feedback constructively
4. Squash commits before merge (if requested)

## Security

### Reporting Vulnerabilities

If you discover a security vulnerability, please:

1. **DO NOT** create a public issue
2. Email security@covidvaccineinjury.us
3. Include steps to reproduce
4. Allow time for a fix before disclosure

### Security Checklist

When making changes that handle user input:

- [ ] Input is validated before use
- [ ] Input is sanitized via `sanitize*()` functions
- [ ] Output is escaped when rendered
- [ ] Rate limiting is in place
- [ ] CSRF protection is verified
- [ ] No sensitive data in logs
- [ ] Error messages don't leak internal details

### Adding New API Endpoints

All new POST endpoints must implement:

1. Request ID generation (`crypto.randomUUID()`)
2. CSRF validation (`validateCsrfToken()`)
3. Rate limiting (`checkRateLimit()`)
4. Input sanitization (`sanitize*()` functions)
5. reCAPTCHA verification (when configured)
6. X-Request-ID response header

## Environment Variables

### Development

```bash
# Required
DATABASE_URL=postgresql://localhost:5432/covidvaccineinjury
PAYLOAD_SECRET=dev-secret-at-least-32-characters-long

# Optional (features will be disabled if not set)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
STRIPE_SECRET_KEY=
```

### Development Shortcuts

In development mode:
- CSRF validation bypasses localhost requests
- reCAPTCHA verification is skipped if not configured
- Rate limiting uses in-memory storage (resets on server restart)

## Common Tasks

### Adding a New Collection

1. Create collection file in `src/collections/`
2. Add to `payload.config.ts`
3. Run `npm run generate:types`
4. Create API routes if needed

### Adding a New API Route

1. Create route file in `src/app/api/`
2. Implement security pattern (see above)
3. Add rate limit config to `src/lib/constants.ts`
4. Document in `API.md`
5. Add tests

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update a specific package
npm update package-name

# Run full test suite after updates
npm run typecheck && npm run lint && npm run test:unit
```

## Questions?

- **General questions**: Open a GitHub Discussion
- **Bug reports**: Open a GitHub Issue
- **Security issues**: Email security@covidvaccineinjury.us

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
