'use client'

import { formatDistanceToNow } from 'date-fns'
import { MdAccessTime, MdFactCheck, MdTranslate } from 'react-icons/md'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ServiceRequest } from '../../requests/data/requests'

interface ServiceTaskCardProps {
  request: ServiceRequest
  vehicleInfo: {
    name: string
    lotNo: string
    auctionHouse: string
    time: string
    grade: string
    image: string
  }
  index: number
  onClick: () => void
}

export function ServiceTaskCard({
  request,
  vehicleInfo,
  index,
  onClick,
}: ServiceTaskCardProps) {
  const isCompleted = request.status === 'completed'
  const isTranslation = request.type === 'translation'
  const waitTime = formatDistanceToNow(new Date(request.createdAt), { addSuffix: false })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <Card
        className={cn(
          'group cursor-pointer overflow-hidden transition-all hover:shadow-md !py-0 !gap-0',
          isCompleted && 'opacity-60'
        )}
        onClick={onClick}
      >
        <CardContent className='p-0'>
          {/* Image Section */}
          <div className='relative h-44 w-full overflow-hidden bg-muted'>
            <img
              src={vehicleInfo.image}
              alt={vehicleInfo.name}
              className='h-full w-full object-cover transition-transform group-hover:scale-105'
            />
            {/* Type Badge */}
            <div className='absolute right-2 top-2'>
              <Badge
                variant='secondary'
                className={cn(
                  'flex items-center gap-1 text-white',
                  isTranslation ? 'bg-blue-500/90' : 'bg-amber-500/90'
                )}
              >
                {isTranslation ? (
                  <MdTranslate className='h-3 w-3' />
                ) : (
                  <MdFactCheck className='h-3 w-3' />
                )}
                {isTranslation ? 'Translation' : 'Inspection'}
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className='p-4'>
            {/* Title */}
            <div>
              <h3 className='truncate text-sm font-semibold'>
                {vehicleInfo.name}
              </h3>
              <p className='truncate text-xs text-muted-foreground'>
                {vehicleInfo.grade !== 'N/A' ? `Grade ${vehicleInfo.grade}` : request.customerName}
              </p>
            </div>

            {/* Info Row */}
            <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
              <span className='font-mono'>{vehicleInfo.lotNo}</span>
              <span className='text-muted-foreground/50'>•</span>
              <span>{vehicleInfo.auctionHouse}</span>
            </div>

            {/* Bottom Section */}
            <div className='mt-3 border-t pt-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs text-muted-foreground'>Status</p>
                  <Badge
                    variant={
                      isCompleted ? 'emerald' :
                      request.status === 'in_progress' ? 'blue' :
                      request.status === 'assigned' ? 'violet' : 'amber'
                    }
                    className='mt-0.5 capitalize'
                  >
                    {request.status.replace('_', ' ')}
                  </Badge>
                </div>
                {!isCompleted && (
                  <div className='text-right'>
                    <p className='text-xs text-muted-foreground'>Waiting</p>
                    <p className='flex items-center gap-1 text-sm font-medium'>
                      <MdAccessTime className='h-3.5 w-3.5' />
                      {waitTime}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
