# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation review and gap analysis
- MONITORING.md for observability documentation
- GitHub issue and PR templates
- Troubleshooting section in README

### Changed
- Updated DEPLOYMENT.md to mark Upstash Redis as optional
- Expanded SECURITY.md with compliance and incident response details
- Updated API.md with accurate CSRF token flow documentation

## [1.1.0] - 2025-01-23

### Added
- Comprehensive security and configuration tests (145 total tests)
  - CSRF token generation and verification tests
  - reCAPTCHA verification tests
  - Environment validation tests
  - Constants verification tests
- Token-based CSRF protection with HMAC-SHA256 signatures
- Environment validation at startup with clear error messages
- Structured logging with Pino
- Request ID tracking for API requests
- Graceful fallback for optional services (Redis, reCAPTCHA)

### Changed
- Made Upstash Redis optional in production (graceful degradation)
- Improved rate limiting with Upstash Redis + in-memory fallback
- Enhanced input sanitization with DOMPurify
- Updated security headers in middleware

### Fixed
- Production 500 error caused by strict Upstash requirement
- E2E tests to accept 'degraded' health status in CI
- Roulette spin sound to stop when animation ends

### Security
- Added timing-safe comparison for all token validation
- Enforced minimum 32-character secrets
- Added comprehensive security tests

## [1.0.0] - 2025-01-20

### Added
- Initial public release
- Survey system for collecting vaccine injury experiences
- Contact form with spam protection
- Newsletter subscription system
- Donation system with Stripe integration
- Representative lookup by ZIP code (Google Civic API)
- FAQ management via Payload CMS
- Resources library with categorized links
- CICP vs VICP comparison visualizations
- Compensation calculator
- Interactive CICP/VICP roulette game
- Privacy policy and Terms of Service pages

### Security
- CSRF protection on all POST endpoints
- Rate limiting per IP address
- Input sanitization (XSS prevention)
- Security headers (CSP, HSTS, X-Frame-Options)
- reCAPTCHA v3 bot protection

### Infrastructure
- Next.js 15 with App Router
- Payload CMS 3.72 for content management
- PostgreSQL database (Supabase)
- Vercel deployment with automatic CI/CD
- Vercel Analytics for privacy-focused analytics
- Sentry error tracking integration

## [0.9.0] - 2025-01-15

### Added
- Beta release for internal testing
- Core survey functionality
- Basic admin panel
- Initial documentation

### Changed
- Migrated from SQLite to PostgreSQL
- Updated Payload CMS to v3

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.1.0 | 2025-01-23 | Security hardening, comprehensive tests |
| 1.0.0 | 2025-01-20 | Initial public release |
| 0.9.0 | 2025-01-15 | Beta release |

## Upgrade Guide

### Upgrading to 1.1.0

No breaking changes. Optional improvements:

1. **Upstash Redis** is now optional. You can remove `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` if not using Redis rate limiting.

2. **CSRF tokens** now use a more secure format. Existing tokens will continue to work until they expire (1 hour).

3. **Environment validation** now runs at startup. Ensure your environment variables are correctly configured to avoid startup errors.

### Upgrading to 1.0.0

If upgrading from 0.9.0:

1. Run database migrations: `npm run payload migrate`
2. Update environment variables per `.env.example`
3. Clear browser cache for new styles

## Links

- [GitHub Releases](https://github.com/Aletheia-llc/covid-vaccine-injury/releases)
- [GitHub Issues](https://github.com/Aletheia-llc/covid-vaccine-injury/issues)
- [Documentation](./README.md)
