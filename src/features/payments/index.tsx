'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import {
  ArrowDown,
  BanknoteIcon,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  Send,
  Shield,
  TrendingUp,
  Wallet,
  XCircle,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { StatsCard } from '@/features/dashboard/components/stats-card'

interface Payment {
  id: string
  type: 'paypal' | 'stripe' | 'bank_transfer'
  transactionId: string
  customerId: string
  customerName: string
  customerEmail: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  description: string
  createdAt: Date
  completedAt?: Date
  receipt?: {
    id: string
    url: string
    name: string
    uploadedAt: Date
  }
  bankDetails?: {
    bankName: string
    accountName: string
    referenceNumber: string
  }
  metadata?: {
    invoiceId?: string
    auctionId?: string
    vehicleInfo?: string
  }
}

interface CustomerBalance {
  customerId: string
  customerName: string
  customerEmail: string
  balance: number
  currency: string
  lastPayment?: Date
  totalPaid: number
  pendingAmount: number
}

// Mock data
const mockPayments: Payment[] = [
  {
    id: '1',
    type: 'stripe',
    transactionId: 'pi_1234567890',
    customerId: '101',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    amount: 1500,
    currency: 'USD',
    status: 'completed',
    description: 'Vehicle inspection payment',
    createdAt: new Date('2024-01-20T10:00:00'),
    completedAt: new Date('2024-01-20T10:05:00'),
    metadata: {
      invoiceId: 'INV-2024-001',
      vehicleInfo: '2020 Toyota Camry',
    },
  },
  {
    id: '2',
    type: 'paypal',
    transactionId: 'PP-987654321',
    customerId: '102',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah@example.com',
    amount: 5000,
    currency: 'USD',
    status: 'completed',
    description: 'Auction winning bid payment',
    createdAt: new Date('2024-01-20T09:00:00'),
    completedAt: new Date('2024-01-20T09:10:00'),
    metadata: {
      auctionId: 'AUC-2024-045',
      vehicleInfo: '2019 Honda Civic',
    },
  },
  {
    id: '3',
    type: 'bank_transfer',
    transactionId: 'BT-20240120-001',
    customerId: '103',
    customerName: 'Robert Brown',
    customerEmail: 'robert@example.com',
    amount: 12000,
    currency: 'USD',
    status: 'pending',
    description: 'Vehicle purchase - Bank transfer',
    createdAt: new Date('2024-01-20T11:00:00'),
    receipt: {
      id: '1',
      url: '#',
      name: 'bank_receipt.pdf',
      uploadedAt: new Date('2024-01-20T11:30:00'),
    },
    bankDetails: {
      bankName: 'Chase Bank',
      accountName: 'Robert Brown',
      referenceNumber: 'REF123456789',
    },
  },
  {
    id: '4',
    type: 'stripe',
    transactionId: 'pi_failed_123',
    customerId: '104',
    customerName: 'Emily Chen',
    customerEmail: 'emily@example.com',
    amount: 300,
    currency: 'USD',
    status: 'failed',
    description: 'Translation service payment',
    createdAt: new Date('2024-01-20T08:00:00'),
  },
  {
    id: '5',
    type: 'stripe',
    transactionId: 'pi_9876543210',
    customerId: '105',
    customerName: 'Michael Davis',
    customerEmail: 'michael@example.com',
    amount: 2500,
    currency: 'USD',
    status: 'processing',
    description: 'Vehicle auction deposit',
    createdAt: new Date('2024-01-19T14:00:00'),
  },
]

const mockBalances: CustomerBalance[] = [
  {
    customerId: '101',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    balance: 2500,
    currency: 'USD',
    lastPayment: new Date('2024-01-20T10:00:00'),
    totalPaid: 15000,
    pendingAmount: 0,
  },
  {
    customerId: '102',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah@example.com',
    balance: 8000,
    currency: 'USD',
    lastPayment: new Date('2024-01-20T09:00:00'),
    totalPaid: 25000,
    pendingAmount: 0,
  },
  {
    customerId: '103',
    customerName: 'Robert Brown',
    customerEmail: 'robert@example.com',
    balance: 0,
    currency: 'USD',
    lastPayment: new Date('2024-01-15T09:00:00'),
    totalPaid: 5000,
    pendingAmount: 12000,
  },
]

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [balances, setBalances] = useState<CustomerBalance[]>(mockBalances)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('payments')
  const [reviewNotes, setReviewNotes] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      toast.success(`File ${acceptedFiles[0].name} uploaded`)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || payment.type === filterType
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const handleApprovePayment = (payment: Payment) => {
    setPayments(
      payments.map((p) =>
        p.id === payment.id ? { ...p, status: 'completed' as const, completedAt: new Date() } : p,
      ),
    )

    setBalances(
      balances.map((b) =>
        b.customerId === payment.customerId
          ? {
              ...b,
              balance: b.balance + payment.amount,
              pendingAmount: Math.max(0, b.pendingAmount - payment.amount),
              lastPayment: new Date(),
              totalPaid: b.totalPaid + payment.amount,
            }
          : b,
      ),
    )

    setIsReviewOpen(false)
    setSelectedPayment(null)
    setReviewNotes('')
    toast.success(`Payment approved and balance updated for ${payment.customerName}`)
  }

  const handleRejectPayment = (payment: Payment) => {
    setPayments(
      payments.map((p) => (p.id === payment.id ? { ...p, status: 'failed' as const } : p)),
    )

    setIsReviewOpen(false)
    setSelectedPayment(null)
    setReviewNotes('')
    toast.error(`Payment rejected for ${payment.customerName}`)
  }

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'refunded':
        return 'text-purple-600 bg-purple-50 border-purple-200'
    }
  }

  const getPaymentTypeIcon = (type: Payment['type']) => {
    switch (type) {
      case 'stripe':
        return <CreditCard className='h-4 w-4' />
      case 'paypal':
        return <Wallet className='h-4 w-4' />
      case 'bank_transfer':
        return <BanknoteIcon className='h-4 w-4' />
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const stats = {
    totalRevenue: payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments.filter((p) => p.status === 'pending').length,
    failedPayments: payments.filter((p) => p.status === 'failed').length,
    todayRevenue: payments
      .filter(
        (p) =>
          p.status === 'completed' &&
          p.completedAt &&
          new Date(p.completedAt).toDateString() === new Date().toDateString(),
      )
      .reduce((sum, p) => sum + p.amount, 0),
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
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>Payments</h1>
            <p className='text-muted-foreground'>Manage payments and customer balances</p>
          </div>
          <Button variant='outline' size='sm'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
        </div>

        {/* Stats */}
        <div className='grid gap-4 md:grid-cols-4'>
          <StatsCard
            title='Total Revenue'
            value={stats.totalRevenue}
            change={12}
            prefix='$'
            description='vs last month'
          />
          <StatsCard
            title="Today's Revenue"
            value={stats.todayRevenue}
            change={8}
            prefix='$'
            description={new Date().toLocaleDateString()}
          />
          <StatsCard
            title='Pending Review'
            value={stats.pendingPayments}
            change={-3}
            description='requires manual review'
          />
          <StatsCard
            title='Failed Payments'
            value={stats.failedPayments}
            change={-15}
            description='needs attention'
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='payments'>Payment History</TabsTrigger>
            <TabsTrigger value='balances'>Customer Balances</TabsTrigger>
            <TabsTrigger value='pending'>
              Pending Review
              {stats.pendingPayments > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {stats.pendingPayments}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Payment History Tab */}
          <TabsContent value='payments' className='space-y-4'>
            {/* Filters */}
            <Card>
              <CardContent className='p-4'>
                <div className='flex flex-wrap gap-4'>
                  <div className='relative flex-1 min-w-[200px]'>
                    <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                      placeholder='Search by customer, email, or transaction ID...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className='w-[150px]'>
                      <SelectValue placeholder='Payment Type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Types</SelectItem>
                      <SelectItem value='stripe'>Stripe</SelectItem>
                      <SelectItem value='paypal'>PayPal</SelectItem>
                      <SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className='w-[150px]'>
                      <SelectValue placeholder='Status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Status</SelectItem>
                      <SelectItem value='completed'>Completed</SelectItem>
                      <SelectItem value='pending'>Pending</SelectItem>
                      <SelectItem value='processing'>Processing</SelectItem>
                      <SelectItem value='failed'>Failed</SelectItem>
                      <SelectItem value='refunded'>Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{payment.transactionId}</p>
                          <p className='text-muted-foreground text-xs'>{payment.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{payment.customerName}</p>
                          <p className='text-muted-foreground text-xs'>{payment.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getPaymentTypeIcon(payment.type)}
                          <span className='capitalize'>{payment.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className='font-medium'>
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='text-sm'>
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPayment(payment)
                                setIsDetailsOpen(true)
                              }}
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              View Details
                            </DropdownMenuItem>
                            {payment.status === 'pending' && payment.type === 'bank_transfer' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPayment(payment)
                                  setIsReviewOpen(true)
                                }}
                              >
                                <Shield className='mr-2 h-4 w-4' />
                                Review Payment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <FileText className='mr-2 h-4 w-4' />
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className='mr-2 h-4 w-4' />
                              Download Receipt
                            </DropdownMenuItem>
                            {payment.status === 'completed' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className='text-destructive'>
                                  <ArrowDown className='mr-2 h-4 w-4' />
                                  Issue Refund
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Customer Balances Tab */}
          <TabsContent value='balances' className='space-y-4'>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Pending Amount</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balances.map((balance) => (
                    <TableRow key={balance.customerId}>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{balance.customerName}</p>
                          <p className='text-muted-foreground text-xs'>{balance.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='font-medium text-green-600'>
                          {formatCurrency(balance.balance, balance.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {balance.pendingAmount > 0 ? (
                          <div className='font-medium text-yellow-600'>
                            {formatCurrency(balance.pendingAmount, balance.currency)}
                          </div>
                        ) : (
                          <span className='text-muted-foreground'>-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(balance.totalPaid, balance.currency)}</TableCell>
                      <TableCell>
                        {balance.lastPayment ? (
                          <div>
                            <p className='text-sm'>
                              {new Date(balance.lastPayment).toLocaleDateString()}
                            </p>
                            <p className='text-muted-foreground text-xs'>
                              {new Date(balance.lastPayment).toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          <span className='text-muted-foreground'>Never</span>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
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
                              <Eye className='mr-2 h-4 w-4' />
                              View History
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className='mr-2 h-4 w-4' />
                              Adjust Balance
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className='mr-2 h-4 w-4' />
                              Send Statement
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Pending Review Tab */}
          <TabsContent value='pending' className='space-y-4'>
            <div className='grid gap-4'>
              {payments
                .filter((p) => p.status === 'pending')
                .map((payment) => (
                  <Card key={payment.id}>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <div>
                          <CardTitle className='text-lg'>{payment.customerName}</CardTitle>
                          <CardDescription>
                            {payment.transactionId} - {payment.type.replace('_', ' ')}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <p className='text-muted-foreground text-sm'>Amount</p>
                          <p className='text-lg font-semibold'>
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                        </div>
                        <div>
                          <p className='text-muted-foreground text-sm'>Date</p>
                          <p className='text-lg font-semibold'>
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {payment.bankDetails && (
                        <div className='bg-muted space-y-2 rounded-lg p-3'>
                          <p className='text-sm font-medium'>Bank Details</p>
                          <div className='grid grid-cols-2 gap-2 text-sm'>
                            <div>
                              <span className='text-muted-foreground'>Bank:</span>{' '}
                              {payment.bankDetails.bankName}
                            </div>
                            <div>
                              <span className='text-muted-foreground'>Account:</span>{' '}
                              {payment.bankDetails.accountName}
                            </div>
                            <div className='col-span-2'>
                              <span className='text-muted-foreground'>Reference:</span>{' '}
                              {payment.bankDetails.referenceNumber}
                            </div>
                          </div>
                        </div>
                      )}
                      {payment.receipt && (
                        <div className='bg-muted flex items-center justify-between rounded-lg p-3'>
                          <div className='flex items-center gap-2'>
                            <FileText className='text-muted-foreground h-4 w-4' />
                            <span className='text-sm'>{payment.receipt.name}</span>
                          </div>
                          <Button variant='ghost' size='sm'>
                            <Download className='h-4 w-4' />
                          </Button>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <Button className='flex-1' onClick={() => handleApprovePayment(payment)}>
                          <CheckCircle className='mr-2 h-4 w-4' />
                          Approve & Update Balance
                        </Button>
                        <Button
                          variant='outline'
                          className='flex-1'
                          onClick={() => {
                            setSelectedPayment(payment)
                            setIsReviewOpen(true)
                          }}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          Review Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {payments.filter((p) => p.status === 'pending').length === 0 && (
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-10'>
                    <CheckCircle className='h-12 w-12 text-green-500 mb-4' />
                    <p className='text-lg font-medium'>No Pending Payments</p>
                    <p className='text-muted-foreground text-sm'>All payments have been reviewed</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Transaction ID: {selectedPayment?.transactionId}
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>Customer</Label>
                    <p className='text-sm'>{selectedPayment.customerName}</p>
                    <p className='text-muted-foreground text-xs'>{selectedPayment.customerEmail}</p>
                  </div>
                  <div>
                    <Label>Payment Type</Label>
                    <div className='flex items-center gap-2 text-sm'>
                      {getPaymentTypeIcon(selectedPayment.type)}
                      <span className='capitalize'>{selectedPayment.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <p className='text-sm font-semibold'>
                      {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedPayment.status)}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className='text-sm'>
                      {new Date(selectedPayment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedPayment.completedAt && (
                    <div>
                      <Label>Completed</Label>
                      <p className='text-sm'>
                        {new Date(selectedPayment.completedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <Label>Description</Label>
                  <p className='text-sm'>{selectedPayment.description}</p>
                </div>
                {selectedPayment.metadata && (
                  <>
                    <Separator />
                    <div>
                      <Label>Additional Information</Label>
                      <div className='mt-2 space-y-1'>
                        {selectedPayment.metadata.invoiceId && (
                          <p className='text-sm'>
                            <span className='text-muted-foreground'>Invoice:</span>{' '}
                            {selectedPayment.metadata.invoiceId}
                          </p>
                        )}
                        {selectedPayment.metadata.auctionId && (
                          <p className='text-sm'>
                            <span className='text-muted-foreground'>Auction:</span>{' '}
                            {selectedPayment.metadata.auctionId}
                          </p>
                        )}
                        {selectedPayment.metadata.vehicleInfo && (
                          <p className='text-sm'>
                            <span className='text-muted-foreground'>Vehicle:</span>{' '}
                            {selectedPayment.metadata.vehicleInfo}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review Payment Dialog */}
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Review Bank Transfer</DialogTitle>
              <DialogDescription>
                Verify the payment details and approve or reject the transaction
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>Customer</Label>
                    <p className='text-sm font-medium'>{selectedPayment.customerName}</p>
                    <p className='text-muted-foreground text-xs'>{selectedPayment.customerEmail}</p>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <p className='text-lg font-semibold'>
                      {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                    </p>
                  </div>
                </div>

                {selectedPayment.bankDetails && (
                  <div className='bg-muted space-y-2 rounded-lg p-4'>
                    <h4 className='font-medium'>Provided Bank Details</h4>
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      <div>
                        <span className='text-muted-foreground'>Bank Name:</span>{' '}
                        {selectedPayment.bankDetails.bankName}
                      </div>
                      <div>
                        <span className='text-muted-foreground'>Account Name:</span>{' '}
                        {selectedPayment.bankDetails.accountName}
                      </div>
                      <div className='col-span-2'>
                        <span className='text-muted-foreground'>Reference Number:</span>{' '}
                        <code className='bg-background rounded px-1 py-0.5'>
                          {selectedPayment.bankDetails.referenceNumber}
                        </code>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment.receipt && (
                  <div>
                    <Label>Uploaded Receipt</Label>
                    <div className='bg-muted mt-2 rounded-lg border p-4'>
                      <div className='mb-2 flex items-center justify-between'>
                        <span className='text-sm font-medium'>{selectedPayment.receipt.name}</span>
                        <Button variant='outline' size='sm'>
                          <Download className='mr-2 h-4 w-4' />
                          Download
                        </Button>
                      </div>
                      <div className='bg-background text-muted-foreground rounded-lg p-8 text-center'>
                        <FileText className='mx-auto mb-2 h-12 w-12' />
                        <p className='text-sm'>Receipt preview would appear here</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Review Notes</Label>
                  <Textarea
                    placeholder='Add any notes about this review...'
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className='mt-2'
                  />
                </div>

                <Separator />

                <div className='flex gap-2'>
                  <Button className='flex-1' onClick={() => handleApprovePayment(selectedPayment)}>
                    <CheckCircle className='mr-2 h-4 w-4' />
                    Approve Payment
                  </Button>
                  <Button
                    variant='destructive'
                    className='flex-1'
                    onClick={() => handleRejectPayment(selectedPayment)}
                  >
                    <XCircle className='mr-2 h-4 w-4' />
                    Reject Payment
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsReviewOpen(false)
                      setReviewNotes('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
