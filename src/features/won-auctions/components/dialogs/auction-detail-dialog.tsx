'use client'

import { format } from 'date-fns'
import { MdDownload, MdDescription, MdLocalShipping } from 'react-icons/md'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { type Purchase, type ShipmentTracking } from '../../data/won-auctions'
import { VinCopyButton } from '../vin-copy-button'
import { PaymentHistoryTimeline } from '../payment-history-timeline'
import { DocumentChecklist } from '../document-checklist'

interface AuctionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auction: Purchase | null
}

const getStatusColor = (status: Purchase['status']) => {
  const colors: Record<Purchase['status'], string> = {
    payment_pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    processing: 'text-blue-600 bg-blue-50 border-blue-200',
    documents_pending: 'text-slate-700 bg-slate-100 border-slate-300',
    shipping: 'text-purple-600 bg-purple-50 border-purple-200',
    delivered: 'text-green-600 bg-green-50 border-green-200',
    completed: 'text-gray-600 bg-gray-50 border-gray-200',
  }
  return colors[status] || ''
}

const getPaymentStatusColor = (status: Purchase['paymentStatus']) => {
  const colors: Record<Purchase['paymentStatus'], string> = {
    pending: 'text-yellow-600 bg-yellow-50',
    partial: 'text-slate-700 bg-slate-100',
    completed: 'text-green-600 bg-green-50',
  }
  return colors[status] || ''
}

const getShippingStatusColor = (status: ShipmentTracking['status']) => {
  const colors: Record<ShipmentTracking['status'], string> = {
    preparing: 'text-yellow-600',
    in_transit: 'text-blue-600',
    at_port: 'text-purple-600',
    customs_clearance: 'text-slate-700',
    delivered: 'text-green-600',
  }
  return colors[status] || ''
}

const getProgress = (auction: Purchase) => {
  const steps = [
    'payment_pending',
    'processing',
    'documents_pending',
    'shipping',
    'delivered',
    'completed',
  ]
  const currentIndex = steps.indexOf(auction.status)
  return ((currentIndex + 1) / steps.length) * 100
}

export function AuctionDetailDialog({
  open,
  onOpenChange,
  auction,
}: AuctionDetailDialogProps) {
  if (!auction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
          </DialogTitle>
          <DialogDescription>Auction #{auction.auctionId}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Status Badges */}
          <div className='flex flex-wrap gap-2'>
            <Badge className={getStatusColor(auction.status)}>
              {auction.status.replace(/_/g, ' ')}
            </Badge>
            <Badge className={getPaymentStatusColor(auction.paymentStatus)}>
              Payment: {auction.paymentStatus}
            </Badge>
            {auction.shipment && (
              <Badge
                variant='outline'
                className={getShippingStatusColor(auction.shipment.status)}
              >
                <MdLocalShipping className='mr-1 h-3 w-3' />
                {auction.shipment.status.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>

          {/* Progress */}
          <div>
            <div className='mb-2 flex items-center justify-between text-sm'>
              <span>Overall Progress</span>
              <span>{Math.round(getProgress(auction))}%</span>
            </div>
            <Progress value={getProgress(auction)} className='h-3' />
          </div>

          {/* Details Grid */}
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Vehicle Info */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Make/Model</span>
                  <span className='font-medium'>
                    {auction.vehicleInfo.make} {auction.vehicleInfo.model}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Year</span>
                  <span className='font-medium'>{auction.vehicleInfo.year}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>VIN</span>
                  <VinCopyButton vin={auction.vehicleInfo.vin} showFull />
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Mileage</span>
                  <span className='font-medium'>
                    {auction.vehicleInfo.mileage.toLocaleString()} mi
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Color</span>
                  <span className='font-medium'>{auction.vehicleInfo.color}</span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Name</span>
                  <span className='font-medium'>{auction.winnerName}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Email</span>
                  <span className='font-medium'>{auction.winnerEmail}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Phone</span>
                  <span className='font-medium'>{auction.winnerPhone}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Destination</span>
                  <span className='font-medium'>{auction.destinationPort}</span>
                </div>
                {auction.winnerAddress && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Address</span>
                    <span className='max-w-[200px] text-right text-sm font-medium'>
                      {auction.winnerAddress}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Winning Bid</span>
                  <span className='font-medium'>
                    ¥{auction.winningBid.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Shipping Cost</span>
                  <span className='font-medium'>
                    ¥{auction.shippingCost.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Insurance</span>
                  <span className='font-medium'>
                    ¥{auction.insuranceFee.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between border-t pt-2'>
                  <span className='font-medium'>Total Amount</span>
                  <span className='font-bold'>¥{auction.totalAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Paid Amount</span>
                  <span className='font-medium text-green-600'>
                    ¥{auction.paidAmount.toLocaleString()}
                  </span>
                </div>
                {auction.totalAmount - auction.paidAmount > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Outstanding</span>
                    <span className='font-medium text-orange-600'>
                      ¥{(auction.totalAmount - auction.paidAmount).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                {auction.shipment ? (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Carrier</span>
                      <span className='font-medium'>{auction.shipment.carrier}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Tracking #</span>
                      <code className='rounded bg-muted px-2 py-1 font-mono text-sm'>
                        {auction.shipment.trackingNumber}
                      </code>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Location</span>
                      <span className='font-medium'>
                        {auction.shipment.currentLocation}
                      </span>
                    </div>
                    {auction.shipment.estimatedDelivery && (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Est. Delivery</span>
                        <span className='font-medium'>
                          {format(new Date(auction.shipment.estimatedDelivery), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className='text-muted-foreground'>
                    Shipping information not available yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          {auction.payments && auction.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentHistoryTimeline payments={auction.payments} />
              </CardContent>
            </Card>
          )}

          {/* Document Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Documents</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <DocumentChecklist auction={auction} />

              {auction.documents.length > 0 && (
                <div className='space-y-2 pt-4'>
                  <h4 className='text-sm font-medium'>Uploaded Documents</h4>
                  {auction.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className='flex items-center justify-between rounded-lg bg-muted p-3'
                    >
                      <div className='flex items-center gap-3'>
                        <MdDescription className='h-5 w-5 text-muted-foreground' />
                        <div>
                          <p className='font-medium'>{doc.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {doc.type.replace(/_/g, ' ')} • {(doc.size / 1024).toFixed(1)} KB
                            • Uploaded by {doc.uploadedBy}
                          </p>
                        </div>
                      </div>
                      <Button variant='ghost' size='sm'>
                        <MdDownload className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {auction.notes && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>{auction.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
