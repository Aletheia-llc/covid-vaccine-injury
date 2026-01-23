'use client'

interface FormSubmitButtonProps {
  isSubmitting: boolean
  label: string
  loadingLabel?: string
  className?: string
  disabled?: boolean
}

/**
 * Reusable form submit button with loading state
 */
export function FormSubmitButton({
  isSubmitting,
  label,
  loadingLabel,
  className = 'btn-primary',
  disabled = false,
}: FormSubmitButtonProps) {
  return (
    <button type="submit" className={className} disabled={isSubmitting || disabled}>
      {isSubmitting ? loadingLabel || `${label.replace(/\.\.\.$/, '')}...` : label}
    </button>
  )
}
