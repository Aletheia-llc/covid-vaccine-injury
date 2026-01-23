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
- **Representative Lookup**: Find and contact your elected officials by ZIP code
- **Survey System**: Collect stories and experiences from vaccine-injured Americans
- **Resource Library**: Curated links to government reports, research, and legislation
- **Donation System**: Stripe-integrated donations to support advocacy efforts

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| CMS | Payload CMS 3.72 |
| Database | PostgreSQL (Supabase) |
| Styling | Tailwind CSS + Custom CSS |
| Payments | Stripe |
| Analytics | Vercel Analytics |
| Error Tracking | Sentry |
| Deployment | Vercel |

## Quick Start

### Prerequisites

- Node.js 20.x
- npm (or pnpm 9+)
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
│   │   ├── components/      # React components (Header, Footer, etc.)
│   │   ├── donate/          # Donation flow
│   │   ├── survey/          # Survey form
│   │   ├── faq/             # FAQ page
│   │   ├── resources/       # Resource library
│   │   ├── page.tsx         # Homepage
│   │   └── styles.css       # Global styles
│   ├── (payload)/           # Payload CMS admin
│   └── api/                 # API routes
│       ├── survey/          # Survey submission + stats
│       ├── contact/         # Contact form
│       ├── subscribe/       # Newsletter signup
│       ├── checkout/        # Stripe checkout
│       ├── representatives/ # Representative lookup
│       └── health/          # Health check endpoint
├── collections/             # Payload CMS data models
├── lib/                     # Utility libraries
│   ├── rate-limit.ts        # Rate limiting (Upstash + memory fallback)
│   ├── csrf.ts              # CSRF protection
│   ├── sanitize.ts          # Input sanitization
│   ├── auth.ts              # Admin authentication
│   ├── logger.ts            # Structured logging (Pino)
│   └── recaptcha.ts         # reCAPTCHA verification
├── hooks/                   # React hooks
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
| `/api/representatives` | GET | Look up representatives by ZIP |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run test:unit    # Run unit tests
npm run test:e2e     # Run Playwright E2E tests
```

## Security

This application implements multiple security layers:

- **CSRF Protection**: Token-based with HMAC-SHA256 signatures
- **Rate Limiting**: Upstash Redis (production) or in-memory (development)
- **Input Sanitization**: XSS prevention on all user inputs
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **reCAPTCHA v3**: Bot protection on form submissions
- **Timing-Safe Comparisons**: For API key and token validation

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

## Documentation

| Document | Description |
|----------|-------------|
| [API.md](./API.md) | REST API endpoints, authentication, CSRF flow |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design and component overview |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Development guidelines and code style |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Vercel deployment, environment setup |
| [SECURITY.md](./SECURITY.md) | Security policy and vulnerability reporting |
| [TESTING.md](./TESTING.md) | Testing strategy, coverage requirements |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/Aletheia-llc/covid-vaccine-injury/issues)
- **Email**: Contact through the website

---

*Designed by [Aletheia LLC](https://aletheia.llc)*
