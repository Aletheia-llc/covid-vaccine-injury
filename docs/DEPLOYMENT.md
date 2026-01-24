# Deployment Guide

This document covers deployment procedures for the U.S. COVID Vaccine Injuries application.

## Overview

| Environment | Platform | URL |
|-------------|----------|-----|
| Production | Vercel | covidvaccineinjury.us |
| Preview | Vercel | *.vercel.app |
| Development | Local | localhost:3000 |

## Vercel Deployment (Recommended)

### Initial Setup

1. **Connect Repository**

   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import the GitHub repository
   - Select the `main` branch for production

2. **Configure Build Settings**

   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm ci
   ```

3. **Configure Environment Variables**

   Add all required environment variables in Vercel dashboard under Project Settings > Environment Variables.

### Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Supabase) |
| `PAYLOAD_SECRET` | Yes | 32+ character secret for encryption |

### Recommended Environment Variables

| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 secret key |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key for donations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN |
| `SENTRY_ORG` | Sentry organization slug |
| `SENTRY_PROJECT` | Sentry project name |
| `ADMIN_API_KEY` | API key for protected endpoints |

### Automatic Deployments

Vercel automatically deploys:

- **Production**: On push to `main` branch
- **Preview**: On pull request creation/update

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Database Setup (Supabase)

### Creating a Database

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings > Database
4. Use the "Session pooler" URL for serverless (port 5432)

### Connection String Format

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

**Important**: Use the Session pooler connection (port 5432), not the Transaction pooler, for compatibility with Vercel's serverless functions.

### Database Migrations

Payload CMS handles migrations automatically on first startup. For manual migrations:

```bash
# Generate migration
npm run payload migrate:create

# Run migrations
npm run payload migrate
```

## Redis Setup (Upstash)

Redis is **strongly recommended** for production rate limiting. Without Upstash configured, rate limiting fails closed (denies all requests) in production.

### Creating a Redis Instance

1. Go to [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token
4. Add to Vercel environment variables

### Verifying Redis Connection

Check the `/api/health` endpoint:

```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "pass" },
    "environment": { "status": "pass" }
  }
}
```

### Rate Limiting Behavior

| Environment | Upstash Configured | Behavior |
|-------------|-------------------|----------|
| Production | Yes | Distributed rate limiting |
| Production | No | **Fail closed** (429 for all requests) |
| Development | Yes | Distributed rate limiting |
| Development | No | In-memory rate limiting (resets on restart) |

## Stripe Setup

### Webhook Configuration

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://covidvaccineinjury.us/api/donation-webhook`
3. Select events:
   - `checkout.session.completed`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

### Testing Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/donation-webhook

# Use the webhook signing secret from CLI output
```

## reCAPTCHA Setup

### Configuration

1. Go to [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Create a new reCAPTCHA v3 site
3. Add your domains (production + localhost for development)
4. Copy the site key and secret key

### Environment Variables

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le...  # Site key (public)
RECAPTCHA_SECRET_KEY=6Le...             # Secret key (private)
```

### Production Behavior

- **Configured**: reCAPTCHA verification required on form submissions
- **Not configured**: Form submissions return 400 error

In development, reCAPTCHA is bypassed if not configured.

## Pre-Deployment Checklist

### Before Every Deployment

- [ ] All tests pass: `npm run test:unit`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] ESLint passes: `npm run lint`
- [ ] Build succeeds locally: `npm run build`
- [ ] No console.log statements in production code
- [ ] No hardcoded secrets or API keys

### Before Production Launch

- [ ] **Database**
  - [ ] PostgreSQL connection verified
  - [ ] Database backups configured in Supabase
  - [ ] Connection pooling enabled (Session pooler)

- [ ] **Security**
  - [ ] `PAYLOAD_SECRET` is 32+ random characters
  - [ ] `ADMIN_API_KEY` is set (if using API auth)
  - [ ] **Upstash Redis configured** (critical for rate limiting)
  - [ ] reCAPTCHA keys configured

- [ ] **Payments**
  - [ ] Stripe keys are production keys (not test)
  - [ ] Webhook endpoint configured
  - [ ] Webhook secret set

- [ ] **Monitoring**
  - [ ] Sentry DSN configured
  - [ ] Vercel Analytics enabled
  - [ ] Health check endpoint accessible

- [ ] **DNS & SSL**
  - [ ] Custom domain configured in Vercel
  - [ ] SSL certificate active
  - [ ] www redirect configured

## Rollback Procedures

### Vercel Rollback

1. Go to Vercel Dashboard > Deployments
2. Find the last working deployment
3. Click "..." menu > "Promote to Production"

### Emergency Procedures

**Site is down:**
1. Check Vercel status page
2. Check database connectivity
3. Review recent deployments
4. Rollback to last working deployment

**Security incident:**
1. Rotate compromised credentials immediately
2. Review access logs
3. Check for unauthorized data access
4. Notify affected users if required

**Rate limiting blocking all requests:**
1. Verify Upstash Redis is accessible
2. Check Upstash dashboard for service status
3. If Upstash is down, deploy with emergency in-memory fallback (not recommended for extended periods)

## Monitoring

### Health Check

The `/api/health` endpoint provides system status:

```bash
curl https://covidvaccineinjury.us/api/health
```

Response meanings:

| Status | Meaning |
|--------|---------|
| `healthy` | All services operational |
| `degraded` | Optional services missing (Stripe, reCAPTCHA, etc.) |
| `unhealthy` | Required services failing (database, secrets) |

### Vercel Monitoring

- **Analytics**: Vercel Dashboard > Analytics
- **Logs**: Vercel Dashboard > Deployments > Functions
- **Errors**: Sentry Dashboard

### Alerts

Configure alerts in:

1. **Vercel**: Project Settings > Notifications
2. **Sentry**: Project Settings > Alerts
3. **Upstash**: Console > Alerts

## Performance Optimization

### Build Optimization

The build is configured for optimal performance:

```javascript
// next.config.mjs
experimental: {
  optimizePackageImports: ['lucide-react', 'recharts'],
}
```

### Memory Settings

```bash
# Build with increased memory (8GB)
NODE_OPTIONS="--max-old-space-size=8000" npm run build
```

### Caching

- **Static pages**: Cached at edge by Vercel
- **API routes**: No caching by default
- **Representatives data**: 24-hour server-side cache

### Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true npm run build
```

## Troubleshooting

### Build Fails

**"Cannot find module"**
- Check that all dependencies are in `package.json`
- Run `npm ci` to clean install
- Clear `.next` folder and rebuild

**"Out of memory"**
- Build uses `--max-old-space-size=8000`
- If still failing, check for circular dependencies

**"MODULE_NOT_FOUND" with webpack**
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`

### Runtime Errors

**"PAYLOAD_SECRET is required"**
- Ensure environment variable is set in Vercel
- Check for typos in variable name

**"Rate limit: Upstash not configured" (in production)**
- This is a critical error in production
- Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- All requests will be denied until configured

**Database connection errors**
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure using Session pooler connection string
- Verify IP allowlist in Supabase (if configured)

### Webhook Issues

**Stripe webhooks failing**
- Verify webhook URL is correct
- Check webhook secret matches
- Review Stripe webhook logs
- Ensure endpoint returns 200 within timeout

## Environment-Specific Configuration

### Development

```bash
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/covidvaccineinjury
PAYLOAD_SECRET=dev-secret-32-characters-minimum

# Optional - bypassed in development if not set
UPSTASH_REDIS_REST_URL=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
```

### Preview (Vercel)

Uses same configuration as production but with preview URLs. Automatically deployed on PRs.

### Production

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...supabase.com/postgres
PAYLOAD_SECRET=<generated-secret>
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<key>
RECAPTCHA_SECRET_KEY=<secret>
# ... all other production credentials
```

## Support

- **Vercel Issues**: [vercel.com/support](https://vercel.com/support)
- **Supabase Issues**: [supabase.com/support](https://supabase.com/support)
- **Application Issues**: [GitHub Issues](https://github.com/Aletheia-llc/covid-vaccine-injury/issues)
