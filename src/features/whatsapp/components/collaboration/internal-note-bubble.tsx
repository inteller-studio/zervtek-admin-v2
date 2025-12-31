'use client'

import { format } from 'date-fns'
import { MdLock } from 'react-icons/md'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { InternalNote, StaffMember } from '../../types'

interface InternalNoteBubbleProps {
  note: InternalNote
  className?: string
}

export function InternalNoteBubble({ note, className }: InternalNoteBubbleProps) {
  const { author, content, mentions, createdAt } = note
  const initials = `${author.firstName[0]}${author.lastName[0]}`

  // Highlight @mentions in content
  const renderContent = () => {
    // Simple regex to find @mentions
    const mentionRegex = /@([A-Za-z]+\s[A-Za-z]+)/g
    const parts = content.split(mentionRegex)

    return parts.map((part, index) => {
      // Every odd index is a mention match
      if (index % 2 === 1) {
        return (
          <span
            key={index}
            className='rounded bg-amber-200 px-1 text-amber-800 dark:bg-amber-800/50 dark:text-amber-200'
          >
            @{part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div
      className={cn(
        'relative rounded-r-lg border-l-4 border-amber-500 bg-amber-50 p-3 dark:bg-amber-500/10',
        className
      )}
    >
      {/* Header */}
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-sm'>📌</span>
          <span className='text-xs font-medium text-amber-700 dark:text-amber-300'>
            Note by {author.firstName} {author.lastName}
          </span>
        </div>
        <span className='text-[10px] text-amber-600 dark:text-amber-400'>
          {format(new Date(createdAt), 'MMM d, h:mm a')}
        </span>
      </div>

      {/* Content */}
      <p className='text-sm text-foreground'>{renderContent()}</p>
    </div>
  )
}

interface InternalNotesListProps {
  notes: InternalNote[]
  className?: string
}

export function InternalNotesList({ notes, className }: InternalNotesListProps) {
  if (notes.length === 0) return null

  // Sort by date, newest first
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className={cn('space-y-3', className)}>
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        <MdLock className='h-3 w-3' />
        <span>Internal notes ({notes.length})</span>
      </div>
      <div className='space-y-2'>
        {sortedNotes.map((note) => (
          <InternalNoteBubble key={note.id} note={note} />
        ))}
      </div>
    </div>
  )
}
