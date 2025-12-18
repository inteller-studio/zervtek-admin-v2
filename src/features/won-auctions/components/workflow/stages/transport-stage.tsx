'use client'

import { Truck, Building2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { type WonAuction } from '../../../data/won-auctions'
import { type PurchaseWorkflow } from '../../../types/workflow'
import { updateWorkflowStage, updateTaskCompletion } from '../../../utils/workflow'
import { WorkflowCheckbox } from '../shared/workflow-checkbox'
import { YardSelector } from '../shared/yard-selector'
import { type Yard } from '../../../../yards/types'

interface TransportStageProps {
  auction: WonAuction
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
  yards: Yard[]
}

export function TransportStage({
  auction,
  workflow,
  onWorkflowUpdate,
  currentUser,
  yards,
}: TransportStageProps) {
  const stage = workflow.stages.transport

  const handleYardSelect = (yard: Yard | null) => {
    const updatedStage = {
      ...stage,
      yardId: yard?.id || null,
      yardName: yard?.name,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
  }

  const handleTaskChange = (
    task: 'transportArranged' | 'yardNotified' | 'photosRequested',
    checked: boolean,
    notes?: string
  ) => {
    const updatedStage = {
      ...stage,
      [task]: updateTaskCompletion(stage[task], checked, currentUser, notes),
    }

    // Check if all tasks are complete to update stage status
    const allComplete =
      stage.yardId !== null &&
      (task === 'transportArranged' ? checked : stage.transportArranged.completed) &&
      (task === 'yardNotified' ? checked : stage.yardNotified.completed) &&
      (task === 'photosRequested' ? checked : stage.photosRequested.completed)

    updatedStage.status = allComplete ? 'completed' : 'in_progress'

    onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
  }

  const isYardSelected = stage.yardId !== null

  return (
    <div className='space-y-4'>
      {/* Info Alert */}
      <Alert>
        <Truck className='h-4 w-4' />
        <AlertDescription>
          Select a yard and arrange transport for the vehicle.
        </AlertDescription>
      </Alert>

      {/* Yard Selection */}
      <div className='space-y-2'>
        <Label className='text-sm font-medium'>
          <Building2 className='h-4 w-4 inline mr-1.5' />
          Select Yard
        </Label>
        <YardSelector
          yards={yards}
          selectedYardId={stage.yardId}
          onSelect={handleYardSelect}
          placeholder='Choose a storage yard...'
        />
        {stage.yardName && (
          <p className='text-xs text-muted-foreground'>
            Selected: {stage.yardName}
          </p>
        )}
      </div>

      {/* Tasks */}
      <div className='border rounded-lg divide-y'>
        <WorkflowCheckbox
          id='transport-arranged'
          label='Transport Arranged'
          description='Confirm that transport to the yard has been arranged'
          checked={stage.transportArranged.completed}
          completion={stage.transportArranged.completion}
          disabled={!isYardSelected}
          onCheckedChange={(checked, notes) =>
            handleTaskChange('transportArranged', checked, notes)
          }
          showNoteOnComplete
          className='px-3'
        />
        <WorkflowCheckbox
          id='yard-notified'
          label='Notify the Yard'
          description='Inform the yard that a vehicle is coming'
          checked={stage.yardNotified.completed}
          completion={stage.yardNotified.completion}
          disabled={!isYardSelected || !stage.transportArranged.completed}
          onCheckedChange={(checked, notes) =>
            handleTaskChange('yardNotified', checked, notes)
          }
          showNoteOnComplete
          className='px-3'
        />
        <WorkflowCheckbox
          id='photos-requested'
          label='Photos Requested'
          description='Request photos of the vehicle from the yard'
          checked={stage.photosRequested.completed}
          completion={stage.photosRequested.completion}
          disabled={!isYardSelected || !stage.yardNotified.completed}
          onCheckedChange={(checked, notes) =>
            handleTaskChange('photosRequested', checked, notes)
          }
          showNoteOnComplete
          className='px-3'
        />
      </div>

      {/* Status Summary */}
      {!isYardSelected && (
        <p className='text-xs text-muted-foreground text-center'>
          Select a yard to enable transport tasks
        </p>
      )}
    </div>
  )
}
