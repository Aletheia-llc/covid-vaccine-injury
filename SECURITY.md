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

### Request Security

- **CSRF Protection**: Token-based with HMAC-SHA256 signatures (1-hour expiry)
- **Rate Limiting**: Per-IP limits via Upstash Redis with graceful fallback
- **Input Sanitization**: XSS prevention on all user inputs using DOMPurify
- **Request Size Limits**: Enforced maximum payload sizes per endpoint

### Transport Security

- **HTTPS Only**: Enforced via HSTS header (1 year, includeSubDomains)
- **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options
- **Secure Cookies**: HttpOnly, Secure, SameSite=Strict

### Bot Protection

- **reCAPTCHA v3**: Score-based bot detection on form submissions
- **Honeypot Fields**: Hidden fields to catch automated submissions

### Cryptographic Security

- **Timing-Safe Comparisons**: For API key and token validation
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

### Data Access

- Admin access requires authenticated Payload CMS session
- API access to sensitive data requires API key or session
- No third-party analytics services have access to PII

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

| Cookie | Purpose | Duration |
|--------|---------|----------|
| `payload-token` | Admin authentication | Session |
| `csrf_secret` | CSRF protection | 1 hour |

No tracking cookies are used. Analytics are privacy-focused (Vercel Analytics).

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

- **Dependency Scanning**: npm audit on every build
- **Static Analysis**: ESLint security rules
- **Type Safety**: Strict TypeScript compilation

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

### Dependency Management

- Regular dependency updates
- Security advisories monitored via GitHub Dependabot
- Lock file committed for reproducible builds

## Acknowledgments

We appreciate security researchers who help keep this project safe. With your permission, we'll acknowledge your contribution in our release notes.

### Hall of Fame

*No submissions yet. Be the first responsible disclosure!*

## Contact

- **Security Issues**: security@covidvaccineinjury.us
- **General Questions**: Use the contact form on the website
- **GitHub**: [Issues](https://github.com/Aletheia-llc/covid-vaccine-injury/issues) (non-security only)
