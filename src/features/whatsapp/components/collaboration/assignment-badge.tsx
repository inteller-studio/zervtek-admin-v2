'use client'

import { MdClose } from 'react-icons/md'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ChatAssignment } from '../../types'

interface AssignmentBadgeProps {
  assignment: ChatAssignment
  onRemove?: () => void
  variant?: 'compact' | 'default' | 'full'
  className?: string
}

export function AssignmentBadge({
  assignment,
  onRemove,
  variant = 'default',
  className,
}: AssignmentBadgeProps) {
  const { assignedTo, assignedBy, assignedAt } = assignment
  const initials = `${assignedTo.firstName[0]}${assignedTo.lastName[0]}`
  const fullName = `${assignedTo.firstName} ${assignedTo.lastName}`

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium',
                assignedTo.isOnline
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-muted text-muted-foreground',
                className
              )}
            >
              {initials}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Assigned to {fullName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (variant === 'default') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 transition-shadow duration-200 hover:shadow-sm',
          className
        )}
      >
        <div className='relative'>
          <Avatar className='h-5 w-5'>
            <AvatarImage src={assignedTo.avatarUrl} />
            <AvatarFallback className='text-[9px]'>{initials}</AvatarFallback>
          </Avatar>
          {assignedTo.isOnline && (
            <span className='absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background bg-green-500' />
          )}
        </div>
        <span className='text-xs font-medium'>{assignedTo.firstName}</span>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className='ml-0.5 rounded-full p-0.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
          >
            <MdClose className='h-2.5 w-2.5' />
          </button>
        )}
      </div>
    )
  }

  // Full variant
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border bg-muted/50 p-3 transition-shadow duration-200 hover:shadow-sm',
        className
      )}
    >
      <div className='flex items-center gap-3'>
        <div className='relative'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={assignedTo.avatarUrl} />
            <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
          </Avatar>
          {assignedTo.isOnline && (
            <span className='absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500' />
          )}
        </div>
        <div>
          <p className='text-sm font-medium'>{fullName}</p>
          <p className='text-xs text-muted-foreground capitalize'>
            {assignedTo.role.replace('_', ' ')}
          </p>
        </div>
      </div>
      {onRemove && (
        <Button
          variant='ghost'
          size='sm'
          className='h-7'
          onClick={onRemove}
        >
          <MdClose className='mr-1 h-3 w-3' />
          Unassign
        </Button>
      )}
    </div>
  )
}

interface UnassignedBadgeProps {
  onClick?: () => void
  className?: string
}

export function UnassignedBadge({ onClick, className }: UnassignedBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:text-muted-foreground/70 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              className
            )}
          >
            <span className='text-[10px]'>?</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Unassigned - click to assign</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
