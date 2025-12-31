'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
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
  MdArrowBack,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdDirectionsCar,
  MdAttachMoney,
  MdSpeed,
  MdAccessTime,
  MdPerson,
  MdSend,
  MdCheckCircle,
  MdCancel,
  MdContentCopy,
  MdCheck,
  MdOpenInNew,
  MdChat,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import {
  inquiries as allInquiries,
  type InquirySubmission,
  type InquiryStatus,
  staffMembers,
} from '../data/submissions'

const statusConfig: Record<InquiryStatus, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: 'New', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', icon: MdAccessTime },
  in_progress: { label: 'In Progress', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', icon: MdAccessTime },
  responded: { label: 'Responded', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', icon: MdCheckCircle },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground', icon: MdCancel },
}

const inquiryTypeLabels = {
  price: 'Price Inquiry',
  availability: 'Availability Check',
  shipping: 'Shipping Quote',
  inspection: 'Inspection Request',
  general: 'General Question',
}

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

export function InquiryDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const [inquiries, setInquiries] = useState(allInquiries)
  const [replyMessage, setReplyMessage] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showCloseDialog, setShowCloseDialog] = useState(false)

  const inquiry = useMemo(() => {
    return inquiries.find(i => i.id === id)
  }, [inquiries, id])

  const handleStatusChange = useCallback((status: InquiryStatus) => {
    setInquiries(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status,
          respondedAt: status === 'responded' ? new Date() : i.respondedAt,
        }
      }
      return i
    }))
  }, [id])

  const handleAssign = useCallback((staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId)
    if (!staff) return

    setInquiries(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          assignedTo: staffId,
          assignedToName: staff.name,
          status: i.status === 'new' ? 'in_progress' : i.status,
        } as InquirySubmission
      }
      return i
    }))
  }, [id])

  const handleSendReply = useCallback(() => {
    if (!replyMessage.trim()) return

    setInquiries(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status: 'responded' as InquiryStatus,
          respondedAt: new Date(),
        }
      }
      return i
    }))
    setReplyMessage('')
  }, [id, replyMessage])

  const handleClose = useCallback(() => {
    handleStatusChange('closed')
    setShowCloseDialog(false)
  }, [handleStatusChange])

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  if (!inquiry) {
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
              <h2 className="text-lg font-semibold mb-2">Inquiry Not Found</h2>
              <p className="text-muted-foreground text-sm mb-4">
                The inquiry you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push('/leads/inquiries')}>
                <MdArrowBack className="h-4 w-4 mr-2" />
                Back to Inquiries
              </Button>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  const status = statusConfig[inquiry.status as InquiryStatus]
  const StatusIcon = status.icon

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
              onClick={() => router.push('/leads/inquiries')}
              className="gap-2"
            >
              <MdArrowBack className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">{inquiry.submissionNumber}</h1>
                <Badge className={cn("gap-1", status.color)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Created {formatTimeAgo(inquiry.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {inquiry.status !== 'closed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCloseDialog(true)}
              >
                <MdCancel className="h-4 w-4 mr-1.5" />
                Close
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Message Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-muted text-sm">
                          {inquiry.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{inquiry.customerName}</CardTitle>
                        <CardDescription>{formatDate(inquiry.createdAt)}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {inquiryTypeLabels[inquiry.metadata.inquiryType]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inquiry.subject && (
                    <div>
                      <h3 className="font-medium text-sm mb-1">Subject</h3>
                      <p className="text-sm text-muted-foreground">{inquiry.subject}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-sm mb-2">Message</h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vehicle Details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MdDirectionsCar className="h-4 w-4" />
                    Vehicle of Interest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-28 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <MdDirectionsCar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{inquiry.metadata.vehicleTitle}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MdAttachMoney className="h-3.5 w-3.5" />
                          ${inquiry.metadata.vehiclePrice?.toLocaleString() ?? 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MdSpeed className="h-3.5 w-3.5" />
                          {inquiry.metadata.vehicleMileage?.toLocaleString() ?? 'N/A'} km
                        </span>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto mt-2 text-xs"
                      >
                        View Vehicle
                        <MdOpenInNew className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reply Section */}
            {inquiry.status !== 'closed' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MdChat className="h-4 w-4" />
                      Send Reply
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Type your reply message..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim()}
                      >
                        <MdSend className="h-4 w-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MdPerson className="h-4 w-4" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-2 text-sm">
                        <MdEmail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{inquiry.customerEmail}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(inquiry.customerEmail, 'email')}
                      >
                        {copiedField === 'email' ? (
                          <MdCheck className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <MdContentCopy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    {inquiry.customerPhone && (
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-sm">
                          <MdPhone className="h-4 w-4 text-muted-foreground" />
                          <span>{inquiry.customerPhone}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(inquiry.customerPhone!, 'phone')}
                        >
                          {copiedField === 'phone' ? (
                            <MdCheck className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <MdContentCopy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <MdLocationOn className="h-4 w-4 text-muted-foreground" />
                      <span>{inquiry.country}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Assignment */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={inquiry.assignedTo || 'unassigned'}
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
                  {inquiry.assignedToName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Currently assigned to {inquiry.assignedToName}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(['new', 'in_progress', 'responded'] as InquiryStatus[]).map((s) => (
                      <Button
                        key={s}
                        variant={inquiry.status === s ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(s)}
                        className="flex-1"
                      >
                        {statusConfig[s].label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
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
                        <p className="text-sm">Inquiry created</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(inquiry.createdAt)}
                        </p>
                      </div>
                    </div>
                    {inquiry.assignedToName && (
                      <div className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5" />
                        <div>
                          <p className="text-sm">Assigned to {inquiry.assignedToName}</p>
                          <p className="text-xs text-muted-foreground">Updated</p>
                        </div>
                      </div>
                    )}
                    {inquiry.respondedAt && (
                      <div className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                        <div>
                          <p className="text-sm">Response sent</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(inquiry.respondedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </Main>

      {/* Close Dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the inquiry as closed. You can reopen it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose}>Close Inquiry</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
