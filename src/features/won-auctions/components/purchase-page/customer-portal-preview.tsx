'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  MdVisibility,
  MdCheckCircle,
  MdPending,
  MdLocalShipping,
  MdReceipt,
  MdCreditCard,
  MdBuild,
  MdDescription,
  MdDirectionsBoat,
  MdInventory2,
  MdSend,
  MdOpenInNew,
} from 'react-icons/md'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { type Purchase } from '../../data/won-auctions'
import { type PurchaseWorkflow } from '../../types/workflow'

interface CustomerPortalPreviewProps {
  auction: Purchase
  workflow: PurchaseWorkflow
}

// Customer-facing stage configuration (simplified from admin view)
const CUSTOMER_STAGES = [
  { number: 1, label: 'Won', description: 'Auction won successfully', icon: MdReceipt },
  { number: 2, label: 'Payment', description: 'Processing your payment', icon: MdCreditCard },
  { number: 3, label: 'Transport', description: 'Vehicle being transported', icon: MdLocalShipping },
  { number: 4, label: 'Inspection', description: 'Quality inspection & prep', icon: MdBuild },
  { number: 5, label: 'Documents', description: 'Export documents ready', icon: MdDescription },
  { number: 6, label: 'Shipping', description: 'Booked for shipping', icon: MdDirectionsBoat },
  { number: 7, label: 'In Transit', description: 'On the way to you', icon: MdInventory2 },
  { number: 8, label: 'Delivered', description: 'Documents sent', icon: MdSend },
]

export function CustomerPortalPreview({ auction, workflow }: CustomerPortalPreviewProps) {
  // Map admin workflow stage to customer-facing stage
  const customerCurrentStage = useMemo(() => {
    // Map internal workflow stages to customer-visible stages
    const stageMapping: Record<number, number> = {
      1: 1, // After Purchase -> Won
      2: 3, // Transport -> Transport
      3: 2, // Payment -> Payment
      4: 4, // Repair/Stored -> Inspection
      5: 5, // Documents -> Documents
      6: 6, // Booking -> Shipping
      7: 7, // Shipped -> In Transit
      8: 8, // DHL -> Delivered
    }
    return stageMapping[workflow.currentStage] || 1
  }, [workflow.currentStage])

  // Calculate overall progress for customer view
  const customerProgress = useMemo(() => {
    return Math.round((customerCurrentStage / CUSTOMER_STAGES.length) * 100)
  }, [customerCurrentStage])

  // Get status for each customer stage
  const getStageStatus = (stageNumber: number) => {
    if (stageNumber < customerCurrentStage) return 'completed'
    if (stageNumber === customerCurrentStage) return 'in-progress'
    return 'pending'
  }

  return (
    <Card className='border shadow-sm h-full'>
      <CardHeader className='py-2 px-3 border-b bg-muted/50'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <MdVisibility className='h-4 w-4 text-muted-foreground' />
            Customer View
          </CardTitle>
          <Button variant='outline' size='sm' className='h-7 gap-1.5 text-[10px] px-2'>
            <MdOpenInNew className='h-3 w-3' />
            Open
          </Button>
        </div>
      </CardHeader>

      <CardContent className='p-3 space-y-3'>
        {/* Vehicle Header - Compact */}
        <div className='flex items-center gap-3 p-2 rounded-lg bg-muted/50'>
          <div className='h-12 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0'>
            {auction.vehicleInfo.images?.[0] ? (
              <img
                src={auction.vehicleInfo.images[0]}
                alt={`${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`}
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='h-full w-full flex items-center justify-center text-muted-foreground'>
                <MdDirectionsBoat className='h-6 w-6' />
              </div>
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <h4 className='font-semibold text-xs truncate'>
              {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
            </h4>
            <div className='flex items-center gap-1.5 mt-0.5'>
              <Badge variant='secondary' className='text-[9px] h-4 px-1'>
                {customerProgress}%
              </Badge>
              {auction.shipment?.estimatedDelivery && (
                <span className='text-[9px] text-muted-foreground'>
                  Est. {format(new Date(auction.shipment.estimatedDelivery), 'MMM d')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stage Timeline - Compact horizontal */}
        <div className='pt-1'>
          <div className='flex items-center justify-between relative px-1'>
            {/* Connection Line */}
            <div className='absolute top-3 left-4 right-4 h-px bg-muted' />
            <div
              className='absolute top-3 left-4 h-px bg-primary transition-all duration-500'
              style={{ width: `${Math.max(0, ((customerCurrentStage - 1) / (CUSTOMER_STAGES.length - 1)) * 100)}%` }}
            />

            {CUSTOMER_STAGES.map((stage) => {
              const status = getStageStatus(stage.number)
              const Icon = stage.icon

              return (
                <div key={stage.number} className='relative z-10 flex flex-col items-center'>
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300',
                      status === 'completed' && 'bg-foreground text-background',
                      status === 'in-progress' && 'bg-primary text-primary-foreground ring-2 ring-primary/20',
                      status === 'pending' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {status === 'completed' ? (
                      <MdCheckCircle className='h-3 w-3' />
                    ) : status === 'in-progress' ? (
                      <Icon className='h-3 w-3' />
                    ) : (
                      <span className='text-[8px] font-medium'>{stage.number}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[8px] mt-1 font-medium text-center max-w-[40px] leading-tight',
                      status === 'completed' && 'text-foreground',
                      status === 'in-progress' && 'text-primary font-semibold',
                      status === 'pending' && 'text-muted-foreground'
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Stage Detail - Compact */}
        <div className='p-2 rounded-lg bg-muted/50 border'>
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0'>
              {(() => {
                const CurrentIcon = CUSTOMER_STAGES[customerCurrentStage - 1]?.icon || MdPending
                return <CurrentIcon className='h-4 w-4 text-primary-foreground' />
              })()}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-1.5'>
                <h4 className='font-semibold text-xs'>
                  {CUSTOMER_STAGES[customerCurrentStage - 1]?.label}
                </h4>
                <Badge variant='secondary' className='text-[9px] h-4 px-1'>
                  In Progress
                </Badge>
              </div>
              <p className='text-[10px] text-muted-foreground truncate'>
                {CUSTOMER_STAGES[customerCurrentStage - 1]?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Action Hint - Compact */}
        {auction.paymentStatus !== 'completed' && (
          <div className='p-1.5 rounded-md bg-amber-500/10 border border-amber-500/20'>
            <p className='text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5'>
              <MdCreditCard className='h-3 w-3 flex-shrink-0' />
              <span>Payment pending</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
