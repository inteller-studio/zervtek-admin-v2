'use client'

import { MdCalendarToday, MdDownload } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DateRangeType } from '../types/accounting'

interface ReportFiltersProps {
  rangeType: DateRangeType
  onRangeChange: (type: DateRangeType) => void
  formatRangeLabel: string
  onExport?: () => void
}

export function ReportFilters({
  rangeType,
  onRangeChange,
  formatRangeLabel,
  onExport,
}: ReportFiltersProps) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-4'>
      <div className='flex items-center gap-3'>
        <Select value={rangeType} onValueChange={(v) => onRangeChange(v as DateRangeType)}>
          <SelectTrigger className='w-[160px]'>
            <MdCalendarToday className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Select period' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='today'>Today</SelectItem>
            <SelectItem value='week'>This Week</SelectItem>
            <SelectItem value='month'>This Month</SelectItem>
            <SelectItem value='quarter'>This Quarter</SelectItem>
            <SelectItem value='year'>This Year</SelectItem>
          </SelectContent>
        </Select>
        <span className='text-muted-foreground text-sm'>{formatRangeLabel}</span>
      </div>
      {onExport && (
        <Button variant='outline' size='sm' onClick={onExport}>
          <MdDownload className='mr-2 h-4 w-4' />
          Export
        </Button>
      )}
    </div>
  )
}
