'use client'

import { format } from 'date-fns'
import {
  MdBlock,
  MdCheck,
  MdNotInterested,
  MdAccessTime,
  MdVisibility,
  MdHelpOutline,
  MdHandshake,
  MdHelp,
  MdMessage,
  MdMoreHoriz,
  MdEmojiEvents,
  MdPerson,
  MdManageAccounts,
  MdGroup,
  MdCancel,
} from 'react-icons/md'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Bid } from '../data/bids'
import type { BidActionType } from '../types'
import { getStatusVariant, getStatusLabel, getTimeRemaining } from '../types'

interface BidsTableViewProps {
  bids: Bid[]
  onViewBid: (bid: Bid) => void
  onApprove: (bid: Bid) => void
  onDecline: (bid: Bid) => void
  onMarkWon: (bid: Bid, type: BidActionType) => void
  onSoldToOthers: (bid: Bid) => void
  onMarkUnsold: (bid: Bid) => void
  onBidCanceled: (bid: Bid) => void
  onAuctionCancelled: (bid: Bid) => void
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

export function BidsTableView({
  bids,
  onViewBid,
  onApprove,
  onDecline,
  onMarkWon,
  onSoldToOthers,
  onMarkUnsold,
  onBidCanceled,
  onAuctionCancelled,
}: BidsTableViewProps) {
  return (
    <Card>
      <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Auction</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Bidder</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Auction Status</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bids.map((bid) => (
              <TableRow
                key={bid.id}
                className='cursor-pointer'
                onClick={() => onViewBid(bid)}
              >
                <TableCell>
                  <div>
                    <p className='font-medium'>Lot {bid.lotNumber}</p>
                    <p className='text-sm font-medium'>{bid.auctionHouse}</p>
                    <p className='text-sm'>{format(bid.timestamp, 'MMM dd, yyyy')}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className='line-clamp-1 font-medium'>{bid.auctionTitle}</p>
                </TableCell>
                <TableCell>
                  <div>
                    <p className='font-medium'>{bid.bidder.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {bid.bidder.type} • {bid.bidder.location}
                    </p>
                    {bid.bidder.depositAmount > 0 && (
                      <p className='mt-1 text-xs text-muted-foreground'>
                        Deposit: ¥{bid.bidder.depositAmount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className='font-semibold'>¥{bid.amount.toLocaleString()}</p>
                </TableCell>
                <TableCell>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Badge variant={getStatusVariant(bid.status) as any}>
                    {getStatusLabel(bid.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className='flex items-center gap-1'>
                      {getTypeIcon(bid.type)}
                      <span className='text-sm capitalize'>
                        {bid.type === 'assisted' ? 'Assisted' : 'Manual'}
                      </span>
                    </div>
                    {bid.type === 'assisted' && bid.assistedBy && (
                      <p className='mt-0.5 text-xs text-muted-foreground'>
                        by {bid.assistedBy}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell className='text-right'>
                  {bid.status === 'pending_approval' ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant='ghost' size='icon' className='h-7 w-7'>
                          <MdMoreHoriz className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          className='text-green-600'
                          onClick={(e) => {
                            e.stopPropagation()
                            onApprove(bid)
                          }}
                        >
                          <MdCheck className='mr-2 h-4 w-4' />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-red-600'
                          onClick={(e) => {
                            e.stopPropagation()
                            onDecline(bid)
                          }}
                        >
                          <MdCancel className='mr-2 h-4 w-4' />
                          Decline
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : bid.status === 'active' || bid.status === 'winning' ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant='ghost' size='icon' className='h-7 w-7'>
                          <MdMoreHoriz className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-48'>
                        <DropdownMenuLabel className='text-xs'>Won Results</DropdownMenuLabel>
                        <DropdownMenuItem
                          className='text-green-600'
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkWon(bid, 'bid_accepted')
                          }}
                        >
                          <MdEmojiEvents className='mr-2 h-4 w-4' />
                          Bid Accepted
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-green-600'
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkWon(bid, 'contract')
                          }}
                        >
                          <MdHandshake className='mr-2 h-4 w-4' />
                          Contract
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-green-600'
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkWon(bid, 'contract_nego')
                          }}
                        >
                          <MdMessage className='mr-2 h-4 w-4' />
                          Contract by Nego
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className='text-xs'>Lost Results</DropdownMenuLabel>
                        <DropdownMenuItem
                          className='text-red-600'
                          onClick={(e) => {
                            e.stopPropagation()
                            onSoldToOthers(bid)
                          }}
                        >
                          <MdGroup className='mr-2 h-4 w-4' />
                          Sold to Others
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-orange-600'
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkUnsold(bid)
                          }}
                        >
                          <MdNotInterested className='mr-2 h-4 w-4' />
                          Unsold
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className='text-xs'>Other</DropdownMenuLabel>
                        <DropdownMenuItem
                          className='text-slate-600'
                          onClick={(e) => {
                            e.stopPropagation()
                            onBidCanceled(bid)
                          }}
                        >
                          <MdCancel className='mr-2 h-4 w-4' />
                          Bid Canceled
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-slate-600'
                          onClick={(e) => {
                            e.stopPropagation()
                            onAuctionCancelled(bid)
                          }}
                        >
                          <MdBlock className='mr-2 h-4 w-4' />
                          Auction Cancelled
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-slate-500'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MdHelpOutline className='mr-2 h-4 w-4' />
                          Result
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-slate-500'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MdHelp className='mr-2 h-4 w-4' />
                          Unknown
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 w-7 p-0'
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewBid(bid)
                      }}
                    >
                      <MdVisibility className='h-4 w-4' />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
