'use client'

import { MdInventory2, MdDescription, MdCheck } from 'react-icons/md'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../../data/won-auctions'
import {
  type PurchaseWorkflow,
  type BLDeliveryMethod,
  type TaskCompletion,
  BL_DELIVERY_METHODS,
} from '../../../types/workflow'
import { updateWorkflowStage, updateTaskCompletion } from '../../../utils/workflow'
import { WorkflowCheckbox } from '../shared/workflow-checkbox'
import { WorkflowFileUpload } from '../shared/workflow-file-upload'

interface ShippedStageProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
}

export function ShippedStage({
  workflow,
  onWorkflowUpdate,
  currentUser,
}: ShippedStageProps) {
  const stage = workflow.stages.shipped

  const handleBLCopyUpload = (
    files: { id: string; name: string; size: number; type: string; file: File }[]
  ) => {
    if (files.length === 0) return

    const updatedStage = {
      ...stage,
      blCopy: {
        uploaded: true,
        documentId: files[0].id,
        uploadedAt: new Date(),
      },
      status: 'in_progress' as const,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'shipped', updatedStage))
  }

  const handleBLPaidChange = (checked: boolean, notes?: string) => {
    const updatedStage = {
      ...stage,
      blPaid: updateTaskCompletion(stage.blPaid, checked, currentUser, notes),
    }
    checkAndUpdateCompletion(updatedStage)
  }

  const handleBLDeliveryChange = (method: BLDeliveryMethod) => {
    const updatedStage = {
      ...stage,
      blDeliveryMethod: method,
    }
    checkAndUpdateCompletion(updatedStage)
  }

  const handleExportDeclarationUpload = (
    files: { id: string; name: string; size: number; type: string; file: File }[]
  ) => {
    if (files.length === 0) return

    const updatedStage = {
      ...stage,
      exportDeclaration: {
        uploaded: true,
        documentId: files[0].id,
        uploadedAt: new Date(),
      },
    }
    checkAndUpdateCompletion(updatedStage)
  }

  const handleRecycleChange = (checked: boolean, notes?: string) => {
    const updatedStage = {
      ...stage,
      recycleApplied: updateTaskCompletion(stage.recycleApplied, checked, currentUser, notes),
    }
    checkAndUpdateCompletion(updatedStage)
  }

  // Edit handlers for inline note editing
  const handleBLPaidEdit = (completion: TaskCompletion) => {
    const updatedStage = {
      ...stage,
      blPaid: { ...stage.blPaid, completion },
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'shipped', updatedStage))
  }

  const handleRecycleEdit = (completion: TaskCompletion) => {
    const updatedStage = {
      ...stage,
      recycleApplied: { ...stage.recycleApplied, completion },
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'shipped', updatedStage))
  }

  const checkAndUpdateCompletion = (updatedStage: typeof stage) => {
    // Check if all required tasks are complete
    const allComplete =
      updatedStage.blCopy.uploaded &&
      updatedStage.blPaid.completed &&
      updatedStage.blDeliveryMethod !== null &&
      updatedStage.exportDeclaration.uploaded &&
      updatedStage.recycleApplied.completed

    updatedStage.status = allComplete ? 'completed' : 'in_progress'
    onWorkflowUpdate(updateWorkflowStage(workflow, 'shipped', updatedStage))
  }

  return (
    <div className='space-y-4'>
      {/* Info Alert */}
      <Alert>
        <MdInventory2 className='h-4 w-4' />
        <AlertDescription>
          Complete shipping documentation including Bill of Lading, export declaration, and recycle
          application.
        </AlertDescription>
      </Alert>

      {/* BL Copy Upload */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-medium'>Bill of Lading Copy</Label>
          {stage.blCopy.uploaded && (
            <Badge variant='default' className='bg-emerald-500'>
              <MdCheck className='h-3 w-3 mr-1' />
              Uploaded
            </Badge>
          )}
        </div>
        {!stage.blCopy.uploaded ? (
          <WorkflowFileUpload
            onFilesSelected={handleBLCopyUpload}
            accept='.pdf,.png,.jpg,.jpeg'
            maxFiles={1}
            maxSize={10 * 1024 * 1024}
            label='Upload B/L Copy'
            description='PDF or image up to 10MB'
          />
        ) : (
          <div className='rounded-lg border p-3 bg-emerald-50/50 dark:bg-emerald-900/10'>
            <div className='flex items-center gap-2'>
              <MdDescription className='h-4 w-4 text-emerald-600' />
              <span className='text-sm'>B/L document uploaded</span>
            </div>
            {stage.blCopy.uploadedAt && (
              <p className='text-xs text-muted-foreground mt-1'>
                Uploaded on{' '}
                {new Date(stage.blCopy.uploadedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* BL Payment */}
      <div className='border rounded-lg'>
        <WorkflowCheckbox
          id='bl-paid'
          label='B/L Paid'
          description='Confirm that the Bill of Lading fee has been paid'
          checked={stage.blPaid.completed}
          completion={stage.blPaid.completion}
          disabled={!stage.blCopy.uploaded}
          onCheckedChange={handleBLPaidChange}
          onEdit={handleBLPaidEdit}
          showNoteOnComplete
          className='px-3'
        />
      </div>

      {/* BL Delivery Method */}
      <div className='space-y-3'>
        <Label className='text-sm font-medium'>B/L Delivery Method</Label>
        <RadioGroup
          value={stage.blDeliveryMethod || undefined}
          onValueChange={(value) => handleBLDeliveryChange(value as BLDeliveryMethod)}
          className='grid grid-cols-2 gap-3'
          disabled={!stage.blPaid.completed}
        >
          {BL_DELIVERY_METHODS.map((method) => (
            <Label
              key={method.value}
              htmlFor={method.value}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                stage.blDeliveryMethod === method.value && 'border-primary bg-primary/5',
                !stage.blPaid.completed && 'opacity-50 cursor-not-allowed'
              )}
            >
              <RadioGroupItem
                value={method.value}
                id={method.value}
                disabled={!stage.blPaid.completed}
              />
              <span className='text-sm'>{method.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Export Declaration Upload */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-medium'>Export Declaration</Label>
          {stage.exportDeclaration.uploaded && (
            <Badge variant='default' className='bg-emerald-500'>
              <MdCheck className='h-3 w-3 mr-1' />
              Uploaded
            </Badge>
          )}
        </div>
        {!stage.exportDeclaration.uploaded ? (
          <WorkflowFileUpload
            onFilesSelected={handleExportDeclarationUpload}
            accept='.pdf,.png,.jpg,.jpeg'
            maxFiles={1}
            maxSize={10 * 1024 * 1024}
            label='Upload Export Declaration'
            description='PDF or image up to 10MB'
          />
        ) : (
          <div className='rounded-lg border p-3 bg-emerald-50/50 dark:bg-emerald-900/10'>
            <div className='flex items-center gap-2'>
              <MdDescription className='h-4 w-4 text-emerald-600' />
              <span className='text-sm'>Export declaration uploaded</span>
            </div>
            {stage.exportDeclaration.uploadedAt && (
              <p className='text-xs text-muted-foreground mt-1'>
                Uploaded on{' '}
                {new Date(stage.exportDeclaration.uploadedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recycle Application */}
      <div className='border rounded-lg'>
        <WorkflowCheckbox
          id='recycle-applied'
          label='Apply for Recycle'
          description='Complete the recycle application for the exported vehicle'
          checked={stage.recycleApplied.completed}
          completion={stage.recycleApplied.completion}
          onCheckedChange={handleRecycleChange}
          onEdit={handleRecycleEdit}
          showNoteOnComplete
          className='px-3'
        />
      </div>
    </div>
  )
}
