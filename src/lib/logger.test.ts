import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from './logger'

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('debug', () => {
    it('logs debug messages', () => {
      logger.debug('Test debug message')
      expect(console.debug).toHaveBeenCalled()
    })

    it('includes context in debug messages', () => {
      logger.debug('Test with context', { key: 'value' })
      expect(console.debug).toHaveBeenCalled()
      const call = (console.debug as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call).toContain('Test with context')
      expect(call).toContain('value')
    })
  })

  describe('info', () => {
    it('logs info messages', () => {
      logger.info('Test info message')
      expect(console.info).toHaveBeenCalled()
    })
  })

  describe('warn', () => {
    it('logs warning messages', () => {
      logger.warn('Test warning message')
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('error', () => {
    it('logs error messages', () => {
      logger.error('Test error message')
      expect(console.error).toHaveBeenCalled()
    })

    it('includes context in error messages', () => {
      logger.error('Error with context', { errorCode: 500 })
      expect(console.error).toHaveBeenCalled()
      const call = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call).toContain('Error with context')
      expect(call).toContain('500')
    })
  })

  describe('apiError', () => {
    it('logs API errors with endpoint', () => {
      logger.apiError('/api/users', new Error('Network error'))
      expect(console.error).toHaveBeenCalled()
      const call = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call).toContain('API Error')
      expect(call).toContain('/api/users')
      expect(call).toContain('Network error')
    })

    it('handles non-Error objects', () => {
      logger.apiError('/api/test', 'string error')
      expect(console.error).toHaveBeenCalled()
      const call = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call).toContain('Unknown error')
    })
  })

  describe('action', () => {
    it('logs user actions', () => {
      logger.action('button_click', { buttonId: 'submit' })
      expect(console.info).toHaveBeenCalled()
      const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call).toContain('User Action')
      expect(call).toContain('button_click')
    })
  })

  describe('perf', () => {
    it('logs performance metrics', () => {
      logger.perf('database_query', 150, { query: 'SELECT *' })
      expect(console.debug).toHaveBeenCalled()
      const call = (console.debug as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call).toContain('Performance')
      expect(call).toContain('database_query')
      expect(call).toContain('150')
    })
  })
})
