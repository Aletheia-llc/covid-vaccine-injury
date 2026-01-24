# Replication Guide

This guide explains how to use this codebase as a template for building similar advocacy/data-driven websites.

## What You Get

This template provides a production-ready stack for building:
- Data-driven advocacy websites
- Survey/feedback collection platforms
- Donation-enabled cause marketing sites
- CMS-powered content sites

### Features Included

| Feature | Description |
|---------|-------------|
| **CMS** | Payload CMS admin panel with PostgreSQL |
| **Security** | CSRF, rate limiting, sanitization, reCAPTCHA |
| **Forms** | Contact, survey, and newsletter forms |
| **Payments** | Stripe donations (one-time & recurring) |
| **Analytics** | Vercel + Google Analytics with consent |
| **Testing** | Unit tests (Vitest) + E2E tests (Playwright) |
| **Logging** | Structured logging with Pino |
| **Errors** | Sentry error tracking |

---

## Quick Start

### 1. Clone and Rename

```bash
# Clone the repository
git clone <repo-url> my-new-project
cd my-new-project

# Remove git history and start fresh
rm -rf .git
git init

# Update package.json
# Change "name" to your project name
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

**Using Supabase (recommended):**

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database > Connection string
4. Copy the "Session mode" connection string
5. Add to `.env`:
   ```
   DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

**Using local PostgreSQL:**
```
DATABASE_URL=postgresql://localhost:5432/myproject
```

### 4. Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
# At minimum, set:
# - DATABASE_URL
# - PAYLOAD_SECRET (generate with: openssl rand -hex 32)
```

### 5. Start Development

```bash
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## Customization Guide

### Step 1: Update Branding

**Files to modify:**

1. **`src/app/(frontend)/layout.tsx`**
   - Update `metadata` (title, description, OpenGraph)
   - Change favicon/icon
   - Update canonical URL

2. **`src/app/(frontend)/components/Header.tsx`**
   - Change logo text and icon
   - Update navigation links

3. **`src/app/(frontend)/components/Footer.tsx`**
   - Update footer text
   - Change citations/sources
   - Update attribution link

4. **`src/app/(frontend)/styles.css`**
   - Update CSS variables for colors:
   ```css
   :root {
     --bg: #0f172a;        /* Background */
     --text: #f1f5f9;      /* Text */
     --accent: #d4a84b;    /* Accent/highlight */
     --danger: #ef4444;    /* Danger/negative */
     --success: #22c55e;   /* Success/positive */
     --navy: #1e3a5f;      /* Secondary */
   }
   ```

5. **`src/components/AdminLogo.tsx`** and **`AdminIcon.tsx`**
   - Update Payload CMS admin branding

### Step 2: Configure Collections

The CMS collections are in `src/collections/`. Modify based on your needs:

**Keep as-is:**
- `Users.ts` - Admin authentication
- `FormSubmissions.ts` - Contact form
- `Subscribers.ts` - Newsletter

**Customize:**
- `Statistics.ts` - Rename or restructure for your data
- `FAQs.ts` - Keep structure, update content
- `Resources.ts` - Adapt for your resource types
- `SurveyResponses.ts` - Customize questions

**Example: Creating a new collection**

```typescript
// src/collections/Articles.ts
import type { CollectionConfig } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'createdAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true },
    { name: 'content', type: 'richText' },
    { name: 'excerpt', type: 'textarea' },
    { name: 'status', type: 'select', options: ['draft', 'published'] },
    { name: 'publishedAt', type: 'date' },
  ],
}
```

Then register in `src/payload.config.ts`:
```typescript
import { Articles } from './collections/Articles'

export default buildConfig({
  collections: [Users, Articles, /* ... */],
})
```

### Step 3: Create Your Pages

**Homepage: `src/app/(frontend)/page.tsx`**

This is a large file. You can either:
1. Modify existing sections
2. Replace entirely with your content
3. Break into smaller components

**Key sections to customize:**
- Hero section (headline, stats, CTAs)
- Data visualizations
- Calculator sections
- Action/contact section
- Subscribe section

**Adding a new page:**

```typescript
// src/app/(frontend)/about/page.tsx
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: 'About Us | My Site',
  description: 'Learn about our mission',
}

export default function AboutPage() {
  return (
    <>
      <Header activePage="about" />
      <main>
        <h1>About Us</h1>
        {/* Your content */}
      </main>
      <Footer />
    </>
  )
}
```

### Step 4: Customize API Routes

**Available routes to customize:**

| Route | Purpose | Customize? |
|-------|---------|------------|
| `/api/csrf` | CSRF tokens | Keep as-is |
| `/api/health` | Health check | Keep as-is |
| `/api/contact` | Contact form | Modify fields |
| `/api/subscribe` | Newsletter | Keep as-is |
| `/api/survey` | Survey submission | Customize questions |
| `/api/checkout` | Stripe payments | Modify product details |
| `/api/representatives` | Rep lookup | Replace or remove |
| `/api/statistics` | CMS data API | Customize query |

**Example: Modifying contact form**

```typescript
// src/app/api/contact/route.ts

// Update the SubjectType
type SubjectType = 'general' | 'support' | 'partnership' | 'other'

// Update validation
const validSubjects: SubjectType[] = ['general', 'support', 'partnership', 'other']
```

### Step 5: Update Survey Questions

1. **Collection schema** (`src/collections/SurveyResponses.ts`):
   ```typescript
   fields: [
     {
       name: 'q1',
       type: 'select',
       label: 'Your first question?',
       options: [
         { label: 'Option A', value: 'a' },
         { label: 'Option B', value: 'b' },
       ],
     },
     // Add more questions
   ]
   ```

2. **API validation** (`src/app/api/survey/route.ts`):
   ```typescript
   const validQ1 = ['a', 'b'] as const
   ```

3. **Frontend form** (`src/app/(frontend)/survey/page.tsx`):
   - Update question text and options
   - Match field names to collection

### Step 6: Configure Payments (Optional)

**To enable donations:**

1. Create Stripe account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard > Developers > API keys
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. Set up webhook:
   - Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/donation-webhook`
   - Select event: `checkout.session.completed`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

**To customize donation options:**

Edit `src/components/DonationForm.tsx`:
```typescript
const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000]
```

Edit `src/app/api/checkout/route.ts`:
```typescript
product_data: {
  name: 'Donation - Your Organization',
  description: 'Your donation supports our mission.',
},
```

### Step 7: Set Up Production Services

**Required:**
- Supabase (or other PostgreSQL)
- Vercel (or other Node.js host)

**Recommended:**
- Upstash Redis (rate limiting)
- reCAPTCHA v3 (bot protection)

**Optional:**
- Stripe (payments)
- Sentry (error tracking)
- n8n (workflow automation)

---

## File Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment variable template |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `next.config.mjs` | Next.js configuration |
| `payload.config.ts` | Payload CMS configuration |
| `playwright.config.ts` | E2E test configuration |
| `vitest.config.ts` | Unit test configuration |

### Key Source Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Security headers |
| `src/lib/constants.ts` | App-wide constants |
| `src/lib/rate-limit.ts` | Rate limiting logic |
| `src/lib/csrf.ts` | CSRF protection |
| `src/lib/sanitize.ts` | Input sanitization |
| `src/lib/logger.ts` | Structured logging |
| `src/hooks/useStatistics.ts` | CMS data hook |

### Removing Features

**To remove donations:**
1. Delete `src/app/(frontend)/donate/`
2. Delete `src/app/api/checkout/`
3. Delete `src/app/api/donation-webhook/`
4. Delete `src/components/DonationForm.tsx`
5. Remove Stripe from `package.json`
6. Remove donate link from Header

**To remove survey:**
1. Delete `src/app/(frontend)/survey/`
2. Delete `src/app/api/survey/`
3. Delete `SurveyResponses` collection
4. Remove from `payload.config.ts`

**To remove representative lookup:**
1. Delete `src/app/api/representatives/`
2. Remove action section from homepage

---

## Deployment Checklist

### Pre-Deployment

- [ ] Update all branding (logo, colors, text)
- [ ] Configure all environment variables
- [ ] Update legal pages (privacy, terms)
- [ ] Remove or customize example content
- [ ] Run `npm run build` successfully
- [ ] Run `npm run test` successfully

### Production Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=your-secret-here

# Recommended
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...

# Optional (if using features)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...
```

### Post-Deployment

- [ ] Create admin user at `/admin`
- [ ] Seed initial content via CMS
- [ ] Run `supabase/enable-rls.sql` in database
- [ ] Test all forms
- [ ] Set up Stripe webhook (if using)
- [ ] Configure custom domain

---

## Architecture Decisions

### Why This Stack?

| Choice | Reasoning |
|--------|-----------|
| **Next.js 15** | SSR, API routes, great DX |
| **Payload CMS** | TypeScript-native, self-hosted, flexible |
| **PostgreSQL** | Reliable, Payload-supported, free tier on Supabase |
| **Upstash Redis** | Serverless-friendly rate limiting |
| **Custom CSS** | No framework bloat, full control |
| **Vitest + Playwright** | Fast unit tests, reliable E2E |

### Security by Default

This template implements security best practices:

1. **Fail-closed rate limiting** - Denies requests if Redis unavailable in production
2. **CSRF on all forms** - Signed tokens with HMAC-SHA256
3. **Input sanitization** - XSS prevention on all user input
4. **Content Security Policy** - Strict CSP headers
5. **Request tracing** - Correlation IDs for debugging

### Performance Considerations

1. **Server-side rendering** - Better SEO, faster initial load
2. **No client-side state library** - Reduces bundle size
3. **Single CSS file** - No CSS-in-JS overhead
4. **Font preloading** - Faster text rendering

---

## Common Customizations

### Adding Authentication

To add user authentication (beyond admin):

1. Use Payload's built-in auth for the Users collection
2. Or integrate NextAuth.js for OAuth providers
3. Or use Supabase Auth

### Adding Email Notifications

1. Install nodemailer or use Resend
2. Add email sending in API routes
3. Or use n8n webhooks for email workflows

### Adding Search

1. Use Payload's built-in search
2. Or integrate Algolia/Meilisearch
3. Or use PostgreSQL full-text search

### Adding Multi-language

1. Use Next.js internationalization
2. Add locale fields to Payload collections
3. Or use a translation service API

---

## Support

- **Issues**: Open on GitHub
- **Documentation**: See `/docs` folder
- **Payload CMS**: [payloadcms.com/docs](https://payloadcms.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
