'use client'

import { useMemo } from 'react'
import { MdFactCheck, MdTranslate, MdSearch } from 'react-icons/md'
import { Input } from '@/components/ui/input'
import { AnimatedTabs, type TabItem } from '@/components/ui/animated-tabs'
import type { ServiceTypeFilter } from '../types'

interface ServicesFilterTabsProps {
  typeFilter: ServiceTypeFilter
  onTypeFilterChange: (filter: ServiceTypeFilter) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  translationCount?: number
  inspectionCount?: number
}

export function ServicesFilterTabs({
  typeFilter,
  onTypeFilterChange,
  searchQuery,
  onSearchChange,
  translationCount,
  inspectionCount,
}: ServicesFilterTabsProps) {
  const tabs: TabItem[] = useMemo(() => [
    { id: 'all', label: 'All' },
    {
      id: 'translation',
      label: 'Translations',
      icon: MdTranslate,
      badge: translationCount && translationCount > 0 ? translationCount : undefined,
      badgeColor: 'primary'
    },
    {
      id: 'inspection',
      label: 'Inspections',
      icon: MdFactCheck,
      badge: inspectionCount && inspectionCount > 0 ? inspectionCount : undefined,
      badgeColor: 'amber'
    },
  ], [translationCount, inspectionCount])

  return (
    <div className='flex items-center gap-4'>
      <AnimatedTabs
        tabs={tabs}
        value={typeFilter}
        onValueChange={(value) => onTypeFilterChange(value as ServiceTypeFilter)}
        variant="compact"
      />

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
