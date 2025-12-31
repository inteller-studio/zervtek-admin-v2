'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { type PurchaseWorkflow } from '../../types/workflow'
import { isStageComplete, canAccessStage } from '../../utils/workflow'

const STAGES = [
  { number: 1, label: 'Purchase' },
  { number: 2, label: 'Transport' },
  { number: 3, label: 'Payment' },
  { number: 4, label: 'Repair' },
  { number: 5, label: 'Docs' },
  { number: 6, label: 'Booking' },
  { number: 7, label: 'Shipped' },
  { number: 8, label: 'DHL' },
]

// Container animation for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const

// Individual stage animation
const stageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

// Checkmark path animation
const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
}

interface WorkflowStepperProps {
  workflow: PurchaseWorkflow
  onStageClick: (stageNumber: number) => void
  className?: string
}

export function WorkflowStepper({
  workflow,
  onStageClick,
  className,
}: WorkflowStepperProps) {
  return (
    <div className={cn('w-full overflow-x-auto scrollbar-none py-2', className)}>
      <motion.div
        className='flex items-center justify-between min-w-[700px] px-2'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {STAGES.map((stage, index) => {
          const isCompleted = isStageComplete(workflow, stage.number)
          const isCurrent = workflow.currentStage === stage.number
          const isAccessible = canAccessStage(workflow, stage.number)

          return (
            <motion.div
              key={stage.number}
              className='flex items-center flex-1'
              variants={stageVariants}
            >
              {/* Stage Circle & Label */}
              <motion.button
                onClick={() => isAccessible && onStageClick(stage.number)}
                disabled={!isAccessible}
                className={cn(
                  'flex flex-col items-center gap-2 group relative',
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                )}
                whileHover={isAccessible ? { scale: 1.05 } : undefined}
                whileTap={isAccessible ? { scale: 0.95 } : undefined}
              >
                {/* Circle - Material Design Style */}
                <motion.div
                  className={cn(
                    'relative h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300',
                    // Completed - emerald with shadow
                    isCompleted && 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/30',
                    // Current - primary with elevated shadow
                    isCurrent && !isCompleted && 'bg-primary text-primary-foreground shadow-lg shadow-primary/40',
                    // Accessible - subtle border with hover effects
                    !isCompleted && !isCurrent && isAccessible && 'bg-muted border-2 border-muted-foreground/20 text-muted-foreground group-hover:border-primary group-hover:text-primary group-hover:shadow-md transition-all',
                    // Locked - faded appearance
                    !isCompleted && !isCurrent && !isAccessible && 'bg-muted/50 text-muted-foreground/40'
                  )}
                  initial={false}
                  animate={
                    isCurrent && !isCompleted
                      ? {
                          boxShadow: [
                            '0 4px 14px -3px rgba(59, 130, 246, 0.4)',
                            '0 4px 20px -3px rgba(59, 130, 246, 0.6)',
                            '0 4px 14px -3px rgba(59, 130, 246, 0.4)',
                          ],
                        }
                      : {}
                  }
                  transition={
                    isCurrent && !isCompleted
                      ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                      : {}
                  }
                >
                  <AnimatePresence mode='wait'>
                    {isCompleted ? (
                      <motion.div
                        key='check'
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <svg
                          className='h-6 w-6'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth={2.5}
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <motion.path
                            d='M5 12l5 5L20 7'
                            variants={checkVariants}
                            initial='hidden'
                            animate='visible'
                          />
                        </svg>
                      </motion.div>
                    ) : (
                      <motion.span
                        key='number'
                        className={cn(
                          'text-base font-semibold',
                          isCurrent && 'font-bold'
                        )}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.05 }}
                      >
                        {stage.number}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Label */}
                <motion.span
                  className={cn(
                    'text-xs font-medium transition-colors whitespace-nowrap',
                    isCurrent && 'text-primary font-semibold',
                    isCompleted && !isCurrent && 'text-emerald-600 dark:text-emerald-400 font-medium',
                    !isCompleted && !isCurrent && isAccessible && 'text-muted-foreground group-hover:text-foreground',
                    !isCompleted && !isCurrent && !isAccessible && 'text-muted-foreground/40'
                  )}
                >
                  {stage.label}
                </motion.span>
              </motion.button>

              {/* Connector Line - Material Design thin style */}
              {index < STAGES.length - 1 && (
                <div className='flex-1 mx-3 h-0.5 relative overflow-hidden rounded-full self-start mt-6'>
                  <div className='absolute inset-0 bg-muted-foreground/15' />
                  <motion.div
                    className='absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full'
                    initial={{ width: '0%' }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  {/* Subtle shimmer on completed */}
                  {isCompleted && (
                    <motion.div
                      className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent'
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
