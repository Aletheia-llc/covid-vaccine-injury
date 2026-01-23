'use client'

import { useState, useEffect } from 'react'

const CONSENT_KEY = 'cookie-consent'

type ConsentStatus = 'pending' | 'accepted' | 'declined'

interface CookieConsentProps {
  onConsentChange?: (accepted: boolean) => void
}

export default function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [status, setStatus] = useState<ConsentStatus>('pending')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check for existing consent
    const savedConsent = localStorage.getItem(CONSENT_KEY)
    if (savedConsent === 'accepted') {
      setStatus('accepted')
      onConsentChange?.(true)
    } else if (savedConsent === 'declined') {
      setStatus('declined')
      onConsentChange?.(false)
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [onConsentChange])

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setStatus('accepted')
    setIsVisible(false)
    onConsentChange?.(true)
  }

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setStatus('declined')
    setIsVisible(false)
    onConsentChange?.(false)
  }

  // Don't render if consent already given or still checking
  if (status !== 'pending' || !isVisible) {
    return null
  }

  return (
    <div className="cookie-consent">
      <div className="cookie-consent-content">
        <p>
          We use cookies and analytics to improve your experience and understand how our site is used.
          This helps us advocate more effectively for vaccine injury reform.
        </p>
        <div className="cookie-consent-actions">
          <button onClick={handleDecline} className="cookie-btn cookie-btn-decline">
            Decline
          </button>
          <button onClick={handleAccept} className="cookie-btn cookie-btn-accept">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook to check consent status (for conditional analytics loading)
export function useConsentStatus(): boolean | null {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  useEffect(() => {
    const savedConsent = localStorage.getItem(CONSENT_KEY)
    if (savedConsent === 'accepted') {
      setHasConsent(true)
    } else if (savedConsent === 'declined') {
      setHasConsent(false)
    }
    // null means pending/unknown
  }, [])

  return hasConsent
}
