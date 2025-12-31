'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { MdLock, MdSend, MdAlternateEmail } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { StaffMember } from '../../types'

interface InternalNoteInputProps {
  staffMembers: StaffMember[]
  onSend: (content: string, mentions: string[]) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export function InternalNoteInput({
  staffMembers,
  onSend,
  isLoading,
  placeholder = 'Add an internal note... Use @ to mention team members',
  className,
}: InternalNoteInputProps) {
  const [content, setContent] = useState('')
  const [mentions, setMentions] = useState<string[]>([])
  const [mentionPopoverOpen, setMentionPopoverOpen] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Filter staff for mention suggestions
  const filteredStaff = staffMembers.filter((staff) => {
    const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase()
    return fullName.includes(mentionSearch.toLowerCase())
  })

  // Handle text changes and detect @ mentions
  const handleChange = (value: string) => {
    setContent(value)

    // Find the @ symbol and extract search term
    const textarea = textareaRef.current
    if (textarea) {
      const cursorPos = textarea.selectionStart
      const textBeforeCursor = value.substring(0, cursorPos)
      const atMatch = textBeforeCursor.match(/@(\w*)$/)

      if (atMatch) {
        setMentionSearch(atMatch[1])
        setMentionPopoverOpen(true)
      } else {
        setMentionPopoverOpen(false)
        setMentionSearch('')
      }
    }
  }

  // Insert mention
  const insertMention = (staff: StaffMember) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    const textBeforeCursor = content.substring(0, cursorPos)
    const textAfterCursor = content.substring(cursorPos)
    const atMatch = textBeforeCursor.match(/@(\w*)$/)

    if (atMatch) {
      const beforeAt = textBeforeCursor.substring(0, atMatch.index)
      const mentionText = `@${staff.firstName} ${staff.lastName} `
      const newContent = beforeAt + mentionText + textAfterCursor

      setContent(newContent)
      setMentions((prev) => [...new Set([...prev, staff.id])])
      setMentionPopoverOpen(false)
      setMentionSearch('')

      // Set cursor position after mention
      setTimeout(() => {
        const newCursorPos = beforeAt.length + mentionText.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
      }, 0)
    }
  }

  // Handle keyboard
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !mentionPopoverOpen) {
      e.preventDefault()
      handleSend()
    }

    if (e.key === 'Escape' && mentionPopoverOpen) {
      setMentionPopoverOpen(false)
    }
  }

  // Send message
  const handleSend = () => {
    const trimmed = content.trim()
    if (!trimmed || isLoading) return

    onSend(trimmed, mentions)
    setContent('')
    setMentions([])
  }

  return (
    <div className={cn('relative', className)}>
      {/* Internal note indicator */}
      <div className='mb-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400'>
        <MdLock className='h-3 w-3' />
        <span>Internal note - only visible to your team</span>
      </div>

      <div className='relative rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20'>
        <Popover open={mentionPopoverOpen} onOpenChange={setMentionPopoverOpen}>
          <PopoverAnchor asChild>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className='min-h-[80px] resize-none border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-amber-500/50'
              disabled={isLoading}
            />
          </PopoverAnchor>
          <PopoverContent
            className='w-64 p-0'
            align='start'
            side='top'
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList>
                <CommandEmpty>No team members found</CommandEmpty>
                <CommandGroup heading='Team members'>
                  {filteredStaff.map((staff) => (
                    <CommandItem
                      key={staff.id}
                      value={staff.id}
                      onSelect={() => insertMention(staff)}
                      className='flex items-center gap-2'
                    >
                      <div className='relative'>
                        <Avatar className='h-6 w-6'>
                          <AvatarImage src={staff.avatarUrl} />
                          <AvatarFallback className='text-[10px]'>
                            {staff.firstName[0]}
                            {staff.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        {staff.isOnline && (
                          <span className='absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background bg-green-500' />
                        )}
                      </div>
                      <span className='text-sm'>
                        {staff.firstName} {staff.lastName}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Actions */}
        <div className='flex items-center justify-between gap-2 border-t border-amber-200 px-2 py-1 dark:border-amber-900/50'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-7 text-xs text-muted-foreground'
            onClick={() => {
              setMentionPopoverOpen(true)
              textareaRef.current?.focus()
              const pos = content.length
              setContent(content + '@')
              setTimeout(() => {
                textareaRef.current?.setSelectionRange(pos + 1, pos + 1)
              }, 0)
            }}
          >
            <MdAlternateEmail className='mr-1 h-3 w-3' />
            Mention
          </Button>
          <Button
            size='sm'
            className='h-7'
            onClick={handleSend}
            disabled={!content.trim() || isLoading}
          >
            <MdSend className='mr-1 h-3 w-3' />
            {isLoading ? 'Sending...' : 'Add note'}
          </Button>
        </div>
      </div>
    </div>
  )
}
