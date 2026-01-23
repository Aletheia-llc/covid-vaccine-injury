'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center',
            backgroundColor: '#1a2744',
            color: '#ffffff',
          }}
        >
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#d4a84b' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#e0e0e0', marginBottom: '2rem', maxWidth: '400px' }}>
            We apologize for the inconvenience. Our team has been notified and is working to fix the
            issue.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#d4a84b',
              color: '#1a2744',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
