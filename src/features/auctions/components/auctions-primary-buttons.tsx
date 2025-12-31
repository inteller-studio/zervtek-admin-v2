import { MdAdd, MdDownload } from 'react-icons/md'
import { Button } from '@/components/ui/button'

export function AuctionsPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm'>
        <MdDownload className='mr-2 h-4 w-4' />
        Export
      </Button>
      <Button size='sm'>
        <MdAdd className='mr-2 h-4 w-4' />
        Create Auction
      </Button>
    </div>
  )
}
