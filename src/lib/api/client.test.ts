import { describe, it, expect } from 'vitest'
import { getDefaultErrorMessage, getErrorCode, isApiError } from './client'

describe('getDefaultErrorMessage', () => {
  it('returns correct message for 400', () => {
    expect(getDefaultErrorMessage(400)).toBe('Invalid request. Please check your input.')
  })

  it('returns correct message for 401', () => {
    expect(getDefaultErrorMessage(401)).toBe('You need to sign in to continue.')
  })

  it('returns correct message for 403', () => {
    expect(getDefaultErrorMessage(403)).toBe('You do not have permission to perform this action.')
  })

  it('returns correct message for 404', () => {
    expect(getDefaultErrorMessage(404)).toBe('The requested resource was not found.')
  })

  it('returns correct message for 500', () => {
    expect(getDefaultErrorMessage(500)).toBe('An unexpected error occurred. Please try again.')
  })

  it('returns generic message for unknown status', () => {
    expect(getDefaultErrorMessage(999)).toBe('Something went wrong. Please try again.')
  })
})

describe('getErrorCode', () => {
  it('returns correct code for 400', () => {
    expect(getErrorCode(400)).toBe('BAD_REQUEST')
  })

  it('returns correct code for 401', () => {
    expect(getErrorCode(401)).toBe('UNAUTHORIZED')
  })

  it('returns correct code for 403', () => {
    expect(getErrorCode(403)).toBe('FORBIDDEN')
  })

  it('returns correct code for 404', () => {
    expect(getErrorCode(404)).toBe('NOT_FOUND')
  })

  it('returns correct code for 500', () => {
    expect(getErrorCode(500)).toBe('SERVER_ERROR')
  })

  it('returns UNKNOWN_ERROR for unknown status', () => {
    expect(getErrorCode(999)).toBe('UNKNOWN_ERROR')
  })
})

describe('isApiError', () => {
  it('returns true for valid API error', () => {
    const error = {
      message: 'Test error',
      code: 'TEST_ERROR',
      status: 400,
    }
    expect(isApiError(error)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isApiError(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isApiError(undefined)).toBe(false)
  })

  it('returns false for string', () => {
    expect(isApiError('error')).toBe(false)
  })

  it('returns false for object missing message', () => {
    const error = { code: 'TEST', status: 400 }
    expect(isApiError(error)).toBe(false)
  })

  it('returns false for object missing code', () => {
    const error = { message: 'Test', status: 400 }
    expect(isApiError(error)).toBe(false)
  })

  it('returns false for object missing status', () => {
    const error = { message: 'Test', code: 'TEST' }
    expect(isApiError(error)).toBe(false)
  })
})
