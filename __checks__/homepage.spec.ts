/**
 * Homepage Browser Check
 *
 * Verifies the homepage loads correctly and key elements are visible.
 */

import { expect, test } from '@playwright/test'

const SITE_URL = process.env.ENVIRONMENT_URL || 'https://www.covidvaccineinjury.us'

test('homepage loads correctly', async ({ page }) => {
  // Navigate to homepage
  const response = await page.goto(SITE_URL)

  // Verify successful response
  expect(response?.status()).toBeLessThan(400)

  // Verify key elements are visible
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('nav')).toBeVisible()
  await expect(page.locator('footer')).toBeVisible()

  // Verify the page title is set
  const title = await page.title()
  expect(title).toContain('COVID')

  // Take a screenshot for visual verification
  await page.screenshot({ path: 'homepage.png' })
})

test('navigation links work', async ({ page }) => {
  await page.goto(SITE_URL)

  // Check FAQ link
  const faqLink = page.locator('nav a[href*="faq"]')
  if (await faqLink.isVisible()) {
    await faqLink.click()
    await expect(page).toHaveURL(/faq/)
  }
})
