# U.S. COVID Vaccine Injuries

A platform advocating for fair compensation for Americans injured by COVID-19 vaccines. This site presents data comparing the Countermeasures Injury Compensation Program (CICP) with the National Vaccine Injury Compensation Program (VICP), enabling citizens to contact their representatives and share their stories.

**Live Site:** [covidvaccineinjury.us](https://covidvaccineinjury.us)

## The Issue

COVID-19 vaccine injuries are handled through the CICP, which has:
- **0.3% approval rate** (42 compensated out of 14,046 claims)
- **$4,132 median compensation** for approved claims
- No coverage for pain and suffering
- No attorney fees
- No judicial review
- 1-year filing deadline

Compare this to the VICP (for other vaccines):
- **48% approval rate**
- **$377,736 median compensation**
- Covers pain and suffering
- Provides attorney fees
- Allows judicial review
- 3-year filing deadline

## Features

- **Data Visualization**: Interactive comparison of CICP vs VICP statistics
- **Compensation Calculator**: Estimate potential compensation under different scenarios
- **CICP Roulette**: Interactive demonstration of the 0.3% approval odds
- **Representative Lookup**: Find and contact your elected officials by ZIP code
- **Survey System**: Collect stories and experiences from vaccine-injured Americans
- **Resource Library**: Curated links to government reports, research, and legislation
- **Donation System**: Stripe-integrated donations to support advocacy efforts
- **Cookie Consent**: GDPR-compliant analytics consent banner

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 15.4.10 |
| CMS | Payload CMS | 3.72.0 |
| Database | PostgreSQL (Supabase) | - |
| Language | TypeScript | 5.7.3 |
| Styling | Tailwind CSS + Custom CSS | 4.1.18 |
| Payments | Stripe | 20.2.0 |
| Analytics | Vercel Analytics | 1.6.1 |
| Error Tracking | Sentry | 10.36.0 |
| Testing | Vitest + Playwright | 3.2.3 / 1.56.1 |
| Deployment | Vercel | - |

## Quick Start

### Prerequisites

- Node.js 20.x
- npm or pnpm 9+
- PostgreSQL database (Supabase recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/Aletheia-llc/covid-vaccine-injury.git
cd covid-vaccine-injury

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your values (see Environment Variables below)

# Start development server
npm run dev
```

The site will be available at `http://localhost:3000`.

### Admin Panel

Access the Payload CMS admin at `http://localhost:3000/admin`.

On first run, you'll be prompted to create an admin user.

## Environment Variables

Copy `.env.example` to `.env` and configure:

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | 32+ character secret for encryption |

### Recommended for Production

| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 secret key |

### Optional

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key for donations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN |
| `ADMIN_API_KEY` | API key for protected endpoints |

See `.env.example` for detailed documentation of each variable.

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Public pages
│   │   ├── components/      # React components
│   │   │   ├── Header.tsx       # Navigation header
│   │   │   ├── Footer.tsx       # Site footer with legal disclaimer
│   │   │   ├── CookieConsent.tsx # GDPR cookie consent banner
│   │   │   ├── AnalyticsWrapper.tsx # Conditional analytics loader
│   │   │   └── CICPRoulette.tsx # Interactive approval odds demo
│   │   ├── donate/          # Donation flow
│   │   ├── survey/          # Survey form
│   │   ├── faq/             # FAQ page
│   │   ├── resources/       # Resource library
│   │   ├── privacy/         # Privacy policy
│   │   ├── terms/           # Terms of service
│   │   ├── roulette/        # CICP Roulette page
│   │   ├── page.tsx         # Homepage
│   │   ├── layout.tsx       # Root layout
│   │   └── styles.css       # Global styles
│   ├── (payload)/           # Payload CMS admin
│   └── api/                 # API routes
│       ├── survey/          # Survey submission + stats + export
│       ├── contact/         # Contact form
│       ├── subscribe/       # Newsletter signup
│       ├── checkout/        # Stripe checkout
│       ├── donation-webhook/ # Stripe webhook
│       ├── representatives/ # Representative lookup
│       ├── statistics/      # Public statistics API
│       ├── csrf/            # CSRF token endpoint
│       └── health/          # Health check endpoint
├── collections/             # Payload CMS data models
│   ├── Users.ts
│   ├── FAQs.ts
│   ├── Statistics.ts
│   ├── Resources.ts
│   ├── SurveyResponses.ts
│   ├── FormSubmissions.ts
│   ├── Subscribers.ts
│   ├── LegalPages.ts
│   └── Media.ts
├── components/              # Shared components
│   └── DonationForm.tsx
├── hooks/                   # React hooks
│   └── useAnimations.ts
├── lib/                     # Utility libraries
│   ├── auth.ts              # Admin authentication
│   ├── constants.ts         # Centralized configuration
│   ├── csrf.ts              # CSRF protection (token-based)
│   ├── csrf-client.ts       # Client-side CSRF helpers
│   ├── env-validation.ts    # Environment variable validation
│   ├── error-reporting.ts   # Sentry error reporting
│   ├── logger.ts            # Structured logging (Pino)
│   ├── n8n.ts               # N8N workflow integration
│   ├── rate-limit.ts        # Rate limiting (Upstash/memory)
│   ├── recaptcha.ts         # reCAPTCHA v3 verification
│   ├── sanitize.ts          # Input sanitization
│   └── validation.ts        # Input validation utilities
└── middleware.ts            # Security headers
```

## API Endpoints

See [API.md](./API.md) for complete API documentation.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/csrf` | GET | Get CSRF token |
| `/api/survey` | POST | Submit survey response |
| `/api/survey/stats` | GET | Get survey statistics (auth required) |
| `/api/survey/export` | GET | Export survey data as CSV (auth required) |
| `/api/contact` | POST | Submit contact form |
| `/api/subscribe` | POST | Subscribe to newsletter |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/donation-webhook` | POST | Stripe payment webhook |
| `/api/representatives` | GET | Look up representatives by ZIP |
| `/api/statistics` | GET | Get public statistics |

## Scripts

```bash
npm run dev              # Start development server
npm run devsafe          # Clear cache and start dev
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
npm run test             # Run all tests
npm run test:unit        # Run unit tests only
npm run test:unit:watch  # Run unit tests in watch mode
npm run test:unit:coverage # Run tests with coverage
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:headed  # Run E2E tests with visible browser
npm run generate:types   # Regenerate Payload TypeScript types
npm run seed             # Seed the database
```

## Security

This application implements multiple security layers:

- **CSRF Protection**: Token-based with HMAC-SHA256 signatures and double-submit cookies
- **Rate Limiting**: Upstash Redis (production) with fail-closed behavior, in-memory (development)
- **Input Sanitization**: XSS prevention on all user inputs
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **reCAPTCHA v3**: Bot protection on form submissions
- **Timing-Safe Comparisons**: For API key and token validation
- **Request Tracing**: Correlation IDs on all API responses

See [SECURITY.md](./SECURITY.md) for the full security policy.

## Data Collections

| Collection | Description |
|------------|-------------|
| Users | Admin accounts for CMS access |
| FAQs | Frequently asked questions with rich text answers |
| Statistics | VICP/CICP data points for visualization |
| Resources | External links to reports and research |
| SurveyResponses | User survey submissions |
| FormSubmissions | Contact form submissions |
| Subscribers | Newsletter email list |
| LegalPages | Privacy policy and terms of service |
| Media | Uploaded images and files |

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

Vercel will automatically:
- Build on push to main
- Run CI checks
- Deploy to production

### Manual Deployment

```bash
npm run build
npm run start
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Documentation

| Document | Description |
|----------|-------------|
| [API.md](./API.md) | REST API endpoints, authentication, CSRF flow |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow, security layers |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide |
| [SECURITY.md](./SECURITY.md) | Security policy and vulnerability reporting |
| [TESTING.md](./TESTING.md) | Testing strategy and procedures |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Development guidelines |
| [docs/REPLICATION.md](./docs/REPLICATION.md) | Template guide - how to reuse this codebase |
| [.env.example](./.env.example) | Environment variable documentation |

## Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
# Find what's using the port
lsof -i :3000

# Kill the process or use a different port
PORT=3001 npm run dev
```

**Database connection errors**
- Verify `DATABASE_URL` is correct in your `.env` file
- For Supabase, use the "Session pooler" connection string
- Ensure your IP is allowed in Supabase project settings

**"PAYLOAD_SECRET is required" error**
- Add `PAYLOAD_SECRET` to your `.env` file
- Generate one with: `openssl rand -hex 32`
- Must be at least 32 characters

**Build fails with "Cannot find module"**
```bash
# Clean install dependencies
rm -rf node_modules .next
npm install
```

**TypeScript errors after pulling changes**
```bash
# Regenerate Payload types
npm run generate:types
```

**Rate limiting warnings in logs**
- Expected if Upstash Redis is not configured
- In production without Redis, rate limiting fails closed (denies requests)
- Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for production

**reCAPTCHA not working**
- Ensure both `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` are set
- In development, reCAPTCHA is bypassed if not configured
- Check that your domain is allowed in Google reCAPTCHA console

**CSRF validation failing**
- Ensure client includes `credentials: 'include'` in fetch requests
- Token must be fetched from `/api/csrf` and sent in `x-csrf-token` header
- In development, localhost requests bypass CSRF validation

**Stripe checkout not working**
- Verify `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set
- Use test keys (starting with `sk_test_` and `pk_test_`) for development
- Check Stripe dashboard for webhook errors

### Getting Help

- Check [existing issues](https://github.com/Aletheia-llc/covid-vaccine-injury/issues)
- Review the [documentation](#documentation)
- Open a new issue with the bug report template

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/Aletheia-llc/covid-vaccine-injury/issues)
- **Email**: Contact through the website

---

*Designed by [Aletheia LLC](https://aletheia.llc)*
