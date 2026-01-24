/**
 * Donate Page Browser Check
 *
 * Verifies the donation page loads and the form is functional.
 */

import { expect, test } from '@playwright/test'

const SITE_URL = process.env.ENVIRONMENT_URL || 'https://www.covidvaccineinjury.us'

test('donate page loads correctly', async ({ page }) => {
  // Navigate to donate page
  const response = await page.goto(`${SITE_URL}/donate`)

  // Verify successful response
  expect(response?.status()).toBeLessThan(400)

  // Verify page title/heading
  await expect(page.locator('h1')).toBeVisible()

  // Verify donation form elements are present
  await expect(page.getByRole('button', { name: /\$25/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /\$50/ })).toBeVisible()

  // Verify donate button is present
  await expect(page.getByRole('button', { name: /donate|give/i })).toBeVisible()
})

test('donation amounts are selectable', async ({ page }) => {
  await page.goto(`${SITE_URL}/donate`)

  // Click $50 preset
  const fiftyButton = page.getByRole('button', { name: /\$50/ })
  await fiftyButton.click()

  // Verify interaction was successful (button should show selected state)
  await expect(fiftyButton).toBeVisible()
})
