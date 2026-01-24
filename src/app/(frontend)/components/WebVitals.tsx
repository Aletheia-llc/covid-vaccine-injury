'use client'

import { useReportWebVitals } from 'next/web-vitals'
import * as Sentry from '@sentry/nextjs'

/**
 * Web Vitals Reporter Component
 *
 * Reports Core Web Vitals (LCP, FID, CLS, FCP, TTFB) to:
 * - Sentry (production)
 * - Console (development)
 *
 * This component renders nothing visible - it only collects and reports metrics.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      try {
        // Use Sentry's breadcrumb to track Web Vitals
        Sentry.addBreadcrumb({
          category: 'web-vitals',
          message: `${metric.name}: ${metric.value.toFixed(2)}`,
          level: 'info',
          data: {
            name: metric.name,
            value: metric.value,
            rating: getRating(metric.name, metric.value),
            page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
          },
        })
      } catch {
        // Silently fail if Sentry is not available
      }
    }

    // Log poor performance in development for debugging
    if (process.env.NODE_ENV === 'development') {
      const rating = getRating(metric.name, metric.value)
      if (rating === 'poor') {
        console.warn(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${rating})`)
      }
    }
  })

  return null
}

/**
 * Get performance rating based on Web Vitals thresholds
 * https://web.dev/vitals/
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    // [good threshold, poor threshold]
    LCP: [2500, 4000], // Largest Contentful Paint
    FID: [100, 300], // First Input Delay
    CLS: [0.1, 0.25], // Cumulative Layout Shift
    FCP: [1800, 3000], // First Contentful Paint
    TTFB: [800, 1800], // Time to First Byte
    INP: [200, 500], // Interaction to Next Paint
  }

  const [good, poor] = thresholds[name] || [Infinity, Infinity]

  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

export default WebVitals
