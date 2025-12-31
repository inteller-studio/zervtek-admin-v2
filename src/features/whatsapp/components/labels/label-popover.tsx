'use client'

import { useState } from 'react'
import { MdCheck, MdAdd } from 'react-icons/md'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { ConversationLabel } from '../../types'
import { getLabelColorConfig } from '../../data/label-colors'
import { useWhatsAppUIStore } from '../../stores/whatsapp-ui-store'

interface LabelPopoverProps {
  labels: ConversationLabel[]
  selectedLabelIds: string[]
  onToggleLabel: (labelId: string) => void
  onCreateNew: () => void
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function LabelPopover({
  labels,
  selectedLabelIds,
  onToggleLabel,
  onCreateNew,
  children,
  open,
  onOpenChange,
}: LabelPopoverProps) {
  const [search, setSearch] = useState('')

  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className='w-56 p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Search labels...'
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No labels found.</CommandEmpty>
            <CommandGroup>
              {filteredLabels.map((label) => {
                const isSelected = selectedLabelIds.includes(label.id)
                const colorConfig = getLabelColorConfig(label.color)

                return (
                  <CommandItem
                    key={label.id}
                    value={label.id}
                    onSelect={() => onToggleLabel(label.id)}
                    className='flex items-center gap-2'
                  >
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border',
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                      )}
                    >
                      {isSelected && <MdCheck className='h-3 w-3 text-primary-foreground' />}
                    </div>
                    <span className={cn('h-2.5 w-2.5 rounded-full', colorConfig.dotClass)} />
                    <span className='flex-1 truncate'>{label.name}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={onCreateNew}
                className='flex items-center gap-2 text-primary'
              >
                <MdAdd className='h-4 w-4' />
                <span>Create new label</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Convenience wrapper that uses the UI store for state
interface ChatLabelPopoverProps {
  chatId: string
  labels: ConversationLabel[]
  chatLabels: ConversationLabel[]
  onAddLabel: (chatId: string, labelId: string) => void
  onRemoveLabel: (chatId: string, labelId: string) => void
  children: React.ReactNode
}

export function ChatLabelPopover({
  chatId,
  labels,
  chatLabels,
  onAddLabel,
  onRemoveLabel,
  children,
}: ChatLabelPopoverProps) {
  const { labelPopoverChatId, setLabelPopoverChatId, setCreateLabelOpen } = useWhatsAppUIStore()

  const isOpen = labelPopoverChatId === chatId

  const handleToggleLabel = (labelId: string) => {
    const isSelected = chatLabels.some((l) => l.id === labelId)
    if (isSelected) {
      onRemoveLabel(chatId, labelId)
    } else {
      onAddLabel(chatId, labelId)
    }
  }

  const handleCreateNew = () => {
    setLabelPopoverChatId(null)
    setCreateLabelOpen(true)
  }

  return (
    <LabelPopover
      labels={labels}
      selectedLabelIds={chatLabels.map((l) => l.id)}
      onToggleLabel={handleToggleLabel}
      onCreateNew={handleCreateNew}
      open={isOpen}
      onOpenChange={(open) => setLabelPopoverChatId(open ? chatId : null)}
    >
      {children}
    </LabelPopover>
  )
}
