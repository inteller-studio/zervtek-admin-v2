import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MdDownload, MdFilterList, MdPanTool } from 'react-icons/md'

export function BidsPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm'>
        <MdFilterList className='mr-2 h-4 w-4' />
        Filter
      </Button>
      <Button variant='outline' size='sm'>
        <MdDownload className='mr-2 h-4 w-4' />
        Export
      </Button>
      <Button size='sm' asChild>
        <Link href='/bids/place-bid'>
          <MdPanTool className='mr-2 h-4 w-4' />
          Assist Customer Bid
        </Link>
      </Button>
    </div>
  )
}
