'use client'

import { useState } from 'react'

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000]

export default function DonationForm() {
  const [amount, setAmount] = useState<number | ''>('')
  const [customAmount, setCustomAmount] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePresetClick = (preset: number) => {
    setAmount(preset)
    setCustomAmount('')
    setError('')
  }

  const handleCustomChange = (value: string) => {
    const numValue = value.replace(/[^0-9.]/g, '')
    setCustomAmount(numValue)
    setAmount('')
    setError('')
  }

  const getFinalAmount = (): number => {
    if (amount) return amount
    if (customAmount) return parseFloat(customAmount)
    return 0
  }

  const handleSubmit = async () => {
    const finalAmount = getFinalAmount()

    if (finalAmount < 5) {
      setError('Minimum donation is $5')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          recurring: isRecurring,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  const finalAmount = getFinalAmount()

  return (
    <div className="donation-form">
      {/* Frequency Toggle */}
      <div className="donation-frequency">
        <button
          type="button"
          className={`frequency-btn ${!isRecurring ? 'active' : ''}`}
          onClick={() => setIsRecurring(false)}
        >
          One-Time
        </button>
        <button
          type="button"
          className={`frequency-btn ${isRecurring ? 'active' : ''}`}
          onClick={() => setIsRecurring(true)}
        >
          Monthly
        </button>
      </div>

      {/* Preset Amounts */}
      <div className="donation-presets">
        {PRESET_AMOUNTS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`preset-btn ${amount === preset ? 'active' : ''}`}
            onClick={() => handlePresetClick(preset)}
          >
            ${preset}
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="donation-custom">
        <span className="custom-currency">$</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="Other amount"
          value={customAmount}
          onChange={(e) => handleCustomChange(e.target.value)}
          className="custom-input"
        />
      </div>

      {/* Error Message */}
      {error && <p className="donation-error">{error}</p>}

      {/* Submit Button */}
      <button
        type="button"
        className="donation-submit"
        onClick={handleSubmit}
        disabled={loading || finalAmount < 5}
      >
        {loading
          ? 'Processing...'
          : finalAmount >= 5
            ? `Donate $${finalAmount}${isRecurring ? '/month' : ''}`
            : 'Select an amount'}
      </button>

      <p className="donation-secure">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="lock-icon"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Secure payment powered by Stripe
      </p>
    </div>
  )
}
