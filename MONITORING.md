# Monitoring & Observability Guide

This document describes the monitoring, logging, and alerting setup for the U.S. COVID Vaccine Injuries application.

## Overview

| Component | Tool | Purpose |
|-----------|------|---------|
| Error Tracking | Sentry | Exception monitoring and alerting |
| Analytics | Vercel Analytics | Privacy-focused user analytics |
| Logging | Pino + Vercel Logs | Structured application logs |
| Health Checks | `/api/health` | Service availability monitoring |
| Uptime | Vercel (built-in) | Deployment and availability |

## Health Check Endpoint

The `/api/health` endpoint provides real-time system status.

### Usage

```bash
curl https://covidvaccineinjury.us/api/health
```

### Response Format

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.1.0",
  "checks": {
    "database": { "status": "pass" },
    "environment": { "status": "pass" }
  },
  "services": {
    "database": true,
    "redis": true,
    "recaptcha": true,
    "stripe": true,
    "sentry": true
  }
}
```

### Status Values

| Status | Meaning | Action |
|--------|---------|--------|
| `healthy` | All required services operational | None |
| `degraded` | Optional services missing | Review optional service config |
| `unhealthy` | Required services failing | Immediate investigation required |

### Recommended Monitoring

Set up external monitoring to ping `/api/health` every 5 minutes:

- **Uptime Robot**: Free tier available
- **Pingdom**: More detailed analytics
- **Better Uptime**: Incident management included

## Logging

### Structured Logging with Pino

All logs use structured JSON format via Pino:

```typescript
import { log } from '@/lib/logger'

// Info level
log.info('survey_submitted', { zipCode: '90210', questionCount: 9 })

// Warning level
log.warn('rate_limit_approaching', { identifier: 'ip:1.2.3.4', remaining: 2 })

// Error level
log.error('database_error', { error: err.message, stack: err.stack })

// Security events
log.security('csrf_validation_failed', { ip: clientIP, path: '/api/survey' })
```

### Log Format

```json
{
  "level": "info",
  "time": 1705312200000,
  "msg": "survey_submitted",
  "zipCode": "90210",
  "questionCount": 9,
  "requestId": "abc-123-def"
}
```

### Log Levels

| Level | Usage |
|-------|-------|
| `error` | Exceptions, failures requiring attention |
| `warn` | Potential issues, degraded functionality |
| `info` | Normal operations, business events |
| `debug` | Detailed debugging (development only) |
| `security` | Security-related events (custom level) |

### Viewing Logs

**Vercel Dashboard:**
1. Go to Project > Deployments
2. Click on a deployment
3. Select "Functions" tab
4. Click on a function to see logs

**Vercel CLI:**
```bash
vercel logs --follow
```

### Security Event Logging

Security events are logged with the `security` level:

| Event | Description |
|-------|-------------|
| `csrf_validation_failed` | Invalid or missing CSRF token |
| `rate_limit_exceeded` | IP exceeded request limit |
| `invalid_api_key` | Failed API key authentication |
| `recaptcha_failed` | Low reCAPTCHA score (possible bot) |
| `suspicious_input` | Input failed sanitization |

## Error Tracking (Sentry)

### Setup

1. Create a project at [sentry.io](https://sentry.io)
2. Add environment variables:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   SENTRY_ORG=your-org
   SENTRY_PROJECT=covid-vaccine-injury
   ```

### What's Tracked

- Unhandled exceptions
- API route errors
- Client-side errors
- Performance metrics

### Alerting Rules

Configure these alerts in Sentry Dashboard:

| Alert | Condition | Action |
|-------|-----------|--------|
| High Error Rate | >10 errors/hour | Email + Slack |
| New Error Type | First occurrence | Email |
| Performance Regression | p95 > 3s | Email |

### Ignoring Known Errors

Some errors are expected and should be ignored:

```typescript
// sentry.client.config.ts
Sentry.init({
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Network request failed',
  ],
})
```

## Analytics (Vercel Analytics)

### Privacy-First Analytics

Vercel Analytics provides:
- No cookies required
- GDPR compliant
- No PII collection
- Aggregated data only

### Metrics Available

- Page views
- Unique visitors
- Top pages
- Geographic distribution
- Device types
- Performance metrics (Web Vitals)

### Custom Events

Track custom events using `@vercel/analytics`:

```typescript
import { track } from '@vercel/analytics'

// Track survey completion
track('survey_completed', {
  questionCount: 9,
  hasEmail: true,
})

// Track donation
track('donation_started', {
  amount: 50,
  recurring: false,
})
```

### Viewing Analytics

1. Go to Vercel Dashboard
2. Select your project
3. Click "Analytics" tab

## Performance Monitoring

### Web Vitals

Monitor Core Web Vitals via Vercel Analytics:

| Metric | Target | Description |
|--------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| TTFB | < 800ms | Time to First Byte |

### API Response Times

Track API latency in logs:

```typescript
const start = Date.now()
// ... handle request
log.info('api_response', {
  path: '/api/survey',
  method: 'POST',
  duration: Date.now() - start,
  status: 200,
})
```

## Alerting

### Recommended Alert Configuration

**Critical (Immediate Response):**
- Health check returns `unhealthy`
- Error rate > 50/hour
- Database connection failures

**Warning (Review within 1 hour):**
- Health check returns `degraded`
- Error rate > 10/hour
- High rate limit hits

**Informational (Daily review):**
- New error types
- Unusual traffic patterns

### Alert Channels

Configure alerts in:

1. **Sentry**: Project Settings > Alerts
2. **Vercel**: Project Settings > Notifications
3. **Upstash**: Console > Alerts (for Redis)

## Dashboards

### Recommended Dashboard Layout

**Overview Panel:**
- Current health status
- Error count (last hour)
- Active users
- API response time (p95)

**Traffic Panel:**
- Requests per minute
- Top endpoints
- Geographic distribution

**Errors Panel:**
- Error rate over time
- Top error types
- Recent errors

### Tools

- **Vercel Dashboard**: Built-in analytics and logs
- **Sentry Dashboard**: Error tracking and performance
- **Grafana**: Custom dashboards (if needed)

## Runbook

### Health Check Failed

1. Check Vercel deployment status
2. Verify database connectivity (Supabase dashboard)
3. Review recent deployments
4. Check Sentry for errors
5. Rollback if necessary

### High Error Rate

1. Check Sentry for error details
2. Identify affected endpoints
3. Review recent changes
4. Check external service status (Stripe, Google APIs)
5. Implement fix or rollback

### Database Issues

1. Check Supabase dashboard for status
2. Verify connection pool isn't exhausted
3. Review slow query logs
4. Check disk space usage
5. Contact Supabase support if needed

### Rate Limit Alerts

1. Check if it's a legitimate traffic spike
2. Look for bot patterns (same IP, rapid requests)
3. Consider adjusting rate limits if legitimate
4. Block malicious IPs if necessary

## Maintenance Windows

### Planned Maintenance

1. Announce maintenance 24 hours in advance
2. Enable maintenance mode if needed
3. Perform updates during low-traffic hours (2-5 AM EST)
4. Monitor closely after changes
5. Announce completion

### Emergency Maintenance

1. Assess severity and impact
2. Communicate status to stakeholders
3. Implement fix
4. Post-incident review within 48 hours

## Compliance Logging

### Data Access Logging

Log all access to sensitive data:

```typescript
log.info('data_access', {
  collection: 'survey-responses',
  action: 'read',
  user: adminUser.id,
  recordCount: 100,
})
```

### Audit Trail Requirements

Maintain logs for:
- Admin logins
- Data exports
- Configuration changes
- User data deletion requests

### Log Retention

| Log Type | Retention |
|----------|-----------|
| Application logs | 30 days (Vercel) |
| Security logs | 90 days |
| Audit logs | 1 year |
| Error logs (Sentry) | 90 days |
