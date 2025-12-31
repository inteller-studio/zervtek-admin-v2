'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { MdPerson, MdAccessTime } from 'react-icons/md'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type TaskCompletion } from '../../../types/workflow'

interface CompletionBadgeProps {
  completion: TaskCompletion
  variant?: 'default' | 'compact' | 'full'
}

export function CompletionBadge({ completion, variant = 'default' }: CompletionBadgeProps) {
  const formattedDate = format(new Date(completion.completedAt), 'MMM d, yyyy')
  const formattedTime = format(new Date(completion.completedAt), 'HH:mm')
  const relativeTime = formatDistanceToNow(new Date(completion.completedAt), { addSuffix: true })

  if (variant === 'compact') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant='outline' className='text-xs font-normal gap-1'>
            <MdPerson className='h-3 w-3' />
            {completion.completedBy}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Completed {relativeTime}</p>
          <p className='text-xs text-muted-foreground'>{formattedDate} at {formattedTime}</p>
          {completion.notes && (
            <p className='text-xs mt-1 border-t pt-1'>{completion.notes}</p>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  if (variant === 'full') {
    return (
      <div className='flex flex-col gap-1 p-2 rounded-md bg-muted/50'>
        <div className='flex items-center gap-2'>
          <div className='h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
            <MdPerson className='h-3.5 w-3.5 text-emerald-600' />
          </div>
          <span className='text-sm font-medium'>{completion.completedBy}</span>
        </div>
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground ml-8'>
          <MdAccessTime className='h-3 w-3' />
          {formattedDate} at {formattedTime}
        </div>
        {completion.notes && (
          <p className='text-xs text-muted-foreground ml-8 mt-1'>
            &ldquo;{completion.notes}&rdquo;
          </p>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
      <Badge variant='outline' className='font-normal gap-1'>
        <MdPerson className='h-3 w-3' />
        {completion.completedBy}
      </Badge>
      <span className='flex items-center gap-1'>
        <MdAccessTime className='h-3 w-3' />
        {relativeTime}
      </span>
    </div>
  )
}
