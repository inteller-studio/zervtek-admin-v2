'use client'

import { motion } from 'framer-motion'
import { MdArchive, MdExpandMore, MdSend } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ReplyMode } from '../../types'
import { useWhatsAppUIStore } from '../../stores/whatsapp-ui-store'

interface ReplyModeToggleProps {
  mode: ReplyMode
  onModeChange: (mode: ReplyMode) => void
  onSend: () => void
  disabled?: boolean
  className?: string
}

export function ReplyModeToggle({
  mode,
  onModeChange,
  onSend,
  disabled,
  className,
}: ReplyModeToggleProps) {
  const isArchiveMode = mode === 'reply_and_archive'

  return (
    <motion.div
      className={cn('flex', className)}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
    >
      {/* Main send button */}
      <Button
        onClick={onSend}
        disabled={disabled}
        className={cn(
          'rounded-r-none',
          isArchiveMode && 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700'
        )}
      >
        <MdSend className='mr-2 h-4 w-4' />
        {isArchiveMode ? 'Send & Archive' : 'Send'}
      </Button>

      {/* Mode dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='default'
            size='icon'
            disabled={disabled}
            className={cn(
              'rounded-l-none border-l border-l-primary-foreground/20',
              isArchiveMode && 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700'
            )}
          >
            <MdExpandMore className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={() => onModeChange('reply')}
            className='flex items-center gap-2'
          >
            <MdSend className='h-4 w-4' />
            <div>
              <p className='font-medium'>Reply</p>
              <p className='text-xs text-muted-foreground'>
                Send message only (Enter)
              </p>
            </div>
            {mode === 'reply' && (
              <span className='ml-auto text-primary'>✓</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onModeChange('reply_and_archive')}
            className='flex items-center gap-2'
          >
            <MdArchive className='h-4 w-4' />
            <div>
              <p className='font-medium'>Reply & Archive</p>
              <p className='text-xs text-muted-foreground'>
                Send and archive (Ctrl+Enter)
              </p>
            </div>
            {mode === 'reply_and_archive' && (
              <span className='ml-auto text-primary'>✓</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}

// Simple variant for inline use - WhatsApp style
interface ReplyModeButtonProps {
  mode: ReplyMode
  onModeChange: (mode: ReplyMode) => void
  className?: string
}

export function ReplyModeButton({ mode, onModeChange, className }: ReplyModeButtonProps) {
  const isArchiveMode = mode === 'reply_and_archive'

  return (
    <motion.button
      type='button'
      onClick={() => onModeChange(isArchiveMode ? 'reply' : 'reply_and_archive')}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors duration-150',
        isArchiveMode
          ? 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:text-amber-400'
          : 'bg-[#E9EDEF] text-[#54656F] hover:bg-[#D1D7DB] dark:bg-[#2A3942] dark:text-[#8696A0] dark:hover:bg-[#3B4A54]',
        className
      )}
      title={isArchiveMode ? 'Click to switch to Reply only' : 'Click to switch to Reply & Archive'}
    >
      {isArchiveMode ? (
        <>
          <MdArchive className='h-3.5 w-3.5' />
          <span>Archive</span>
        </>
      ) : (
        <>
          <MdSend className='h-3.5 w-3.5' />
          <span>Reply</span>
        </>
      )}
    </motion.button>
  )
}

// Wrapper that uses the store
export function ManagedReplyModeToggle({
  onSend,
  disabled,
  className,
}: {
  onSend: () => void
  disabled?: boolean
  className?: string
}) {
  const { replyMode, setReplyMode } = useWhatsAppUIStore()

  return (
    <ReplyModeToggle
      mode={replyMode}
      onModeChange={setReplyMode}
      onSend={onSend}
      disabled={disabled}
      className={className}
    />
  )
}
