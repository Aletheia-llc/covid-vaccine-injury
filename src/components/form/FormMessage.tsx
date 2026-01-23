'use client'

interface FormMessageProps {
  type: 'success' | 'error'
  message: string
  className?: string
}

/**
 * Reusable form message component for success/error states
 */
export function FormMessage({ type, message, className = '' }: FormMessageProps) {
  if (!message) return null

  return (
    <p className={`form-message form-message-${type} ${className}`} role="alert">
      {message}
    </p>
  )
}
