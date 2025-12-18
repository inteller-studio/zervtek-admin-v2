'use client'

import { Eye, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ModalMode = 'overview' | 'workflow'

interface ModeToggleProps {
  mode: ModalMode
  onModeChange: (mode: ModalMode) => void
  workflowProgress?: number
}

export function ModeToggle({
  mode,
  onModeChange,
  workflowProgress = 0,
}: ModeToggleProps) {
  return (
    <div className='flex rounded-lg border bg-muted/50 p-1'>
      <button
        onClick={() => onModeChange('overview')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          mode === 'overview'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Eye className='h-4 w-4' />
        <span className='hidden sm:inline'>Overview</span>
      </button>
      <button
        onClick={() => onModeChange('workflow')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          mode === 'workflow'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <ClipboardList className='h-4 w-4' />
        <span className='hidden sm:inline'>Workflow</span>
        {workflowProgress > 0 && workflowProgress < 100 && (
          <span className='ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary'>
            {workflowProgress}%
          </span>
        )}
        {workflowProgress === 100 && (
          <span className='ml-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-600'>
            Done
          </span>
        )}
      </button>
    </div>
  )
}
