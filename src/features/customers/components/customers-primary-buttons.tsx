import { Button } from '@/components/ui/button'
import { Plus, Download, Upload } from 'lucide-react'

export function CustomersPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm'>
        <Upload className='mr-2 h-4 w-4' />
        Import
      </Button>
      <Button variant='outline' size='sm'>
        <Download className='mr-2 h-4 w-4' />
        Export
      </Button>
      <Button size='sm'>
        <Plus className='mr-2 h-4 w-4' />
        Add Customer
      </Button>
    </div>
  )
}
