'use client'

import { Check, Lock, ChevronRight } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { type WonAuction } from '../../data/won-auctions'
import { type PurchaseWorkflow, WORKFLOW_STAGES } from '../../types/workflow'
import {
  isStageComplete,
  canAccessStage,
  calculateStageProgress,
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

interface WorkflowSidebarProps {
  auction: WonAuction
  workflow: PurchaseWorkflow
  activeStage: string
  onStageChange: (stage: string) => void
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
  yards: Yard[]
}

export function WorkflowSidebar({
  auction,
  workflow,
  activeStage,
  onStageChange,
  onWorkflowUpdate,
  currentUser,
  yards,
}: WorkflowSidebarProps) {
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
        return <TransportStage {...commonProps} yards={yards} />
      case 3:
        return <PaymentProcessingStage {...commonProps} />
      case 4:
        return <RepairStoredStage {...commonProps} />
      case 5:
        return <DocumentsReceivedStage {...commonProps} />
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

  return (
    <ScrollArea className='h-full'>
      <div className='p-4'>
        <Accordion
          type='single'
          collapsible
          value={activeStage}
          onValueChange={onStageChange}
          className='space-y-2'
        >
          {WORKFLOW_STAGES.map((stage) => {
            const isComplete = isStageComplete(workflow, stage.number)
            const canAccess = canAccessStage(workflow, stage.number)
            const isCurrent = workflow.currentStage === stage.number
            const progress = calculateStageProgress(workflow, stage.number)

            return (
              <AccordionItem
                key={stage.key}
                value={stage.key}
                disabled={!canAccess}
                className={cn(
                  'border rounded-lg overflow-hidden transition-colors',
                  isComplete && 'border-emerald-200 dark:border-emerald-900/50',
                  isCurrent && !isComplete && 'border-primary',
                  !canAccess && 'opacity-60'
                )}
              >
                <AccordionTrigger
                  className={cn(
                    'px-4 py-3 hover:no-underline',
                    isComplete && 'bg-emerald-50/50 dark:bg-emerald-900/10',
                    isCurrent && !isComplete && 'bg-primary/5',
                    !canAccess && 'cursor-not-allowed'
                  )}
                  disabled={!canAccess}
                >
                  <div className='flex items-center gap-3 w-full'>
                    {/* Stage Number / Status Icon */}
                    <div
                      className={cn(
                        'h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                        isComplete && 'bg-emerald-500 text-white',
                        isCurrent && !isComplete && 'bg-primary text-primary-foreground',
                        !isComplete && !isCurrent && canAccess && 'bg-muted text-muted-foreground',
                        !canAccess && 'bg-muted/50 text-muted-foreground/50'
                      )}
                    >
                      {isComplete ? (
                        <Check className='h-4 w-4' />
                      ) : !canAccess ? (
                        <Lock className='h-3 w-3' />
                      ) : (
                        stage.number
                      )}
                    </div>

                    {/* Stage Label */}
                    <div className='flex-1 text-left'>
                      <p className='font-medium text-sm'>{stage.label}</p>
                      {canAccess && (
                        <p className='text-xs text-muted-foreground'>
                          {progress.completed}/{progress.total} tasks
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    {isComplete ? (
                      <Badge variant='default' className='bg-emerald-500 text-xs'>
                        Complete
                      </Badge>
                    ) : isCurrent ? (
                      <Badge variant='default' className='text-xs'>
                        In Progress
                      </Badge>
                    ) : canAccess ? (
                      <Badge variant='secondary' className='text-xs'>
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant='outline' className='text-xs opacity-50'>
                        Locked
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4 pt-2'>
                  {canAccess && renderStageContent(stage.number)}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </ScrollArea>
  )
}
