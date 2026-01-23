# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT open a public GitHub issue** for security vulnerabilities
2. Email your findings to the project maintainers
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

- **CSRF Protection**: Token-based with HMAC-SHA256 signatures
- **Rate Limiting**: Per-IP limits via Upstash Redis
- **Input Sanitization**: XSS prevention on all user inputs
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **reCAPTCHA v3**: Bot protection on form submissions
- **Timing-Safe Comparisons**: For API key and token validation

## Acknowledgments

We appreciate security researchers who help keep this project safe. With your permission, we'll acknowledge your contribution in our release notes.
