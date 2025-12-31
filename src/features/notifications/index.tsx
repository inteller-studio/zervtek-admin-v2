'use client'

import { useState, useMemo } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
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
  MdFilterList,
  MdDelete,
  MdDrafts,
  MdEmail,
} from 'react-icons/md'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AnimatedTabs, type TabItem } from '@/components/ui/animated-tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from '@/components/search'
import { EmptyState } from '@/components/empty-state'
import { cn } from '@/lib/utils'
import {
  notifications as allNotifications,
  type Notification,
  type NotificationType,
  notificationTypeConfig,
} from './data/notifications'

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
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  violet: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  green: 'bg-green-500/10 text-green-500 border-green-500/20',
  red: 'bg-red-500/10 text-red-500 border-red-500/20',
}

type FilterStatus = 'all' | 'unread' | 'read'

export function Notifications() {
  const [notifications, setNotifications] = useState(
    allNotifications.filter((n) => n.visibleTo.includes(CURRENT_USER_ROLE))
  )
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const counts = useMemo(() => {
    const all = notifications.length
    const unread = notifications.filter((n) => !n.read).length
    const read = notifications.filter((n) => n.read).length
    return { all, unread, read }
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'unread' && !n.read) ||
        (filterStatus === 'read' && n.read)
      const matchesType = filterType === 'all' || n.type === filterType
      return matchesStatus && matchesType
    })
  }, [notifications, filterStatus, filterType])

  const getIcon = (type: NotificationType) => {
    const config = notificationTypeConfig[type]
    const Icon = iconMap[config.icon] || MdNotifications
    return Icon
  }

  const getColor = (type: NotificationType) => {
    const config = notificationTypeConfig[type]
    return colorMap[config.color] || 'bg-muted text-muted-foreground'
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)))
    }
  }

  const markSelectedAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (selectedIds.has(n.id) ? { ...n, read: true } : n))
    )
    toast.success(`${selectedIds.size} notification(s) marked as read`)
    setSelectedIds(new Set())
  }

  const markSelectedAsUnread = () => {
    setNotifications((prev) =>
      prev.map((n) => (selectedIds.has(n.id) ? { ...n, read: false } : n))
    )
    toast.success(`${selectedIds.size} notification(s) marked as unread`)
    setSelectedIds(new Set())
  }

  const deleteSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)))
    toast.success(`${selectedIds.size} notification(s) deleted`)
    setSelectedIds(new Set())
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const notificationTypes = Object.entries(notificationTypeConfig)
    .filter(([_, config]) => config.roles.includes(CURRENT_USER_ROLE))
    .map(([type, config]) => ({
      value: type as NotificationType,
      label: config.label,
    }))

  return (
    <>
      <Header fixed>
        <Search className='md:w-auto flex-1' />
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 p-4 sm:p-6'>
        {/* Header */}
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Notifications</h2>
            <p className='text-muted-foreground text-sm'>
              Stay updated with your latest alerts and updates
            </p>
          </div>
          {counts.unread > 0 && (
            <Button variant='outline' size='sm' onClick={markAllAsRead}>
              <MdCheck className='mr-1.5 h-4 w-4' />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-3'>
          <AnimatedTabs
            tabs={[
              { id: 'all', label: 'All', badge: counts.all },
              { id: 'unread', label: 'Unread', badge: counts.unread, badgeColor: 'primary' },
              { id: 'read', label: 'Read', badge: counts.read },
            ] as TabItem[]}
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as FilterStatus)}
            variant='compact'
          />

          <div className='flex items-center gap-2 ml-auto'>
            <Select
              value={filterType}
              onValueChange={(v) => setFilterType(v as NotificationType | 'all')}
            >
              <SelectTrigger className='w-[180px] h-9'>
                <MdFilterList className='mr-2 h-4 w-4' />
                <SelectValue placeholder='Filter by type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                {notificationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className='flex items-center gap-2 p-2 rounded-lg bg-muted/50 border'>
            <span className='text-sm text-muted-foreground ml-2'>
              {selectedIds.size} selected
            </span>
            <div className='flex items-center gap-1 ml-auto'>
              <Button variant='ghost' size='sm' onClick={markSelectedAsRead}>
                <MdDrafts className='mr-1.5 h-4 w-4' />
                Mark read
              </Button>
              <Button variant='ghost' size='sm' onClick={markSelectedAsUnread}>
                <MdEmail className='mr-1.5 h-4 w-4' />
                Mark unread
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='text-destructive hover:text-destructive'
                onClick={deleteSelected}
              >
                <MdDelete className='mr-1.5 h-4 w-4' />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <Card className='flex-1'>
          <CardContent className='p-0'>
            {filteredNotifications.length > 0 ? (
              <>
                {/* Select All Header */}
                <div className='flex items-center gap-3 px-4 py-2 border-b bg-muted/30'>
                  <Checkbox
                    checked={
                      selectedIds.size === filteredNotifications.length &&
                      filteredNotifications.length > 0
                    }
                    onCheckedChange={selectAll}
                  />
                  <span className='text-xs text-muted-foreground'>
                    {filteredNotifications.length} notification
                    {filteredNotifications.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <ScrollArea className='h-[calc(100vh-320px)]'>
                  <div className='divide-y'>
                    {filteredNotifications.map((notification) => {
                      const Icon = getIcon(notification.type)
                      const config = notificationTypeConfig[notification.type]
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                            !notification.read && 'bg-primary/5',
                            selectedIds.has(notification.id) && 'bg-muted/50'
                          )}
                        >
                          <Checkbox
                            checked={selectedIds.has(notification.id)}
                            onCheckedChange={() => toggleSelect(notification.id)}
                            className='mt-1'
                          />

                          {/* Icon */}
                          <div
                            className={cn(
                              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                              getColor(notification.type)
                            )}
                          >
                            <Icon className='h-5 w-5' />
                          </div>

                          {/* Content */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-start justify-between gap-2'>
                              <div>
                                <div className='flex items-center gap-2'>
                                  <p
                                    className={cn(
                                      'text-sm',
                                      !notification.read && 'font-semibold'
                                    )}
                                  >
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className='h-2 w-2 rounded-full bg-primary' />
                                  )}
                                </div>
                                <p className='text-sm text-muted-foreground mt-0.5'>
                                  {notification.message}
                                </p>
                              </div>
                              <div className='flex flex-col items-end gap-1'>
                                <span className='text-xs text-muted-foreground whitespace-nowrap'>
                                  {formatDistanceToNow(
                                    new Date(notification.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                                <Badge
                                  variant='outline'
                                  className={cn(
                                    'text-[10px] px-1.5',
                                    getColor(notification.type)
                                  )}
                                >
                                  {config.label}
                                </Badge>
                              </div>
                            </div>
                            {notification.metadata?.amount && (
                              <p className='text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1'>
                                ${notification.metadata.amount.toLocaleString()}
                              </p>
                            )}
                            <p className='text-[10px] text-muted-foreground/60 mt-1'>
                              {format(
                                new Date(notification.createdAt),
                                'MMM dd, yyyy • HH:mm'
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <EmptyState
                icon={MdNotifications}
                title='No notifications'
                description={
                  filterStatus !== 'all' || filterType !== 'all'
                    ? 'Try adjusting your filters'
                    : "You're all caught up!"
                }
                className='py-16'
              />
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
