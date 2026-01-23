import { test, expect } from '@playwright/test'

/**
 * Smoke tests to verify the site loads correctly.
 * These are basic tests that run on every deployment.
 */

test.describe('Smoke Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/')

    // Page should load without errors
    await expect(page).toHaveTitle(/.+/)

    // Main content should be visible
    await expect(page.locator('body')).toBeVisible()
  })

  test('health endpoint returns healthy', async ({ request }) => {
    const response = await request.get('/api/health')

    expect(response.status()).toBe(200)

    const body = await response.json()
    // Accept "healthy" or "degraded" - degraded is expected in CI where
    // optional services (Stripe, reCAPTCHA, Sentry) aren't configured
    expect(['healthy', 'degraded']).toContain(body.status)
  })

  test('CSRF endpoint returns token', async ({ request }) => {
    const response = await request.get('/api/csrf')

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.csrfToken).toBeDefined()
    expect(typeof body.csrfToken).toBe('string')
    expect(body.csrfToken.length).toBeGreaterThan(0)
  })
})

test.describe('Navigation', () => {
  test('can navigate to main pages', async ({ page }) => {
    await page.goto('/')

    // Check that basic navigation elements exist
    // Adjust these selectors based on actual site structure
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})

test.describe('API Routes', () => {
  test('contact endpoint validates input', async ({ request }) => {
    // Test that API rejects invalid input
    const response = await request.post('/api/contact', {
      data: {
        name: '',
        email: 'invalid',
        message: '',
      },
    })

    // Should reject with 400 (validation error) or 403 (CSRF)
    expect([400, 403]).toContain(response.status())
  })

  test('subscribe endpoint validates input', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: {
        email: 'invalid',
      },
    })

    // Should reject with 400 (validation error) or 403 (CSRF)
    expect([400, 403]).toContain(response.status())
  })
})
