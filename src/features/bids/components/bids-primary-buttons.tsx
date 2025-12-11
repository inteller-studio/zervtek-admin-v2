import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Download, Filter, Hand } from 'lucide-react'

export function BidsPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm'>
        <Filter className='mr-2 h-4 w-4' />
        Filter
      </Button>
      <Button variant='outline' size='sm'>
        <Download className='mr-2 h-4 w-4' />
        Export
      </Button>
      <Button size='sm' asChild>
        <Link href='/bids/place-bid'>
          <Hand className='mr-2 h-4 w-4' />
          Assist Customer Bid
        </Link>
      </Button>
    </div>
  )
}
