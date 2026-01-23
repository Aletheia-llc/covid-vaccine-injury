'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Report error to Sentry with context
    Sentry.captureException(error, {
      tags: { location: 'error-boundary' },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <div className="error-page">
      <div className="error-content">
        <h2>Something went wrong</h2>
        <p>We apologize for the inconvenience. Our team has been notified.</p>
        <button onClick={() => reset()} className="error-retry-button">
          Try again
        </button>
      </div>
    </div>
  )
}
