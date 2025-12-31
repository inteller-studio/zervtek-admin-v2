'use client'

import { format } from 'date-fns'
import { MdCheck, MdDoneAll, MdAccessTime, MdLocationOn } from 'react-icons/md'
import { cn } from '@/lib/utils'
import type { Message } from '../../types'

interface MessageBubbleProps {
  message: Message
  showTail?: boolean
}

export function MessageBubble({ message, showTail = false }: MessageBubbleProps) {
  const isOwn = message.key.fromMe
  const timestamp = new Date(message.messageTimestamp * 1000)

  // Get message content
  const getContent = () => {
    const msg = message.message
    if (msg.conversation) return { type: 'text', content: msg.conversation }
    if (msg.extendedTextMessage?.text) return { type: 'text', content: msg.extendedTextMessage.text }
    if (msg.imageMessage) {
      return {
        type: 'image',
        content: msg.imageMessage.caption || '',
        url: msg.imageMessage.url,
      }
    }
    if (msg.videoMessage) {
      return {
        type: 'video',
        content: msg.videoMessage.caption || '',
        url: msg.videoMessage.url,
      }
    }
    if (msg.audioMessage) {
      return { type: 'audio', content: 'Audio message', url: msg.audioMessage.url }
    }
    if (msg.documentMessage) {
      return {
        type: 'document',
        content: msg.documentMessage.fileName || 'Document',
      }
    }
    if (msg.locationMessage) {
      return {
        type: 'location',
        content: msg.locationMessage.name || 'Location',
        lat: msg.locationMessage.degreesLatitude,
        lng: msg.locationMessage.degreesLongitude,
      }
    }
    return { type: 'unknown', content: 'Message' }
  }

  const content = getContent()

  // Status icon
  const getStatusIcon = () => {
    if (!isOwn) return null
    switch (message.status) {
      case 'pending':
        return <MdAccessTime className='h-3 w-3 text-muted-foreground' />
      case 'sent':
        return <MdCheck className='h-3 w-3 text-muted-foreground' />
      case 'delivered':
        return <MdDoneAll className='h-3 w-3 text-muted-foreground' />
      case 'read':
        return <MdDoneAll className='h-3 w-3 text-blue-500' />
      default:
        return <MdCheck className='h-3 w-3 text-muted-foreground' />
    }
  }

  return (
    <div
      className={cn(
        'flex w-full px-4',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'relative max-w-[70%] rounded-2xl px-4 py-2',
          isOwn
            ? 'bg-primary/10 dark:bg-primary/20'
            : 'border border-border/50 bg-card dark:bg-muted/50',
          // Tail styling - subtle corner adjustment
          showTail && isOwn && 'rounded-tr-sm',
          showTail && !isOwn && 'rounded-tl-sm'
        )}
      >
        {/* Content */}
        {content.type === 'image' && content.url && (
          <div className='-mx-1 -mt-0.5 mb-2 overflow-hidden rounded-xl'>
            <img
              src={content.url}
              alt='Image'
              className='max-h-[280px] max-w-[260px] object-cover'
            />
          </div>
        )}

        {content.type === 'location' && (
          <div className='mb-2 flex items-center gap-2 rounded-lg bg-muted p-2'>
            <MdLocationOn className='h-5 w-5 text-primary' />
            <span className='text-sm'>{content.content}</span>
          </div>
        )}

        {content.type === 'document' && (
          <div className='mb-2 flex items-center gap-2 rounded-lg bg-muted p-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary'>
              <span className='text-xs font-medium text-primary-foreground'>DOC</span>
            </div>
            <span className='flex-1 truncate text-sm'>{content.content}</span>
          </div>
        )}

        {(content.type === 'text' || content.content) && content.type !== 'location' && content.type !== 'document' && (
          <p className='whitespace-pre-wrap break-words text-sm text-foreground'>
            {content.content}
          </p>
        )}

        {/* Time and Status */}
        <div className='mt-1 flex items-center justify-end gap-1 text-muted-foreground'>
          <span className='text-[11px]'>
            {format(timestamp, 'HH:mm')}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  )
}
