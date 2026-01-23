'use client'

interface FormErrorSummaryProps {
  errors: Record<string, string | undefined>
  title?: string
}

/**
 * Accessible error summary component that displays all form validation errors
 */
export function FormErrorSummary({
  errors,
  title = 'Please fix the following errors:',
}: FormErrorSummaryProps) {
  const errorList = Object.entries(errors).filter(([, value]) => value)

  if (errorList.length === 0) return null

  return (
    <div role="alert" aria-live="polite" className="form-error-summary">
      <p>
        <strong>{title}</strong>
      </p>
      <ul>
        {errorList.map(([key, message]) => (
          <li key={key}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
