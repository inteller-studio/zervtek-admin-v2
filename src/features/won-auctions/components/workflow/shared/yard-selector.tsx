'use client'

import { useState } from 'react'
import { MdCheck, MdUnfoldMore, MdLocationOn, MdBusiness, MdAdd } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type Yard } from '../../../../yards/types'

interface YardSelectorProps {
  yards: Yard[]
  selectedYardId: string | null
  onSelect: (yard: Yard | null) => void
  onAddYard?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function YardSelector({
  yards,
  selectedYardId,
  onSelect,
  onAddYard,
  disabled = false,
  placeholder = 'Select a yard...',
  className,
}: YardSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedYard = yards.find((y) => y.id === selectedYardId)

  const handleAddYard = () => {
    setOpen(false)
    onAddYard?.()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between h-auto min-h-10 py-2',
            !selectedYard && 'text-muted-foreground',
            className
          )}
        >
          {selectedYard ? (
            <div className='flex items-center gap-2 text-left'>
              <MdBusiness className='h-4 w-4 shrink-0 text-muted-foreground' />
              <div className='flex-1 min-w-0'>
                <p className='font-medium truncate'>{selectedYard.name}</p>
                <p className='text-xs text-muted-foreground truncate'>
                  {selectedYard.city}, {selectedYard.prefecture}
                </p>
              </div>
            </div>
          ) : (
            <span className='flex items-center gap-2'>
              <MdLocationOn className='h-4 w-4' />
              {placeholder}
            </span>
          )}
          <MdUnfoldMore className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[400px] p-0' align='start'>
        <Command>
          <CommandInput placeholder='Search yards...' />
          <CommandList>
            <CommandEmpty>No yard found.</CommandEmpty>
            <CommandGroup>
              {yards.map((yard) => (
                <CommandItem
                  key={yard.id}
                  value={`${yard.name} ${yard.city}`}
                  onSelect={() => {
                    onSelect(yard.id === selectedYardId ? null : yard)
                    setOpen(false)
                  }}
                  className='flex items-start gap-3 py-3'
                >
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <p className='font-medium'>{yard.name}</p>
                      <Badge
                        variant={yard.status === 'active' ? 'default' : 'secondary'}
                        className='text-xs'
                      >
                        {yard.status}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground mt-0.5'>
                      {yard.address}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {yard.city}, {yard.prefecture} • {yard.contactPerson}
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      Capacity: {yard.currentVehicles}/{yard.capacity} vehicles
                    </p>
                  </div>
                  <MdCheck
                    className={cn(
                      'h-4 w-4 shrink-0',
                      selectedYardId === yard.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            {onAddYard && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleAddYard}
                    className='flex items-center gap-2 py-2.5 cursor-pointer'
                  >
                    <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                      <MdAdd className='h-4 w-4 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium text-primary'>Add New Yard</p>
                      <p className='text-xs text-muted-foreground'>Create a new storage yard</p>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
