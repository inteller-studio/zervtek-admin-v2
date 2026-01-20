'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdCheck, MdLock, MdArrowBack, MdArrowForward, MdCheckCircle, MdWarning } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../data/won-auctions'
import { type PurchaseWorkflow, WORKFLOW_STAGES } from '../../types/workflow'
import {
  isStageComplete,
  canAccessStage,
  calculateStageProgress,
  areAllStagesComplete,
} from '../../utils/workflow'

// Stage Components
import { AfterPurchaseStage } from './stages/after-purchase-stage'
import { TransportStage } from './stages/transport-stage'
import { PaymentProcessingStage } from './stages/payment-processing-stage'
import { RepairStoredStage } from './stages/repair-stored-stage'
import { DocumentsReceivedStage } from './stages/documents-received-stage'
import { BookingStage } from './stages/booking-stage'
import { ShippedStage } from './stages/shipped-stage'
import { DHLDocumentsStage } from './stages/dhl-documents-stage'
import { type Yard } from '../../../yards/types'

// Animation variants for stepper
const stepperVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const stepVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

// Checkmark animation
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

interface WorkflowSidebarProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  activeStage: string
  onStageChange: (stage: string) => void
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
  yards: Yard[]
  onAddYard?: () => void
  onOpenExportCertificate?: () => void
  onFinalize?: () => void
}

export function WorkflowSidebar({
  auction,
  workflow,
  activeStage,
  onStageChange,
  onWorkflowUpdate,
  currentUser,
  yards,
  onAddYard,
  onOpenExportCertificate,
  onFinalize,
}: WorkflowSidebarProps) {
  // Track which stage we're viewing (can be different from workflow.currentStage)
  const [viewingStage, setViewingStage] = useState(() => {
    const activeStageNumber = WORKFLOW_STAGES.find(s => s.key === activeStage)?.number
    return activeStageNumber || workflow.currentStage
  })
  const [slideDirection, setSlideDirection] = useState(0) // -1 left, 1 right

  // Sync viewing stage with active stage prop changes
  useEffect(() => {
    const activeStageNumber = WORKFLOW_STAGES.find(s => s.key === activeStage)?.number
    if (activeStageNumber && activeStageNumber !== viewingStage) {
      setSlideDirection(activeStageNumber > viewingStage ? 1 : -1)
      setViewingStage(activeStageNumber)
    }
  }, [activeStage])

  const navigateToStage = (stageNumber: number) => {
    if (!canAccessStage(workflow, stageNumber)) return
    setSlideDirection(stageNumber > viewingStage ? 1 : -1)
    setViewingStage(stageNumber)
    const stageKey = WORKFLOW_STAGES.find(s => s.number === stageNumber)?.key
    if (stageKey) onStageChange(stageKey)
  }

  const goToPrevious = () => {
    if (viewingStage > 1) {
      navigateToStage(viewingStage - 1)
    }
  }

  const goToNext = () => {
    if (viewingStage < 8 && canAccessStage(workflow, viewingStage + 1)) {
      navigateToStage(viewingStage + 1)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewingStage, workflow])

  const renderStageContent = (stageNumber: number) => {
    const commonProps = {
      auction,
      workflow,
      onWorkflowUpdate,
      currentUser,
    }

    switch (stageNumber) {
      case 1:
        return <AfterPurchaseStage {...commonProps} />
      case 2:
        return <TransportStage {...commonProps} yards={yards} onAddYard={onAddYard} />
      case 3:
        return <PaymentProcessingStage {...commonProps} />
      case 4:
        return <RepairStoredStage {...commonProps} onComplete={goToNext} />
      case 5:
        return <DocumentsReceivedStage {...commonProps} onOpenExportCertificate={onOpenExportCertificate} />
      case 6:
        return <BookingStage {...commonProps} />
      case 7:
        return <ShippedStage {...commonProps} />
      case 8:
        return <DHLDocumentsStage {...commonProps} />
      default:
        return null
    }
  }

  const currentStageData = WORKFLOW_STAGES.find(s => s.number === viewingStage)
  const progress = calculateStageProgress(workflow, viewingStage)
  const isCurrentStageComplete = isStageComplete(workflow, viewingStage)
  const canGoNext = viewingStage < 8 && canAccessStage(workflow, viewingStage + 1)

  return (
    <div className='h-full flex flex-col bg-background'>
      {/* Top: Horizontal Stepper Bar */}
      <div className='shrink-0 border-b bg-card/50 backdrop-blur-sm'>
        <div className='px-4 py-4'>
          <TooltipProvider delayDuration={200}>
            <motion.div
              className='flex items-center justify-between'
              variants={stepperVariants}
              initial='hidden'
              animate='visible'
            >
              {WORKFLOW_STAGES.map((stage, index) => {
                const isComplete = isStageComplete(workflow, stage.number)
                const canAccess = canAccessStage(workflow, stage.number)
                const isCurrent = viewingStage === stage.number
                const isWorkflowCurrent = workflow.currentStage === stage.number
                const isLast = index === WORKFLOW_STAGES.length - 1

                return (
                  <motion.div
                    key={stage.key}
                    variants={stepVariants}
                    className='flex items-center flex-1'
                  >
                    {/* Step Circle */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={() => navigateToStage(stage.number)}
                          disabled={!canAccess}
                          className={cn(
                            'relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200',
                            // Completed
                            isComplete && 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/25',
                            // Currently viewing
                            isCurrent && !isComplete && 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20',
                            // Workflow current (but not viewing)
                            !isCurrent && isWorkflowCurrent && !isComplete && 'bg-primary/80 text-primary-foreground shadow-md',
                            // Accessible but not current
                            !isComplete && !isCurrent && !isWorkflowCurrent && canAccess && 'bg-card border-2 border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary hover:shadow-md cursor-pointer',
                            // Locked
                            !canAccess && 'bg-muted/50 text-muted-foreground/40 cursor-not-allowed'
                          )}
                          whileHover={canAccess ? { scale: 1.1 } : undefined}
                          whileTap={canAccess ? { scale: 0.95 } : undefined}
                          animate={
                            isCurrent && !isComplete
                              ? {
                                  boxShadow: [
                                    '0 4px 14px -3px rgba(59, 130, 246, 0.3)',
                                    '0 4px 20px -3px rgba(59, 130, 246, 0.5)',
                                    '0 4px 14px -3px rgba(59, 130, 246, 0.3)',
                                  ],
                                }
                              : {}
                          }
                          transition={
                            isCurrent && !isComplete
                              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                              : { duration: 0.2 }
                          }
                        >
                          <AnimatePresence mode='wait'>
                            {isComplete ? (
                              <motion.div
                                key='check'
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              >
                                <svg
                                  className='h-4 w-4'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth={3}
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
                            ) : !canAccess ? (
                              <motion.div
                                key='lock'
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <MdLock className='h-3.5 w-3.5' />
                              </motion.div>
                            ) : (
                              <motion.span
                                key='number'
                                className='text-xs font-semibold'
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                {stage.number}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side='bottom' className='text-xs'>
                        <p className='font-medium'>{stage.label}</p>
                        {!canAccess && (
                          <p className='text-muted-foreground'>Complete previous stages first</p>
                        )}
                      </TooltipContent>
                    </Tooltip>

                    {/* Connector Line */}
                    {!isLast && (
                      <div className='flex-1 h-0.5 mx-1.5 relative overflow-hidden rounded-full'>
                        <div className='absolute inset-0 bg-muted-foreground/15' />
                        <motion.div
                          className='absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full'
                          initial={{ width: '0%' }}
                          animate={{ width: isComplete ? '100%' : '0%' }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          </TooltipProvider>

          {/* Stage Labels (visible on wider screens) */}
          <div className='hidden sm:flex items-center justify-between mt-2 px-0.5'>
            {WORKFLOW_STAGES.map((stage) => {
              const isComplete = isStageComplete(workflow, stage.number)
              const isCurrent = viewingStage === stage.number

              return (
                <div key={stage.key} className='flex-1 text-center'>
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors',
                      isCurrent && 'text-primary font-semibold',
                      isComplete && !isCurrent && 'text-emerald-600 dark:text-emerald-400',
                      !isComplete && !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {stage.shortLabel}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Center: Stage Content */}
      <ScrollArea className='flex-1'>
        <div className='p-4 pb-6'>
          <AnimatePresence mode='wait' initial={false}>
            <motion.div
              key={viewingStage}
              initial={{ opacity: 0, x: slideDirection > 0 ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection > 0 ? -60 : 60 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 },
              }}
            >
              {/* Stage Header */}
              <div className='mb-4'>
                <div className='flex items-center justify-between mb-1'>
                  <div className='flex items-center gap-3'>
                    <h2 className='text-lg font-semibold text-foreground'>
                      {currentStageData?.label}
                    </h2>
                    {isCurrentStageComplete && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <MdCheckCircle className='h-5 w-5 text-emerald-500' />
                      </motion.div>
                    )}
                  </div>
                  {/* Finalize Button in Header */}
                  {!workflow.finalized && areAllStagesComplete(workflow) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size='sm'
                          className='gap-1.5 bg-emerald-600 hover:bg-emerald-700'
                        >
                          <MdCheck className='h-4 w-4' />
                          Finalize
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <div className='flex items-center gap-3'>
                            <div className='h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center'>
                              <MdWarning className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                            </div>
                            <AlertDialogTitle>Finalize Purchase Workflow?</AlertDialogTitle>
                          </div>
                          <AlertDialogDescription className='pt-2'>
                            This action cannot be undone. Once finalized, the workflow will be locked and no further changes can be made to any stage.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={onFinalize}
                            className='bg-emerald-600 hover:bg-emerald-700'
                          >
                            <MdCheck className='h-4 w-4 mr-2' />
                            Yes, Finalize
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {workflow.finalized && (
                    <Badge className='bg-emerald-500 hover:bg-emerald-600 gap-1'>
                      <MdLock className='h-3 w-3' />
                      Finalized
                    </Badge>
                  )}
                </div>
                <p className='text-sm text-muted-foreground'>
                  {progress.completed} of {progress.total} tasks complete
                </p>
              </div>

              {/* Stage Content Card */}
              <div className='rounded-xl bg-card border shadow-sm'>
                <div className='p-4'>
                  {renderStageContent(viewingStage)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Bottom: Navigation Bar */}
      <div className='shrink-0 border-t bg-card/50 backdrop-blur-sm'>
        <div className='flex items-center justify-between px-4 py-3'>
          {/* Previous Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={goToPrevious}
            disabled={viewingStage === 1}
            className='gap-1.5'
          >
            <MdArrowBack className='h-4 w-4' />
            <span className='hidden sm:inline'>Previous</span>
          </Button>

          {/* Progress Status */}
          <div className='flex items-center gap-2'>
            <Badge
              variant={isCurrentStageComplete ? 'default' : 'secondary'}
              className={cn(
                'text-xs transition-colors',
                isCurrentStageComplete && 'bg-emerald-500 hover:bg-emerald-600'
              )}
            >
              {progress.completed}/{progress.total} tasks
            </Badge>
            <span className='text-xs text-muted-foreground'>
              Stage {viewingStage} of 8
            </span>
          </div>

          {/* Next Button */}
          <Button
            size='sm'
            onClick={goToNext}
            disabled={!canGoNext}
            className='gap-1.5'
          >
            <span className='hidden sm:inline'>
              {viewingStage === 8 ? 'Complete' : 'Next'}
            </span>
            <MdArrowForward className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
