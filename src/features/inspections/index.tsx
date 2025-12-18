'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  ClipboardCheck,
  Car,
  UserPlus,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search } from '@/components/search'
import { cn } from '@/lib/utils'

import {
  requests as allRequests,
  type ServiceRequest,
  type InspectionMedia,
  type InspectionNote,
} from '../requests/data/requests'
import { AssignInspectorDrawer } from './components/assign-inspector-drawer'
import { MediaUploadSection } from './components/media-upload-section'
import { InspectionNotes } from './components/inspection-notes'

const CURRENT_USER_ID = 'admin1'
const CURRENT_USER_NAME = 'Current Admin'
const CURRENT_USER_ROLE: 'superadmin' | 'admin' | 'manager' | 'cashier' = 'admin'

const canAssignOthers = ['superadmin', 'admin', 'manager'].includes(CURRENT_USER_ROLE)

// Filter to only inspection requests
const initialRequests = allRequests.filter((r) => r.type === 'inspection')

type InspectionType = 'all' | 'full' | 'pre_purchase' | 'performance' | 'condition'

export function Inspections() {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    initialRequests[0] || null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [inspectionType, setInspectionType] = useState<InspectionType>('all')
  const [showMyTasks, setShowMyTasks] = useState(false)
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Compute counts
  const counts = useMemo(() => {
    const all = requests.length
    const full = requests.filter((r) => r.title.includes('Full Inspection')).length
    const prePurchase = requests.filter((r) => r.title.includes('Pre-purchase')).length
    const performance = requests.filter((r) => r.title.includes('Performance')).length
    const myTasks = requests.filter((r) => r.assignedTo === CURRENT_USER_ID).length
    return { all, full, prePurchase, performance, myTasks }
  }, [requests])

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.vehicleInfo?.vin?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter

      const matchesType =
        inspectionType === 'all' ||
        (inspectionType === 'full' && request.title.includes('Full Inspection')) ||
        (inspectionType === 'pre_purchase' && request.title.includes('Pre-purchase')) ||
        (inspectionType === 'performance' && request.title.includes('Performance')) ||
        (inspectionType === 'condition' && request.title.includes('Condition'))

      const matchesMyTasks = !showMyTasks || request.assignedTo === CURRENT_USER_ID

      return matchesSearch && matchesStatus && matchesType && matchesMyTasks
    })
  }, [requests, searchQuery, statusFilter, inspectionType, showMyTasks])

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
  const paginatedRequests = useMemo(() => {
    return filteredRequests.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )
  }, [filteredRequests, currentPage, ITEMS_PER_PAGE])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, inspectionType, showMyTasks])

  const handleSelectRequest = (request: ServiceRequest) => {
    setSelectedRequest(request)
  }

  const handleAssignToMe = (request: ServiceRequest) => {
    const updated = requests.map((r) =>
      r.id === request.id
        ? {
            ...r,
            assignedTo: CURRENT_USER_ID,
            assignedToName: CURRENT_USER_NAME,
            status: 'assigned' as const,
          }
        : r
    )
    setRequests(updated)
    setSelectedRequest({
      ...request,
      assignedTo: CURRENT_USER_ID,
      assignedToName: CURRENT_USER_NAME,
      status: 'assigned',
    })
    toast.success(`Inspection ${request.requestId} assigned to you`)
  }

  const handleAssignStaff = (staffId: string, staffName: string) => {
    if (!selectedRequest) return
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, assignedTo: staffId, assignedToName: staffName, status: 'assigned' as const }
        : r
    )
    setRequests(updated)
    setSelectedRequest({
      ...selectedRequest,
      assignedTo: staffId,
      assignedToName: staffName,
      status: 'assigned',
    })
  }

  const handleStartInspection = () => {
    if (!selectedRequest) return
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, status: 'in_progress' as const, updatedAt: new Date() }
        : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, status: 'in_progress', updatedAt: new Date() })
    toast.success('Inspection started')
  }

  const handleCompleteInspection = () => {
    if (!selectedRequest) return
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? {
            ...r,
            status: 'completed' as const,
            updatedAt: new Date(),
            completedAt: new Date(),
          }
        : r
    )
    setRequests(updated)
    setSelectedRequest({
      ...selectedRequest,
      status: 'completed',
      updatedAt: new Date(),
      completedAt: new Date(),
    })
    toast.success('Inspection completed and sent to customer')
  }

  const handleAddMedia = (newMedia: InspectionMedia[]) => {
    if (!selectedRequest) return
    const updatedMedia = [...(selectedRequest.inspectionMedia || []), ...newMedia]
    const updated = requests.map((r) =>
      r.id === selectedRequest.id ? { ...r, inspectionMedia: updatedMedia } : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, inspectionMedia: updatedMedia })
  }

  const handleDeleteMedia = (mediaId: string) => {
    if (!selectedRequest) return
    const updatedMedia = (selectedRequest.inspectionMedia || []).filter((m) => m.id !== mediaId)
    const updated = requests.map((r) =>
      r.id === selectedRequest.id ? { ...r, inspectionMedia: updatedMedia } : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, inspectionMedia: updatedMedia })
  }

  const handleAddNote = (note: InspectionNote) => {
    if (!selectedRequest) return
    const updatedNotes = [...(selectedRequest.inspectionNotes || []), note]
    const updated = requests.map((r) =>
      r.id === selectedRequest.id ? { ...r, inspectionNotes: updatedNotes } : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, inspectionNotes: updatedNotes })
  }

  // Priority colors
  const getPriorityColor = (priority: ServiceRequest['priority']) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-amber-500',
      low: 'bg-slate-400',
    }
    return colors[priority]
  }

  const getPriorityVariant = (priority: ServiceRequest['priority']) => {
    const variants = {
      urgent: 'red',
      high: 'orange',
      medium: 'amber',
      low: 'zinc',
    }
    return variants[priority]
  }

  const getStatusVariant = (status: ServiceRequest['status']) => {
    const variants = {
      completed: 'emerald',
      in_progress: 'blue',
      assigned: 'violet',
      pending: 'amber',
      cancelled: 'zinc',
    }
    return variants[status]
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60)
    )
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`
    return format(new Date(date), 'MMM dd')
  }

  const getVehicleName = (request: ServiceRequest) => {
    if (request.vehicleInfo) {
      return `${request.vehicleInfo.year} ${request.vehicleInfo.make} ${request.vehicleInfo.model}`
    }
    return 'Unknown Vehicle'
  }

  const getInspectionType = (title: string) => {
    if (title.includes('Full Inspection')) return 'Full'
    if (title.includes('Pre-purchase')) return 'Pre-purchase'
    if (title.includes('Performance')) return 'Performance'
    if (title.includes('Condition')) return 'Condition'
    if (title.includes('Detailed')) return 'Detailed'
    return 'Inspection'
  }

  return (
    <>
      <Header fixed>
        <Search className='md:w-auto flex-1' />
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 p-4 sm:p-6'>
        {/* Header */}
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Inspections</h2>
            <p className='text-muted-foreground text-sm'>
              Manage vehicle inspection requests
            </p>
          </div>
        </div>

        {/* Filters Row */}
        <div className='flex flex-wrap items-center gap-3'>
          <Tabs
            value={inspectionType}
            onValueChange={(v) => setInspectionType(v as InspectionType)}
          >
            <TabsList>
              <TabsTrigger value='all'>All ({counts.all})</TabsTrigger>
              <TabsTrigger value='full'>Full ({counts.full})</TabsTrigger>
              <TabsTrigger value='pre_purchase'>Pre-purchase ({counts.prePurchase})</TabsTrigger>
              <TabsTrigger value='performance'>Performance ({counts.performance})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className='flex flex-1 items-center gap-2 justify-end'>
            <Button
              variant={showMyTasks ? 'secondary' : 'outline'}
              size='sm'
              onClick={() => setShowMyTasks(!showMyTasks)}
              className='gap-1.5'
            >
              <User className='h-4 w-4' />
              My Tasks
              {counts.myTasks > 0 && (
                <Badge variant='secondary' className='ml-1 h-5 min-w-5 px-1.5 text-xs'>
                  {counts.myTasks}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Split Panel Layout */}
        <div className='flex flex-1 gap-4 min-h-0'>
          {/* Left Panel - Request Queue */}
          <div className='w-[320px] flex-shrink-0 flex flex-col border rounded-lg bg-card'>
            {/* Search & Filter */}
            <div className='p-3 border-b space-y-2'>
              <Input
                placeholder='Search requests...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='h-9'
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='h-8 text-xs'>
                  <SelectValue placeholder='All Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='assigned'>Assigned</SelectItem>
                  <SelectItem value='in_progress'>In Progress</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Request List */}
            <ScrollArea className='flex-1'>
              <div className='p-2 space-y-2'>
                {paginatedRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => handleSelectRequest(request)}
                    className={cn(
                      'p-3 rounded-lg cursor-pointer transition-all border',
                      selectedRequest?.id === request.id
                        ? 'bg-primary/5 border-primary/30 shadow-sm'
                        : 'bg-card hover:bg-muted/50 border-transparent hover:border-border'
                    )}
                  >
                    <div className='flex items-start gap-3'>
                      {/* Vehicle Icon with Status Indicator */}
                      <div className='relative'>
                        <div className='w-11 h-11 rounded-lg bg-muted flex items-center justify-center'>
                          <Car className='h-5 w-5 text-muted-foreground' />
                        </div>
                        {/* Priority Dot */}
                        <div
                          className={cn(
                            'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card',
                            getPriorityColor(request.priority)
                          )}
                        />
                      </div>

                      {/* Content */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <span className='font-medium text-sm truncate'>
                            {getVehicleName(request)}
                          </span>
                          <span className='text-[10px] text-muted-foreground whitespace-nowrap'>
                            {getRelativeTime(request.createdAt)}
                          </span>
                        </div>
                        <p className='text-xs text-muted-foreground truncate mt-0.5'>
                          {request.customerName} • {getInspectionType(request.title)}
                        </p>
                        <div className='flex items-center gap-2 mt-1.5'>
                          <Badge
                            variant={getStatusVariant(request.status) as any}
                            className='text-[10px] px-1.5 h-5'
                          >
                            {request.status.replace('_', ' ')}
                          </Badge>
                          {request.assignedToName && (
                            <span className='text-[10px] text-muted-foreground flex items-center gap-1'>
                              <User className='h-3 w-3' />
                              {request.assignedToName.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {paginatedRequests.length === 0 && (
                  <div className='p-8 text-center text-muted-foreground'>
                    <ClipboardCheck className='h-8 w-8 mx-auto mb-2 opacity-50' />
                    <p className='text-sm'>No requests found</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Pagination Controls */}
            {filteredRequests.length > 0 && (
              <div className='p-3 border-t bg-muted/30'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-muted-foreground'>
                    {filteredRequests.length} request
                    {filteredRequests.length !== 1 ? 's' : ''}
                  </span>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <span className='text-xs text-muted-foreground min-w-[80px] text-center'>
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Inspection Details */}
          <div className='flex-1 flex flex-col border rounded-lg bg-card min-w-0 overflow-hidden'>
            {selectedRequest ? (
              <>
                {/* Header */}
                <div className='p-4 border-b flex-shrink-0'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Car className='h-5 w-5 text-muted-foreground' />
                        <h3 className='font-semibold'>{getVehicleName(selectedRequest)}</h3>
                        <Badge variant={getStatusVariant(selectedRequest.status) as any}>
                          {selectedRequest.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                        <span>{getInspectionType(selectedRequest.title)}</span>
                        <span>•</span>
                        <span>{selectedRequest.customerName}</span>
                        <span>•</span>
                        <span className='font-mono text-xs'>{selectedRequest.requestId}</span>
                        <span>•</span>
                        <Badge
                          variant={getPriorityVariant(selectedRequest.priority) as any}
                          className='capitalize'
                        >
                          {selectedRequest.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {!selectedRequest.assignedTo &&
                        (canAssignOthers ? (
                          <>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleAssignToMe(selectedRequest)}
                            >
                              <UserPlus className='h-4 w-4 mr-1.5' />
                              My Task
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => setAssignDrawerOpen(true)}
                            >
                              <Users className='h-4 w-4 mr-1.5' />
                              Assign Staff
                            </Button>
                          </>
                        ) : (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleAssignToMe(selectedRequest)}
                          >
                            <UserPlus className='h-4 w-4 mr-1.5' />
                            Assign to Me
                          </Button>
                        ))}
                      {selectedRequest.status === 'assigned' && (
                        <Button size='sm' onClick={handleStartInspection}>
                          <Zap className='h-4 w-4 mr-1.5' />
                          Start Inspection
                        </Button>
                      )}
                      {selectedRequest.status === 'in_progress' && (
                        <Button size='sm' onClick={handleCompleteInspection}>
                          <CheckCircle className='h-4 w-4 mr-1.5' />
                          Complete & Send
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Area - Split View */}
                <div className='flex-1 flex flex-col min-h-0'>
                  <div className='flex-1 flex min-h-0'>
                    {/* Media Upload Section */}
                    <div className='w-1/2 border-r flex flex-col'>
                      <div className='p-2 border-b bg-muted/30'>
                        <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                          Inspection Media
                        </span>
                      </div>
                      <div className='flex-1 p-4 overflow-y-auto'>
                        <MediaUploadSection
                          media={selectedRequest.inspectionMedia || []}
                          onAddMedia={handleAddMedia}
                          onDeleteMedia={handleDeleteMedia}
                          disabled={
                            selectedRequest.status === 'completed' ||
                            selectedRequest.status === 'pending'
                          }
                          currentUser={CURRENT_USER_NAME}
                        />
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className='w-1/2 flex flex-col'>
                      <div className='p-2 border-b bg-muted/30'>
                        <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                          Inspection Notes
                        </span>
                      </div>
                      <div className='flex-1 p-4 overflow-hidden'>
                        <InspectionNotes
                          notes={selectedRequest.inspectionNotes || []}
                          onAddNote={handleAddNote}
                          disabled={
                            selectedRequest.status === 'completed' ||
                            selectedRequest.status === 'pending'
                          }
                          currentUser={CURRENT_USER_NAME}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details Bar */}
                  {selectedRequest.vehicleInfo && (
                    <div className='border-t bg-muted/30 p-3 flex-shrink-0'>
                      <div className='flex items-center gap-6 text-sm overflow-x-auto'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-muted-foreground' />
                          <span className='text-muted-foreground'>Year:</span>
                          <span className='font-medium'>{selectedRequest.vehicleInfo.year}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground'>Make:</span>
                          <span className='font-medium'>{selectedRequest.vehicleInfo.make}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground'>Model:</span>
                          <span className='font-medium'>{selectedRequest.vehicleInfo.model}</span>
                        </div>
                        {selectedRequest.vehicleInfo.vin && (
                          <div className='flex items-center gap-2'>
                            <span className='text-muted-foreground'>VIN:</span>
                            <span className='font-mono text-xs'>
                              {selectedRequest.vehicleInfo.vin}
                            </span>
                          </div>
                        )}
                        {selectedRequest.assignedToName && (
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-muted-foreground' />
                            <span className='text-muted-foreground'>Assigned:</span>
                            <span className='font-medium'>{selectedRequest.assignedToName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center text-muted-foreground'>
                <div className='text-center'>
                  <ClipboardCheck className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>Select a request to view inspection details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assign Inspector Drawer */}
        <AssignInspectorDrawer
          open={assignDrawerOpen}
          onOpenChange={setAssignDrawerOpen}
          request={selectedRequest}
          onAssign={handleAssignStaff}
        />
      </Main>
    </>
  )
}
