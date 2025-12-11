'use client'

import { differenceInDays, formatDistanceToNow, isPast } from 'date-fns'
import { Clock, AlertTriangle, Ship } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DeliveryCountdownProps {
  estimatedDelivery?: Date
  status: string
}

export function DeliveryCountdown({ estimatedDelivery, status }: DeliveryCountdownProps) {
  // Only show for shipping status
  if (!estimatedDelivery || status !== 'shipping') {
    return null
  }

  const deliveryDate = new Date(estimatedDelivery)
  const isOverdue = isPast(deliveryDate)
  const daysLeft = differenceInDays(deliveryDate, new Date())

  if (isOverdue) {
    return (
      <Badge variant='destructive' className='flex items-center gap-1'>
        <AlertTriangle className='h-3 w-3' />
        Overdue
      </Badge>
    )
  }

  if (daysLeft <= 3) {
    return (
      <Badge
        variant='outline'
        className='flex items-center gap-1 border-orange-300 text-orange-600'
      >
        <Clock className='h-3 w-3' />
        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
      </Badge>
    )
  }

  return (
    <Badge variant='outline' className='flex items-center gap-1'>
      <Ship className='h-3 w-3' />
      {formatDistanceToNow(deliveryDate, { addSuffix: false })}
    </Badge>
  )
}
