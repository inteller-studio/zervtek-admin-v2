'use client'

import { MdChevronLeft, MdChevronRight, MdAttachMoney, MdCheckCircle } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../data/won-auctions'
import { type PurchaseWorkflow } from '../../types/workflow'
import { calculateWorkflowProgress } from '../../utils/workflow'
import { WORKFLOW_STAGES } from '../../types/workflow'

interface PurchasePageFooterProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  onPreviousStage: () => void
  onNextStage: () => void
  onRecordPayment: () => void
  onMarkDelivered: () => void
  onMarkCompleted: () => void
}

export function PurchasePageFooter({
  auction,
  workflow,
  onPreviousStage,
  onNextStage,
  onRecordPayment,
  onMarkDelivered,
  onMarkCompleted,
}: PurchasePageFooterProps) {
  const progress = calculateWorkflowProgress(workflow)
  const isAllComplete = progress >= 100
  const currentStageIndex = workflow.currentStage - 1
  const isFirstStage = currentStageIndex === 0
  const isLastStage = currentStageIndex === WORKFLOW_STAGES.length - 1

  return (
    <div className='flex items-center justify-between border-t px-6 py-3 shrink-0 bg-background'>
      {/* Progress indicator */}
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2'>
          <div className={cn(
            'h-2 w-2 rounded-full',
            isAllComplete ? 'bg-emerald-500' : 'bg-primary'
          )} />
          <span className='text-sm text-muted-foreground'>
            Stage {workflow.currentStage} of {WORKFLOW_STAGES.length}
          </span>
        </div>
        <span className={cn(
          'text-sm font-semibold',
          isAllComplete ? 'text-emerald-600' : 'text-primary'
        )}>
          {progress}% Complete
        </span>
      </div>

      {/* Navigation & Action Buttons */}
      <div className='flex items-center gap-2'>
        {/* Stage Navigation */}
        <div className='flex items-center gap-1 mr-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={onPreviousStage}
            disabled={isFirstStage}
          >
            <MdChevronLeft className='h-4 w-4 mr-1' />
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={onNextStage}
            disabled={isLastStage}
          >
            Next
            <MdChevronRight className='h-4 w-4 ml-1' />
          </Button>
        </div>

        {/* Record Payment Button */}
        {auction.paymentStatus !== 'completed' && (
          <Button size='sm' onClick={onRecordPayment}>
            <MdAttachMoney className='h-4 w-4 mr-2' />
            Record Payment
          </Button>
        )}

        {/* Mark Delivered Button */}
        {auction.status === 'shipping' && (
          <Button
            size='sm'
            onClick={onMarkDelivered}
            className='bg-purple-600 hover:bg-purple-700'
          >
            <MdCheckCircle className='h-4 w-4 mr-2' />
            Mark Delivered
          </Button>
        )}

        {/* Mark Completed Button */}
        {auction.status === 'delivered' && (
          <Button
            size='sm'
            onClick={onMarkCompleted}
            className='bg-emerald-600 hover:bg-emerald-700'
          >
            <MdCheckCircle className='h-4 w-4 mr-2' />
            Mark Completed
          </Button>
        )}
      </div>
    </div>
  )
}
