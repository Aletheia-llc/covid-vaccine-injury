'use client'

import { ChangeEvent } from 'react'

interface FormInputProps {
  id: string
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'number'
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  error?: string
  maxLength?: number
  pattern?: string
  autoComplete?: string
  className?: string
  disabled?: boolean
}

/**
 * Reusable form input component with label, error display, and accessibility
 */
export function FormInput({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  maxLength,
  pattern,
  autoComplete,
  className = '',
  disabled = false,
}: FormInputProps) {
  const errorId = `${id}-error`

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="required"> *</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        pattern={pattern}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="form-input"
      />
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
