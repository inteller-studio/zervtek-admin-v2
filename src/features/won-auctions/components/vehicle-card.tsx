'use client'

import { useState, useEffect, useRef } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import {
  MoreHorizontal,
  Ship,
  FileText,
  CreditCard,
  Truck,
  CheckCircle2,
  Copy,
  Clock,
  Package,
  MapPin,
  Check,
  User,
  Calendar,
  Banknote,
  FileCheck,
  Anchor,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type WonAuction } from '../data/won-auctions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface VehicleCardProps {
  auction: WonAuction
  loading?: boolean
  selected?: boolean
  onViewDetails: () => void
  onManageWorkflow?: () => void
  onRecordPayment: () => void
  onUploadDocuments: () => void
  onManageDocuments: () => void
  onUpdateShipping: () => void
  onGenerateInvoice: () => void
  onMarkDelivered: () => void
  onMarkCompleted: () => void
}

// Status configuration with Catalyst variants
const getStatusConfig = (status: WonAuction['status']) => {
  const config: Record<
    WonAuction['status'],
    {
      label: string
      variant: 'amber' | 'blue' | 'zinc' | 'emerald'
    }
  > = {
    payment_pending: {
      label: 'Payment Pending',
      variant: 'amber',
    },
    processing: {
      label: 'Processing',
      variant: 'blue',
    },
    documents_pending: {
      label: 'Documents Pending',
      variant: 'zinc',
    },
    shipping: {
      label: 'In Transit',
      variant: 'blue',
    },
    delivered: {
      label: 'Delivered',
      variant: 'emerald',
    },
    completed: {
      label: 'Completed',
      variant: 'zinc',
    },
  }
  return config[status]
}

export function VehicleCard({
  auction,
  loading = false,
  selected = false,
  onViewDetails,
  onManageWorkflow,
  onRecordPayment,
  onUploadDocuments,
  onManageDocuments,
  onUpdateShipping,
  onGenerateInvoice,
  onMarkDelivered,
  onMarkCompleted,
}: VehicleCardProps) {
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const imageIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const images = auction.vehicleInfo.images.filter(img => img !== '#' && img)
  const defaultImageIndex = images.length > 1 ? 1 : 0 // Use 2nd image as default
  const [currentImageIndex, setCurrentImageIndex] = useState(defaultImageIndex)

  // Cycle through images on hover
  useEffect(() => {
    if (isHovered && images.length > 1) {
      imageIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
      }, 1000)
    } else {
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current)
        imageIntervalRef.current = null
      }
      setCurrentImageIndex(defaultImageIndex)
    }

    return () => {
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current)
      }
    }
  }, [isHovered, images.length, defaultImageIndex])

  // Loading skeleton
  if (loading) {
    return (
      <Card className='border-border/50 py-0 gap-0'>
        <CardContent className='px-4 py-2'>
          <div className='flex gap-4'>
            {/* Image skeleton */}
            <div className='w-[200px] h-[140px] rounded-lg animate-pulse bg-muted/50 shrink-0' />
            {/* Content skeleton */}
            <div className='flex-1 space-y-4'>
              <div className='flex justify-between'>
                <div className='space-y-2'>
                  <div className='h-5 w-48 animate-pulse rounded bg-muted/50' />
                  <div className='h-4 w-64 animate-pulse rounded bg-muted/50' />
                </div>
                <div className='h-6 w-28 animate-pulse rounded-md bg-muted/50' />
              </div>
              <div className='grid grid-cols-6 gap-6'>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className='space-y-1.5'>
                    <div className='h-3 w-14 animate-pulse rounded bg-muted/50' />
                    <div className='h-4 w-20 animate-pulse rounded bg-muted/50' />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const outstandingBalance = auction.totalAmount - auction.paidAmount
  const statusConfig = getStatusConfig(auction.status)
  const paymentProgress = Math.round((auction.paidAmount / auction.totalAmount) * 100)
  const vehicleTitle = `${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`
  const documentsCount = auction.documents.length
  const paymentsCount = auction.payments.length

  const copyVin = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(auction.vehicleInfo.vin)
    setCopied(true)
    toast.success('VIN copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className='group'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        tabIndex={0}
        role='button'
        aria-label={`View details for ${vehicleTitle}`}
        className={cn(
          'cursor-pointer overflow-hidden transition-all duration-150 py-0 gap-0',
          'border-border/50 bg-card',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          selected
            ? 'border-l-2 border-l-primary bg-primary/5'
            : 'hover:bg-accent/5'
        )}
        onClick={onViewDetails}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onViewDetails()
          }
        }}
      >
        <CardContent className='px-4 py-2'>
          <div className='flex gap-4'>
            {/* Vehicle Image - Larger with hover slideshow */}
            <div
              className={cn(
                'relative w-[200px] h-[140px] rounded-lg overflow-hidden bg-muted/30 shrink-0',
                'transition-transform duration-150',
                isHovered && 'scale-[1.02]'
              )}
            >
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={`${vehicleTitle} - Image ${currentImageIndex + 1}`}
                    className='h-full w-full object-cover transition-opacity duration-300'
                  />
                  {/* Image indicators */}
                  {images.length > 1 && (
                    <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1'>
                      {images.map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full transition-all duration-200',
                            idx === currentImageIndex
                              ? 'bg-white w-3'
                              : 'bg-white/50'
                          )}
                        />
                      ))}
                    </div>
                  )}
                  {/* Image count badge */}
                  {images.length > 1 && (
                    <div className='absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded'>
                      {currentImageIndex + 1}/{images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <span className='text-xs text-muted-foreground/50'>No Image</span>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className='flex-1 min-w-0'>
              {/* Header Row */}
              <div className='flex items-start justify-between gap-4 mb-2'>
                {/* Left: Title, VIN, Customer */}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-3'>
                    <h2 className='text-base font-medium text-foreground truncate'>
                      {vehicleTitle}
                    </h2>
                    <span className='text-xs text-muted-foreground shrink-0'>
                      #{auction.auctionId}
                    </span>
                  </div>

                  {/* VIN + Customer Row */}
                  <div className='flex items-center gap-4 mt-1.5'>
                    <button
                      onClick={copyVin}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground',
                        'hover:text-foreground transition-colors rounded-sm',
                        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                      )}
                      aria-label={`Copy VIN ${auction.vehicleInfo.vin}`}
                    >
                      <span>{auction.vehicleInfo.vin}</span>
                      {copied ? (
                        <Check className='h-3 w-3 text-emerald-500' />
                      ) : (
                        <Copy className={cn(
                          'h-3 w-3 transition-opacity',
                          isHovered ? 'opacity-60' : 'opacity-0'
                        )} />
                      )}
                    </button>

                    <span className='text-border'>|</span>

                    <span className='inline-flex items-center gap-1.5 text-sm text-muted-foreground'>
                      <User className='h-3 w-3 shrink-0' />
                      <span className='truncate'>{auction.winnerName}</span>
                    </span>

                    <span className='text-border'>|</span>

                    <span className='inline-flex items-center gap-1.5 text-sm text-muted-foreground'>
                      <Calendar className='h-3 w-3 shrink-0' />
                      <span>{format(new Date(auction.auctionEndDate), 'MMM d, yyyy')}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Status Badge + Actions */}
                <div className='flex items-center gap-2 shrink-0'>
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </Badge>

                  {/* Actions Menu */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant='ghost'
                              size='icon'
                              className={cn(
                                'h-8 w-8 text-muted-foreground hover:text-foreground',
                                'transition-opacity duration-150',
                                isHovered ? 'opacity-100' : 'opacity-0',
                                'focus-visible:opacity-100'
                              )}
                              aria-label='More actions'
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-48' onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails() }}>
                              <FileText className='mr-2 h-4 w-4' />
                              View Details
                            </DropdownMenuItem>
                            {onManageWorkflow && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onManageWorkflow() }}>
                                <ClipboardList className='mr-2 h-4 w-4' />
                                Manage Workflow
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onGenerateInvoice() }}>
                              <FileText className='mr-2 h-4 w-4' />
                              Download Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRecordPayment() }}>
                              <CreditCard className='mr-2 h-4 w-4' />
                              Record Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onManageDocuments() }}>
                              <FileText className='mr-2 h-4 w-4' />
                              Manage Documents
                            </DropdownMenuItem>
                            {auction.paymentStatus === 'completed' && auction.status !== 'shipping' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateShipping() }}>
                                  <Ship className='mr-2 h-4 w-4' />
                                  Update Shipping
                                </DropdownMenuItem>
                              </>
                            )}
                            {auction.status === 'shipping' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarkDelivered() }}>
                                  <Truck className='mr-2 h-4 w-4' />
                                  Mark Delivered
                                </DropdownMenuItem>
                              </>
                            )}
                            {auction.status === 'delivered' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarkCompleted() }}>
                                  <CheckCircle2 className='mr-2 h-4 w-4' />
                                  Mark Completed
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side='left'>
                      <p>More actions</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Data Grid - 2 rows with consistent columns */}
              <div className='grid grid-cols-7 gap-x-6 gap-y-2' style={{ gridTemplateColumns: 'repeat(7, minmax(85px, 1fr))' }}>
                {/* Row 1 */}
                {/* Mileage */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Mileage
                  </p>
                  <p className='text-sm font-medium tabular-nums'>
                    {auction.vehicleInfo.mileage.toLocaleString()} km
                  </p>
                </div>

                {/* Color */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Color
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className='text-sm font-medium truncate cursor-default'>
                        {auction.vehicleInfo.color}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{auction.vehicleInfo.color}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Winning Bid */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Winning Bid
                  </p>
                  <p className='text-sm font-medium tabular-nums'>
                    ¥{auction.winningBid.toLocaleString()}
                  </p>
                </div>

                {/* Shipping */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Shipping
                  </p>
                  <p className='text-sm font-medium tabular-nums'>
                    ¥{auction.shippingCost.toLocaleString()}
                  </p>
                </div>

                {/* Total Amount */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Total
                  </p>
                  <p className='text-sm font-semibold tabular-nums'>
                    ¥{auction.totalAmount.toLocaleString()}
                  </p>
                </div>

                {/* Payment Progress */}
                <div className='space-y-1 min-w-[90px]'>
                  <div className='flex items-center justify-between'>
                    <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                      Paid
                    </p>
                    <div className='flex items-center gap-1'>
                      {paymentProgress === 100 && (
                        <CheckCircle2 className='h-3 w-3 text-emerald-500' />
                      )}
                      <span className='text-xs font-medium tabular-nums'>{paymentProgress}%</span>
                    </div>
                  </div>
                  <div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-foreground/60 rounded-full transition-all duration-300'
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                </div>

                {/* Outstanding / Paid Status */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Balance
                  </p>
                  {outstandingBalance > 0 ? (
                    <p className='text-sm font-medium tabular-nums'>
                      ¥{outstandingBalance.toLocaleString()}
                    </p>
                  ) : (
                    <p className='text-sm font-medium text-emerald-600 dark:text-emerald-500 flex items-center gap-1'>
                      <CheckCircle2 className='h-3.5 w-3.5' />
                      Cleared
                    </p>
                  )}
                </div>

                {/* Row 2 */}
                {/* Destination */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Destination
                  </p>
                  {auction.destinationPort ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className='text-sm font-medium truncate flex items-center gap-1.5 cursor-default'>
                          <MapPin className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                          <span className='truncate'>{auction.destinationPort.split(',')[0]}</span>
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{auction.destinationPort}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <p className='text-sm text-muted-foreground'>—</p>
                  )}
                </div>

                {/* Documents */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Documents
                  </p>
                  <p className='text-sm font-medium flex items-center gap-1.5'>
                    <FileCheck className='h-3.5 w-3.5 text-muted-foreground' />
                    {documentsCount}
                  </p>
                </div>

                {/* Payments */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Payments
                  </p>
                  <p className='text-sm font-medium flex items-center gap-1.5'>
                    <Banknote className='h-3.5 w-3.5 text-muted-foreground' />
                    {paymentsCount}
                  </p>
                </div>

                {/* Carrier / Shipping Info */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Carrier
                  </p>
                  {auction.shipment ? (
                    <p className='text-sm font-medium truncate flex items-center gap-1.5'>
                      <Anchor className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                      <span className='truncate'>{auction.shipment.carrier}</span>
                    </p>
                  ) : (
                    <p className='text-sm text-muted-foreground'>—</p>
                  )}
                </div>

                {/* ETA */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    ETA
                  </p>
                  {auction.shipment?.estimatedDelivery ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className='text-sm font-medium cursor-default'>
                          {format(new Date(auction.shipment.estimatedDelivery), 'MMM d')}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{format(new Date(auction.shipment.estimatedDelivery), 'MMMM d, yyyy')}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <p className='text-sm text-muted-foreground'>—</p>
                  )}
                </div>

                {/* Tracking */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Tracking
                  </p>
                  {auction.shipment?.trackingNumber ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className='text-sm font-mono font-medium truncate cursor-default'>
                          {auction.shipment.trackingNumber.slice(0, 8)}...
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{auction.shipment.trackingNumber}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <p className='text-sm text-muted-foreground'>—</p>
                  )}
                </div>

                {/* Time Since Won */}
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Age
                  </p>
                  <p className='text-sm font-medium'>
                    {formatDistanceToNow(new Date(auction.auctionEndDate), { addSuffix: false })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
