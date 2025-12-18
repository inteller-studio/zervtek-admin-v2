'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  CheckCircle,
  Languages,
  Save,
  Zap,
  FileCheck,
  ClipboardList,
  UserPlus,
  User,
  Users,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Car,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Calendar,
  Palette,
  Hash,
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
import { Textarea } from '@/components/ui/textarea'
import { Search } from '@/components/search'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

import { requests as allRequests, type ServiceRequest } from '../requests/data/requests'
import { auctions, type Auction } from '../auctions/data/auctions'
import { AssignTranslatorDrawer } from './components/assign-translator-drawer'
import { cn } from '@/lib/utils'

// Create auction lookup map
const auctionMap = new Map(auctions.map(a => [a.id, a]))

// Get auction for a request
const getAuctionForRequest = (request: ServiceRequest): Auction | undefined => {
  if (!request.auctionId) return undefined
  return auctionMap.get(request.auctionId)
}

const CURRENT_USER_ID = 'admin1'
const CURRENT_USER_NAME = 'Current Admin'
// Simulated current user role - in real app, this comes from auth context
// 'admin' | 'manager' | 'superadmin' can assign others
// 'cashier' can only assign to themselves
const CURRENT_USER_ROLE: 'superadmin' | 'admin' | 'manager' | 'cashier' = 'admin'

const canAssignOthers = ['superadmin', 'admin', 'manager'].includes(CURRENT_USER_ROLE)

// Filter to only translation requests
const initialRequests = allRequests.filter(r => r.type === 'translation')

type TranslationType = 'all' | 'auction_sheet' | 'export_certificate' | 'my_tasks'

export function Translations() {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(initialRequests[0] || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [translationType, setTranslationType] = useState<TranslationType>('all')

  // Translation editor state
  const [translationText, setTranslationText] = useState('')
  const [imageZoom, setImageZoom] = useState(100)
  const [imageRotation, setImageRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Get auction for selected request
  const selectedAuction = selectedRequest ? getAuctionForRequest(selectedRequest) : undefined
  const vehicleImages = selectedAuction?.vehicleInfo.images || []

  // Compute counts for tabs
  const counts = useMemo(() => {
    const all = requests.length
    const auctionSheet = requests.filter(r => r.title.includes('Auction Sheet')).length
    const exportCert = requests.filter(r => r.title.includes('Export Certificate')).length
    const myTasks = requests.filter(r => r.assignedTo === CURRENT_USER_ID).length
    return { all, auctionSheet, exportCert, myTasks }
  }, [requests])

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestId.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter

      const matchesType = translationType === 'all' ||
        translationType === 'my_tasks' ||
        (translationType === 'auction_sheet' && request.title.includes('Auction Sheet')) ||
        (translationType === 'export_certificate' && request.title.includes('Export Certificate'))

      const matchesMyTasks = translationType !== 'my_tasks' || request.assignedTo === CURRENT_USER_ID

      return matchesSearch && matchesStatus && matchesType && matchesMyTasks
    })
  }, [requests, searchQuery, statusFilter, translationType])

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
  }, [searchQuery, statusFilter, translationType])

  const handleSelectRequest = (request: ServiceRequest) => {
    setSelectedRequest(request)
    // Load existing translation if any (in real app, this would come from the request data)
    setTranslationText('')
    setImageZoom(100)
    setImageRotation(0)
    setSelectedImageIndex(0)
  }

  const handleAssignToMe = (request: ServiceRequest) => {
    const updated = requests.map((r) =>
      r.id === request.id
        ? { ...r, assignedTo: CURRENT_USER_ID, assignedToName: CURRENT_USER_NAME, status: 'assigned' as const }
        : r
    )
    setRequests(updated)
    setSelectedRequest({ ...request, assignedTo: CURRENT_USER_ID, assignedToName: CURRENT_USER_NAME, status: 'assigned' })
    toast.success(`Request ${request.requestId} assigned to you`)
  }

  const handleAssignStaff = (staffId: string, staffName: string) => {
    if (!selectedRequest) return
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, assignedTo: staffId, assignedToName: staffName, status: 'assigned' as const }
        : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, assignedTo: staffId, assignedToName: staffName, status: 'assigned' })
  }

  const handleSaveDraft = () => {
    if (!selectedRequest || !translationText.trim()) return
    toast.success('Translation draft saved')
  }

  const handleStartTranslation = () => {
    if (!selectedRequest) return
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, status: 'in_progress' as const, updatedAt: new Date() }
        : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, status: 'in_progress', updatedAt: new Date() })
    toast.success('Translation started')
  }

  const handleCompleteTranslation = () => {
    if (!selectedRequest || !translationText.trim()) {
      toast.error('Please enter the translation before completing')
      return
    }
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, status: 'completed' as const, updatedAt: new Date(), completedAt: new Date() }
        : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, status: 'completed', updatedAt: new Date(), completedAt: new Date() })
    toast.success('Translation completed and sent to customer')
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

  const getTypeIcon = (title: string) => {
    if (title.includes('Auction Sheet')) {
      return <ClipboardList className='h-4 w-4' />
    }
    return <FileCheck className='h-4 w-4' />
  }

  const getTypeLabel = (title: string) => {
    return title.includes('Auction Sheet') ? 'Auction Sheet' : 'Export Certificate'
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`
    return format(new Date(date), 'MMM dd')
  }

  // Get vehicle name from request
  const getVehicleName = (request: ServiceRequest) => {
    if (request.vehicleInfo) {
      return `${request.vehicleInfo.year} ${request.vehicleInfo.make} ${request.vehicleInfo.model}`
    }
    return 'Unknown Vehicle'
  }

  // Get vehicle thumbnail
  const getVehicleThumbnail = (request: ServiceRequest) => {
    const auction = getAuctionForRequest(request)
    return auction?.vehicleInfo.images[0]
  }

  // Navigate images
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? vehicleImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === vehicleImages.length - 1 ? 0 : prev + 1))
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
            <h2 className='text-2xl font-bold tracking-tight'>Translations</h2>
            <p className='text-muted-foreground text-sm'>Translate auction documents for customers</p>
          </div>
        </div>

        {/* Filters Row */}
        <div className='flex flex-wrap items-center gap-3'>
          <Tabs value={translationType} onValueChange={(v) => setTranslationType(v as TranslationType)}>
            <TabsList>
              <TabsTrigger value='all'>All ({counts.all})</TabsTrigger>
              <TabsTrigger value='auction_sheet'>Auction Sheet ({counts.auctionSheet})</TabsTrigger>
              <TabsTrigger value='export_certificate'>Export Cert ({counts.exportCert})</TabsTrigger>
              <TabsTrigger value='my_tasks' className='gap-1.5'>
                <User className='h-4 w-4' />
                My Tasks ({counts.myTasks})
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
                {paginatedRequests.map((request) => {
                  const thumbnail = getVehicleThumbnail(request)
                  return (
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
                        {/* Vehicle Thumbnail with Priority Dot */}
                        <div className='relative flex-shrink-0'>
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt='Vehicle'
                              className='w-11 h-11 rounded-lg object-cover'
                            />
                          ) : (
                            <div className='w-11 h-11 rounded-lg bg-muted flex items-center justify-center'>
                              <Car className='h-5 w-5 text-muted-foreground' />
                            </div>
                          )}
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
                            <span className='font-medium text-sm truncate'>{getVehicleName(request)}</span>
                            <span className='text-[10px] text-muted-foreground whitespace-nowrap'>
                              {getRelativeTime(request.createdAt)}
                            </span>
                          </div>
                          <p className='text-xs text-muted-foreground truncate mt-0.5'>
                            {request.customerName} • {getTypeLabel(request.title)}
                          </p>
                          <div className='flex items-center gap-2 mt-1.5'>
                            <Badge variant={getStatusVariant(request.status) as any} className='text-[10px] px-1.5 h-5'>
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
                  )
                })}

                {paginatedRequests.length === 0 && (
                  <div className='p-8 text-center text-muted-foreground'>
                    <Languages className='h-8 w-8 mx-auto mb-2 opacity-50' />
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
                    {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
                  </span>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Translation Editor */}
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
                        <span>{getTypeLabel(selectedRequest.title)}</span>
                        <span>•</span>
                        <span>{selectedRequest.customerName}</span>
                        <span>•</span>
                        <span className='font-mono text-xs'>{selectedRequest.requestId}</span>
                        <span>•</span>
                        <Badge variant={getPriorityVariant(selectedRequest.priority) as any} className='capitalize'>
                          {selectedRequest.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {!selectedRequest.assignedTo && (
                        canAssignOthers ? (
                          <>
                            <Button size='sm' variant='outline' onClick={() => handleAssignToMe(selectedRequest)}>
                              <UserPlus className='h-4 w-4 mr-1.5' />
                              My Task
                            </Button>
                            <Button size='sm' variant='outline' onClick={() => setAssignDrawerOpen(true)}>
                              <Users className='h-4 w-4 mr-1.5' />
                              Assign Staff
                            </Button>
                          </>
                        ) : (
                          <Button size='sm' variant='outline' onClick={() => handleAssignToMe(selectedRequest)}>
                            <UserPlus className='h-4 w-4 mr-1.5' />
                            Assign to Me
                          </Button>
                        )
                      )}
                      {selectedRequest.status === 'pending' && selectedRequest.assignedTo && (
                        <Button size='sm' onClick={handleStartTranslation}>
                          <Zap className='h-4 w-4 mr-1.5' />
                          Start Translation
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Area - Split View */}
                <div className='flex-1 flex flex-col min-h-0'>
                  <div className='flex-1 flex min-h-0'>
                    {/* Vehicle Images */}
                    <div className='w-1/2 border-r flex flex-col'>
                      <div className='p-2 border-b bg-muted/30 flex items-center justify-between'>
                        <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                          Vehicle Images {vehicleImages.length > 0 && `(${selectedImageIndex + 1}/${vehicleImages.length})`}
                        </span>
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            onClick={() => setImageZoom(Math.max(50, imageZoom - 25))}
                          >
                            <ZoomOut className='h-3.5 w-3.5' />
                          </Button>
                          <span className='text-xs text-muted-foreground w-12 text-center'>{imageZoom}%</span>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            onClick={() => setImageZoom(Math.min(200, imageZoom + 25))}
                          >
                            <ZoomIn className='h-3.5 w-3.5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            onClick={() => setImageRotation((r) => (r + 90) % 360)}
                          >
                            <RotateCw className='h-3.5 w-3.5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            onClick={() => setIsFullscreen(true)}
                          >
                            <Maximize2 className='h-3.5 w-3.5' />
                          </Button>
                        </div>
                      </div>

                      {/* Main Image with Navigation */}
                      <div className='flex-1 relative flex items-center justify-center bg-muted/20 overflow-hidden'>
                        {vehicleImages.length > 0 ? (
                          <>
                            <img
                              src={vehicleImages[selectedImageIndex]}
                              alt={`Vehicle ${selectedImageIndex + 1}`}
                              className='max-w-full max-h-full object-contain transition-transform duration-200'
                              style={{
                                transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                              }}
                            />
                            {/* Navigation Arrows */}
                            {vehicleImages.length > 1 && (
                              <>
                                <Button
                                  variant='secondary'
                                  size='icon'
                                  className='absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100'
                                  onClick={handlePrevImage}
                                >
                                  <ChevronLeft className='h-5 w-5' />
                                </Button>
                                <Button
                                  variant='secondary'
                                  size='icon'
                                  className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100'
                                  onClick={handleNextImage}
                                >
                                  <ChevronRight className='h-5 w-5' />
                                </Button>
                              </>
                            )}
                          </>
                        ) : (
                          <div className='text-center text-muted-foreground'>
                            <Car className='h-16 w-16 mx-auto mb-2 opacity-30' />
                            <p className='text-sm'>No images available</p>
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Strip */}
                      {vehicleImages.length > 1 && (
                        <div className='p-2 border-t bg-muted/30'>
                          <div className='flex gap-2 overflow-x-auto'>
                            {vehicleImages.slice(0, 8).map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedImageIndex(idx)}
                                className={cn(
                                  'flex-shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all',
                                  selectedImageIndex === idx
                                    ? 'border-primary ring-1 ring-primary'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                )}
                              >
                                <img src={img} alt={`Thumb ${idx + 1}`} className='w-full h-full object-cover' />
                              </button>
                            ))}
                            {vehicleImages.length > 8 && (
                              <div className='flex-shrink-0 w-14 h-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground'>
                                +{vehicleImages.length - 8}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                  {/* Translation Input */}
                  <div className='w-1/2 flex flex-col'>
                    <div className='p-2 border-b bg-muted/30'>
                      <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Translation</span>
                    </div>
                    <div className='flex-1 p-4 flex flex-col'>
                      <Textarea
                        placeholder='Enter the translated content here...'
                        value={translationText}
                        onChange={(e) => setTranslationText(e.target.value)}
                        className='flex-1 resize-none text-sm leading-relaxed'
                        disabled={selectedRequest.status === 'completed'}
                      />
                    </div>

                    {/* Actions */}
                    <div className='p-4 border-t bg-muted/20 flex items-center justify-between'>
                      <div className='text-xs text-muted-foreground'>
                        {translationText.length > 0 && (
                          <span>{translationText.length} characters</span>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        {selectedRequest.status !== 'completed' && (
                          <>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={handleSaveDraft}
                              disabled={!translationText.trim()}
                            >
                              <Save className='h-4 w-4 mr-1.5' />
                              Save Draft
                            </Button>
                            <Button
                              size='sm'
                              onClick={handleCompleteTranslation}
                              disabled={!translationText.trim()}
                            >
                              <CheckCircle className='h-4 w-4 mr-1.5' />
                              Complete & Send
                            </Button>
                          </>
                        )}
                        {selectedRequest.status === 'completed' && (
                          <span className='text-sm text-emerald-500 flex items-center gap-1.5'>
                            <CheckCircle className='h-4 w-4' />
                            Translation sent to customer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* Vehicle Details Bar */}
                  {selectedAuction && (
                    <div className='border-t bg-muted/30 p-3 flex-shrink-0'>
                      <div className='flex items-center gap-6 text-sm overflow-x-auto'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-muted-foreground' />
                          <span className='text-muted-foreground'>Year:</span>
                          <span className='font-medium'>{selectedAuction.vehicleInfo.year}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Gauge className='h-4 w-4 text-muted-foreground' />
                          <span className='text-muted-foreground'>Mileage:</span>
                          <span className='font-medium'>{selectedAuction.vehicleInfo.mileageDisplay}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground'>Grade:</span>
                          <Badge variant='secondary' className='text-xs'>
                            {selectedAuction.vehicleInfo.grade || 'N/A'}
                          </Badge>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Palette className='h-4 w-4 text-muted-foreground' />
                          <span className='text-muted-foreground'>Color:</span>
                          <span className='font-medium'>{selectedAuction.vehicleInfo.color}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground'>Trans:</span>
                          <span className='font-medium'>{selectedAuction.vehicleInfo.transmission}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Hash className='h-4 w-4 text-muted-foreground' />
                          <span className='text-muted-foreground'>Lot:</span>
                          <span className='font-mono text-xs'>{selectedAuction.lotNumber}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center text-muted-foreground'>
                <div className='text-center'>
                  <Languages className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>Select a request to start translating</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Image Dialog */}
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className='max-w-[90vw] max-h-[90vh] p-0 overflow-hidden'>
            {selectedRequest && vehicleImages.length > 0 && (
              <div className='relative w-full h-[85vh] bg-black/95 flex items-center justify-center'>
                <div className='absolute top-4 right-4 flex items-center gap-2 z-10'>
                  <Button
                    variant='secondary'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => setImageZoom(Math.max(50, imageZoom - 25))}
                  >
                    <ZoomOut className='h-4 w-4' />
                  </Button>
                  <span className='text-sm text-white bg-black/50 px-2 py-1 rounded'>{imageZoom}%</span>
                  <Button
                    variant='secondary'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => setImageZoom(Math.min(300, imageZoom + 25))}
                  >
                    <ZoomIn className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='secondary'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => setImageRotation((r) => (r + 90) % 360)}
                  >
                    <RotateCw className='h-4 w-4' />
                  </Button>
                </div>
                {/* Navigation in fullscreen */}
                {vehicleImages.length > 1 && (
                  <>
                    <Button
                      variant='secondary'
                      size='icon'
                      className='absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full'
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className='h-6 w-6' />
                    </Button>
                    <Button
                      variant='secondary'
                      size='icon'
                      className='absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full'
                      onClick={handleNextImage}
                    >
                      <ChevronRight className='h-6 w-6' />
                    </Button>
                  </>
                )}
                <img
                  src={vehicleImages[selectedImageIndex]}
                  alt={`Vehicle ${selectedImageIndex + 1}`}
                  className='max-w-full max-h-full object-contain transition-transform duration-200'
                  style={{
                    transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                  }}
                />
                {/* Image counter */}
                <div className='absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm'>
                  {selectedImageIndex + 1} / {vehicleImages.length}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Translator Drawer */}
        <AssignTranslatorDrawer
          open={assignDrawerOpen}
          onOpenChange={setAssignDrawerOpen}
          request={selectedRequest}
          onAssign={handleAssignStaff}
        />
      </Main>
    </>
  )
}
