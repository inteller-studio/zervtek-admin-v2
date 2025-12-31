import { Button } from '@/components/ui/button'
import { MdAdd, MdDownload, MdUpload } from 'react-icons/md'

export function CustomersPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm'>
        <MdUpload className='mr-2 h-4 w-4' />
        Import
      </Button>
      <Button variant='outline' size='sm'>
        <MdDownload className='mr-2 h-4 w-4' />
        Export
      </Button>
      <Button size='sm'>
        <MdAdd className='mr-2 h-4 w-4' />
        Add Customer
      </Button>
    </div>
  )
}
