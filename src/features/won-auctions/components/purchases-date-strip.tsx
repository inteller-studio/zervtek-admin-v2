'use client'

import { format, isToday, startOfDay, subDays } from 'date-fns'
import { MdCalendarToday, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { VisibleDate } from '@/hooks/use-date-navigation'

interface PurchasesDateStripProps {
  selectedDate: Date | undefined
  dateRangeStart: Date | undefined
  dateRangeLabel: string
  visibleDates: VisibleDate[]
  isCalendarOpen: boolean
  onCalendarOpenChange: (open: boolean) => void
  getDateCount: (date: Date) => number
  onDateSelect: (date: Date, label: string) => void
  onNavigate: (days: number) => void
  onDateRangeSelect: (start: Date | undefined, end: Date | undefined, label: string) => void
}

export function PurchasesDateStrip({
  selectedDate,
  dateRangeStart,
  dateRangeLabel,
  visibleDates,
  isCalendarOpen,
  onCalendarOpenChange,
  getDateCount,
  onDateSelect,
  onNavigate,
  onDateRangeSelect,
}: PurchasesDateStripProps) {
  return (
    <div className='flex items-center gap-2'>
      {/* Left Arrow */}
      <Button
        variant='ghost'
        size='icon'
        onClick={() => onNavigate(-1)}
        className='h-9 w-9 shrink-0'
      >
        <MdChevronLeft className='h-4 w-4' />
      </Button>

      {/* 5 Date Buttons */}
      <div className='flex items-center gap-1.5'>
        {visibleDates.map((tab) => {
          const count = getDateCount(tab.date)
          const isSelected =
            selectedDate &&
            startOfDay(tab.date).getTime() === startOfDay(selectedDate).getTime() &&
            !dateRangeStart
          const isTodayDate = isToday(tab.date)

          return (
            <button
              key={tab.date.getTime()}
              onClick={() =>
                onDateSelect(tab.date, isTodayDate ? 'Today' : format(tab.date, 'MMM d, yyyy'))
              }
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all',
                isSelected ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted',
                isTodayDate && !isSelected && 'ring-2 ring-primary/30'
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected
                    ? 'text-primary-foreground'
                    : isTodayDate
                      ? 'text-primary'
                      : 'text-muted-foreground'
                )}
              >
                {tab.label}
              </span>
              <span
                className={cn(
                  'text-sm font-bold',
                  isSelected ? 'text-primary-foreground' : 'text-foreground'
                )}
              >
                {tab.dayNum}
              </span>
              <span
                className={cn(
                  'text-xs',
                  isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  count === 0 && 'opacity-50'
                )}
              >
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* Right Arrow */}
      <Button
        variant='ghost'
        size='icon'
        onClick={() => onNavigate(1)}
        className='h-9 w-9 shrink-0'
      >
        <MdChevronRight className='h-4 w-4' />
      </Button>

      {/* Today Button - only shows when not viewing today */}
      {selectedDate && !isToday(selectedDate) && !dateRangeStart && (
        <Button
          variant='outline'
          size='sm'
          onClick={() => onDateSelect(new Date(), 'Today')}
          className='ml-2'
        >
          Today
        </Button>
      )}

      {/* Date Range Picker */}
      <Popover open={isCalendarOpen} onOpenChange={onCalendarOpenChange}>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' className='ml-auto gap-2'>
            <MdCalendarToday className='h-4 w-4' />
            {dateRangeLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='end'>
          <div className='p-3 border-b'>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant={dateRangeLabel === 'Last 3 Days' ? 'default' : 'outline'}
                size='sm'
                onClick={() => {
                  onDateRangeSelect(subDays(new Date(), 2), new Date(), 'Last 3 Days')
                  onCalendarOpenChange(false)
                }}
              >
                Last 3 Days
              </Button>
              <Button
                variant={dateRangeLabel === 'Last 7 Days' ? 'default' : 'outline'}
                size='sm'
                onClick={() => {
                  onDateRangeSelect(subDays(new Date(), 6), new Date(), 'Last 7 Days')
                  onCalendarOpenChange(false)
                }}
              >
                Last 7 Days
              </Button>
              <Button
                variant={dateRangeLabel === '1 Month' ? 'default' : 'outline'}
                size='sm'
                onClick={() => {
                  onDateRangeSelect(subDays(new Date(), 29), new Date(), '1 Month')
                  onCalendarOpenChange(false)
                }}
              >
                1 Month
              </Button>
              <Button
                variant={dateRangeLabel === '3 Months' ? 'default' : 'outline'}
                size='sm'
                onClick={() => {
                  onDateRangeSelect(subDays(new Date(), 89), new Date(), '3 Months')
                  onCalendarOpenChange(false)
                }}
              >
                3 Months
              </Button>
              <Button
                variant={dateRangeLabel === 'All dates' ? 'default' : 'outline'}
                size='sm'
                onClick={() => {
                  onDateRangeSelect(undefined, undefined, 'All dates')
                  onCalendarOpenChange(false)
                }}
              >
                All dates
              </Button>
            </div>
          </div>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateSelect(date, format(date, 'MMM d, yyyy'))
                onCalendarOpenChange(false)
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
