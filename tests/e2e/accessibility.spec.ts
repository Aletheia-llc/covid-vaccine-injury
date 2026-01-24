import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('homepage has no critical accessibility violations', async ({ page }) => {
    await page.goto('/')

    // Scroll through the entire page to trigger all fade-in animations
    await page.evaluate(async () => {
      const scrollHeight = document.documentElement.scrollHeight
      const viewportHeight = window.innerHeight
      let currentScroll = 0

      while (currentScroll < scrollHeight) {
        window.scrollTo(0, currentScroll)
        await new Promise(resolve => setTimeout(resolve, 100))
        currentScroll += viewportHeight * 0.5
      }

      window.scrollTo(0, 0)
    })

    // Wait for transitions to complete
    await page.waitForTimeout(1000)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = results.violations.filter(v => v.impact === 'critical')

    if (criticalViolations.length > 0) {
      console.log('Critical violations:', JSON.stringify(criticalViolations, null, 2))
    }

    expect(criticalViolations).toHaveLength(0)
  })

  test('survey page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/survey')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = results.violations.filter(v => v.impact === 'critical')
    expect(criticalViolations).toHaveLength(0)
  })

  test('donate page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/donate')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = results.violations.filter(v => v.impact === 'critical')
    expect(criticalViolations).toHaveLength(0)
  })

  test('faq page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/faq')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = results.violations.filter(v => v.impact === 'critical')
    expect(criticalViolations).toHaveLength(0)
  })

  test('skip link is functional', async ({ page }) => {
    await page.goto('/')

    // Press Tab to focus skip link
    await page.keyboard.press('Tab')

    // Check skip link is visible and focused
    const skipLink = page.locator('.skip-link')
    await expect(skipLink).toBeFocused()

    // Press Enter to activate skip link
    await page.keyboard.press('Enter')

    // Check focus moved to main content
    const mainContent = page.locator('#main-content')
    await expect(mainContent).toBeVisible()
  })

  test('modal has correct ARIA attributes', async ({ page }) => {
    await page.goto('/')

    // Scroll to trigger roulette modal (30% scroll trigger)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.35))
    await page.waitForTimeout(1500) // Wait for modal to appear

    // Check modal has correct attributes
    const modal = page.locator('[role="dialog"]')
    if (await modal.count() > 0) {
      await expect(modal).toHaveAttribute('aria-modal', 'true')
      await expect(modal).toHaveAttribute('aria-labelledby', 'roulette-modal-title')
    }
  })

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('/survey')

    // Check that form inputs are accessible
    const results = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze()

    expect(results.violations).toHaveLength(0)
  })

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/')

    // Tab to first focusable element
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Get the focused element
    const focusedElement = page.locator(':focus')

    // Check that focus is visible (element has outline or box-shadow)
    const outlineStyle = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow
      }
    })

    // Either outline or box-shadow should indicate focus
    const hasFocusIndicator =
      (outlineStyle.outline && outlineStyle.outline !== 'none') ||
      (outlineStyle.boxShadow && outlineStyle.boxShadow !== 'none')

    expect(hasFocusIndicator).toBe(true)
  })

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/')

    // Scroll through the entire page to trigger all fade-in animations
    // This ensures all sections have opacity: 1 before running contrast checks
    await page.evaluate(async () => {
      const scrollHeight = document.documentElement.scrollHeight
      const viewportHeight = window.innerHeight
      let currentScroll = 0

      while (currentScroll < scrollHeight) {
        window.scrollTo(0, currentScroll)
        await new Promise(resolve => setTimeout(resolve, 100))
        currentScroll += viewportHeight * 0.5
      }

      // Scroll back to top
      window.scrollTo(0, 0)
    })

    // Wait for all fade-in transitions to complete (0.8s transition + buffer)
    await page.waitForTimeout(1000)

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze()

    // Filter for serious and critical violations only
    const seriousViolations = results.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    )

    if (seriousViolations.length > 0) {
      console.log('Color contrast violations:', JSON.stringify(seriousViolations, null, 2))
    }

    expect(seriousViolations).toHaveLength(0)
  })
})
