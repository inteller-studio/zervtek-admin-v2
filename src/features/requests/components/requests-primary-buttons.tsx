import { Button } from '@/components/ui/button'
import { MdAdd, MdDownload, MdFilterList, MdTv } from 'react-icons/md'
import Link from 'next/link'

export function RequestsPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm' asChild>
        <Link href='/requests/tv-display'>
          <MdTv className='mr-2 h-4 w-4' />
          TV Display
        </Link>
      </Button>
      <Button variant='outline' size='sm'>
        <MdFilterList className='mr-2 h-4 w-4' />
        Filter
      </Button>
      <Button variant='outline' size='sm'>
        <MdDownload className='mr-2 h-4 w-4' />
        Export
      </Button>
      <Button size='sm'>
        <MdAdd className='mr-2 h-4 w-4' />
        New Request
      </Button>
    </div>
  )
}
