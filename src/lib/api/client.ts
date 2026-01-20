import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { AUTH_CONSTANTS, API_TIMEOUTS } from '@/lib/constants'

// API response wrapper type
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: number
}

// API error type
export interface ApiError {
  message: string
  code: string
  status: number
  details?: Record<string, unknown>
}

// Create the base API client
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: API_TIMEOUTS.DEFAULT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Get token from cookie (client-side)
      if (typeof window !== 'undefined') {
        const token = getCookie(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    (error: AxiosError<{ message?: string; title?: string }>) => {
      const apiError = transformError(error)

      // Handle specific status codes
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in'
        }
      }

      return Promise.reject(apiError)
    }
  )

  return client
}

// Helper to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? null
  }
  return null
}

// Transform axios error to API error
function transformError(error: AxiosError<{ message?: string; title?: string }>): ApiError {
  const status = error.response?.status || 500
  const message =
    error.response?.data?.message ||
    error.response?.data?.title ||
    getDefaultErrorMessage(status)

  return {
    message,
    code: getErrorCode(status),
    status,
    details: error.response?.data as Record<string, unknown> | undefined,
  }
}

// Get default error message based on status code
function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'You need to sign in to continue.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This action conflicts with existing data.',
    422: 'The provided data is invalid.',
    429: 'Too many requests. Please try again later.',
    500: 'An unexpected error occurred. Please try again.',
    502: 'Service temporarily unavailable. Please try again.',
    503: 'Service is under maintenance. Please try again later.',
  }
  return messages[status] || 'Something went wrong. Please try again.'
}

// Get error code based on status
function getErrorCode(status: number): string {
  const codes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
    500: 'SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
  }
  return codes[status] || 'UNKNOWN_ERROR'
}

// Create singleton instance
export const apiClient = createApiClient()

// Typed request methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
}

// Check if error is an API error
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error &&
    'status' in error
  )
}

// Export for testing and custom instances
export { createApiClient, transformError, getDefaultErrorMessage, getErrorCode }
