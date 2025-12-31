'use client'

import { MdMessage, MdSettings } from 'react-icons/md'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface IconSidebarProps {
  isOnline?: boolean
}

export function IconSidebar({ isOnline }: IconSidebarProps) {
  return (
    <div className='flex w-16 flex-shrink-0 flex-col items-center border-r bg-card py-4'>
      {/* Chats Icon */}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-12 w-12 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
            >
              <MdMessage className='h-5 w-5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='right' sideOffset={8}>
            Chats
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Spacer */}
      <div className='flex-1' />

      {/* Status Indicator */}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='mb-3 flex items-center justify-center'>
              <div
                className={cn(
                  'h-3 w-3 rounded-full transition-colors',
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side='right' sideOffset={8}>
            {isOnline ? 'Connected' : 'Disconnected'}
          </TooltipContent>
        </Tooltip>

        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-12 w-12 rounded-xl text-muted-foreground transition-all hover:bg-muted hover:text-foreground'
            >
              <MdSettings className='h-5 w-5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='right' sideOffset={8}>
            Settings
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
