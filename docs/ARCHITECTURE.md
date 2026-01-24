# Architecture Guide

A comprehensive guide to the U.S. COVID Vaccine Injuries application architecture.

## Tech Stack Overview

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js (App Router) | 15.4.10 | Full-stack React framework |
| CMS | Payload CMS | 3.72.0 | Headless CMS with admin panel |
| Database | PostgreSQL (Supabase) | - | Managed database with connection pooling |
| Cache | Upstash Redis | - | Distributed rate limiting |
| Hosting | Vercel | - | Serverless deployment |
| Analytics | Vercel Analytics | 1.6.1 | Privacy-focused analytics |
| Error Tracking | Sentry | 10.36.0 | Error monitoring |
| Payments | Stripe | 20.2.0 | Payment processing |
| Testing | Vitest + Playwright | 3.2.3 / 1.56.1 | Unit and E2E testing |

## Project Structure

```
src/
├── app/
│   ├── (frontend)/              # Public-facing pages (route group)
│   │   ├── components/          # React components
│   │   │   ├── Header.tsx           # Navigation header
│   │   │   ├── Footer.tsx           # Footer with legal disclaimer
│   │   │   ├── CookieConsent.tsx    # GDPR cookie consent
│   │   │   ├── AnalyticsWrapper.tsx # Conditional analytics
│   │   │   └── CICPRoulette.tsx     # Interactive roulette game
│   │   ├── page.tsx             # Homepage
│   │   ├── layout.tsx           # Root layout
│   │   ├── styles.css           # Global styles
│   │   ├── donate/              # Donation pages
│   │   │   ├── page.tsx
│   │   │   └── thank-you/
│   │   ├── survey/              # Survey page
│   │   ├── faq/                 # FAQ page
│   │   ├── resources/           # Resources page
│   │   ├── roulette/            # CICP Roulette page
│   │   ├── privacy/             # Privacy policy
│   │   └── terms/               # Terms of service
│   ├── (payload)/               # Payload CMS admin (route group)
│   │   ├── admin/               # Admin panel routes
│   │   └── layout.tsx           # Admin layout
│   └── api/                     # API routes
│       ├── csrf/                # CSRF token endpoint
│       ├── health/              # Health check
│       ├── contact/             # Contact form
│       ├── subscribe/           # Newsletter subscription
│       ├── survey/              # Survey endpoints
│       │   ├── route.ts         # Submit survey
│       │   ├── stats/           # Survey statistics
│       │   └── export/          # CSV export
│       ├── checkout/            # Stripe checkout
│       ├── donation-webhook/    # Stripe webhook
│       ├── representatives/     # Legislator lookup
│       └── statistics/          # Public stats API
├── collections/                 # Payload CMS collections
│   ├── Users.ts
│   ├── FAQs.ts
│   ├── Statistics.ts
│   ├── Resources.ts
│   ├── FormSubmissions.ts
│   ├── SurveyResponses.ts
│   ├── Subscribers.ts
│   ├── LegalPages.ts
│   └── Media.ts
├── components/                  # Shared components
│   └── DonationForm.tsx
├── hooks/                       # React hooks
│   └── useAnimations.ts
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Admin authentication
│   ├── constants.ts             # Centralized configuration
│   ├── csrf.ts                  # CSRF protection (server)
│   ├── csrf-client.ts           # CSRF helpers (client)
│   ├── env-validation.ts        # Environment validation
│   ├── error-reporting.ts       # Sentry integration
│   ├── logger.ts                # Structured logging (Pino)
│   ├── n8n.ts                   # N8N workflow integration
│   ├── rate-limit.ts            # Rate limiting
│   ├── recaptcha.ts             # reCAPTCHA verification
│   ├── sanitize.ts              # Input sanitization
│   └── validation.ts            # Input validation
├── middleware.ts                # Security headers
├── payload.config.ts            # Payload CMS configuration
└── payload-types.ts             # Auto-generated types
```

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Request                            │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Vercel Edge         │ Geographic routing, DDoS protection    │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Middleware          │ Security headers (CSP, HSTS, etc.)     │
│     middleware.ts       │ X-Frame-Options, X-Content-Type-Options│
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. CSRF Validation     │ Token + cookie double-submit pattern   │
│     lib/csrf.ts         │ HMAC-SHA256 signatures, 1-hour expiry  │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Rate Limiting       │ Per-IP limits via Upstash Redis        │
│     lib/rate-limit.ts   │ Fail-closed in production              │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. reCAPTCHA           │ Bot detection (score >= 0.7)           │
│     lib/recaptcha.ts    │ Required in production                 │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. Input Validation    │ Type checking, field validation        │
│     lib/validation.ts   │ Reject invalid data early              │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. Input Sanitization  │ XSS prevention, HTML removal           │
│     lib/sanitize.ts     │ Safe defaults for all inputs           │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. Business Logic      │ Application-specific processing        │
│     API route handlers  │ Payload CMS operations                 │
└─────────────────────────┴───────────────────────────────────────┘
```

### CSRF Protection

Token-based CSRF with double-submit cookie pattern:

```typescript
// 1. Client fetches token (also sets httpOnly cookie)
GET /api/csrf → { csrfToken: "timestamp.random.signature" }
                 Set-Cookie: csrf_token=timestamp.random.signature; HttpOnly; Secure; SameSite=Strict

// 2. Client sends token in header + cookie automatically included
POST /api/survey
Headers: { "x-csrf-token": "timestamp.random.signature" }
Cookie: csrf_token=timestamp.random.signature

// 3. Server validates:
//    - Token in header matches token in cookie
//    - Both tokens have valid HMAC signatures
//    - Tokens are not expired (1 hour)
```

### Rate Limiting

```typescript
// Centralized configuration in lib/constants.ts
export const RATE_LIMITS = {
  SURVEY:         { windowMs: 1 hour,   maxRequests: 5  },
  CONTACT:        { windowMs: 1 hour,   maxRequests: 5  },
  SUBSCRIBE:      { windowMs: 1 hour,   maxRequests: 10 },
  CHECKOUT:       { windowMs: 1 minute, maxRequests: 10 },
  CSRF:           { windowMs: 1 minute, maxRequests: 30 },
  HEALTH:         { windowMs: 1 minute, maxRequests: 100 },
  REPRESENTATIVES:{ windowMs: 1 hour,   maxRequests: 30 },
}
```

**Fail-Closed Behavior:**
- Production without Upstash: Requests are **denied** (429)
- Development/CI: Falls back to in-memory storage

### Request Size Limits

```typescript
export const REQUEST_SIZE_LIMITS = {
  CHECKOUT:  1 * 1024,   // 1KB
  SUBSCRIBE: 4 * 1024,   // 4KB
  SURVEY:    16 * 1024,  // 16KB
  CONTACT:   16 * 1024,  // 16KB
  WEBHOOK:   64 * 1024,  // 64KB
}
```

## API Route Pattern

All POST endpoints follow this security pattern:

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { createRequestLogger } from '@/lib/logger'
import { RATE_LIMITS, REQUEST_SIZE_LIMITS } from '@/lib/constants'

export async function POST(request: NextRequest) {
  // 1. Generate request ID for tracing
  const requestId = crypto.randomUUID()
  const log = createRequestLogger({ requestId, path: '/api/example', method: 'POST' })

  // 2. CSRF validation (token-based)
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
  if (contentLength && parseInt(contentLength, 10) > REQUEST_SIZE_LIMITS.EXAMPLE) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })
  }

  // 4. Rate limiting
  const clientIP = getClientIP(request)
  const rateLimit = await checkRateLimit(`example:${clientIP}`, RATE_LIMITS.EXAMPLE)
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

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Vercel    │────▶│  Supabase   │
│             │     │   (Edge)    │     │  (Postgres) │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  reCAPTCHA  │     │   Upstash   │     │   Stripe    │
│  (Google)   │     │   (Redis)   │     │  (Payments) │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│   Sentry    │
│  (Errors)   │
└─────────────┘
```

**Request Flow:**

1. Browser sends request to Vercel edge
2. Middleware adds security headers
3. API route validates CSRF token
4. Rate limiter checks Upstash Redis
5. reCAPTCHA verifies human user
6. Handler validates and sanitizes input
7. Data persisted to Supabase via Payload CMS
8. Response returned with X-Request-ID header

## Caching Strategy

### Static Assets

Next.js automatically caches static assets at the edge:

- **Images**: Optimized and cached via `next/image`
- **CSS/JS**: Hashed filenames, immutable caching
- **Fonts**: Preloaded and cached

### API Route Caching

| Endpoint | Cache Strategy |
|----------|---------------|
| `/api/health` | No cache (real-time status) |
| `/api/csrf` | No cache (unique per request) |
| `/api/representatives` | 24-hour server-side cache |
| `/api/statistics` | No cache (real-time data) |
| Form submissions | No cache |

### Page Caching

- **Static pages** (FAQ, Privacy, Terms): Generated at build time, cached at edge
- **Dynamic pages** (Resources): Server-rendered with data fetching
- **Admin pages**: Never cached

## Logging

Structured logging via Pino:

```typescript
import { log, createRequestLogger } from '@/lib/logger'

// Global logger
log.info('app_started', { version: '1.0.0' })
log.error('database_error', { error: err.message })
log.security('rate_limit_exceeded', { ip: clientIP })

// Request-scoped logger (includes requestId)
const routeLog = createRequestLogger({ requestId, path, method })
routeLog.info('request_received', { body: sanitizedBody })
routeLog.warn('validation_failed', { field: 'email' })
```

## Error Handling

### Error Reporting (Sentry)

```typescript
import { reportError } from '@/lib/error-reporting'

try {
  await riskyOperation()
} catch (error) {
  reportError(error, {
    action: 'riskyOperation',
    userId: user?.id,
  })
}
```

### Error Response Format

```json
{
  "error": "Human-readable error message"
}
```

All responses include `X-Request-ID` header for correlation.

## Authentication

### Admin Authentication

Two methods supported:

1. **Session Cookie**: Via Payload CMS admin login (`payload-token` cookie)
2. **API Key**: Via `x-api-key` header (for programmatic access)

```typescript
// src/lib/auth.ts
export async function isAdminAuthenticated(): Promise<boolean> {
  // Check API key first (for programmatic access)
  const apiKey = process.env.ADMIN_API_KEY
  if (apiKey) {
    const headersList = await headers()
    const providedKey = headersList.get('x-api-key')
    if (providedKey && timingSafeEqual(providedKey, apiKey)) {
      return true
    }
  }

  // Check Payload session (for admin panel users)
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return !!user
}
```

## Environment Configuration

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | 32+ character encryption secret |

### Production Recommended

| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Rate limiting backend |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash authentication |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA site key |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA secret |

### Optional

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification |
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking |
| `ADMIN_API_KEY` | Programmatic admin access |

## Database Schema

Managed by Payload CMS. Collections map to PostgreSQL tables:

| Collection | Table | Description |
|------------|-------|-------------|
| Users | `users` | Admin accounts |
| FAQs | `faqs` | FAQ content |
| Statistics | `statistics` | CICP/VICP data |
| Resources | `resources` | External links |
| SurveyResponses | `survey_responses` | Survey submissions |
| FormSubmissions | `form_submissions` | Contact forms |
| Subscribers | `subscribers` | Newsletter list |
| LegalPages | `legal_pages` | Privacy/Terms |
| Media | `media` | Uploaded files |

## Performance Optimizations

### Build Configuration

```javascript
// next.config.mjs
experimental: {
  optimizePackageImports: ['lucide-react', 'recharts'],
}
```

### Memory Settings

```bash
# Build with increased memory
NODE_OPTIONS="--max-old-space-size=8000" npm run build
```

### Bundle Analysis

```bash
ANALYZE=true npm run build
```

## Monitoring

### Health Check

```bash
curl https://covidvaccineinjury.us/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "checks": {
    "database": { "status": "pass" },
    "environment": { "status": "pass" }
  }
}
```

### Dashboards

- **Vercel**: Analytics, function logs, deployment status
- **Sentry**: Error tracking, performance monitoring
- **Upstash**: Redis metrics, rate limit statistics
- **Stripe**: Payment dashboard, webhook logs

## Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run devsafe          # Clear cache and start dev

# Build & Deploy
npm run build            # Build for production
npm run start            # Start production server
vercel --prod            # Deploy to Vercel

# Testing
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests
npm run typecheck        # TypeScript validation
npm run lint             # ESLint

# Payload CMS
npm run generate:types   # Regenerate TypeScript types
npm run payload          # Payload CLI
npm run seed             # Seed database
```
