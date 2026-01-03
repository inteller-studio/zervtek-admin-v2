'use client'

import { MdSearch } from 'react-icons/md'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SortOption } from '../types'

interface BidsSearchBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
}

export function BidsSearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: BidsSearchBarProps) {
  return (
    <div className='flex flex-wrap items-center gap-3'>
      {/* Search Input */}
      <div className='relative flex-1 min-w-[200px] max-w-md'>
        <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search'
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
    </div>
  )
}
