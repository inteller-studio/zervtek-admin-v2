'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import {
  MdNotifications,
  MdCheckCircle,
  MdAssignmentTurnedIn,
  MdCreditCard,
  MdGavel,
  MdTranslate,
  MdWarning,
  MdPersonAdd,
  MdCheck,
  MdOpenInNew,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  notifications as allNotifications,
  type Notification,
  type NotificationType,
  notificationTypeConfig,
} from '../data/notifications'

// Current user role - in real app, this comes from auth context
const CURRENT_USER_ROLE: 'superadmin' | 'admin' | 'manager' | 'cashier' = 'admin'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardCheck: MdAssignmentTurnedIn,
  Languages: MdTranslate,
  Gavel: MdGavel,
  CreditCard: MdCreditCard,
  UserPlus: MdPersonAdd,
  CheckCircle: MdCheckCircle,
  AlertTriangle: MdWarning,
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-500',
  violet: 'bg-violet-500/10 text-violet-500',
  amber: 'bg-amber-500/10 text-amber-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  indigo: 'bg-indigo-500/10 text-indigo-500',
  green: 'bg-green-500/10 text-green-500',
  red: 'bg-red-500/10 text-red-500',
}

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(
    allNotifications.filter((n) => n.visibleTo.includes(CURRENT_USER_ROLE))
  )

  const unreadCount = notifications.filter((n) => !n.read).length
  const recentNotifications = notifications.slice(0, 8)

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.link) {
      setOpen(false)
      router.push(notification.link)
    }
  }

  const getIcon = (type: NotificationType) => {
    const config = notificationTypeConfig[type]
    const Icon = iconMap[config.icon] || MdNotifications
    return Icon
  }

  const getColor = (type: NotificationType) => {
    const config = notificationTypeConfig[type]
    return colorMap[config.color] || 'bg-muted text-muted-foreground'
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative'
          aria-label='Notifications'
        >
          <MdNotifications className='h-5 w-5' />
          {unreadCount > 0 && (
            <span className='absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[380px] p-0'
        align='end'
        sideOffset={8}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <div className='flex items-center gap-2'>
            <h4 className='font-semibold'>Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant='secondary' className='h-5 px-1.5 text-xs'>
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-auto p-1 text-xs text-muted-foreground hover:text-foreground'
              onClick={markAllAsRead}
            >
              <MdCheck className='mr-1 h-3 w-3' />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className='h-[400px]'>
          {recentNotifications.length > 0 ? (
            <div className='divide-y'>
              {recentNotifications.map((notification) => {
                const Icon = getIcon(notification.type)
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50',
                      !notification.read && 'bg-primary/5'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
                        getColor(notification.type)
                      )}
                    >
                      <Icon className='h-4 w-4' />
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <p
                          className={cn(
                            'text-sm leading-tight',
                            !notification.read && 'font-medium'
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className='h-2 w-2 flex-shrink-0 rounded-full bg-primary mt-1' />
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground line-clamp-2 mt-0.5'>
                        {notification.message}
                      </p>
                      <p className='text-[10px] text-muted-foreground/70 mt-1'>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <MdNotifications className='h-10 w-10 text-muted-foreground/50 mb-3' />
              <p className='text-sm font-medium'>No notifications</p>
              <p className='text-xs text-muted-foreground'>
                You&apos;re all caught up!
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className='border-t p-2'>
            <Button
              variant='ghost'
              className='w-full justify-center text-sm'
              onClick={() => {
                setOpen(false)
                router.push('/notifications')
              }}
            >
              View all notifications
              <MdOpenInNew className='ml-1.5 h-3.5 w-3.5' />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
