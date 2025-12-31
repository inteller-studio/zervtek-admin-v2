'use client'

import { formatDistanceToNow } from 'date-fns'
import { MdCheckCircle, MdFactCheck, MdAccessTime, MdTranslate } from 'react-icons/md'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ServiceRequest } from '../../requests/data/requests'
import { getTimeBadgeStyle } from '../types'

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
  const isPending = request.status === 'pending'
  const isTranslation = request.type === 'translation'

  const getWaitTime = (createdAt: Date) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: false })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          'relative cursor-pointer rounded-xl border-border/50 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden',
          isCompleted && 'opacity-60'
        )}
        onClick={onClick}
      >
        {/* Thumbnail */}
        <div className='relative h-32 bg-muted'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vehicleInfo.image}
            alt={vehicleInfo.name}
            className='h-full w-full object-cover'
          />
          {/* Type badge overlay */}
          <div className='absolute top-2 right-2 flex items-center gap-1.5'>
            {isPending && (
              <span className='size-2 rounded-full bg-blue-500 ring-2 ring-background' />
            )}
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm',
                isTranslation ? 'bg-blue-500/90 text-white' : 'bg-amber-500/90 text-white'
              )}
            >
              {isTranslation ? (
                <MdTranslate className='h-3 w-3' />
              ) : (
                <MdFactCheck className='h-3 w-3' />
              )}
              {isTranslation ? 'Translation' : 'Inspection'}
            </span>
          </div>
        </div>

        <CardContent className='p-4'>
          <h3
            className={cn(
              'text-sm line-clamp-1',
              isCompleted ? 'font-normal text-muted-foreground' : 'font-medium text-foreground'
            )}
          >
            {vehicleInfo.name}
          </h3>

          <div className='mt-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
            <span className='font-mono'>{vehicleInfo.lotNo}</span>
            <span className='text-muted-foreground/40'>•</span>
            <span className='truncate'>{vehicleInfo.auctionHouse}</span>
          </div>

          <div className='mt-3 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='size-6 rounded-full bg-primary/10 flex items-center justify-center'>
                <span className='text-[10px] font-medium text-primary'>
                  {request.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className='text-xs text-muted-foreground truncate max-w-[70px]'>
                {request.customerName.split(' ')[0]}
              </span>
            </div>
            {isCompleted ? (
              <Badge variant='emerald' className='text-[10px]'>
                <MdCheckCircle className='h-3 w-3 mr-1' />
                Done
              </Badge>
            ) : (
              <span
                className={cn(
                  'flex items-center gap-1 text-xs',
                  getTimeBadgeStyle(request.createdAt)
                )}
              >
                <MdAccessTime className='h-3 w-3' />
                {getWaitTime(request.createdAt)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
