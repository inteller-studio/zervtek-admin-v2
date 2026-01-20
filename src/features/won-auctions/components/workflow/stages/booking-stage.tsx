'use client'

import { MdDirectionsBoat, MdViewInAr, MdOpenInNew } from 'react-icons/md'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../../data/won-auctions'
import {
  type PurchaseWorkflow,
  type ShippingMethod,
  type BookingStatus,
  type TaskCompletion,
  type ContainerSize,
  CONTAINER_SIZES,
} from '../../../types/workflow'
import { updateWorkflowStage, updateTaskCompletion } from '../../../utils/workflow'
import { WorkflowCheckbox } from '../shared/workflow-checkbox'
import { ShippingAgentSelector } from '../shared/shipping-agent-selector'
import { mockShippingAgents } from '../../../../shipping-agents/data/shipping-agents'
import { type ShippingAgent } from '../../../../shipping-agents/types'

interface BookingStageProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
}

export function BookingStage({
  workflow,
  onWorkflowUpdate,
  currentUser,
}: BookingStageProps) {
  const stage = workflow.stages.booking

  const handleBookingRequestedChange = (checked: boolean, notes?: string) => {
    const updatedStage = {
      ...stage,
      bookingRequested: updateTaskCompletion(
        stage.bookingRequested,
        checked,
        currentUser,
        notes
      ),
      status: 'in_progress' as const,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'booking', updatedStage))
  }

  const handleShippingMethodChange = (method: ShippingMethod) => {
    const updatedStage = {
      ...stage,
      shippingMethod: method,
      status: 'in_progress' as const,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'booking', updatedStage))
  }

  const handleShippingAgentChange = (agent: ShippingAgent | null) => {
    const updatedStage = {
      ...stage,
      shippingAgentId: agent?.id || null,
      shippingAgentName: agent?.name,
      status: 'in_progress' as const,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'booking', updatedStage))
  }

  const handleBookingDetailsChange = (field: string, value: string | Date | number) => {
    const updatedStage = {
      ...stage,
      bookingDetails: {
        ...stage.bookingDetails,
        [field]: value,
      },
      status: 'in_progress' as const,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'booking', updatedStage))
  }

  const handleBookingStatusChange = (status: BookingStatus) => {
    const updatedStage = {
      ...stage,
      bookingStatus: status,
      status: 'in_progress' as const,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'booking', updatedStage))
  }

  const handleTaskChange = (
    task: 'sentSIAndEC' | 'receivedSO',
    checked: boolean,
    notes?: string
  ) => {
    const updatedTask = updateTaskCompletion(stage[task], checked, currentUser, notes)

    // Determine current state for completion check
    const sentSIAndECCompleted = task === 'sentSIAndEC' ? checked : stage.sentSIAndEC.completed
    const receivedSOCompleted = task === 'receivedSO' ? checked : stage.receivedSO.completed

    // Check if all required tasks are complete
    const allComplete =
      stage.bookingRequested.completed &&
      stage.shippingMethod !== null &&
      stage.bookingStatus === 'confirmed' &&
      sentSIAndECCompleted &&
      receivedSOCompleted

    const updatedStage = {
      ...stage,
      [task]: updatedTask,
      status: allComplete ? ('completed' as const) : ('in_progress' as const),
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'booking', updatedStage))
  }

  // Edit handlers for inline note editing
  const handleBookingRequestedEdit = (completion: TaskCompletion) => {
    const updatedStage = {
      ...stage,
      bookingRequested: { ...stage.bookingRequested, completion },
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'booking', updatedStage))
  }

  const handleTaskEdit = (task: 'sentSIAndEC' | 'receivedSO', completion: TaskCompletion) => {
    const updatedStage = {
      ...stage,
      [task]: { ...stage[task], completion },
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'booking', updatedStage))
  }

  const isBookingConfirmed = stage.bookingStatus === 'confirmed'

  return (
    <div className='space-y-4'>
      {/* Shipping Method Selection */}
      <div className='space-y-3'>
        <Label className='text-sm font-medium'>Shipping Method</Label>
        <RadioGroup
          value={stage.shippingMethod || undefined}
          onValueChange={(value) => handleShippingMethodChange(value as ShippingMethod)}
          disabled={isBookingConfirmed}
          className='grid grid-cols-2 gap-3'
        >
          <Label
            htmlFor='roro'
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 transition-colors',
              stage.shippingMethod === 'roro' && 'border-primary bg-primary/5',
              isBookingConfirmed ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
            )}
          >
            <RadioGroupItem value='roro' id='roro' disabled={isBookingConfirmed} />
            <div className='flex items-center gap-2'>
              <MdDirectionsBoat className='h-4 w-4 text-blue-600' />
              <div>
                <p className='text-sm font-medium'>RoRo</p>
                <p className='text-xs text-muted-foreground'>Roll-on/Roll-off</p>
              </div>
            </div>
          </Label>
          <Label
            htmlFor='container'
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 transition-colors',
              stage.shippingMethod === 'container' && 'border-primary bg-primary/5',
              isBookingConfirmed ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
            )}
          >
            <RadioGroupItem value='container' id='container' disabled={isBookingConfirmed} />
            <div className='flex items-center gap-2'>
              <MdViewInAr className='h-4 w-4 text-amber-600' />
              <div>
                <p className='text-sm font-medium'>Container</p>
                <p className='text-xs text-muted-foreground'>Enclosed shipping</p>
              </div>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Shipping Agent Selection - shows after shipping method is selected */}
      {stage.shippingMethod && (
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium'>Shipping Agent</Label>
            <Link
              href='/admin/shipping-agents'
              target='_blank'
              className='text-xs text-primary hover:underline flex items-center gap-1'
            >
              Manage Agents
              <MdOpenInNew className='h-3 w-3' />
            </Link>
          </div>
          <ShippingAgentSelector
            agents={mockShippingAgents}
            selectedAgentId={stage.shippingAgentId}
            onSelect={handleShippingAgentChange}
            placeholder='Select a shipping agent...'
            disabled={isBookingConfirmed}
          />
        </div>
      )}

      {/* Booking Request */}
      <div className='border rounded-lg'>
        <WorkflowCheckbox
          id='booking-requested'
          label='Booking Requested'
          description='Confirm that a shipping booking has been requested from the forwarder'
          checked={stage.bookingRequested.completed}
          completion={stage.bookingRequested.completion}
          disabled={!stage.shippingMethod}
          onCheckedChange={handleBookingRequestedChange}
          onEdit={handleBookingRequestedEdit}
          showNoteOnComplete
          className='px-3'
        />
      </div>

      {/* Booking Details */}
      {stage.bookingRequested.completed && (
        <>
          <Separator />
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-sm font-medium'>Booking Details</Label>
              <div className='flex items-center gap-2'>
                <Label htmlFor='booking-status' className='text-xs text-muted-foreground'>
                  Status:
                </Label>
                <Select
                  value={stage.bookingStatus}
                  onValueChange={(value) => handleBookingStatusChange(value as BookingStatus)}
                  disabled={isBookingConfirmed}
                >
                  <SelectTrigger className={cn('h-7 w-32 text-xs', isBookingConfirmed && 'opacity-70')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='confirmed'>Confirmed</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Common Fields - Both RoRo and Container */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Booking Number</Label>
                <Input
                  placeholder='BK-12345'
                  value={stage.bookingDetails.bookingNumber || ''}
                  onChange={(e) => handleBookingDetailsChange('bookingNumber', e.target.value)}
                  disabled={isBookingConfirmed}
                  className='h-8 text-sm'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Vessel Name</Label>
                <Input
                  placeholder='MV Pacific Star'
                  value={stage.bookingDetails.vesselName || ''}
                  onChange={(e) => handleBookingDetailsChange('vesselName', e.target.value)}
                  disabled={isBookingConfirmed}
                  className='h-8 text-sm'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Voyage Number</Label>
                <Input
                  placeholder='VOY-001'
                  value={stage.bookingDetails.voyageNumber || ''}
                  onChange={(e) => handleBookingDetailsChange('voyageNumber', e.target.value)}
                  disabled={isBookingConfirmed}
                  className='h-8 text-sm'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Port of Loading</Label>
                <Input
                  placeholder='Yokohama'
                  value={stage.bookingDetails.portOfLoading || ''}
                  onChange={(e) => handleBookingDetailsChange('portOfLoading', e.target.value)}
                  disabled={isBookingConfirmed}
                  className='h-8 text-sm'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Port of Discharge</Label>
                <Input
                  placeholder='Colombo'
                  value={stage.bookingDetails.portOfDischarge || ''}
                  onChange={(e) => handleBookingDetailsChange('portOfDischarge', e.target.value)}
                  disabled={isBookingConfirmed}
                  className='h-8 text-sm'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>ETD (Departure)</Label>
                <Input
                  type='date'
                  value={
                    stage.bookingDetails.etd
                      ? new Date(stage.bookingDetails.etd).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => handleBookingDetailsChange('etd', new Date(e.target.value))}
                  disabled={isBookingConfirmed}
                  className='h-8 text-sm'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>ETA (Arrival)</Label>
                <Input
                  type='date'
                  value={
                    stage.bookingDetails.eta
                      ? new Date(stage.bookingDetails.eta).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => handleBookingDetailsChange('eta', new Date(e.target.value))}
                  disabled={isBookingConfirmed}
                  className='h-8 text-sm'
                />
              </div>
            </div>

            {/* Container-Specific Fields */}
            {stage.shippingMethod === 'container' && (
              <>
                <Separator className='my-3' />
                <div className='space-y-3'>
                  <Label className='text-xs font-medium text-muted-foreground'>Container Details</Label>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1.5'>
                      <Label className='text-xs'>Container Number</Label>
                      <Input
                        placeholder='ABCD1234567'
                        value={stage.bookingDetails.containerNumber || ''}
                        onChange={(e) => handleBookingDetailsChange('containerNumber', e.target.value)}
                        disabled={isBookingConfirmed}
                        className='h-8 text-sm'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs'>Container Size</Label>
                      <Select
                        value={stage.bookingDetails.containerSize || ''}
                        onValueChange={(value) => handleBookingDetailsChange('containerSize', value as ContainerSize)}
                        disabled={isBookingConfirmed}
                      >
                        <SelectTrigger className={cn('h-8 text-sm', isBookingConfirmed && 'opacity-70')}>
                          <SelectValue placeholder='Select size' />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTAINER_SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs'>Seal Number</Label>
                      <Input
                        placeholder='SL12345'
                        value={stage.bookingDetails.sealNumber || ''}
                        onChange={(e) => handleBookingDetailsChange('sealNumber', e.target.value)}
                        disabled={isBookingConfirmed}
                        className='h-8 text-sm'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs'>CFS Location</Label>
                      <Input
                        placeholder='Tokyo CFS'
                        value={stage.bookingDetails.cfsLocation || ''}
                        onChange={(e) => handleBookingDetailsChange('cfsLocation', e.target.value)}
                        disabled={isBookingConfirmed}
                        className='h-8 text-sm'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs'>Stuffing Date</Label>
                      <Input
                        type='date'
                        value={
                          stage.bookingDetails.stuffingDate
                            ? new Date(stage.bookingDetails.stuffingDate).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => handleBookingDetailsChange('stuffingDate', new Date(e.target.value))}
                        disabled={isBookingConfirmed}
                        className='h-8 text-sm'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs'>Units per Container</Label>
                      <Input
                        type='number'
                        min={1}
                        max={4}
                        placeholder='1'
                        value={stage.bookingDetails.unitsPerContainer || ''}
                        onChange={(e) => handleBookingDetailsChange('unitsPerContainer', parseInt(e.target.value) || 1)}
                        disabled={isBookingConfirmed}
                        className='h-8 text-sm'
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className='space-y-1.5'>
              <Label className='text-xs'>Notes</Label>
              <Textarea
                placeholder='Additional booking notes...'
                value={stage.bookingDetails.notes || ''}
                onChange={(e) => handleBookingDetailsChange('notes', e.target.value)}
                disabled={isBookingConfirmed}
                rows={2}
                className='text-sm'
              />
            </div>
          </div>
        </>
      )}

      {/* Document Tasks */}
      {stage.bookingRequested.completed && (
        <>
          <Separator />
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Documentation Tasks</Label>
            <div className='border rounded-lg divide-y'>
              <WorkflowCheckbox
                id='sent-si-ec'
                label='Send SI and EC to Forwarder'
                description='Send Shipping Instructions and Export Certificate to the forwarder'
                checked={stage.sentSIAndEC.completed}
                completion={stage.sentSIAndEC.completion}
                disabled={!isBookingConfirmed}
                onCheckedChange={(checked, notes) =>
                  handleTaskChange('sentSIAndEC', checked, notes)
                }
                onEdit={(completion) => handleTaskEdit('sentSIAndEC', completion)}
                showNoteOnComplete
                className='px-3'
              />
              <WorkflowCheckbox
                id='received-so'
                label='Received SO from Forwarder'
                description='Confirm receipt of Shipping Order from the forwarder'
                checked={stage.receivedSO.completed}
                completion={stage.receivedSO.completion}
                disabled={!stage.sentSIAndEC.completed}
                onCheckedChange={(checked, notes) =>
                  handleTaskChange('receivedSO', checked, notes)
                }
                onEdit={(completion) => handleTaskEdit('receivedSO', completion)}
                showNoteOnComplete
                className='px-3'
              />
            </div>
          </div>
        </>
      )}

      {/* Status Message */}
      {!stage.shippingMethod && (
        <p className='text-xs text-muted-foreground text-center'>
          Select a shipping method to continue
        </p>
      )}
    </div>
  )
}
