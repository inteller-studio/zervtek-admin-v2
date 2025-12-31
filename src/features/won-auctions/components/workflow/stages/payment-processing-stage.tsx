'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { MdCreditCard, MdAdd, MdDelete, MdReceipt } from 'react-icons/md'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { type Purchase } from '../../../data/won-auctions'
import {
  type PurchaseWorkflow,
  type WorkflowPayment,
  PAYMENT_METHODS,
} from '../../../types/workflow'
import { updateWorkflowStage } from '../../../utils/workflow'

interface PaymentProcessingStageProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
}

export function PaymentProcessingStage({
  auction,
  workflow,
  onWorkflowUpdate,
  currentUser,
}: PaymentProcessingStageProps) {
  const stage = workflow.stages.paymentProcessing
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newPayment, setNewPayment] = useState<Partial<WorkflowPayment>>({
    method: 'bank_transfer',
    amount: 0,
    referenceNumber: '',
    notes: '',
  })

  const handleAddPayment = () => {
    if (!newPayment.amount || !newPayment.referenceNumber) return

    const payment: WorkflowPayment = {
      id: crypto.randomUUID(),
      amount: newPayment.amount,
      method: newPayment.method as WorkflowPayment['method'],
      referenceNumber: newPayment.referenceNumber,
      receivedAt: new Date(),
      recordedBy: currentUser,
      notes: newPayment.notes,
    }

    const updatedPayments = [...stage.payments, payment]
    const totalReceived = updatedPayments.reduce((sum, p) => sum + p.amount, 0)

    const updatedStage = {
      ...stage,
      payments: updatedPayments,
      totalReceived,
      status: 'in_progress' as const,
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'paymentProcessing', updatedStage))
    setDialogOpen(false)
    setNewPayment({
      method: 'bank_transfer',
      amount: 0,
      referenceNumber: '',
      notes: '',
    })
  }

  const handleRemovePayment = (paymentId: string) => {
    const updatedPayments = stage.payments.filter((p) => p.id !== paymentId)
    const totalReceived = updatedPayments.reduce((sum, p) => sum + p.amount, 0)

    const updatedStage = {
      ...stage,
      payments: updatedPayments,
      totalReceived,
      status: updatedPayments.length > 0 ? ('in_progress' as const) : ('pending' as const),
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'paymentProcessing', updatedStage))
  }

  const handleMarkComplete = () => {
    const updatedStage = {
      ...stage,
      status: 'completed' as const,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'paymentProcessing', updatedStage))
  }

  const getMethodLabel = (method: WorkflowPayment['method']) => {
    return PAYMENT_METHODS.find((m) => m.value === method)?.label || method
  }

  return (
    <div className='space-y-4'>
      {/* Info Alert */}
      <Alert>
        <MdCreditCard className='h-4 w-4' />
        <AlertDescription>
          Record all payments received from the customer for this vehicle.
        </AlertDescription>
      </Alert>

      {/* Payment Summary */}
      <div className='rounded-lg border p-3 bg-muted/30'>
        <div className='flex items-center justify-between mb-2'>
          <h4 className='text-sm font-medium'>Payment Summary</h4>
          <Badge variant={stage.totalReceived >= auction.winningBid ? 'default' : 'secondary'}>
            {stage.totalReceived >= auction.winningBid ? 'Paid' : 'Pending'}
          </Badge>
        </div>
        <div className='space-y-1 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Vehicle Price</span>
            <span className='font-medium'>¥{auction.winningBid.toLocaleString()}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Total Received</span>
            <span className='font-medium text-emerald-600'>
              ¥{stage.totalReceived.toLocaleString()}
            </span>
          </div>
          {stage.totalReceived < auction.winningBid && (
            <div className='flex justify-between text-destructive'>
              <span>Balance Due</span>
              <span className='font-medium'>
                ¥{(auction.winningBid - stage.totalReceived).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payments List */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-medium'>Payments Received</Label>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='outline' size='sm'>
                <MdAdd className='h-4 w-4 mr-1' />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Add a new payment received from the customer.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label>Amount (¥)</Label>
                  <Input
                    type='number'
                    placeholder='0'
                    value={newPayment.amount || ''}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, amount: Number(e.target.value) })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Payment Method</Label>
                  <Select
                    value={newPayment.method}
                    onValueChange={(value) =>
                      setNewPayment({
                        ...newPayment,
                        method: value as WorkflowPayment['method'],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Reference Number</Label>
                  <Input
                    placeholder='Transaction ID, check number, etc.'
                    value={newPayment.referenceNumber || ''}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, referenceNumber: e.target.value })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder='Additional details...'
                    value={newPayment.notes || ''}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, notes: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant='outline' onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPayment}
                  disabled={!newPayment.amount || !newPayment.referenceNumber}
                >
                  Add Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {stage.payments.length === 0 ? (
          <div className='text-center py-6 border rounded-lg bg-muted/30'>
            <MdReceipt className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
            <p className='text-sm text-muted-foreground'>No payments recorded yet</p>
          </div>
        ) : (
          <div className='border rounded-lg divide-y'>
            {stage.payments.map((payment) => (
              <div
                key={payment.id}
                className='flex items-center justify-between p-3 group'
              >
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>
                      ¥{payment.amount.toLocaleString()}
                    </span>
                    <Badge variant='outline' className='text-xs'>
                      {getMethodLabel(payment.method)}
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Ref: {payment.referenceNumber} •{' '}
                    {format(new Date(payment.receivedAt), 'MMM d, yyyy')}
                  </p>
                  {payment.notes && (
                    <p className='text-xs text-muted-foreground'>{payment.notes}</p>
                  )}
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive'
                  onClick={() => handleRemovePayment(payment.id)}
                >
                  <MdDelete className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Stage Button */}
      {stage.payments.length > 0 && stage.status !== 'completed' && (
        <Button
          className='w-full'
          onClick={handleMarkComplete}
          disabled={stage.totalReceived < auction.winningBid}
        >
          Mark Payment Processing Complete
        </Button>
      )}

      {stage.totalReceived < auction.winningBid && stage.payments.length > 0 && (
        <p className='text-xs text-muted-foreground text-center'>
          Full payment required to complete this stage
        </p>
      )}
    </div>
  )
}
