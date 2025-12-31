'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  MdDirectionsCar,
  MdPerson,
  MdCreditCard,
  MdDirectionsBoat,
  MdLocationOn,
  MdCheckCircle,
  MdDescription,
  MdDownload,
  MdAccessTime,
} from 'react-icons/md'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AnimatedTabs, AnimatedTabsContent, type TabItem } from '@/components/ui/animated-tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../../data/won-auctions'
import { InfoCard } from '../shared/info-card'
import { InfoRow } from '../shared/info-row'

interface OverviewPanelProps {
  auction: Purchase
  onRecordPayment?: () => void
  onUpdateShipping?: () => void
  onGenerateInvoice?: () => void
}

// Payment status styles
const paymentStatusStyles: Record<Purchase['paymentStatus'], string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  partial: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
}

function PaymentBreakdown({ auction }: { auction: Purchase }) {
  const total = auction.totalAmount
  const bidPercent = (auction.winningBid / total) * 100
  const shippingPercent = (auction.shippingCost / total) * 100
  const insurancePercent = (auction.insuranceFee / total) * 100
  const paymentProgress = (auction.paidAmount / total) * 100
  const outstanding = total - auction.paidAmount

  return (
    <div className='space-y-4'>
      {/* Visual breakdown bar */}
      <div className='space-y-2'>
        <div className='flex h-3 overflow-hidden rounded-full'>
          <div
            className='bg-blue-500'
            style={{ width: `${bidPercent}%` }}
            title={`Bid: ¥${auction.winningBid.toLocaleString()}`}
          />
          <div
            className='bg-purple-500'
            style={{ width: `${shippingPercent}%` }}
            title={`Shipping: ¥${auction.shippingCost.toLocaleString()}`}
          />
          <div
            className='bg-orange-500'
            style={{ width: `${insurancePercent}%` }}
            title={`Insurance: ¥${auction.insuranceFee.toLocaleString()}`}
          />
        </div>
        <div className='flex justify-between text-xs'>
          <div className='flex items-center gap-1.5'>
            <div className='h-2 w-2 rounded-full bg-blue-500' />
            <span className='text-muted-foreground'>Bid</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className='h-2 w-2 rounded-full bg-purple-500' />
            <span className='text-muted-foreground'>Shipping</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className='h-2 w-2 rounded-full bg-orange-500' />
            <span className='text-muted-foreground'>Insurance</span>
          </div>
        </div>
      </div>

      {/* Amount details */}
      <div className='space-y-1 divide-y divide-border/50'>
        <InfoRow label='Winning Bid' value={`¥${auction.winningBid.toLocaleString()}`} />
        <InfoRow label='Shipping Cost' value={`¥${auction.shippingCost.toLocaleString()}`} />
        <InfoRow label='Insurance' value={`¥${auction.insuranceFee.toLocaleString()}`} />
      </div>

      <div className='border-t border-border/50 pt-3 space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='font-medium'>Total Amount</span>
          <span className='text-xl font-bold'>¥{total.toLocaleString()}</span>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>Paid Amount</span>
          <span
            className={cn(
              'font-semibold flex items-center gap-1.5',
              auction.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-foreground'
            )}
          >
            {auction.paymentStatus === 'completed' && <MdCheckCircle className='h-4 w-4' />}
            ¥{auction.paidAmount.toLocaleString()}
          </span>
        </div>

        {outstanding > 0 && (
          <>
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Payment Progress</span>
                <span className='font-medium'>{Math.round(paymentProgress)}%</span>
              </div>
              <Progress value={paymentProgress} className='h-2' />
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Outstanding</span>
              <span className='font-semibold text-orange-600'>
                ¥{outstanding.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Payment History */}
      {auction.payments.length > 0 && (
        <div className='border-t border-border/50 pt-3'>
          <p className='text-sm font-medium mb-2'>Payment History</p>
          <div className='space-y-2'>
            {auction.payments.map((payment) => (
              <div
                key={payment.id}
                className='flex items-center justify-between text-sm bg-muted/30 rounded-lg p-2'
              >
                <div className='flex items-center gap-2'>
                  <MdCreditCard className='h-3.5 w-3.5 text-muted-foreground' />
                  <span className='text-muted-foreground'>
                    {format(new Date(payment.date), 'MMM d, yyyy')}
                  </span>
                </div>
                <span className='font-medium'>¥{payment.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function OverviewPanel({
  auction,
  onRecordPayment,
  onUpdateShipping,
  onGenerateInvoice,
}: OverviewPanelProps) {
  const [activeTab, setActiveTab] = useState('vehicle')

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const overviewTabs: TabItem[] = [
    { id: 'vehicle', label: 'Vehicle', icon: MdDirectionsCar },
    { id: 'customer', label: 'Customer', icon: MdPerson },
    { id: 'payments', label: 'Payments', icon: MdCreditCard },
    { id: 'shipping', label: 'Shipping', icon: MdDirectionsBoat },
  ]

  return (
    <ScrollArea className='h-full'>
      <div className='p-4'>
        <AnimatedTabs
          tabs={overviewTabs}
          value={activeTab}
          onValueChange={setActiveTab}
          variant='compact'
        >
          {/* Vehicle Tab */}
          <AnimatedTabsContent value='vehicle' className='mt-4 space-y-4'>
            <InfoCard title='Vehicle Information' icon={<MdDirectionsCar className='h-4 w-4' />}>
              <div className='space-y-1 divide-y divide-border/50'>
                <InfoRow
                  label='Make/Model'
                  value={`${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`}
                />
                <InfoRow label='Year' value={auction.vehicleInfo.year.toString()} />
                <InfoRow label='VIN' value={auction.vehicleInfo.vin} copyable monospace />
                <InfoRow
                  label='Mileage'
                  value={`${auction.vehicleInfo.mileage.toLocaleString()} km`}
                />
                <InfoRow label='Color' value={auction.vehicleInfo.color} />
              </div>
            </InfoCard>

            <InfoCard title='Purchase Details' icon={<MdDescription className='h-4 w-4' />}>
              <div className='space-y-1 divide-y divide-border/50'>
                <InfoRow label='Purchase ID' value={auction.auctionId} copyable />
                <InfoRow
                  label='Purchase Date'
                  value={format(new Date(auction.auctionEndDate), 'MMM d, yyyy')}
                />
                <InfoRow
                  label='Winning Bid'
                  value={`¥${auction.winningBid.toLocaleString()}`}
                />
              </div>
            </InfoCard>

            {auction.notes && (
              <InfoCard title='Notes'>
                <p className='text-sm text-muted-foreground'>{auction.notes}</p>
              </InfoCard>
            )}
          </AnimatedTabsContent>

          {/* Customer Tab */}
          <AnimatedTabsContent value='customer' className='mt-4 space-y-4'>
            <InfoCard title='Customer Information' icon={<MdPerson className='h-4 w-4' />}>
              <div className='flex items-center gap-3 mb-4'>
                <Avatar className='h-12 w-12'>
                  <AvatarFallback className='bg-primary/10 text-primary text-sm font-medium'>
                    {getInitials(auction.winnerName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>{auction.winnerName}</p>
                  <p className='text-xs text-muted-foreground'>Auction Winner</p>
                </div>
              </div>
              <div className='space-y-1 divide-y divide-border/50'>
                <InfoRow
                  label='Email'
                  value={auction.winnerEmail}
                  copyable
                  href={`mailto:${auction.winnerEmail}`}
                />
                <InfoRow
                  label='Phone'
                  value={auction.winnerPhone}
                  copyable
                  href={`tel:${auction.winnerPhone}`}
                />
                <InfoRow
                  label='Destination'
                  value={
                    <span className='flex items-center gap-1'>
                      <MdLocationOn className='h-3 w-3' />
                      {auction.destinationPort || '—'}
                    </span>
                  }
                />
              </div>
              {auction.winnerAddress && (
                <div className='mt-3 pt-3 border-t border-border/50'>
                  <p className='text-xs text-muted-foreground mb-1'>Address</p>
                  <p className='text-sm leading-relaxed'>{auction.winnerAddress}</p>
                </div>
              )}
            </InfoCard>
          </AnimatedTabsContent>

          {/* Payments Tab */}
          <AnimatedTabsContent value='payments' className='mt-4 space-y-4'>
            <InfoCard
              title='Payment Overview'
              icon={<MdCreditCard className='h-4 w-4' />}
              action={
                <Badge
                  variant='outline'
                  className={cn('text-xs', paymentStatusStyles[auction.paymentStatus])}
                >
                  {auction.paymentStatus.charAt(0).toUpperCase() +
                    auction.paymentStatus.slice(1)}
                </Badge>
              }
            >
              <PaymentBreakdown auction={auction} />
            </InfoCard>

            {onRecordPayment && auction.paymentStatus !== 'completed' && (
              <Button onClick={onRecordPayment} className='w-full'>
                <MdCreditCard className='h-4 w-4 mr-2' />
                Record Payment
              </Button>
            )}
          </AnimatedTabsContent>

          {/* Shipping Tab */}
          <AnimatedTabsContent value='shipping' className='mt-4 space-y-4'>
            <InfoCard title='Shipping Information' icon={<MdDirectionsBoat className='h-4 w-4' />}>
              {auction.shipment ? (
                <div className='space-y-4'>
                  <div className='space-y-1 divide-y divide-border/50'>
                    <InfoRow label='Carrier' value={auction.shipment.carrier} />
                    <InfoRow
                      label='Tracking #'
                      value={auction.shipment.trackingNumber}
                      copyable
                      monospace
                    />
                    <InfoRow
                      label='Status'
                      value={
                        <Badge variant='outline' className='text-xs'>
                          {auction.shipment.status.replace(/_/g, ' ')}
                        </Badge>
                      }
                    />
                    <InfoRow
                      label='Current Location'
                      value={auction.shipment.currentLocation}
                    />
                    {auction.shipment.estimatedDelivery && (
                      <InfoRow
                        label='Est. Delivery'
                        value={format(
                          new Date(auction.shipment.estimatedDelivery),
                          'MMM dd, yyyy'
                        )}
                      />
                    )}
                  </div>
                  <div className='pt-3 border-t border-border/50'>
                    <div className='space-y-1 divide-y divide-border/50'>
                      <InfoRow
                        label='Destination Port'
                        value={auction.destinationPort || '—'}
                      />
                      <InfoRow
                        label='Shipping Cost'
                        value={`¥${auction.shippingCost.toLocaleString()}`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-8 text-center'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4'>
                    <MdDirectionsBoat className='h-8 w-8 text-muted-foreground/50' />
                  </div>
                  <h4 className='font-medium text-muted-foreground mb-1'>
                    No Shipping Info Yet
                  </h4>
                  <p className='text-sm text-muted-foreground/70 max-w-[250px]'>
                    Shipping details will appear once booking is confirmed.
                  </p>
                </div>
              )}
            </InfoCard>

            {/* Invoice Preview */}
            <InfoCard title='Invoice' icon={<MdDescription className='h-4 w-4' />}>
              <div className='space-y-3'>
                <div className='flex items-center justify-between pb-2 border-b border-border/50'>
                  <div>
                    <p className='text-xs text-muted-foreground'>Invoice Number</p>
                    <p className='font-mono font-medium text-sm'>INV-{auction.auctionId}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs text-muted-foreground'>Date</p>
                    <p className='font-medium text-sm'>
                      {format(new Date(auction.auctionEndDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Vehicle</span>
                    <span className='font-medium'>
                      ¥{auction.winningBid.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Shipping</span>
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
                </div>

                <div className='pt-2 border-t border-border/50 flex justify-between items-center'>
                  <span className='font-semibold'>Total</span>
                  <span className='text-lg font-bold'>
                    ¥{auction.totalAmount.toLocaleString()}
                  </span>
                </div>

                {onGenerateInvoice && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full mt-2'
                    onClick={onGenerateInvoice}
                  >
                    <MdDownload className='h-4 w-4 mr-2' />
                    Download Invoice PDF
                  </Button>
                )}
              </div>
            </InfoCard>
          </AnimatedTabsContent>
        </AnimatedTabs>
      </div>
    </ScrollArea>
  )
}
