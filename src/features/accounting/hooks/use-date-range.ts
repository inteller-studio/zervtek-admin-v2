import { useState, useMemo, useCallback } from 'react'
import type { DateRange, DateRangeType } from '../types/accounting'

function getDateRange(type: DateRangeType, customFrom?: Date, customTo?: Date): DateRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (type) {
    case 'today':
      return {
        from: today,
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        type,
      }
    case 'week': {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      return { from: weekStart, to: weekEnd, type }
    }
    case 'month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
      return { from: monthStart, to: monthEnd, type }
    }
    case 'quarter': {
      const quarter = Math.floor(today.getMonth() / 3)
      const quarterStart = new Date(today.getFullYear(), quarter * 3, 1)
      const quarterEnd = new Date(today.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999)
      return { from: quarterStart, to: quarterEnd, type }
    }
    case 'year': {
      const yearStart = new Date(today.getFullYear(), 0, 1)
      const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)
      return { from: yearStart, to: yearEnd, type }
    }
    case 'custom':
      return {
        from: customFrom || new Date(today.getFullYear(), 0, 1),
        to: customTo || today,
        type,
      }
    default:
      return getDateRange('month')
  }
}

export function useDateRange(initialType: DateRangeType = 'month') {
  const [rangeType, setRangeType] = useState<DateRangeType>(initialType)
  const [customFrom, setCustomFrom] = useState<Date | undefined>()
  const [customTo, setCustomTo] = useState<Date | undefined>()

  const dateRange = useMemo(() => {
    return getDateRange(rangeType, customFrom, customTo)
  }, [rangeType, customFrom, customTo])

  const setRange = useCallback((type: DateRangeType) => {
    setRangeType(type)
  }, [])

  const setCustomRange = useCallback((from: Date, to: Date) => {
    setCustomFrom(from)
    setCustomTo(to)
    setRangeType('custom')
  }, [])

  const formatRangeLabel = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    return `${dateRange.from.toLocaleDateString('en-US', options)} - ${dateRange.to.toLocaleDateString('en-US', options)}`
  }, [dateRange])

  return {
    dateRange,
    rangeType,
    setRange,
    setCustomRange,
    formatRangeLabel,
  }
}
