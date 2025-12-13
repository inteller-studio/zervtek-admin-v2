'use client'

import { format, formatDistanceToNow } from 'date-fns'
import {
  Gavel,
  Clock,
  TrendingUp,
  MapPin,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { type Auction } from '../data/auctions'

interface AuctionCardProps {
  auction: Auction
  onViewDetails: (auction: Auction) => void
}

const getStatusColor = (status: Auction['status']) => {
  const colors: Record<Auction['status'], string> = {
    draft: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    scheduled: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    ended: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    sold: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
  }
  return colors[status] || ''
}

const getStatusLabel = (status: Auction['status']) => {
  const labels: Record<Auction['status'], string> = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    active: 'Active',
    ended: 'Ended',
    sold: 'Sold',
    cancelled: 'Cancelled',
  }
  return labels[status] || status
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

  const bidIncreasePercent =
    auction.currentBid > auction.startingBid
      ? Math.round(((auction.currentBid - auction.startingBid) / auction.startingBid) * 100)
      : 0

  return (
    <Card
      className='group cursor-pointer overflow-hidden transition-all hover:shadow-md'
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
          <div className='absolute left-2 top-2'>
            <Badge variant='outline' className={`${getStatusColor(auction.status)}`}>
              {getStatusLabel(auction.status)}
            </Badge>
          </div>
          {isActive && timeRemaining && (
            <div className='absolute right-2 top-2'>
              <Badge variant='secondary' className='flex items-center gap-1 bg-black/70 text-white'>
                <Clock className='h-3 w-3' />
                {timeRemaining}
              </Badge>
            </div>
          )}
          {/* Location badge */}
          <div className='absolute bottom-2 left-2'>
            <Badge variant='secondary' className='flex items-center gap-1 bg-black/60 text-white'>
              <MapPin className='h-3 w-3' />
              {auction.location}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className='p-4'>
          {/* Title */}
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='truncate text-sm font-semibold'>
                {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
              </h3>
              <Badge variant='outline' className='text-[10px] shrink-0'>
                {auction.lotNumber}
              </Badge>
            </div>
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

          {/* Bid Info */}
          <div className='mt-3 border-t pt-3'>
            <p className='text-xs text-muted-foreground'>Current Bid</p>
            <div className='flex items-center gap-1'>
              <p className='text-lg font-bold'>
                {formatPrice(auction.currentBid)}
              </p>
              {bidIncreasePercent > 0 && (
                <Badge variant='secondary' className='flex items-center gap-0.5 text-[10px] text-green-600'>
                  <TrendingUp className='h-2.5 w-2.5' />
                  +{bidIncreasePercent}%
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className='mt-3 flex items-center gap-4 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Gavel className='h-3 w-3' />
              <span>{auction.totalBids} bids</span>
            </div>
            <div className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              <span>{format(new Date(auction.endTime), 'MMM d')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
