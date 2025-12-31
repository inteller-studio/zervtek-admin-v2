'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  addDays,
  format,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
  subDays,
  subMonths,
} from 'date-fns'

export interface VisibleDate {
  date: Date
  label: string
  dayNum: string
}

export interface DateRange {
  start: Date | undefined
  end: Date
  label: string
}

export interface UseDateNavigationReturn {
  // State
  selectedDate: Date
  dateRangeStart: Date | undefined
  dateRangeLabel: string
  visibleDates: VisibleDate[]
  isCalendarOpen: boolean
  // Actions
  setIsCalendarOpen: (open: boolean) => void
  navigateDate: (days: number) => void
  selectDate: (date: Date, label?: string) => void
  selectDateRange: (start: Date | undefined, end: Date | undefined, label: string) => void
  selectAllDates: () => void
  goToToday: () => void
  isDateInRange: (date: Date) => boolean
}

// Generate visible dates centered on selected date (5 days)
export function getVisibleDates(centerDate: Date): VisibleDate[] {
  const dates: VisibleDate[] = []
  for (let i = -2; i <= 2; i++) {
    const date = addDays(centerDate, i)
    dates.push({
      date,
      label: isToday(date)
        ? 'Today'
        : isTomorrow(date)
          ? 'Tomorrow'
          : isYesterday(date)
            ? 'Yesterday'
            : format(date, 'EEE'),
      dayNum: format(date, 'd'),
    })
  }
  return dates
}

// Preset date ranges
export const DATE_RANGE_PRESETS = {
  last3Days: {
    getRange: () => ({
      start: subDays(new Date(), 2),
      end: new Date(),
      label: 'Last 3 Days',
    }),
  },
  last7Days: {
    getRange: () => ({
      start: subDays(new Date(), 6),
      end: new Date(),
      label: 'Last 7 Days',
    }),
  },
  lastMonth: {
    getRange: () => ({
      start: subMonths(new Date(), 1),
      end: new Date(),
      label: 'Last Month',
    }),
  },
  last3Months: {
    getRange: () => ({
      start: subMonths(new Date(), 3),
      end: new Date(),
      label: 'Last 3 Months',
    }),
  },
}

export function useDateNavigation(): UseDateNavigationReturn {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined)
  const [dateRangeLabel, setDateRangeLabel] = useState<string>('Today')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const visibleDates = useMemo(() => getVisibleDates(selectedDate), [selectedDate])

  const navigateDate = useCallback((days: number) => {
    setSelectedDate((prev) => {
      const newDate = addDays(prev, days)
      setDateRangeStart(undefined)
      setDateRangeLabel(format(newDate, 'MMM d, yyyy'))
      return startOfDay(newDate)
    })
  }, [])

  const selectDate = useCallback((date: Date, label?: string) => {
    const normalizedDate = startOfDay(date)
    setSelectedDate(normalizedDate)
    setDateRangeStart(undefined)
    setDateRangeLabel(label || format(normalizedDate, 'MMM d, yyyy'))
    setIsCalendarOpen(false)
  }, [])

  const selectDateRange = useCallback(
    (start: Date | undefined, end: Date | undefined, label: string) => {
      if (end) {
        setSelectedDate(startOfDay(end))
      }
      setDateRangeStart(start ? startOfDay(start) : undefined)
      setDateRangeLabel(label)
      setIsCalendarOpen(false)
    },
    []
  )

  const selectAllDates = useCallback(() => {
    setSelectedDate(startOfDay(new Date()))
    setDateRangeStart(undefined)
    setDateRangeLabel('All Dates')
    setIsCalendarOpen(false)
  }, [])

  const goToToday = useCallback(() => {
    const today = startOfDay(new Date())
    setSelectedDate(today)
    setDateRangeStart(undefined)
    setDateRangeLabel('Today')
    setIsCalendarOpen(false)
  }, [])

  const isDateInRange = useCallback(
    (date: Date) => {
      if (!dateRangeStart) {
        return startOfDay(date).getTime() === selectedDate.getTime()
      }
      const dateTime = startOfDay(date).getTime()
      const startTime = dateRangeStart.getTime()
      const endTime = selectedDate.getTime()
      return dateTime >= startTime && dateTime <= endTime
    },
    [dateRangeStart, selectedDate]
  )

  return {
    selectedDate,
    dateRangeStart,
    dateRangeLabel,
    visibleDates,
    isCalendarOpen,
    setIsCalendarOpen,
    navigateDate,
    selectDate,
    selectDateRange,
    selectAllDates,
    goToToday,
    isDateInRange,
  }
}
