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
export async function POST(request: NextRequest) {
  // 1. CSRF protection
  if (!validateOrigin(request)) {
    return csrfErrorResponse()
  }

  // 2. Rate limiting
  const clientIP = getClientIP(request)
  const rateLimit = await checkRateLimit(`endpoint:${clientIP}`, config)
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // 3. Parse and validate input
  const body = await request.json()

  // 4. Sanitize user input
  const sanitizedData = sanitizeInput(body)

  // 5. Business logic
  // ...

  // 6. Return response
  return NextResponse.json({ success: true })
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
import { log } from '@/lib/logger'

// Good
log.info('survey_submitted', { zipCode, questionCount: 9 })
log.error('database_error', { error: err.message })

// Bad
console.log('Survey submitted')
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

## Pull Request Guidelines

### Before Submitting

- [ ] All checks pass (`npm run typecheck && npm run lint && npm run test:unit`)
- [ ] Code follows the style guidelines
- [ ] New features have tests
- [ ] Documentation is updated if needed

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
2. Email the maintainers directly
3. Include steps to reproduce
4. Allow time for a fix before disclosure

### Security Checklist

When making changes that handle user input:

- [ ] Input is sanitized before use
- [ ] Output is escaped when rendered
- [ ] Rate limiting is in place
- [ ] CSRF protection is verified
- [ ] No sensitive data in logs

## Questions?

- **General questions**: Open a GitHub Discussion
- **Bug reports**: Open a GitHub Issue
- **Security issues**: Email maintainers directly

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
