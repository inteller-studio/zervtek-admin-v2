'use client'

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  ShoppingBag,
  Gavel,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  FileQuestion,
  Pencil,
  UserPlus,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
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
import { cn } from '@/lib/utils'
import { type Customer, type UserLevel } from '../data/customers'
import { VerificationApprovalModal } from './verification-approval-modal'

interface CustomerProfileModalProps {
  customer: Customer | null
  open: boolean
  onClose: () => void
  onSendEmail: (customer: Customer) => void
  onCallCustomer: (customer: Customer) => void
  onVerifyCustomer: (customer: Customer) => void
  onChangeUserLevel: (customer: Customer, level: UserLevel) => void
  onClaimCustomer?: (customer: Customer) => void
  loading?: boolean
}

// Unified badge styles
const statusStyles = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  inactive: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  suspended: 'bg-red-500/10 text-red-600 border-red-500/20',
}

const verificationStyles = {
  verified: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  unverified: 'bg-red-500/10 text-red-600 border-red-500/20',
  documents_requested: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
}

const levelStyles = {
  unverified: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  verified: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  premium: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  business: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  business_premium: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
}

const verificationIcons = {
  verified: CheckCircle,
  pending: Clock,
  unverified: XCircle,
  documents_requested: FileQuestion,
}

const levelLabels: Record<UserLevel, string> = {
  unverified: 'Unverified',
  verified: 'Verified',
  premium: 'Premium',
  business: 'Business',
  business_premium: 'Business Premium',
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-full max-w-xs" />

      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-border/50 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-3 rounded-xl border border-border/50 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-3 grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 p-4">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-border">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  )
}

function InfoRow({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="truncate">{children}</span>
    </div>
  )
}

export function CustomerProfileModal({
  customer,
  open,
  onClose,
  onSendEmail,
  onCallCustomer,
  onVerifyCustomer,
  onChangeUserLevel,
  onClaimCustomer,
  loading = false,
}: CustomerProfileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [levelDialogOpen, setLevelDialogOpen] = useState(false)
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Focus trap and initial focus
  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [open])

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

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getDaysSinceActive = (date: Date) => {
    const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  const VerificationIcon = customer ? verificationIcons[customer.verificationStatus] : Clock

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
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-profile-title"
            aria-describedby="customer-profile-description"
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2',
              'max-h-[90vh] overflow-hidden rounded-2xl border border-border/50',
              'bg-background shadow-2xl',
              'focus:outline-none'
            )}
          >
            {/* Close button - larger and more visible */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className={cn(
                'absolute right-4 top-4 z-10',
                'flex h-8 w-8 items-center justify-center rounded-lg',
                'text-muted-foreground transition-colors',
                'hover:bg-muted hover:text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              )}
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content with scroll */}
            <div className="max-h-[90vh] overflow-y-auto p-6">
              {loading ? (
                <LoadingSkeleton />
              ) : customer ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 pr-8">
                    <Avatar className="h-16 w-16 border-2 border-border/50">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {getInitials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 id="customer-profile-title" className="text-xl font-semibold tracking-tight">
                          {customer.name}
                        </h2>
                        {/* User Level Badge with Edit Button */}
                        {customer.userLevel === 'unverified' ? (
                          <button
                            onClick={() => setLevelDialogOpen(true)}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
                              'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                              'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                            )}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Verify Now
                          </button>
                        ) : (
                          <button
                            onClick={() => setLevelDialogOpen(true)}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
                              'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                              levelStyles[customer.userLevel]
                            )}
                          >
                            <Award className="h-3 w-3" />
                            {levelLabels[customer.userLevel]}
                            <Pencil className="h-3 w-3 ml-0.5" />
                          </button>
                        )}
                      </div>
                      <p id="customer-profile-description" className="text-sm text-muted-foreground mb-2">
                        {customer.email}
                      </p>
                      {/* Status badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn('text-xs', statusStyles[customer.status])}>
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={cn('text-xs', verificationStyles[customer.verificationStatus])}>
                          <VerificationIcon className="mr-1 h-3 w-3" />
                          {customer.verificationStatus.charAt(0).toUpperCase() + customer.verificationStatus.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Tabs with better active state */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full justify-start bg-muted/50 p-1">
                      <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger
                        value="financial"
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Financial
                      </TabsTrigger>
                      <TabsTrigger
                        value="inquiries"
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Inquiries
                      </TabsTrigger>
                      <TabsTrigger
                        value="activity"
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Activity
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 space-y-6">
                      {/* Info cards */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Contact Information */}
                        <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
                          <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                          <div className="space-y-2.5">
                            <InfoRow icon={Mail}>{customer.email}</InfoRow>
                            <InfoRow icon={Phone}>{customer.phone}</InfoRow>
                            <InfoRow icon={MapPin}>{customer.city}, {customer.country}</InfoRow>
                            {customer.company && (
                              <InfoRow icon={Building2}>{customer.company}</InfoRow>
                            )}
                            <InfoRow icon={Globe}>{customer.preferredLanguage}</InfoRow>
                          </div>
                        </div>

                        {/* Account Details */}
                        <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
                          <h3 className="text-sm font-medium text-muted-foreground">Account Details</h3>
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Assigned To</span>
                              {customer.assignedToName ? (
                                <span className="font-medium flex items-center gap-1.5">
                                  <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                  {customer.assignedToName}
                                </span>
                              ) : onClaimCustomer ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:hover:bg-emerald-950"
                                  onClick={() => setClaimDialogOpen(true)}
                                >
                                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                                  Claim
                                </Button>
                              ) : (
                                <span className="text-muted-foreground italic">Unassigned</span>
                              )}
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Registered</span>
                              <span className="font-medium">{format(customer.createdAt, 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Last Active</span>
                              <span className="font-medium">{getDaysSinceActive(customer.lastActivity)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Last Purchase</span>
                              <span className="font-medium">
                                {customer.lastPurchase ? format(customer.lastPurchase, 'MMM dd, yyyy') : 'Never'}
                              </span>
                            </div>
                            {customer.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-2">
                                {customer.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats cards - improved hierarchy */}
                      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                        <StatCard icon={ShoppingBag} label="Purchases" value={customer.wonAuctions} />
                        <StatCard icon={Gavel} label="Total Bids" value={customer.totalBids} />
                        <StatCard icon={CheckCircle} label="Won" value={customer.wonAuctions} />
                        <StatCard icon={XCircle} label="Lost" value={customer.lostAuctions} />
                      </div>
                    </TabsContent>

                    <TabsContent value="financial" className="mt-6 space-y-6">
                      {/* Financial stats */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                          <p className="text-xs font-medium text-muted-foreground">Total Spent</p>
                          <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                            ¥{customer.totalSpent.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                          <p className="text-xs font-medium text-muted-foreground">Deposit Balance</p>
                          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-emerald-600">
                            ¥{customer.depositAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                          <p className="text-xs font-medium text-muted-foreground">Outstanding</p>
                          <p className={cn(
                            'mt-1.5 text-2xl font-semibold tracking-tight',
                            customer.outstandingBalance > 0 && 'text-orange-600'
                          )}>
                            ¥{customer.outstandingBalance.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Notes */}
                      {customer.notes && (
                        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                          <p className="text-sm">{customer.notes}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="inquiries" className="mt-6 space-y-4">
                      {/* Mock inquiries - in production this would come from API */}
                      {[
                        { id: '1', vehicle: '2023 Toyota Supra GR', type: 'Price Inquiry', date: '2 days ago', status: 'pending' },
                        { id: '2', vehicle: '2022 Nissan GT-R Nismo', type: 'Availability', date: '5 days ago', status: 'responded' },
                        { id: '3', vehicle: '2021 Honda NSX', type: 'Shipping Quote', date: '1 week ago', status: 'closed' },
                      ].map((inquiry) => (
                        <div
                          key={inquiry.id}
                          className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{inquiry.vehicle}</p>
                            <p className="text-xs text-muted-foreground">{inquiry.type}</p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                inquiry.status === 'pending' && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                                inquiry.status === 'responded' && 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                                inquiry.status === 'closed' && 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                              )}
                            >
                              {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                            </Badge>
                            <p className="mt-1 text-xs text-muted-foreground">{inquiry.date}</p>
                          </div>
                        </div>
                      ))}
                      {/* Empty state if no inquiries */}
                      {false && (
                        <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
                          <p className="text-sm text-muted-foreground">No inquiries yet</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="activity" className="mt-6">
                      <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
                        <p className="text-sm text-muted-foreground">Activity history coming soon...</p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action buttons - improved spacing */}
                  <div className="flex flex-col gap-3 border-t border-border/50 pt-6 sm:flex-row sm:flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => onSendEmail(customer)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => onCallCustomer(customer)}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                    {customer.verificationStatus !== 'verified' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => onVerifyCustomer(customer)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}

      {/* Change User Level Modal */}
      {customer && (
        <VerificationApprovalModal
          customer={customer}
          open={levelDialogOpen}
          onOpenChange={setLevelDialogOpen}
          onApprove={(customer, data) => {
            onChangeUserLevel(customer, data.userLevel)
            setLevelDialogOpen(false)
          }}
        />
      )}

      {/* Claim Customer Confirmation Dialog */}
      <AlertDialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Claim Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to claim <span className="font-medium text-foreground">{customer?.name}</span>?
              This customer will be assigned to you and appear in your customer list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                if (customer && onClaimCustomer) {
                  onClaimCustomer(customer)
                }
                setClaimDialogOpen(false)
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Claim Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  )
}
