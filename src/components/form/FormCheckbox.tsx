'use client'

import { ChangeEvent } from 'react'

interface FormCheckboxProps {
  id: string
  name: string
  label: string
  checked: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
  error?: string
}

/**
 * Reusable form checkbox component with label
 */
export function FormCheckbox({
  id,
  name,
  label,
  checked,
  onChange,
  className = '',
  disabled = false,
  error,
}: FormCheckboxProps) {
  const errorId = `${id}-error`

  return (
    <div className={`form-consent ${className}`}>
      <label className="consent-label">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="consent-checkbox"
        />
        <span className="consent-text">{label}</span>
      </label>
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
