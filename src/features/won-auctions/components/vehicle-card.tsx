'use client'

import { useState, useEffect, useRef } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { MdGavel, MdInventory } from 'react-icons/md'
import { motion } from 'framer-motion'
import {
  MdMoreVert,
  MdDirectionsBoat,
  MdDescription,
  MdCreditCard,
  MdLocalShipping,
  MdCheckCircle,
  MdContentCopy,
  MdCheck,
  MdAssignment,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Purchase } from '../data/won-auctions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface VehicleCardProps {
  auction: Purchase
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

// Material Design 3 status configuration - dot indicator style
const getStatusConfig = (status: Purchase['status']) => {
  const config: Record<
    Purchase['status'],
    {
      label: string
      dotColor: string
      textColor: string
    }
  > = {
    payment_pending: {
      label: 'Payment',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-400',
    },
    processing: {
      label: 'Processing',
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-400',
    },
    documents_pending: {
      label: 'Documents',
      dotColor: 'bg-purple-500',
      textColor: 'text-purple-700 dark:text-purple-400',
    },
    shipping: {
      label: 'In Transit',
      dotColor: 'bg-cyan-500',
      textColor: 'text-cyan-700 dark:text-cyan-400',
    },
    delivered: {
      label: 'Delivered',
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
    },
    completed: {
      label: 'Completed',
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
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
  const defaultImageIndex = images.length > 1 ? 1 : 0
  const [currentImageIndex, setCurrentImageIndex] = useState(defaultImageIndex)

  // Cycle through images on hover
  useEffect(() => {
    if (isHovered && images.length > 1) {
      imageIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
      }, 1500)
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
      <div className='rounded-2xl border border-border/50 bg-card p-2'>
        <div className='flex gap-3'>
          <div className='w-[220px] h-[140px] rounded-xl animate-pulse bg-muted/50 shrink-0' />
          <div className='flex-1 py-1 space-y-3'>
            <div className='flex justify-between'>
              <div className='space-y-2'>
                <div className='h-5 w-48 animate-pulse rounded bg-muted/50' />
                <div className='h-4 w-32 animate-pulse rounded bg-muted/50' />
              </div>
              <div className='h-6 w-20 animate-pulse rounded-full bg-muted/50' />
            </div>
            <div className='h-4 w-64 animate-pulse rounded bg-muted/50' />
            <div className='flex gap-4'>
              <div className='h-5 w-28 animate-pulse rounded bg-muted/50' />
              <div className='h-5 w-24 animate-pulse rounded bg-muted/50' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const outstandingBalance = auction.totalAmount - auction.paidAmount
  const statusConfig = getStatusConfig(auction.status)
  const paymentProgress = Math.round((auction.paidAmount / auction.totalAmount) * 100)
  const vehicleTitle = `${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`

  const copyVin = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(auction.vehicleInfo.vin)
    setCopied(true)
    toast.success('VIN copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  // Format specs line with dot separators
  const specsLine = [
    auction.vehicleInfo.color,
    `${auction.vehicleInfo.mileage.toLocaleString()} km`,
    auction.destinationPort?.split(',')[0],
  ].filter(Boolean).join(' • ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className='group'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        tabIndex={0}
        role='button'
        aria-label={`View details for ${vehicleTitle}`}
        className={cn(
          'relative rounded-2xl border bg-card overflow-hidden transition-all duration-200 cursor-pointer',
          'hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          selected
            ? 'border-primary shadow-lg shadow-primary/10'
            : 'border-border/50 hover:border-border'
        )}
        onClick={onViewDetails}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onViewDetails()
          }
        }}
      >
        {/* Main Container - Consistent p-2 padding */}
        <div className='flex p-2 gap-3'>
          {/* Image Section - 220x140px */}
          <div className='relative w-[220px] shrink-0'>
            <div
              className={cn(
                'relative h-[140px] rounded-xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted',
                'transition-transform duration-300',
                isHovered && 'scale-[1.02]'
              )}
            >
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={vehicleTitle}
                    className='h-full w-full object-cover'
                  />
                  {/* Subtle gradient overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />

                  {/* Image count badge */}
                  {images.length > 1 && (
                    <div className='absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-md'>
                      {currentImageIndex + 1}/{images.length}
                    </div>
                  )}

                  {/* Image dots indicator */}
                  {images.length > 1 && (
                    <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1'>
                      {images.slice(0, 5).map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'h-1 rounded-full transition-all duration-300',
                            idx === currentImageIndex
                              ? 'w-4 bg-white'
                              : 'w-1 bg-white/50'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <span className='text-xs text-muted-foreground/50'>No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className='flex-1 min-w-0 flex flex-col justify-between py-1'>
            {/* Section 1: Header */}
            <div>
              {/* Title + Status + Actions */}
              <div className='flex items-start justify-between gap-2'>
                <h2 className='text-[15px] font-semibold text-foreground truncate leading-tight'>
                  {vehicleTitle}
                </h2>

                <div className='flex items-center gap-2 shrink-0'>
                  {/* Material Design 3 Status - Dot + Label */}
                  <div className='inline-flex items-center gap-1.5'>
                    <span className={cn(
                      'h-2 w-2 rounded-full animate-pulse',
                      statusConfig.dotColor
                    )} />
                    <span className={cn(
                      'text-xs font-medium',
                      statusConfig.textColor
                    )}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant='ghost'
                      size='icon'
                      className={cn(
                        'h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted shrink-0',
                        'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity'
                      )}
                    >
                      <MdMoreVert className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-44' onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails() }}>
                      <MdDescription className='mr-2 h-4 w-4' />
                      View Details
                    </DropdownMenuItem>
                    {onManageWorkflow && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onManageWorkflow() }}>
                        <MdAssignment className='mr-2 h-4 w-4' />
                        Manage Workflow
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onGenerateInvoice() }}>
                      <MdDescription className='mr-2 h-4 w-4' />
                      Download Invoice
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRecordPayment() }}>
                      <MdCreditCard className='mr-2 h-4 w-4' />
                      Record Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onManageDocuments() }}>
                      <MdDescription className='mr-2 h-4 w-4' />
                      Manage Documents
                    </DropdownMenuItem>
                    {auction.paymentStatus === 'completed' && auction.status !== 'shipping' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateShipping() }}>
                          <MdDirectionsBoat className='mr-2 h-4 w-4' />
                          Update Shipping
                        </DropdownMenuItem>
                      </>
                    )}
                    {auction.status === 'shipping' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarkDelivered() }}>
                          <MdLocalShipping className='mr-2 h-4 w-4' />
                          Mark Delivered
                        </DropdownMenuItem>
                      </>
                    )}
                    {auction.status === 'delivered' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarkCompleted() }}>
                          <MdCheckCircle className='mr-2 h-4 w-4' />
                          Mark Completed
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>

              {/* Source Info (Auction or Stock) + VIN + Customer */}
              <div className='flex items-center gap-2 mt-1 text-xs'>
                {auction.source === 'auction' ? (
                  <>
                    <div className='inline-flex items-center gap-1 text-muted-foreground'>
                      <MdGavel className='h-3 w-3' />
                      <span className='font-medium'>{auction.auctionHouse}</span>
                    </div>
                    <span className='text-muted-foreground/40'>•</span>
                    <span className='font-mono text-muted-foreground'>Lot {auction.lotNumber}</span>
                    {auction.auctionDate && (
                      <>
                        <span className='text-muted-foreground/40'>•</span>
                        <span className='text-muted-foreground'>{format(new Date(auction.auctionDate), 'MMM d')}</span>
                      </>
                    )}
                  </>
                ) : (
                  <div className='inline-flex items-center gap-1 text-muted-foreground'>
                    <MdInventory className='h-3 w-3' />
                    <span className='font-mono font-medium'>{auction.stockId}</span>
                  </div>
                )}
                <span className='text-muted-foreground/40'>•</span>
                <button
                  onClick={copyVin}
                  className={cn(
                    'inline-flex items-center gap-1 font-mono',
                    'text-muted-foreground hover:text-foreground transition-colors',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded'
                  )}
                >
                  <span>{auction.vehicleInfo.vin}</span>
                  {copied ? (
                    <MdCheck className='h-3.5 w-3.5 text-emerald-500' />
                  ) : (
                    <MdContentCopy className='h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity' />
                  )}
                </button>
              </div>

              {/* Customer + Specs line */}
              <p className='text-xs text-muted-foreground mt-1.5 truncate'>
                <span className='font-medium text-foreground/80'>{auction.winnerName}</span>
                <span className='mx-1.5'>•</span>
                {specsLine}
                {auction.shipment && (
                  <span> • {auction.shipment.carrier}</span>
                )}
              </p>
            </div>

            {/* Section 2: Financial */}
            <div className='flex items-center gap-3 mt-auto'>
              {/* Bid Price */}
              <div className='text-xs'>
                <span className='text-muted-foreground'>Bid </span>
                <span className='font-semibold tabular-nums'>¥{auction.winningBid.toLocaleString()}</span>
              </div>

              {/* Total Price */}
              <div className='text-xs'>
                <span className='text-muted-foreground'>Total </span>
                <span className='font-bold tabular-nums'>¥{auction.totalAmount.toLocaleString()}</span>
              </div>

              {/* Payment Status */}
              <div className='flex items-center gap-1'>
                {paymentProgress === 100 ? (
                  <>
                    <MdCheckCircle className='h-3.5 w-3.5 text-emerald-500' />
                    <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400'>Paid</span>
                  </>
                ) : (
                  <>
                    <span className='text-xs text-muted-foreground'>Due</span>
                    <span className='text-xs font-semibold tabular-nums text-amber-600 dark:text-amber-400'>
                      ¥{outstandingBalance.toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Documents count */}
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <MdDescription className='h-3.5 w-3.5' />
                <span>{auction.documents.length}</span>
              </div>

              {/* ETA or Age - Right aligned */}
              <div className='flex items-center gap-1 text-xs text-muted-foreground ml-auto'>
                {auction.shipment?.estimatedDelivery ? (
                  <>
                    <MdDirectionsBoat className='h-3.5 w-3.5' />
                    <span>ETA {format(new Date(auction.shipment.estimatedDelivery), 'MMM d')}</span>
                  </>
                ) : (
                  <span>{formatDistanceToNow(new Date(auction.auctionEndDate), { addSuffix: true })}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
