import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { logger } from './logger'

// Error categories for better UX
export type ErrorCategory =
  | 'network'
  | 'auth'
  | 'permission'
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'rate_limit'
  | 'server'
  | 'unknown'

// Structured error with category and actionable message
export interface CategorizedError {
  category: ErrorCategory
  message: string
  title: string
  action?: string
  retryable: boolean
  status?: number
}

// Categorize error by HTTP status code
export function categorizeByStatus(status: number): ErrorCategory {
  if (status === 401) return 'auth'
  if (status === 403) return 'permission'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 422 || status === 400) return 'validation'
  if (status === 429) return 'rate_limit'
  if (status >= 500) return 'server'
  return 'unknown'
}

// Get user-friendly error details by category
export function getErrorDetails(category: ErrorCategory): Omit<CategorizedError, 'status'> {
  const errorMap: Record<ErrorCategory, Omit<CategorizedError, 'status'>> = {
    network: {
      category: 'network',
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      action: 'Check your connection and try again',
      retryable: true,
    },
    auth: {
      category: 'auth',
      title: 'Session Expired',
      message: 'Your session has expired. Please sign in again.',
      action: 'Sign in to continue',
      retryable: false,
    },
    permission: {
      category: 'permission',
      title: 'Access Denied',
      message: 'You do not have permission to perform this action.',
      action: 'Contact an administrator if you need access',
      retryable: false,
    },
    validation: {
      category: 'validation',
      title: 'Invalid Data',
      message: 'The submitted data is invalid. Please check your input.',
      action: 'Review and correct your input',
      retryable: false,
    },
    not_found: {
      category: 'not_found',
      title: 'Not Found',
      message: 'The requested resource could not be found.',
      action: 'The item may have been deleted or moved',
      retryable: false,
    },
    conflict: {
      category: 'conflict',
      title: 'Conflict',
      message: 'This action conflicts with existing data.',
      action: 'Refresh the page and try again',
      retryable: true,
    },
    rate_limit: {
      category: 'rate_limit',
      title: 'Too Many Requests',
      message: 'You have made too many requests. Please wait before trying again.',
      action: 'Wait a moment before retrying',
      retryable: true,
    },
    server: {
      category: 'server',
      title: 'Server Error',
      message: 'An unexpected server error occurred. Our team has been notified.',
      action: 'Please try again later',
      retryable: true,
    },
    unknown: {
      category: 'unknown',
      title: 'Error',
      message: 'Something went wrong. Please try again.',
      action: 'Try again or contact support',
      retryable: true,
    },
  }

  return errorMap[category]
}

// Categorize any error into a structured format
export function categorizeError(error: unknown): CategorizedError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return { ...getErrorDetails('network'), status: undefined }
  }

  // Axios errors
  if (error instanceof AxiosError) {
    // Network error (no response)
    if (!error.response) {
      return { ...getErrorDetails('network'), status: undefined }
    }

    const status = error.response.status
    const category = categorizeByStatus(status)
    const details = getErrorDetails(category)

    // Use server message if available
    const serverMessage =
      error.response.data?.message ||
      error.response.data?.title ||
      error.response.data?.error

    return {
      ...details,
      message: serverMessage || details.message,
      status,
    }
  }

  // Generic Error
  if (error instanceof Error) {
    return {
      ...getErrorDetails('unknown'),
      message: error.message,
      status: undefined,
    }
  }

  // Unknown error type
  return { ...getErrorDetails('unknown'), status: undefined }
}

// Handle server error with categorization and toast
export function handleServerError(error: unknown, options?: { silent?: boolean }) {
  const categorized = categorizeError(error)

  // Log the error
  logger.error('Server error occurred', {
    category: categorized.category,
    status: categorized.status,
    message: categorized.message,
    error: error instanceof Error ? error.message : String(error),
  })

  // Show toast unless silent
  if (!options?.silent) {
    toast.error(categorized.title, {
      description: categorized.message,
      action: categorized.retryable
        ? {
            label: 'Retry',
            onClick: () => window.location.reload(),
          }
        : undefined,
    })
  }

  return categorized
}

// Handle form validation errors
export function handleValidationError(
  errors: Record<string, string[]>,
  options?: { silent?: boolean }
) {
  const errorCount = Object.keys(errors).length
  const firstError = Object.values(errors)[0]?.[0]

  logger.warn('Validation error', { errorCount, errors })

  if (!options?.silent) {
    toast.error('Validation Error', {
      description:
        errorCount === 1
          ? firstError
          : `${errorCount} fields have errors. Please review your input.`,
    })
  }

  return errors
}

// Check if error is retryable
export function isRetryableError(error: unknown): boolean {
  return categorizeError(error).retryable
}
