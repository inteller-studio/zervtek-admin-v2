'use client'

import { useState, useMemo } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/features/dashboard/components/stats-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
  Search as SearchIcon,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  User,
  Download,
  Upload,
  Filter,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  ShoppingBag,
  Gavel,
  Award,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

// Types
type UserLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  country: string
  address: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  totalPurchases: number
  totalSpent: number
  totalBids: number
  wonAuctions: number
  verificationStatus: 'verified' | 'pending' | 'unverified'
  userLevel: UserLevel
  createdAt: Date
  lastActivity: Date
}

// Mock data
const countries = [
  'United States',
  'United Kingdom',
  'Germany',
  'Japan',
  'Canada',
  'Australia',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
]

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    address: '123 Main St, New York, NY 10001',
    status: 'active',
    totalPurchases: 8,
    totalSpent: 145000,
    totalBids: 23,
    wonAuctions: 8,
    verificationStatus: 'verified',
    userLevel: 'gold',
    createdAt: new Date('2023-01-15'),
    lastActivity: new Date('2024-01-25'),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 234-5678',
    country: 'United States',
    address: '456 Oak Ave, Los Angeles, CA 90001',
    status: 'active',
    totalPurchases: 12,
    totalSpent: 278500,
    totalBids: 45,
    wonAuctions: 12,
    verificationStatus: 'verified',
    userLevel: 'platinum',
    createdAt: new Date('2022-11-20'),
    lastActivity: new Date('2024-01-24'),
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'mbrown@example.com',
    phone: '+1 (555) 345-6789',
    country: 'Canada',
    address: '789 Maple Rd, Toronto, ON M5V 2T6',
    status: 'inactive',
    totalPurchases: 2,
    totalSpent: 32000,
    totalBids: 8,
    wonAuctions: 2,
    verificationStatus: 'verified',
    userLevel: 'bronze',
    createdAt: new Date('2023-06-10'),
    lastActivity: new Date('2023-12-15'),
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+1 (555) 456-7890',
    country: 'United Kingdom',
    address: '321 King St, London, UK SW1A 1AA',
    status: 'pending',
    totalPurchases: 0,
    totalSpent: 0,
    totalBids: 3,
    wonAuctions: 0,
    verificationStatus: 'pending',
    userLevel: 'bronze',
    createdAt: new Date('2024-01-20'),
    lastActivity: new Date('2024-01-20'),
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'r.wilson@example.com',
    phone: '+1 (555) 567-8901',
    country: 'Australia',
    address: '567 Sydney St, Sydney, NSW 2000',
    status: 'active',
    totalPurchases: 18,
    totalSpent: 456000,
    totalBids: 67,
    wonAuctions: 18,
    verificationStatus: 'verified',
    userLevel: 'vip',
    createdAt: new Date('2022-03-25'),
    lastActivity: new Date('2024-01-23'),
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    phone: '+1 (416) 123-4567',
    country: 'Canada',
    address: '890 Queen St W, Toronto, ON M5V 2A7',
    status: 'active',
    totalPurchases: 5,
    totalSpent: 89000,
    totalBids: 15,
    wonAuctions: 5,
    verificationStatus: 'verified',
    userLevel: 'silver',
    createdAt: new Date('2023-04-12'),
    lastActivity: new Date('2024-01-22'),
  },
  {
    id: '7',
    name: 'David Lee',
    email: 'david.lee@example.com',
    phone: '+82 2 1234-5678',
    country: 'Japan',
    address: '1-2-3 Shibuya, Tokyo 150-0002',
    status: 'active',
    totalPurchases: 15,
    totalSpent: 320000,
    totalBids: 52,
    wonAuctions: 15,
    verificationStatus: 'verified',
    userLevel: 'platinum',
    createdAt: new Date('2022-08-18'),
    lastActivity: new Date('2024-01-21'),
  },
  {
    id: '8',
    name: 'James Brown',
    email: 'jbrown@example.com',
    phone: '+49 30 1234 5678',
    country: 'Germany',
    address: '45 Berlin Strasse, Berlin 10115',
    status: 'suspended',
    totalPurchases: 3,
    totalSpent: 55000,
    totalBids: 28,
    wonAuctions: 3,
    verificationStatus: 'verified',
    userLevel: 'silver',
    createdAt: new Date('2023-02-28'),
    lastActivity: new Date('2023-11-10'),
  },
  {
    id: '9',
    name: 'Maria Garcia',
    email: 'mgarcia@example.com',
    phone: '+33 1 23 45 67 89',
    country: 'France',
    address: '78 Rue de Paris, Paris 75001',
    status: 'active',
    totalPurchases: 7,
    totalSpent: 156000,
    totalBids: 31,
    wonAuctions: 7,
    verificationStatus: 'verified',
    userLevel: 'gold',
    createdAt: new Date('2022-12-05'),
    lastActivity: new Date('2024-01-20'),
  },
  {
    id: '10',
    name: 'Thomas Martin',
    email: 'tmartin@example.com',
    phone: '+44 20 1234 5678',
    country: 'United Kingdom',
    address: '12 Oxford St, Manchester M1 5JG',
    status: 'pending',
    totalPurchases: 0,
    totalSpent: 0,
    totalBids: 1,
    wonAuctions: 0,
    verificationStatus: 'unverified',
    userLevel: 'bronze',
    createdAt: new Date('2024-01-18'),
    lastActivity: new Date('2024-01-18'),
  },
  {
    id: '11',
    name: 'Anna Schmidt',
    email: 'aschmidt@example.com',
    phone: '+49 89 1234 5678',
    country: 'Germany',
    address: '23 Munich Platz, Munich 80331',
    status: 'active',
    totalPurchases: 4,
    totalSpent: 98000,
    totalBids: 19,
    wonAuctions: 4,
    verificationStatus: 'verified',
    userLevel: 'silver',
    createdAt: new Date('2023-07-22'),
    lastActivity: new Date('2024-01-19'),
  },
  {
    id: '12',
    name: 'Peter Johnson',
    email: 'pjohnson@example.com',
    phone: '+31 20 123 4567',
    country: 'Netherlands',
    address: '56 Amsterdam Ave, Amsterdam 1012',
    status: 'inactive',
    totalPurchases: 1,
    totalSpent: 28000,
    totalBids: 12,
    wonAuctions: 1,
    verificationStatus: 'verified',
    userLevel: 'bronze',
    createdAt: new Date('2023-03-14'),
    lastActivity: new Date('2023-10-25'),
  },
]

type SortField = 'name' | 'totalSpent' | 'createdAt' | 'lastActivity' | 'wonAuctions'
type SortOrder = 'asc' | 'desc'

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>('all')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('lastActivity')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Stats
  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) => c.status === 'active').length
  const pendingVerification = customers.filter((c) => c.verificationStatus === 'pending').length
  const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0)
  const avgCustomerValue = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0

  // Filter and sort
  const filteredCustomers = useMemo(() => {
    let result = customers.filter((customer) => {
      const matchesSearch =
        searchTerm === '' ||
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
      const matchesVerification =
        verificationFilter === 'all' || customer.verificationStatus === verificationFilter
      const matchesCountry = countryFilter === 'all' || customer.country === countryFilter
      return matchesSearch && matchesStatus && matchesVerification && matchesCountry
    })

    // Sort
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
  }, [customers, searchTerm, statusFilter, verificationFilter, countryFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice(
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

  const getStatusBadge = (status: Customer['status']) => {
    const config = {
      active: { label: 'Active', className: 'bg-green-100 text-green-700' },
      inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-700' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      suspended: { label: 'Suspended', className: 'bg-red-100 text-red-700' },
    }
    return <Badge className={config[status].className}>{config[status].label}</Badge>
  }

  const getVerificationBadge = (status: Customer['verificationStatus']) => {
    const config = {
      verified: { label: 'Verified', className: 'bg-green-100 text-green-700', icon: CheckCircle },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
      unverified: { label: 'Unverified', className: 'bg-red-100 text-red-700', icon: XCircle },
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
      bronze: { label: 'Bronze', className: 'bg-amber-100 text-amber-800 border-amber-300' },
      silver: { label: 'Silver', className: 'bg-slate-100 text-slate-700 border-slate-300' },
      gold: { label: 'Gold', className: 'bg-yellow-100 text-yellow-700 border-yellow-400' },
      platinum: { label: 'Platinum', className: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
      vip: { label: 'VIP', className: 'bg-purple-100 text-purple-700 border-purple-400' },
    }
    return (
      <Badge variant='outline' className={config[level].className}>
        <Award className='mr-1 h-3 w-3' />
        {config[level].label}
      </Badge>
    )
  }

  const getDaysSinceActive = (date: Date) => {
    const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
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
    setCustomers(
      customers.map((c) => (c.id === customer.id ? { ...c, status: 'suspended' as const } : c))
    )
    toast.success(`${customer.name} has been suspended`)
  }

  const handleActivateCustomer = (customer: Customer) => {
    setCustomers(
      customers.map((c) => (c.id === customer.id ? { ...c, status: 'active' as const } : c))
    )
    toast.success(`${customer.name} has been activated`)
  }

  const handleVerifyCustomer = (customer: Customer) => {
    setCustomers(
      customers.map((c) =>
        c.id === customer.id ? { ...c, verificationStatus: 'verified' as const, status: 'active' as const } : c
      )
    )
    toast.success(`${customer.name} has been verified`)
  }

  const handleChangeUserLevel = (customer: Customer, newLevel: UserLevel) => {
    setCustomers(
      customers.map((c) =>
        c.id === customer.id ? { ...c, userLevel: newLevel } : c
      )
    )
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer({ ...customer, userLevel: newLevel })
    }
    toast.success(`${customer.name}'s level changed to ${newLevel.charAt(0).toUpperCase() + newLevel.slice(1)}`)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomers(customers.filter((c) => c.id !== customer.id))
    toast.success(`${customer.name} has been deleted`)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Page Header */}
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Customers</h1>
            <p className='text-muted-foreground'>Manage your customer database</p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline'>
              <Upload className='mr-2 h-4 w-4' />
              Import
            </Button>
            <Button variant='outline'>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <StatsCard
            title='Total Customers'
            value={totalCustomers}
            change={12}
            description='vs last month'
          />
          <StatsCard
            title='Active Customers'
            value={activeCustomers}
            change={Math.round((activeCustomers / totalCustomers) * 100) - 100 + 8}
            description={`${Math.round((activeCustomers / totalCustomers) * 100)}% of total`}
          />
          <StatsCard
            title='Total Revenue'
            value={totalRevenue}
            change={15}
            prefix='$'
            description='From all customers'
          />
          <StatsCard
            title='Avg. Customer Value'
            value={avgCustomerValue}
            change={5}
            prefix='$'
            description='Average spending'
          />
        </div>

        {/* Main Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>View and manage all customers</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className='mb-4 flex flex-wrap items-center gap-4'>
              <div className='relative flex-1 min-w-[200px]'>
                <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                <Input
                  placeholder='Search customers...'
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className='pl-10'
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className='w-[140px]'>
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
              <Select
                value={verificationFilter}
                onValueChange={(value) => {
                  setVerificationFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className='w-[160px]'>
                  <SelectValue placeholder='Verification' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Verification</SelectItem>
                  <SelectItem value='verified'>Verified</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='unverified'>Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={countryFilter}
                onValueChange={(value) => {
                  setCountryFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className='w-[160px]'>
                  <SelectValue placeholder='Country' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='-ml-3'
                        onClick={() => toggleSort('name')}
                      >
                        Customer
                        <ArrowUpDown className='ml-2 h-4 w-4' />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='-ml-3'
                        onClick={() => toggleSort('totalSpent')}
                      >
                        Total Spent
                        <ArrowUpDown className='ml-2 h-4 w-4' />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='-ml-3'
                        onClick={() => toggleSort('wonAuctions')}
                      >
                        Purchases
                        <ArrowUpDown className='ml-2 h-4 w-4' />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='-ml-3'
                        onClick={() => toggleSort('createdAt')}
                      >
                        Registered
                        <ArrowUpDown className='ml-2 h-4 w-4' />
                      </Button>
                    </TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarFallback className='bg-primary/10 text-primary text-xs'>
                                {getInitials(customer.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{customer.name}</div>
                              <div className='text-muted-foreground text-sm'>{customer.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col gap-1'>
                            {getStatusBadge(customer.status)}
                            {getVerificationBadge(customer.verificationStatus)}
                            {getUserLevelBadge(customer.userLevel)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <DollarSign className='text-muted-foreground h-3 w-3' />
                            {customer.totalSpent.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='text-center'>
                            <div className='font-medium'>{customer.wonAuctions}</div>
                            <div className='text-muted-foreground text-xs'>
                              of {customer.totalBids} bids
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <Calendar className='text-muted-foreground h-3 w-3' />
                            {format(customer.createdAt, 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>{getDaysSinceActive(customer.lastActivity)}</div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                                <Eye className='mr-2 h-4 w-4' />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendEmail(customer)}>
                                <Mail className='mr-2 h-4 w-4' />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCallCustomer(customer)}>
                                <Phone className='mr-2 h-4 w-4' />
                                Call Customer
                              </DropdownMenuItem>
                              {customer.verificationStatus !== 'verified' && (
                                <DropdownMenuItem onClick={() => handleVerifyCustomer(customer)}>
                                  <CheckCircle className='mr-2 h-4 w-4' />
                                  Verify Customer
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>User Level</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleChangeUserLevel(customer, 'bronze')}>
                                <Award className='mr-2 h-4 w-4 text-amber-600' />
                                Bronze
                                {customer.userLevel === 'bronze' && <CheckCircle className='ml-auto h-3 w-3' />}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeUserLevel(customer, 'silver')}>
                                <Award className='mr-2 h-4 w-4 text-slate-500' />
                                Silver
                                {customer.userLevel === 'silver' && <CheckCircle className='ml-auto h-3 w-3' />}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeUserLevel(customer, 'gold')}>
                                <Award className='mr-2 h-4 w-4 text-yellow-500' />
                                Gold
                                {customer.userLevel === 'gold' && <CheckCircle className='ml-auto h-3 w-3' />}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeUserLevel(customer, 'platinum')}>
                                <Award className='mr-2 h-4 w-4 text-cyan-500' />
                                Platinum
                                {customer.userLevel === 'platinum' && <CheckCircle className='ml-auto h-3 w-3' />}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeUserLevel(customer, 'vip')}>
                                <Award className='mr-2 h-4 w-4 text-purple-500' />
                                VIP
                                {customer.userLevel === 'vip' && <CheckCircle className='ml-auto h-3 w-3' />}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {customer.status === 'suspended' ? (
                                <DropdownMenuItem onClick={() => handleActivateCustomer(customer)}>
                                  <UserCheck className='mr-2 h-4 w-4' />
                                  Activate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleSuspendCustomer(customer)}
                                  className='text-orange-600'
                                >
                                  <Ban className='mr-2 h-4 w-4' />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteCustomer(customer)}
                                className='text-destructive'
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className='h-24 text-center'>
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className='mt-4 flex items-center justify-between'>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of{' '}
                  {filteredCustomers.length} customers
                </span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className='w-[70px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='5'>5</SelectItem>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='20'>20</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                  </SelectContent>
                </Select>
                <span>per page</span>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className='h-4 w-4' />
                  Previous
                </Button>
                <div className='text-sm'>
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Main>

      {/* View Customer Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className='max-w-2xl'>
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-3'>
                  <Avatar className='h-12 w-12'>
                    <AvatarFallback className='bg-primary/10 text-primary'>
                      {getInitials(selectedCustomer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='text-xl'>{selectedCustomer.name}</div>
                    <div className='text-muted-foreground flex items-center gap-2 text-sm font-normal flex-wrap'>
                      {getStatusBadge(selectedCustomer.status)}
                      {getVerificationBadge(selectedCustomer.verificationStatus)}
                      {getUserLevelBadge(selectedCustomer.userLevel)}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Verification & Level Actions */}
              <div className='flex flex-wrap gap-2 mt-2'>
                {selectedCustomer.verificationStatus !== 'verified' && (
                  <Button size='sm' variant='outline' onClick={() => handleVerifyCustomer(selectedCustomer)}>
                    <CheckCircle className='mr-2 h-4 w-4 text-green-600' />
                    Verify User
                  </Button>
                )}
                <Select
                  value={selectedCustomer.userLevel}
                  onValueChange={(value: UserLevel) => handleChangeUserLevel(selectedCustomer, value)}
                >
                  <SelectTrigger className='w-[160px]'>
                    <Award className='mr-2 h-4 w-4' />
                    <SelectValue placeholder='User Level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='bronze'>Bronze</SelectItem>
                    <SelectItem value='silver'>Silver</SelectItem>
                    <SelectItem value='gold'>Gold</SelectItem>
                    <SelectItem value='platinum'>Platinum</SelectItem>
                    <SelectItem value='vip'>VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue='overview' className='mt-4'>
                <TabsList>
                  <TabsTrigger value='overview'>Overview</TabsTrigger>
                  <TabsTrigger value='activity'>Activity</TabsTrigger>
                </TabsList>

                <TabsContent value='overview' className='space-y-4'>
                  {/* Contact Info */}
                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm'>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className='grid gap-3'>
                      <div className='flex items-center gap-2'>
                        <Mail className='text-muted-foreground h-4 w-4' />
                        <span>{selectedCustomer.email}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Phone className='text-muted-foreground h-4 w-4' />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <MapPin className='text-muted-foreground h-4 w-4' />
                        <span>{selectedCustomer.address}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats */}
                  <div className='grid gap-4 md:grid-cols-4'>
                    <Card>
                      <CardContent className='pt-4'>
                        <div className='flex items-center gap-2'>
                          <DollarSign className='text-muted-foreground h-4 w-4' />
                          <span className='text-muted-foreground text-sm'>Total Spent</span>
                        </div>
                        <div className='mt-1 text-2xl font-bold'>
                          ${selectedCustomer.totalSpent.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className='pt-4'>
                        <div className='flex items-center gap-2'>
                          <ShoppingBag className='text-muted-foreground h-4 w-4' />
                          <span className='text-muted-foreground text-sm'>Purchases</span>
                        </div>
                        <div className='mt-1 text-2xl font-bold'>
                          {selectedCustomer.totalPurchases}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className='pt-4'>
                        <div className='flex items-center gap-2'>
                          <Gavel className='text-muted-foreground h-4 w-4' />
                          <span className='text-muted-foreground text-sm'>Total Bids</span>
                        </div>
                        <div className='mt-1 text-2xl font-bold'>{selectedCustomer.totalBids}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className='pt-4'>
                        <div className='flex items-center gap-2'>
                          <Award className='text-muted-foreground h-4 w-4' />
                          <span className='text-muted-foreground text-sm'>Purchases</span>
                        </div>
                        <div className='mt-1 text-2xl font-bold'>
                          {selectedCustomer.wonAuctions}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Dates */}
                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm'>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className='grid gap-3 md:grid-cols-2'>
                      <div>
                        <div className='text-muted-foreground text-sm'>Registered</div>
                        <div className='font-medium'>
                          {format(selectedCustomer.createdAt, 'MMMM dd, yyyy')}
                        </div>
                      </div>
                      <div>
                        <div className='text-muted-foreground text-sm'>Last Active</div>
                        <div className='font-medium'>
                          {format(selectedCustomer.lastActivity, 'MMMM dd, yyyy')} (
                          {getDaysSinceActive(selectedCustomer.lastActivity)})
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='activity'>
                  <Card>
                    <CardContent className='py-8 text-center'>
                      <p className='text-muted-foreground'>Activity history coming soon...</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className='mt-4'>
                <Button variant='outline' onClick={() => handleSendEmail(selectedCustomer)}>
                  <Mail className='mr-2 h-4 w-4' />
                  Send Email
                </Button>
                <Button variant='outline' onClick={() => handleCallCustomer(selectedCustomer)}>
                  <Phone className='mr-2 h-4 w-4' />
                  Call
                </Button>
                {selectedCustomer.status === 'suspended' ? (
                  <Button onClick={() => handleActivateCustomer(selectedCustomer)}>
                    <UserCheck className='mr-2 h-4 w-4' />
                    Activate
                  </Button>
                ) : (
                  <Button
                    variant='destructive'
                    onClick={() => handleSuspendCustomer(selectedCustomer)}
                  >
                    <Ban className='mr-2 h-4 w-4' />
                    Suspend
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter the customer details below</DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label>Full Name</Label>
              <Input placeholder='John Smith' />
            </div>
            <div className='grid gap-2'>
              <Label>Email</Label>
              <Input type='email' placeholder='john@example.com' />
            </div>
            <div className='grid gap-2'>
              <Label>Phone</Label>
              <Input placeholder='+1 (555) 123-4567' />
            </div>
            <div className='grid gap-2'>
              <Label>Country</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder='Select country' />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label>Address</Label>
              <Input placeholder='123 Main St, City, State' />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddDialogOpen(false)
                toast.success('Customer added successfully')
              }}
            >
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
