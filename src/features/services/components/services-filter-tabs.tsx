'use client'

import { MdFactCheck, MdTranslate, MdSearch } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ServiceTypeFilter } from '../types'

interface ServicesFilterTabsProps {
  typeFilter: ServiceTypeFilter
  onTypeFilterChange: (filter: ServiceTypeFilter) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ServicesFilterTabs({
  typeFilter,
  onTypeFilterChange,
  searchQuery,
  onSearchChange,
}: ServicesFilterTabsProps) {
  return (
    <div className='flex items-center gap-2'>
      <Button
        variant={typeFilter === 'all' ? 'default' : 'outline'}
        size='sm'
        onClick={() => onTypeFilterChange('all')}
        className='rounded-full'
      >
        All
      </Button>
      <Button
        variant={typeFilter === 'translation' ? 'default' : 'outline'}
        size='sm'
        onClick={() => onTypeFilterChange('translation')}
        className={cn(
          'rounded-full gap-1.5',
          typeFilter === 'translation' && 'bg-blue-600 hover:bg-blue-700'
        )}
      >
        <MdTranslate className='h-3.5 w-3.5' />
        Translations
      </Button>
      <Button
        variant={typeFilter === 'inspection' ? 'default' : 'outline'}
        size='sm'
        onClick={() => onTypeFilterChange('inspection')}
        className={cn(
          'rounded-full gap-1.5',
          typeFilter === 'inspection' && 'bg-amber-600 hover:bg-amber-700'
        )}
      >
        <MdFactCheck className='h-3.5 w-3.5' />
        Inspections
      </Button>

      <div className='flex-1' />

      <div className='relative max-w-xs'>
        <MdSearch className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
        <Input
          placeholder='Search...'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-10 h-9'
        />
      </div>
    </div>
  )
}
