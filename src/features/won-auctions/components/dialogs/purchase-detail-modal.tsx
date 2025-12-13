'use client'

import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Car,
  User,
  CreditCard,
  Ship,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Copy,
  ExternalLink,
  Download,
  Package,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { type WonAuction } from '../../data/won-auctions'

interface PurchaseDetailModalProps {
  auction: WonAuction | null
  open: boolean
  onClose: () => void
  onRecordPayment?: () => void
  onUploadDocuments?: () => void
  onUpdateShipping?: () => void
  onGenerateInvoice?: () => void
  loading?: boolean
}

// Status styles
const statusStyles: Record<WonAuction['status'], string> = {
  payment_pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  documents_pending: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  shipping: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  completed: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
}

const statusLabels: Record<WonAuction['status'], string> = {
  payment_pending: 'Payment Pending',
  processing: 'Processing',
  documents_pending: 'Documents Pending',
  shipping: 'In Transit',
  delivered: 'Delivered',
  completed: 'Completed',
}

const paymentStatusStyles: Record<WonAuction['paymentStatus'], string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  partial: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
}

// Progress steps configuration
const progressSteps = [
  { key: 'won', label: 'Won', icon: CheckCircle2 },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'shipping', label: 'Shipping', icon: Ship },
  { key: 'delivered', label: 'Delivered', icon: Package },
]

function getStepStatus(auction: WonAuction, stepKey: string): 'completed' | 'current' | 'upcoming' {
  const statusOrder = ['payment_pending', 'processing', 'documents_pending', 'shipping', 'delivered', 'completed']
  const currentIndex = statusOrder.indexOf(auction.status)

  const stepMapping: Record<string, number> = {
    won: -1, // Always completed if we have an auction
    payment: 1, // processing means payment done
    documents: 2, // documents_pending means we're here
    shipping: 3, // shipping means we're shipping
    delivered: 4, // delivered
  }

  const stepIndex = stepMapping[stepKey]
  if (stepIndex < currentIndex) return 'completed'
  if (stepIndex === currentIndex) return 'current'
  return 'upcoming'
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-20 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      </div>

      {/* Progress skeleton */}
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(value)
    toast.success(`${label} copied`)
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      aria-label={`Copy ${label}`}
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  )
}

function InfoRow({
  label,
  value,
  copyable,
  href,
  monospace
}: {
  label: string
  value: string | React.ReactNode
  copyable?: boolean
  href?: string
  monospace?: boolean
}) {
  const ValueContent = () => (
    <span className={cn("font-medium", monospace && "font-mono text-sm")}>
      {value}
    </span>
  )

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center">
        {href ? (
          <a
            href={href}
            className="font-medium text-primary hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <ValueContent />
        )}
        {copyable && typeof value === 'string' && (
          <CopyButton value={value} label={label} />
        )}
      </div>
    </div>
  )
}

function SteppedProgress({ auction }: { auction: WonAuction }) {
  return (
    <div className="relative">
      {/* Connection line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
      <div
        className="absolute top-5 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
        style={{
          width: `${(progressSteps.findIndex(s => getStepStatus(auction, s.key) === 'current') / (progressSteps.length - 1)) * 100}%`
        }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {progressSteps.map((step) => {
          const status = getStepStatus(auction, step.key)
          const Icon = step.icon

          return (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  status === 'completed' && "bg-emerald-500 border-emerald-500 text-white",
                  status === 'current' && "bg-background border-primary text-primary",
                  status === 'upcoming' && "bg-muted border-border text-muted-foreground"
                )}
              >
                {status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium",
                  status === 'completed' && "text-emerald-600",
                  status === 'current' && "text-foreground",
                  status === 'upcoming' && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PaymentBreakdown({ auction }: { auction: WonAuction }) {
  const total = auction.totalAmount
  const bidPercent = (auction.winningBid / total) * 100
  const shippingPercent = (auction.shippingCost / total) * 100
  const customsPercent = (auction.customsFee / total) * 100
  const paymentProgress = (auction.paidAmount / total) * 100
  const outstanding = total - auction.paidAmount

  return (
    <div className="space-y-4">
      {/* Visual breakdown bar */}
      <div className="space-y-2">
        <div className="flex h-3 overflow-hidden rounded-full">
          <div
            className="bg-blue-500"
            style={{ width: `${bidPercent}%` }}
            title={`Bid: ¥${auction.winningBid.toLocaleString()}`}
          />
          <div
            className="bg-purple-500"
            style={{ width: `${shippingPercent}%` }}
            title={`Shipping: ¥${auction.shippingCost.toLocaleString()}`}
          />
          <div
            className="bg-orange-500"
            style={{ width: `${customsPercent}%` }}
            title={`Customs: ¥${auction.customsFee.toLocaleString()}`}
          />
        </div>
        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Bid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Shipping</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">Customs</span>
          </div>
        </div>
      </div>

      {/* Amount details */}
      <div className="space-y-1 divide-y divide-border/50">
        <InfoRow label="Winning Bid" value={`¥${auction.winningBid.toLocaleString()}`} />
        <InfoRow label="Shipping Cost" value={`¥${auction.shippingCost.toLocaleString()}`} />
        <InfoRow label="Customs Fee" value={`¥${auction.customsFee.toLocaleString()}`} />
      </div>

      <div className="border-t border-border/50 pt-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Total Amount</span>
          <span className="text-xl font-bold">¥{total.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Paid Amount</span>
          <span className={cn(
            "font-semibold flex items-center gap-1.5",
            auction.paymentStatus === 'completed' ? "text-emerald-600" : "text-foreground"
          )}>
            {auction.paymentStatus === 'completed' && <CheckCircle2 className="h-4 w-4" />}
            ¥{auction.paidAmount.toLocaleString()}
          </span>
        </div>

        {outstanding > 0 && (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment Progress</span>
                <span className="font-medium">{Math.round(paymentProgress)}%</span>
              </div>
              <Progress value={paymentProgress} className="h-2" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Outstanding</span>
              <span className="font-semibold text-orange-600">¥{outstanding.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ShippingEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
        <Ship className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h4 className="font-medium text-muted-foreground mb-1">No Shipping Info Yet</h4>
      <p className="text-sm text-muted-foreground/70 max-w-[250px]">
        Shipping details will appear once documents are processed and the vehicle is ready for transport.
      </p>
    </div>
  )
}

export function PurchaseDetailModal({
  auction,
  open,
  onClose,
  onRecordPayment,
  onUploadDocuments,
  onUpdateShipping,
  onGenerateInvoice,
  loading = false,
}: PurchaseDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

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

  // Focus management
  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [open])

  // Lock body scroll
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
            aria-labelledby="purchase-detail-title"
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2',
              'max-h-[90vh] overflow-hidden rounded-2xl border border-border/50',
              'bg-background shadow-2xl',
              'focus:outline-none'
            )}
          >
            {/* Close button */}
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

            {/* Content */}
            <div className="max-h-[90vh] overflow-y-auto">
              {loading ? (
                <LoadingSkeleton />
              ) : auction ? (
                <>
                  {/* Header */}
                  <div className="border-b border-border/50 p-6">
                    <div className="flex items-start gap-4 pr-8">
                      {/* Vehicle Thumbnail */}
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {auction.vehicleInfo.images[0] && auction.vehicleInfo.images[0] !== '#' ? (
                          <img
                            src={auction.vehicleInfo.images[0]}
                            alt={`${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Car className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 id="purchase-detail-title" className="text-xl font-semibold tracking-tight">
                          {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Auction #{auction.auctionId}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className={cn('text-xs', statusStyles[auction.status])}>
                            {statusLabels[auction.status]}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', paymentStatusStyles[auction.paymentStatus])}>
                            Payment: {auction.paymentStatus.charAt(0).toUpperCase() + auction.paymentStatus.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Steps */}
                  <div className="border-b border-border/50 px-6 py-5 bg-muted/20">
                    <SteppedProgress auction={auction} />
                  </div>

                  {/* Tabs Content */}
                  <Tabs defaultValue="overview" className="p-6">
                    <TabsList className="mb-6 bg-muted/50">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-background">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="data-[state=active]:bg-background">
                        Documents
                      </TabsTrigger>
                      <TabsTrigger value="history" className="data-[state=active]:bg-background">
                        History
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-0 space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Vehicle Info */}
                        <div className="rounded-xl bg-muted/30 p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Vehicle Information</h3>
                          </div>
                          <div className="space-y-1 divide-y divide-border/50">
                            <InfoRow label="Make/Model" value={`${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`} />
                            <InfoRow label="Year" value={auction.vehicleInfo.year.toString()} />
                            <InfoRow
                              label="VIN"
                              value={auction.vehicleInfo.vin}
                              copyable
                              monospace
                            />
                            <InfoRow label="Mileage" value={`${auction.vehicleInfo.mileage.toLocaleString()} km`} />
                            <InfoRow label="Color" value={auction.vehicleInfo.color} />
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="rounded-xl bg-muted/30 p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Customer Information</h3>
                          </div>
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                {getInitials(auction.winnerName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{auction.winnerName}</p>
                              <p className="text-xs text-muted-foreground">Winner</p>
                            </div>
                          </div>
                          <div className="space-y-1 divide-y divide-border/50">
                            <InfoRow
                              label="Email"
                              value={auction.winnerEmail}
                              copyable
                              href={`mailto:${auction.winnerEmail}`}
                            />
                            <InfoRow
                              label="Phone"
                              value={auction.winnerPhone}
                              copyable
                              href={`tel:${auction.winnerPhone}`}
                            />
                            <InfoRow
                              label="Destination"
                              value={
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {auction.destinationPort}
                                </span>
                              }
                            />
                          </div>
                          {auction.winnerAddress && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className="text-xs text-muted-foreground mb-1">Address</p>
                              <p className="text-sm leading-relaxed">{auction.winnerAddress}</p>
                            </div>
                          )}
                        </div>

                        {/* Payment Info */}
                        <div className="rounded-xl bg-muted/30 p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Payment Breakdown</h3>
                          </div>
                          <PaymentBreakdown auction={auction} />
                        </div>

                        {/* Shipping Info */}
                        <div className="rounded-xl bg-muted/30 p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Ship className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Shipping Information</h3>
                          </div>
                          {auction.shipment ? (
                            <div className="space-y-1 divide-y divide-border/50">
                              <InfoRow label="Carrier" value={auction.shipment.carrier} />
                              <InfoRow
                                label="Tracking #"
                                value={auction.shipment.trackingNumber}
                                copyable
                                monospace
                              />
                              <InfoRow
                                label="Status"
                                value={
                                  <Badge variant="outline" className="text-xs">
                                    {auction.shipment.status.replace(/_/g, ' ')}
                                  </Badge>
                                }
                              />
                              <InfoRow label="Location" value={auction.shipment.currentLocation} />
                              {auction.shipment.estimatedDelivery && (
                                <InfoRow
                                  label="Est. Delivery"
                                  value={format(new Date(auction.shipment.estimatedDelivery), 'MMM dd, yyyy')}
                                />
                              )}
                            </div>
                          ) : (
                            <ShippingEmptyState />
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {auction.notes && (
                        <div className="rounded-xl bg-muted/30 p-4">
                          <h3 className="text-sm font-medium mb-2">Notes</h3>
                          <p className="text-sm text-muted-foreground">{auction.notes}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="documents" className="mt-0">
                      <div className="rounded-xl bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-medium">Documents</h3>
                        </div>

                        {auction.documents.length > 0 ? (
                          <div className="space-y-2">
                            {auction.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between rounded-lg bg-background p-3 border border-border/50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{doc.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {doc.type.replace(/_/g, ' ')} • {(doc.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
                              <FileText className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-0">
                      <div className="rounded-xl bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-medium">Timeline</h3>
                        </div>

                        <div className="space-y-4">
                          {auction.timeline.completed && (
                            <div className="flex gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Completed</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(auction.timeline.completed), 'MMM dd, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          )}
                          {auction.timeline.delivered && (
                            <div className="flex gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                                <Package className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Delivered</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(auction.timeline.delivered), 'MMM dd, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          )}
                          {auction.timeline.shippingStarted && (
                            <div className="flex gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                                <Ship className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Shipping Started</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(auction.timeline.shippingStarted), 'MMM dd, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          )}
                          {auction.timeline.documentsUploaded && (
                            <div className="flex gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Documents Uploaded</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(auction.timeline.documentsUploaded), 'MMM dd, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          )}
                          {auction.timeline.paymentReceived && (
                            <div className="flex gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                                <CreditCard className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Payment Received</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(auction.timeline.paymentReceived), 'MMM dd, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                              <Trophy className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Auction Won</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(auction.auctionEndDate), 'MMM dd, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between border-t border-border/50 px-6 py-4 bg-muted/20">
                    <div className="flex items-center gap-2 flex-wrap">
                      {onGenerateInvoice && (
                        <Button size="sm" variant="outline" onClick={onGenerateInvoice}>
                          <FileText className="mr-2 h-4 w-4" />
                          Invoice
                        </Button>
                      )}
                      {onRecordPayment && auction.paymentStatus !== 'completed' && (
                        <Button size="sm" onClick={onRecordPayment}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Record Payment
                        </Button>
                      )}
                      {onUploadDocuments && (
                        <Button size="sm" variant="outline" onClick={onUploadDocuments}>
                          <FileText className="mr-2 h-4 w-4" />
                          Upload Docs
                        </Button>
                      )}
                      {onUpdateShipping && auction.paymentStatus === 'completed' && !auction.shipment && (
                        <Button size="sm" variant="outline" onClick={onUpdateShipping}>
                          <Ship className="mr-2 h-4 w-4" />
                          Add Shipping
                        </Button>
                      )}
                    </div>
                    <Button variant="ghost" onClick={onClose}>
                      Close
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
