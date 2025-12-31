'use client'

import { useState } from 'react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { MdCalendarToday, MdExpandMore } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { StatsDateRange } from '../../types'

type DateRangePreset = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'custom'

interface StatsDateRangeFilterProps {
  value: StatsDateRange
  onValueChange: (range: StatsDateRange) => void
  className?: string
}

const presets: { value: DateRangePreset; label: string; getRange: () => StatsDateRange }[] = [
  {
    value: 'today',
    label: 'Today',
    getRange: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    value: 'yesterday',
    label: 'Yesterday',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    value: 'last_7_days',
    label: 'Last 7 days',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
  },
  {
    value: 'last_30_days',
    label: 'Last 30 days',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
  },
]

export function StatsDateRangeFilter({
  value,
  onValueChange,
  className,
}: StatsDateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({})

  // Determine current preset or if custom
  const currentPreset = presets.find((p) => {
    const range = p.getRange()
    return (
      range.from.toDateString() === value.from.toDateString() &&
      range.to.toDateString() === value.to.toDateString()
    )
  })

  // Get display label
  const getDisplayLabel = () => {
    if (currentPreset) return currentPreset.label
    return `${format(value.from, 'MMM d')} - ${format(value.to, 'MMM d')}`
  }

  const handlePresetSelect = (preset: typeof presets[0]) => {
    onValueChange(preset.getRange())
    setShowCustom(false)
  }

  const handleCustomApply = () => {
    if (customRange.from && customRange.to) {
      onValueChange({
        from: startOfDay(customRange.from),
        to: endOfDay(customRange.to),
      })
      setShowCustom(false)
    }
  }

  if (showCustom) {
    return (
      <Popover open={showCustom} onOpenChange={setShowCustom}>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' className={cn('gap-2', className)}>
            <MdCalendarToday className='h-4 w-4' />
            Custom range
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-3' align='end'>
          <div className='flex gap-4'>
            <div>
              <p className='mb-2 text-xs font-medium text-muted-foreground'>From</p>
              <CalendarComponent
                mode='single'
                selected={customRange.from}
                onSelect={(date) => setCustomRange((prev) => ({ ...prev, from: date }))}
                disabled={(date) => date > new Date()}
              />
            </div>
            <div>
              <p className='mb-2 text-xs font-medium text-muted-foreground'>To</p>
              <CalendarComponent
                mode='single'
                selected={customRange.to}
                onSelect={(date) => setCustomRange((prev) => ({ ...prev, to: date }))}
                disabled={(date) => date > new Date() || (customRange.from ? date < customRange.from : false)}
              />
            </div>
          </div>
          <div className='mt-4 flex justify-end gap-2'>
            <Button variant='outline' size='sm' onClick={() => setShowCustom(false)}>
              Cancel
            </Button>
            <Button
              size='sm'
              onClick={handleCustomApply}
              disabled={!customRange.from || !customRange.to}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className={cn('gap-2', className)}>
          <MdCalendarToday className='h-4 w-4' />
          {getDisplayLabel()}
          <MdExpandMore className='h-3 w-3 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {presets.map((preset) => (
          <DropdownMenuItem
            key={preset.value}
            onClick={() => handlePresetSelect(preset)}
            className={cn(currentPreset?.value === preset.value && 'bg-accent')}
          >
            {preset.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowCustom(true)}>
          <MdCalendarToday className='mr-2 h-4 w-4' />
          Custom range...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
