import { Button } from '@/components/ui/button'
import { MdAdd, MdDownload, MdFilterList } from 'react-icons/md'

export function BlogsPrimaryButtons() {
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
      <Button size='sm'>
        <MdAdd className='mr-2 h-4 w-4' />
        New Post
      </Button>
    </div>
  )
}
