'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import CookieConsent from './CookieConsent'

const CONSENT_KEY = 'cookie-consent'

export default function AnalyticsWrapper() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  useEffect(() => {
    // Check existing consent on mount
    const savedConsent = localStorage.getItem(CONSENT_KEY)
    if (savedConsent === 'accepted') {
      setHasConsent(true)
    } else if (savedConsent === 'declined') {
      setHasConsent(false)
    }
    // null means pending - will wait for CookieConsent callback
  }, [])

  const handleConsentChange = (accepted: boolean) => {
    setHasConsent(accepted)
  }

  return (
    <>
      {/* Cookie consent banner */}
      <CookieConsent onConsentChange={handleConsentChange} />

      {/* Only load analytics if user has consented */}
      {hasConsent === true && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-TDMSS3W1GS"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TDMSS3W1GS');
            `}
          </Script>
          <Analytics />
        </>
      )}
    </>
  )
}
