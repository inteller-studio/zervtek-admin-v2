'use client'

import { useState } from 'react'
import { Filter, RotateCcw, Search as SearchIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { DatePicker } from '@/components/date-picker'
import { Badge } from '@/components/ui/badge'
import { type FilterState, type SortOption, SORT_OPTIONS } from '../types'

interface WonAuctionsFiltersProps {
  filters: FilterState
  sortBy: SortOption
  uniquePorts: string[]
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  onSortChange: (sort: SortOption) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export function WonAuctionsFilters({
  filters,
  sortBy,
  uniquePorts,
  onFilterChange,
  onSortChange,
  onReset,
  hasActiveFilters,
}: WonAuctionsFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const valueMin = filters.valueRange.min ?? 0
  const valueMax = filters.valueRange.max ?? 200000

  return (
    <div className='space-y-4'>
      {/* Search and Sort Bar */}
      <div className='flex flex-col gap-4 sm:flex-row'>
        <div className='relative flex-1'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search by vehicle, customer, or auction ID...'
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className='pl-10'
          />
        </div>
        <div className='flex flex-wrap gap-2'>
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={isFilterOpen ? 'default' : 'outline'}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className='relative'
          >
            <Filter className='mr-2 h-4 w-4' />
            Advanced Filters
            {hasActiveFilters && (
              <span className='absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary' />
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant='ghost' size='sm' onClick={onReset}>
              <RotateCcw className='mr-2 h-4 w-4' />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Active filters:</span>
          {filters.vinSearch && (
            <Badge variant='secondary' className='gap-1'>
              VIN: {filters.vinSearch}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => onFilterChange('vinSearch', '')}
              />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant='secondary' className='gap-1'>
              Status: {filters.status.replace(/_/g, ' ')}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => onFilterChange('status', 'all')}
              />
            </Badge>
          )}
          {filters.paymentStatus !== 'all' && (
            <Badge variant='secondary' className='gap-1'>
              Payment: {filters.paymentStatus}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => onFilterChange('paymentStatus', 'all')}
              />
            </Badge>
          )}
          {filters.destinationPort.length > 0 && (
            <Badge variant='secondary' className='gap-1'>
              Ports: {filters.destinationPort.length}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => onFilterChange('destinationPort', [])}
              />
            </Badge>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant='secondary' className='gap-1'>
              Date Range
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => onFilterChange('dateRange', {})}
              />
            </Badge>
          )}
          {(filters.valueRange.min !== undefined || filters.valueRange.max !== undefined) && (
            <Badge variant='secondary' className='gap-1'>
              Value: ¥{valueMin.toLocaleString()} - ¥{valueMax.toLocaleString()}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => onFilterChange('valueRange', {})}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Advanced Filters Panel */}
      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <CollapsibleContent>
          <Card>
            <CardContent className='pt-6'>
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                {/* VIN Search */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>VIN Search</Label>
                  <Input
                    placeholder='Enter VIN...'
                    value={filters.vinSearch}
                    onChange={(e) => onFilterChange('vinSearch', e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(v) => onFilterChange('status', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='All statuses' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Statuses</SelectItem>
                      <SelectItem value='payment_pending'>Payment Pending</SelectItem>
                      <SelectItem value='processing'>Processing</SelectItem>
                      <SelectItem value='documents_pending'>Documents Pending</SelectItem>
                      <SelectItem value='shipping'>Shipping</SelectItem>
                      <SelectItem value='delivered'>Delivered</SelectItem>
                      <SelectItem value='completed'>Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Status Filter */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Payment Status</Label>
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(v) => onFilterChange('paymentStatus', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='All payment statuses' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Payment Statuses</SelectItem>
                      <SelectItem value='pending'>Pending</SelectItem>
                      <SelectItem value='partial'>Partial</SelectItem>
                      <SelectItem value='completed'>Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Date Range</Label>
                  <div className='flex flex-col gap-2'>
                    <DatePicker
                      selected={filters.dateRange.from}
                      onSelect={(date) =>
                        onFilterChange('dateRange', { ...filters.dateRange, from: date })
                      }
                      placeholder='From date'
                    />
                    <DatePicker
                      selected={filters.dateRange.to}
                      onSelect={(date) =>
                        onFilterChange('dateRange', { ...filters.dateRange, to: date })
                      }
                      placeholder='To date'
                    />
                  </div>
                </div>

                {/* Value Range */}
                <div className='space-y-3 lg:col-span-2'>
                  <Label className='text-sm font-medium'>
                    Value Range: ¥{valueMin.toLocaleString()} - ¥{valueMax.toLocaleString()}
                  </Label>
                  <Slider
                    value={[valueMin, valueMax]}
                    onValueChange={([min, max]) => onFilterChange('valueRange', { min, max })}
                    min={0}
                    max={200000}
                    step={5000}
                    className='py-4'
                  />
                </div>

                {/* Destination Port */}
                <div className='space-y-3 lg:col-span-2'>
                  <Label className='text-sm font-medium'>Destination Port</Label>
                  <div className='grid max-h-40 grid-cols-2 gap-2 overflow-y-auto'>
                    {uniquePorts.map((port) => (
                      <div key={port} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`port-${port}`}
                          checked={filters.destinationPort.includes(port)}
                          onCheckedChange={(checked) => {
                            const newPorts = checked
                              ? [...filters.destinationPort, port]
                              : filters.destinationPort.filter((p) => p !== port)
                            onFilterChange('destinationPort', newPorts)
                          }}
                        />
                        <Label
                          htmlFor={`port-${port}`}
                          className='cursor-pointer text-sm font-normal'
                        >
                          {port}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
