'use client'

import { isToday } from 'date-fns'
import { MdCalendarToday } from 'react-icons/md'
import { Card, CardContent } from '@/components/ui/card'
import type { ServiceRequest } from '../../requests/data/requests'
import { ServiceTaskCard } from './service-task-card'

interface VehicleInfo {
  name: string
  lotNo: string
  auctionHouse: string
  time: string
  grade: string
  image: string
}

interface ServiceTasksGridProps {
  requests: ServiceRequest[]
  selectedDate: Date
  getVehicleInfo: (request: ServiceRequest) => VehicleInfo
  onCardClick: (request: ServiceRequest) => void
}

export function ServiceTasksGrid({
  requests,
  selectedDate,
  getVehicleInfo,
  onCardClick,
}: ServiceTasksGridProps) {
  if (requests.length === 0) {
    return (
      <Card className='rounded-xl border-dashed border-2 border-border/40 shadow-none'>
        <CardContent className='flex flex-col items-center justify-center py-20 gap-4'>
          <div className='size-20 rounded-full bg-muted/50 flex items-center justify-center'>
            <MdCalendarToday className='h-10 w-10 text-muted-foreground/40' />
          </div>
          <div className='text-center space-y-1'>
            <p className='text-base font-medium text-muted-foreground'>No tasks for this day</p>
            <p className='text-sm text-muted-foreground/70'>
              {isToday(selectedDate) ? 'All caught up!' : 'Select another day to view tasks'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
      {requests.map((request, index) => (
        <ServiceTaskCard
          key={request.id}
          request={request}
          vehicleInfo={getVehicleInfo(request)}
          index={index}
          onClick={() => onCardClick(request)}
        />
      ))}
    </div>
  )
}
