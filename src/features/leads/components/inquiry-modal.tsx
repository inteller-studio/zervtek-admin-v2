'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  MdDirectionsCar,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSend,
  MdClose,
  MdOpenInNew,
  MdContentCopy,
  MdCheck,
  MdAttachMoney,
  MdSpeed,
  MdChevronRight,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import {
  type InquirySubmission,
  type InquiryStatus,
  staffMembers,
} from '../data/submissions'

interface InquiryModalProps {
  inquiry: InquirySubmission | null
  open: boolean
  onClose: () => void
  onStatusChange: (id: string, status: InquiryStatus) => void
  onAssign: (id: string, staffId: string, staffName: string) => void
  onReply: (id: string, message: string) => void
}

// Inquiry type badge styles
const inquiryTypeBadgeStyles: Record<string, string> = {
  price: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  availability: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  shipping: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
  inspection: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
  general: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20',
}

// Status colors for the segmented control
const statusConfig: Record<InquiryStatus, { label: string; activeClass: string }> = {
  new: { label: 'New', activeClass: 'bg-blue-500 text-white' },
  in_progress: { label: 'Progress', activeClass: 'bg-amber-500 text-white' },
  responded: { label: 'Done', activeClass: 'bg-emerald-500 text-white' },
  closed: { label: 'Closed', activeClass: 'bg-slate-500 text-white' },
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatPrice(price?: number): string {
  if (!price) return 'Price on request'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatMileage(mileage?: number): string {
  if (!mileage) return ''
  return new Intl.NumberFormat('en-US').format(mileage) + ' km'
}

export function InquiryModal({
  inquiry,
  open,
  onClose,
  onStatusChange,
  onAssign,
  onReply,
}: InquiryModalProps) {
  const [replyText, setReplyText] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setReplyText('')
      setCopiedField(null)
    }
  }, [open, inquiry?.id])

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

  const handleSendReply = useCallback(async () => {
    if (!replyText.trim() || !inquiry) return
    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onReply(inquiry.id, replyText)
    setReplyText('')
    setIsSending(false)
  }, [replyText, inquiry, onReply])

  const handleStatusClick = useCallback((status: InquiryStatus) => {
    if (inquiry && inquiry.status !== status) {
      onStatusChange(inquiry.id, status)
    }
  }, [inquiry, onStatusChange])

  if (!inquiry) return null

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
                <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  <MdDirectionsCar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold">{inquiry.submissionNumber}</p>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] mt-1 capitalize', inquiryTypeBadgeStyles[inquiry.metadata.inquiryType])}
                  >
                    {inquiry.metadata.inquiryType} inquiry
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
                {/* Vehicle Card - Prominent */}
                <button
                  onClick={() => {
                    // Navigate to stock vehicle page
                    window.open(`/stock-vehicles/${inquiry.metadata.vehicleId}`, '_blank')
                  }}
                  className="w-full p-4 bg-gradient-to-br from-muted/60 to-muted/30 rounded-xl border hover:border-primary/50 hover:shadow-md transition-all group text-left"
                >
                  <div className="flex items-start gap-4">
                    {/* Vehicle Image Placeholder */}
                    <div className="w-24 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <MdDirectionsCar className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                          {inquiry.metadata.vehicleTitle}
                        </h3>
                        <MdChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        {inquiry.metadata.vehiclePrice && (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <MdAttachMoney className="h-4 w-4" />
                            <span>{formatPrice(inquiry.metadata.vehiclePrice).replace('$', '')}</span>
                          </div>
                        )}
                        {inquiry.metadata.vehicleMileage && (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                            <MdSpeed className="h-4 w-4" />
                            <span>{formatMileage(inquiry.metadata.vehicleMileage)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Click to view vehicle details
                      </p>
                    </div>
                  </div>
                </button>

                <Separator />

                {/* Customer Section */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(inquiry.customerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base">{inquiry.customerName}</p>

                    {/* Email */}
                    <button
                      onClick={() => window.location.href = `mailto:${inquiry.customerEmail}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mt-1"
                    >
                      <MdEmail className="h-3.5 w-3.5" />
                      <span className="truncate">{inquiry.customerEmail}</span>
                      <MdOpenInNew className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Phone */}
                    {inquiry.customerPhone && (
                      <button
                        onClick={() => window.location.href = `tel:${inquiry.customerPhone}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mt-1"
                      >
                        <MdPhone className="h-3.5 w-3.5" />
                        <span>{inquiry.customerPhone}</span>
                        <MdOpenInNew className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}

                    {/* Location */}
                    {inquiry.country && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MdLocationOn className="h-3.5 w-3.5" />
                        <span>{inquiry.country}</span>
                      </div>
                    )}
                  </div>

                  {/* Copy email */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopy(inquiry.customerEmail, 'email')}
                  >
                    {copiedField === 'email' ? (
                      <MdCheck className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <MdContentCopy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Separator />

                {/* Message Content */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">{inquiry.subject}</h4>
                    <span className="text-xs text-muted-foreground">
                      {format(inquiry.createdAt, 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {inquiry.message}
                    </p>
                  </div>
                </div>

                {/* Timestamps */}
                {inquiry.respondedAt && (
                  <div className="text-xs text-muted-foreground">
                    Responded: {format(inquiry.respondedAt, 'MMM d, h:mm a')}
                  </div>
                )}
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
                    value={inquiry.assignedTo || ''}
                    onValueChange={(value) => {
                      const staff = staffMembers.find(s => s.id === value)
                      if (staff) {
                        onAssign(inquiry.id, staff.id, staff.name)
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
                    {(['new', 'in_progress', 'responded', 'closed'] as InquiryStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusClick(status)}
                        className={cn(
                          'flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all',
                          inquiry.status === status
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

              {/* Reply Section */}
              <div className="flex gap-3">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[60px] resize-none flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSendReply()
                    }
                  }}
                />
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isSending}
                  className="h-auto px-6"
                >
                  {isSending ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <>
                      <MdSend className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Press {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to send
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
