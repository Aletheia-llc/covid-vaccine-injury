import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 */
import 'dotenv/config'

/**
 * Playwright E2E Test Configuration
 *
 * Tests critical user flows:
 * - Navigation and page loads
 * - Newsletter signup
 * - Contact form submission
 * - Survey submission
 * - Donation flow (up to Stripe redirect)
 *
 * Run tests:
 *   pnpm test:e2e          # Run all E2E tests
 *   pnpm test:e2e:ui       # Open Playwright UI
 *   pnpm test:e2e:headed   # Run with visible browser
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests (more on CI)
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI to avoid resource issues
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure (CI only to save resources)
    video: process.env.CI ? 'on-first-retry' : 'off',

    // Timeout for actions (clicks, fills, etc.)
    actionTimeout: 10000,

    // Timeout for navigation
    navigationTimeout: 30000,
  },

  // Global timeout for each test
  timeout: 60000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    // Disable password protection during E2E tests
    env: {
      SITE_PASSWORD: '',
    },
  },
})
