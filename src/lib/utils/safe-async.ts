import { toast } from 'sonner'

export interface SafeAsyncOptions {
  errorMessage?: string
  showToast?: boolean
  onError?: (error: Error) => void
  onSuccess?: () => void
}

/**
 * Wraps an async function with error handling
 * Returns the result or null if an error occurred
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options: SafeAsyncOptions = {}
): Promise<T | null> {
  const { errorMessage = 'An error occurred', showToast = true, onError, onSuccess } = options

  try {
    const result = await fn()
    onSuccess?.()
    return result
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))

    if (showToast) {
      toast.error(errorMessage)
    }

    onError?.(err)
    console.error('[safeAsync]', errorMessage, err)

    return null
  }
}

/**
 * Wraps an async function and shows loading/success/error toasts
 */
export async function safeAsyncWithToast<T>(
  fn: () => Promise<T>,
  options: {
    loadingMessage?: string
    successMessage?: string
    errorMessage?: string
    onError?: (error: Error) => void
  } = {}
): Promise<T | null> {
  const {
    loadingMessage = 'Loading...',
    successMessage = 'Success!',
    errorMessage = 'An error occurred',
    onError,
  } = options

  const toastId = toast.loading(loadingMessage)

  try {
    const result = await fn()
    toast.success(successMessage, { id: toastId })
    return result
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    toast.error(errorMessage, { id: toastId })
    onError?.(err)
    console.error('[safeAsyncWithToast]', errorMessage, err)
    return null
  }
}

/**
 * Retry an async function with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, onRetry } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay)
        onRetry?.(attempt + 1, lastError)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
