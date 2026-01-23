'use client'

import { ChangeEvent } from 'react'

interface FormTextareaProps {
  id: string
  name: string
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  error?: string
  rows?: number
  maxLength?: number
  className?: string
  disabled?: boolean
}

/**
 * Reusable form textarea component with label, error display, and accessibility
 */
export function FormTextarea({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 4,
  maxLength,
  className = '',
  disabled = false,
}: FormTextareaProps) {
  const errorId = `${id}-error`

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="required"> *</span>}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="form-textarea"
      />
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
