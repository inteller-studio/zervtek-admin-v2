'use client'

import { useMemo } from 'react'
import { format, isToday, isTomorrow, addDays, parseISO, startOfDay } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MdCalendarToday,
  MdAccessTime,
  MdLocationOn,
  MdDirectionsCar,
  MdPhone,
  MdVideocam,
  MdCheckCircle,
  MdEvent,
  MdInbox,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import { type OnboardingSubmission, type OnboardingStatus } from '../data/submissions'

interface OnboardingTimelineProps {
  data: OnboardingSubmission[]
  onItemClick: (onboarding: OnboardingSubmission) => void
}

// Status badge styles
const statusBadgeStyles: Record<OnboardingStatus, string> = {
  new: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  scheduled: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
  completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/20',
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatTimeLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEEE, MMM d')
}

function getDateKey(dateStr: string): string {
  return startOfDay(parseISO(dateStr)).toISOString()
}

interface ScheduledItemProps {
  onboarding: OnboardingSubmission
  onClick: () => void
  showDate?: boolean
}

function ScheduledItem({ onboarding, onClick, showDate }: ScheduledItemProps) {
  const vehicles = onboarding.metadata.vehicles
  const isCompleted = onboarding.status === 'closed'

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 bg-card rounded-xl border text-left transition-all group',
        'hover:shadow-md hover:border-primary/30',
        isCompleted && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Time indicator */}
        <div className="flex flex-col items-center">
          <div className={cn(
            'w-12 h-12 rounded-xl flex flex-col items-center justify-center font-semibold',
            isCompleted
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-primary/10 text-primary'
          )}>
            {isCompleted ? (
              <MdCheckCircle className="h-6 w-6" />
            ) : (
              <>
                <span className="text-lg leading-none">{onboarding.metadata.scheduledTime?.split(':')[0]}</span>
                <span className="text-[10px] leading-none mt-0.5">
                  {parseInt(onboarding.metadata.scheduledTime?.split(':')[0] || '0') < 12 ? 'AM' : 'PM'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Customer */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                {getInitials(onboarding.customerName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{onboarding.customerName}</p>
              <p className="text-xs text-muted-foreground truncate">{onboarding.customerEmail}</p>
            </div>
          </div>

          {/* Vehicles */}
          <div className="flex items-center gap-2 mb-2">
            <MdDirectionsCar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {vehicles.slice(0, 2).map((v, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">
                  {v.make} {v.model}
                </Badge>
              ))}
              {vehicles.length > 2 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{vehicles.length - 2} more
                </Badge>
              )}
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MdLocationOn className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Destination: {onboarding.metadata.destinationCountry}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {!isCompleted && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5"
                onClick={(e) => {
                  e.stopPropagation()
                  // Would open video call
                }}
              >
                <MdVideocam className="h-3.5 w-3.5" />
                Join
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs gap-1.5"
                onClick={(e) => {
                  e.stopPropagation()
                  window.location.href = `tel:${onboarding.customerPhone}`
                }}
              >
                <MdPhone className="h-3.5 w-3.5" />
                Call
              </Button>
            </>
          )}
        </div>
      </div>
    </button>
  )
}

interface NeedsSchedulingItemProps {
  onboarding: OnboardingSubmission
  onClick: () => void
}

function NeedsSchedulingItem({ onboarding, onClick }: NeedsSchedulingItemProps) {
  const vehicles = onboarding.metadata.vehicles

  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-card rounded-xl border text-left transition-all hover:shadow-md hover:border-amber-500/30"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-sm bg-amber-500/15 text-amber-600 font-medium">
            {getInitials(onboarding.customerName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{onboarding.customerName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <MdDirectionsCar className="h-3 w-3" />
            <span className="truncate">
              {vehicles.map(v => `${v.make} ${v.model}`).join(', ')}
            </span>
          </div>
        </div>

        {/* Preferred time */}
        {onboarding.metadata.wantsCall && onboarding.metadata.preferredDate && (
          <div className="text-right text-xs text-muted-foreground">
            <p>Preferred:</p>
            <p className="font-medium text-foreground">
              {format(parseISO(onboarding.metadata.preferredDate), 'MMM d')}
              {onboarding.metadata.preferredTime && ` at ${onboarding.metadata.preferredTime}`}
            </p>
          </div>
        )}

        {/* Schedule button */}
        <Button size="sm" variant="default" className="h-8 text-xs gap-1.5">
          <MdEvent className="h-3.5 w-3.5" />
          Schedule
        </Button>
      </div>
    </button>
  )
}

export function OnboardingTimeline({ data, onItemClick }: OnboardingTimelineProps) {
  // Group and sort data
  const { scheduledByDate, needsScheduling, completed } = useMemo(() => {
    const scheduled: Record<string, OnboardingSubmission[]> = {}
    const unscheduled: OnboardingSubmission[] = []
    const done: OnboardingSubmission[] = []

    data.forEach(item => {
      // Check actual onboarding status from metadata
      const hasScheduledDate = item.metadata.scheduledDate

      if (item.status === 'closed') {
        done.push(item)
      } else if (hasScheduledDate) {
        const dateKey = getDateKey(item.metadata.scheduledDate!)
        if (!scheduled[dateKey]) {
          scheduled[dateKey] = []
        }
        scheduled[dateKey].push(item)
      } else {
        unscheduled.push(item)
      }
    })

    // Sort scheduled items by time within each day
    Object.keys(scheduled).forEach(key => {
      scheduled[key].sort((a, b) => {
        const timeA = a.metadata.scheduledTime || '00:00'
        const timeB = b.metadata.scheduledTime || '00:00'
        return timeA.localeCompare(timeB)
      })
    })

    // Sort unscheduled by created date (newest first)
    unscheduled.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Sort completed by date (most recent first)
    done.sort((a, b) => (b.respondedAt?.getTime() || 0) - (a.respondedAt?.getTime() || 0))

    return {
      scheduledByDate: scheduled,
      needsScheduling: unscheduled,
      completed: done,
    }
  }, [data])

  // Sort date keys
  const sortedDates = Object.keys(scheduledByDate).sort()

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <MdInbox className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-1">No onboarding requests</h3>
        <p className="text-sm text-muted-foreground/70">New consultation requests will appear here</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)] min-h-[500px]">
      <div className="space-y-6 pr-4">
        {/* Scheduled Calls by Date */}
        {sortedDates.map(dateKey => {
          const items = scheduledByDate[dateKey]
          const date = parseISO(dateKey)

          return (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold',
                  isToday(date)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}>
                  <MdCalendarToday className="h-4 w-4" />
                  {formatTimeLabel(date)}
                </div>
                <div className="flex-1 h-px bg-border" />
                <Badge variant="secondary" className="text-xs">
                  {items.length} call{items.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Items */}
              <div className="space-y-3 ml-4">
                {items.map(item => (
                  <ScheduledItem
                    key={item.id}
                    onboarding={item}
                    onClick={() => onItemClick(item)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Needs Scheduling Section */}
        {needsScheduling.length > 0 && (
          <div>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <MdAccessTime className="h-4 w-4" />
                Needs Scheduling
              </div>
              <div className="flex-1 h-px bg-border" />
              <Badge variant="secondary" className="text-xs bg-amber-500/15 text-amber-600">
                {needsScheduling.length}
              </Badge>
            </div>

            {/* Items */}
            <div className="space-y-3 ml-4">
              {needsScheduling.map(item => (
                <NeedsSchedulingItem
                  key={item.id}
                  onboarding={item}
                  onClick={() => onItemClick(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Section (collapsed by default, show recent) */}
        {completed.length > 0 && (
          <div>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <MdCheckCircle className="h-4 w-4" />
                Completed
              </div>
              <div className="flex-1 h-px bg-border" />
              <Badge variant="secondary" className="text-xs bg-emerald-500/15 text-emerald-600">
                {completed.length}
              </Badge>
            </div>

            {/* Items - show only recent 3 */}
            <div className="space-y-3 ml-4">
              {completed.slice(0, 3).map(item => (
                <ScheduledItem
                  key={item.id}
                  onboarding={item}
                  onClick={() => onItemClick(item)}
                />
              ))}
              {completed.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{completed.length - 3} more completed calls
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
