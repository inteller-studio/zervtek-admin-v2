'use client'

import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/features/dashboard/components/stats-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AnimatedTabs, AnimatedTabsContent, type TabItem } from '@/components/ui/animated-tabs'
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
  MdDescription,
  MdAdd,
  MdVisibility,
  MdDownload,
  MdSend,
  MdMoreHoriz,
  MdFilterList,
  MdCalendarToday,
  MdAttachMoney,
  MdContentCopy,
  MdDelete,
  MdSave,
  MdArrowBack,
  MdPrint,
  MdLink,
  MdEdit,
  MdClose,
  MdSearch,
  MdError,
  MdAccessTime,
  MdCheckCircle,
  MdCancel,
  MdDirectionsCar,
  MdPeople,
} from 'react-icons/md'
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

interface InvoiceVehicle {
  id: string
  stockNumber: string
  year: number
  make: string
  model: string
  price: number
  serviceFee: number
}

interface SharedInvoice {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerCountry: string
  vehicles: InvoiceVehicle[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
  notes: string
  createdAt: string
  updatedAt: string
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

// Mock shared invoices data
const mockSharedInvoices: SharedInvoice[] = [
  {
    id: 'shared-1',
    invoiceNumber: 'SINV-2024-0001',
    date: '2024-01-25',
    dueDate: '2024-02-01',
    status: 'paid',
    customerName: 'Tokyo Motors Import',
    customerEmail: 'orders@tokyomotors.com',
    customerPhone: '+81 3-5555-1234',
    customerAddress: '1-2-3 Shibuya',
    customerCity: 'Tokyo',
    customerCountry: 'Japan',
    vehicles: [
      { id: 'v1', stockNumber: 'STK-00123', year: 2023, make: 'Toyota', model: 'Supra RZ', price: 5500000, serviceFee: 275000 },
      { id: 'v2', stockNumber: 'STK-00124', year: 2022, make: 'Nissan', model: 'GT-R Nismo', price: 8200000, serviceFee: 410000 },
      { id: 'v3', stockNumber: 'STK-00125', year: 2023, make: 'Honda', model: 'NSX Type S', price: 12000000, serviceFee: 600000 },
    ],
    subtotal: 26985000,
    tax: 2698500,
    shipping: 450000,
    discount: 500000,
    total: 29633500,
    currency: 'JPY',
    notes: 'Bulk order - 3 premium sports cars for showroom',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-30T14:00:00Z',
  },
  {
    id: 'shared-2',
    invoiceNumber: 'SINV-2024-0002',
    date: '2024-02-05',
    dueDate: '2024-02-12',
    status: 'sent',
    customerName: 'European Auto Gallery',
    customerEmail: 'purchasing@eurogallery.de',
    customerPhone: '+49 30-1234-5678',
    customerAddress: '123 Autobahn Street',
    customerCity: 'Berlin',
    customerCountry: 'Germany',
    vehicles: [
      { id: 'v4', stockNumber: 'STK-00201', year: 2024, make: 'Lexus', model: 'LC 500', price: 9800000, serviceFee: 490000 },
      { id: 'v5', stockNumber: 'STK-00202', year: 2023, make: 'Toyota', model: 'Land Cruiser 300', price: 7500000, serviceFee: 375000 },
    ],
    subtotal: 18165000,
    tax: 1816500,
    shipping: 850000,
    discount: 0,
    total: 20831500,
    currency: 'JPY',
    notes: 'Export to Germany - includes shipping to Hamburg port',
    createdAt: '2024-02-05T09:30:00Z',
    updatedAt: '2024-02-05T09:30:00Z',
  },
  {
    id: 'shared-3',
    invoiceNumber: 'SINV-2024-0003',
    date: '2024-02-10',
    dueDate: '2024-02-17',
    status: 'draft',
    customerName: 'Premium Motors Dubai',
    customerEmail: 'fleet@premiummotors.ae',
    customerPhone: '+971 4-123-4567',
    customerAddress: 'Sheikh Zayed Road',
    customerCity: 'Dubai',
    customerCountry: 'UAE',
    vehicles: [
      { id: 'v6', stockNumber: 'STK-00301', year: 2024, make: 'Mercedes-Benz', model: 'G63 AMG', price: 22000000, serviceFee: 1100000 },
      { id: 'v7', stockNumber: 'STK-00302', year: 2024, make: 'Porsche', model: 'Cayenne Turbo GT', price: 18500000, serviceFee: 925000 },
      { id: 'v8', stockNumber: 'STK-00303', year: 2024, make: 'BMW', model: 'X7 M60i', price: 15800000, serviceFee: 790000 },
      { id: 'v9', stockNumber: 'STK-00304', year: 2023, make: 'Range Rover', model: 'Sport SVR', price: 16500000, serviceFee: 825000 },
    ],
    subtotal: 76440000,
    tax: 0,
    shipping: 1200000,
    discount: 2000000,
    total: 75640000,
    currency: 'JPY',
    notes: 'Luxury fleet order - Tax exempt for export',
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-02-10T11:00:00Z',
  },
]

// Sample available vehicles for selection
const availableVehiclesForInvoice = [
  { id: 'av1', stockNumber: 'STK-00401', year: 2024, make: 'Toyota', model: 'Supra RZ', price: 5500000 },
  { id: 'av2', stockNumber: 'STK-00402', year: 2023, make: 'Nissan', model: 'GT-R Premium', price: 7800000 },
  { id: 'av3', stockNumber: 'STK-00403', year: 2024, make: 'Honda', model: 'Civic Type R', price: 4200000 },
  { id: 'av4', stockNumber: 'STK-00404', year: 2023, make: 'Mazda', model: 'MX-5 RF', price: 3800000 },
  { id: 'av5', stockNumber: 'STK-00405', year: 2024, make: 'Subaru', model: 'WRX STI', price: 4500000 },
  { id: 'av6', stockNumber: 'STK-00406', year: 2023, make: 'Lexus', model: 'IS 500 F Sport', price: 6200000 },
  { id: 'av7', stockNumber: 'STK-00407', year: 2024, make: 'Toyota', model: 'GR86', price: 3200000 },
  { id: 'av8', stockNumber: 'STK-00408', year: 2023, make: 'Nissan', model: 'Z Performance', price: 5800000 },
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
  const [mainTab, setMainTab] = useState<'single' | 'shared'>('single')
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [sharedInvoices, setSharedInvoices] = useState<SharedInvoice[]>(mockSharedInvoices)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedSharedInvoice, setSelectedSharedInvoice] = useState<SharedInvoice | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewSharedDialogOpen, setViewSharedDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createSharedDialogOpen, setCreateSharedDialogOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [newInvoice, setNewInvoice] = useState(emptyInvoice)
  const [selectedVehicles, setSelectedVehicles] = useState<typeof availableVehiclesForInvoice>([])
  const [sharedInvoiceForm, setSharedInvoiceForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    customerCountry: '',
    notes: '',
    shipping: 0,
    discount: 0,
  })

  // Main tabs configuration
  const mainTabs: TabItem[] = [
    { id: 'single', label: 'Single Invoices', icon: MdDescription },
    { id: 'shared', label: 'Shared Invoices', icon: MdPeople },
  ]

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

  // Stats for single invoices
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)
  const pendingAmount = invoices
    .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0)
  const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length
  const draftCount = invoices.filter((inv) => inv.status === 'draft').length

  // Filter shared invoices
  const filteredSharedInvoices = sharedInvoices.filter((invoice) => {
    const matchesSearch =
      searchTerm === '' ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats for shared invoices
  const sharedTotalRevenue = sharedInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)
  const sharedPendingAmount = sharedInvoices
    .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0)
  const sharedTotalVehicles = sharedInvoices.reduce((sum, inv) => sum + inv.vehicles.length, 0)
  const sharedDraftCount = sharedInvoices.filter((inv) => inv.status === 'draft').length

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

  // Shared invoice handlers
  const handleViewSharedInvoice = (invoice: SharedInvoice) => {
    setSelectedSharedInvoice(invoice)
    setViewSharedDialogOpen(true)
  }

  const handleToggleVehicle = (vehicle: typeof availableVehiclesForInvoice[0]) => {
    const exists = selectedVehicles.find((v) => v.id === vehicle.id)
    if (exists) {
      setSelectedVehicles(selectedVehicles.filter((v) => v.id !== vehicle.id))
    } else {
      setSelectedVehicles([...selectedVehicles, vehicle])
    }
  }

  const calculateSharedInvoiceTotal = () => {
    const serviceFeeRate = 0.05 // 5% service fee
    const vehicleTotal = selectedVehicles.reduce((sum, v) => sum + v.price, 0)
    const serviceFees = selectedVehicles.reduce((sum, v) => sum + v.price * serviceFeeRate, 0)
    const subtotal = vehicleTotal + serviceFees
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax + sharedInvoiceForm.shipping - sharedInvoiceForm.discount
    return { vehicleTotal, serviceFees, subtotal, tax, total }
  }

  const handleCreateSharedInvoice = (sendNow: boolean = false) => {
    if (selectedVehicles.length === 0) {
      toast.error('Please select at least one vehicle')
      return
    }
    if (!sharedInvoiceForm.customerName || !sharedInvoiceForm.customerEmail) {
      toast.error('Please enter customer name and email')
      return
    }

    const totals = calculateSharedInvoiceTotal()
    const serviceFeeRate = 0.05

    const newSharedInvoice: SharedInvoice = {
      id: `shared-${Date.now()}`,
      invoiceNumber: `SINV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: sendNow ? 'sent' : 'draft',
      customerName: sharedInvoiceForm.customerName,
      customerEmail: sharedInvoiceForm.customerEmail,
      customerPhone: sharedInvoiceForm.customerPhone,
      customerAddress: sharedInvoiceForm.customerAddress,
      customerCity: sharedInvoiceForm.customerCity,
      customerCountry: sharedInvoiceForm.customerCountry,
      vehicles: selectedVehicles.map((v) => ({
        ...v,
        serviceFee: v.price * serviceFeeRate,
      })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: sharedInvoiceForm.shipping,
      discount: sharedInvoiceForm.discount,
      total: totals.total,
      currency: 'JPY',
      notes: sharedInvoiceForm.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setSharedInvoices([newSharedInvoice, ...sharedInvoices])
    setCreateSharedDialogOpen(false)
    setSelectedVehicles([])
    setSharedInvoiceForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      customerCity: '',
      customerCountry: '',
      notes: '',
      shipping: 0,
      discount: 0,
    })
    toast.success(sendNow ? 'Shared invoice sent to customer' : 'Shared invoice saved as draft')
  }

  const handleDeleteSharedInvoice = (invoiceId: string) => {
    setSharedInvoices(sharedInvoices.filter((inv) => inv.id !== invoiceId))
    toast.success('Shared invoice deleted')
  }

  const handleSendSharedInvoice = (invoice: SharedInvoice) => {
    setSharedInvoices(
      sharedInvoices.map((inv) => (inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv))
    )
    toast.success(`Invoice sent to ${invoice.customerEmail}`)
  }

  const handleMarkSharedPaid = (invoice: SharedInvoice) => {
    setSharedInvoices(
      sharedInvoices.map((inv) => (inv.id === invoice.id ? { ...inv, status: 'paid' as const } : inv))
    )
    toast.success('Invoice marked as paid')
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ConfigDrawer />
        </div>
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Page Header */}
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Invoices</h1>
            <p className='text-muted-foreground'>Manage and track all your invoices</p>
          </div>
          <Button onClick={() => mainTab === 'single' ? setCreateDialogOpen(true) : setCreateSharedDialogOpen(true)}>
            <MdAdd className='mr-2 h-4 w-4' />
            {mainTab === 'single' ? 'Create Invoice' : 'Create Shared Invoice'}
          </Button>
        </div>

        {/* Main Tabs */}
        <AnimatedTabs
          tabs={mainTabs}
          value={mainTab}
          onValueChange={(v) => setMainTab(v as 'single' | 'shared')}
          variant='compact'
        >
          {/* Single Invoices Tab */}
          <AnimatedTabsContent value='single' className='mt-4 space-y-4'>
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
                  <MdSearch className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
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
                      <MdFilterList className='h-4 w-4' />
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
                            <MdMoreHoriz className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                            <MdVisibility className='mr-2 h-4 w-4' />
                            View
                          </DropdownMenuItem>
                          {(invoice.status === 'draft' || invoice.status === 'sent') && (
                            <DropdownMenuItem onClick={() => handleSendInvoice(invoice)}>
                              <MdSend className='mr-2 h-4 w-4' />
                              {invoice.status === 'draft' ? 'Send' : 'Resend'}
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'sent' && (
                            <DropdownMenuItem onClick={() => handleMarkPaid(invoice)}>
                              <MdCheckCircle className='mr-2 h-4 w-4' />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                            <MdDownload className='mr-2 h-4 w-4' />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateInvoice(invoice)}>
                            <MdContentCopy className='mr-2 h-4 w-4' />
                            Duplicate
                          </DropdownMenuItem>
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id)} className='text-destructive'>
                              <MdDelete className='mr-2 h-4 w-4' />
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
          </AnimatedTabsContent>

          {/* Shared Invoices Tab */}
          <AnimatedTabsContent value='shared' className='mt-4 space-y-4'>
            {/* Stats Cards */}
            <div className='grid gap-4 md:grid-cols-4'>
              <StatsCard
                title='Total Revenue'
                value={sharedTotalRevenue}
                change={25}
                prefix='¥'
                description='from paid shared invoices'
              />
              <StatsCard
                title='Pending Amount'
                value={sharedPendingAmount}
                change={-8}
                prefix='¥'
                description='awaiting payment'
              />
              <StatsCard
                title='Total Vehicles'
                value={sharedTotalVehicles}
                change={15}
                description='across all invoices'
              />
              <StatsCard
                title='Drafts'
                value={sharedDraftCount}
                change={2}
                description='unsent invoices'
              />
            </div>

            {/* Shared Invoices Card */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2'>
                      <MdDirectionsCar className='h-5 w-5' />
                      Shared Invoices
                    </CardTitle>
                    <CardDescription>Invoices with multiple vehicles per customer</CardDescription>
                  </div>
                  <div className='flex gap-2'>
                    <div className='relative'>
                      <MdSearch className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
                      <Input
                        placeholder='Search shared invoices...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-[250px] pl-8'
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='icon'>
                          <MdFilterList className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('sent')}>Sent</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('paid')}>Paid</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('overdue')}>Overdue</DropdownMenuItem>
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
                      <TableHead>Vehicles</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSharedInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className='font-medium'>{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className='font-medium'>{invoice.customerName}</div>
                            <div className='text-muted-foreground text-sm'>{invoice.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Badge variant='secondary' className='flex items-center gap-1'>
                              <MdDirectionsCar className='h-3 w-3' />
                              {invoice.vehicles.length} vehicles
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(invoice.date), 'MMM dd, yyyy')}</TableCell>
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
                                <MdMoreHoriz className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => handleViewSharedInvoice(invoice)}>
                                <MdVisibility className='mr-2 h-4 w-4' />
                                View Details
                              </DropdownMenuItem>
                              {invoice.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleSendSharedInvoice(invoice)}>
                                  <MdSend className='mr-2 h-4 w-4' />
                                  Send
                                </DropdownMenuItem>
                              )}
                              {invoice.status === 'sent' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleSendSharedInvoice(invoice)}>
                                    <MdSend className='mr-2 h-4 w-4' />
                                    Resend
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMarkSharedPaid(invoice)}>
                                    <MdCheckCircle className='mr-2 h-4 w-4' />
                                    Mark as Paid
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => toast.success(`Downloading ${invoice.invoiceNumber}.pdf`)}>
                                <MdDownload className='mr-2 h-4 w-4' />
                                Download PDF
                              </DropdownMenuItem>
                              {invoice.status === 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteSharedInvoice(invoice.id)}
                                  className='text-destructive'
                                >
                                  <MdDelete className='mr-2 h-4 w-4' />
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
                {filteredSharedInvoices.length === 0 && (
                  <div className='py-8 text-center'>
                    <p className='text-muted-foreground'>No shared invoices found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedTabsContent>
        </AnimatedTabs>
      </Main>

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className='flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden sm:max-w-4xl'>
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
                        <MdSend className='mr-2 h-4 w-4' />
                        Send
                      </Button>
                    )}
                    <Button size='sm' variant='outline' onClick={() => handleDownloadPDF(selectedInvoice)}>
                      <MdDownload className='mr-2 h-4 w-4' />
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
                      <MdLink className='mr-2 h-4 w-4' />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className='flex-1 overflow-y-auto'>
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className='flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>
              {previewMode ? 'Invoice Preview' : 'Create New Invoice'}
            </DialogTitle>
            <DialogDescription>
              {previewMode ? 'Review your invoice before sending' : 'Fill in the details to create a new invoice'}
            </DialogDescription>
          </DialogHeader>

          <div className='flex-1 overflow-y-auto'>
          {previewMode ? (
            // Preview Mode
            <div className='space-y-6'>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setPreviewMode(false)}>
                  <MdArrowBack className='mr-2 h-4 w-4' />
                  Back to Edit
                </Button>
                <Button variant='outline' onClick={handleSaveInvoice}>
                  <MdSave className='mr-2 h-4 w-4' />
                  Save Draft
                </Button>
                <Button onClick={handleSendNewInvoice}>
                  <MdSend className='mr-2 h-4 w-4' />
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
                  <MdVisibility className='mr-2 h-4 w-4' />
                  Preview
                </Button>
                <Button variant='outline' onClick={handleSaveInvoice}>
                  <MdSave className='mr-2 h-4 w-4' />
                  Save Draft
                </Button>
                <Button onClick={handleSendNewInvoice}>
                  <MdSend className='mr-2 h-4 w-4' />
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
                          <MdAdd className='mr-1 h-4 w-4' />
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
                                <NumericInput
                                  min={1}
                                  value={item.quantity}
                                  onChange={(v) => updateItem(item.id, 'quantity', v)}
                                />
                              </TableCell>
                              <TableCell>
                                <NumericInput
                                  min={0}
                                  allowDecimals
                                  value={item.unitPrice}
                                  onChange={(v) => updateItem(item.id, 'unitPrice', v)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input value={item.total.toFixed(2)} disabled />
                              </TableCell>
                              <TableCell>
                                <Button size='sm' variant='ghost' onClick={() => removeItem(item.id)}>
                                  <MdDelete className='h-4 w-4' />
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
                              <NumericInput
                                min={0}
                                allowDecimals
                                className='w-24'
                                value={newInvoice.tax}
                                onChange={(tax) => {
                                  const total = newInvoice.subtotal + tax + newInvoice.shipping - newInvoice.discount
                                  setNewInvoice({ ...newInvoice, tax, total })
                                }}
                              />
                            </div>
                            <div className='flex items-center justify-between'>
                              <Label>Shipping</Label>
                              <NumericInput
                                min={0}
                                allowDecimals
                                className='w-24'
                                value={newInvoice.shipping}
                                onChange={(shipping) => {
                                  const total = newInvoice.subtotal + newInvoice.tax + shipping - newInvoice.discount
                                  setNewInvoice({ ...newInvoice, shipping, total })
                                }}
                              />
                            </div>
                            <div className='flex items-center justify-between'>
                              <Label>Discount</Label>
                              <NumericInput
                                min={0}
                                allowDecimals
                                className='w-24'
                                value={newInvoice.discount}
                                onChange={(discount) => {
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
                        <MdDownload className='mr-2 h-4 w-4' />
                        Download PDF
                      </Button>
                      <Button className='w-full' variant='outline' onClick={() => window.print()}>
                        <MdPrint className='mr-2 h-4 w-4' />
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
                        <MdLink className='mr-2 h-4 w-4' />
                        Copy Link
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Shared Invoice Dialog */}
      <Dialog open={viewSharedDialogOpen} onOpenChange={setViewSharedDialogOpen}>
        <DialogContent className='flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden sm:max-w-4xl'>
          {selectedSharedInvoice && (
            <>
              <DialogHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <DialogTitle className='flex items-center gap-2'>
                      <MdDirectionsCar className='h-5 w-5' />
                      {selectedSharedInvoice.invoiceNumber}
                    </DialogTitle>
                    {getStatusBadge(selectedSharedInvoice.status)}
                  </div>
                  <div className='flex gap-2'>
                    {selectedSharedInvoice.status === 'draft' && (
                      <Button size='sm' onClick={() => handleSendSharedInvoice(selectedSharedInvoice)}>
                        <MdSend className='mr-2 h-4 w-4' />
                        Send
                      </Button>
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => toast.success(`Downloading ${selectedSharedInvoice.invoiceNumber}.pdf`)}
                    >
                      <MdDownload className='mr-2 h-4 w-4' />
                      Download
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className='flex-1 overflow-y-auto'>
                <div className='space-y-6'>
                  {/* Header */}
                  <div className='flex justify-between'>
                    <div>
                      <h2 className='text-2xl font-bold'>Zervtek Ltd.</h2>
                      <p className='text-muted-foreground mt-1 text-sm'>
                        123 Auction Street
                        <br />
                        Tokyo, Japan
                        <br />
                        sales@zervtek.com
                        <br />
                        +81 3-1234-5678
                      </p>
                    </div>
                    <div className='text-right'>
                      <h3 className='text-xl font-bold'>SHARED INVOICE</h3>
                      <p className='mt-2 text-sm'>
                        <span className='font-medium'>Invoice #:</span> {selectedSharedInvoice.invoiceNumber}
                      </p>
                      <p className='text-sm'>
                        <span className='font-medium'>Date:</span>{' '}
                        {format(new Date(selectedSharedInvoice.date), 'MMM dd, yyyy')}
                      </p>
                      <p className='text-sm'>
                        <span className='font-medium'>Due Date:</span>{' '}
                        {format(new Date(selectedSharedInvoice.dueDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Bill To */}
                  <div>
                    <h4 className='mb-2 font-semibold'>Bill To:</h4>
                    <p className='text-sm'>
                      {selectedSharedInvoice.customerName}
                      <br />
                      {selectedSharedInvoice.customerAddress}
                      <br />
                      {selectedSharedInvoice.customerCity}, {selectedSharedInvoice.customerCountry}
                      <br />
                      {selectedSharedInvoice.customerEmail}
                      <br />
                      {selectedSharedInvoice.customerPhone}
                    </p>
                  </div>

                  {/* Vehicles Table */}
                  <div>
                    <h4 className='mb-2 font-semibold flex items-center gap-2'>
                      <MdDirectionsCar className='h-4 w-4' />
                      Vehicles ({selectedSharedInvoice.vehicles.length})
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stock #</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead className='text-right'>Price</TableHead>
                          <TableHead className='text-right'>Service Fee</TableHead>
                          <TableHead className='text-right'>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSharedInvoice.vehicles.map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell className='font-medium'>{vehicle.stockNumber}</TableCell>
                            <TableCell>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </TableCell>
                            <TableCell className='text-right'>
                              {selectedSharedInvoice.currency} {vehicle.price.toLocaleString()}
                            </TableCell>
                            <TableCell className='text-right'>
                              {selectedSharedInvoice.currency} {vehicle.serviceFee.toLocaleString()}
                            </TableCell>
                            <TableCell className='text-right'>
                              {selectedSharedInvoice.currency}{' '}
                              {(vehicle.price + vehicle.serviceFee).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Totals */}
                  <div className='flex justify-end'>
                    <div className='w-64 space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>Subtotal:</span>
                        <span>
                          {selectedSharedInvoice.currency} {selectedSharedInvoice.subtotal.toLocaleString()}
                        </span>
                      </div>
                      {selectedSharedInvoice.tax > 0 && (
                        <div className='flex justify-between text-sm'>
                          <span>Tax:</span>
                          <span>
                            {selectedSharedInvoice.currency} {selectedSharedInvoice.tax.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedSharedInvoice.shipping > 0 && (
                        <div className='flex justify-between text-sm'>
                          <span>Shipping:</span>
                          <span>
                            {selectedSharedInvoice.currency} {selectedSharedInvoice.shipping.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedSharedInvoice.discount > 0 && (
                        <div className='flex justify-between text-sm'>
                          <span>Discount:</span>
                          <span>
                            -{selectedSharedInvoice.currency} {selectedSharedInvoice.discount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className='flex justify-between text-lg font-bold'>
                        <span>Total:</span>
                        <span>
                          {selectedSharedInvoice.currency} {selectedSharedInvoice.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedSharedInvoice.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className='mb-1 font-semibold'>Notes</h4>
                        <p className='text-muted-foreground text-sm'>{selectedSharedInvoice.notes}</p>
                      </div>
                    </>
                  )}

                  {/* Footer */}
                  <Separator />
                  <div className='text-muted-foreground text-center text-sm'>
                    <p>Thank you for your business!</p>
                    <p className='mt-2'>
                      Created on {format(new Date(selectedSharedInvoice.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Shared Invoice Dialog */}
      <Dialog open={createSharedDialogOpen} onOpenChange={setCreateSharedDialogOpen}>
        <DialogContent className='flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MdDirectionsCar className='h-5 w-5' />
              Create Shared Invoice
            </DialogTitle>
            <DialogDescription>Create an invoice with multiple vehicles for a single customer</DialogDescription>
          </DialogHeader>

          <div className='flex-1 overflow-y-auto'>
            <div className='space-y-6'>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => handleCreateSharedInvoice(false)}>
                  <MdSave className='mr-2 h-4 w-4' />
                  Save Draft
                </Button>
                <Button onClick={() => handleCreateSharedInvoice(true)}>
                  <MdSend className='mr-2 h-4 w-4' />
                  Send Invoice
                </Button>
              </div>

              <div className='grid gap-6 lg:grid-cols-3'>
                {/* Main Content */}
                <div className='space-y-6 lg:col-span-2'>
                  {/* Customer Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <div>
                          <Label>Customer Name *</Label>
                          <Input
                            placeholder='Company or Customer Name'
                            value={sharedInvoiceForm.customerName}
                            onChange={(e) =>
                              setSharedInvoiceForm({ ...sharedInvoiceForm, customerName: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type='email'
                            placeholder='customer@example.com'
                            value={sharedInvoiceForm.customerEmail}
                            onChange={(e) =>
                              setSharedInvoiceForm({ ...sharedInvoiceForm, customerEmail: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            placeholder='+81 3-1234-5678'
                            value={sharedInvoiceForm.customerPhone}
                            onChange={(e) =>
                              setSharedInvoiceForm({ ...sharedInvoiceForm, customerPhone: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Input
                            placeholder='Street Address'
                            value={sharedInvoiceForm.customerAddress}
                            onChange={(e) =>
                              setSharedInvoiceForm({ ...sharedInvoiceForm, customerAddress: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>City</Label>
                          <Input
                            placeholder='Tokyo'
                            value={sharedInvoiceForm.customerCity}
                            onChange={(e) =>
                              setSharedInvoiceForm({ ...sharedInvoiceForm, customerCity: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Country</Label>
                          <Input
                            placeholder='Japan'
                            value={sharedInvoiceForm.customerCountry}
                            onChange={(e) =>
                              setSharedInvoiceForm({ ...sharedInvoiceForm, customerCountry: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vehicle Selection */}
                  <Card>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <div>
                          <CardTitle className='flex items-center gap-2'>
                            <MdDirectionsCar className='h-5 w-5' />
                            Select Vehicles
                          </CardTitle>
                          <CardDescription>Choose vehicles to include in this invoice</CardDescription>
                        </div>
                        <Badge variant='secondary'>
                          {selectedVehicles.length} selected
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='grid gap-3 md:grid-cols-2'>
                        {availableVehiclesForInvoice.map((vehicle) => {
                          const isSelected = selectedVehicles.some((v) => v.id === vehicle.id)
                          return (
                            <div
                              key={vehicle.id}
                              onClick={() => handleToggleVehicle(vehicle)}
                              className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                                  : 'hover:border-primary/50 hover:bg-muted/50'
                              }`}
                            >
                              <div className='flex items-start justify-between'>
                                <div>
                                  <p className='font-medium'>
                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                  </p>
                                  <p className='text-muted-foreground text-sm'>{vehicle.stockNumber}</p>
                                </div>
                                <div className='text-right'>
                                  <p className='font-semibold'>¥{vehicle.price.toLocaleString()}</p>
                                  <p className='text-muted-foreground text-xs'>
                                    +¥{(vehicle.price * 0.05).toLocaleString()} fee
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <div className='mt-2'>
                                  <Badge variant='default' className='text-xs'>
                                    <MdCheckCircle className='mr-1 h-3 w-3' />
                                    Selected
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )
                        })}
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
                        <Label>Notes</Label>
                        <Textarea
                          placeholder='Additional notes or instructions...'
                          value={sharedInvoiceForm.notes}
                          onChange={(e) => setSharedInvoiceForm({ ...sharedInvoiceForm, notes: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar - Invoice Summary */}
                <div className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Invoice Summary</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {/* Selected Vehicles Summary */}
                      {selectedVehicles.length > 0 ? (
                        <div className='space-y-2'>
                          {selectedVehicles.map((vehicle) => (
                            <div
                              key={vehicle.id}
                              className='flex items-center justify-between rounded-md border p-2 text-sm'
                            >
                              <div>
                                <p className='font-medium'>
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </p>
                                <p className='text-muted-foreground text-xs'>{vehicle.stockNumber}</p>
                              </div>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleToggleVehicle(vehicle)}
                              >
                                <MdClose className='h-4 w-4' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className='text-muted-foreground text-center text-sm py-4'>
                          No vehicles selected
                        </p>
                      )}

                      <Separator />

                      {/* Totals */}
                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span>Vehicles Total:</span>
                          <span>¥{calculateSharedInvoiceTotal().vehicleTotal.toLocaleString()}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span>Service Fees (5%):</span>
                          <span>¥{calculateSharedInvoiceTotal().serviceFees.toLocaleString()}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span>Tax (10%):</span>
                          <span>¥{calculateSharedInvoiceTotal().tax.toLocaleString()}</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span>Shipping:</span>
                          <NumericInput
                            min={0}
                            className='w-28'
                            value={sharedInvoiceForm.shipping}
                            onChange={(shipping) =>
                              setSharedInvoiceForm({ ...sharedInvoiceForm, shipping })
                            }
                          />
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span>Discount:</span>
                          <NumericInput
                            min={0}
                            className='w-28'
                            value={sharedInvoiceForm.discount}
                            onChange={(discount) =>
                              setSharedInvoiceForm({ ...sharedInvoiceForm, discount })
                            }
                          />
                        </div>
                        <Separator />
                        <div className='flex justify-between text-lg font-bold'>
                          <span>Total:</span>
                          <span>¥{calculateSharedInvoiceTotal().total.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
