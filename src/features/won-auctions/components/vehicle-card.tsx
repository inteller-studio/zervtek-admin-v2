'use client'

import { useState } from 'react'
import { format } from 'date-fns'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  onRecordPayment: () => void
  onUploadDocuments: () => void
  onManageDocuments: () => void
  onUpdateShipping: () => void
  onGenerateInvoice: () => void
  onMarkDelivered: () => void
  onMarkCompleted: () => void
}

const getStatusConfig = (status: WonAuction['status']) => {
  const config: Record<
    WonAuction['status'],
    {
      label: string
      icon: React.ReactNode
      borderColor: string
      badgeBg: string
      badgeText: string
      badgeBorder: string
      dotColor: string
    }
  > = {
    payment_pending: {
      label: 'Payment Pending',
      icon: <CreditCard className='h-3.5 w-3.5' />,
      borderColor: 'border-l-amber-500',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
      badgeBorder: 'border-amber-200',
      dotColor: 'bg-amber-500',
    },
    processing: {
      label: 'Processing',
      icon: <Clock className='h-3.5 w-3.5' />,
      borderColor: 'border-l-blue-500',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-200',
      dotColor: 'bg-blue-500',
    },
    documents_pending: {
      label: 'Documents Pending',
      icon: <FileText className='h-3.5 w-3.5' />,
      borderColor: 'border-l-slate-500',
      badgeBg: 'bg-slate-50',
      badgeText: 'text-slate-700',
      badgeBorder: 'border-slate-200',
      dotColor: 'bg-slate-500',
    },
    shipping: {
      label: 'In Transit',
      icon: <Ship className='h-3.5 w-3.5' />,
      borderColor: 'border-l-purple-500',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-700',
      badgeBorder: 'border-purple-200',
      dotColor: 'bg-purple-500',
    },
    delivered: {
      label: 'Delivered',
      icon: <Package className='h-3.5 w-3.5' />,
      borderColor: 'border-l-emerald-500',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      dotColor: 'bg-emerald-500',
    },
    completed: {
      label: 'Completed',
      icon: <CheckCircle2 className='h-3.5 w-3.5' />,
      borderColor: 'border-l-gray-400',
      badgeBg: 'bg-gray-50',
      badgeText: 'text-gray-600',
      badgeBorder: 'border-gray-200',
      dotColor: 'bg-gray-400',
    },
  }
  return config[status]
}

export function VehicleCard({
  auction,
  loading = false,
  selected = false,
  onViewDetails,
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

  // Loading skeleton
  if (loading) {
    return (
      <Card className='py-0 gap-0 border-l-4 border-l-muted'>
        <CardContent className='p-0'>
          <div className='flex'>
            {/* Image skeleton */}
            <div className='w-[120px] h-[80px] shrink-0 animate-pulse bg-muted' />
            {/* Content skeleton */}
            <div className='flex-1 p-4 space-y-4'>
              {/* Header */}
              <div className='flex items-start justify-between'>
                <div className='space-y-2'>
                  <div className='h-5 w-48 animate-pulse rounded bg-muted' />
                  <div className='h-4 w-32 animate-pulse rounded bg-muted' />
                </div>
                <div className='h-6 w-28 animate-pulse rounded-full bg-muted' />
              </div>
              {/* Grid */}
              <div className='grid grid-cols-6 gap-4'>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className='space-y-1.5'>
                    <div className='h-3 w-12 animate-pulse rounded bg-muted' />
                    <div className='h-4 w-16 animate-pulse rounded bg-muted' />
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

  const copyVin = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(auction.vehicleInfo.vin)
    setCopied(true)
    toast.success('VIN copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className='group'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        tabIndex={0}
        role='button'
        aria-label={`View details for ${vehicleTitle}`}
        className={cn(
          'py-0 gap-0 cursor-pointer overflow-hidden',
          'border-l-4 transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          statusConfig.borderColor,
          selected
            ? 'ring-2 ring-primary bg-primary/5'
            : 'hover:bg-muted/50 hover:shadow-md'
        )}
        onClick={onViewDetails}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onViewDetails()
          }
        }}
      >
        <CardContent className='p-0'>
          <div className='flex'>
            {/* Vehicle Image - 120x80 with hover zoom */}
            <div className='relative w-[120px] h-[80px] shrink-0 overflow-hidden bg-muted'>
              {auction.vehicleInfo.images.length > 0 &&
              auction.vehicleInfo.images[0] !== '#' ? (
                <img
                  src={auction.vehicleInfo.images[0]}
                  alt={vehicleTitle}
                  className={cn(
                    'h-full w-full object-cover transition-transform duration-300',
                    isHovered && 'scale-110'
                  )}
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-muted'>
                  <span className='text-[10px] text-muted-foreground'>No Image</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className='flex-1 p-4 min-w-0'>
              {/* Header Row: Title + Status Badge + Actions */}
              <div className='flex items-start justify-between gap-4 mb-3'>
                {/* Title & VIN */}
                <div className='min-w-0 flex-1'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h2 className='text-base font-semibold text-foreground truncate cursor-default'>
                        {vehicleTitle}
                      </h2>
                    </TooltipTrigger>
                    <TooltipContent side='top'>
                      <p>{vehicleTitle}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* VIN with copy on hover */}
                  <div className='flex items-center gap-2 mt-1'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={copyVin}
                          className={cn(
                            'inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground',
                            'hover:text-foreground transition-colors rounded px-1 -ml-1',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                          )}
                          aria-label={`Copy VIN ${auction.vehicleInfo.vin}`}
                        >
                          <span className='truncate max-w-[140px]'>{auction.vehicleInfo.vin}</span>
                          {copied ? (
                            <Check className='h-3 w-3 text-emerald-500' />
                          ) : (
                            <Copy className={cn('h-3 w-3', isHovered ? 'opacity-100' : 'opacity-0')} />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>
                        <p>{copied ? 'Copied!' : 'Click to copy VIN'}</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className='text-muted-foreground/40'>|</span>
                    <span className='text-xs text-muted-foreground truncate'>{auction.winnerName}</span>
                  </div>
                </div>

                {/* Status Badge + Actions */}
                <div className='flex items-center gap-2 shrink-0'>
                  {/* Status Badge - larger with icon */}
                  <Badge
                    variant='outline'
                    className={cn(
                      'px-2.5 py-1 gap-1.5 font-medium',
                      statusConfig.badgeBg,
                      statusConfig.badgeText,
                      statusConfig.badgeBorder
                    )}
                  >
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </Badge>

                  {/* Actions Menu with Tooltip */}
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
                                'focus-visible:ring-2 focus-visible:ring-ring'
                              )}
                              aria-label='Open actions menu'
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-48' onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onGenerateInvoice() }}>
                              <FileText className='mr-2 h-4 w-4' />
                              Generate Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRecordPayment() }}>
                              <CreditCard className='mr-2 h-4 w-4' />
                              Record Payment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onManageDocuments() }}>
                              <FileText className='mr-2 h-4 w-4' />
                              Manage Documents
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUploadDocuments() }}>
                              <FileText className='mr-2 h-4 w-4' />
                              Upload Documents
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
                      <p>Actions</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Data Grid */}
              <div className='grid grid-cols-6 gap-x-6 gap-y-2'>
                {/* Mileage */}
                <div className='space-y-0.5'>
                  <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                    Mileage
                  </p>
                  <p className='text-sm font-medium tabular-nums'>
                    {auction.vehicleInfo.mileage.toLocaleString()} km
                  </p>
                </div>

                {/* Color */}
                <div className='space-y-0.5'>
                  <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                    Color
                  </p>
                  <p className='text-sm font-medium truncate'>{auction.vehicleInfo.color}</p>
                </div>

                {/* Won Date */}
                <div className='space-y-0.5'>
                  <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                    Won Date
                  </p>
                  <p className='text-sm font-medium'>
                    {format(new Date(auction.auctionEndDate), 'MMM d, yyyy')}
                  </p>
                </div>

                {/* Payment Progress with visual bar */}
                <div className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                      Paid
                    </p>
                    <span className='text-[10px] font-medium tabular-nums'>{paymentProgress}%</span>
                  </div>
                  <Progress
                    value={paymentProgress}
                    className='h-1.5'
                    aria-label={`Payment progress: ${paymentProgress}% paid`}
                  />
                </div>

                {/* Total + Due as badge */}
                <div className='space-y-0.5'>
                  <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                    Total
                  </p>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-semibold tabular-nums'>
                      ¥{auction.totalAmount.toLocaleString()}
                    </p>
                    {outstandingBalance > 0 && (
                      <Badge
                        variant='outline'
                        className='px-1.5 py-0 text-[10px] font-medium bg-orange-50 text-orange-700 border-orange-200'
                      >
                        Due ¥{outstandingBalance.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Destination Port */}
                <div className='space-y-0.5'>
                  <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                    Destination
                  </p>
                  {auction.destinationPort ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className='text-sm font-medium truncate flex items-center gap-1 cursor-default'>
                          <MapPin className='h-3 w-3 text-muted-foreground shrink-0' />
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
