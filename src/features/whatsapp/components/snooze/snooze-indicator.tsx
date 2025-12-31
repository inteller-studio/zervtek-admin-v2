'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { MdNotifications, MdAccessTime, MdClose } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { SnoozeConfig } from '../../types'

interface SnoozeIndicatorProps {
  snooze: SnoozeConfig
  onCancel?: () => void
  variant?: 'badge' | 'inline' | 'full'
  className?: string
}

export function SnoozeIndicator({
  snooze,
  onCancel,
  variant = 'badge',
  className,
}: SnoozeIndicatorProps) {
  const returnDate = new Date(snooze.returnAt)
  const now = new Date()
  const isPast = returnDate < now

  // Format the return time
  const getReturnText = () => {
    const isToday = returnDate.toDateString() === now.toDateString()
    const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === returnDate.toDateString()
    const timeStr = format(returnDate, 'h:mm a')

    if (isPast) return 'Returning now'
    if (isToday) return `Today ${timeStr}`
    if (isTomorrow) return `Tomorrow ${timeStr}`
    return format(returnDate, 'EEE, MMM d h:mm a')
  }

  const getShortText = () => {
    if (isPast) return 'Now'
    return formatDistanceToNow(returnDate, { addSuffix: false })
  }

  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors duration-200',
                isPast
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                className
              )}
            >
              <MdAccessTime className='h-3 w-3' />
              {getShortText()}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Returns {getReturnText()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (variant === 'inline') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs',
          isPast
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-amber-500 dark:text-amber-400',
          className
        )}
      >
        <MdAccessTime className='h-3 w-3' />
        Returns {getReturnText()}
      </span>
    )
  }

  // Full variant
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-lg border p-3 transition-colors duration-200',
        isPast
          ? 'border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/30'
          : 'border-amber-100 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-900/20',
        className
      )}
    >
      <div className='flex items-center gap-2'>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            isPast
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
              : 'bg-amber-100/50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400'
          )}
        >
          {isPast ? <MdNotifications className='h-4 w-4' /> : <MdAccessTime className='h-4 w-4' />}
        </div>
        <div>
          <p className='text-sm font-medium text-amber-800 dark:text-amber-200'>
            {isPast ? 'Snooze ended' : 'Snoozed'}
          </p>
          <p className='text-xs text-amber-600 dark:text-amber-400'>
            {isPast ? 'This conversation is returning to your inbox' : `Returns ${getReturnText()}`}
          </p>
        </div>
      </div>
      {onCancel && !isPast && (
        <Button
          variant='ghost'
          size='sm'
          className='h-7 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/30'
          onClick={onCancel}
        >
          <MdClose className='mr-1 h-3 w-3' />
          Cancel
        </Button>
      )}
    </div>
  )
}
