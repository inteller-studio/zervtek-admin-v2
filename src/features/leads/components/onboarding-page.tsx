'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { format, isToday, isTomorrow, parseISO, startOfDay } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent } from '@/components/ui/card'
import { StatsCard } from '@/features/dashboard/components/stats-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MdSearch,
  MdFilterList,
  MdClose,
  MdCalendarToday,
  MdAccessTime,
  MdLocationOn,
  MdDirectionsCar,
  MdPhone,
  MdVideocam,
  MdCheckCircle,
  MdEvent,
  MdInbox,
  MdArrowForward,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import {
  onboardingRequests as initialOnboarding,
  type OnboardingSubmission,
  staffMembers,
} from '../data/submissions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

export function OnboardingPage() {
  const router = useRouter()
  const [onboarding] = useState(initialOnboarding)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Stats
  const stats = useMemo(() => {
    const needsScheduling = onboarding.filter(o => !o.metadata.scheduledDate && o.status !== 'closed')
    const scheduled = onboarding.filter(o => o.metadata.scheduledDate && o.status !== 'closed')
    const completed = onboarding.filter(o => o.status === 'closed')

    return {
      total: onboarding.length,
      needsScheduling: needsScheduling.length,
      scheduled: scheduled.length,
      completed: completed.length,
    }
  }, [onboarding])

  // Filtered onboarding
  const filteredOnboarding = useMemo(() => {
    let result = [...onboarding]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(o =>
        o.submissionNumber.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.customerEmail.toLowerCase().includes(search) ||
        o.metadata.destinationCountry.toLowerCase().includes(search) ||
        o.metadata.vehicles.some(v =>
          v.make.toLowerCase().includes(search) ||
          v.model.toLowerCase().includes(search)
        )
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'needs_scheduling') {
        result = result.filter(o => !o.metadata.scheduledDate && o.status !== 'closed')
      } else if (statusFilter === 'scheduled') {
        result = result.filter(o => o.metadata.scheduledDate && o.status !== 'closed')
      } else if (statusFilter === 'completed') {
        result = result.filter(o => o.status === 'closed')
      }
    }

    return result
  }, [onboarding, searchTerm, statusFilter])

  // Group and sort data
  const { scheduledByDate, needsScheduling, completed } = useMemo(() => {
    const scheduled: Record<string, OnboardingSubmission[]> = {}
    const unscheduled: OnboardingSubmission[] = []
    const done: OnboardingSubmission[] = []

    filteredOnboarding.forEach(item => {
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
  }, [filteredOnboarding])

  const sortedDates = Object.keys(scheduledByDate).sort()

  const handleItemClick = useCallback((item: OnboardingSubmission) => {
    router.push(`/leads/onboarding/${item.id}`)
  }, [router])

  const hasActiveFilters = statusFilter !== 'all'

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderActions />
      </Header>

      <Main className="flex flex-1 flex-col gap-5">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Onboarding</h1>
            <p className="text-muted-foreground text-sm">Consultation calls and scheduling</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Requests"
            value={stats.total}
            description="all consultations"
          />
          <StatsCard
            title="Needs Scheduling"
            value={stats.needsScheduling}
            description="awaiting call setup"
          />
          <StatsCard
            title="Scheduled"
            value={stats.scheduled}
            description="upcoming calls"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            description="finished"
          />
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <MdSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, vehicle, country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button
            variant={hasActiveFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-9"
          >
            <MdFilterList className="h-4 w-4 mr-1.5" />
            Filters
            {hasActiveFilters && (
              <Badge variant="destructive" className="ml-1.5 h-4 w-4 p-0 text-[10px] rounded-full">
                1
              </Badge>
            )}
          </Button>
        </motion.div>

        {/* Filter Bar */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-border/50">
              <CardContent className="py-3 flex flex-wrap items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="needs_scheduling">Needs Scheduling</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    className="h-8 text-muted-foreground"
                  >
                    <MdClose className="h-3.5 w-3.5 mr-1" />
                    Clear
                  </Button>
                )}
                <div className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  {filteredOnboarding.length} result{filteredOnboarding.length !== 1 ? 's' : ''}
                </span>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Timeline Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card className="border-border/50 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-380px)]">
              <div className="p-4 space-y-6">
                {filteredOnboarding.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted/50 p-4 mb-4">
                      <MdInbox className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium text-muted-foreground mb-1">No onboarding requests</h3>
                    <p className="text-sm text-muted-foreground/70">Consultation requests will appear here</p>
                  </div>
                ) : (
                  <>
                    {/* Scheduled Calls by Date */}
                    {sortedDates.map((dateKey, dateIndex) => {
                      const items = scheduledByDate[dateKey]
                      const date = parseISO(dateKey)

                      return (
                        <motion.div
                          key={dateKey}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: dateIndex * 0.05 }}
                        >
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
                            {items.map((item, index) => {
                              const vehicles = item.metadata.vehicles
                              const isCompleted = item.status === 'closed'

                              return (
                                <motion.button
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: index * 0.02 }}
                                  onClick={() => handleItemClick(item)}
                                  className={cn(
                                    'w-full p-4 bg-card rounded-xl border text-left transition-all group',
                                    'hover:shadow-md hover:border-primary/30',
                                    isCompleted && 'opacity-60'
                                  )}
                                >
                                  <div className="flex items-start gap-4">
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
                                            <span className="text-lg leading-none">{item.metadata.scheduledTime?.split(':')[0]}</span>
                                            <span className="text-[10px] leading-none mt-0.5">
                                              {parseInt(item.metadata.scheduledTime?.split(':')[0] || '0') < 12 ? 'AM' : 'PM'}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                            {getInitials(item.customerName)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                          <p className="font-semibold text-sm truncate">{item.customerName}</p>
                                          <p className="text-xs text-muted-foreground truncate">{item.customerEmail}</p>
                                        </div>
                                      </div>

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

                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <MdLocationOn className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>Destination: {item.metadata.destinationCountry}</span>
                                      </div>
                                    </div>

                                    <MdArrowForward className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                                  </div>
                                </motion.button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )
                    })}

                    {/* Needs Scheduling Section */}
                    {needsScheduling.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: sortedDates.length * 0.05 }}
                      >
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

                        <div className="space-y-3 ml-4">
                          {needsScheduling.map((item, index) => {
                            const vehicles = item.metadata.vehicles

                            return (
                              <motion.button
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.02 }}
                                onClick={() => handleItemClick(item)}
                                className="w-full p-4 bg-card rounded-xl border text-left transition-all hover:shadow-md hover:border-amber-500/30 group"
                              >
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="text-sm bg-amber-500/15 text-amber-600 font-medium">
                                      {getInitials(item.customerName)}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{item.customerName}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                      <MdDirectionsCar className="h-3 w-3" />
                                      <span className="truncate">
                                        {vehicles.map(v => `${v.make} ${v.model}`).join(', ')}
                                      </span>
                                    </div>
                                  </div>

                                  {item.metadata.wantsCall && item.metadata.preferredDate && (
                                    <div className="text-right text-xs text-muted-foreground">
                                      <p>Preferred:</p>
                                      <p className="font-medium text-foreground">
                                        {format(parseISO(item.metadata.preferredDate), 'MMM d')}
                                        {item.metadata.preferredTime && ` at ${item.metadata.preferredTime}`}
                                      </p>
                                    </div>
                                  )}

                                  <MdArrowForward className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </motion.button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Completed Section */}
                    {completed.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: (sortedDates.length + 1) * 0.05 }}
                      >
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

                        <div className="space-y-3 ml-4">
                          {completed.slice(0, 5).map((item, index) => (
                            <motion.button
                              key={item.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.02 }}
                              onClick={() => handleItemClick(item)}
                              className="w-full p-4 bg-card rounded-xl border text-left transition-all hover:shadow-md group opacity-60 hover:opacity-100"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                  <MdCheckCircle className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">{item.customerName}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {item.metadata.vehicles.map(v => `${v.make} ${v.model}`).join(', ')}
                                  </p>
                                </div>

                                <MdArrowForward className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </motion.button>
                          ))}
                          {completed.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              +{completed.length - 5} more completed calls
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </Card>
        </motion.div>
      </Main>
    </>
  )
}
