import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs'

// Content Security Policy
// Allows: self, Stripe, Sentry, Supabase, Google reCAPTCHA, and necessary inline styles for Next.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.sentry.io https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.stripe.com https://www.gstatic.com/recaptcha/;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.sentry.io https://*.ingest.sentry.io https://www.google.com/recaptcha/ https://recaptchaenterprise.googleapis.com;
  frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.google.com/recaptcha/ https://recaptcha.google.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  upgrade-insecure-requests;
`
  .replace(/\n/g, ' ')
  .trim()

const securityHeaders = [
  {
    // Content Security Policy - prevents XSS, clickjacking, and other injection attacks
    key: 'Content-Security-Policy',
    value: cspHeader,
  },
  {
    // Prevent MIME type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Control referrer information sent with requests
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Disable browser features that aren't needed
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    // Prevent clickjacking (redundant with CSP frame-ancestors but good for older browsers)
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Enable strict HTTPS (only in production)
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

const payloadConfig = withPayload(nextConfig, { devBundleServerPackages: false })

export default withSentryConfig(payloadConfig, {
  // Suppresses source map upload logs during build
  silent: true,

  // Upload source maps for better error traces
  widenClientFileUpload: true,

  // Source maps configuration
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
})
