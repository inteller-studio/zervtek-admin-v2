'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AnimatedTabs, AnimatedTabsContent } from '@/components/ui/animated-tabs'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MdPeople,
  MdPersonAdd,
  MdSearch,
  MdMoreHoriz,
  MdEmail,
  MdPhone,
  MdChevronLeft,
  MdChevronRight,
  MdVisibility,
  MdDelete,
  MdCheckCircle,
  MdAccessTime,
  MdCancel,
  MdBusiness,
  MdError,
  MdVerifiedUser,
  MdBlock,
  MdHelpOutline,
  MdWorkspacePremium,
  MdSwapVert,
} from 'react-icons/md'
import { ArrowUpDown, Award, CheckCircle, UserCheck, XCircle, Clock, MoreHorizontal, Eye, CreditCard, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

import { customers as initialCustomers, type Customer, type UserLevel } from '@/features/customers/data/customers'
import { CustomerProfileModal } from '@/features/customers/components/customer-profile-modal'

// Simulated current user - in production this comes from auth context
const CURRENT_USER_ID = 'staff-001'
const CURRENT_USER_NAME = 'Staff Member'

type SortField = 'name' | 'totalSpent' | 'createdAt' | 'lastActivity' | 'wonAuctions' | 'depositAmount'
type SortOrder = 'asc' | 'desc'

const countries = [
  'United States', 'United Kingdom', 'Germany', 'Japan', 'Canada',
  'Australia', 'France', 'Italy', 'Spain', 'Netherlands',
  'United Arab Emirates', 'Singapore', 'South Korea', 'China', 'Russia',
]

export function MyCustomers() {
  const [allCustomers, setAllCustomers] = useState<Customer[]>(initialCustomers)
  const [activeTab, setActiveTab] = useState('my-customers')

  // Pre-filter to only show customers assigned to current user
  const myCustomers = useMemo(() => {
    return allCustomers.filter(c => c.assignedTo === CURRENT_USER_ID)
  }, [allCustomers])

  // Unclaimed customers (no assignedTo)
  const unclaimedCustomers = useMemo(() => {
    return allCustomers.filter(c => !c.assignedTo)
  }, [allCustomers])

  // Use the appropriate list based on active tab
  const customers = activeTab === 'my-customers' ? myCustomers : unclaimedCustomers
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>('all')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('lastActivity')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)
  const [customerToClaim, setCustomerToClaim] = useState<Customer | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter and sort
  const filteredCustomers = useMemo(() => {
    const result = customers.filter((customer) => {
      const matchesSearch =
        searchTerm === '' ||
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
      const matchesVerification = verificationFilter === 'all' || customer.verificationStatus === verificationFilter
      const matchesCountry = countryFilter === 'all' || customer.country === countryFilter
      const matchesLevel = levelFilter === 'all' || customer.userLevel === levelFilter
      return matchesSearch && matchesStatus && matchesVerification && matchesCountry && matchesLevel
    })

    result.sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'totalSpent':
          aValue = a.totalSpent
          bValue = b.totalSpent
          break
        case 'wonAuctions':
          aValue = a.wonAuctions
          bValue = b.wonAuctions
          break
        case 'depositAmount':
          aValue = a.depositAmount
          bValue = b.depositAmount
          break
        case 'createdAt':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        case 'lastActivity':
          aValue = a.lastActivity
          bValue = b.lastActivity
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [customers, searchTerm, statusFilter, verificationFilter, countryFilter, levelFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getStatusBadge = (status: Customer['status']) => {
    const config = {
      active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      inactive: { label: 'Inactive', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
      pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
      suspended: { label: 'Suspended', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
      banned: { label: 'Banned', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
    }
    return <Badge variant='outline' className={config[status].className}>{config[status].label}</Badge>
  }

  const getVerificationBadge = (status: Customer['verificationStatus']) => {
    const config = {
      verified: { label: 'Verified', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: MdCheckCircle },
      pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: MdAccessTime },
      unverified: { label: 'Unverified', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20', icon: MdCancel },
      documents_requested: { label: 'Docs Requested', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: MdHelpOutline },
    }
    const Icon = config[status].icon
    return (
      <Badge variant='outline' className={config[status].className}>
        <Icon className='mr-1 h-3 w-3' />
        {config[status].label}
      </Badge>
    )
  }

  const getUserLevelBadge = (level: UserLevel) => {
    const config = {
      unverified: { label: 'Unverified', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
      verified: { label: 'Verified', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      premium: { label: 'Premium', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
      business: { label: 'Business', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      business_premium: { label: 'Business Premium', className: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
    }
    return (
      <Badge variant='outline' className={config[level].className}>
        <MdWorkspacePremium className='mr-1 h-3 w-3' />
        {config[level].label}
      </Badge>
    )
  }

  const getDaysSinceActive = (date: Date) => {
    const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setViewDialogOpen(true)
  }

  const handleSendEmail = (customer: Customer) => {
    toast.success(`Opening email for ${customer.email}`)
  }

  const handleCallCustomer = (customer: Customer) => {
    toast.success(`Calling ${customer.phone}`)
  }

  const handleSuspendCustomer = (customer: Customer) => {
    setAllCustomers(allCustomers.map((c) => (c.id === customer.id ? { ...c, status: 'suspended' as const } : c)))
    toast.success(`${customer.name} has been suspended`)
  }

  const handleActivateCustomer = (customer: Customer) => {
    setAllCustomers(allCustomers.map((c) => (c.id === customer.id ? { ...c, status: 'active' as const } : c)))
    toast.success(`${customer.name} has been activated`)
  }

  const handleVerifyCustomer = (customer: Customer) => {
    setAllCustomers(allCustomers.map((c) =>
      c.id === customer.id ? { ...c, verificationStatus: 'verified' as const, status: 'active' as const } : c
    ))
    toast.success(`${customer.name} has been verified`)
  }

  const handleChangeUserLevel = (customer: Customer, newLevel: UserLevel) => {
    setAllCustomers(allCustomers.map((c) => (c.id === customer.id ? { ...c, userLevel: newLevel } : c)))
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer({ ...customer, userLevel: newLevel })
    }
    toast.success(`${customer.name}'s level changed to ${newLevel.charAt(0).toUpperCase() + newLevel.slice(1)}`)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setAllCustomers(allCustomers.filter((c) => c.id !== customer.id))
    toast.success(`${customer.name} has been deleted`)
  }

  const handleClaimCustomer = (customer: Customer) => {
    setAllCustomers(allCustomers.map((c) =>
      c.id === customer.id ? { ...c, assignedTo: CURRENT_USER_ID, assignedToName: CURRENT_USER_NAME } : c
    ))
    // Update selected customer if viewing in modal
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer({ ...customer, assignedTo: CURRENT_USER_ID, assignedToName: CURRENT_USER_NAME })
    }
    toast.success(`${customer.name} has been assigned to you`)
  }

  const handleUnclaimCustomer = (customer: Customer) => {
    setAllCustomers(allCustomers.map((c) =>
      c.id === customer.id ? { ...c, assignedTo: undefined, assignedToName: undefined } : c
    ))
    // Update selected customer if viewing in modal
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer({ ...customer, assignedTo: undefined, assignedToName: undefined })
    }
    toast.success(`${customer.name} has been unassigned`)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
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
            <h1 className='text-2xl font-bold tracking-tight'>My Customers</h1>
            <p className='text-muted-foreground'>Manage your assigned customers and claim new ones</p>
          </div>
        </div>

        {/* Tabs */}
        <AnimatedTabs
          tabs={[
            { id: 'my-customers', label: 'My Customers', icon: MdVerifiedUser, badge: myCustomers.length > 0 ? myCustomers.length : undefined },
            { id: 'unclaimed', label: 'Unclaimed', icon: MdPersonAdd, badge: unclaimedCustomers.length > 0 ? unclaimedCustomers.length : undefined, badgeColor: 'amber' },
          ]}
          value={activeTab}
          onValueChange={(value) => { setActiveTab(value); setCurrentPage(1); }}
        >
          <AnimatedTabsContent value={activeTab} className='mt-4 space-y-4'>
        {/* Search and Filters */}
        <Card>
          <CardContent className='p-4'>
            <div className='flex flex-wrap items-center gap-3'>
              <div className='relative flex-1 min-w-[200px]'>
                <MdSearch className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                <Input
                  placeholder='Search by name, email, phone, or company...'
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className='pl-10'
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className='w-[130px]'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='suspended'>Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verificationFilter} onValueChange={(value) => { setVerificationFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder='Verification' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='verified'>Verified</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='unverified'>Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={(value) => { setLevelFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className='w-[150px]'>
                  <SelectValue placeholder='Level' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Levels</SelectItem>
                  <SelectItem value='business_premium'>Business Premium</SelectItem>
                  <SelectItem value='business'>Business</SelectItem>
                  <SelectItem value='premium'>Premium</SelectItem>
                  <SelectItem value='verified'>Verified</SelectItem>
                  <SelectItem value='unverified'>Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Select value={countryFilter} onValueChange={(value) => { setCountryFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className='w-[150px]'>
                  <SelectValue placeholder='Country' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
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
                    <TableHead className='w-[280px]'>
                      <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('name')}>
                        Customer <MdSwapVert className='ml-2 h-4 w-4' />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('totalSpent')}>
                        Total Spent <MdSwapVert className='ml-2 h-4 w-4' />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('depositAmount')}>
                        Deposit <MdSwapVert className='ml-2 h-4 w-4' />
                      </Button>
                    </TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead>Active Bids</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id} className='cursor-pointer hover:bg-muted/50' onClick={() => handleViewCustomer(customer)}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-10 w-10'>
                              <AvatarFallback className='bg-primary/10 text-primary text-sm'>
                                {getInitials(customer.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className='min-w-0'>
                              <div className='flex items-center gap-2'>
                                <span className='font-medium truncate'>{customer.name}</span>
                                {getUserLevelBadge(customer.userLevel)}
                              </div>
                              <div className='text-muted-foreground text-sm truncate'>{customer.email}</div>
                              {customer.company && (
                                <div className='text-muted-foreground text-xs flex items-center gap-1'>
                                  <MdBusiness className='h-3 w-3' />
                                  {customer.company}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col gap-1'>
                            {getStatusBadge(customer.status)}
                            {getVerificationBadge(customer.verificationStatus)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='font-medium'>¥{customer.totalSpent.toLocaleString()}</div>
                          {customer.outstandingBalance > 0 && (
                            <div className='text-orange-600 text-xs flex items-center gap-1'>
                              <MdError className='h-3 w-3' />
                              Due: ¥{customer.outstandingBalance.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='font-medium'>¥{customer.depositAmount.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className='text-center'>
                            <div className='font-medium'>{customer.wonAuctions}</div>
                            <div className='text-muted-foreground text-xs'>{customer.totalBids} bids</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.activeBids > 0 ? (
                            <Badge variant='secondary'>{customer.activeBids} active</Badge>
                          ) : (
                            <span className='text-muted-foreground text-sm'>None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>{getDaysSinceActive(customer.lastActivity)}</div>
                          <div className='text-muted-foreground text-xs'>{customer.city}, {customer.country}</div>
                        </TableCell>
                        <TableCell className='text-right' onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MdMoreHoriz className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                                <MdVisibility className='mr-2 h-4 w-4' />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendEmail(customer)}>
                                <MdEmail className='mr-2 h-4 w-4' />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCallCustomer(customer)}>
                                <MdPhone className='mr-2 h-4 w-4' />
                                Call
                              </DropdownMenuItem>
                              {customer.verificationStatus !== 'verified' && (
                                <DropdownMenuItem onClick={() => handleVerifyCustomer(customer)}>
                                  <MdCheckCircle className='mr-2 h-4 w-4' />
                                  Verify
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {activeTab === 'unclaimed' ? (
                                <DropdownMenuItem onClick={() => { setCustomerToClaim(customer); setClaimDialogOpen(true); }} className='text-emerald-600'>
                                  <MdPersonAdd className='mr-2 h-4 w-4' />
                                  Claim Customer
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleUnclaimCustomer(customer)} className='text-amber-600'>
                                  <MdPersonAdd className='mr-2 h-4 w-4' />
                                  Release Customer
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {customer.status === 'suspended' ? (
                                <DropdownMenuItem onClick={() => handleActivateCustomer(customer)}>
                                  <MdVerifiedUser className='mr-2 h-4 w-4' />
                                  Activate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleSuspendCustomer(customer)} className='text-orange-600'>
                                  <MdBlock className='mr-2 h-4 w-4' />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDeleteCustomer(customer)} className='text-destructive'>
                                <MdDelete className='mr-2 h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className='h-24 text-center'>
                        <div className='flex flex-col items-center justify-center'>
                          <MdPeople className='h-8 w-8 text-muted-foreground/50 mb-2' />
                          <p className='text-muted-foreground'>
                            {activeTab === 'unclaimed'
                              ? 'No unclaimed customers available'
                              : 'No customers assigned to you'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredCustomers.length > 0 && (
              <div className='flex items-center justify-between p-4 border-t'>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <span>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length}
                  </span>
                  <Select value={String(itemsPerPage)} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
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
                  <Button variant='outline' size='sm' onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    <MdChevronLeft className='h-4 w-4' />
                  </Button>
                  <span className='text-sm'>Page {currentPage} of {totalPages || 1}</span>
                  <Button variant='outline' size='sm' onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
                    <MdChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
          </AnimatedTabsContent>
        </AnimatedTabs>
      </Main>

      {/* View Customer Modal */}
      <CustomerProfileModal
        customer={selectedCustomer}
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        onSendEmail={handleSendEmail}
        onCallCustomer={handleCallCustomer}
        onVerifyCustomer={handleVerifyCustomer}
        onChangeUserLevel={handleChangeUserLevel}
        onClaimCustomer={handleClaimCustomer}
      />

      {/* Claim Customer Confirmation Dialog */}
      <AlertDialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Claim Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to claim <span className='font-medium text-foreground'>{customerToClaim?.name}</span>?
              This customer will be assigned to you and appear in your customer list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-emerald-600 hover:bg-emerald-700'
              onClick={() => {
                if (customerToClaim) {
                  handleClaimCustomer(customerToClaim)
                }
                setClaimDialogOpen(false)
                setCustomerToClaim(null)
              }}
            >
              <MdPersonAdd className='mr-2 h-4 w-4' />
              Claim Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
