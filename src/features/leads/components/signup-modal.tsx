'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  MdVerifiedUser,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdBusiness,
  MdCampaign,
  MdCalendarToday,
  MdClose,
  MdOpenInNew,
  MdContentCopy,
  MdCheck,
  MdCheckCircle,
  MdCancel,
  MdPersonAdd,
  MdAccessTime,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import {
  type SignupSubmission,
  type SignupStatus,
  staffMembers,
} from '../data/submissions'

interface SignupModalProps {
  signup: SignupSubmission | null
  open: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onAssign: (id: string, staffId: string, staffName: string) => void
}

// Status badge styles
const statusBadgeStyles: Record<SignupStatus, { class: string; label: string; icon: React.ElementType }> = {
  pending: {
    class: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    label: 'Pending Verification',
    icon: MdAccessTime,
  },
  verified: {
    class: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    label: 'Verified',
    icon: MdCheckCircle,
  },
  rejected: {
    class: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
    label: 'Rejected',
    icon: MdCancel,
  },
}

// Source badge colors
const sourceColors: Record<string, string> = {
  'Google Search': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  'Social Media': 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  'YouTube': 'bg-red-500/15 text-red-600 dark:text-red-400',
  'Friend Referral': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'Online Ad': 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  'Trade Show': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'Existing Customer': 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  'Other': 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function SignupModal({
  signup,
  open,
  onClose,
  onApprove,
  onReject,
  onAssign,
}: SignupModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setCopiedField(null)
      setShowRejectDialog(false)
    }
  }, [open, signup?.id])

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
      if (e.key === 'Escape' && open && !showRejectDialog) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, showRejectDialog])

  const handleCopy = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  const handleApprove = useCallback(async () => {
    if (!signup) return
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onApprove(signup.id)
    setIsProcessing(false)
    onClose()
  }, [signup, onApprove, onClose])

  const handleReject = useCallback(async () => {
    if (!signup) return
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onReject(signup.id)
    setIsProcessing(false)
    setShowRejectDialog(false)
    onClose()
  }, [signup, onReject, onClose])

  if (!signup) return null

  const verificationStatus = signup.metadata.verificationStatus
  const statusConfig = statusBadgeStyles[verificationStatus]
  const StatusIcon = statusConfig.icon
  const sourceColor = sourceColors[signup.metadata.hearAboutUs] || sourceColors['Other']
  const isPending = verificationStatus === 'pending'

  return (
    <>
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
              className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-background shadow-2xl border flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <MdVerifiedUser className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold">{signup.submissionNumber}</p>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] mt-1 gap-1', statusConfig.class)}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
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
                  {/* Customer Details Card */}
                  <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
                    {/* Avatar and Name */}
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                          {getInitials(signup.customerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg">{signup.customerName}</p>

                        {/* Email */}
                        <button
                          onClick={() => window.location.href = `mailto:${signup.customerEmail}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mt-1"
                        >
                          <MdEmail className="h-3.5 w-3.5" />
                          <span className="truncate">{signup.customerEmail}</span>
                          <MdOpenInNew className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* Phone */}
                        {signup.customerPhone && (
                          <button
                            onClick={() => window.location.href = `tel:${signup.customerPhone}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mt-1"
                          >
                            <MdPhone className="h-3.5 w-3.5" />
                            <span>{signup.customerPhone}</span>
                            <MdOpenInNew className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </div>

                      {/* Copy email */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopy(signup.customerEmail, 'email')}
                      >
                        {copiedField === 'email' ? (
                          <MdCheck className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <MdContentCopy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <Separator />

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Company */}
                      {signup.metadata.company && (
                        <div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                            <MdBusiness className="h-3 w-3" />
                            Company
                          </span>
                          <p className="text-sm font-medium">{signup.metadata.company}</p>
                        </div>
                      )}

                      {/* Location */}
                      <div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                          <MdLocationOn className="h-3 w-3" />
                          Location
                        </span>
                        <p className="text-sm font-medium">
                          {signup.metadata.city ? `${signup.metadata.city}, ` : ''}{signup.metadata.country}
                        </p>
                      </div>

                      {/* Source */}
                      <div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                          <MdCampaign className="h-3 w-3" />
                          Source
                        </span>
                        <Badge variant="secondary" className={cn('text-xs', sourceColor)}>
                          {signup.metadata.hearAboutUs}
                        </Badge>
                      </div>

                      {/* Date */}
                      <div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                          <MdCalendarToday className="h-3 w-3" />
                          Registered
                        </span>
                        <p className="text-sm font-medium">
                          {format(signup.createdAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Message</h4>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {signup.message}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer - Actions */}
              <div className="border-t bg-muted/20 p-4 space-y-4">
                {/* Assignment */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Assign to</label>
                  <Select
                    value={signup.assignedTo || ''}
                    onValueChange={(value) => {
                      const staff = staffMembers.find(s => s.id === value)
                      if (staff) {
                        onAssign(signup.id, staff.id, staff.name)
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

                {/* Action Buttons */}
                {isPending ? (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={isProcessing}
                    >
                      <MdCancel className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleApprove}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <>
                          <MdPersonAdd className="h-4 w-4 mr-2" />
                          Approve & Create Customer
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.location.href = `mailto:${signup.customerEmail}`}
                    >
                      <MdEmail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    {verificationStatus === 'verified' && (
                      <Button className="flex-1" onClick={() => window.open('/customers', '_blank')}>
                        <MdVerifiedUser className="h-4 w-4 mr-2" />
                        View Customer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this signup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the signup from <strong>{signup?.customerName}</strong> as rejected.
              They will not be added as a customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Processing...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
