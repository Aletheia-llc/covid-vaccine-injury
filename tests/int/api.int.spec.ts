import { describe, it, beforeAll, expect } from 'vitest'

// Skip integration tests if required env vars are not configured
const hasRequiredEnvVars = process.env.PAYLOAD_SECRET && process.env.DATABASE_URL

describe.skipIf(!hasRequiredEnvVars)('API Integration Tests', () => {
  // Dynamic imports to avoid errors when env vars are missing
  let payload: Awaited<ReturnType<typeof import('payload')['getPayload']>>

  beforeAll(async () => {
    const { getPayload } = await import('payload')
    const config = (await import('@/payload.config')).default
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
