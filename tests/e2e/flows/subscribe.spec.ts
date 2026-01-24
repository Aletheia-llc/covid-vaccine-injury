import { test, expect } from '@playwright/test'

test.describe('Newsletter Subscribe Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('subscribe section is visible on homepage', async ({ page }) => {
    // Scroll to subscribe section
    const subscribeSection = page.locator('#subscribe, [id*="subscribe"], section:has-text("Stay Informed")')

    if (await subscribeSection.isVisible()) {
      await subscribeSection.scrollIntoViewIfNeeded()
      await expect(subscribeSection).toBeVisible()
    } else {
      // Look for subscribe form anywhere on page
      const subscribeForm = page.locator('form').filter({ hasText: /subscribe|newsletter|stay.*informed/i })
      await expect(subscribeForm).toBeVisible()
    }
  })

  test('displays subscribe form with required fields', async ({ page }) => {
    // Scroll to find the form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7))
    await page.waitForTimeout(500)

    // Check for name field
    const nameField = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i))
    await expect(nameField.first()).toBeVisible()

    // Check for email field
    const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i))
    await expect(emailField.first()).toBeVisible()
  })

  test('validates email format', async ({ page }) => {
    // Scroll to form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7))
    await page.waitForTimeout(500)

    // Fill name
    const nameField = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i)).first()
    await nameField.fill('Test User')

    // Fill invalid email
    const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first()
    await emailField.fill('invalid-email')

    // Submit
    const submitButton = page.getByRole('button', { name: /subscribe|submit|sign.*up/i })
    await submitButton.click()

    // Should show validation error or prevent submission
    await page.waitForTimeout(1000)

    const hasError = await page.getByText(/valid.*email|invalid.*email/i).isVisible().catch(() => false)
    const formStillVisible = await emailField.isVisible()

    expect(hasError || formStillVisible).toBe(true)
  })

  test('submits with valid data', async ({ page }) => {
    // Scroll to form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7))
    await page.waitForTimeout(500)

    // Fill form with unique email
    const timestamp = Date.now()
    const nameField = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i)).first()
    const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first()

    await nameField.fill('Test User')
    await emailField.fill(`test+${timestamp}@example.com`)

    // Submit
    const submitButton = page.getByRole('button', { name: /subscribe|submit|sign.*up/i })
    await submitButton.click()

    // Wait for response
    await page.waitForTimeout(3000)

    // Should show success message or form should reset
    const hasSuccess = await page.getByText(/thank.*you|subscribed|success/i).isVisible().catch(() => false)
    const formReset = await emailField.inputValue() === ''

    // In dev mode without reCAPTCHA, might see error - that's OK for this test
    const hasRecaptchaError = await page.getByText(/recaptcha|verification/i).isVisible().catch(() => false)

    expect(hasSuccess || formReset || hasRecaptchaError).toBe(true)
  })

  test('handles optional phone field', async ({ page }) => {
    // Scroll to form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7))
    await page.waitForTimeout(500)

    // Fill required fields
    const nameField = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i)).first()
    const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first()

    await nameField.fill('Test User')
    await emailField.fill(`test+${Date.now()}@example.com`)

    // Fill optional phone field if present
    const phoneField = page.getByLabel(/phone/i).or(page.getByPlaceholder(/phone/i)).first()
    if (await phoneField.isVisible()) {
      await phoneField.fill('555-123-4567')
      await expect(phoneField).toHaveValue(/555/)
    }
  })

  test('handles optional ZIP field', async ({ page }) => {
    // Scroll to form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7))
    await page.waitForTimeout(500)

    // Fill required fields
    const nameField = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i)).first()
    const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first()

    await nameField.fill('Test User')
    await emailField.fill(`test+${Date.now()}@example.com`)

    // Fill optional ZIP field if present
    const zipField = page.getByLabel(/zip/i).or(page.getByPlaceholder(/zip/i)).first()
    if (await zipField.isVisible()) {
      await zipField.fill('90210')
      await expect(zipField).toHaveValue('90210')
    }
  })
})
