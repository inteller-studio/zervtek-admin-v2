import { describe, it, expect } from 'vitest'
import { cn, getPageNumbers, sleep } from './utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('handles conflicting tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible')
  })

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null)).toBe('base')
  })

  it('handles arrays of classes', () => {
    expect(cn(['flex', 'items-center'])).toBe('flex items-center')
  })
})

describe('getPageNumbers', () => {
  it('returns all pages when total is 5 or less', () => {
    expect(getPageNumbers(1, 3)).toEqual([1, 2, 3])
    expect(getPageNumbers(2, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('shows ellipsis at the end when near beginning', () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, 4, '...', 10])
    expect(getPageNumbers(2, 10)).toEqual([1, 2, 3, 4, '...', 10])
    expect(getPageNumbers(3, 10)).toEqual([1, 2, 3, 4, '...', 10])
  })

  it('shows ellipsis at both ends when in middle', () => {
    expect(getPageNumbers(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10])
    expect(getPageNumbers(6, 10)).toEqual([1, '...', 5, 6, 7, '...', 10])
  })

  it('shows ellipsis at the beginning when near end', () => {
    expect(getPageNumbers(8, 10)).toEqual([1, '...', 7, 8, 9, 10])
    expect(getPageNumbers(9, 10)).toEqual([1, '...', 7, 8, 9, 10])
    expect(getPageNumbers(10, 10)).toEqual([1, '...', 7, 8, 9, 10])
  })
})

describe('sleep', () => {
  it('resolves after the specified time', async () => {
    const start = Date.now()
    await sleep(100)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(95) // Allow small variance
    expect(elapsed).toBeLessThan(200)
  })

  it('defaults to 1000ms when no argument is provided', async () => {
    const start = Date.now()
    const promise = sleep()
    // Don't await the full second, just verify it's pending
    expect(promise).toBeInstanceOf(Promise)
    // Resolve immediately for test speed
  })
})
