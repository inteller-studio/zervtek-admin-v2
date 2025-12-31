'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { MdAccessTime } from 'react-icons/md'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { type Auction } from '../data/auctions'

interface AuctionCardProps {
  auction: Auction
  onViewDetails: (auction: Auction) => void
}

// Format price in JPY
const formatPrice = (price: number) => {
  return `¥${price.toLocaleString()}`
}

export function AuctionCard({
  auction,
  onViewDetails,
}: AuctionCardProps) {
  const isActive = auction.status === 'active'
  const timeRemaining = isActive
    ? formatDistanceToNow(new Date(auction.endTime), { addSuffix: false })
    : null

  return (
    <Card
      className='group cursor-pointer overflow-hidden transition-all hover:shadow-md !py-0 !gap-0'
      onClick={() => onViewDetails(auction)}
    >
      <CardContent className='p-0'>
        {/* Image Section - Use 2nd image as main if available */}
        <div className='relative h-44 w-full overflow-hidden bg-muted'>
          {auction.vehicleInfo.images.length > 0 ? (
            <img
              src={auction.vehicleInfo.images[1] || auction.vehicleInfo.images[0]}
              alt={`${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`}
              className='h-full w-full object-cover transition-transform group-hover:scale-105'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-muted'>
              <span className='text-muted-foreground'>No Image</span>
            </div>
          )}
          {isActive && timeRemaining && (
            <div className='absolute right-2 top-2'>
              <Badge variant='secondary' className='flex items-center gap-1 bg-black/70 text-white'>
                <MdAccessTime className='h-3 w-3' />
                {timeRemaining}
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className='p-4'>
          {/* Title */}
          <div>
            <h3 className='truncate text-sm font-semibold'>
              {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
            </h3>
            <p className='truncate text-xs text-muted-foreground'>
              {auction.vehicleInfo.grade || auction.auctionId}
            </p>
          </div>

          {/* Vehicle Info */}
          <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
            <span>{auction.vehicleInfo.mileageDisplay}</span>
            <span className='text-muted-foreground/50'>•</span>
            <span>{auction.vehicleInfo.transmission}</span>
            <span className='text-muted-foreground/50'>•</span>
            <span>{auction.vehicleInfo.color}</span>
          </div>

          {/* Price & Auction Info */}
          <div className='mt-3 border-t pt-3'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-xs text-muted-foreground'>Starting Price</p>
                <p className='text-lg font-bold'>
                  {formatPrice(auction.startingBid)}
                </p>
              </div>
              <div className='text-right text-xs space-y-0.5'>
                <p>
                  <span className='text-muted-foreground'>Lot:</span>{' '}
                  <span className='font-medium'>{auction.lotNumber}</span>
                </p>
                <p>
                  <span className='text-muted-foreground'>House:</span>{' '}
                  <span className='font-medium'>{auction.auctionHouse}</span>
                </p>
                <p>
                  <span className='text-muted-foreground'>Date:</span>{' '}
                  <span className='font-medium'>{format(new Date(auction.startTime), 'MMM d')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
