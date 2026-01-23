'use client'

import { ChangeEvent } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface FormSelectProps {
  id: string
  name: string
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  options: SelectOption[]
  required?: boolean
  error?: string
  className?: string
  disabled?: boolean
  placeholder?: string
}

/**
 * Reusable form select component with label, error display, and accessibility
 */
export function FormSelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  className = '',
  disabled = false,
  placeholder,
}: FormSelectProps) {
  const errorId = `${id}-error`

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="required"> *</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="form-select"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
