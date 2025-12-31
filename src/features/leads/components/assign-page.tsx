'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MdSearch,
  MdPersonAdd,
  MdPeople,
  MdChevronLeft,
  MdChevronRight,
  MdFilterList,
  MdClose,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import { customers, type Customer } from '@/features/customers/data/customers'

// Staff members who can be assigned customers
const staffMembers = [
  { id: 'staff-001', name: 'Mike Johnson', role: 'Sales Manager' },
  { id: 'staff-002', name: 'Sarah Williams', role: 'Sales Rep' },
  { id: 'staff-003', name: 'Tom Anderson', role: 'Sales Rep' },
  { id: 'staff-004', name: 'Jessica Chen', role: 'Account Manager' },
  { id: 'staff-005', name: 'Kevin Miller', role: 'Sales Rep' },
  { id: 'staff-006', name: 'Emily Davis', role: 'Account Manager' },
  { id: 'staff-007', name: 'David Wilson', role: 'Sales Rep' },
  { id: 'staff-008', name: 'Rachel Brown', role: 'Sales Manager' },
]

const statusStyles: Record<Customer['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  inactive: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  suspended: 'bg-red-500/10 text-red-600 dark:text-red-400',
  banned: 'bg-red-600/10 text-red-700 dark:text-red-400',
}

export function AssignPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all')
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [customerData, setCustomerData] = useState(customers)
  const [showFilters, setShowFilters] = useState(false)
  const itemsPerPage = 10

  const filteredCustomers = useMemo(() => {
    let result = [...customerData]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.company?.toLowerCase().includes(search)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter)
    }

    if (assignmentFilter === 'unassigned') {
      result = result.filter(c => !c.assignedTo)
    } else if (assignmentFilter === 'assigned') {
      result = result.filter(c => c.assignedTo)
    } else if (assignmentFilter !== 'all') {
      result = result.filter(c => c.assignedTo === assignmentFilter)
    }

    return result
  }, [customerData, searchTerm, statusFilter, assignmentFilter])

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Stats
  const stats = useMemo(() => {
    const total = customerData.length
    const assigned = customerData.filter(c => c.assignedTo).length
    const unassigned = total - assigned
    return { total, assigned, unassigned }
  }, [customerData])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const toggleSelectAll = () => {
    if (selectedCustomers.size === paginatedCustomers.length) {
      setSelectedCustomers(new Set())
    } else {
      setSelectedCustomers(new Set(paginatedCustomers.map(c => c.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedCustomers)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCustomers(newSelected)
  }

  const handleAssign = () => {
    if (!selectedStaff || selectedCustomers.size === 0) return

    const staff = staffMembers.find(s => s.id === selectedStaff)
    if (!staff) return

    setCustomerData(prev => prev.map(customer => {
      if (selectedCustomers.has(customer.id)) {
        return {
          ...customer,
          assignedTo: staff.id,
          assignedToName: staff.name,
        }
      }
      return customer
    }))

    setSelectedCustomers(new Set())
    setSelectedStaff('')
  }

  const handleUnassign = (customerId: string) => {
    setCustomerData(prev => prev.map(customer => {
      if (customer.id === customerId) {
        return {
          ...customer,
          assignedTo: undefined,
          assignedToName: undefined,
        }
      }
      return customer
    }))
  }

  const hasActiveFilters = statusFilter !== 'all' || assignmentFilter !== 'all'

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderActions />
      </Header>

      <Main className="flex flex-1 flex-col gap-5">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assign Customers</h1>
            <p className="text-muted-foreground text-sm">Assign customers to sales representatives</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Total Customers', value: stats.total, color: 'text-foreground' },
            { label: 'Assigned', value: stats.assigned, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Unassigned', value: stats.unassigned, color: 'text-amber-600 dark:text-amber-400' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.1 + idx * 0.05 }}
            >
              <Card className="border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className={cn("text-2xl font-semibold mt-1", stat.color)}>{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Assignment Action Bar */}
        {selectedCustomers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {selectedCustomers.size} customer{selectedCustomers.size > 1 ? 's' : ''} selected
                  </p>
                  <div className="flex items-center gap-3">
                    <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                      <SelectTrigger className="w-[200px] bg-background">
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffMembers.map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">
                                  {getInitials(staff.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{staff.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAssign} disabled={!selectedStaff}>
                      <MdPersonAdd className="mr-2 h-4 w-4" />
                      Assign
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedCustomers(new Set())}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <MdSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="pl-9 h-9"
            />
          </div>
          <Button
            variant={hasActiveFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-9"
          >
            <MdFilterList className="h-4 w-4 mr-1.5" />
            Filters
            {hasActiveFilters && (
              <Badge variant="destructive" className="ml-1.5 h-4 w-4 p-0 text-[10px] rounded-full">
                {(statusFilter !== 'all' ? 1 : 0) + (assignmentFilter !== 'all' ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </motion.div>

        {/* Filter Bar */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-border/50">
              <CardContent className="py-3 flex flex-wrap items-center gap-3">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={assignmentFilter} onValueChange={(v) => { setAssignmentFilter(v); setCurrentPage(1) }}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unassigned">Unassigned Only</SelectItem>
                    <SelectItem value="assigned">Assigned Only</SelectItem>
                    {staffMembers.map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('all')
                      setAssignmentFilter('all')
                    }}
                    className="h-8 text-muted-foreground"
                  >
                    <MdClose className="h-3.5 w-3.5 mr-1" />
                    Clear
                  </Button>
                )}
                <div className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  {filteredCustomers.length} result{filteredCustomers.length !== 1 ? 's' : ''}
                </span>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card className="border-border/50 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-440px)]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={paginatedCustomers.length > 0 && selectedCustomers.size === paginatedCustomers.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[120px]">Total Spent</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer, index) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="group border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.has(customer.id)}
                            onCheckedChange={() => toggleSelect(customer.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-muted">
                                {getInitials(customer.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{customer.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.company ? (
                            <span className="text-sm">{customer.company}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs capitalize', statusStyles[customer.status])}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            ¥{customer.totalSpent.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {customer.assignedToName ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px]">
                                  {getInitials(customer.assignedToName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{customer.assignedToName}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {customer.assignedTo ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnassign(customer.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                            >
                              Unassign
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCustomers(new Set([customer.id]))
                              }}
                            >
                              Assign
                            </Button>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <MdPeople className="h-8 w-8" />
                          <p>No customers found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Pagination */}
            {filteredCustomers.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-muted-foreground text-sm">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of{' '}
                  {filteredCustomers.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <MdChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <MdChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </Main>
    </>
  )
}
