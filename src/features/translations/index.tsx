'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Filter,
  Languages,
  LayoutGrid,
  List,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  Trash2,
  User,
  Users,
  Zap,
  FileCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { requests as allRequests, type ServiceRequest, type RequestThread } from '../requests/data/requests'
import { StatsCard } from '@/features/dashboard/components/stats-card'
import { cn } from '@/lib/utils'

const CURRENT_ADMIN_ID = 'admin1'
const CURRENT_ADMIN_NAME = 'Current Admin'

// Filter to only translation requests
const initialRequests = allRequests.filter(r => r.type === 'translation')

type TranslationType = 'all' | 'auction_sheet' | 'export_certificate'

export function Translations() {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [priorityFilters, setPriorityFilters] = useState<string[]>([])
  const [translationType, setTranslationType] = useState<TranslationType>('all')

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestId.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(request.status)
      const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(request.priority)

      const matchesType = translationType === 'all' ||
        (translationType === 'auction_sheet' && request.title.includes('Auction Sheet')) ||
        (translationType === 'export_certificate' && request.title.includes('Export Certificate'))

      return matchesSearch && matchesStatus && matchesPriority && matchesType
    })
  }, [requests, searchQuery, statusFilters, priorityFilters, translationType])

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredRequests, currentPage, itemsPerPage])

  const stats = useMemo(() => {
    const auctionSheetRequests = requests.filter(r => r.title.includes('Auction Sheet'))
    const exportCertRequests = requests.filter(r => r.title.includes('Export Certificate'))

    return {
      total: requests.length,
      auctionSheet: auctionSheetRequests.length,
      exportCertificate: exportCertRequests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      inProgress: requests.filter((r) => r.status === 'in_progress' || r.status === 'assigned').length,
      completed: requests.filter((r) => r.status === 'completed').length,
    }
  }, [requests])

  const handleCardClick = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setIsDetailsOpen(true)
  }

  const handleAssignToMe = (request: ServiceRequest, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setRequests(requests.map((r) =>
      r.id === request.id
        ? { ...r, assignedTo: CURRENT_ADMIN_ID, assignedToName: CURRENT_ADMIN_NAME, status: 'assigned' as const }
        : r
    ))
    toast.success(`Request ${request.requestId} assigned to you`)
  }

  const handleStatusUpdate = (request: ServiceRequest, newStatus: ServiceRequest['status']) => {
    setRequests(requests.map((r) =>
      r.id === request.id
        ? { ...r, status: newStatus, updatedAt: new Date(), completedAt: newStatus === 'completed' ? new Date() : r.completedAt }
        : r
    ))
    toast.success(`Request status updated to ${newStatus.replace('_', ' ')}`)
  }

  const handleSendMessage = () => {
    if (!selectedRequest || !newMessage.trim()) return
    const newThread: RequestThread = {
      id: String(Date.now()),
      sender: CURRENT_ADMIN_NAME,
      senderType: 'admin',
      message: newMessage,
      timestamp: new Date(),
    }
    setRequests(requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, threads: [...r.threads, newThread], updatedAt: new Date() }
        : r
    ))
    setSelectedRequest({ ...selectedRequest, threads: [...selectedRequest.threads, newThread] })
    setNewMessage('')
    toast.success('Message sent')
  }

  const getPriorityColor = (priority: ServiceRequest['priority']) => {
    const colors = {
      urgent: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
      high: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
      low: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    }
    return colors[priority]
  }

  const getStatusColor = (status: ServiceRequest['status']) => {
    const colors = {
      completed: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      in_progress: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
      assigned: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
      cancelled: 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    }
    return colors[status]
  }

  const getTypeIcon = (title: string) => {
    if (title.includes('Auction Sheet')) {
      return <FileText className='h-5 w-5 text-blue-600' />
    }
    return <FileCheck className='h-5 w-5 text-emerald-600' />
  }

  const getTypeLabel = (title: string) => {
    if (title.includes('Auction Sheet')) {
      return 'Auction Sheet'
    }
    return 'Export Certificate'
  }

  const clearFilters = () => {
    setStatusFilters([])
    setPriorityFilters([])
    setSearchQuery('')
  }

  const hasActiveFilters = statusFilters.length > 0 || priorityFilters.length > 0 || searchQuery

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
            <h2 className='text-2xl font-bold tracking-tight'>Translations</h2>
            <p className='text-muted-foreground'>Manage document translation requests</p>
          </div>
          <Button variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <StatsCard title='Total Requests' value={stats.total} change={8} description='translation requests' />
          <StatsCard title='Auction Sheet' value={stats.auctionSheet} change={12} description='before purchase' />
          <StatsCard title='Export Certificate' value={stats.exportCertificate} change={5} description='after purchase' />
          <StatsCard title='Pending' value={stats.pending} change={-3} description='awaiting action' />
        </div>

        {/* Type Tabs & Filters */}
        <div className='flex flex-col gap-4'>
          <Tabs value={translationType} onValueChange={(v) => setTranslationType(v as TranslationType)} className='w-full'>
            <TabsList className='grid w-full grid-cols-3 lg:w-[400px]'>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='auction_sheet'>Auction Sheet</TabsTrigger>
              <TabsTrigger value='export_certificate'>Export Cert</TabsTrigger>
            </TabsList>
          </Tabs>

          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <Card>
              <CardContent className='p-4'>
                <div className='flex flex-wrap gap-4 items-center'>
                  <div className='relative flex-1 min-w-[200px]'>
                    <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <Input placeholder='Search by customer, request ID...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='pl-10' />
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant='outline' size='sm'>
                      <Filter className='h-4 w-4 mr-2' />
                      Filters
                      {hasActiveFilters && <Badge variant='secondary' className='ml-2'>{statusFilters.length + priorityFilters.length}</Badge>}
                      {isFiltersOpen ? <ChevronUp className='h-4 w-4 ml-2' /> : <ChevronDown className='h-4 w-4 ml-2' />}
                    </Button>
                  </CollapsibleTrigger>
                  {hasActiveFilters && <Button variant='ghost' size='sm' onClick={clearFilters}>Clear all</Button>}
                  <div className='flex items-center gap-2'>
                    <Button variant={viewMode === 'cards' ? 'secondary' : 'ghost'} size='sm' onClick={() => setViewMode('cards')}><LayoutGrid className='h-4 w-4' /></Button>
                    <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size='sm' onClick={() => setViewMode('table')}><List className='h-4 w-4' /></Button>
                  </div>
                </div>

                <CollapsibleContent className='pt-4'>
                  <div className='grid gap-6 md:grid-cols-2'>
                    <div className='space-y-3'>
                      <h4 className='text-sm font-medium'>Status</h4>
                      <div className='space-y-2'>
                        {['pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map((status) => (
                          <div key={status} className='flex items-center space-x-2'>
                            <Checkbox id={`status-${status}`} checked={statusFilters.includes(status)} onCheckedChange={(checked) => {
                              if (checked) setStatusFilters([...statusFilters, status])
                              else setStatusFilters(statusFilters.filter((s) => s !== status))
                            }} />
                            <label htmlFor={`status-${status}`} className='text-sm'>
                              <Badge className={`${getStatusColor(status as ServiceRequest['status'])} capitalize`}>{status.replace('_', ' ')}</Badge>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className='space-y-3'>
                      <h4 className='text-sm font-medium'>Priority</h4>
                      <div className='space-y-2'>
                        {['urgent', 'high', 'medium', 'low'].map((priority) => (
                          <div key={priority} className='flex items-center space-x-2'>
                            <Checkbox id={`priority-${priority}`} checked={priorityFilters.includes(priority)} onCheckedChange={(checked) => {
                              if (checked) setPriorityFilters([...priorityFilters, priority])
                              else setPriorityFilters(priorityFilters.filter((p) => p !== priority))
                            }} />
                            <label htmlFor={`priority-${priority}`} className='text-sm'>
                              <Badge className={`${getPriorityColor(priority as ServiceRequest['priority'])} capitalize`}>{priority}</Badge>
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
        </div>

        {/* Content */}
        {viewMode === 'cards' ? (
          <div className='space-y-4'>
            {paginatedRequests.map((request) => (
              <Card key={request.id} className='hover:shadow-md transition-shadow cursor-pointer' onClick={() => handleCardClick(request)}>
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 space-y-3'>
                      <div className='flex items-start gap-3'>
                        <div className={cn(
                          'rounded-lg p-2 mt-0.5',
                          request.title.includes('Auction Sheet')
                            ? 'bg-blue-100 dark:bg-blue-950'
                            : 'bg-emerald-100 dark:bg-emerald-950'
                        )}>
                          {getTypeIcon(request.title)}
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <span className='text-xs text-muted-foreground'>{request.requestId}</span>
                            <h3 className='font-semibold'>{getTypeLabel(request.title)}</h3>
                            <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                            <Badge className={getStatusColor(request.status)}>{request.status.replace('_', ' ')}</Badge>
                          </div>
                          <p className='text-sm text-muted-foreground mt-1'>{request.description}</p>
                          <div className='flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap'>
                            <div className='flex items-center gap-1'><User className='h-3 w-3' />{request.customerName}</div>
                            <div className='flex items-center gap-1'><Clock className='h-3 w-3' />{format(new Date(request.createdAt), 'MMM dd, yyyy')}</div>
                            {request.assignedToName && <div className='flex items-center gap-1'><Users className='h-3 w-3' />{request.assignedToName}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2' onClick={(e) => e.stopPropagation()}>
                      {!request.assignedTo && <Button size='sm' onClick={(e) => handleAssignToMe(request, e)}>Assign to Me</Button>}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant='ghost' size='sm'><MoreHorizontal className='h-4 w-4' /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusUpdate(request, 'in_progress')}><Zap className='h-4 w-4 mr-2' />Mark In Progress</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(request, 'completed')}><CheckCircle className='h-4 w-4 mr-2' />Mark Complete</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className='text-destructive'><Trash2 className='h-4 w-4 mr-2' />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() => handleCardClick(request)}
                  >
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {getTypeIcon(request.title)}
                        <span className='text-sm'>{getTypeLabel(request.title)}</span>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium'>{request.requestId}</TableCell>
                    <TableCell>{request.customerName}</TableCell>
                    <TableCell><Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge></TableCell>
                    <TableCell><Badge className={getStatusColor(request.status)}>{request.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className='text-sm text-muted-foreground'>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Empty State */}
        {paginatedRequests.length === 0 && (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <Languages className='h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='font-semibold text-lg'>No translations found</h3>
              <p className='text-muted-foreground text-sm'>Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {paginatedRequests.length > 0 && (
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>Items per page:</span>
              <Select value={String(itemsPerPage)} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                <SelectTrigger className='w-[80px]'><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length}
              </span>
              <div className='flex gap-1'>
                <Button variant='outline' size='sm' onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                <Button variant='outline' size='sm' onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
              </div>
            </div>
          </div>
        )}

        {/* Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className='max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                {selectedRequest && getTypeIcon(selectedRequest.title)}
                <div>
                  <DialogTitle>{selectedRequest && getTypeLabel(selectedRequest.title)}</DialogTitle>
                  <DialogDescription>{selectedRequest?.requestId} • {selectedRequest?.customerName}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            {selectedRequest && (
              <div className='flex-1 overflow-hidden flex flex-col'>
                <div className='bg-muted rounded-lg p-4 mb-4 space-y-3'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div className='space-y-1'>
                      <span className='text-muted-foreground'>Status</span>
                      <div><Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status.replace('_', ' ')}</Badge></div>
                    </div>
                    <div className='space-y-1'>
                      <span className='text-muted-foreground'>Priority</span>
                      <div><Badge className={getPriorityColor(selectedRequest.priority)}>{selectedRequest.priority}</Badge></div>
                    </div>
                    <div className='space-y-1'>
                      <span className='text-muted-foreground'>Created</span>
                      <p className='font-medium'>{format(new Date(selectedRequest.createdAt), 'PPpp')}</p>
                    </div>
                    <div className='space-y-1'>
                      <span className='text-muted-foreground'>Customer</span>
                      <p className='font-medium'>{selectedRequest.customerName}</p>
                    </div>
                  </div>
                </div>
                <ScrollArea className='flex-1 px-1'>
                  <div className='space-y-4 pb-4'>
                    {selectedRequest.threads.map((thread) => (
                      <div key={thread.id} className={`flex ${thread.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${thread.senderType === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='text-xs font-medium'>{thread.sender}</span>
                            <span className='text-xs opacity-70'>{format(new Date(thread.timestamp), 'PPp')}</span>
                          </div>
                          <p className='text-sm'>{thread.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className='border-t pt-4'>
                  <div className='flex gap-2'>
                    <Textarea placeholder='Type your message...' value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className='flex-1 min-h-[60px]' />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}><Send className='h-4 w-4' /></Button>
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
