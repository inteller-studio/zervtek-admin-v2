'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { Bid } from '../data/bids'
import {
  UNIQUE_STATUSES,
  UNIQUE_TYPES,
  UNIQUE_BIDDER_TYPES,
  UNIQUE_AUCTION_STATUSES,
  DEFAULT_AMOUNT_RANGE,
} from '../types'

interface BidsFiltersPanelProps {
  isOpen: boolean
  selectedStatuses: Bid['status'][]
  selectedTypes: Bid['type'][]
  selectedBidderTypes: Bid['bidder']['type'][]
  selectedAuctionStatuses: Bid['auctionStatus'][]
  amountRange: [number, number]
  onlyWinning: boolean
  onStatusChange: (statuses: Bid['status'][]) => void
  onTypeChange: (types: Bid['type'][]) => void
  onBidderTypeChange: (types: Bid['bidder']['type'][]) => void
  onAuctionStatusChange: (statuses: Bid['auctionStatus'][]) => void
  onAmountRangeChange: (range: [number, number]) => void
  onOnlyWinningChange: (value: boolean) => void
}

export function BidsFiltersPanel({
  isOpen,
  selectedStatuses,
  selectedTypes,
  selectedBidderTypes,
  selectedAuctionStatuses,
  amountRange,
  onlyWinning,
  onStatusChange,
  onTypeChange,
  onBidderTypeChange,
  onAuctionStatusChange,
  onAmountRangeChange,
  onOnlyWinningChange,
}: BidsFiltersPanelProps) {
  const handleStatusToggle = (status: Bid['status'], checked: boolean) => {
    if (checked) {
      onStatusChange([...selectedStatuses, status])
    } else {
      onStatusChange(selectedStatuses.filter((s) => s !== status))
    }
  }

  const handleTypeToggle = (type: Bid['type'], checked: boolean) => {
    if (checked) {
      onTypeChange([...selectedTypes, type])
    } else {
      onTypeChange(selectedTypes.filter((t) => t !== type))
    }
  }

  const handleBidderTypeToggle = (type: Bid['bidder']['type'], checked: boolean) => {
    if (checked) {
      onBidderTypeChange([...selectedBidderTypes, type])
    } else {
      onBidderTypeChange(selectedBidderTypes.filter((t) => t !== type))
    }
  }

  const handleAuctionStatusToggle = (status: Bid['auctionStatus'], checked: boolean) => {
    if (checked) {
      onAuctionStatusChange([...selectedAuctionStatuses, status])
    } else {
      onAuctionStatusChange(selectedAuctionStatuses.filter((s) => s !== status))
    }
  }

  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent>
        <Card>
          <CardContent className='pt-6'>
            <div className='grid gap-6 md:grid-cols-3 lg:grid-cols-5'>
              {/* Status Filter */}
              <div className='space-y-3'>
                <Label>Bid Status</Label>
                <div className='space-y-2'>
                  {UNIQUE_STATUSES.map((status) => (
                    <div key={status} className='flex items-center space-x-2'>
                      <Checkbox
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={(checked) =>
                          handleStatusToggle(status, checked as boolean)
                        }
                      />
                      <Label className='cursor-pointer text-sm font-normal capitalize'>
                        {status.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div className='space-y-3'>
                <Label>Bid Type</Label>
                <div className='space-y-2'>
                  {UNIQUE_TYPES.map((type) => (
                    <div key={type} className='flex items-center space-x-2'>
                      <Checkbox
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={(checked) => handleTypeToggle(type, checked as boolean)}
                      />
                      <Label className='cursor-pointer text-sm font-normal capitalize'>
                        {type === 'assisted' ? 'Assisted' : 'Manual'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bidder Type Filter */}
              <div className='space-y-3'>
                <Label>Bidder Type</Label>
                <div className='space-y-2'>
                  {UNIQUE_BIDDER_TYPES.map((type) => (
                    <div key={type} className='flex items-center space-x-2'>
                      <Checkbox
                        checked={selectedBidderTypes.includes(type)}
                        onCheckedChange={(checked) =>
                          handleBidderTypeToggle(type, checked as boolean)
                        }
                      />
                      <Label className='cursor-pointer text-sm font-normal capitalize'>
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auction Status Filter */}
              <div className='space-y-3'>
                <Label>Auction Status</Label>
                <div className='space-y-2'>
                  {UNIQUE_AUCTION_STATUSES.map((status) => (
                    <div key={status} className='flex items-center space-x-2'>
                      <Checkbox
                        checked={selectedAuctionStatuses.includes(status)}
                        onCheckedChange={(checked) =>
                          handleAuctionStatusToggle(status, checked as boolean)
                        }
                      />
                      <Label className='cursor-pointer text-sm font-normal capitalize'>
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount Range */}
              <div className='space-y-3'>
                <Label>
                  Bid Amount: ¥{amountRange[0].toLocaleString()} - ¥{amountRange[1].toLocaleString()}
                </Label>
                <Slider
                  value={amountRange}
                  onValueChange={(value) => onAmountRangeChange(value as [number, number])}
                  min={0}
                  max={DEFAULT_AMOUNT_RANGE[1]}
                  step={100000}
                  className='w-full'
                />
                <div className='flex items-center space-x-2 pt-2'>
                  <Checkbox
                    checked={onlyWinning}
                    onCheckedChange={(checked) => onOnlyWinningChange(checked as boolean)}
                  />
                  <Label className='cursor-pointer text-sm font-normal'>Only Winning Bids</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}
