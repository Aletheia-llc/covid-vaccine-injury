# Project Architecture Guide

A comprehensive guide to replicate this Next.js + Payload CMS + Supabase stack for future projects.

## Tech Stack Overview

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 15 (App Router) | Full-stack React framework |
| CMS | Payload CMS 3.x | Headless CMS with admin panel |
| Database | PostgreSQL (Supabase) | Managed database with connection pooling |
| Hosting | Vercel | Serverless deployment |
| Analytics | Vercel Analytics | Privacy-focused analytics |
| Styling | CSS + styled-jsx | Scoped component styles |

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (frontend)/          # Public-facing pages (route group)
│   │   │   ├── components/      # React components
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── styles.css       # Global styles
│   │   │   ├── faq/             # FAQ page
│   │   │   ├── survey/          # Survey page
│   │   │   ├── resources/       # Resources page
│   │   │   ├── privacy/         # Privacy policy
│   │   │   └── terms/           # Terms of service
│   │   ├── (payload)/           # Payload CMS admin (route group)
│   │   │   ├── admin/           # Admin panel routes
│   │   │   ├── api/             # Payload API routes
│   │   │   └── layout.tsx       # Admin layout
│   │   └── api/                 # Custom API routes
│   │       ├── contact/         # Contact form endpoint
│   │       ├── subscribe/       # Newsletter subscription
│   │       ├── survey/          # Survey submission + stats
│   │       └── representatives/ # External API proxy
│   ├── collections/             # Payload CMS collections
│   │   ├── Users.ts
│   │   ├── FAQs.ts
│   │   ├── Statistics.ts
│   │   ├── Resources.ts
│   │   ├── FormSubmissions.ts
│   │   ├── SurveyResponses.ts
│   │   ├── Subscribers.ts
│   │   └── LegalPages.ts
│   ├── components/              # Payload admin components
│   ├── lib/                     # Utility libraries
│   │   ├── auth.ts              # Admin authentication
│   │   ├── csrf.ts              # CSRF protection
│   │   ├── rate-limit.ts        # API rate limiting
│   │   └── sanitize.ts          # Input sanitization
│   ├── middleware.ts            # Security headers
│   ├── payload.config.ts        # Payload CMS configuration
│   └── payload-types.ts         # Auto-generated types
├── .env.example                 # Environment template
├── package.json
└── tsconfig.json
```

## Setup Guide

### 1. Create New Project

```bash
# Create Next.js project with Payload CMS
npx create-payload-app@latest my-project

# Select:
# - Template: blank
# - Database: postgres
```

### 2. Environment Variables

Create `.env` file:

```env
# Database (Supabase PostgreSQL)
# Use Session Pooler URL for IPv4 compatibility with Vercel
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Payload CMS Secret (generate: openssl rand -hex 32)
PAYLOAD_SECRET=your-secret-here

# Optional: Admin API key for protected endpoints
ADMIN_API_KEY=your-api-key-here
```

### 3. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings > Database > Connection string**
3. Select **Session pooler** (important for Vercel IPv4)
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

### 4. Payload CMS Configuration

```typescript
// src/payload.config.ts
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' | Your Site Name',
    },
    components: {
      // Custom admin components
      beforeDashboard: ['/components/YourDashboard'],
    },
  },
  collections: [Users, /* your collections */],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET!,
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL! },
  }),
})
```

### 5. Create Collections

Example collection with access control:

```typescript
// src/collections/SurveyResponses.ts
import type { CollectionConfig } from 'payload'

export const SurveyResponses: CollectionConfig = {
  slug: 'survey-responses',
  admin: {
    useAsTitle: 'createdAt',
    group: 'Submissions',
  },
  access: {
    create: () => true,                    // Public can submit
    read: ({ req }) => !!req.user,         // Only admins read
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: 'question1', type: 'select', options: [...] },
    { name: 'email', type: 'email' },
    { name: 'status', type: 'select', defaultValue: 'new', ... },
  ],
}
```

## Security Implementation

### Security Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  const response = NextResponse.next()
  const headers = response.headers

  // Security headers
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://va.vercel-scripts.com",
    "frame-ancestors 'none'",
  ].join('; ')
  headers.set('Content-Security-Policy', csp)

  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)'],
}
```

### Rate Limiting

```typescript
// src/lib/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  config = { windowMs: 60000, maxRequests: 10 }
) {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + config.windowMs })
    return { success: true, remaining: config.maxRequests - 1 }
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: config.maxRequests - entry.count }
}

export function getClientIP(request: Request): string {
  // Prefer Vercel's trusted header
  const vercelIP = request.headers.get('x-vercel-forwarded-for')
  if (vercelIP) return vercelIP.split(',')[0].trim()

  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP

  return 'unknown'
}
```

### CSRF Protection

```typescript
// src/lib/csrf.ts
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
  ].filter(Boolean)

  if (!origin) return true // Same-origin requests
  return allowedOrigins.includes(origin)
}
```

### Input Sanitization

```typescript
// src/lib/sanitize.ts
export function sanitizeText(input: string | undefined, maxLength = 1000): string {
  if (!input) return ''
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML
}

export function sanitizeEmail(input: string | undefined): string {
  if (!input) return ''
  const email = input.trim().toLowerCase().slice(0, 254)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) ? email : ''
}
```

### Admin Authentication

```typescript
// src/lib/auth.ts
import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers, cookies } from 'next/headers'

export async function isAdminAuthenticated(): Promise<boolean> {
  // Check API key
  const apiKey = process.env.ADMIN_API_KEY
  if (apiKey) {
    const headersList = await headers()
    if (headersList.get('x-api-key') === apiKey) return true
  }

  // Check Payload session
  try {
    const payload = await getPayload({ config })
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value
    if (token) {
      const { user } = await payload.auth({ headers: await headers() })
      if (user) return true
    }
  } catch {}

  return false
}
```

## API Route Pattern

```typescript
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateOrigin } from '@/lib/csrf'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  // CSRF check
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }

  // Rate limiting
  const clientIP = getClientIP(request)
  const rateLimit = checkRateLimit(`contact:${clientIP}`, {
    windowMs: 60000,
    maxRequests: 5,
  })
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // Parse and sanitize input
  const data = await request.json()
  const sanitized = {
    name: sanitizeText(data.name, 100),
    email: sanitizeEmail(data.email),
    message: sanitizeText(data.message, 2000),
  }

  // Validate
  if (!sanitized.email || !sanitized.message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Save to Payload
  const payload = await getPayload({ config })
  await payload.create({
    collection: 'form-submissions',
    data: sanitized,
  })

  return NextResponse.json({ success: true })
}
```

## Frontend Pattern

### Route Groups

Use route groups `(frontend)` and `(payload)` to separate concerns:

```
src/app/
├── (frontend)/     # Public site - uses public layout
│   ├── layout.tsx  # Site layout with nav, footer
│   └── page.tsx    # Homepage
└── (payload)/      # Admin panel - uses Payload layout
    └── admin/      # Admin routes
```

### Page Component Pattern

```typescript
// src/app/(frontend)/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { track } from '@vercel/analytics'

export default function HomePage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // Track page view
    track('page_viewed', { page: 'home' })
  }, [])

  return (
    <div className="container">
      {/* Your content */}
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  )
}
```

## Deployment

### Vercel Deployment

1. Connect your Git repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

Or deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Environment Variables in Vercel

Add these in Vercel Dashboard > Settings > Environment Variables:

- `DATABASE_URL` - Supabase connection string
- `PAYLOAD_SECRET` - Your secret key
- `ADMIN_API_KEY` - (Optional) For API authentication

## Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run devsafe          # Clear cache and start dev

# Build & Deploy
npm run build            # Build for production
npm run start            # Start production server
vercel --prod            # Deploy to Vercel

# Payload CMS
npm run generate:types   # Regenerate TypeScript types
npm run payload          # Payload CLI

# Testing
npm run test             # Run all tests
npm run test:int         # Integration tests
npm run test:e2e         # E2E tests
npm run lint             # Run ESLint
```

## Database Migrations

Payload handles migrations automatically. To reset:

```bash
# In Supabase SQL Editor, run:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

# Then restart your dev server to recreate tables
```

## Common Patterns

### Fetching Data Server-Side

```typescript
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function Page() {
  const payload = await getPayload({ config })
  const faqs = await payload.find({
    collection: 'faqs',
    where: { published: { equals: true } },
    sort: 'order',
  })

  return <FAQList items={faqs.docs} />
}
```

### Client-Side Form Submission

```typescript
const handleSubmit = async (data: FormData) => {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}
```

## Checklist for New Projects

- [ ] Create Supabase project and get connection string
- [ ] Generate `PAYLOAD_SECRET` with `openssl rand -hex 32`
- [ ] Set up environment variables locally and in Vercel
- [ ] Define your collections in `src/collections/`
- [ ] Register collections in `payload.config.ts`
- [ ] Create API routes with security (rate limit, CSRF, sanitization)
- [ ] Add security middleware
- [ ] Set up Vercel Analytics
- [ ] Deploy and verify admin panel works

## Resources

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
