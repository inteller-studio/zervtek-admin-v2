'use client'

import { useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { format } from 'date-fns'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Languages,
  LayoutGrid,
  List,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  Trash2,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { requests as initialRequests, type ServiceRequest, type RequestThread } from './data/requests'
import { StatsCard } from '@/features/dashboard/components/stats-card'

const CURRENT_ADMIN_ID = 'admin1'
const CURRENT_ADMIN_NAME = 'Current Admin'

interface NewRequestForm {
  type: 'inspection' | 'translation'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  customerName: string
  customerEmail: string
  // Inspection fields
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  vehicleVin: string
  // Translation fields
  sourceLanguage: string
  targetLanguage: string
  documentType: string
}

const emptyRequest: NewRequestForm = {
  type: 'inspection',
  title: '',
  description: '',
  priority: 'medium',
  customerName: '',
  customerEmail: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  vehicleVin: '',
  sourceLanguage: '',
  targetLanguage: '',
  documentType: '',
}

export function Requests() {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [newRequest, setNewRequest] = useState<NewRequestForm>(emptyRequest)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [newMessage, setNewMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter states for checkboxes
  const [typeFilters, setTypeFilters] = useState<string[]>([])
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [priorityFilters, setPriorityFilters] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setAttachments((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  })

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestId.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType =
        typeFilters.length === 0 || typeFilters.includes(request.type)
      const matchesStatus =
        statusFilters.length === 0 || statusFilters.includes(request.status)
      const matchesPriority =
        priorityFilters.length === 0 || priorityFilters.includes(request.priority)

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'my_requests' && request.assignedTo === CURRENT_ADMIN_ID) ||
        (activeTab === 'unassigned' && !request.assignedTo) ||
        (activeTab === 'inspection' && request.type === 'inspection') ||
        (activeTab === 'translation' && request.type === 'translation')

      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesTab
    })
  }, [requests, searchQuery, typeFilters, statusFilters, priorityFilters, activeTab])

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredRequests, currentPage, itemsPerPage])

  // Stats
  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    inProgress: requests.filter((r) => r.status === 'in_progress').length,
    assigned: requests.filter((r) => r.status === 'assigned').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    completedToday: requests.filter(
      (r) =>
        r.status === 'completed' &&
        r.completedAt &&
        new Date(r.completedAt).toDateString() === new Date().toDateString()
    ).length,
    inspections: requests.filter((r) => r.type === 'inspection').length,
    translations: requests.filter((r) => r.type === 'translation').length,
  }), [requests])

  const handleAssignToMe = (request: ServiceRequest) => {
    setRequests(
      requests.map((r) =>
        r.id === request.id
          ? {
              ...r,
              assignedTo: CURRENT_ADMIN_ID,
              assignedToName: CURRENT_ADMIN_NAME,
              status: 'assigned' as const,
            }
          : r
      )
    )
    toast.success(`Request ${request.requestId} assigned to you`)
  }

  const handleStatusUpdate = (request: ServiceRequest, newStatus: ServiceRequest['status']) => {
    setRequests(
      requests.map((r) =>
        r.id === request.id
          ? {
              ...r,
              status: newStatus,
              updatedAt: new Date(),
              completedAt: newStatus === 'completed' ? new Date() : r.completedAt,
            }
          : r
      )
    )
    toast.success(`Request status updated to ${newStatus.replace('_', ' ')}`)
  }

  const handleSendMessage = () => {
    if (!selectedRequest || !newMessage.trim()) return

    const newThread: RequestThread = {
      id: String(Date.now()),
      sender: CURRENT_ADMIN_NAME,
      senderType: 'admin',
      message: newMessage,
      attachments: attachments.map((file) => ({
        id: String(Date.now()),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      })),
      timestamp: new Date(),
    }

    setRequests(
      requests.map((r) =>
        r.id === selectedRequest.id
          ? { ...r, threads: [...r.threads, newThread], updatedAt: new Date() }
          : r
      )
    )

    setSelectedRequest({
      ...selectedRequest,
      threads: [...selectedRequest.threads, newThread],
    })

    setNewMessage('')
    setAttachments([])
    toast.success('Message sent')
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getPriorityColor = (priority: ServiceRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'assigned':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const clearFilters = () => {
    setTypeFilters([])
    setStatusFilters([])
    setPriorityFilters([])
    setSearchQuery('')
  }

  const hasActiveFilters = typeFilters.length > 0 || statusFilters.length > 0 || priorityFilters.length > 0 || searchQuery

  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.customerName || !newRequest.customerEmail) {
      toast.error('Please fill in required fields')
      return
    }

    const request: ServiceRequest = {
      id: String(Date.now()),
      requestId: `REQ-${Date.now().toString().slice(-6)}`,
      type: newRequest.type,
      title: newRequest.title,
      description: newRequest.description,
      status: 'pending',
      priority: newRequest.priority,
      customerName: newRequest.customerName,
      customerEmail: newRequest.customerEmail,
      customerId: `cust-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      threads: [],
      attachments: [],
      vehicleInfo: newRequest.type === 'inspection' ? {
        make: newRequest.vehicleMake,
        model: newRequest.vehicleModel,
        year: Number(newRequest.vehicleYear) || new Date().getFullYear(),
        vin: newRequest.vehicleVin,
      } : undefined,
      sourceLanguage: newRequest.type === 'translation' ? newRequest.sourceLanguage : undefined,
      targetLanguage: newRequest.type === 'translation' ? newRequest.targetLanguage : undefined,
      documentType: newRequest.type === 'translation' ? newRequest.documentType : undefined,
    }

    setRequests([request, ...requests])
    setIsNewRequestOpen(false)
    setNewRequest(emptyRequest)
    toast.success('Request created successfully')
  }

  return (
    <>
      <Header fixed>
        <Search className='md:w-auto flex-1' />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Header */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Service Requests</h2>
            <p className='text-muted-foreground'>
              Manage inspection and translation requests
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
            <Button size='sm' onClick={() => setIsNewRequestOpen(true)}>
              <Plus className='h-4 w-4 mr-2' />
              New Request
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className='grid gap-4 md:grid-cols-4'>
          <StatsCard
            title='Total Requests'
            value={stats.total}
            change={8}
            description='vs last month'
          />
          <StatsCard
            title='Pending'
            value={stats.pending}
            change={-5}
            description='awaiting assignment'
          />
          <StatsCard
            title='In Progress'
            value={stats.inProgress + stats.assigned}
            change={12}
            description='currently active'
          />
          <StatsCard
            title='Completed Today'
            value={stats.completedToday}
            change={15}
            description={`${stats.completed} total completed`}
          />
        </div>

        {/* Filters */}
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <Card>
            <CardContent className='p-4'>
              <div className='flex flex-wrap gap-4 items-center'>
                <div className='relative flex-1 min-w-[200px]'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search requests...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                  />
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Filter className='h-4 w-4 mr-2' />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant='secondary' className='ml-2'>
                        {typeFilters.length + statusFilters.length + priorityFilters.length}
                      </Badge>
                    )}
                    {isFiltersOpen ? (
                      <ChevronUp className='h-4 w-4 ml-2' />
                    ) : (
                      <ChevronDown className='h-4 w-4 ml-2' />
                    )}
                  </Button>
                </CollapsibleTrigger>
                {hasActiveFilters && (
                  <Button variant='ghost' size='sm' onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
                <div className='flex items-center gap-2'>
                  <Button
                    variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('cards')}
                  >
                    <LayoutGrid className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('table')}
                  >
                    <List className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              <CollapsibleContent className='pt-4'>
                <div className='grid gap-6 md:grid-cols-3'>
                  {/* Type Filter */}
                  <div className='space-y-3'>
                    <h4 className='text-sm font-medium'>Type</h4>
                    <div className='space-y-2'>
                      {['inspection', 'translation'].map((type) => (
                        <div key={type} className='flex items-center space-x-2'>
                          <Checkbox
                            id={`type-${type}`}
                            checked={typeFilters.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTypeFilters([...typeFilters, type])
                              } else {
                                setTypeFilters(typeFilters.filter((t) => t !== type))
                              }
                            }}
                          />
                          <label
                            htmlFor={`type-${type}`}
                            className='text-sm capitalize flex items-center gap-2'
                          >
                            {type === 'inspection' ? (
                              <Shield className='h-4 w-4 text-blue-600' />
                            ) : (
                              <Languages className='h-4 w-4 text-purple-600' />
                            )}
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className='space-y-3'>
                    <h4 className='text-sm font-medium'>Status</h4>
                    <div className='space-y-2'>
                      {['pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map(
                        (status) => (
                          <div key={status} className='flex items-center space-x-2'>
                            <Checkbox
                              id={`status-${status}`}
                              checked={statusFilters.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setStatusFilters([...statusFilters, status])
                                } else {
                                  setStatusFilters(statusFilters.filter((s) => s !== status))
                                }
                              }}
                            />
                            <label htmlFor={`status-${status}`} className='text-sm'>
                              <Badge className={`${getStatusColor(status as ServiceRequest['status'])} capitalize`}>
                                {status.replace('_', ' ')}
                              </Badge>
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div className='space-y-3'>
                    <h4 className='text-sm font-medium'>Priority</h4>
                    <div className='space-y-2'>
                      {['urgent', 'high', 'medium', 'low'].map((priority) => (
                        <div key={priority} className='flex items-center space-x-2'>
                          <Checkbox
                            id={`priority-${priority}`}
                            checked={priorityFilters.includes(priority)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setPriorityFilters([...priorityFilters, priority])
                              } else {
                                setPriorityFilters(priorityFilters.filter((p) => p !== priority))
                              }
                            }}
                          />
                          <label htmlFor={`priority-${priority}`} className='text-sm'>
                            <Badge className={`${getPriorityColor(priority as ServiceRequest['priority'])} capitalize`}>
                              {priority}
                            </Badge>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setCurrentPage(1); }}>
          <TabsList>
            <TabsTrigger value='all'>
              All Requests
              <Badge variant='secondary' className='ml-2'>
                {requests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value='my_requests'>My Requests</TabsTrigger>
            <TabsTrigger value='unassigned'>
              Unassigned
              <Badge variant='secondary' className='ml-2'>
                {requests.filter((r) => !r.assignedTo).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value='inspection'>
              <Shield className='h-4 w-4 mr-1' />
              Inspections
            </TabsTrigger>
            <TabsTrigger value='translation'>
              <Languages className='h-4 w-4 mr-1' />
              Translations
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className='space-y-4 mt-4'>
            {viewMode === 'cards' ? (
              /* Cards View */
              <div className='space-y-4'>
                {paginatedRequests.map((request) => (
                  <Card key={request.id} className='hover:shadow-md transition-shadow'>
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 space-y-3'>
                          <div className='flex items-start gap-3'>
                            <div
                              className={`p-2 rounded-lg ${
                                request.type === 'inspection' ? 'bg-blue-50' : 'bg-purple-50'
                              }`}
                            >
                              {request.type === 'inspection' ? (
                                <Shield className='h-5 w-5 text-blue-600' />
                              ) : (
                                <Languages className='h-5 w-5 text-purple-600' />
                              )}
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 flex-wrap'>
                                <span className='text-xs text-muted-foreground'>
                                  {request.requestId}
                                </span>
                                <h3 className='font-semibold'>{request.title}</h3>
                                <Badge className={getPriorityColor(request.priority)}>
                                  {request.priority}
                                </Badge>
                                <Badge className={getStatusColor(request.status)}>
                                  {request.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className='text-sm text-muted-foreground mt-1'>
                                {request.description}
                              </p>
                              <div className='flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap'>
                                <div className='flex items-center gap-1'>
                                  <User className='h-3 w-3' />
                                  {request.customerName}
                                </div>
                                <div className='flex items-center gap-1'>
                                  <Calendar className='h-3 w-3' />
                                  {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                                </div>
                                {request.assignedToName && (
                                  <div className='flex items-center gap-1'>
                                    <Users className='h-3 w-3' />
                                    {request.assignedToName}
                                  </div>
                                )}
                                {request.threads.length > 0 && (
                                  <div className='flex items-center gap-1'>
                                    <MessageSquare className='h-3 w-3' />
                                    {request.threads.length} messages
                                  </div>
                                )}
                                {request.price && (
                                  <div className='font-medium text-foreground'>
                                    ${request.price}
                                  </div>
                                )}
                              </div>
                              {request.vehicleInfo && (
                                <div className='mt-2 text-sm text-muted-foreground'>
                                  <span className='font-medium'>Vehicle:</span>{' '}
                                  {request.vehicleInfo.year} {request.vehicleInfo.make}{' '}
                                  {request.vehicleInfo.model}
                                  {request.vehicleInfo.vin && ` • VIN: ${request.vehicleInfo.vin}`}
                                </div>
                              )}
                              {request.sourceLanguage && (
                                <div className='mt-2 text-sm text-muted-foreground'>
                                  <span className='font-medium'>Translation:</span>{' '}
                                  {request.sourceLanguage} → {request.targetLanguage}
                                  {request.documentType && ` • ${request.documentType}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setSelectedRequest(request)
                              setIsDetailsOpen(true)
                            }}
                          >
                            <Eye className='h-4 w-4 mr-2' />
                            View Details
                          </Button>
                          {!request.assignedTo && (
                            <Button size='sm' onClick={() => handleAssignToMe(request)}>
                              Assign to Me
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className='h-4 w-4 mr-2' />
                                Edit Request
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(request, 'in_progress')}
                              >
                                <Zap className='h-4 w-4 mr-2' />
                                Mark In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(request, 'completed')}
                              >
                                <CheckCircle className='h-4 w-4 mr-2' />
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className='text-destructive'>
                                <Trash2 className='h-4 w-4 mr-2' />
                                Delete Request
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Table View */
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className='font-medium'>{request.requestId}</TableCell>
                        <TableCell>
                          <Badge variant='outline' className='flex items-center gap-1 w-fit'>
                            {request.type === 'inspection' ? (
                              <Shield className='h-3 w-3' />
                            ) : (
                              <Languages className='h-3 w-3' />
                            )}
                            {request.type === 'inspection' ? 'Inspection' : 'Translation'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='max-w-[200px]'>
                            <p className='font-medium truncate'>{request.title}</p>
                            {request.vehicleInfo && (
                              <p className='text-sm text-muted-foreground'>
                                {request.vehicleInfo.year} {request.vehicleInfo.make}
                              </p>
                            )}
                            {request.sourceLanguage && (
                              <p className='text-sm text-muted-foreground'>
                                {request.sourceLanguage} to {request.targetLanguage}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className='font-medium'>{request.customerName}</p>
                            <p className='text-sm text-muted-foreground'>{request.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.assignedToName || (
                            <span className='text-muted-foreground'>Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedRequest(request)
                                setIsDetailsOpen(true)
                              }}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {!request.assignedTo && (
                                  <DropdownMenuItem onClick={() => handleAssignToMe(request)}>
                                    <Users className='h-4 w-4 mr-2' />
                                    Assign to Me
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(request, 'in_progress')}
                                >
                                  <Zap className='h-4 w-4 mr-2' />
                                  Mark In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(request, 'completed')}
                                >
                                  <CheckCircle className='h-4 w-4 mr-2' />
                                  Mark Complete
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className='text-destructive'>
                                  <Trash2 className='h-4 w-4 mr-2' />
                                  Delete Request
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>Items per page:</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className='w-[80px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='20'>20</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                    <SelectItem value='100'>100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of{' '}
                  {filteredRequests.length}
                </span>
                <div className='flex gap-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* New Request Dialog */}
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogContent className='flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden sm:max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Create New Request</DialogTitle>
              <DialogDescription>
                Submit a new inspection or translation request
              </DialogDescription>
            </DialogHeader>

            <div className='flex-1 overflow-y-auto'>
              <div className='space-y-6 p-1'>
                {/* Request Type */}
                <div className='space-y-3'>
                  <label className='text-sm font-medium'>Request Type *</label>
                  <div className='flex gap-4'>
                    <Button
                      type='button'
                      variant={newRequest.type === 'inspection' ? 'default' : 'outline'}
                      className='flex-1'
                      onClick={() => setNewRequest({ ...newRequest, type: 'inspection' })}
                    >
                      <Shield className='h-4 w-4 mr-2' />
                      Inspection
                    </Button>
                    <Button
                      type='button'
                      variant={newRequest.type === 'translation' ? 'default' : 'outline'}
                      className='flex-1'
                      onClick={() => setNewRequest({ ...newRequest, type: 'translation' })}
                    >
                      <Languages className='h-4 w-4 mr-2' />
                      Translation
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className='space-y-4'>
                  <h3 className='font-semibold'>Basic Information</h3>
                  <div>
                    <label className='text-sm font-medium'>Title *</label>
                    <Input
                      placeholder='Enter request title'
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium'>Description</label>
                    <Textarea
                      placeholder='Describe the request details...'
                      value={newRequest.description}
                      onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium'>Priority</label>
                    <Select
                      value={newRequest.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') =>
                        setNewRequest({ ...newRequest, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='low'>Low</SelectItem>
                        <SelectItem value='medium'>Medium</SelectItem>
                        <SelectItem value='high'>High</SelectItem>
                        <SelectItem value='urgent'>Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Customer Information */}
                <div className='space-y-4'>
                  <h3 className='font-semibold'>Customer Information</h3>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div>
                      <label className='text-sm font-medium'>Customer Name *</label>
                      <Input
                        placeholder='John Doe'
                        value={newRequest.customerName}
                        onChange={(e) => setNewRequest({ ...newRequest, customerName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className='text-sm font-medium'>Customer Email *</label>
                      <Input
                        type='email'
                        placeholder='john@example.com'
                        value={newRequest.customerEmail}
                        onChange={(e) => setNewRequest({ ...newRequest, customerEmail: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Inspection-specific fields */}
                {newRequest.type === 'inspection' && (
                  <div className='space-y-4'>
                    <h3 className='font-semibold'>Vehicle Information</h3>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <div>
                        <label className='text-sm font-medium'>Make</label>
                        <Input
                          placeholder='Toyota'
                          value={newRequest.vehicleMake}
                          onChange={(e) => setNewRequest({ ...newRequest, vehicleMake: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className='text-sm font-medium'>Model</label>
                        <Input
                          placeholder='Camry'
                          value={newRequest.vehicleModel}
                          onChange={(e) => setNewRequest({ ...newRequest, vehicleModel: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className='text-sm font-medium'>Year</label>
                        <Input
                          type='number'
                          placeholder='2024'
                          value={newRequest.vehicleYear}
                          onChange={(e) => setNewRequest({ ...newRequest, vehicleYear: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className='text-sm font-medium'>VIN</label>
                        <Input
                          placeholder='Vehicle Identification Number'
                          value={newRequest.vehicleVin}
                          onChange={(e) => setNewRequest({ ...newRequest, vehicleVin: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Translation-specific fields */}
                {newRequest.type === 'translation' && (
                  <div className='space-y-4'>
                    <h3 className='font-semibold'>Translation Details</h3>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <div>
                        <label className='text-sm font-medium'>Source Language</label>
                        <Select
                          value={newRequest.sourceLanguage}
                          onValueChange={(value) => setNewRequest({ ...newRequest, sourceLanguage: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select language' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='japanese'>Japanese</SelectItem>
                            <SelectItem value='english'>English</SelectItem>
                            <SelectItem value='chinese'>Chinese</SelectItem>
                            <SelectItem value='korean'>Korean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className='text-sm font-medium'>Target Language</label>
                        <Select
                          value={newRequest.targetLanguage}
                          onValueChange={(value) => setNewRequest({ ...newRequest, targetLanguage: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select language' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='english'>English</SelectItem>
                            <SelectItem value='japanese'>Japanese</SelectItem>
                            <SelectItem value='chinese'>Chinese</SelectItem>
                            <SelectItem value='korean'>Korean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className='text-sm font-medium'>Document Type</label>
                      <Select
                        value={newRequest.documentType}
                        onValueChange={(value) => setNewRequest({ ...newRequest, documentType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select document type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='vehicle_registration'>Vehicle Registration</SelectItem>
                          <SelectItem value='export_certificate'>Export Certificate</SelectItem>
                          <SelectItem value='auction_sheet'>Auction Sheet</SelectItem>
                          <SelectItem value='inspection_report'>Inspection Report</SelectItem>
                          <SelectItem value='other'>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className='flex justify-end gap-2 border-t pt-4'>
              <Button variant='outline' onClick={() => setIsNewRequestOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRequest}>
                <Plus className='h-4 w-4 mr-2' />
                Create Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Request Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
            <DialogHeader>
              <DialogTitle>{selectedRequest?.title}</DialogTitle>
              <DialogDescription>
                {selectedRequest?.requestId} • {selectedRequest?.type} •{' '}
                {selectedRequest?.customerName}
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className='flex-1 overflow-hidden flex flex-col'>
                {/* Request Info */}
                <div className='bg-muted rounded-lg p-4 mb-4 space-y-2'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>Status:</span>{' '}
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Priority:</span>{' '}
                      <Badge className={getPriorityColor(selectedRequest.priority)}>
                        {selectedRequest.priority}
                      </Badge>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Created:</span>{' '}
                      {format(new Date(selectedRequest.createdAt), 'PPpp')}
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Price:</span> $
                      {selectedRequest.price || 'TBD'}
                    </div>
                    {selectedRequest.assignedToName && (
                      <div>
                        <span className='text-muted-foreground'>Assigned to:</span>{' '}
                        {selectedRequest.assignedToName}
                      </div>
                    )}
                    {selectedRequest.estimatedTime && (
                      <div>
                        <span className='text-muted-foreground'>Est. Time:</span>{' '}
                        {selectedRequest.estimatedTime}
                      </div>
                    )}
                  </div>
                  {selectedRequest.vehicleInfo && (
                    <div className='pt-2 border-t'>
                      <span className='text-sm font-medium'>Vehicle Info:</span>
                      <p className='text-sm text-muted-foreground'>
                        {selectedRequest.vehicleInfo.year} {selectedRequest.vehicleInfo.make}{' '}
                        {selectedRequest.vehicleInfo.model}
                        {selectedRequest.vehicleInfo.vin &&
                          ` • VIN: ${selectedRequest.vehicleInfo.vin}`}
                      </p>
                    </div>
                  )}
                  {selectedRequest.sourceLanguage && (
                    <div className='pt-2 border-t'>
                      <span className='text-sm font-medium'>Translation Details:</span>
                      <p className='text-sm text-muted-foreground'>
                        {selectedRequest.sourceLanguage} → {selectedRequest.targetLanguage}
                        {selectedRequest.documentType && ` • ${selectedRequest.documentType}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Messages Thread */}
                <ScrollArea className='flex-1 px-1'>
                  <div className='space-y-4 pb-4'>
                    {selectedRequest.threads.map((thread) => (
                      <div
                        key={thread.id}
                        className={`flex ${
                          thread.senderType === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            thread.senderType === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          } rounded-lg p-3`}
                        >
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='text-xs font-medium'>{thread.sender}</span>
                            <span className='text-xs opacity-70'>
                              {format(new Date(thread.timestamp), 'PPp')}
                            </span>
                          </div>
                          <p className='text-sm'>{thread.message}</p>
                          {thread.attachments && thread.attachments.length > 0 && (
                            <div className='mt-2 space-y-1'>
                              {thread.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className='flex items-center gap-2 text-xs'
                                >
                                  <Paperclip className='h-3 w-3' />
                                  <span>{attachment.name}</span>
                                  <span className='opacity-70'>
                                    ({formatFileSize(attachment.size)})
                                  </span>
                                  <Button variant='ghost' size='sm' className='h-auto p-0'>
                                    <Download className='h-3 w-3' />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className='border-t pt-4 space-y-3'>
                  {attachments.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-2 bg-muted px-3 py-1 rounded-lg text-sm'
                        >
                          <Paperclip className='h-3 w-3' />
                          <span>{file.name}</span>
                          <span className='text-xs text-muted-foreground'>
                            ({formatFileSize(file.size)})
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0'
                            onClick={() => removeAttachment(index)}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className='flex gap-2'>
                    <div {...getRootProps()} className='cursor-pointer'>
                      <input {...getInputProps()} />
                      <Button variant='outline' size='sm' type='button'>
                        <Paperclip className='h-4 w-4' />
                      </Button>
                    </div>
                    <Textarea
                      placeholder='Type your message...'
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className='flex-1 min-h-[60px] max-h-[120px]'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
