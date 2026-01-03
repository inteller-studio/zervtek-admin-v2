'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import {
  MdArrowBack,
  MdPerson,
  MdPersonAdd,
  MdPeople,
  MdBolt,
  MdCheckCircle,
  MdTranslate,
  MdFactCheck,
  MdAccessTime,
  MdSend,
  MdEmail,
} from 'react-icons/md'
import { motion } from 'framer-motion'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { requests as allRequests, type ServiceRequest, type InspectionMedia, type InspectionNote } from '../../requests/data/requests'
import { auctions } from '../../auctions/data/auctions'
import { MediaUploadSection } from './media-upload-section'
import { InspectionNotes } from './inspection-notes'
import { AssignInspectorDrawer } from './assign-inspector-drawer'
import { getStatusVariant, CURRENT_USER_ID, CURRENT_USER_NAME, CURRENT_USER_ROLE } from '../types'

interface TaskDetailPageProps {
  taskId: string
}

const auctionMap = new Map(auctions.map((a) => [a.id, a]))

export function TaskDetailPage({ taskId }: TaskDetailPageProps) {
  const router = useRouter()

  const [request, setRequest] = useState<ServiceRequest | null>(() => {
    return allRequests.find((r) => r.id === taskId) || null
  })

  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false)
  const [translationText, setTranslationText] = useState('')
  const [isSending, setIsSending] = useState(false)

  const canAssignOthers = ['superadmin', 'admin', 'manager'].includes(CURRENT_USER_ROLE)

  const auction = useMemo(() => {
    if (!request?.auctionId) return null
    return auctionMap.get(request.auctionId)
  }, [request?.auctionId])

  const vehicleInfo = useMemo(() => {
    if (auction) {
      return {
        name: `${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`,
        year: auction.vehicleInfo.year,
        make: auction.vehicleInfo.make,
        model: auction.vehicleInfo.model,
        lotNo: auction.lotNumber,
        auctionHouse: auction.auctionHouse,
        image: auction.vehicleInfo.images?.[0] || '/placeholder-car.jpg',
        grade: auction.vehicleInfo.grade || 'N/A',
      }
    }
    if (request?.vehicleInfo) {
      return {
        name: `${request.vehicleInfo.year} ${request.vehicleInfo.make} ${request.vehicleInfo.model}`,
        year: request.vehicleInfo.year,
        make: request.vehicleInfo.make,
        model: request.vehicleInfo.model,
        lotNo: 'N/A',
        auctionHouse: 'N/A',
        image: '/placeholder-car.jpg',
        grade: 'N/A',
      }
    }
    return null
  }, [auction, request?.vehicleInfo])

  if (!request) {
    return (
      <Main className='flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold'>Task not found</h2>
          <Button variant='outline' className='mt-4' onClick={() => router.push('/tasks')}>
            <MdArrowBack className='mr-2 h-4 w-4' />
            Back to Tasks
          </Button>
        </div>
      </Main>
    )
  }

  const isTranslation = request.type === 'translation'
  const isCompleted = request.status === 'completed'
  const isPending = request.status === 'pending'
  const isAssigned = request.status === 'assigned'
  const isInProgress = request.status === 'in_progress'

  // Handlers
  const handleAssignToMe = () => {
    setRequest(prev => prev ? {
      ...prev,
      assignedTo: CURRENT_USER_ID,
      assignedToName: CURRENT_USER_NAME,
      status: 'assigned',
    } : null)
    toast.success('Assigned to you')
  }

  const handleAssignStaff = (staffId: string, staffName: string) => {
    setRequest(prev => prev ? {
      ...prev,
      assignedTo: staffId,
      assignedToName: staffName,
      status: 'assigned',
    } : null)
    setAssignDrawerOpen(false)
    toast.success(`Assigned to ${staffName}`)
  }

  const handleStartInspection = () => {
    setRequest(prev => prev ? { ...prev, status: 'in_progress', updatedAt: new Date() } : null)
    toast.success('Inspection started')
  }

  const handleCompleteInspection = () => {
    setRequest(prev => prev ? {
      ...prev,
      status: 'completed',
      updatedAt: new Date(),
      completedAt: new Date()
    } : null)
    toast.success('Inspection completed and sent to customer')
  }

  const handleAddMedia = (newMedia: InspectionMedia[]) => {
    setRequest(prev => prev ? {
      ...prev,
      inspectionMedia: [...(prev.inspectionMedia || []), ...newMedia],
    } : null)
  }

  const handleDeleteMedia = (mediaId: string) => {
    setRequest(prev => prev ? {
      ...prev,
      inspectionMedia: (prev.inspectionMedia || []).filter(m => m.id !== mediaId),
    } : null)
  }

  const handleAddNote = (note: InspectionNote) => {
    setRequest(prev => prev ? {
      ...prev,
      inspectionNotes: [...(prev.inspectionNotes || []), note],
    } : null)
  }

  const handleSendTranslation = async () => {
    if (!translationText.trim()) {
      toast.error('Please enter translation text')
      return
    }
    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setRequest(prev => prev ? {
      ...prev,
      status: 'completed',
      updatedAt: new Date(),
      completedAt: new Date()
    } : null)
    setIsSending(false)
    toast.success('Translation sent successfully!')
  }

  return (
    <>
      <Header fixed>
        <Button variant='ghost' size='sm' onClick={() => router.push('/tasks')} className='gap-2'>
          <MdArrowBack className='h-4 w-4' />
          Back to Tasks
        </Button>
      </Header>

      <Main className='p-6'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className='w-full lg:w-80 flex-shrink-0'
          >
            <div className='rounded-xl border bg-card overflow-hidden sticky top-20'>
              {/* Vehicle Image */}
              {vehicleInfo && (
                <div className='relative aspect-[4/3] bg-muted'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vehicleInfo.image}
                    alt={vehicleInfo.name}
                    className='h-full w-full object-cover'
                  />
                  {/* Type Badge */}
                  <div className='absolute top-3 right-3'>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium shadow-sm',
                      isTranslation ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                    )}>
                      {isTranslation ? <MdTranslate className='h-3.5 w-3.5' /> : <MdFactCheck className='h-3.5 w-3.5' />}
                      {isTranslation ? 'Translation' : 'Inspection'}
                    </span>
                  </div>
                </div>
              )}

              {/* Vehicle Details */}
              <div className='p-4 space-y-4'>
                {vehicleInfo && (
                  <div>
                    <h1 className='text-lg font-semibold'>{vehicleInfo.name}</h1>
                    <p className='text-sm text-muted-foreground mt-1'>
                      <span className='font-mono'>{vehicleInfo.lotNo}</span>
                      <span className='mx-1.5'>•</span>
                      <span>{vehicleInfo.auctionHouse}</span>
                    </p>
                    {vehicleInfo.grade !== 'N/A' && (
                      <p className='text-sm text-muted-foreground mt-0.5'>
                        Grade {vehicleInfo.grade}
                      </p>
                    )}
                  </div>
                )}

                <div className='h-px bg-border' />

                {/* Customer Info */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-3'>
                    <div className='h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center'>
                      <span className='text-sm font-medium text-primary'>
                        {request.customerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-medium truncate'>{request.customerName}</p>
                      <p className='text-xs text-muted-foreground flex items-center gap-1'>
                        <MdEmail className='h-3 w-3' />
                        <span className='truncate'>{request.customerEmail}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className='h-px bg-border' />

                {/* Status & Meta */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Status</span>
                    <Badge variant={getStatusVariant(request.status) as any} className='capitalize'>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {request.assignedToName && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>Assigned to</span>
                      <span className='text-sm font-medium'>{request.assignedToName}</span>
                    </div>
                  )}

                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Created</span>
                    <span className='text-sm'>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                  </div>

                  {request.completedAt && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>Completed</span>
                      <span className='text-sm'>{format(new Date(request.completedAt), 'MMM d, HH:mm')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className='flex-1 space-y-6'
          >
            {/* Action Buttons */}
            {!isCompleted && (
              <div className='rounded-xl border bg-card p-4'>
                <h2 className='text-sm font-medium text-muted-foreground mb-3'>Actions</h2>
                <div className='flex flex-wrap gap-3'>
                  {isPending && (
                    <>
                      <Button size='lg' onClick={handleAssignToMe} className='flex-1 min-w-[140px]'>
                        <MdPersonAdd className='h-5 w-5 mr-2' />
                        Assign to Me
                      </Button>
                      {canAssignOthers && (
                        <Button size='lg' variant='outline' onClick={() => setAssignDrawerOpen(true)} className='flex-1 min-w-[140px]'>
                          <MdPeople className='h-5 w-5 mr-2' />
                          Assign Staff
                        </Button>
                      )}
                    </>
                  )}

                  {isAssigned && !isTranslation && (
                    <Button size='lg' onClick={handleStartInspection} className='flex-1'>
                      <MdBolt className='h-5 w-5 mr-2' />
                      Start Inspection
                    </Button>
                  )}

                  {isInProgress && !isTranslation && (
                    <Button size='lg' onClick={handleCompleteInspection} className='flex-1'>
                      <MdCheckCircle className='h-5 w-5 mr-2' />
                      Complete & Send
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Translation Content */}
            {isTranslation && (
              <div className='rounded-xl border bg-card overflow-hidden'>
                <div className='p-4 border-b bg-muted/30'>
                  <h2 className='font-semibold'>Translation</h2>
                </div>
                <div className='p-4'>
                  {isCompleted ? (
                    <div className='rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 border border-emerald-200 dark:border-emerald-800'>
                      <div className='flex items-center gap-2 text-emerald-700 dark:text-emerald-400'>
                        <MdCheckCircle className='h-5 w-5' />
                        <span className='font-medium'>Translation completed</span>
                      </div>
                      {request.completedAt && (
                        <p className='text-sm text-emerald-600 dark:text-emerald-500 mt-1'>
                          Sent on {format(new Date(request.completedAt), 'PPp')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      <Textarea
                        placeholder='Enter translation here...'
                        value={translationText}
                        onChange={(e) => setTranslationText(e.target.value)}
                        className='min-h-[240px] resize-none'
                        disabled={!request.assignedTo}
                      />
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>
                          {translationText.length} characters
                        </span>
                        <Button
                          size='lg'
                          onClick={handleSendTranslation}
                          disabled={!request.assignedTo || isSending || !translationText.trim()}
                        >
                          <MdSend className='h-5 w-5 mr-2' />
                          {isSending ? 'Sending...' : 'Send Translation'}
                        </Button>
                      </div>
                      {!request.assignedTo && (
                        <p className='text-sm text-amber-600 dark:text-amber-400'>
                          Assign this task to yourself to start translating
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inspection Content */}
            {!isTranslation && (
              <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                <div className='rounded-xl border bg-card overflow-hidden'>
                  <div className='p-4 border-b bg-muted/30'>
                    <h2 className='font-semibold'>Inspection Media</h2>
                  </div>
                  <div className='p-4'>
                    <MediaUploadSection
                      media={request.inspectionMedia || []}
                      onAddMedia={handleAddMedia}
                      onDeleteMedia={handleDeleteMedia}
                      disabled={isCompleted || isPending}
                      currentUser={CURRENT_USER_NAME}
                    />
                  </div>
                </div>

                <div className='rounded-xl border bg-card overflow-hidden'>
                  <div className='p-4 border-b bg-muted/30'>
                    <h2 className='font-semibold'>Inspection Notes</h2>
                  </div>
                  <div className='p-4'>
                    <InspectionNotes
                      notes={request.inspectionNotes || []}
                      onAddNote={handleAddNote}
                      disabled={isCompleted || isPending}
                      currentUser={CURRENT_USER_NAME}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </Main>

      {/* Assign Inspector Drawer */}
      <AssignInspectorDrawer
        open={assignDrawerOpen}
        onOpenChange={setAssignDrawerOpen}
        request={request}
        onAssign={handleAssignStaff}
      />
    </>
  )
}
