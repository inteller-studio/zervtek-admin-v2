import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, XCircle, Hand } from 'lucide-react'
import { type Bid } from '../data/bids'
import { format } from 'date-fns'

interface BidsTableProps {
  data: Bid[]
}

const getStatusBadge = (status: Bid['status']) => {
  const variants: Record<Bid['status'], string> = {
    pending_approval: 'text-amber-600 bg-amber-100',
    active: 'text-blue-600 bg-blue-100',
    outbid: 'text-orange-600 bg-orange-100',
    winning: 'text-green-600 bg-green-100',
    won: 'text-purple-600 bg-purple-100',
    lost: 'text-gray-600 bg-gray-100',
    declined: 'text-red-600 bg-red-100',
    retracted: 'text-red-600 bg-red-100',
    expired: 'text-yellow-600 bg-yellow-100',
  }

  return (
    <Badge className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function BidsTable({ data }: BidsTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bid ID</TableHead>
            <TableHead>Auction</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Bidder</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bid Time</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 20).map((bid) => (
            <TableRow key={bid.id}>
              <TableCell className='font-medium'>{bid.bidNumber}</TableCell>
              <TableCell className='text-muted-foreground'>{bid.auctionId}</TableCell>
              <TableCell>
                <div>
                  <p className='font-medium'>
                    {bid.vehicle.year} {bid.vehicle.make}
                  </p>
                  <p className='text-sm text-muted-foreground'>{bid.vehicle.model}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className='font-medium'>{bid.bidder.name}</p>
                  <p className='text-sm text-muted-foreground'>{bid.bidder.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className='font-medium'>${bid.amount.toLocaleString()}</p>
                  {bid.type === 'assisted' && (
                    <Badge variant='outline' className='text-xs'>Auto</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(bid.status)}</TableCell>
              <TableCell>{format(bid.timestamp, 'MMM dd, HH:mm')}</TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Eye className='mr-2 h-4 w-4' />
                      View Auction
                    </DropdownMenuItem>
                    {(bid.status === 'active' || bid.status === 'winning') && (
                      <DropdownMenuItem>
                        <Hand className='mr-2 h-4 w-4' />
                        Increase Bid
                      </DropdownMenuItem>
                    )}
                    {bid.status === 'active' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='text-destructive'>
                          <XCircle className='mr-2 h-4 w-4' />
                          Cancel Bid
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
