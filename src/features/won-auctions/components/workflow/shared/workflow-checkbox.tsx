'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, User, Clock, MessageSquare } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { type TaskCompletion } from '../../../types/workflow'

interface WorkflowCheckboxProps {
  id: string
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  completion?: TaskCompletion
  onCheckedChange: (checked: boolean, notes?: string) => void
  showNoteOnComplete?: boolean
  className?: string
}

export function WorkflowCheckbox({
  id,
  label,
  description,
  checked,
  disabled = false,
  completion,
  onCheckedChange,
  showNoteOnComplete = false,
  className,
}: WorkflowCheckboxProps) {
  const [notePopoverOpen, setNotePopoverOpen] = useState(false)
  const [note, setNote] = useState('')

  const handleCheckedChange = (value: boolean) => {
    if (value && showNoteOnComplete) {
      setNotePopoverOpen(true)
    } else {
      onCheckedChange(value)
    }
  }

  const handleConfirmWithNote = () => {
    onCheckedChange(true, note || undefined)
    setNote('')
    setNotePopoverOpen(false)
  }

  return (
    <div className={cn('flex items-start gap-3 py-2', className)}>
      <Popover open={notePopoverOpen} onOpenChange={setNotePopoverOpen}>
        <PopoverTrigger asChild>
          <div>
            <Checkbox
              id={id}
              checked={checked}
              disabled={disabled}
              onCheckedChange={(value) => handleCheckedChange(value === true)}
              className={cn(
                'mt-0.5',
                checked && 'bg-emerald-600 border-emerald-600 data-[state=checked]:bg-emerald-600'
              )}
            />
          </div>
        </PopoverTrigger>
        {showNoteOnComplete && (
          <PopoverContent className='w-80' align='start'>
            <div className='space-y-3'>
              <h4 className='font-medium text-sm'>Add a note (optional)</h4>
              <Textarea
                placeholder='Add any relevant notes...'
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className='resize-none'
              />
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setNote('')
                    setNotePopoverOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button size='sm' onClick={handleConfirmWithNote}>
                  Confirm
                </Button>
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>

      <div className='flex-1 min-w-0'>
        <label
          htmlFor={id}
          className={cn(
            'text-sm font-medium cursor-pointer select-none',
            checked && 'text-muted-foreground line-through',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {label}
        </label>
        {description && (
          <p className='text-xs text-muted-foreground mt-0.5'>{description}</p>
        )}

        {/* Completion info */}
        {checked && completion && (
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5'>
            <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
              <User className='h-3 w-3' />
              {completion.completedBy}
            </span>
            <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
              <Clock className='h-3 w-3' />
              {format(new Date(completion.completedAt), 'MMM d, yyyy HH:mm')}
            </span>
            {completion.notes && (
              <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                <MessageSquare className='h-3 w-3' />
                {completion.notes}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Status indicator */}
      {checked && (
        <div className='shrink-0'>
          <div className='h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
            <Check className='h-3 w-3 text-emerald-600' />
          </div>
        </div>
      )}
    </div>
  )
}
