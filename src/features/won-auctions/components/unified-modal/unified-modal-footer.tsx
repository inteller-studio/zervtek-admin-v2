'use client'

import {
  MdCreditCard,
  MdDirectionsBoat,
  MdDescription,
  MdCheckCircle,
  MdArrowForward,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { type Purchase } from '../../data/won-auctions'
import { type PurchaseWorkflow, WORKFLOW_STAGES } from '../../types/workflow'
import { isStageComplete } from '../../utils/workflow'
import { type ModalMode } from './shared/mode-toggle'

interface UnifiedModalFooterProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  mode: ModalMode
  onClose: () => void
  onRecordPayment?: () => void
  onUpdateShipping?: () => void
  onGenerateInvoice?: () => void
  onMarkDelivered?: () => void
  onMarkCompleted?: () => void
}

export function UnifiedModalFooter({
  auction,
  workflow,
  mode,
  onClose,
  onRecordPayment,
  onUpdateShipping,
  onGenerateInvoice,
  onMarkDelivered,
  onMarkCompleted,
}: UnifiedModalFooterProps) {
  const currentStage = WORKFLOW_STAGES.find((s) => s.number === workflow.currentStage)
  const isCurrentStageComplete = isStageComplete(workflow, workflow.currentStage)

  // Determine which actions to show based on mode and status
  const renderActions = () => {
    if (mode === 'overview') {
      // Overview mode: show payment, shipping, invoice actions
      return (
        <div className='flex items-center gap-2 flex-wrap'>
          {onRecordPayment && auction.paymentStatus !== 'completed' && (
            <Button size='sm' onClick={onRecordPayment}>
              <MdCreditCard className='mr-2 h-4 w-4' />
              Record Payment
            </Button>
          )}
          {onUpdateShipping && auction.status !== 'completed' && (
            <Button size='sm' variant='outline' onClick={onUpdateShipping}>
              <MdDirectionsBoat className='mr-2 h-4 w-4' />
              Update Shipping
            </Button>
          )}
          {onGenerateInvoice && (
            <Button size='sm' variant='outline' onClick={onGenerateInvoice}>
              <MdDescription className='mr-2 h-4 w-4' />
              Generate Invoice
            </Button>
          )}
        </div>
      )
    } else {
      // Workflow mode: show stage-specific actions
      return (
        <div className='flex items-center gap-2 flex-wrap'>
          {/* Current stage indicator */}
          <div className='flex items-center gap-2 text-sm text-muted-foreground mr-2'>
            <span>
              Stage {workflow.currentStage}: {currentStage?.label}
            </span>
            {isCurrentStageComplete && (
              <MdCheckCircle className='h-4 w-4 text-emerald-500' />
            )}
          </div>

          {/* Status-based actions */}
          {auction.status === 'shipping' && onMarkDelivered && (
            <Button size='sm' onClick={onMarkDelivered}>
              <MdCheckCircle className='mr-2 h-4 w-4' />
              Mark as Delivered
            </Button>
          )}
          {auction.status === 'delivered' && onMarkCompleted && (
            <Button size='sm' onClick={onMarkCompleted}>
              <MdCheckCircle className='mr-2 h-4 w-4' />
              Mark as Completed
            </Button>
          )}

          {/* Next stage hint when current is complete */}
          {isCurrentStageComplete && workflow.currentStage < 8 && (
            <div className='flex items-center gap-1 text-xs text-emerald-600'>
              <MdArrowForward className='h-3 w-3' />
              <span>Ready for next stage</span>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div className='flex items-center justify-between border-t px-6 py-4 bg-muted/20'>
      {renderActions()}
      <Button variant='ghost' onClick={onClose}>
        Close
      </Button>
    </div>
  )
}
