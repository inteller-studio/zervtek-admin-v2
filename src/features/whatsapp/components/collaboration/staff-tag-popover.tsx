'use client'

import { useState } from 'react'
import { MdCheck, MdPersonAdd } from 'react-icons/md'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { StaffMember, StaffGroup } from '../../types'
import { useWhatsAppUIStore } from '../../stores/whatsapp-ui-store'

interface StaffTagPopoverProps {
  staffMembers: StaffMember[]
  staffGroups?: StaffGroup[]
  selectedStaffId?: string
  onSelectStaff: (staffId: string | null) => void
  assignOnSelect?: boolean
  onAssign?: (staffId: string) => void
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function StaffTagPopover({
  staffMembers,
  staffGroups,
  selectedStaffId,
  onSelectStaff,
  assignOnSelect = false,
  onAssign,
  children,
  open,
  onOpenChange,
}: StaffTagPopoverProps) {
  const [search, setSearch] = useState('')
  const [shouldAssign, setShouldAssign] = useState(false)

  // Filter staff by search
  const filteredStaff = staffMembers.filter((staff) => {
    const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase()
    const searchLower = search.toLowerCase()
    return fullName.includes(searchLower) || staff.email.toLowerCase().includes(searchLower)
  })

  // Group staff by role
  const groupedStaff = {
    online: filteredStaff.filter((s) => s.isOnline),
    offline: filteredStaff.filter((s) => !s.isOnline),
  }

  const handleSelect = (staffId: string) => {
    onSelectStaff(staffId)
    if (assignOnSelect && shouldAssign && onAssign) {
      onAssign(staffId)
    }
    onOpenChange?.(false)
  }

  const handleClear = () => {
    onSelectStaff(null)
    onOpenChange?.(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className='w-64 p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Search team members...'
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No team members found.</CommandEmpty>

            {/* Online staff */}
            {groupedStaff.online.length > 0 && (
              <CommandGroup heading='Online'>
                {groupedStaff.online.map((staff) => (
                  <StaffItem
                    key={staff.id}
                    staff={staff}
                    isSelected={selectedStaffId === staff.id}
                    onSelect={() => handleSelect(staff.id)}
                  />
                ))}
              </CommandGroup>
            )}

            {/* Offline staff */}
            {groupedStaff.offline.length > 0 && (
              <CommandGroup heading='Offline'>
                {groupedStaff.offline.map((staff) => (
                  <StaffItem
                    key={staff.id}
                    staff={staff}
                    isSelected={selectedStaffId === staff.id}
                    onSelect={() => handleSelect(staff.id)}
                  />
                ))}
              </CommandGroup>
            )}

            {/* Clear selection */}
            {selectedStaffId && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleClear} className='text-muted-foreground'>
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>

          {/* Assign checkbox */}
          {assignOnSelect && onAssign && (
            <>
              <CommandSeparator />
              <div className='flex items-center gap-2 px-3 py-2'>
                <Checkbox
                  id='assign'
                  checked={shouldAssign}
                  onCheckedChange={(checked) => setShouldAssign(!!checked)}
                />
                <label htmlFor='assign' className='text-xs text-muted-foreground cursor-pointer'>
                  Also assign this conversation
                </label>
              </div>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface StaffItemProps {
  staff: StaffMember
  isSelected: boolean
  onSelect: () => void
}

function StaffItem({ staff, isSelected, onSelect }: StaffItemProps) {
  const initials = `${staff.firstName[0]}${staff.lastName[0]}`

  return (
    <CommandItem
      value={staff.id}
      onSelect={onSelect}
      className='flex items-center gap-2'
    >
      <div className='relative'>
        <Avatar className='h-7 w-7'>
          <AvatarImage src={staff.avatarUrl} />
          <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
        </Avatar>
        {staff.isOnline && (
          <span className='absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500' />
        )}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium truncate'>
          {staff.firstName} {staff.lastName}
        </p>
        <p className='text-xs text-muted-foreground capitalize truncate'>
          {staff.role.replace('_', ' ')}
        </p>
      </div>
      {isSelected && <MdCheck className='h-4 w-4 text-primary shrink-0' />}
    </CommandItem>
  )
}

// Convenience wrapper that uses the UI store
interface ChatAssignPopoverProps {
  chatId: string
  staffMembers: StaffMember[]
  currentAssigneeId?: string
  onAssign: (chatId: string, staffId: string | null) => void
  children: React.ReactNode
}

export function ChatAssignPopover({
  chatId,
  staffMembers,
  currentAssigneeId,
  onAssign,
  children,
}: ChatAssignPopoverProps) {
  const { assignPopoverChatId, setAssignPopoverChatId } = useWhatsAppUIStore()

  const isOpen = assignPopoverChatId === chatId

  return (
    <StaffTagPopover
      staffMembers={staffMembers}
      selectedStaffId={currentAssigneeId}
      onSelectStaff={(staffId) => onAssign(chatId, staffId)}
      open={isOpen}
      onOpenChange={(open) => setAssignPopoverChatId(open ? chatId : null)}
    >
      {children}
    </StaffTagPopover>
  )
}
