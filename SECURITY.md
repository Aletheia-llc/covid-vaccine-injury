# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT open a public GitHub issue** for security vulnerabilities
2. **Email**: security@covidvaccineinjury.us
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Initial Assessment**: Within 1 week
- **Resolution Timeline**: Depends on severity
  - Critical: 24-72 hours
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release cycle

### Scope

The following are in scope for security reports:

- Authentication/authorization bypasses
- SQL injection, XSS, CSRF vulnerabilities
- Sensitive data exposure
- Rate limiting bypasses
- API security issues
- Dependency vulnerabilities with exploitable impact

### Out of Scope

- Denial of service (DoS) attacks
- Social engineering
- Physical security
- Issues in third-party services (Stripe, Supabase, etc.)
- Issues requiring unlikely user interaction

## Security Measures

This application implements multiple security layers:

### Authentication & Authorization

- **Payload CMS Authentication**: Session-based auth with secure cookies
- **API Key Authentication**: Optional header-based auth for protected endpoints
- **Role-Based Access**: Admin-only access to sensitive data and operations
- **Timing-Safe Comparisons**: Prevents timing attacks on API key validation

### CSRF Protection

Token-based CSRF protection using HMAC-SHA256 signatures:

- **Double-Submit Pattern**: Token in cookie + token in request header
- **Token Format**: `timestamp.randomBytes.signature`
- **Expiry**: 1 hour from generation
- **Cookie Settings**: HttpOnly, Secure, SameSite=Strict

```typescript
// Token validation flow
1. GET /api/csrf → Sets cookie + returns token
2. POST /api/* → Must include token in x-csrf-token header
3. Server validates token matches cookie and signature is valid
```

### Rate Limiting

Per-IP request limits via Upstash Redis:

| Endpoint | Window | Max Requests |
|----------|--------|--------------|
| `/api/survey` | 1 hour | 5 |
| `/api/contact` | 1 hour | 5 |
| `/api/subscribe` | 1 hour | 10 |
| `/api/checkout` | 1 minute | 10 |
| `/api/csrf` | 1 minute | 30 |
| `/api/representatives` | 1 hour | 30 |

**Fail-Closed Behavior**: In production, if Upstash Redis is unavailable, requests are **denied** (429) rather than allowed. This prevents abuse during infrastructure issues.

### Input Sanitization

XSS prevention on all user inputs:

- **Names**: Alphanumeric + spaces only, max 100 characters
- **Emails**: Validated format, max 254 characters (RFC 5321)
- **Comments**: HTML stripped, max 5000 characters
- **ZIP Codes**: Digits only, exactly 5 characters
- **Phone**: Digits only after stripping formatting

### Request Size Limits

Enforced maximum payload sizes per endpoint:

| Endpoint | Max Size |
|----------|----------|
| Checkout | 1 KB |
| Subscribe | 4 KB |
| Survey | 16 KB |
| Contact | 16 KB |
| Webhooks | 64 KB |

### Transport Security

- **HTTPS Only**: Enforced via HSTS header (1 year, includeSubDomains)
- **TLS 1.3**: Required for all connections
- **Secure Cookies**: HttpOnly, Secure, SameSite=Strict

### Security Headers

Applied via middleware:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Content Security Policy is defined in `next.config.mjs` to allow required domains (Stripe, Sentry, reCAPTCHA, Vercel Analytics).

### Bot Protection

- **reCAPTCHA v3**: Score-based bot detection on form submissions
- **Score Threshold**: Minimum 0.7 required (configurable)
- **Production Required**: Returns error if reCAPTCHA not configured in production

### Request Tracing

All API responses include `X-Request-ID` header:

- Unique UUID per request
- Logged with all operations
- Enables correlation for debugging

### Cryptographic Security

- **HMAC-SHA256**: For CSRF token signatures
- **Timing-Safe Comparisons**: For all token and secret validation
- **Strong Secrets**: Minimum 32-character secrets enforced
- **Secure Random Generation**: crypto.randomBytes for token generation

## Data Protection

### Data Collected

| Data Type | Purpose | Retention |
|-----------|---------|-----------|
| Survey Responses | Advocacy research | Indefinite (anonymized) |
| Contact Form Submissions | User communication | 2 years |
| Newsletter Subscriptions | Email communications | Until unsubscribed |
| Donation Records | Payment processing | 7 years (legal requirement) |

### Data Storage

- **Database**: PostgreSQL hosted on Supabase (SOC 2 Type II certified)
- **Encryption at Rest**: AES-256 encryption via Supabase
- **Encryption in Transit**: TLS 1.3
- **Backups**: Automated daily backups

### Data Access

- Admin access requires authenticated Payload CMS session or API key
- API access to sensitive data requires authentication
- No third-party analytics services have access to PII
- Vercel Analytics is privacy-focused (no PII collected)

## Privacy Compliance

### GDPR Compliance

For EU residents, we provide:

- **Right to Access**: Request your data via contact form
- **Right to Erasure**: Request deletion of your data
- **Right to Rectification**: Request correction of inaccurate data
- **Data Portability**: Request export of your data

### CCPA Compliance

For California residents:

- **Right to Know**: Request disclosure of collected data
- **Right to Delete**: Request deletion of personal information
- **Right to Opt-Out**: No sale of personal information (we don't sell data)
- **Non-Discrimination**: Equal service regardless of privacy choices

### Cookie Policy

We use minimal cookies:

| Cookie | Purpose | Duration | Type |
|--------|---------|----------|------|
| `payload-token` | Admin authentication | Session | Essential |
| `csrf_token` | CSRF protection | 1 hour | Essential |
| `cookie-consent` | Cookie preferences | 1 year | Functional |

Analytics are privacy-focused (Vercel Analytics) and loaded only with user consent via the cookie consent banner.

## Incident Response

### Response Procedure

1. **Detection**: Monitor logs, Sentry alerts, user reports
2. **Assessment**: Evaluate severity and scope
3. **Containment**: Isolate affected systems if needed
4. **Eradication**: Remove threat and patch vulnerability
5. **Recovery**: Restore normal operations
6. **Post-Incident**: Document lessons learned

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Active exploitation, data breach | Immediate |
| High | Vulnerability with clear exploit path | 24 hours |
| Medium | Vulnerability requiring specific conditions | 1 week |
| Low | Minor issue, defense in depth | Next release |

### Notification

- **Data Breach**: Affected users notified within 72 hours
- **Security Updates**: Announced via GitHub releases
- **Service Disruption**: Status updates on website

## Security Testing

### Automated Testing

- **Unit Tests**: Security functions have dedicated tests
- **Dependency Scanning**: npm audit on every build
- **Static Analysis**: ESLint security rules
- **Type Safety**: Strict TypeScript compilation

### Test Coverage Requirements

Security-critical code requires high test coverage:

- `src/lib/csrf.ts` - CSRF protection
- `src/lib/rate-limit.ts` - Rate limiting
- `src/lib/sanitize.ts` - Input sanitization
- `src/lib/auth.ts` - Authentication

### Manual Testing

- **Code Review**: Security-focused review for all PRs
- **Penetration Testing**: Periodic testing (schedule TBD)

## Secure Development

### Code Practices

- No secrets in code (environment variables only)
- Input validation on all user data
- Output encoding for all rendered content
- Parameterized queries (via Payload ORM)
- Principle of least privilege for access control
- Structured logging (no sensitive data in logs)

### Dependency Management

- Regular dependency updates
- Security advisories monitored via GitHub Dependabot
- Lock file committed for reproducible builds
- npm audit run on every build

### Environment Security

- Different secrets for development/production
- Production secrets never committed
- Environment validation at startup
- Fail-closed behavior for missing required config

## Development Guidelines

### Adding New Endpoints

All new POST endpoints must implement:

1. CSRF validation via `validateCsrfToken()`
2. Rate limiting via `checkRateLimit()`
3. Request ID generation via `crypto.randomUUID()`
4. Input sanitization via `sanitize*()` functions
5. reCAPTCHA verification (when configured)
6. X-Request-ID response header

### Security Checklist for PRs

- [ ] Input is validated and sanitized
- [ ] Rate limiting is in place
- [ ] CSRF protection is verified
- [ ] No sensitive data in logs
- [ ] No hardcoded secrets
- [ ] Error messages don't leak internal details
- [ ] Authentication required where appropriate

## Acknowledgments

We appreciate security researchers who help keep this project safe. With your permission, we'll acknowledge your contribution in our release notes.

### Hall of Fame

*No submissions yet. Be the first responsible disclosure!*

## Contact

- **Security Issues**: security@covidvaccineinjury.us
- **General Questions**: Use the contact form on the website
- **GitHub**: [Issues](https://github.com/Aletheia-llc/covid-vaccine-injury/issues) (non-security only)
