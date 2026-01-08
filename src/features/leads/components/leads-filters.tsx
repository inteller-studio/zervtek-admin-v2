'use client'

import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AnimatedTabs,
  AnimatedTabsContent,
  type TabItem,
} from '@/components/ui/animated-tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MdSearch,
  MdFilterList,
  MdClose,
  MdDirectionsCar,
  MdVerifiedUser,
  MdFactCheck,
  MdInbox,
} from 'react-icons/md'
import {
  type SubmissionType,
  statusOptionsByType,
  getTypeCounts,
  getAttentionCounts,
} from '../data/unified-leads'
import { staffMembers } from '../data/submissions'

export interface LeadsFilterState {
  typeFilter: 'all' | SubmissionType
  searchTerm: string
  statusFilter: string
  assigneeFilter: string
}

interface LeadsFiltersProps {
  filters: LeadsFilterState
  onFiltersChange: (filters: LeadsFilterState) => void
  resultCount: number
  children?: React.ReactNode
}

export function LeadsFilters({
  filters,
  onFiltersChange,
  resultCount,
  children,
}: LeadsFiltersProps) {
  const typeCounts = useMemo(() => getTypeCounts(), [])
  const attentionCounts = useMemo(() => getAttentionCounts(), [])

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: 'all',
        label: 'All',
        icon: MdInbox,
        badge: typeCounts.all,
        badgeColor: 'primary',
      },
      {
        id: 'inquiry',
        label: 'Inquiries',
        icon: MdDirectionsCar,
        badge: attentionCounts.inquiry > 0 ? attentionCounts.inquiry : undefined,
        badgeColor: 'primary',
      },
      {
        id: 'signup',
        label: 'Signups',
        icon: MdVerifiedUser,
        badge: attentionCounts.signup > 0 ? attentionCounts.signup : undefined,
        badgeColor: 'amber',
      },
      {
        id: 'onboarding',
        label: 'Onboarding',
        icon: MdFactCheck,
        badge:
          attentionCounts.onboarding > 0 ? attentionCounts.onboarding : undefined,
        badgeColor: 'primary',
      },
    ],
    [typeCounts, attentionCounts]
  )

  const statusOptions = useMemo(
    () => statusOptionsByType[filters.typeFilter],
    [filters.typeFilter]
  )

  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      typeFilter: type as 'all' | SubmissionType,
      statusFilter: 'all', // Reset status when type changes
    })
  }

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, statusFilter: value })
  }

  const handleAssigneeChange = (value: string) => {
    onFiltersChange({ ...filters, assigneeFilter: value })
  }

  const hasActiveFilters =
    filters.statusFilter !== 'all' || filters.assigneeFilter !== 'all'

  const activeFilterCount =
    (filters.statusFilter !== 'all' ? 1 : 0) +
    (filters.assigneeFilter !== 'all' ? 1 : 0)

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      statusFilter: 'all',
      assigneeFilter: 'all',
    })
  }

  return (
    <AnimatedTabs
      tabs={tabs}
      value={filters.typeFilter}
      onValueChange={handleTypeChange}
      variant='compact'
    >
      {/* Filter Controls */}
      <div className='flex items-center justify-between gap-3 flex-wrap px-4 py-3 border-b bg-card'>
        {/* Search Input */}
        <div className='relative flex-1 min-w-[200px] max-w-sm'>
          <MdSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search by name, email, ID...'
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-9 h-9'
          />
        </div>

        {/* Filter Dropdowns */}
        <div className='flex items-center gap-2'>
          <Select value={filters.statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className='w-[140px] h-9'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.assigneeFilter}
            onValueChange={handleAssigneeChange}
          >
            <SelectTrigger className='w-[160px] h-9'>
              <SelectValue placeholder='Assignee' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Assignees</SelectItem>
              <SelectItem value='unassigned'>Unassigned</SelectItem>
              {staffMembers.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              className='h-9 text-muted-foreground'
            >
              <MdClose className='h-3.5 w-3.5 mr-1' />
              Clear
              <Badge
                variant='destructive'
                className='ml-1 h-4 w-4 p-0 text-[10px] rounded-full'
              >
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>

        {/* Result Count */}
        <span className='text-sm text-muted-foreground'>
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content Area */}
      <AnimatedTabsContent value='all' className='mt-0'>
        {children}
      </AnimatedTabsContent>
      <AnimatedTabsContent value='inquiry' className='mt-0'>
        {children}
      </AnimatedTabsContent>
      <AnimatedTabsContent value='signup' className='mt-0'>
        {children}
      </AnimatedTabsContent>
      <AnimatedTabsContent value='onboarding' className='mt-0'>
        {children}
      </AnimatedTabsContent>
    </AnimatedTabs>
  )
}
