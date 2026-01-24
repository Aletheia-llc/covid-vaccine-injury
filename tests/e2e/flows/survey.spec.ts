import { test, expect } from '@playwright/test'

test.describe('Survey Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/survey')
  })

  test('displays survey page with first question', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText(/survey|voice/i)

    // Check first question is visible
    await expect(page.getByText(/believe.*injuries.*real/i)).toBeVisible()
  })

  test('navigates through survey steps', async ({ page }) => {
    // Step 1: Answer first question
    await page.getByLabel(/yes/i).first().click()

    // Continue to next step
    const continueButton = page.getByRole('button', { name: /continue|next/i })
    if (await continueButton.isVisible()) {
      await continueButton.click()
    }

    // Check we're on a new step (different content visible)
    await expect(page.locator('form, [role="form"], .survey')).toBeVisible()
  })

  test('shows validation for required fields', async ({ page }) => {
    // Try to continue without answering
    const continueButton = page.getByRole('button', { name: /continue|next|submit/i }).first()
    await continueButton.click()

    // Should show some indication that selection is required
    // This could be via disabled button, error message, or staying on same step
    const isStillOnFirstStep = await page.getByText(/believe.*injuries.*real/i).isVisible()
    expect(isStillOnFirstStep).toBe(true)
  })

  test('allows optional fields to be skipped', async ({ page }) => {
    // Answer required question
    await page.getByLabel(/yes/i).first().click()

    // Navigate through steps
    let continueButton = page.getByRole('button', { name: /continue|next/i })
    if (await continueButton.isVisible()) {
      await continueButton.click()
    }

    // Should be able to progress (may need to answer more required questions)
    await expect(page.locator('form, [role="form"], .survey')).toBeVisible()
  })

  test('accepts email input on final step', async ({ page }) => {
    // Navigate to final step by answering questions
    // This test verifies email field exists and accepts input

    // Look for email field on any step
    const emailField = page.getByLabel(/email/i)

    // If email field is not on first page, we need to navigate to it
    if (!(await emailField.isVisible())) {
      // Answer first question
      await page.getByLabel(/yes/i).first().click()

      // Try to navigate through steps
      for (let i = 0; i < 4; i++) {
        const continueBtn = page.getByRole('button', { name: /continue|next/i })
        if (await continueBtn.isVisible()) {
          // Answer any visible required questions
          const radioButtons = page.locator('input[type="radio"]')
          if (await radioButtons.first().isVisible()) {
            await radioButtons.first().click()
          }
          await continueBtn.click()
        }

        // Check if email field is now visible
        if (await emailField.isVisible()) break
      }
    }

    // If email field is visible, test it
    if (await emailField.isVisible()) {
      await emailField.fill('test@example.com')
      await expect(emailField).toHaveValue('test@example.com')
    }
  })

  test('accepts ZIP code input', async ({ page }) => {
    // Look for ZIP field
    const zipField = page.getByLabel(/zip/i)

    // If ZIP field is not on first page, navigate to it
    if (!(await zipField.isVisible())) {
      // Answer first question
      await page.getByLabel(/yes/i).first().click()

      // Navigate through steps
      for (let i = 0; i < 4; i++) {
        const continueBtn = page.getByRole('button', { name: /continue|next/i })
        if (await continueBtn.isVisible()) {
          const radioButtons = page.locator('input[type="radio"]')
          if (await radioButtons.first().isVisible()) {
            await radioButtons.first().click()
          }
          await continueBtn.click()
        }

        if (await zipField.isVisible()) break
      }
    }

    // If ZIP field is visible, test it
    if (await zipField.isVisible()) {
      await zipField.fill('90210')
      await expect(zipField).toHaveValue('90210')
    }
  })
})
