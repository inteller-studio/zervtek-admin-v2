import { Button } from '@/components/ui/button'
import { Plus, Download, Filter } from 'lucide-react'

export function BlogsPrimaryButtons() {
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
      <Button size='sm'>
        <Plus className='mr-2 h-4 w-4' />
        New Post
      </Button>
    </div>
  )
}
