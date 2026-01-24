/**
 * Lighthouse CI Configuration
 *
 * Run with: npm run lighthouse
 *
 * This configuration tests Core Web Vitals and accessibility
 * against defined thresholds.
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/donate',
        'http://localhost:3000/survey',
        'http://localhost:3000/faq',
      ],
      // Number of runs per URL (for more stable results)
      numberOfRuns: 3,
      // Start the server automatically
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Ready',
      startServerReadyTimeout: 30000,
    },

    assert: {
      assertions: {
        // Performance score (0-1)
        'categories:performance': ['warn', { minScore: 0.8 }],

        // Accessibility score - strict
        'categories:accessibility': ['error', { minScore: 0.9 }],

        // Best practices score
        'categories:best-practices': ['warn', { minScore: 0.9 }],

        // SEO score
        'categories:seo': ['warn', { minScore: 0.9 }],

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3500 }],

        // Accessibility audits
        'color-contrast': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',
        'image-alt': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'label': 'warn',

        // Best practices
        'uses-https': 'off', // localhost doesn't use HTTPS
        'is-on-https': 'off',
      },
    },

    upload: {
      // Upload results to temporary public storage
      // Results URL will be printed to console
      target: 'temporary-public-storage',
    },
  },
}
