'use client'

import { format, isToday, isYesterday } from 'date-fns'
import { MdCheck, MdDoneAll, MdAccessTime, MdMoreVert } from 'react-icons/md'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { EnhancedChat } from '../../types'
import { LabelBadgeList } from '../labels/label-badge'
import { ConversationRowActions } from './conversation-row-actions'

interface ConversationRowProps {
  chat: EnhancedChat
  isSelected?: boolean
  onClick?: () => void
  onArchive?: () => void
  onUnarchive?: () => void
  onSnooze?: () => void
  onLabel?: () => void
  onAssign?: () => void
  onMarkUnread?: () => void
}

export function ConversationRow({
  chat,
  isSelected,
  onClick,
  onArchive,
  onUnarchive,
  onSnooze,
  onLabel,
  onAssign,
  onMarkUnread,
}: ConversationRowProps) {
  const { contact, lastMessage, isUnread, labels, snooze, assignment, status } = chat

  // Get message preview
  const getMessagePreview = () => {
    if (!lastMessage) return 'No messages yet'
    const msg = lastMessage.message
    if (msg.conversation) return msg.conversation
    if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text
    if (msg.imageMessage) return '📷 Photo'
    if (msg.videoMessage) return '🎥 Video'
    if (msg.audioMessage) return '🎵 Audio'
    if (msg.documentMessage) return `📄 ${msg.documentMessage.fileName}`
    if (msg.locationMessage) return '📍 Location'
    return 'Message'
  }

  // Get time display - formatted nicely
  const getTimeDisplay = () => {
    if (!lastMessage) return ''
    const timestamp = new Date(lastMessage.messageTimestamp * 1000)
    if (isToday(timestamp)) {
      return format(timestamp, 'HH:mm')
    }
    if (isYesterday(timestamp)) {
      return 'Yesterday'
    }
    return format(timestamp, 'MMM d')
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    const name = contact.pushName || 'Unknown'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get message status icon
  const getStatusIcon = () => {
    if (!lastMessage?.key.fromMe) return null
    switch (lastMessage.status) {
      case 'read':
        return <MdDoneAll className='h-4 w-4 text-blue-500' />
      case 'delivered':
        return <MdDoneAll className='h-4 w-4 text-muted-foreground' />
      case 'sent':
        return <MdCheck className='h-4 w-4 text-muted-foreground' />
      case 'pending':
        return <MdAccessTime className='h-3.5 w-3.5 text-muted-foreground' />
      default:
        return null
    }
  }

  // Count unread messages (mock for now)
  const unreadCount = isUnread ? 1 : 0

  return (
    <div className='w-full overflow-hidden px-2 py-0.5'>
      <div
        className={cn(
          'group flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl px-3 transition-all',
          isSelected
            ? 'bg-primary/10 dark:bg-primary/20'
            : 'hover:bg-muted/50'
        )}
        onClick={onClick}
      >
      {/* Avatar */}
      <div className='relative flex-shrink-0 py-3'>
        <Avatar className='size-12'>
          <AvatarImage src={contact.profilePicUrl} alt={contact.pushName} />
          <AvatarFallback className='bg-muted text-sm font-medium text-muted-foreground'>
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        {/* Online indicator - larger with ring */}
        {contact.isMyContact && (
          <div className='absolute bottom-2.5 right-0 size-2.5 rounded-full bg-green-500 ring-2 ring-background' />
        )}
      </div>

      {/* Content */}
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden py-3'>
        {/* Top row: Name and Time */}
        <div className='mb-0.5 flex items-center justify-between gap-2'>
          <span
            className={cn(
              'truncate text-[15px]',
              isUnread
                ? 'font-semibold text-foreground'
                : 'font-medium text-foreground'
            )}
          >
            {contact.pushName || contact.number}
          </span>
          <span className={cn(
            'shrink-0 text-xs',
            isUnread
              ? 'font-medium text-primary'
              : 'text-muted-foreground'
          )}>
            {getTimeDisplay()}
          </span>
        </div>

        {/* Bottom row: Preview and badges */}
        <div className='flex items-center justify-between gap-2'>
          <div className='flex min-w-0 flex-1 items-center gap-1'>
            {/* Status icon for sent messages */}
            {getStatusIcon()}
            {/* Message preview */}
            <p
              className={cn(
                'truncate text-sm',
                isUnread
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {getMessagePreview()}
            </p>
          </div>

          {/* Right side badges */}
          <div className='flex shrink-0 items-center gap-2'>
            {/* Snooze indicator */}
            {snooze && (
              <MdAccessTime className='h-4 w-4 text-amber-500' />
            )}
            {/* Assignment badge */}
            {assignment && (
              <span className='flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary'>
                {assignment.assignedTo.firstName[0]}
                {assignment.assignedTo.lastName[0]}
              </span>
            )}
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <span className='flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground'>
                {unreadCount}
              </span>
            )}
            {/* Hover actions */}
            <div className='hidden items-center group-hover:flex'>
              <ConversationRowActions
                chat={chat}
                onArchive={onArchive}
                onUnarchive={onUnarchive}
                onSnooze={onSnooze}
                onLabel={onLabel}
                onAssign={onAssign}
                onMarkUnread={onMarkUnread}
              >
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-7 text-muted-foreground hover:text-foreground'
                  onClick={(e) => e.stopPropagation()}
                >
                  <MdMoreVert className='h-4 w-4' />
                </Button>
              </ConversationRowActions>
            </div>
          </div>
        </div>

        {/* Labels row */}
        {labels.length > 0 && (
          <div className='mt-1.5'>
            <LabelBadgeList labels={labels} maxVisible={2} size='sm' />
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
