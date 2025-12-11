'use client'

import { format } from 'date-fns'
import {
  Eye,
  MoreHorizontal,
  StickyNote,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type WonAuction } from '../data/won-auctions'
import { VehicleImage } from './vehicle-image'
import { VinCopyButton } from './vin-copy-button'
import { DeliveryCountdown } from './delivery-countdown'

interface VehicleCardProps {
  auction: WonAuction
  onViewDetails: () => void
  onRecordPayment: () => void
  onUploadDocuments: () => void
  onManageDocuments: () => void
  onUpdateShipping: () => void
  onGenerateInvoice: () => void
  onMarkDelivered: () => void
  onMarkCompleted: () => void
}

const getStatusColor = (status: WonAuction['status']) => {
  const colors: Record<WonAuction['status'], string> = {
    payment_pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    documents_pending: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    shipping: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    delivered: 'bg-green-500/10 text-green-600 border-green-500/20',
    completed: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  }
  return colors[status] || ''
}

const getStatusLabel = (status: WonAuction['status']) => {
  const labels: Record<WonAuction['status'], string> = {
    payment_pending: 'Payment Pending',
    processing: 'Processing',
    documents_pending: 'Docs Pending',
    shipping: 'Shipping',
    delivered: 'Delivered',
    completed: 'Completed',
  }
  return labels[status] || status
}

export function VehicleCard({
  auction,
  onViewDetails,
  onRecordPayment,
  onUploadDocuments,
  onManageDocuments,
  onUpdateShipping,
  onGenerateInvoice,
  onMarkDelivered,
  onMarkCompleted,
}: VehicleCardProps) {
  const progress = (auction.paidAmount / auction.totalAmount) * 100
  const outstandingBalance = auction.totalAmount - auction.paidAmount

  return (
    <Card className='group overflow-hidden transition-all hover:shadow-md'>
      <CardContent className='p-4'>
        <div className='flex gap-3'>
          {/* Vehicle Image - Smaller */}
          <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-lg'>
            <VehicleImage
              images={auction.vehicleInfo.images}
              alt={`${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`}
            />
          </div>

          {/* Content */}
          <div className='flex min-w-0 flex-1 flex-col'>
            {/* Top Row: Title + Price + Actions */}
            <div className='flex items-start justify-between gap-2'>
              <div className='min-w-0 flex-1'>
                <h3 className='truncate text-sm font-semibold'>
                  {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
                </h3>
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <VinCopyButton vin={auction.vehicleInfo.vin} />
                  <span className='text-muted-foreground/50'>•</span>
                  <span>{auction.vehicleInfo.mileage.toLocaleString()} mi</span>
                </div>
              </div>

              <div className='flex items-center gap-1'>
                <div className='text-right'>
                  <p className='text-sm font-bold'>${auction.winningBid.toLocaleString()}</p>
                  {outstandingBalance > 0 && (
                    <p className='text-[10px] text-orange-600'>
                      -${outstandingBalance.toLocaleString()}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-7 w-7'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={onViewDetails}>
                      <Eye className='mr-2 h-4 w-4' />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onGenerateInvoice}>
                      Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onRecordPayment}>
                      Record Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onManageDocuments}>
                      Manage Documents
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onUploadDocuments}>
                      Upload Documents
                    </DropdownMenuItem>
                    {auction.paymentStatus === 'completed' && auction.status !== 'shipping' && (
                      <DropdownMenuItem onClick={onUpdateShipping}>
                        Update Shipping
                      </DropdownMenuItem>
                    )}
                    {auction.status === 'shipping' && (
                      <DropdownMenuItem onClick={onMarkDelivered}>
                        Mark Delivered
                      </DropdownMenuItem>
                    )}
                    {auction.status === 'delivered' && (
                      <DropdownMenuItem onClick={onMarkCompleted}>
                        Mark Completed
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Middle Row: Customer + Date + Port */}
            <div className='mt-1.5 flex items-center gap-3 text-xs text-muted-foreground'>
              <span className='truncate'>{auction.winnerName}</span>
              <span className='text-muted-foreground/50'>•</span>
              <span>{format(new Date(auction.auctionEndDate), 'MMM d')}</span>
              {auction.destinationPort && (
                <>
                  <span className='text-muted-foreground/50'>•</span>
                  <span className='truncate'>{auction.destinationPort}</span>
                </>
              )}
            </div>

            {/* Bottom Row: Status Badges + Progress */}
            <div className='mt-2 flex items-center justify-between gap-2'>
              <div className='flex flex-wrap items-center gap-1'>
                <Badge variant='outline' className={`text-[10px] px-1.5 py-0 ${getStatusColor(auction.status)}`}>
                  {getStatusLabel(auction.status)}
                </Badge>
                {auction.shipment?.estimatedDelivery && auction.status === 'shipping' && (
                  <DeliveryCountdown
                    estimatedDelivery={auction.shipment.estimatedDelivery}
                    status={auction.status}
                  />
                )}
                {auction.notes && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant='outline' className='flex items-center gap-0.5 px-1.5 py-0 text-[10px]'>
                          <StickyNote className='h-2.5 w-2.5' />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className='max-w-xs text-xs'>{auction.notes}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Compact Progress */}
              <div className='flex items-center gap-2'>
                <Progress value={progress} className='h-1.5 w-16' />
                <span className='text-[10px] text-muted-foreground'>{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
