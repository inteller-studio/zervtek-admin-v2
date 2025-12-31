'use client'

import { MdFilterList, MdGridView, MdList, MdRefresh, MdSearch } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { SortOption, ViewMode } from '../types'

interface BidsSearchBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  isFilterOpen: boolean
  onFilterToggle: () => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function BidsSearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  isFilterOpen,
  onFilterToggle,
  hasActiveFilters,
  onClearFilters,
}: BidsSearchBarProps) {
  return (
    <div className='flex flex-wrap items-center gap-3'>
      {/* Search Input */}
      <div className='relative flex-1 min-w-[200px] max-w-md'>
        <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search bids, vehicles, bidders...'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-9'
        />
      </div>

      {/* Sort Select */}
      <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className='w-[160px]'>
          <SelectValue placeholder='Sort by' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='ending-soon'>Ending Soon</SelectItem>
          <SelectItem value='recent'>Most Recent</SelectItem>
          <SelectItem value='oldest'>Oldest First</SelectItem>
          <SelectItem value='amount-high'>Highest Amount</SelectItem>
          <SelectItem value='amount-low'>Lowest Amount</SelectItem>
        </SelectContent>
      </Select>

      {/* View Toggle */}
      <div className='flex items-center border rounded-lg p-1'>
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size='sm'
          className='h-8 px-3'
          onClick={() => onViewModeChange('table')}
        >
          <MdList className='h-4 w-4' />
        </Button>
        <Button
          variant={viewMode === 'cards' ? 'default' : 'ghost'}
          size='sm'
          className='h-8 px-3'
          onClick={() => onViewModeChange('cards')}
        >
          <MdGridView className='h-4 w-4' />
        </Button>
      </div>

      {/* Filter Button */}
      <Button
        variant={isFilterOpen ? 'default' : 'outline'}
        size='sm'
        onClick={onFilterToggle}
        className='gap-2'
      >
        <MdFilterList className='h-4 w-4' />
        Filters
        {hasActiveFilters && (
          <span className='ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-xs font-medium'>
            !
          </span>
        )}
      </Button>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant='ghost' size='sm' onClick={onClearFilters} className='gap-2'>
          <MdRefresh className='h-4 w-4' />
          Clear
        </Button>
      )}
    </div>
  )
}
