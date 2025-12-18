'use client'

import { Ship, Container, Anchor } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { type WonAuction } from '../../../data/won-auctions'
import {
  type PurchaseWorkflow,
  type ShippingMethod,
  type BookingStatus,
  SHIPPING_METHODS,
} from '../../../types/workflow'
import { updateWorkflowStage, updateTaskCompletion } from '../../../utils/workflow'
import { WorkflowCheckbox } from '../shared/workflow-checkbox'

interface BookingStageProps {
  auction: WonAuction
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
}

export function BookingStage({
  auction,
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

  const handleBookingDetailsChange = (field: string, value: string | Date) => {
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
    const updatedStage = {
      ...stage,
      [task]: updateTaskCompletion(stage[task], checked, currentUser, notes),
    }

    // Check if all required tasks are complete
    const allComplete =
      stage.bookingRequested.completed &&
      stage.shippingMethod !== null &&
      stage.bookingStatus === 'confirmed' &&
      (task === 'sentSIAndEC' ? checked : stage.sentSIAndEC.completed) &&
      (task === 'receivedSO' ? checked : stage.receivedSO.completed)

    updatedStage.status = allComplete ? 'completed' : 'in_progress'

    onWorkflowUpdate(updateWorkflowStage(workflow, 'booking', updatedStage))
  }

  const isBookingConfirmed = stage.bookingStatus === 'confirmed'

  return (
    <div className='space-y-4'>
      {/* Info Alert */}
      <Alert>
        <Ship className='h-4 w-4' />
        <AlertDescription>
          Request shipping booking, select method, and manage shipping documentation.
        </AlertDescription>
      </Alert>

      {/* Booking Request */}
      <div className='border rounded-lg'>
        <WorkflowCheckbox
          id='booking-requested'
          label='Booking Requested'
          description='Confirm that a shipping booking has been requested from the forwarder'
          checked={stage.bookingRequested.completed}
          completion={stage.bookingRequested.completion}
          onCheckedChange={handleBookingRequestedChange}
          showNoteOnComplete
          className='px-3'
        />
      </div>

      {/* Shipping Method Selection */}
      <div className='space-y-3'>
        <Label className='text-sm font-medium'>Shipping Method</Label>
        <RadioGroup
          value={stage.shippingMethod || undefined}
          onValueChange={(value) => handleShippingMethodChange(value as ShippingMethod)}
          className='grid grid-cols-2 gap-3'
          disabled={!stage.bookingRequested.completed}
        >
          <Label
            htmlFor='roro'
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
              stage.shippingMethod === 'roro' && 'border-primary bg-primary/5',
              !stage.bookingRequested.completed && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RadioGroupItem value='roro' id='roro' disabled={!stage.bookingRequested.completed} />
            <div className='flex items-center gap-2'>
              <Ship className='h-4 w-4 text-blue-600' />
              <div>
                <p className='text-sm font-medium'>RoRo</p>
                <p className='text-xs text-muted-foreground'>Roll-on/Roll-off</p>
              </div>
            </div>
          </Label>
          <Label
            htmlFor='container'
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
              stage.shippingMethod === 'container' && 'border-primary bg-primary/5',
              !stage.bookingRequested.completed && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RadioGroupItem value='container' id='container' disabled={!stage.bookingRequested.completed} />
            <div className='flex items-center gap-2'>
              <Container className='h-4 w-4 text-amber-600' />
              <div>
                <p className='text-sm font-medium'>Container</p>
                <p className='text-xs text-muted-foreground'>Enclosed shipping</p>
              </div>
            </div>
          </Label>
        </RadioGroup>
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
                >
                  <SelectTrigger className='h-7 w-32 text-xs'>
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

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Booking Number</Label>
                <Input
                  placeholder='BK-12345'
                  value={stage.bookingDetails.bookingNumber || ''}
                  onChange={(e) => handleBookingDetailsChange('bookingNumber', e.target.value)}
                  className='h-8 text-sm'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Vessel Name</Label>
                <Input
                  placeholder='MV Pacific Star'
                  value={stage.bookingDetails.vesselName || ''}
                  onChange={(e) => handleBookingDetailsChange('vesselName', e.target.value)}
                  className='h-8 text-sm'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Voyage Number</Label>
                <Input
                  placeholder='VOY-001'
                  value={stage.bookingDetails.voyageNumber || ''}
                  onChange={(e) => handleBookingDetailsChange('voyageNumber', e.target.value)}
                  className='h-8 text-sm'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Port of Loading</Label>
                <Input
                  placeholder='Yokohama'
                  value={stage.bookingDetails.portOfLoading || ''}
                  onChange={(e) => handleBookingDetailsChange('portOfLoading', e.target.value)}
                  className='h-8 text-sm'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Port of Discharge</Label>
                <Input
                  placeholder='Colombo'
                  value={stage.bookingDetails.portOfDischarge || ''}
                  onChange={(e) => handleBookingDetailsChange('portOfDischarge', e.target.value)}
                  className='h-8 text-sm'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>ETD</Label>
                <Input
                  type='date'
                  value={
                    stage.bookingDetails.etd
                      ? new Date(stage.bookingDetails.etd).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => handleBookingDetailsChange('etd', new Date(e.target.value))}
                  className='h-8 text-sm'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs'>Notes</Label>
              <Textarea
                placeholder='Additional booking notes...'
                value={stage.bookingDetails.notes || ''}
                onChange={(e) => handleBookingDetailsChange('notes', e.target.value)}
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
                showNoteOnComplete
                className='px-3'
              />
            </div>
          </div>
        </>
      )}

      {/* Status Message */}
      {!stage.bookingRequested.completed && (
        <p className='text-xs text-muted-foreground text-center'>
          Request a booking to enable shipping details
        </p>
      )}
    </div>
  )
}
