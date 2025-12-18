'use client'

import { DollarSign, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { type WonAuction } from '../../../data/won-auctions'
import { type PurchaseWorkflow } from '../../../types/workflow'
import { updateWorkflowStage, updateTaskCompletion } from '../../../utils/workflow'
import { WorkflowCheckbox } from '../shared/workflow-checkbox'

interface AfterPurchaseStageProps {
  auction: WonAuction
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
}

export function AfterPurchaseStage({
  auction,
  workflow,
  onWorkflowUpdate,
  currentUser,
}: AfterPurchaseStageProps) {
  const stage = workflow.stages.afterPurchase

  const handlePaymentChange = (checked: boolean, notes?: string) => {
    const updatedStage = {
      ...stage,
      status: checked ? ('completed' as const) : ('in_progress' as const),
      paymentToAuctionHouse: updateTaskCompletion(
        stage.paymentToAuctionHouse,
        checked,
        currentUser,
        notes
      ),
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'afterPurchase', updatedStage))
  }

  return (
    <div className='space-y-4'>
      {/* Info Alert */}
      <Alert>
        <DollarSign className='h-4 w-4' />
        <AlertDescription>
          Confirm that payment to the auction house has been completed before proceeding.
        </AlertDescription>
      </Alert>

      {/* Payment Summary */}
      <div className='rounded-lg border p-3 bg-muted/30'>
        <h4 className='text-sm font-medium mb-2'>Auction Payment Details</h4>
        <div className='space-y-1 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Winning Bid</span>
            <span className='font-medium'>¥{auction.winningBid.toLocaleString()}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Auction ID</span>
            <span className='font-mono text-xs'>{auction.auctionId}</span>
          </div>
        </div>
      </div>

      {/* Task */}
      <div className='border rounded-lg p-3'>
        <WorkflowCheckbox
          id='payment-auction-house'
          label='Payment to Auction House Completed'
          description='Confirm that the full auction amount has been paid to the auction house'
          checked={stage.paymentToAuctionHouse.completed}
          completion={stage.paymentToAuctionHouse.completion}
          onCheckedChange={handlePaymentChange}
          showNoteOnComplete
        />
      </div>

      {/* Warning if not complete */}
      {!stage.paymentToAuctionHouse.completed && (
        <Alert variant='destructive' className='bg-destructive/10 border-destructive/30'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Complete the auction house payment to proceed to the next stage.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
