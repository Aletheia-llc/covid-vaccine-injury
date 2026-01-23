'use client'

import { useState, useCallback, ChangeEvent, FormEvent } from 'react'

export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  submitStatus: 'idle' | 'success' | 'error'
  errorMessage: string
}

export interface UseFormOptions<T> {
  initialData: T
  validate?: (data: T) => Partial<Record<keyof T, string>>
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>
  onSuccess?: () => void
  resetOnSuccess?: boolean
}

/**
 * Shared form state management hook.
 * Handles input changes, validation, submission, and error states.
 *
 * @example
 * ```tsx
 * const { data, errors, handleChange, handleSubmit, isSubmitting } = useForm({
 *   initialData: { email: '', name: '' },
 *   validate: (data) => {
 *     const errors: Record<string, string> = {}
 *     if (!data.email) errors.email = 'Email is required'
 *     return errors
 *   },
 *   onSubmit: async (data) => {
 *     const res = await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(data) })
 *     return res.ok ? { success: true } : { success: false, error: 'Failed to subscribe' }
 *   },
 * })
 * ```
 */
export function useForm<T extends Record<string, unknown>>({
  initialData,
  validate,
  onSubmit,
  onSuccess,
  resetOnSuccess = true,
}: UseFormOptions<T>) {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  /**
   * Handle input change for text, email, tel, checkbox inputs
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target
      const checked = (e.target as HTMLInputElement).checked

      setData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))

      // Clear validation error when user starts typing
      if (errors[name as keyof T]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }))
      }

      // Clear submit error when user makes changes
      if (submitStatus === 'error') {
        setSubmitStatus('idle')
        setErrorMessage('')
      }
    },
    [errors, submitStatus]
  )

  /**
   * Update a specific field programmatically
   */
  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  /**
   * Toggle an item in an array field (for checkboxes/multi-select)
   */
  const toggleArrayItem = useCallback(<K extends keyof T>(field: K, item: string) => {
    setData((prev) => {
      const currentArray = (prev[field] as string[]) || []
      const newArray = currentArray.includes(item)
        ? currentArray.filter((i) => i !== item)
        : [...currentArray, item]
      return { ...prev, [field]: newArray as T[K] }
    })
  }, [])

  /**
   * Validate the form and return whether it's valid
   */
  const validateForm = useCallback((): boolean => {
    if (!validate) return true

    const validationErrors = validate(data)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }, [data, validate])

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setIsSubmitting(true)
      setSubmitStatus('idle')
      setErrorMessage('')

      try {
        const result = await onSubmit(data)

        if (result.success) {
          setSubmitStatus('success')
          if (resetOnSuccess) {
            setData(initialData)
            setErrors({})
          }
          onSuccess?.()
        } else {
          setErrorMessage(result.error || 'Something went wrong. Please try again.')
          setSubmitStatus('error')
        }
      } catch {
        setErrorMessage('Something went wrong. Please try again.')
        setSubmitStatus('error')
      } finally {
        setIsSubmitting(false)
      }
    },
    [data, initialData, onSubmit, onSuccess, resetOnSuccess, validateForm]
  )

  /**
   * Reset the form to initial state
   */
  const reset = useCallback(() => {
    setData(initialData)
    setErrors({})
    setSubmitStatus('idle')
    setErrorMessage('')
  }, [initialData])

  return {
    // State
    data,
    errors,
    isSubmitting,
    submitStatus,
    errorMessage,

    // Actions
    handleChange,
    handleSubmit,
    setField,
    toggleArrayItem,
    setErrors,
    reset,

    // Computed
    hasErrors: Object.keys(errors).filter((k) => errors[k as keyof T]).length > 0,
    isSuccess: submitStatus === 'success',
    isError: submitStatus === 'error',
  }
}
