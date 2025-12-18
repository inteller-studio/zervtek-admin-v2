'use client'

import { FileCheck, AlertCircle, Car, CircleSlash } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { type WonAuction } from '../../../data/won-auctions'
import { type PurchaseWorkflow } from '../../../types/workflow'
import { updateWorkflowStage, updateTaskCompletion } from '../../../utils/workflow'
import { WorkflowCheckbox } from '../shared/workflow-checkbox'

interface DocumentsReceivedStageProps {
  auction: WonAuction
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
}

export function DocumentsReceivedStage({
  auction,
  workflow,
  onWorkflowUpdate,
  currentUser,
}: DocumentsReceivedStageProps) {
  const stage = workflow.stages.documentsReceived

  const handleRegistrationChange = (isRegistered: boolean) => {
    const updatedStage = {
      ...stage,
      isRegistered,
      status: 'in_progress' as const,
      // Initialize tasks based on registration status
      registeredTasks: isRegistered
        ? {
            receivedNumberPlates: { completed: false },
            deregistered: { completed: false },
            exportCertificateCreated: { completed: false },
            sentDeregistrationCopy: { completed: false },
            insuranceRefundReceived: { completed: false },
          }
        : undefined,
      unregisteredTasks: !isRegistered
        ? {
            exportCertificateCreated: { completed: false },
          }
        : undefined,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
  }

  const handleRegisteredTaskChange = (
    task: keyof NonNullable<typeof stage.registeredTasks>,
    checked: boolean,
    notes?: string
  ) => {
    if (!stage.registeredTasks) return

    const updatedTasks = {
      ...stage.registeredTasks,
      [task]: updateTaskCompletion(stage.registeredTasks[task], checked, currentUser, notes),
    }

    // Check if all tasks are complete
    const allComplete = Object.values(updatedTasks).every((t) => t.completed)

    const updatedStage = {
      ...stage,
      registeredTasks: updatedTasks,
      status: allComplete ? ('completed' as const) : ('in_progress' as const),
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
  }

  const handleUnregisteredTaskChange = (
    task: keyof NonNullable<typeof stage.unregisteredTasks>,
    checked: boolean,
    notes?: string
  ) => {
    if (!stage.unregisteredTasks) return

    const updatedTasks = {
      ...stage.unregisteredTasks,
      [task]: updateTaskCompletion(stage.unregisteredTasks[task], checked, currentUser, notes),
    }

    // Check if all tasks are complete
    const allComplete = Object.values(updatedTasks).every((t) => t.completed)

    const updatedStage = {
      ...stage,
      unregisteredTasks: updatedTasks,
      status: allComplete ? ('completed' as const) : ('in_progress' as const),
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
  }

  return (
    <div className='space-y-4'>
      {/* Info Alert */}
      <Alert>
        <FileCheck className='h-4 w-4' />
        <AlertDescription>
          Complete document-related tasks based on the vehicle&apos;s registration status.
        </AlertDescription>
      </Alert>

      {/* Registration Status Selection */}
      <div className='space-y-3'>
        <Label className='text-sm font-medium'>Vehicle Registration Status</Label>
        <RadioGroup
          value={stage.isRegistered === null ? undefined : stage.isRegistered ? 'registered' : 'unregistered'}
          onValueChange={(value) => handleRegistrationChange(value === 'registered')}
          className='grid grid-cols-2 gap-3'
        >
          <Label
            htmlFor='registered'
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
              stage.isRegistered === true && 'border-primary bg-primary/5'
            )}
          >
            <RadioGroupItem value='registered' id='registered' />
            <div className='flex items-center gap-2'>
              <Car className='h-4 w-4 text-emerald-600' />
              <div>
                <p className='text-sm font-medium'>Registered</p>
                <p className='text-xs text-muted-foreground'>Has number plates</p>
              </div>
            </div>
          </Label>
          <Label
            htmlFor='unregistered'
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
              stage.isRegistered === false && 'border-primary bg-primary/5'
            )}
          >
            <RadioGroupItem value='unregistered' id='unregistered' />
            <div className='flex items-center gap-2'>
              <CircleSlash className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>Not Registered</p>
                <p className='text-xs text-muted-foreground'>No number plates</p>
              </div>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {stage.isRegistered === null && (
        <Alert variant='default' className='bg-amber-50 border-amber-200'>
          <AlertCircle className='h-4 w-4 text-amber-600' />
          <AlertDescription className='text-amber-800'>
            Select the vehicle registration status to see available tasks.
          </AlertDescription>
        </Alert>
      )}

      {/* Registered Vehicle Tasks */}
      {stage.isRegistered === true && stage.registeredTasks && (
        <div className='space-y-2'>
          <Separator />
          <Label className='text-sm font-medium'>Registered Vehicle Tasks</Label>
          <div className='border rounded-lg divide-y'>
            <WorkflowCheckbox
              id='received-number-plates'
              label='Received Number Plates'
              description='Confirm that the number plates have been received from the auction'
              checked={stage.registeredTasks.receivedNumberPlates.completed}
              completion={stage.registeredTasks.receivedNumberPlates.completion}
              onCheckedChange={(checked, notes) =>
                handleRegisteredTaskChange('receivedNumberPlates', checked, notes)
              }
              showNoteOnComplete
              className='px-3'
            />
            <WorkflowCheckbox
              id='deregistered'
              label='Deregister Vehicle'
              description='Complete the deregistration process for the vehicle'
              checked={stage.registeredTasks.deregistered.completed}
              completion={stage.registeredTasks.deregistered.completion}
              disabled={!stage.registeredTasks.receivedNumberPlates.completed}
              onCheckedChange={(checked, notes) =>
                handleRegisteredTaskChange('deregistered', checked, notes)
              }
              showNoteOnComplete
              className='px-3'
            />
            <WorkflowCheckbox
              id='export-cert-created'
              label='Create Export Certificate'
              description='Generate the export certificate for the vehicle'
              checked={stage.registeredTasks.exportCertificateCreated.completed}
              completion={stage.registeredTasks.exportCertificateCreated.completion}
              disabled={!stage.registeredTasks.deregistered.completed}
              onCheckedChange={(checked, notes) =>
                handleRegisteredTaskChange('exportCertificateCreated', checked, notes)
              }
              showNoteOnComplete
              className='px-3'
            />
            <WorkflowCheckbox
              id='sent-deregistration-copy'
              label='Send Deregistration Copy to Auction House'
              description='Send a copy of the deregistration certificate to the auction house'
              checked={stage.registeredTasks.sentDeregistrationCopy.completed}
              completion={stage.registeredTasks.sentDeregistrationCopy.completion}
              disabled={!stage.registeredTasks.deregistered.completed}
              onCheckedChange={(checked, notes) =>
                handleRegisteredTaskChange('sentDeregistrationCopy', checked, notes)
              }
              showNoteOnComplete
              className='px-3'
            />
            <WorkflowCheckbox
              id='insurance-refund'
              label='Get Insurance Refund'
              description='Claim the insurance refund for the deregistered vehicle'
              checked={stage.registeredTasks.insuranceRefundReceived.completed}
              completion={stage.registeredTasks.insuranceRefundReceived.completion}
              disabled={!stage.registeredTasks.deregistered.completed}
              onCheckedChange={(checked, notes) =>
                handleRegisteredTaskChange('insuranceRefundReceived', checked, notes)
              }
              showNoteOnComplete
              className='px-3'
            />
          </div>
        </div>
      )}

      {/* Unregistered Vehicle Tasks */}
      {stage.isRegistered === false && stage.unregisteredTasks && (
        <div className='space-y-2'>
          <Separator />
          <Label className='text-sm font-medium'>Unregistered Vehicle Tasks</Label>
          <div className='border rounded-lg'>
            <WorkflowCheckbox
              id='export-cert-unregistered'
              label='Create Export Certificate'
              description='Generate the export certificate for the unregistered vehicle'
              checked={stage.unregisteredTasks.exportCertificateCreated.completed}
              completion={stage.unregisteredTasks.exportCertificateCreated.completion}
              onCheckedChange={(checked, notes) =>
                handleUnregisteredTaskChange('exportCertificateCreated', checked, notes)
              }
              showNoteOnComplete
              className='px-3'
            />
          </div>
        </div>
      )}
    </div>
  )
}
