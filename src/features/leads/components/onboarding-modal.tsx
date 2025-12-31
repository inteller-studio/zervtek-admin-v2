'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MdFactCheck,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdDirectionsCar,
  MdCalendarToday,
  MdAccessTime,
  MdPublic,
  MdClose,
  MdOpenInNew,
  MdContentCopy,
  MdCheck,
  MdEvent,
  MdVideocam,
  MdCheckCircle,
  MdSend,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import {
  type OnboardingSubmission,
  type OnboardingStatus,
  staffMembers,
} from '../data/submissions'

interface OnboardingModalProps {
  onboarding: OnboardingSubmission | null
  open: boolean
  onClose: () => void
  onStatusChange: (id: string, status: OnboardingStatus) => void
  onAssign: (id: string, staffId: string, staffName: string) => void
  onSchedule: (id: string, date: string, time: string) => void
}

// Status badge styles
const statusBadgeStyles: Record<OnboardingStatus, { class: string; label: string }> = {
  new: { class: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20', label: 'New' },
  scheduled: { class: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20', label: 'Scheduled' },
  completed: { class: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: 'Completed' },
  cancelled: { class: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/20', label: 'Cancelled' },
}

// Status colors for the segmented control
const statusConfig: Record<OnboardingStatus, { label: string; activeClass: string }> = {
  new: { label: 'New', activeClass: 'bg-blue-500 text-white' },
  scheduled: { label: 'Scheduled', activeClass: 'bg-purple-500 text-white' },
  completed: { label: 'Done', activeClass: 'bg-emerald-500 text-white' },
  cancelled: { label: 'Cancel', activeClass: 'bg-slate-500 text-white' },
}

// Time slot options
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
]

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function OnboardingModal({
  onboarding,
  open,
  onClose,
  onStatusChange,
  onAssign,
  onSchedule,
}: OnboardingModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open && onboarding) {
      setCopiedField(null)
      setScheduleDate(onboarding.metadata.scheduledDate || onboarding.metadata.preferredDate || '')
      setScheduleTime(onboarding.metadata.scheduledTime || onboarding.metadata.preferredTime || '')
    }
  }, [open, onboarding?.id])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const handleCopy = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  const handleSchedule = useCallback(async () => {
    if (!onboarding || !scheduleDate || !scheduleTime) return
    setIsScheduling(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onSchedule(onboarding.id, scheduleDate, scheduleTime)
    setIsScheduling(false)
  }, [onboarding, scheduleDate, scheduleTime, onSchedule])

  const handleStatusClick = useCallback((status: OnboardingStatus) => {
    if (onboarding) {
      onStatusChange(onboarding.id, status)
    }
  }, [onboarding, onStatusChange])

  if (!onboarding) return null

  // Map generic status to onboarding status
  const getOnboardingStatus = (): OnboardingStatus => {
    if (onboarding.metadata.scheduledDate) return 'scheduled'
    if (onboarding.status === 'closed') return 'completed'
    return 'new'
  }

  const currentStatus = getOnboardingStatus()
  const isScheduled = currentStatus === 'scheduled'
  const isCompleted = currentStatus === 'completed'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-background shadow-2xl border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  <MdFactCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold">{onboarding.submissionNumber}</p>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] mt-1', statusBadgeStyles[currentStatus].class)}
                  >
                    {statusBadgeStyles[currentStatus].label}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 rounded-full">
                <MdClose className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 space-y-5">
                {/* Customer Section */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(onboarding.customerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg">{onboarding.customerName}</p>

                    {/* Email */}
                    <button
                      onClick={() => window.location.href = `mailto:${onboarding.customerEmail}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mt-1"
                    >
                      <MdEmail className="h-3.5 w-3.5" />
                      <span className="truncate">{onboarding.customerEmail}</span>
                      <MdOpenInNew className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Phone */}
                    {onboarding.customerPhone && (
                      <button
                        onClick={() => window.location.href = `tel:${onboarding.customerPhone}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mt-1"
                      >
                        <MdPhone className="h-3.5 w-3.5" />
                        <span>{onboarding.customerPhone}</span>
                        <MdOpenInNew className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}

                    {/* Destination */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MdPublic className="h-3.5 w-3.5" />
                      <span>Destination: <strong className="text-foreground">{onboarding.metadata.destinationCountry}</strong></span>
                    </div>
                  </div>

                  {/* Copy email */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopy(onboarding.customerEmail, 'email')}
                  >
                    {copiedField === 'email' ? (
                      <MdCheck className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <MdContentCopy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Separator />

                {/* Vehicles of Interest */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MdDirectionsCar className="h-4 w-4" />
                    Vehicles of Interest
                  </h4>
                  <div className="p-4 bg-muted/30 rounded-xl border">
                    <div className="flex flex-wrap gap-2">
                      {onboarding.metadata.vehicles.map((vehicle, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-sm py-1.5 px-3 gap-2"
                        >
                          <span className="font-semibold">{vehicle.make} {vehicle.model}</span>
                          <span className="text-muted-foreground">({vehicle.yearRange})</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Call Preference */}
                {onboarding.metadata.wantsCall && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <MdCalendarToday className="h-4 w-4" />
                      Call Preference
                    </h4>
                    <div className="p-4 bg-muted/30 rounded-xl border grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Preferred Date</span>
                        <p className="font-medium">
                          {onboarding.metadata.preferredDate
                            ? format(parseISO(onboarding.metadata.preferredDate), 'MMM d, yyyy')
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Preferred Time</span>
                        <p className="font-medium">{onboarding.metadata.preferredTime || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Timezone</span>
                        <p className="font-medium">{onboarding.metadata.timezone || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scheduled Call Info */}
                {isScheduled && (
                  <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <MdVideocam className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-purple-600 dark:text-purple-400">Call Scheduled</p>
                        <p className="text-sm text-muted-foreground">
                          {onboarding.metadata.scheduledDate && format(parseISO(onboarding.metadata.scheduledDate), 'EEEE, MMMM d')} at {onboarding.metadata.scheduledTime}
                        </p>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <MdVideocam className="h-4 w-4 mr-2" />
                        Join Call
                      </Button>
                    </div>
                  </div>
                )}

                {/* Schedule Section (if not scheduled yet) */}
                {!isScheduled && !isCompleted && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <MdEvent className="h-4 w-4" />
                      Schedule Call
                    </h4>
                    <div className="p-4 bg-muted/30 rounded-xl border space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
                          <Input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Time</label>
                          <Select value={scheduleTime} onValueChange={setScheduleTime}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select time..." />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(slot => (
                                <SelectItem key={slot} value={slot}>
                                  {slot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        onClick={handleSchedule}
                        disabled={!scheduleDate || !scheduleTime || isScheduling}
                        className="w-full"
                      >
                        {isScheduling ? (
                          <span className="animate-pulse">Scheduling...</span>
                        ) : (
                          <>
                            <MdEvent className="h-4 w-4 mr-2" />
                            Schedule Call
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Message</h4>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {onboarding.message}
                    </p>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-xs text-muted-foreground">
                  Submitted: {format(onboarding.createdAt, 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </ScrollArea>

            {/* Footer - Actions */}
            <div className="border-t bg-muted/20 p-4 space-y-4">
              {/* Assignment & Status Row */}
              <div className="flex items-center gap-4">
                {/* Assignment */}
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Assign to</label>
                  <Select
                    value={onboarding.assignedTo || ''}
                    onValueChange={(value) => {
                      const staff = staffMembers.find(s => s.id === value)
                      if (staff) {
                        onAssign(onboarding.id, staff.id, staff.name)
                      }
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select staff..." />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">
                                {getInitials(staff.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{staff.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                  <div className="flex rounded-lg border bg-background p-0.5">
                    {(['new', 'scheduled', 'completed', 'cancelled'] as OnboardingStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusClick(status)}
                        className={cn(
                          'flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all',
                          currentStatus === status
                            ? statusConfig[status].activeClass
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        {statusConfig[status].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.location.href = `mailto:${onboarding.customerEmail}`}
                >
                  <MdSend className="h-4 w-4 mr-2" />
                  Send Calendar Invite
                </Button>
                {isCompleted ? (
                  <Button className="flex-1" disabled>
                    <MdCheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </Button>
                ) : isScheduled ? (
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <MdVideocam className="h-4 w-4 mr-2" />
                    Join Call
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => window.location.href = `tel:${onboarding.customerPhone}`}
                  >
                    <MdPhone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
