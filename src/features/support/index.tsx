'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TicketCheck,
  Search as SearchIcon,
  MoreHorizontal,
  Eye,
  UserPlus,
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Car,
} from 'lucide-react'

import {
  supportTickets,
  getTicketStats,
  supportStaff,
} from './data/tickets'
import {
  type SupportTicket,
  type TicketStatus,
  type TicketPriority,
  type TicketCategory,
  ticketStatuses,
  ticketPriorities,
  ticketCategories,
} from './data/types'

type SortField = 'ticketNumber' | 'subject' | 'createdAt' | 'updatedAt' | 'priority' | 'status'
type SortOrder = 'asc' | 'desc'

export function Support() {
  const router = useRouter()
  const [tickets, setTickets] = useState(supportTickets)
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'in_progress' | 'awaiting' | 'resolved' | 'closed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const stats = useMemo(() => getTicketStats(), [])

  // Filter tickets based on active tab and filters
  const filteredTickets = useMemo(() => {
    let result = [...tickets]

    // Tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'awaiting') {
        result = result.filter(t => t.status === 'awaiting_customer')
      } else {
        result = result.filter(t => t.status === activeTab)
      }
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(t =>
        t.ticketNumber.toLowerCase().includes(search) ||
        t.subject.toLowerCase().includes(search) ||
        t.customerName.toLowerCase().includes(search) ||
        t.customerEmail.toLowerCase().includes(search)
      )
    }

    // Status filter (when on 'all' tab)
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter)
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        result = result.filter(t => !t.assignedTo)
      } else {
        result = result.filter(t => t.assignedTo === assigneeFilter)
      }
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number | Date
      let bVal: string | number | Date

      switch (sortField) {
        case 'ticketNumber':
          aVal = a.ticketNumber
          bVal = b.ticketNumber
          break
        case 'subject':
          aVal = a.subject.toLowerCase()
          bVal = b.subject.toLowerCase()
          break
        case 'createdAt':
          aVal = a.createdAt
          bVal = b.createdAt
          break
        case 'updatedAt':
          aVal = a.updatedAt
          bVal = b.updatedAt
          break
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          aVal = priorityOrder[a.priority]
          bVal = priorityOrder[b.priority]
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [tickets, activeTab, searchTerm, statusFilter, priorityFilter, categoryFilter, assigneeFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getStatusBadge = (status: TicketStatus) => {
    const config = ticketStatuses[status]
    const variants: Record<string, 'blue' | 'amber' | 'purple' | 'emerald' | 'zinc'> = {
      blue: 'blue',
      amber: 'amber',
      purple: 'purple',
      emerald: 'emerald',
      zinc: 'zinc',
    }
    return <Badge variant={variants[config.color] || 'zinc'}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: TicketPriority) => {
    const config = ticketPriorities[priority]
    const variants: Record<string, 'zinc' | 'blue' | 'orange' | 'red'> = {
      zinc: 'zinc',
      blue: 'blue',
      orange: 'orange',
      red: 'red',
    }
    return <Badge variant={variants[config.color] || 'zinc'}>{config.label}</Badge>
  }

  const getCategoryBadge = (category: TicketCategory) => {
    const config = ticketCategories[category]
    return <Badge variant='outline'>{config.label}</Badge>
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleViewTicket = (ticket: SupportTicket) => {
    router.push(`/support/${ticket.id}`)
  }

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Page Header */}
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Support Tickets</h1>
            <p className='text-muted-foreground'>Manage customer support requests</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setCurrentPage(1) }}>
          <TabsList>
            <TabsTrigger value='all'>
              All Tickets
              <Badge variant='secondary' className='ml-2'>{tickets.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value='open'>
              Open
              <Badge variant='blue' className='ml-2'>{stats.open}</Badge>
            </TabsTrigger>
            <TabsTrigger value='in_progress'>
              In Progress
              <Badge variant='amber' className='ml-2'>{stats.inProgress}</Badge>
            </TabsTrigger>
            <TabsTrigger value='awaiting'>
              Awaiting
              <Badge variant='purple' className='ml-2'>{stats.awaitingCustomer}</Badge>
            </TabsTrigger>
            <TabsTrigger value='resolved'>
              Resolved
              <Badge variant='emerald' className='ml-2'>{stats.resolved}</Badge>
            </TabsTrigger>
            <TabsTrigger value='closed'>
              Closed
              <Badge variant='zinc' className='ml-2'>{stats.closed}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className='mt-4 space-y-4'>
            {/* Filters */}
            <Card>
              <CardContent className='p-4'>
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='relative flex-1 min-w-[200px]'>
                    <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                    <Input
                      placeholder='Search tickets...'
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                      className='pl-10'
                    />
                  </div>
                  {activeTab === 'all' && (
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
                      <SelectTrigger className='w-[140px]'>
                        <SelectValue placeholder='Status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Status</SelectItem>
                        {Object.entries(ticketStatuses).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setCurrentPage(1) }}>
                    <SelectTrigger className='w-[130px]'>
                      <SelectValue placeholder='Priority' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Priority</SelectItem>
                      {Object.entries(ticketPriorities).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1) }}>
                    <SelectTrigger className='w-[150px]'>
                      <SelectValue placeholder='Category' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Categories</SelectItem>
                      {Object.entries(ticketCategories).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={assigneeFilter} onValueChange={(v) => { setAssigneeFilter(v); setCurrentPage(1) }}>
                    <SelectTrigger className='w-[150px]'>
                      <SelectValue placeholder='Assignee' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Assignees</SelectItem>
                      <SelectItem value='unassigned'>Unassigned</SelectItem>
                      {supportStaff.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardContent className='p-0'>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[120px]'>
                          <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('ticketNumber')}>
                            Ticket # <ArrowUpDown className='ml-2 h-4 w-4' />
                          </Button>
                        </TableHead>
                        <TableHead className='min-w-[300px]'>
                          <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('subject')}>
                            Subject <ArrowUpDown className='ml-2 h-4 w-4' />
                          </Button>
                        </TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>
                          <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('priority')}>
                            Priority <ArrowUpDown className='ml-2 h-4 w-4' />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('status')}>
                            Status <ArrowUpDown className='ml-2 h-4 w-4' />
                          </Button>
                        </TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>
                          <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('updatedAt')}>
                            Last Updated <ArrowUpDown className='ml-2 h-4 w-4' />
                          </Button>
                        </TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTickets.length > 0 ? (
                        paginatedTickets.map((ticket) => (
                          <TableRow
                            key={ticket.id}
                            className='cursor-pointer hover:bg-muted/50'
                            onClick={() => handleViewTicket(ticket)}
                          >
                            <TableCell>
                              <span className='font-mono text-sm font-medium'>{ticket.ticketNumber}</span>
                            </TableCell>
                            <TableCell>
                              <div className='space-y-1'>
                                <p className='font-medium line-clamp-1'>{ticket.subject}</p>
                                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                  <MessageSquare className='h-3 w-3' />
                                  <span>{ticket.messageCount} messages</span>
                                  {ticket.relatedVehicleName && (
                                    <>
                                      <span>•</span>
                                      <Car className='h-3 w-3' />
                                      <span className='truncate max-w-[150px]'>{ticket.relatedVehicleName}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Avatar className='h-8 w-8'>
                                  <AvatarFallback className='text-xs'>
                                    {getInitials(ticket.customerName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className='min-w-0'>
                                  <p className='text-sm font-medium truncate'>{ticket.customerName}</p>
                                  <p className='text-xs text-muted-foreground truncate'>{ticket.customerEmail}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getCategoryBadge(ticket.category)}</TableCell>
                            <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                            <TableCell>
                              {ticket.assignedToName ? (
                                <span className='text-sm'>{ticket.assignedToName}</span>
                              ) : (
                                <span className='text-sm text-muted-foreground italic'>Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className='text-sm'>
                                {formatDistanceToNow(ticket.updatedAt, { addSuffix: true })}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {format(ticket.updatedAt, 'MMM dd, HH:mm')}
                              </div>
                            </TableCell>
                            <TableCell className='text-right' onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant='ghost' size='icon'>
                                    <MoreHorizontal className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
                                    <Eye className='mr-2 h-4 w-4' />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <UserPlus className='mr-2 h-4 w-4' />
                                    Assign
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <CheckCircle className='mr-2 h-4 w-4' />
                                    Mark Resolved
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <XCircle className='mr-2 h-4 w-4' />
                                    Close Ticket
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className='h-24 text-center'>
                            <div className='flex flex-col items-center justify-center'>
                              <TicketCheck className='h-8 w-8 text-muted-foreground/50 mb-2' />
                              <p className='text-muted-foreground'>No tickets found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredTickets.length > 0 && (
                  <div className='flex items-center justify-between p-4 border-t'>
                    <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                      <span>
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of{' '}
                        {filteredTickets.length}
                      </span>
                      <Select
                        value={String(itemsPerPage)}
                        onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1) }}
                      >
                        <SelectTrigger className='w-[70px] h-8'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='10'>10</SelectItem>
                          <SelectItem value='20'>20</SelectItem>
                          <SelectItem value='50'>50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className='h-4 w-4' />
                      </Button>
                      <span className='text-sm'>
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        <ChevronRight className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
