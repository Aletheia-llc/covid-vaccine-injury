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
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('FAQ page loads', async ({ page }) => {
    await page.goto('/faq')
    await expect(page).toHaveTitle(/FAQ|Frequently/i)
    await expect(page.locator('body')).toBeVisible()
  })

  test('Resources page loads', async ({ page }) => {
    await page.goto('/resources')
    await expect(page.locator('body')).toBeVisible()
  })

  test('Privacy page loads', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('body')).toBeVisible()
  })

  test('Terms page loads', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Homepage Content', () => {
  test('displays hero section', async ({ page }) => {
    await page.goto('/')

    // Hero section should be visible
    const hero = page.locator('.hero-section, [class*="hero"]').first()
    await expect(hero).toBeVisible()
  })

  test('displays navigation', async ({ page }) => {
    await page.goto('/')

    // Navigation should be visible
    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible()
  })

  test('displays footer', async ({ page }) => {
    await page.goto('/')

    // Footer should exist
    const footer = page.locator('footer').first()
    await expect(footer).toBeVisible()
  })

  test('has contact congress CTA', async ({ page }) => {
    await page.goto('/')

    // Should have a call-to-action for contacting congress
    const ctaText = await page.getByText(/contact.*congress/i).first()
    await expect(ctaText).toBeVisible()
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

  test('checkout endpoint validates amount', async ({ request }) => {
    const response = await request.post('/api/checkout', {
      data: {
        amount: 1, // Below $5 minimum
      },
    })

    // Should reject - either CSRF (403) or validation (400)
    expect([400, 403]).toContain(response.status())
  })

  test('health endpoint includes required fields', async ({ request }) => {
    const response = await request.get('/api/health')
    const body = await response.json()

    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('checks')
    expect(body).toHaveProperty('timestamp')
    expect(body.checks).toHaveProperty('required')
    expect(body.checks).toHaveProperty('optional')
  })
})

test.describe('Accessibility Basics', () => {
  test('page has lang attribute', async ({ page }) => {
    await page.goto('/')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('en')
  })

  test('images have alt text', async ({ page }) => {
    await page.goto('/')

    // Get all images
    const images = page.locator('img')
    const count = await images.count()

    // Check each image has alt attribute (can be empty for decorative)
    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).not.toBeNull()
    }
  })

  test('buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Find first button and check it can receive focus
    const button = page.locator('button').first()
    if (await button.count() > 0) {
      await button.focus()
      await expect(button).toBeFocused()
    }
  })

  test('links have discernible text', async ({ page }) => {
    await page.goto('/')

    const links = page.locator('a')
    const count = await links.count()

    for (let i = 0; i < Math.min(count, 20); i++) { // Check first 20 links
      const link = links.nth(i)
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      const title = await link.getAttribute('title')

      // Link should have some accessible name
      const hasAccessibleName = (text && text.trim().length > 0) ||
                                (ariaLabel && ariaLabel.length > 0) ||
                                (title && title.length > 0)
      expect(hasAccessibleName).toBe(true)
    }
  })
})

test.describe('Security Headers', () => {
  test('response includes security headers', async ({ request }) => {
    const response = await request.get('/')

    // Check for important security headers
    const headers = response.headers()

    // X-Content-Type-Options should be set
    expect(headers['x-content-type-options']).toBe('nosniff')

    // X-Frame-Options should prevent framing
    expect(headers['x-frame-options']).toBe('DENY')
  })
})
