'use client'

import { format } from 'date-fns'
import {
  MdAccessTime,
  MdVisibility,
  MdTag,
  MdTrendingDown,
  MdTrendingUp,
  MdPerson,
  MdManageAccounts,
} from 'react-icons/md'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Bid } from '../data/bids'
import { getStatusVariant, getStatusLabel, getTimeRemaining } from '../types'

interface BidsCardViewProps {
  bids: Bid[]
  onViewBid: (bid: Bid) => void
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'manual':
      return <MdPerson className='h-3 w-3' />
    case 'assisted':
      return <MdManageAccounts className='h-3 w-3' />
    default:
      return null
  }
}

function getBidderLevelClasses(level: string) {
  switch (level) {
    case 'business_premium':
      return 'border-purple-500 bg-purple-50 text-purple-700'
    case 'business':
      return 'border-blue-500 bg-blue-50 text-blue-700'
    case 'premium':
      return 'border-amber-500 bg-amber-50 text-amber-700'
    case 'verified':
      return 'border-green-500 bg-green-50 text-green-700'
    default:
      return 'border-slate-400 bg-slate-50 text-slate-600'
  }
}

function formatBidderLevel(level: string) {
  if (level === 'business_premium') return 'Business Premium'
  return level.charAt(0).toUpperCase() + level.slice(1)
}

export function BidsCardView({ bids, onViewBid }: BidsCardViewProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {bids.map((bid) => (
        <Card key={bid.id} className='overflow-hidden transition-shadow hover:shadow-lg'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <MdTag className='h-4 w-4 text-muted-foreground' />
                  {bid.bidNumber}
                </CardTitle>
                <CardDescription className='mt-1'>
                  {format(bid.timestamp, 'MMM dd, yyyy h:mm a')}
                </CardDescription>
              </div>
              <Badge variant={getStatusVariant(bid.status) as any}>
                {getStatusLabel(bid.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Vehicle Info */}
            <div>
              <p className='line-clamp-1 text-sm font-semibold'>{bid.auctionTitle}</p>
              <p className='text-sm text-muted-foreground'>
                {bid.auctionHouse} • Lot #{bid.lotNumber}
              </p>
            </div>

            {/* Bid Amount */}
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-primary'>
                  ¥{bid.amount.toLocaleString()}
                </p>
              </div>
              <div className='text-right'>
                <div className='flex items-center gap-1 text-sm'>
                  {getTypeIcon(bid.type)}
                  <span className='capitalize'>
                    {bid.type === 'assisted' ? 'Assisted' : 'Manual'}
                  </span>
                </div>
                {bid.status === 'winning' && (
                  <div className='mt-1 flex items-center gap-1 text-xs text-green-600'>
                    <MdTrendingUp className='h-3 w-3' />
                    Leading
                  </div>
                )}
                {bid.status === 'outbid' && (
                  <div className='mt-1 flex items-center gap-1 text-xs text-orange-600'>
                    <MdTrendingDown className='h-3 w-3' />
                    Outbid by ¥{(bid.currentHighBid - bid.amount).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Bidder Info */}
            <div className='border-t pt-3'>
              <div className='flex items-center justify-between text-sm'>
                <div>
                  <p className='font-medium'>{bid.bidder.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {bid.bidder.type} • {bid.bidder.location}
                  </p>
                  {bid.type === 'assisted' && (
                    <div className='mt-1 flex items-center gap-1'>
                      <Badge variant='outline' className='text-xs'>
                        Assisted
                      </Badge>
                      <span className='text-xs text-muted-foreground'>by {bid.assistedBy}</span>
                    </div>
                  )}
                </div>
                <Badge variant='outline' className={getBidderLevelClasses(bid.bidder.level)}>
                  {formatBidderLevel(bid.bidder.level)}
                </Badge>
              </div>
            </div>

            {/* Auction Info */}
            <div className='flex items-center justify-between border-t pt-3'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-xs'>
                  {bid.auctionStatus}
                </Badge>
                {bid.timeRemaining && bid.auctionStatus === 'live' && (
                  <span className='flex items-center gap-1 text-xs text-slate-700'>
                    <MdAccessTime className='h-3 w-3' />
                    {getTimeRemaining(bid.timeRemaining)}
                  </span>
                )}
              </div>
              <Button variant='ghost' size='sm' onClick={() => onViewBid(bid)}>
                <MdVisibility className='h-4 w-4' />
                <span className='ml-1 text-xs'>View</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
