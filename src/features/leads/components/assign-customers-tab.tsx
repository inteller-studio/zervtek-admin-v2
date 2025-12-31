'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatsCard } from '@/features/dashboard/components/stats-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
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
  active: 'bg-emerald-500/10 text-emerald-600',
  inactive: 'bg-slate-500/10 text-slate-600',
  pending: 'bg-amber-500/10 text-amber-600',
  suspended: 'bg-red-500/10 text-red-600',
  banned: 'bg-red-600/10 text-red-700',
}

export function AssignCustomersTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all')
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [customerData, setCustomerData] = useState(customers)
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

  // Stats
  const stats = useMemo(() => {
    const total = customerData.length
    const assigned = customerData.filter(c => c.assignedTo).length
    const unassigned = total - assigned
    return { total, assigned, unassigned }
  }, [customerData])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Customers"
          value={stats.total}
        />
        <StatsCard
          title="Assigned"
          value={stats.assigned}
        />
        <StatsCard
          title="Unassigned"
          value={stats.unassigned}
        />
      </div>

      {/* Assignment Action Bar */}
      {selectedCustomers.size > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedCustomers.size} customer{selectedCustomers.size > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-3">
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger className="w-[200px] bg-white">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
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
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <MdSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[140px]">
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
              <SelectTrigger className="w-[180px]">
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
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={paginatedCustomers.length > 0 && selectedCustomers.size === paginatedCustomers.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCustomers.has(customer.id)}
                          onCheckedChange={() => toggleSelect(customer.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
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
                          <span className="text-sm text-muted-foreground">-</span>
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
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <MdPeople className="h-8 w-8 text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground">No customers found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
        </CardContent>
      </Card>
    </div>
  )
}
