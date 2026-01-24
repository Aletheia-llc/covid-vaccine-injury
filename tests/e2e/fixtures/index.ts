/**
 * Shared test fixtures and data for E2E tests
 */

export const testData = {
  survey: {
    valid: {
      q1: 'yes',
      q2: 'yes',
      q3: 'severe',
      q4: 'yes',
      q5: 'no',
      q6: 'denied',
      q7: 'very_dissatisfied',
      q8: ['vicp_transfer', 'extend_deadline'],
      q9: 'social_media',
      zipCode: '90210',
      email: 'test@example.com',
      additionalComments: 'Test survey submission from E2E tests.',
    },
    minimal: {
      q1: 'yes',
      q2: 'no',
    },
  },

  subscribe: {
    valid: {
      name: 'Test User',
      email: `test+${Date.now()}@example.com`,
      phone: '555-123-4567',
      zip: '90210',
    },
    requiredOnly: {
      name: 'Test User',
      email: `test+${Date.now()}@example.com`,
    },
  },

  donation: {
    presets: [25, 50, 100, 250, 500, 1000],
    minimumAmount: 5,
    maximumAmount: 1000000,
    validAmounts: [5, 25, 50, 100, 500, 1000],
    invalidAmounts: [0, 1, 2, 4, -10, 1000001],
  },

  contact: {
    valid: {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'general',
      message: 'Test message from E2E tests.',
    },
    subjectOptions: ['general', 'story', 'media', 'legislative', 'other'],
  },
}

/**
 * Generate a unique email for each test run
 */
export function generateTestEmail(prefix = 'test'): string {
  return `${prefix}+${Date.now()}@example.com`
}

/**
 * Generate a unique phone number for testing
 */
export function generateTestPhone(): string {
  const random = Math.floor(Math.random() * 10000000).toString().padStart(7, '0')
  return `555${random}`
}

/**
 * Common selectors for form elements
 */
export const selectors = {
  subscribe: {
    nameInput: '[name="name"], #name, input[placeholder*="name" i]',
    emailInput: '[name="email"], #email, input[placeholder*="email" i]',
    phoneInput: '[name="phone"], #phone, input[placeholder*="phone" i]',
    zipInput: '[name="zip"], #zip, input[placeholder*="zip" i]',
    submitButton: 'button[type="submit"], button:has-text("Subscribe")',
  },
  donate: {
    presetButtons: 'button:has-text("$")',
    customInput: 'input[placeholder*="amount" i], input[type="number"]',
    oneTimeButton: 'button:has-text("One"), button:has-text("Once")',
    monthlyButton: 'button:has-text("Monthly")',
    submitButton: 'button:has-text("Donate"), button:has-text("Give")',
  },
  survey: {
    continueButton: 'button:has-text("Continue"), button:has-text("Next")',
    submitButton: 'button:has-text("Submit")',
    radioOptions: 'input[type="radio"]',
    checkboxOptions: 'input[type="checkbox"]',
  },
}

/**
 * Wait times for various operations
 */
export const timeouts = {
  formSubmit: 5000,
  pageLoad: 10000,
  animation: 1000,
  apiResponse: 3000,
}
