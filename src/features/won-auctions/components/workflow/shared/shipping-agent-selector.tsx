'use client'

import { useState } from 'react'
import { MdCheck, MdUnfoldMore, MdLocalShipping, MdAdd } from 'react-icons/md'
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
import { type ShippingAgent } from '../../../../shipping-agents/types'

interface ShippingAgentSelectorProps {
  agents: ShippingAgent[]
  selectedAgentId: string | null
  onSelect: (agent: ShippingAgent | null) => void
  onAddAgent?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function ShippingAgentSelector({
  agents,
  selectedAgentId,
  onSelect,
  onAddAgent,
  disabled = false,
  placeholder = 'Select a shipping agent...',
  className,
}: ShippingAgentSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  const handleAddAgent = () => {
    setOpen(false)
    onAddAgent?.()
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
            !selectedAgent && 'text-muted-foreground',
            className
          )}
        >
          {selectedAgent ? (
            <div className='flex items-center gap-2 text-left'>
              <MdLocalShipping className='h-4 w-4 shrink-0 text-muted-foreground' />
              <div className='flex-1 min-w-0'>
                <p className='font-medium truncate'>{selectedAgent.name}</p>
                <p className='text-xs text-muted-foreground truncate'>
                  {selectedAgent.city}, {selectedAgent.country}
                </p>
              </div>
            </div>
          ) : (
            <span className='flex items-center gap-2'>
              <MdLocalShipping className='h-4 w-4' />
              {placeholder}
            </span>
          )}
          <MdUnfoldMore className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[400px] p-0' align='start'>
        <Command>
          <CommandInput placeholder='Search shipping agents...' />
          <CommandList>
            <CommandEmpty>No shipping agent found.</CommandEmpty>
            <CommandGroup>
              {agents.map((agent) => (
                <CommandItem
                  key={agent.id}
                  value={`${agent.name} ${agent.city}`}
                  onSelect={() => {
                    onSelect(agent.id === selectedAgentId ? null : agent)
                    setOpen(false)
                  }}
                  className='flex items-start gap-3 py-3'
                >
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <p className='font-medium'>{agent.name}</p>
                      <Badge
                        variant={agent.status === 'active' ? 'default' : 'secondary'}
                        className='text-xs'
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground mt-0.5'>
                      {agent.address}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {agent.city}, {agent.country} • {agent.contactPerson}
                    </p>
                  </div>
                  <MdCheck
                    className={cn(
                      'h-4 w-4 shrink-0',
                      selectedAgentId === agent.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            {onAddAgent && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleAddAgent}
                    className='flex items-center gap-2 py-2.5 cursor-pointer'
                  >
                    <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                      <MdAdd className='h-4 w-4 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium text-primary'>Add New Agent</p>
                      <p className='text-xs text-muted-foreground'>Create a new shipping agent</p>
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
