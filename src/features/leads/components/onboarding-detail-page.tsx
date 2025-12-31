'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MdArrowBack,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdDirectionsCar,
  MdAccessTime,
  MdPerson,
  MdSend,
  MdCheckCircle,
  MdCancel,
  MdContentCopy,
  MdCheck,
  MdChat,
  MdCalendarToday,
  MdVideocam,
  MdEvent,
  MdPublic,
  MdDirectionsBoat,
  MdSchedule,
  MdEdit,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import {
  onboardingRequests as allOnboarding,
  type OnboardingSubmission,
  staffMembers,
} from '../data/submissions'

const statusConfig = {
  new: {
    label: 'Needs Scheduling',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    icon: MdAccessTime,
  },
  scheduled: {
    label: 'Scheduled',
    color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    icon: MdCalendarToday,
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    icon: MdCheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-slate-500/15 text-slate-500 dark:text-slate-400',
    icon: MdCancel,
  },
}

const timezones = [
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'America/New_York', label: 'US Eastern (EST)' },
  { value: 'America/Los_Angeles', label: 'US Pacific (PST)' },
  { value: 'America/Chicago', label: 'US Central (CST)' },
  { value: 'Europe/London', label: 'UK (GMT)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)' },
  { value: 'Australia/Sydney', label: 'Australia (AEST)' },
  { value: 'Asia/Dubai', label: 'UAE (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Pacific/Auckland', label: 'New Zealand (NZST)' },
]

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
]

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

function getOnboardingStatus(item: OnboardingSubmission): keyof typeof statusConfig {
  if (item.status === 'closed') return 'completed'
  if (item.metadata.scheduledDate) return 'scheduled'
  return 'new'
}

function formatTime12h(time: string) {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function OnboardingDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const [onboarding, setOnboarding] = useState(allOnboarding)
  const [notes, setNotes] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  const item = useMemo(() => {
    return onboarding.find(o => o.id === id)
  }, [onboarding, id])

  const handleSchedule = useCallback(() => {
    if (!scheduleDate || !scheduleTime) return

    setOnboarding(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: 'in_progress' as const,
          metadata: {
            ...o.metadata,
            scheduledDate: scheduleDate,
            scheduledTime: scheduleTime,
          },
        }
      }
      return o
    }))
    setShowScheduleDialog(false)
    setScheduleDate('')
    setScheduleTime('')
  }, [id, scheduleDate, scheduleTime])

  const handleComplete = useCallback(() => {
    setOnboarding(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: 'closed' as const,
          respondedAt: new Date(),
        }
      }
      return o
    }))
  }, [id])

  const handleCancel = useCallback(() => {
    setOnboarding(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: 'closed' as const,
          metadata: {
            ...o.metadata,
            scheduledDate: undefined,
            scheduledTime: undefined,
          },
        }
      }
      return o
    }))
    setShowCancelDialog(false)
  }, [id])

  const handleAssign = useCallback((staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId)
    if (!staff) return

    setOnboarding(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          assignedTo: staffId,
          assignedToName: staff.name,
        } as OnboardingSubmission
      }
      return o
    }))
  }, [id])

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  if (!item) {
    return (
      <>
        <Header fixed>
          <Search />
          <HeaderActions />
        </Header>
        <Main className="flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <MdCancel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">Request Not Found</h2>
              <p className="text-muted-foreground text-sm mb-4">
                The onboarding request you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push('/leads/onboarding')}>
                <MdArrowBack className="h-4 w-4 mr-2" />
                Back to Onboarding
              </Button>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  const currentStatus = getOnboardingStatus(item)
  const status = statusConfig[currentStatus]
  const StatusIcon = status.icon
  const isScheduled = !!item.metadata.scheduledDate
  const isCompleted = item.status === 'closed'

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderActions />
      </Header>

      <Main className="flex flex-1 flex-col gap-6">
        {/* Back Button & Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/leads/onboarding')}
              className="gap-2"
            >
              <MdArrowBack className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">{item.submissionNumber}</h1>
                <Badge className={cn("gap-1", status.color)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Submitted {formatTimeAgo(item.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && (
              <>
                {!isScheduled ? (
                  <Button size="sm" onClick={() => setShowScheduleDialog(true)}>
                    <MdEvent className="h-4 w-4 mr-1.5" />
                    Schedule Call
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowScheduleDialog(true)}
                    >
                      <MdEdit className="h-4 w-4 mr-1.5" />
                      Reschedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCancelDialog(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <MdCancel className="h-4 w-4 mr-1.5" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleComplete}
                    >
                      <MdCheckCircle className="h-4 w-4 mr-1.5" />
                      Mark Complete
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scheduled Call Card */}
            {isScheduled && !isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <Card className="border-purple-500/30 bg-purple-500/5">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold">
                          <span className="text-xl leading-none">{item.metadata.scheduledTime?.split(':')[0]}</span>
                          <span className="text-[10px] leading-none mt-0.5">
                            {parseInt(item.metadata.scheduledTime?.split(':')[0] || '0') < 12 ? 'AM' : 'PM'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Scheduled Consultation</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(item.metadata.scheduledDate!), 'EEEE, MMMM d, yyyy')} at {formatTime12h(item.metadata.scheduledTime!)}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="gap-1.5">
                        <MdVideocam className="h-4 w-4" />
                        Start Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Customer Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MdPerson className="h-4 w-4" />
                    Customer Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {item.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-semibold text-lg">{item.customerName}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between group bg-muted/50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MdEmail className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{item.customerEmail}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(item.customerEmail, 'email')}
                          >
                            {copiedField === 'email' ? (
                              <MdCheck className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <MdContentCopy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {item.customerPhone && (
                          <div className="flex items-center justify-between group bg-muted/50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 text-sm">
                              <MdPhone className="h-4 w-4 text-muted-foreground" />
                              <span>{item.customerPhone}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(item.customerPhone!, 'phone')}
                            >
                              {copiedField === 'phone' ? (
                                <MdCheck className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <MdContentCopy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vehicles of Interest */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MdDirectionsCar className="h-4 w-4" />
                      Vehicles of Interest
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {item.metadata.vehicles.length} vehicle{item.metadata.vehicles.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {item.metadata.vehicles.map((vehicle, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
                      >
                        <div className="h-12 w-12 bg-background rounded-lg flex items-center justify-center border">
                          <MdDirectionsCar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-muted-foreground">
                            Year Range: {vehicle.yearRange === 'pre-2000' ? 'Classic (Pre-2000)' : vehicle.yearRange === 'no-preference' ? 'No Preference' : vehicle.yearRange}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Destination */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MdDirectionsBoat className="h-4 w-4" />
                    Shipping Destination
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                    <div className="h-10 w-10 bg-background rounded-lg flex items-center justify-center border">
                      <MdLocationOn className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.metadata.destinationCountry}</p>
                      <p className="text-sm text-muted-foreground">Export destination</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Call Preferences */}
            {item.metadata.wantsCall && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MdSchedule className="h-4 w-4" />
                      Customer's Call Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {item.metadata.timezone && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Timezone</p>
                          <div className="flex items-center gap-2">
                            <MdPublic className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {timezones.find(tz => tz.value === item.metadata.timezone)?.label || item.metadata.timezone}
                            </span>
                          </div>
                        </div>
                      )}
                      {item.metadata.preferredDate && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Preferred Date</p>
                          <div className="flex items-center gap-2">
                            <MdCalendarToday className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {format(parseISO(item.metadata.preferredDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      )}
                      {item.metadata.preferredTime && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Preferred Time</p>
                          <div className="flex items-center gap-2">
                            <MdAccessTime className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {formatTime12h(item.metadata.preferredTime)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MdChat className="h-4 w-4" />
                    Internal Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Add notes about this consultation request..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button size="sm" disabled={!notes.trim()}>
                      <MdSend className="h-4 w-4 mr-2" />
                      Save Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={item.assignedTo || 'unassigned'}
                    onValueChange={handleAssign}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">
                                {staff.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{staff.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {item.assignedToName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Currently assigned to {item.assignedToName}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            {!isCompleted && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {item.customerPhone && (
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => window.location.href = `tel:${item.customerPhone}`}
                      >
                        <MdPhone className="h-4 w-4" />
                        Call Customer
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => window.location.href = `mailto:${item.customerEmail}`}
                    >
                      <MdEmail className="h-4 w-4" />
                      Send Email
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-emerald-600 hover:text-emerald-700"
                      onClick={() => window.open(`https://wa.me/${item.customerPhone?.replace(/\D/g, '')}`, '_blank')}
                    >
                      <MdChat className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground mt-1.5" />
                      <div>
                        <p className="text-sm">Request submitted</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    {item.assignedToName && (
                      <div className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5" />
                        <div>
                          <p className="text-sm">Assigned to {item.assignedToName}</p>
                          <p className="text-xs text-muted-foreground">Updated</p>
                        </div>
                      </div>
                    )}
                    {item.metadata.scheduledDate && (
                      <div className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5" />
                        <div>
                          <p className="text-sm">Call scheduled</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(item.metadata.scheduledDate), 'MMM d, yyyy')} at {formatTime12h(item.metadata.scheduledTime!)}
                          </p>
                        </div>
                      </div>
                    )}
                    {item.status === 'closed' && (
                      <div className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                        <div>
                          <p className="text-sm">Consultation completed</p>
                          <p className="text-xs text-muted-foreground">
                            {item.respondedAt ? formatDate(item.respondedAt) : 'Completed'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submission Info */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Submission Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-mono text-xs">{item.submissionNumber}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted</span>
                    <span>{format(item.createdAt, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wants Call</span>
                    <Badge variant={item.metadata.wantsCall ? "default" : "secondary"} className="text-xs">
                      {item.metadata.wantsCall ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </Main>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isScheduled ? 'Reschedule' : 'Schedule'} Consultation Call</DialogTitle>
            <DialogDescription>
              Set a date and time for the consultation call with {item.customerName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {item.metadata.wantsCall && item.metadata.preferredDate && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">Customer's Preference</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {format(parseISO(item.metadata.preferredDate), 'EEEE, MMM d, yyyy')}
                  {item.metadata.preferredTime && ` at ${formatTime12h(item.metadata.preferredTime)}`}
                  {item.metadata.timezone && ` (${timezones.find(tz => tz.value === item.metadata.timezone)?.label || item.metadata.timezone})`}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Select value={scheduleTime} onValueChange={setScheduleTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{formatTime12h(time)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={!scheduleDate || !scheduleTime}>
              <MdEvent className="h-4 w-4 mr-2" />
              {isScheduled ? 'Reschedule' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this call?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the scheduled consultation call. You can reschedule it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Scheduled</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Call
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
