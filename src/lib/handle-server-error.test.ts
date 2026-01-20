import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import {
  categorizeByStatus,
  getErrorDetails,
  categorizeError,
  isRetryableError,
} from './handle-server-error'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

// Mock logger
vi.mock('./logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('categorizeByStatus', () => {
  it('returns auth for 401', () => {
    expect(categorizeByStatus(401)).toBe('auth')
  })

  it('returns permission for 403', () => {
    expect(categorizeByStatus(403)).toBe('permission')
  })

  it('returns not_found for 404', () => {
    expect(categorizeByStatus(404)).toBe('not_found')
  })

  it('returns conflict for 409', () => {
    expect(categorizeByStatus(409)).toBe('conflict')
  })

  it('returns validation for 400', () => {
    expect(categorizeByStatus(400)).toBe('validation')
  })

  it('returns validation for 422', () => {
    expect(categorizeByStatus(422)).toBe('validation')
  })

  it('returns rate_limit for 429', () => {
    expect(categorizeByStatus(429)).toBe('rate_limit')
  })

  it('returns server for 500', () => {
    expect(categorizeByStatus(500)).toBe('server')
  })

  it('returns server for 503', () => {
    expect(categorizeByStatus(503)).toBe('server')
  })

  it('returns unknown for other status codes', () => {
    expect(categorizeByStatus(200)).toBe('unknown')
    expect(categorizeByStatus(302)).toBe('unknown')
  })
})

describe('getErrorDetails', () => {
  it('returns correct details for network category', () => {
    const details = getErrorDetails('network')
    expect(details.category).toBe('network')
    expect(details.title).toBe('Connection Error')
    expect(details.retryable).toBe(true)
  })

  it('returns correct details for auth category', () => {
    const details = getErrorDetails('auth')
    expect(details.category).toBe('auth')
    expect(details.title).toBe('Session Expired')
    expect(details.retryable).toBe(false)
  })

  it('returns correct details for server category', () => {
    const details = getErrorDetails('server')
    expect(details.category).toBe('server')
    expect(details.title).toBe('Server Error')
    expect(details.retryable).toBe(true)
  })
})

describe('categorizeError', () => {
  it('categorizes network errors', () => {
    const error = new TypeError('Failed to fetch')
    const result = categorizeError(error)
    expect(result.category).toBe('network')
  })

  it('categorizes Axios errors without response as network', () => {
    const error = new AxiosError('Network Error')
    const result = categorizeError(error)
    expect(result.category).toBe('network')
  })

  it('categorizes Axios errors with response by status', () => {
    const error = new AxiosError('Unauthorized')
    error.response = {
      status: 401,
      statusText: 'Unauthorized',
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    }
    const result = categorizeError(error)
    expect(result.category).toBe('auth')
    expect(result.status).toBe(401)
  })

  it('uses server message when available', () => {
    const error = new AxiosError('Bad Request')
    error.response = {
      status: 400,
      statusText: 'Bad Request',
      data: { message: 'Custom validation message' },
      headers: {},
      config: { headers: new AxiosHeaders() },
    }
    const result = categorizeError(error)
    expect(result.message).toBe('Custom validation message')
  })

  it('categorizes generic Error as unknown', () => {
    const error = new Error('Something broke')
    const result = categorizeError(error)
    expect(result.category).toBe('unknown')
    expect(result.message).toBe('Something broke')
  })

  it('handles non-Error objects', () => {
    const result = categorizeError('string error')
    expect(result.category).toBe('unknown')
  })
})

describe('isRetryableError', () => {
  it('returns true for network errors', () => {
    const error = new TypeError('Failed to fetch')
    expect(isRetryableError(error)).toBe(true)
  })

  it('returns false for auth errors', () => {
    const error = new AxiosError('Unauthorized')
    error.response = {
      status: 401,
      statusText: 'Unauthorized',
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    }
    expect(isRetryableError(error)).toBe(false)
  })

  it('returns true for server errors', () => {
    const error = new AxiosError('Internal Server Error')
    error.response = {
      status: 500,
      statusText: 'Internal Server Error',
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    }
    expect(isRetryableError(error)).toBe(true)
  })
})
