'use client'

import { Construction } from 'lucide-react'

interface MaintenanceOverlayProps {
  title?: string
  message?: string
}

export function MaintenanceOverlay({
  title = 'Under Maintenance',
  message = 'This section is currently under maintenance. Please check back later.',
}: MaintenanceOverlayProps) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm'>
      <div className='text-center'>
        <Construction className='mx-auto h-16 w-16 text-muted-foreground' />
        <h1 className='mt-4 text-2xl font-bold tracking-tight'>{title}</h1>
        <p className='mt-2 text-sm text-muted-foreground'>{message}</p>
      </div>
    </div>
  )
}
