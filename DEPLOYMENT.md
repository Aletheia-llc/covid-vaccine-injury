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
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token |

*Note: Upstash Redis is recommended for production but not required. Rate limiting falls back to in-memory storage in development and fails gracefully in production.*

### Recommended Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 secret key |
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
4. Use the "Connection pooling" URL for serverless

### Connection String Format

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Database Migrations

Payload CMS handles migrations automatically on first startup. For manual migrations:

```bash
# Generate migration
npm run payload migrate:create

# Run migrations
npm run payload migrate
```

## Redis Setup (Upstash) - Optional

Redis is recommended for production rate limiting but not required. Without it, the application will log warnings but continue to function.

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
    "required": { "configured": 2, "total": 2 },
    "optional": { "configured": 5, "total": 5 }
  }
}
```

If status is "degraded", optional services are missing.
If status is "unhealthy", required services are missing.

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

## Pre-Deployment Checklist

### Before Every Deployment

- [ ] All tests pass: `npm run test:unit && npm run test:e2e`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] ESLint passes: `npm run lint`
- [ ] Build succeeds locally: `npm run build`
- [ ] No console.log statements in production code
- [ ] No hardcoded secrets or API keys

### Before Production Launch

- [ ] **Database**
  - [ ] PostgreSQL connection verified
  - [ ] Database backups configured
  - [ ] Connection pooling enabled

- [ ] **Security**
  - [ ] `PAYLOAD_SECRET` is 32+ random characters
  - [ ] `ADMIN_API_KEY` is set (if using API auth)
  - [ ] Upstash Redis configured for rate limiting (recommended)
  - [ ] reCAPTCHA keys configured (recommended)

- [ ] **Payments**
  - [ ] Stripe keys are production keys (not test)
  - [ ] Webhook endpoint configured
  - [ ] Webhook secret set

- [ ] **Monitoring**
  - [ ] Sentry DSN configured
  - [ ] Vercel Analytics enabled
  - [ ] Health check endpoint accessible

- [ ] **DNS & SSL**
  - [ ] Custom domain configured
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

**"Out of memory"**
- Build uses `--max-old-space-size=8000`
- If still failing, check for circular dependencies

### Runtime Errors

**"PAYLOAD_SECRET is required"**
- Ensure environment variable is set in Vercel
- Check for typos in variable name

**"Rate limit: Upstash not configured"**
- This is a warning, not an error
- Add Upstash credentials for optimal rate limiting
- Without Upstash, rate limiting falls back gracefully

**Database connection errors**
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure connection pooling is enabled

### Webhook Issues

**Stripe webhooks failing**
- Verify webhook URL is correct
- Check webhook secret matches
- Review Stripe webhook logs
- Ensure endpoint returns 200

## Environment-Specific Configuration

### Development

```bash
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/covidvaccineinjury
PAYLOAD_SECRET=dev-secret-32-characters-minimum
```

### Preview (Vercel)

Uses same configuration as production but with preview URLs.

### Production

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...supabase.com/postgres
PAYLOAD_SECRET=<generated-secret>
UPSTASH_REDIS_REST_URL=https://...upstash.io
# ... all other production credentials
```

## Support

- **Vercel Issues**: [vercel.com/support](https://vercel.com/support)
- **Supabase Issues**: [supabase.com/support](https://supabase.com/support)
- **Application Issues**: [GitHub Issues](https://github.com/Aletheia-llc/covid-vaccine-injury/issues)
