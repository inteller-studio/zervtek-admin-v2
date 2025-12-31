'use client'

import { MdFilterList, MdLocalOffer, MdPerson, MdClose } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ConversationLabel, StaffMember } from '../../types'
import { useWhatsAppUIStore } from '../../stores/whatsapp-ui-store'
import { getLabelColorConfig } from '../../data/label-colors'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  labels: ConversationLabel[]
  staffMembers: StaffMember[]
}

export function FilterBar({ labels, staffMembers }: FilterBarProps) {
  const {
    labelFilter,
    toggleLabelFilter,
    clearLabelFilter,
    assignmentFilter,
    setAssignmentFilter,
  } = useWhatsAppUIStore()

  const hasFilters = labelFilter.length > 0 || assignmentFilter !== null
  const activeFilterCount = labelFilter.length + (assignmentFilter ? 1 : 0)

  // Get selected label names for display
  const selectedLabels = labels.filter((l) => labelFilter.includes(l.id))

  // Get assigned staff name for display
  const assignedStaff = staffMembers.find((s) => s.id === assignmentFilter)

  return (
    <div className='flex flex-wrap items-center gap-2 border-b px-3 py-2'>
      {/* Label filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={labelFilter.length > 0 ? 'secondary' : 'outline'}
            size='sm'
            className='h-7 gap-1 text-xs'
          >
            <MdLocalOffer className='h-3 w-3' />
            Labels
            {labelFilter.length > 0 && (
              <span className='ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground'>
                {labelFilter.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-48'>
          <DropdownMenuLabel className='text-xs'>Filter by label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {labels.map((label) => {
            const colorConfig = getLabelColorConfig(label.color)
            return (
              <DropdownMenuCheckboxItem
                key={label.id}
                checked={labelFilter.includes(label.id)}
                onCheckedChange={() => toggleLabelFilter(label.id)}
              >
                <span className='flex items-center gap-2'>
                  <span className={cn('h-2 w-2 rounded-full', colorConfig.dotClass)} />
                  {label.name}
                </span>
              </DropdownMenuCheckboxItem>
            )
          })}
          {labelFilter.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start text-xs'
                onClick={clearLabelFilter}
              >
                Clear label filters
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Assignment filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={assignmentFilter ? 'secondary' : 'outline'}
            size='sm'
            className='h-7 gap-1 text-xs'
          >
            <MdPerson className='h-3 w-3' />
            {assignmentFilter === 'unassigned'
              ? 'Unassigned'
              : assignedStaff
                ? `${assignedStaff.firstName}`
                : 'Assigned to'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-48'>
          <DropdownMenuLabel className='text-xs'>Filter by assignment</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={assignmentFilter === 'unassigned'}
            onCheckedChange={() =>
              setAssignmentFilter(assignmentFilter === 'unassigned' ? null : 'unassigned')
            }
          >
            Unassigned
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {staffMembers.map((staff) => (
            <DropdownMenuCheckboxItem
              key={staff.id}
              checked={assignmentFilter === staff.id}
              onCheckedChange={() =>
                setAssignmentFilter(assignmentFilter === staff.id ? null : staff.id)
              }
            >
              <span className='flex items-center gap-2'>
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium',
                    staff.isOnline ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {staff.firstName[0]}
                  {staff.lastName[0]}
                </span>
                {staff.firstName} {staff.lastName}
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear all filters */}
      {hasFilters && (
        <Button
          variant='ghost'
          size='sm'
          className='h-7 gap-1 text-xs text-muted-foreground'
          onClick={() => {
            clearLabelFilter()
            setAssignmentFilter(null)
          }}
        >
          <MdClose className='h-3 w-3' />
          Clear ({activeFilterCount})
        </Button>
      )}

      {/* Active filter chips */}
      {selectedLabels.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {selectedLabels.slice(0, 2).map((label) => {
            const colorConfig = getLabelColorConfig(label.color)
            return (
              <span
                key={label.id}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] transition-opacity duration-150',
                  colorConfig.bgClass,
                  colorConfig.textClass
                )}
              >
                {label.name}
                <button
                  onClick={() => toggleLabelFilter(label.id)}
                  className='rounded-full p-0.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                >
                  <MdClose className='h-2.5 w-2.5' />
                </button>
              </span>
            )
          })}
          {selectedLabels.length > 2 && (
            <span className='text-[10px] text-muted-foreground'>
              +{selectedLabels.length - 2} more
            </span>
          )}
        </div>
      )}
    </div>
  )
}
