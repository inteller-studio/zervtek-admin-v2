import { Button } from '@/components/ui/button'
import { MdAdd, MdDownload, MdFilterList } from 'react-icons/md'

export function VehiclesPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button variant='outline'>
        <MdFilterList className='mr-2 h-4 w-4' />
        Filter
      </Button>
      <Button variant='outline'>
        <MdDownload className='mr-2 h-4 w-4' />
        Export
      </Button>
      <Button>
        <MdAdd className='mr-2 h-4 w-4' />
        Add Vehicle
      </Button>
    </div>
  )
}
