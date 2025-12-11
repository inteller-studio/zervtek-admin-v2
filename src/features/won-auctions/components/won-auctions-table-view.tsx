'use client'

import { format } from 'date-fns'
import { Eye, MoreHorizontal, FileText, Ship, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type WonAuction } from '../data/won-auctions'
import { VinCopyButton } from './vin-copy-button'
import { DeliveryCountdown } from './delivery-countdown'
import { type WonAuctionsDialogType } from '../types'

interface WonAuctionsTableViewProps {
  data: WonAuction[]
  onOpenDialog: (type: WonAuctionsDialogType, auction: WonAuction) => void
  onMarkDelivered: (auction: WonAuction) => void
  onMarkCompleted: (auction: WonAuction) => void
}

const getStatusColor = (status: WonAuction['status']) => {
  const colors: Record<WonAuction['status'], string> = {
    payment_pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    processing: 'text-blue-600 bg-blue-50 border-blue-200',
    documents_pending: 'text-slate-700 bg-slate-100 border-slate-300',
    shipping: 'text-purple-600 bg-purple-50 border-purple-200',
    delivered: 'text-green-600 bg-green-50 border-green-200',
    completed: 'text-gray-600 bg-gray-50 border-gray-200',
  }
  return colors[status] || ''
}

const getPaymentStatusColor = (status: WonAuction['paymentStatus']) => {
  const colors: Record<WonAuction['paymentStatus'], string> = {
    pending: 'text-yellow-600 bg-yellow-50',
    partial: 'text-slate-700 bg-slate-100',
    completed: 'text-green-600 bg-green-50',
  }
  return colors[status] || ''
}

export function WonAuctionsTableView({
  data,
  onOpenDialog,
  onMarkDelivered,
  onMarkCompleted,
}: WonAuctionsTableViewProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead className='text-right'>Amount</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((auction) => {
            const progress = (auction.paidAmount / auction.totalAmount) * 100
            return (
              <TableRow key={auction.id}>
                <TableCell>
                  <div className='space-y-1'>
                    <p className='font-medium'>
                      {auction.vehicleInfo.year} {auction.vehicleInfo.make}{' '}
                      {auction.vehicleInfo.model}
                    </p>
                    <VinCopyButton vin={auction.vehicleInfo.vin} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className='space-y-1'>
                    <p className='font-medium'>{auction.winnerName}</p>
                    <p className='text-xs text-muted-foreground'>{auction.auctionId}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col gap-1'>
                    <Badge className={getStatusColor(auction.status)}>
                      {auction.status.replace(/_/g, ' ')}
                    </Badge>
                    {auction.shipment?.estimatedDelivery && (
                      <DeliveryCountdown
                        estimatedDelivery={auction.shipment.estimatedDelivery}
                        status={auction.status}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='space-y-2'>
                    <Badge className={getPaymentStatusColor(auction.paymentStatus)}>
                      {auction.paymentStatus}
                    </Badge>
                    <div className='w-24'>
                      <Progress value={progress} className='h-1.5' />
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {Math.round(progress)}%
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className='text-sm'>{auction.destinationPort || 'TBD'}</span>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='space-y-1'>
                    <p className='font-bold'>${auction.winningBid.toLocaleString()}</p>
                    {auction.paidAmount < auction.totalAmount && (
                      <p className='text-xs text-orange-600'>
                        Due: ${(auction.totalAmount - auction.paidAmount).toLocaleString()}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onOpenDialog('detail', auction)}>
                        <Eye className='mr-2 h-4 w-4' />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onOpenDialog('invoice', auction)}>
                        <FileText className='mr-2 h-4 w-4' />
                        Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onOpenDialog('payment', auction)}>
                        <DollarSign className='mr-2 h-4 w-4' />
                        Record Payment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onOpenDialog('documents', auction)}>
                        <FileText className='mr-2 h-4 w-4' />
                        Manage Documents
                      </DropdownMenuItem>
                      {auction.paymentStatus === 'completed' && auction.status !== 'shipping' && (
                        <DropdownMenuItem onClick={() => onOpenDialog('shipping', auction)}>
                          <Ship className='mr-2 h-4 w-4' />
                          Update Shipping
                        </DropdownMenuItem>
                      )}
                      {auction.status === 'shipping' && (
                        <DropdownMenuItem onClick={() => onMarkDelivered(auction)}>
                          Mark as Delivered
                        </DropdownMenuItem>
                      )}
                      {auction.status === 'delivered' && (
                        <DropdownMenuItem onClick={() => onMarkCompleted(auction)}>
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
                No auctions found matching your criteria
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
