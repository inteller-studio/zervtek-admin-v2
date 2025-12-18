'use client'

import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { WORKFLOW_STAGES } from '../../../types/workflow'

interface StageProgressProps {
  currentStage: number
  completedStages: number[]
  onStageClick?: (stageNumber: number) => void
  variant?: 'dots' | 'steps' | 'compact'
}

export function StageProgress({
  currentStage,
  completedStages,
  onStageClick,
  variant = 'dots',
}: StageProgressProps) {
  const isCompleted = (stage: number) => completedStages.includes(stage)
  const isCurrent = (stage: number) => stage === currentStage
  const isAccessible = (stage: number) => {
    if (stage === 1) return true
    return completedStages.includes(stage - 1)
  }

  if (variant === 'compact') {
    return (
      <div className='flex items-center gap-1'>
        {WORKFLOW_STAGES.map((stage) => {
          const completed = isCompleted(stage.number)
          const current = isCurrent(stage.number)
          const accessible = isAccessible(stage.number)

          return (
            <Tooltip key={stage.number}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => accessible && onStageClick?.(stage.number)}
                  disabled={!accessible}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    completed && 'bg-emerald-500',
                    current && !completed && 'bg-primary ring-2 ring-primary/30',
                    !completed && !current && accessible && 'bg-muted-foreground/30',
                    !accessible && 'bg-muted cursor-not-allowed'
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side='bottom'>
                <p className='font-medium'>{stage.label}</p>
                <p className='text-xs text-muted-foreground'>
                  {completed ? 'Completed' : current ? 'In Progress' : accessible ? 'Pending' : 'Locked'}
                </p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    )
  }

  if (variant === 'steps') {
    return (
      <div className='flex items-center'>
        {WORKFLOW_STAGES.map((stage, index) => {
          const completed = isCompleted(stage.number)
          const current = isCurrent(stage.number)
          const accessible = isAccessible(stage.number)

          return (
            <div key={stage.number} className='flex items-center'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => accessible && onStageClick?.(stage.number)}
                    disabled={!accessible}
                    className={cn(
                      'flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium transition-all',
                      completed && 'bg-emerald-500 text-white',
                      current && !completed && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                      !completed && !current && accessible && 'bg-muted text-muted-foreground hover:bg-muted/80',
                      !accessible && 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                    )}
                  >
                    {completed ? (
                      <Check className='h-4 w-4' />
                    ) : !accessible ? (
                      <Lock className='h-3 w-3' />
                    ) : (
                      stage.number
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{stage.label}</p>
                </TooltipContent>
              </Tooltip>
              {index < WORKFLOW_STAGES.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-4 mx-1',
                    completed ? 'bg-emerald-500' : 'bg-muted'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Default dots variant
  return (
    <div className='flex items-center gap-2'>
      {WORKFLOW_STAGES.map((stage) => {
        const completed = isCompleted(stage.number)
        const current = isCurrent(stage.number)
        const accessible = isAccessible(stage.number)

        return (
          <Tooltip key={stage.number}>
            <TooltipTrigger asChild>
              <button
                onClick={() => accessible && onStageClick?.(stage.number)}
                disabled={!accessible}
                className={cn(
                  'flex items-center justify-center h-6 w-6 rounded-full transition-all',
                  completed && 'bg-emerald-500 text-white',
                  current && !completed && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                  !completed && !current && accessible && 'bg-muted text-muted-foreground hover:bg-muted/80',
                  !accessible && 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                )}
              >
                {completed ? (
                  <Check className='h-3.5 w-3.5' />
                ) : !accessible ? (
                  <Lock className='h-3 w-3' />
                ) : (
                  <span className='text-xs font-medium'>{stage.number}</span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side='bottom'>
              <p className='font-medium'>{stage.label}</p>
              <p className='text-xs text-muted-foreground'>
                {completed ? 'Completed' : current ? 'In Progress' : accessible ? 'Pending' : 'Locked'}
              </p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
