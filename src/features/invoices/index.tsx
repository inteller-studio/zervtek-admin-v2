'use client'

import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Plus,
  Eye,
  Download,
  Send,
  MoreHorizontal,
  Filter,
  Calendar,
  DollarSign,
  Copy,
  Trash2,
  Save,
  ArrowLeft,
  Printer,
  Link2,
  Edit,
  X,
  Search as SearchIcon,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Types
interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  companyName: string
  companyAddress: string
  companyCity: string
  companyCountry: string
  companyEmail: string
  companyPhone: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerCountry: string
  auctionId?: string
  vehicleInfo?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
  paymentTerms: string
  notes: string
  bankName: string
  accountName: string
  accountNumber: string
  swiftCode: string
  createdAt: string
  updatedAt: string
}

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-0001',
    date: '2024-01-15',
    dueDate: '2024-01-22',
    status: 'paid',
    companyName: 'Zervtek Ltd.',
    companyAddress: '123 Auction Street',
    companyCity: 'Tokyo',
    companyCountry: 'Japan',
    companyEmail: 'sales@zervtek.com',
    companyPhone: '+81 3-1234-5678',
    customerName: 'John Smith',
    customerEmail: 'john.smith@example.com',
    customerPhone: '+1 234 567 8900',
    customerAddress: '456 Main St',
    customerCity: 'New York',
    customerCountry: 'USA',
    auctionId: 'AUC-2024-0123',
    vehicleInfo: '2019 Toyota Camry',
    items: [
      { id: '1', description: '2019 Toyota Camry - Winning Bid', quantity: 1, unitPrice: 25000, total: 25000 },
      { id: '2', description: 'Auction Service Fee', quantity: 1, unitPrice: 500, total: 500 },
    ],
    subtotal: 25500,
    tax: 2550,
    shipping: 1200,
    discount: 0,
    total: 29250,
    currency: 'USD',
    paymentTerms: 'Payment due within 7 days',
    notes: 'Vehicle will be available for pickup after payment confirmation',
    bankName: 'Tokyo Central Bank',
    accountName: 'Zervtek Ltd.',
    accountNumber: '1234567890',
    swiftCode: 'TCBKJPJT',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-0002',
    date: '2024-01-18',
    dueDate: '2024-01-25',
    status: 'sent',
    companyName: 'Zervtek Ltd.',
    companyAddress: '123 Auction Street',
    companyCity: 'Tokyo',
    companyCountry: 'Japan',
    companyEmail: 'sales@zervtek.com',
    companyPhone: '+81 3-1234-5678',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@example.com',
    customerPhone: '+44 20 1234 5678',
    customerAddress: '789 Oxford Street',
    customerCity: 'London',
    customerCountry: 'UK',
    auctionId: 'AUC-2024-0145',
    vehicleInfo: '2020 BMW X5',
    items: [
      { id: '1', description: '2020 BMW X5 - Winning Bid', quantity: 1, unitPrice: 45000, total: 45000 },
      { id: '2', description: 'Auction Service Fee', quantity: 1, unitPrice: 900, total: 900 },
      { id: '3', description: 'Documentation Fee', quantity: 1, unitPrice: 150, total: 150 },
    ],
    subtotal: 46050,
    tax: 4605,
    shipping: 2500,
    discount: 500,
    total: 52655,
    currency: 'USD',
    paymentTerms: 'Payment due within 7 days',
    notes: 'International shipping included',
    bankName: 'Tokyo Central Bank',
    accountName: 'Zervtek Ltd.',
    accountNumber: '1234567890',
    swiftCode: 'TCBKJPJT',
    createdAt: '2024-01-18T09:30:00Z',
    updatedAt: '2024-01-18T09:30:00Z',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-0003',
    date: '2024-01-20',
    dueDate: '2024-01-27',
    status: 'overdue',
    companyName: 'Zervtek Ltd.',
    companyAddress: '123 Auction Street',
    companyCity: 'Tokyo',
    companyCountry: 'Japan',
    companyEmail: 'sales@zervtek.com',
    companyPhone: '+81 3-1234-5678',
    customerName: 'Michael Chen',
    customerEmail: 'mchen@example.com',
    customerPhone: '+86 10 1234 5678',
    customerAddress: '321 Beijing Road',
    customerCity: 'Beijing',
    customerCountry: 'China',
    auctionId: 'AUC-2024-0156',
    vehicleInfo: '2018 Mercedes-Benz C-Class',
    items: [
      { id: '1', description: '2018 Mercedes-Benz C-Class - Winning Bid', quantity: 1, unitPrice: 32000, total: 32000 },
      { id: '2', description: 'Auction Service Fee', quantity: 1, unitPrice: 640, total: 640 },
    ],
    subtotal: 32640,
    tax: 3264,
    shipping: 1800,
    discount: 0,
    total: 37704,
    currency: 'USD',
    paymentTerms: 'Payment due within 7 days',
    notes: 'Payment reminder sent',
    bankName: 'Tokyo Central Bank',
    accountName: 'Zervtek Ltd.',
    accountNumber: '1234567890',
    swiftCode: 'TCBKJPJT',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-0004',
    date: '2024-01-22',
    dueDate: '2024-01-29',
    status: 'draft',
    companyName: 'Zervtek Ltd.',
    companyAddress: '123 Auction Street',
    companyCity: 'Tokyo',
    companyCountry: 'Japan',
    companyEmail: 'sales@zervtek.com',
    companyPhone: '+81 3-1234-5678',
    customerName: 'Emma Wilson',
    customerEmail: 'emma.w@example.com',
    customerPhone: '+61 2 1234 5678',
    customerAddress: '567 Sydney Ave',
    customerCity: 'Sydney',
    customerCountry: 'Australia',
    items: [
      { id: '1', description: '2021 Audi A4 - Winning Bid', quantity: 1, unitPrice: 38000, total: 38000 },
      { id: '2', description: 'Auction Service Fee', quantity: 1, unitPrice: 760, total: 760 },
    ],
    subtotal: 38760,
    tax: 3876,
    shipping: 2200,
    discount: 0,
    total: 44836,
    currency: 'USD',
    paymentTerms: 'Payment due within 7 days',
    notes: '',
    bankName: 'Tokyo Central Bank',
    accountName: 'Zervtek Ltd.',
    accountNumber: '1234567890',
    swiftCode: 'TCBKJPJT',
    createdAt: '2024-01-22T08:45:00Z',
    updatedAt: '2024-01-22T08:45:00Z',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-0005',
    date: '2024-01-23',
    dueDate: '2024-01-30',
    status: 'cancelled',
    companyName: 'Zervtek Ltd.',
    companyAddress: '123 Auction Street',
    companyCity: 'Tokyo',
    companyCountry: 'Japan',
    companyEmail: 'sales@zervtek.com',
    companyPhone: '+81 3-1234-5678',
    customerName: 'Robert Taylor',
    customerEmail: 'rtaylor@example.com',
    customerPhone: '+33 1 23 45 67 89',
    customerAddress: '890 Paris Boulevard',
    customerCity: 'Paris',
    customerCountry: 'France',
    auctionId: 'AUC-2024-0167',
    vehicleInfo: '2019 Volkswagen Golf',
    items: [
      { id: '1', description: '2019 Volkswagen Golf - Winning Bid', quantity: 1, unitPrice: 22000, total: 22000 },
      { id: '2', description: 'Auction Service Fee', quantity: 1, unitPrice: 440, total: 440 },
    ],
    subtotal: 22440,
    tax: 2244,
    shipping: 1500,
    discount: 0,
    total: 26184,
    currency: 'USD',
    paymentTerms: 'Payment due within 7 days',
    notes: 'Cancelled by customer request',
    bankName: 'Tokyo Central Bank',
    accountName: 'Zervtek Ltd.',
    accountNumber: '1234567890',
    swiftCode: 'TCBKJPJT',
    createdAt: '2024-01-23T13:20:00Z',
    updatedAt: '2024-01-24T09:00:00Z',
  },
  {
    id: '6',
    invoiceNumber: 'INV-2024-0006',
    date: '2024-02-01',
    dueDate: '2024-02-08',
    status: 'paid',
    companyName: 'Zervtek Ltd.',
    companyAddress: '123 Auction Street',
    companyCity: 'Tokyo',
    companyCountry: 'Japan',
    companyEmail: 'sales@zervtek.com',
    companyPhone: '+81 3-1234-5678',
    customerName: 'David Lee',
    customerEmail: 'david.lee@example.com',
    customerPhone: '+82 2 1234 5678',
    customerAddress: '123 Seoul Street',
    customerCity: 'Seoul',
    customerCountry: 'South Korea',
    auctionId: 'AUC-2024-0189',
    vehicleInfo: '2022 Hyundai Sonata',
    items: [
      { id: '1', description: '2022 Hyundai Sonata - Winning Bid', quantity: 1, unitPrice: 28000, total: 28000 },
      { id: '2', description: 'Auction Service Fee', quantity: 1, unitPrice: 560, total: 560 },
      { id: '3', description: 'Express Documentation', quantity: 1, unitPrice: 200, total: 200 },
    ],
    subtotal: 28760,
    tax: 2876,
    shipping: 800,
    discount: 250,
    total: 32186,
    currency: 'USD',
    paymentTerms: 'Payment due within 7 days',
    notes: 'Repeat customer - applied loyalty discount',
    bankName: 'Tokyo Central Bank',
    accountName: 'Zervtek Ltd.',
    accountNumber: '1234567890',
    swiftCode: 'TCBKJPJT',
    createdAt: '2024-02-01T14:00:00Z',
    updatedAt: '2024-02-05T10:30:00Z',
  },
  {
    id: '7',
    invoiceNumber: 'INV-2024-0007',
    date: '2024-02-05',
    dueDate: '2024-02-12',
    status: 'sent',
    companyName: 'Zervtek Ltd.',
    companyAddress: '123 Auction Street',
    companyCity: 'Tokyo',
    companyCountry: 'Japan',
    companyEmail: 'sales@zervtek.com',
    companyPhone: '+81 3-1234-5678',
    customerName: 'Lisa Anderson',
    customerEmail: 'lisa.a@example.com',
    customerPhone: '+1 416 123 4567',
    customerAddress: '456 Toronto Ave',
    customerCity: 'Toronto',
    customerCountry: 'Canada',
    auctionId: 'AUC-2024-0201',
    vehicleInfo: '2021 Honda CR-V',
    items: [
      { id: '1', description: '2021 Honda CR-V - Winning Bid', quantity: 1, unitPrice: 35000, total: 35000 },
      { id: '2', description: 'Auction Service Fee', quantity: 1, unitPrice: 700, total: 700 },
    ],
    subtotal: 35700,
    tax: 3570,
    shipping: 1500,
    discount: 0,
    total: 40770,
    currency: 'USD',
    paymentTerms: 'Payment due within 7 days',
    notes: '',
    bankName: 'Tokyo Central Bank',
    accountName: 'Zervtek Ltd.',
    accountNumber: '1234567890',
    swiftCode: 'TCBKJPJT',
    createdAt: '2024-02-05T11:15:00Z',
    updatedAt: '2024-02-05T11:15:00Z',
  },
  {
    id: '8',
    invoiceNumber: 'INV-2024-0008',
    date: '2024-02-08',
    dueDate: '2024-02-15',
    status: 'draft',
    companyName: 'Zervtek Ltd.',
    companyAddress: '123 Auction Street',
    companyCity: 'Tokyo',
    companyCountry: 'Japan',
    companyEmail: 'sales@zervtek.com',
    companyPhone: '+81 3-1234-5678',
    customerName: 'James Brown',
    customerEmail: 'jbrown@example.com',
    customerPhone: '+49 30 1234 5678',
    customerAddress: '789 Berlin Street',
    customerCity: 'Berlin',
    customerCountry: 'Germany',
    auctionId: 'AUC-2024-0215',
    vehicleInfo: '2020 Porsche 911',
    items: [
      { id: '1', description: '2020 Porsche 911 - Winning Bid', quantity: 1, unitPrice: 95000, total: 95000 },
      { id: '2', description: 'Premium Auction Service Fee', quantity: 1, unitPrice: 1900, total: 1900 },
      { id: '3', description: 'Vehicle Inspection Report', quantity: 1, unitPrice: 350, total: 350 },
      { id: '4', description: 'White Glove Delivery', quantity: 1, unitPrice: 500, total: 500 },
    ],
    subtotal: 97750,
    tax: 9775,
    shipping: 3500,
    discount: 1000,
    total: 110025,
    currency: 'USD',
    paymentTerms: 'Payment due within 7 days',
    notes: 'Premium vehicle - special handling required',
    bankName: 'Tokyo Central Bank',
    accountName: 'Zervtek Ltd.',
    accountNumber: '1234567890',
    swiftCode: 'TCBKJPJT',
    createdAt: '2024-02-08T16:30:00Z',
    updatedAt: '2024-02-08T16:30:00Z',
  },
]

const emptyInvoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
  invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'draft',
  companyName: 'Zervtek Ltd.',
  companyAddress: '123 Auction Street',
  companyCity: 'Tokyo',
  companyCountry: 'Japan',
  companyEmail: 'sales@zervtek.com',
  companyPhone: '+81 3-1234-5678',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
  customerCity: '',
  customerCountry: '',
  items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  currency: 'USD',
  paymentTerms: 'Payment due within 7 days',
  notes: '',
  bankName: 'Tokyo Central Bank',
  accountName: 'Zervtek Ltd.',
  accountNumber: '1234567890',
  swiftCode: 'TCBKJPJT',
}

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [newInvoice, setNewInvoice] = useState(emptyInvoice)

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      searchTerm === '' ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)
  const pendingAmount = invoices
    .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0)
  const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length
  const draftCount = invoices.filter((inv) => inv.status === 'draft').length

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
      sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
      overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
      cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-700' },
    }
    const config = statusConfig[status]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const newInv: Invoice = {
      ...invoice,
      id: String(Date.now()),
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setInvoices([newInv, ...invoices])
    toast.success('Invoice duplicated successfully')
  }

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(invoices.filter((inv) => inv.id !== invoiceId))
    toast.success('Invoice deleted successfully')
  }

  const handleSendInvoice = (invoice: Invoice) => {
    setInvoices(invoices.map((inv) => (inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv)))
    toast.success(`Invoice sent to ${invoice.customerEmail}`)
  }

  const handleMarkPaid = (invoice: Invoice) => {
    setInvoices(invoices.map((inv) => (inv.id === invoice.id ? { ...inv, status: 'paid' as const } : inv)))
    toast.success('Invoice marked as paid')
  }

  const handleDownloadPDF = (invoice: Invoice) => {
    toast.success(`Downloading ${invoice.invoiceNumber}.pdf`)
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setViewDialogOpen(true)
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, newItem],
    })
  }

  const removeItem = (id: string) => {
    if (newInvoice.items.length === 1) {
      toast.error('Invoice must have at least one item')
      return
    }
    const updatedItems = newInvoice.items.filter((item) => item.id !== id)
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0)
    const total = subtotal + newInvoice.tax + newInvoice.shipping - newInvoice.discount
    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      subtotal,
      total,
    })
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = newInvoice.items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice)
        }
        return updated
      }
      return item
    })
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0)
    const total = subtotal + newInvoice.tax + newInvoice.shipping - newInvoice.discount
    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      subtotal,
      total,
    })
  }

  const handleSaveInvoice = () => {
    const invoice: Invoice = {
      ...newInvoice,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setInvoices([invoice, ...invoices])
    setCreateDialogOpen(false)
    setPreviewMode(false)
    setNewInvoice(emptyInvoice)
    toast.success('Invoice saved as draft')
  }

  const handleSendNewInvoice = () => {
    if (!newInvoice.customerEmail) {
      toast.error('Please enter customer email')
      return
    }
    const invoice: Invoice = {
      ...newInvoice,
      id: String(Date.now()),
      status: 'sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setInvoices([invoice, ...invoices])
    setCreateDialogOpen(false)
    setPreviewMode(false)
    setNewInvoice(emptyInvoice)
    toast.success('Invoice sent to customer')
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
            <h1 className='text-3xl font-bold tracking-tight'>Invoices</h1>
            <p className='text-muted-foreground'>Manage and track all your invoices</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Create New Invoice
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <StatsCard
            title='Total Revenue'
            value={totalRevenue}
            change={18}
            prefix='$'
            description='from paid invoices'
          />
          <StatsCard
            title='Pending Amount'
            value={pendingAmount}
            change={-5}
            prefix='$'
            description='awaiting payment'
          />
          <StatsCard
            title='Overdue'
            value={overdueCount}
            change={-12}
            description='invoices overdue'
          />
          <StatsCard
            title='Drafts'
            value={draftCount}
            change={3}
            description='unsent invoices'
          />
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>All Invoices</CardTitle>
              <div className='flex gap-2'>
                <div className='relative'>
                  <SearchIcon className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
                  <Input
                    placeholder='Search invoices...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-[250px] pl-8'
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <Filter className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('sent')}>Sent</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('paid')}>Paid</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('overdue')}>Overdue</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>Cancelled</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className='font-medium'>{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className='font-medium'>{invoice.customerName}</div>
                        <div className='text-muted-foreground text-sm'>{invoice.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(invoice.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className='font-medium'>
                        {invoice.currency} {invoice.total.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                            <Eye className='mr-2 h-4 w-4' />
                            View
                          </DropdownMenuItem>
                          {(invoice.status === 'draft' || invoice.status === 'sent') && (
                            <DropdownMenuItem onClick={() => handleSendInvoice(invoice)}>
                              <Send className='mr-2 h-4 w-4' />
                              {invoice.status === 'draft' ? 'Send' : 'Resend'}
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'sent' && (
                            <DropdownMenuItem onClick={() => handleMarkPaid(invoice)}>
                              <CheckCircle className='mr-2 h-4 w-4' />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                            <Download className='mr-2 h-4 w-4' />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateInvoice(invoice)}>
                            <Copy className='mr-2 h-4 w-4' />
                            Duplicate
                          </DropdownMenuItem>
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id)} className='text-destructive'>
                              <Trash2 className='mr-2 h-4 w-4' />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredInvoices.length === 0 && (
              <div className='py-8 text-center'>
                <p className='text-muted-foreground'>No invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Main>

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
          {selectedInvoice && (
            <>
              <DialogHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                  <div className='flex gap-2'>
                    {selectedInvoice.status === 'draft' && (
                      <Button size='sm' onClick={() => handleSendInvoice(selectedInvoice)}>
                        <Send className='mr-2 h-4 w-4' />
                        Send
                      </Button>
                    )}
                    <Button size='sm' variant='outline' onClick={() => handleDownloadPDF(selectedInvoice)}>
                      <Download className='mr-2 h-4 w-4' />
                      Download
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/invoices/${selectedInvoice.id}`)
                        toast.success('Invoice link copied')
                      }}
                    >
                      <Link2 className='mr-2 h-4 w-4' />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className='space-y-6'>
                {/* Header */}
                <div className='flex justify-between'>
                  <div>
                    <h2 className='text-2xl font-bold'>{selectedInvoice.companyName}</h2>
                    <p className='text-muted-foreground mt-1 text-sm'>
                      {selectedInvoice.companyAddress}
                      <br />
                      {selectedInvoice.companyCity}, {selectedInvoice.companyCountry}
                      <br />
                      {selectedInvoice.companyEmail}
                      <br />
                      {selectedInvoice.companyPhone}
                    </p>
                  </div>
                  <div className='text-right'>
                    <h3 className='text-xl font-bold'>INVOICE</h3>
                    <p className='mt-2 text-sm'>
                      <span className='font-medium'>Invoice #:</span> {selectedInvoice.invoiceNumber}
                    </p>
                    <p className='text-sm'>
                      <span className='font-medium'>Date:</span> {format(new Date(selectedInvoice.date), 'MMM dd, yyyy')}
                    </p>
                    <p className='text-sm'>
                      <span className='font-medium'>Due Date:</span> {format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}
                    </p>
                    {selectedInvoice.auctionId && (
                      <p className='text-sm'>
                        <span className='font-medium'>Auction ID:</span> {selectedInvoice.auctionId}
                      </p>
                    )}
                    {selectedInvoice.vehicleInfo && (
                      <p className='text-sm'>
                        <span className='font-medium'>Vehicle:</span> {selectedInvoice.vehicleInfo}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Bill To */}
                <div>
                  <h4 className='mb-2 font-semibold'>Bill To:</h4>
                  <p className='text-sm'>
                    {selectedInvoice.customerName}
                    <br />
                    {selectedInvoice.customerAddress}
                    <br />
                    {selectedInvoice.customerCity}, {selectedInvoice.customerCountry}
                    <br />
                    {selectedInvoice.customerEmail}
                    <br />
                    {selectedInvoice.customerPhone}
                  </p>
                </div>

                {/* Items Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className='text-right'>Qty</TableHead>
                      <TableHead className='text-right'>Unit Price</TableHead>
                      <TableHead className='text-right'>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className='text-right'>{item.quantity}</TableCell>
                        <TableCell className='text-right'>
                          {selectedInvoice.currency} {item.unitPrice.toLocaleString()}
                        </TableCell>
                        <TableCell className='text-right'>
                          {selectedInvoice.currency} {item.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Totals */}
                <div className='flex justify-end'>
                  <div className='w-64 space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Subtotal:</span>
                      <span>
                        {selectedInvoice.currency} {selectedInvoice.subtotal.toLocaleString()}
                      </span>
                    </div>
                    {selectedInvoice.tax > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Tax:</span>
                        <span>
                          {selectedInvoice.currency} {selectedInvoice.tax.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedInvoice.shipping > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Shipping:</span>
                        <span>
                          {selectedInvoice.currency} {selectedInvoice.shipping.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedInvoice.discount > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Discount:</span>
                        <span>
                          -{selectedInvoice.currency} {selectedInvoice.discount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className='flex justify-between text-lg font-bold'>
                      <span>Total:</span>
                      <span>
                        {selectedInvoice.currency} {selectedInvoice.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Terms & Notes */}
                {(selectedInvoice.paymentTerms || selectedInvoice.notes) && (
                  <>
                    <Separator />
                    <div className='space-y-4'>
                      {selectedInvoice.paymentTerms && (
                        <div>
                          <h4 className='mb-1 font-semibold'>Payment Terms</h4>
                          <p className='text-muted-foreground text-sm'>{selectedInvoice.paymentTerms}</p>
                        </div>
                      )}
                      {selectedInvoice.notes && (
                        <div>
                          <h4 className='mb-1 font-semibold'>Notes</h4>
                          <p className='text-muted-foreground text-sm'>{selectedInvoice.notes}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Bank Details */}
                {selectedInvoice.bankName && (
                  <>
                    <Separator />
                    <div>
                      <h4 className='mb-2 font-semibold'>Bank Details</h4>
                      <div className='grid grid-cols-2 gap-2 text-sm'>
                        <div>
                          <span className='text-muted-foreground'>Bank Name:</span> {selectedInvoice.bankName}
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Account Name:</span> {selectedInvoice.accountName}
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Account Number:</span> {selectedInvoice.accountNumber}
                        </div>
                        <div>
                          <span className='text-muted-foreground'>SWIFT Code:</span> {selectedInvoice.swiftCode}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Footer */}
                <Separator />
                <div className='text-muted-foreground text-center text-sm'>
                  <p>Thank you for your business!</p>
                  <p className='mt-2'>
                    Created on {format(new Date(selectedInvoice.createdAt), 'MMM dd, yyyy')} • Last updated{' '}
                    {format(new Date(selectedInvoice.updatedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-5xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {previewMode ? 'Invoice Preview' : 'Create New Invoice'}
            </DialogTitle>
            <DialogDescription>
              {previewMode ? 'Review your invoice before sending' : 'Fill in the details to create a new invoice'}
            </DialogDescription>
          </DialogHeader>

          {previewMode ? (
            // Preview Mode
            <div className='space-y-6'>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setPreviewMode(false)}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back to Edit
                </Button>
                <Button variant='outline' onClick={handleSaveInvoice}>
                  <Save className='mr-2 h-4 w-4' />
                  Save Draft
                </Button>
                <Button onClick={handleSendNewInvoice}>
                  <Send className='mr-2 h-4 w-4' />
                  Send Invoice
                </Button>
              </div>

              <Card>
                <CardContent className='p-8'>
                  <div className='space-y-6'>
                    {/* Header */}
                    <div className='flex justify-between'>
                      <div>
                        <h2 className='text-2xl font-bold'>{newInvoice.companyName}</h2>
                        <p className='text-muted-foreground mt-1 text-sm'>
                          {newInvoice.companyAddress}
                          <br />
                          {newInvoice.companyCity}, {newInvoice.companyCountry}
                          <br />
                          {newInvoice.companyEmail}
                          <br />
                          {newInvoice.companyPhone}
                        </p>
                      </div>
                      <div className='text-right'>
                        <h3 className='text-xl font-bold'>INVOICE</h3>
                        <p className='mt-2 text-sm'>
                          <span className='font-medium'>Invoice #:</span> {newInvoice.invoiceNumber}
                        </p>
                        <p className='text-sm'>
                          <span className='font-medium'>Date:</span> {format(new Date(newInvoice.date), 'MMM dd, yyyy')}
                        </p>
                        <p className='text-sm'>
                          <span className='font-medium'>Due Date:</span> {format(new Date(newInvoice.dueDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Bill To */}
                    <div>
                      <h4 className='mb-2 font-semibold'>Bill To:</h4>
                      <p className='text-sm'>
                        {newInvoice.customerName || 'Customer Name'}
                        <br />
                        {newInvoice.customerAddress || 'Address'}
                        <br />
                        {newInvoice.customerCity || 'City'}, {newInvoice.customerCountry || 'Country'}
                        <br />
                        {newInvoice.customerEmail || 'email@example.com'}
                        <br />
                        {newInvoice.customerPhone || 'Phone'}
                      </p>
                    </div>

                    {/* Items Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className='text-right'>Qty</TableHead>
                          <TableHead className='text-right'>Unit Price</TableHead>
                          <TableHead className='text-right'>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newInvoice.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description || 'Item description'}</TableCell>
                            <TableCell className='text-right'>{item.quantity}</TableCell>
                            <TableCell className='text-right'>
                              {newInvoice.currency} {item.unitPrice.toLocaleString()}
                            </TableCell>
                            <TableCell className='text-right'>
                              {newInvoice.currency} {item.total.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Totals */}
                    <div className='flex justify-end'>
                      <div className='w-64 space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span>Subtotal:</span>
                          <span>
                            {newInvoice.currency} {newInvoice.subtotal.toLocaleString()}
                          </span>
                        </div>
                        {newInvoice.tax > 0 && (
                          <div className='flex justify-between text-sm'>
                            <span>Tax:</span>
                            <span>
                              {newInvoice.currency} {newInvoice.tax.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {newInvoice.shipping > 0 && (
                          <div className='flex justify-between text-sm'>
                            <span>Shipping:</span>
                            <span>
                              {newInvoice.currency} {newInvoice.shipping.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {newInvoice.discount > 0 && (
                          <div className='flex justify-between text-sm'>
                            <span>Discount:</span>
                            <span>
                              -{newInvoice.currency} {newInvoice.discount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <Separator />
                        <div className='flex justify-between text-lg font-bold'>
                          <span>Total:</span>
                          <span>
                            {newInvoice.currency} {newInvoice.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Terms & Notes */}
                    {(newInvoice.paymentTerms || newInvoice.notes) && (
                      <>
                        <Separator />
                        <div className='space-y-4'>
                          {newInvoice.paymentTerms && (
                            <div>
                              <h4 className='mb-1 font-semibold'>Payment Terms</h4>
                              <p className='text-muted-foreground text-sm'>{newInvoice.paymentTerms}</p>
                            </div>
                          )}
                          {newInvoice.notes && (
                            <div>
                              <h4 className='mb-1 font-semibold'>Notes</h4>
                              <p className='text-muted-foreground text-sm'>{newInvoice.notes}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Bank Details */}
                    {newInvoice.bankName && (
                      <>
                        <Separator />
                        <div>
                          <h4 className='mb-2 font-semibold'>Bank Details</h4>
                          <div className='grid grid-cols-2 gap-2 text-sm'>
                            <div>
                              <span className='text-muted-foreground'>Bank Name:</span> {newInvoice.bankName}
                            </div>
                            <div>
                              <span className='text-muted-foreground'>Account Name:</span> {newInvoice.accountName}
                            </div>
                            <div>
                              <span className='text-muted-foreground'>Account Number:</span> {newInvoice.accountNumber}
                            </div>
                            <div>
                              <span className='text-muted-foreground'>SWIFT Code:</span> {newInvoice.swiftCode}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Edit Mode
            <div className='space-y-6'>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setPreviewMode(true)}>
                  <Eye className='mr-2 h-4 w-4' />
                  Preview
                </Button>
                <Button variant='outline' onClick={handleSaveInvoice}>
                  <Save className='mr-2 h-4 w-4' />
                  Save Draft
                </Button>
                <Button onClick={handleSendNewInvoice}>
                  <Send className='mr-2 h-4 w-4' />
                  Send Invoice
                </Button>
              </div>

              <div className='grid gap-6 lg:grid-cols-3'>
                {/* Main Content */}
                <div className='space-y-6 lg:col-span-2'>
                  {/* Invoice Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='grid gap-4 md:grid-cols-3'>
                        <div>
                          <Label>Invoice Number</Label>
                          <Input
                            value={newInvoice.invoiceNumber}
                            onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Invoice Date</Label>
                          <Input
                            type='date'
                            value={newInvoice.date}
                            onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Due Date</Label>
                          <Input
                            type='date'
                            value={newInvoice.dueDate}
                            onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Currency</Label>
                          <Select
                            value={newInvoice.currency}
                            onValueChange={(value) => setNewInvoice({ ...newInvoice, currency: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='USD'>USD</SelectItem>
                              <SelectItem value='EUR'>EUR</SelectItem>
                              <SelectItem value='JPY'>JPY</SelectItem>
                              <SelectItem value='GBP'>GBP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Select
                            value={newInvoice.status}
                            onValueChange={(value: 'draft' | 'sent' | 'paid') =>
                              setNewInvoice({ ...newInvoice, status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='draft'>Draft</SelectItem>
                              <SelectItem value='sent'>Sent</SelectItem>
                              <SelectItem value='paid'>Paid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <div>
                          <Label>Customer Name</Label>
                          <Input
                            placeholder='John Smith'
                            value={newInvoice.customerName}
                            onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type='email'
                            placeholder='john@example.com'
                            value={newInvoice.customerEmail}
                            onChange={(e) => setNewInvoice({ ...newInvoice, customerEmail: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            placeholder='+1 234 567 8900'
                            value={newInvoice.customerPhone}
                            onChange={(e) => setNewInvoice({ ...newInvoice, customerPhone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Input
                            placeholder='123 Main St'
                            value={newInvoice.customerAddress}
                            onChange={(e) => setNewInvoice({ ...newInvoice, customerAddress: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>City</Label>
                          <Input
                            placeholder='New York'
                            value={newInvoice.customerCity}
                            onChange={(e) => setNewInvoice({ ...newInvoice, customerCity: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Country</Label>
                          <Input
                            placeholder='USA'
                            value={newInvoice.customerCountry}
                            onChange={(e) => setNewInvoice({ ...newInvoice, customerCountry: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Invoice Items */}
                  <Card>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <CardTitle>Invoice Items</CardTitle>
                        <Button size='sm' onClick={addItem}>
                          <Plus className='mr-1 h-4 w-4' />
                          Add Item
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className='w-24'>Qty</TableHead>
                            <TableHead className='w-32'>Unit Price</TableHead>
                            <TableHead className='w-32'>Total</TableHead>
                            <TableHead className='w-10'></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {newInvoice.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Input
                                  placeholder='Item description'
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type='number'
                                  min='1'
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type='number'
                                  min='0'
                                  step='0.01'
                                  value={item.unitPrice}
                                  onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                                />
                              </TableCell>
                              <TableCell>
                                <Input value={item.total.toFixed(2)} disabled />
                              </TableCell>
                              <TableCell>
                                <Button size='sm' variant='ghost' onClick={() => removeItem(item.id)}>
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Totals */}
                      <div className='mt-6 space-y-2'>
                        <div className='flex justify-end'>
                          <div className='w-64 space-y-2'>
                            <div className='flex justify-between'>
                              <Label>Subtotal</Label>
                              <span className='font-medium'>
                                {newInvoice.currency} {newInvoice.subtotal.toFixed(2)}
                              </span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <Label>Tax</Label>
                              <Input
                                type='number'
                                min='0'
                                step='0.01'
                                className='w-24'
                                value={newInvoice.tax}
                                onChange={(e) => {
                                  const tax = Number(e.target.value)
                                  const total = newInvoice.subtotal + tax + newInvoice.shipping - newInvoice.discount
                                  setNewInvoice({ ...newInvoice, tax, total })
                                }}
                              />
                            </div>
                            <div className='flex items-center justify-between'>
                              <Label>Shipping</Label>
                              <Input
                                type='number'
                                min='0'
                                step='0.01'
                                className='w-24'
                                value={newInvoice.shipping}
                                onChange={(e) => {
                                  const shipping = Number(e.target.value)
                                  const total = newInvoice.subtotal + newInvoice.tax + shipping - newInvoice.discount
                                  setNewInvoice({ ...newInvoice, shipping, total })
                                }}
                              />
                            </div>
                            <div className='flex items-center justify-between'>
                              <Label>Discount</Label>
                              <Input
                                type='number'
                                min='0'
                                step='0.01'
                                className='w-24'
                                value={newInvoice.discount}
                                onChange={(e) => {
                                  const discount = Number(e.target.value)
                                  const total = newInvoice.subtotal + newInvoice.tax + newInvoice.shipping - discount
                                  setNewInvoice({ ...newInvoice, discount, total })
                                }}
                              />
                            </div>
                            <Separator />
                            <div className='flex justify-between text-lg font-bold'>
                              <span>Total</span>
                              <span>
                                {newInvoice.currency} {newInvoice.total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div>
                        <Label>Payment Terms</Label>
                        <Textarea
                          placeholder='Payment due within 7 days...'
                          value={newInvoice.paymentTerms}
                          onChange={(e) => setNewInvoice({ ...newInvoice, paymentTerms: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          placeholder='Additional notes or instructions...'
                          value={newInvoice.notes}
                          onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className='space-y-6'>
                  {/* Company Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Details</CardTitle>
                      <CardDescription>Your business information</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div>
                        <Label>Company Name</Label>
                        <Input
                          value={newInvoice.companyName}
                          onChange={(e) => setNewInvoice({ ...newInvoice, companyName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={newInvoice.companyEmail}
                          onChange={(e) => setNewInvoice({ ...newInvoice, companyEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={newInvoice.companyPhone}
                          onChange={(e) => setNewInvoice({ ...newInvoice, companyPhone: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bank Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Bank Details</CardTitle>
                      <CardDescription>Payment information</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div>
                        <Label>Bank Name</Label>
                        <Input
                          value={newInvoice.bankName}
                          onChange={(e) => setNewInvoice({ ...newInvoice, bankName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Account Name</Label>
                        <Input
                          value={newInvoice.accountName}
                          onChange={(e) => setNewInvoice({ ...newInvoice, accountName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Account Number</Label>
                        <Input
                          value={newInvoice.accountNumber}
                          onChange={(e) => setNewInvoice({ ...newInvoice, accountNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>SWIFT Code</Label>
                        <Input
                          value={newInvoice.swiftCode}
                          onChange={(e) => setNewInvoice({ ...newInvoice, swiftCode: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                      <Button className='w-full' variant='outline' onClick={() => toast.success('PDF downloading...')}>
                        <Download className='mr-2 h-4 w-4' />
                        Download PDF
                      </Button>
                      <Button className='w-full' variant='outline' onClick={() => window.print()}>
                        <Printer className='mr-2 h-4 w-4' />
                        Print Invoice
                      </Button>
                      <Button
                        className='w-full'
                        variant='outline'
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/invoices/new`)
                          toast.success('Link copied')
                        }}
                      >
                        <Link2 className='mr-2 h-4 w-4' />
                        Copy Link
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
