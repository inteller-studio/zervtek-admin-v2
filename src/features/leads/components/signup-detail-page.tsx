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
  MdBusiness,
  MdCampaign,
  MdAccessTime,
  MdPerson,
  MdSend,
  MdCheckCircle,
  MdCancel,
  MdContentCopy,
  MdCheck,
  MdChat,
  MdVerifiedUser,
  MdPersonOff,
  MdPublic,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import {
  signups as allSignups,
  type SignupSubmission,
  type SignupStatus,
  staffMembers,
} from '../data/submissions'

const statusConfig: Record<SignupStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    icon: MdAccessTime,
  },
  verified: {
    label: 'Verified',
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    icon: MdCheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500/15 text-red-600 dark:text-red-400',
    icon: MdCancel,
  },
}

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

export function SignupDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const [signups, setSignups] = useState(allSignups)
  const [replyMessage, setReplyMessage] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const signup = useMemo(() => {
    return signups.find(s => s.id === id)
  }, [signups, id])

  const handleStatusChange = useCallback((status: SignupStatus) => {
    setSignups(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          metadata: {
            ...s.metadata,
            verificationStatus: status,
          },
          respondedAt: status !== 'pending' ? new Date() : s.respondedAt,
        }
      }
      return s
    }))
  }, [id])

  const handleAssign = useCallback((staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId)
    if (!staff) return

    setSignups(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          assignedTo: staffId,
          assignedToName: staff.name,
        } as SignupSubmission
      }
      return s
    }))
  }, [id])

  const handleSendMessage = useCallback(() => {
    if (!replyMessage.trim()) return
    // In a real app, this would send an email
    setReplyMessage('')
  }, [replyMessage])

  const handleVerify = useCallback(() => {
    handleStatusChange('verified')
  }, [handleStatusChange])

  const handleReject = useCallback(() => {
    handleStatusChange('rejected')
    setShowRejectDialog(false)
  }, [handleStatusChange])

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  if (!signup) {
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
              <h2 className="text-lg font-semibold mb-2">Signup Not Found</h2>
              <p className="text-muted-foreground text-sm mb-4">
                The signup you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push('/leads/signups')}>
                <MdArrowBack className="h-4 w-4 mr-2" />
                Back to Signups
              </Button>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  const status = statusConfig[signup.metadata.verificationStatus]
  const StatusIcon = status.icon
  const sourceColor = sourceColors[signup.metadata.hearAboutUs] || sourceColors['Other']

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
              onClick={() => router.push('/leads/signups')}
              className="gap-2"
            >
              <MdArrowBack className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">{signup.submissionNumber}</h1>
                <Badge className={cn("gap-1", status.color)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Registered {formatTimeAgo(signup.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {signup.metadata.verificationStatus === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectDialog(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                  <MdPersonOff className="h-4 w-4 mr-1.5" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={handleVerify}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <MdVerifiedUser className="h-4 w-4 mr-1.5" />
                  Verify
                </Button>
              </>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {signup.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{signup.customerName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MdEmail className="h-3.5 w-3.5" />
                          {signup.customerEmail}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className={cn("gap-1 text-xs", sourceColor)}>
                      <MdCampaign className="h-3 w-3" />
                      {signup.metadata.hearAboutUs}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Location</p>
                      <div className="flex items-center gap-2 text-sm">
                        <MdLocationOn className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {signup.metadata.city ? `${signup.metadata.city}, ` : ''}{signup.metadata.country}
                        </span>
                      </div>
                    </div>
                    {signup.metadata.company && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Company</p>
                        <div className="flex items-center gap-2 text-sm">
                          <MdBusiness className="h-4 w-4 text-muted-foreground" />
                          <span>{signup.metadata.company}</span>
                        </div>
                      </div>
                    )}
                    {signup.customerPhone && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Phone</p>
                        <div className="flex items-center gap-2 text-sm">
                          <MdPhone className="h-4 w-4 text-muted-foreground" />
                          <span>{signup.customerPhone}</span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Registered</p>
                      <div className="flex items-center gap-2 text-sm">
                        <MdAccessTime className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(signup.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Registration Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MdPublic className="h-4 w-4" />
                    Registration Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{signup.message}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">First Name</p>
                      <p>{signup.metadata.firstName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Last Name</p>
                      <p>{signup.metadata.lastName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Send Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MdChat className="h-4 w-4" />
                    Send Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Type your message to this customer..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!replyMessage.trim()}
                    >
                      <MdSend className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MdPerson className="h-4 w-4" />
                    Quick Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-2 text-sm">
                        <MdEmail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{signup.customerEmail}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(signup.customerEmail, 'email')}
                      >
                        {copiedField === 'email' ? (
                          <MdCheck className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <MdContentCopy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    {signup.customerPhone && (
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-sm">
                          <MdPhone className="h-4 w-4 text-muted-foreground" />
                          <span>{signup.customerPhone}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(signup.customerPhone!, 'phone')}
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
                    value={signup.assignedTo || 'unassigned'}
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
                  {signup.assignedToName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Currently assigned to {signup.assignedToName}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Verification Status */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(['pending', 'verified', 'rejected'] as SignupStatus[]).map((s) => {
                      const config = statusConfig[s]
                      const Icon = config.icon
                      return (
                        <Button
                          key={s}
                          variant={signup.metadata.verificationStatus === s ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleStatusChange(s)}
                          className={cn(
                            "flex-1 gap-1",
                            signup.metadata.verificationStatus === s && s === 'verified' && "bg-emerald-600 hover:bg-emerald-700",
                            signup.metadata.verificationStatus === s && s === 'rejected' && "bg-red-600 hover:bg-red-700",
                            signup.metadata.verificationStatus === s && s === 'pending' && "bg-amber-600 hover:bg-amber-700"
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Button>
                      )
                    })}
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
                        <p className="text-sm">Registration submitted</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(signup.createdAt)}
                        </p>
                      </div>
                    </div>
                    {signup.assignedToName && (
                      <div className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5" />
                        <div>
                          <p className="text-sm">Assigned to {signup.assignedToName}</p>
                          <p className="text-xs text-muted-foreground">Updated</p>
                        </div>
                      </div>
                    )}
                    {signup.metadata.verificationStatus === 'verified' && (
                      <div className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                        <div>
                          <p className="text-sm">Account verified</p>
                          <p className="text-xs text-muted-foreground">
                            {signup.respondedAt ? formatDate(signup.respondedAt) : 'Updated'}
                          </p>
                        </div>
                      </div>
                    )}
                    {signup.metadata.verificationStatus === 'rejected' && (
                      <div className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5" />
                        <div>
                          <p className="text-sm">Registration rejected</p>
                          <p className="text-xs text-muted-foreground">
                            {signup.respondedAt ? formatDate(signup.respondedAt) : 'Updated'}
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

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this registration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the registration as rejected. The customer will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Registration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
