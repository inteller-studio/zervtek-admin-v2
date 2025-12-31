'use client'

import { MdCalendarToday, MdDirectionsCar, MdCheckCircle, MdFactCheck, MdPerson, MdPersonAdd, MdPeople, MdBolt } from 'react-icons/md'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ServiceRequest, InspectionMedia, InspectionNote } from '../../requests/data/requests'
import { AssignInspectorDrawer } from './assign-inspector-drawer'
import { MediaUploadSection } from './media-upload-section'
import { InspectionNotes } from './inspection-notes'
import { getStatusVariant, getInspectionType, CURRENT_USER_NAME } from '../types'

interface InspectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: ServiceRequest | null
  canAssignOthers: boolean
  assignDrawerOpen: boolean
  onAssignDrawerOpenChange: (open: boolean) => void
  onAssignToMe: (request: ServiceRequest) => void
  onAssignStaff: (staffId: string, staffName: string) => void
  onStartInspection: () => void
  onCompleteInspection: () => void
  onAddMedia: (media: InspectionMedia[]) => void
  onDeleteMedia: (mediaId: string) => void
  onAddNote: (note: InspectionNote) => void
}

function getVehicleName(request: ServiceRequest) {
  if (request.vehicleInfo) {
    return `${request.vehicleInfo.year} ${request.vehicleInfo.make} ${request.vehicleInfo.model}`
  }
  return 'Unknown Vehicle'
}

export function InspectionModal({
  open,
  onOpenChange,
  request,
  canAssignOthers,
  assignDrawerOpen,
  onAssignDrawerOpenChange,
  onAssignToMe,
  onAssignStaff,
  onStartInspection,
  onCompleteInspection,
  onAddMedia,
  onDeleteMedia,
  onAddNote,
}: InspectionModalProps) {
  if (!request) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='!max-w-5xl !w-[90vw] max-h-[90vh] overflow-hidden flex flex-col'>
          <DialogHeader className='flex-shrink-0'>
            <DialogTitle className='flex items-center gap-2'>
              <MdFactCheck className='h-5 w-5 text-amber-500' />
              Inspection - {request.requestId}
            </DialogTitle>
          </DialogHeader>

          <div className='flex-1 flex flex-col min-h-0 overflow-hidden'>
            {/* Header Info */}
            <div className='flex items-start justify-between gap-4 pb-4 border-b flex-shrink-0'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <MdDirectionsCar className='h-5 w-5 text-muted-foreground' />
                  <h3 className='font-semibold'>{getVehicleName(request)}</h3>
                  <Badge variant={getStatusVariant(request.status) as any}>
                    {request.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                  <span>{getInspectionType(request.title)}</span>
                  <span>•</span>
                  <span>{request.customerName}</span>
                  <span>•</span>
                  <Badge
                    variant={
                      request.priority === 'urgent'
                        ? 'red'
                        : request.priority === 'high'
                          ? 'orange'
                          : ('zinc' as any)
                    }
                    className='capitalize'
                  >
                    {request.priority}
                  </Badge>
                </div>
              </div>
              <div className='flex items-center gap-2 flex-shrink-0'>
                {!request.assignedTo &&
                  (canAssignOthers ? (
                    <>
                      <Button size='sm' variant='outline' onClick={() => onAssignToMe(request)}>
                        <MdPersonAdd className='h-4 w-4 mr-1.5' />
                        My Task
                      </Button>
                      <Button size='sm' variant='outline' onClick={() => onAssignDrawerOpenChange(true)}>
                        <MdPeople className='h-4 w-4 mr-1.5' />
                        Assign Staff
                      </Button>
                    </>
                  ) : (
                    <Button size='sm' variant='outline' onClick={() => onAssignToMe(request)}>
                      <MdPersonAdd className='h-4 w-4 mr-1.5' />
                      Assign to Me
                    </Button>
                  ))}
                {request.status === 'assigned' && (
                  <Button size='sm' onClick={onStartInspection}>
                    <MdBolt className='h-4 w-4 mr-1.5' />
                    Start Inspection
                  </Button>
                )}
                {request.status === 'in_progress' && (
                  <Button size='sm' onClick={onCompleteInspection}>
                    <MdCheckCircle className='h-4 w-4 mr-1.5' />
                    Complete & Send
                  </Button>
                )}
              </div>
            </div>

            {/* Content Area - Split View */}
            <div className='flex-1 flex min-h-0 mt-4 gap-4 overflow-hidden'>
              <div className='w-1/2 flex flex-col border rounded-lg overflow-hidden'>
                <div className='p-2 border-b bg-muted/30 flex-shrink-0'>
                  <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                    Inspection Media
                  </span>
                </div>
                <div className='flex-1 p-4 overflow-y-auto'>
                  <MediaUploadSection
                    media={request.inspectionMedia || []}
                    onAddMedia={onAddMedia}
                    onDeleteMedia={onDeleteMedia}
                    disabled={request.status === 'completed' || request.status === 'pending'}
                    currentUser={CURRENT_USER_NAME}
                  />
                </div>
              </div>
              <div className='w-1/2 flex flex-col border rounded-lg overflow-hidden'>
                <div className='p-2 border-b bg-muted/30 flex-shrink-0'>
                  <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                    Inspection Notes
                  </span>
                </div>
                <div className='flex-1 p-4 overflow-y-auto'>
                  <InspectionNotes
                    notes={request.inspectionNotes || []}
                    onAddNote={onAddNote}
                    disabled={request.status === 'completed' || request.status === 'pending'}
                    currentUser={CURRENT_USER_NAME}
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Details Bar */}
            {request.vehicleInfo && (
              <div className='border-t bg-muted/30 p-3 mt-4 rounded-lg flex-shrink-0'>
                <div className='flex items-center gap-6 text-sm overflow-x-auto'>
                  <div className='flex items-center gap-2'>
                    <MdCalendarToday className='h-4 w-4 text-muted-foreground' />
                    <span className='text-muted-foreground'>Year:</span>
                    <span className='font-medium'>{request.vehicleInfo.year}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground'>Make:</span>
                    <span className='font-medium'>{request.vehicleInfo.make}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground'>Model:</span>
                    <span className='font-medium'>{request.vehicleInfo.model}</span>
                  </div>
                  {request.vehicleInfo.vin && (
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground'>VIN:</span>
                      <span className='font-mono text-xs'>{request.vehicleInfo.vin}</span>
                    </div>
                  )}
                  {request.assignedToName && (
                    <div className='flex items-center gap-2'>
                      <MdPerson className='h-4 w-4 text-muted-foreground' />
                      <span className='text-muted-foreground'>Assigned:</span>
                      <span className='font-medium'>{request.assignedToName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Inspector Drawer */}
      <AssignInspectorDrawer
        open={assignDrawerOpen}
        onOpenChange={onAssignDrawerOpenChange}
        request={request}
        onAssign={onAssignStaff}
      />
    </>
  )
}
