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
import { MoreHorizontal, Eye, Edit, Trash2, Gavel } from 'lucide-react'
import { type Auction } from '../data/auctions'
import { format } from 'date-fns'

interface AuctionsTableProps {
  data: Auction[]
}

const getStatusBadge = (status: Auction['status']) => {
  const variants: Record<Auction['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    draft: { variant: 'outline', className: 'text-gray-600' },
    scheduled: { variant: 'secondary', className: 'text-blue-600 bg-blue-100' },
    active: { variant: 'default', className: 'text-green-600 bg-green-100' },
    ended: { variant: 'secondary', className: 'text-yellow-600 bg-yellow-100' },
    sold: { variant: 'default', className: 'text-purple-600 bg-purple-100' },
    cancelled: { variant: 'destructive', className: '' },
  }

  return (
    <Badge className={variants[status].className} variant={variants[status].variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function AuctionsTable({ data }: AuctionsTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Auction ID</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Starting Bid</TableHead>
            <TableHead>Current Bid</TableHead>
            <TableHead>Bids</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 20).map((auction) => (
            <TableRow key={auction.id}>
              <TableCell className='font-medium'>{auction.auctionId}</TableCell>
              <TableCell>
                <div>
                  <p className='font-medium'>
                    {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
                  </p>
                  <p className='text-sm text-muted-foreground'>{auction.vehicleInfo.color}</p>
                </div>
              </TableCell>
              <TableCell>${auction.startingBid.toLocaleString()}</TableCell>
              <TableCell className='font-medium'>${auction.currentBid.toLocaleString()}</TableCell>
              <TableCell>
                <div className='flex items-center gap-1'>
                  <Gavel className='h-3 w-3 text-muted-foreground' />
                  {auction.totalBids}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(auction.status)}</TableCell>
              <TableCell>{format(auction.endTime, 'MMM dd, yyyy HH:mm')}</TableCell>
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
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit Auction
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-destructive'>
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
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
