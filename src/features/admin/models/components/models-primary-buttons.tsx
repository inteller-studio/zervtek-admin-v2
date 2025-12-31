import { Button } from '@/components/ui/button'
import { MdAdd, MdDownload, MdRefresh } from 'react-icons/md'

export function ModelsPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm'>
        <MdRefresh className='mr-2 h-4 w-4' />
        Refresh SEO
      </Button>
      <Button variant='outline' size='sm'>
        <MdDownload className='mr-2 h-4 w-4' />
        Export
      </Button>
      <Button size='sm'>
        <MdAdd className='mr-2 h-4 w-4' />
        Add Model
      </Button>
    </div>
  )
}
