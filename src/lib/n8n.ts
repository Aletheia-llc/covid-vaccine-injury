/**
 * n8n Webhook Integration
 *
 * Sends notifications to n8n workflows for automation.
 * Configure N8N_WEBHOOK_URL in environment variables.
 *
 * Workflows available:
 * - survey-submitted: New survey response
 * - contact-submitted: Contact form submission
 * - new-subscriber: Newsletter signup
 * - donation-received: Completed donation
 */

import { log } from './logger'

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook'

interface WebhookPayload {
  [key: string]: unknown
}

/**
 * Send data to an n8n webhook
 * Fails silently to not block main application flow
 */
async function triggerWebhook(
  webhookPath: string,
  data: WebhookPayload
): Promise<boolean> {
  // Skip if n8n is not configured
  if (!process.env.N8N_WEBHOOK_URL && process.env.NODE_ENV === 'production') {
    return false
  }

  try {
    const url = `${N8N_BASE_URL}/${webhookPath}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }),
      // Short timeout to not block the main request
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      log.info('n8n_webhook_sent', { webhook: webhookPath })
      return true
    } else {
      log.warn('n8n_webhook_failed', {
        webhook: webhookPath,
        status: response.status,
      })
      return false
    }
  } catch (error) {
    // Log but don't throw - n8n failures shouldn't break the app
    log.warn('n8n_webhook_error', {
      webhook: webhookPath,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}

/**
 * Notify n8n of a new survey submission
 */
export async function notifySurveySubmitted(data: {
  zip?: string
  q1?: string
  q2?: string
  email?: string
}): Promise<void> {
  await triggerWebhook('survey-submitted', {
    zip: data.zip || 'Not provided',
    q1: data.q1 || 'Not answered',
    q2: data.q2 || 'Not answered',
    hasEmail: !!data.email,
  })
}

/**
 * Notify n8n of a contact form submission
 */
export async function notifyContactSubmitted(data: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<void> {
  await triggerWebhook('contact-submitted', data)
}

/**
 * Notify n8n of a new newsletter subscriber
 */
export async function notifyNewSubscriber(data: {
  name: string
  email: string
  zip?: string
}): Promise<void> {
  await triggerWebhook('new-subscriber', data)
}

/**
 * Notify n8n of a completed donation
 */
export async function notifyDonationReceived(data: {
  amount: number
  recurring: boolean
  email?: string
}): Promise<void> {
  await triggerWebhook('donation-received', data)
}
