import { Button } from '@/components/ui/button'
import { Plus, Download, RefreshCw } from 'lucide-react'

export function MakesPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm'>
        <RefreshCw className='mr-2 h-4 w-4' />
        Refresh SEO
      </Button>
      <Button variant='outline' size='sm'>
        <Download className='mr-2 h-4 w-4' />
        Export
      </Button>
      <Button size='sm'>
        <Plus className='mr-2 h-4 w-4' />
        Add Make
      </Button>
    </div>
  )
}
