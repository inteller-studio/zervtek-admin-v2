'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { MdMic, MdAttachFile, MdSend, MdSentimentSatisfied, MdNote } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { StaffMember } from '../../types'
import { useWhatsAppUIStore } from '../../stores/whatsapp-ui-store'
import { ReplyModeButton } from './reply-mode-toggle'
import { InternalNoteInput } from '../collaboration/internal-note-input'

interface EnhancedMessageInputProps {
  onSendMessage: (message: string, shouldArchive: boolean) => void
  onSendInternalNote?: (content: string, mentions: string[]) => void
  staffMembers?: StaffMember[]
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function EnhancedMessageInput({
  onSendMessage,
  onSendInternalNote,
  staffMembers = [],
  isLoading,
  disabled,
  placeholder = 'Type a message',
  className,
}: EnhancedMessageInputProps) {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLDivElement>(null)
  const { replyMode, setReplyMode, internalNoteMode, setInternalNoteMode } = useWhatsAppUIStore()

  // Focus input on mount
  useEffect(() => {
    if (!internalNoteMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [internalNoteMode])

  const handleSend = (forceArchive?: boolean) => {
    const trimmed = message.trim()
    if (!trimmed || isLoading || disabled) return

    const shouldArchive = forceArchive ?? (replyMode === 'reply_and_archive')
    onSendMessage(trimmed, shouldArchive)
    setMessage('')
    if (inputRef.current) {
      inputRef.current.textContent = ''
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Shift+Enter = new line (default behavior)
    if (e.key === 'Enter' && e.shiftKey) {
      return
    }

    // Ctrl+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      // In reply mode: Ctrl+Enter = send & archive
      // In archive mode: Ctrl+Enter = send only
      handleSend(replyMode === 'reply')
      return
    }

    // Enter alone
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
      return
    }
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setMessage(e.currentTarget.textContent || '')
  }

  const handleSendNote = (content: string, mentions: string[]) => {
    if (onSendInternalNote) {
      onSendInternalNote(content, mentions)
    }
  }

  // Switch to internal note mode
  if (internalNoteMode && onSendInternalNote) {
    return (
      <div className={cn('bg-amber-50 px-4 py-3 dark:bg-amber-950/30', className)}>
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <MdNote className='h-4 w-4 text-amber-600' />
            <span className='text-sm font-medium text-amber-700 dark:text-amber-400'>
              Internal Note
            </span>
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 px-2 text-xs text-[#667781] hover:text-[#111B21] dark:text-[#8696A0] dark:hover:text-[#E9EDEF]'
            onClick={() => setInternalNoteMode(false)}
          >
            Cancel
          </Button>
        </div>
        <InternalNoteInput
          staffMembers={staffMembers}
          onSend={(content, mentions) => {
            handleSendNote(content, mentions)
            setInternalNoteMode(false)
          }}
          isLoading={isLoading}
        />
      </div>
    )
  }

  const hasText = message.trim().length > 0

  return (
    <div className={cn('flex items-end gap-2 px-4 py-3', className)}>
      {/* Left action buttons */}
      <div className='flex items-center gap-1'>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-10 w-10 shrink-0 text-[#54656F] hover:bg-transparent hover:text-[#00A884] dark:text-[#AEBAC1] dark:hover:text-[#00A884]'
                disabled={disabled}
              >
                <MdSentimentSatisfied className='h-6 w-6' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top' sideOffset={8}>Emoji</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-10 w-10 shrink-0 text-[#54656F] hover:bg-transparent hover:text-[#00A884] dark:text-[#AEBAC1] dark:hover:text-[#00A884]'
                disabled={disabled}
              >
                <MdAttachFile className='h-6 w-6' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top' sideOffset={8}>Attach</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Message input - WhatsApp style */}
      <div className='relative flex flex-1 items-end'>
        <div className='flex w-full items-center rounded-lg bg-white px-3 py-2 dark:bg-[#2A3942]'>
          <div
            ref={inputRef}
            contentEditable={!disabled && !isLoading}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
            className={cn(
              'max-h-[100px] min-h-[24px] flex-1 overflow-y-auto break-words text-[15px] text-[#111B21] outline-none dark:text-[#E9EDEF]',
              'empty:before:pointer-events-none empty:before:text-[#667781] empty:before:content-[attr(data-placeholder)] dark:empty:before:text-[#8696A0]',
              (disabled || isLoading) && 'opacity-50'
            )}
          />
        </div>
      </div>

      {/* Right action buttons */}
      <div className='flex items-center gap-1'>
        <TooltipProvider delayDuration={300}>
          {/* Reply mode toggle */}
          <ReplyModeButton mode={replyMode} onModeChange={setReplyMode} />

          {/* Internal note button */}
          {onSendInternalNote && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-10 w-10 shrink-0 text-amber-500 hover:bg-transparent hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-500'
                  disabled={disabled}
                  onClick={() => setInternalNoteMode(true)}
                >
                  <MdNote className='h-5 w-5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top' sideOffset={8}>Internal note</TooltipContent>
            </Tooltip>
          )}

          {/* Send or Mic button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className={cn(
                  'h-10 w-10 shrink-0 transition-colors',
                  hasText
                    ? 'text-[#00A884] hover:bg-transparent hover:text-[#00A884]'
                    : 'text-[#54656F] hover:bg-transparent hover:text-[#00A884] dark:text-[#AEBAC1]'
                )}
                disabled={disabled || isLoading}
                onClick={() => hasText ? handleSend() : undefined}
              >
                {hasText ? (
                  <MdSend className='h-6 w-6' />
                ) : (
                  <MdMic className='h-6 w-6' />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top' sideOffset={8}>
              {hasText ? (replyMode === 'reply_and_archive' ? 'Send & Archive' : 'Send') : 'Voice message'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
