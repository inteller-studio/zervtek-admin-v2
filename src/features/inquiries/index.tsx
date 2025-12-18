'use client'

import { useState, useMemo } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  HelpCircle,
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
  Mail,
  Phone,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  FileQuestion,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  inquiries as initialInquiries,
  type Inquiry,
  type InquiryStatus,
  type InquiryType,
  inquiryTypeLabels,
  inquiryStatusLabels,
  getInquiryStats,
} from './data/inquiries'

type SortField = 'inquiryNumber' | 'customerName' | 'vehicleName' | 'createdAt' | 'status' | 'type'
type SortOrder = 'asc' | 'desc'

const salesStaff = [
  { id: 'staff-001', name: 'Mike Johnson' },
  { id: 'staff-002', name: 'Sarah Williams' },
  { id: 'staff-003', name: 'Tom Anderson' },
  { id: 'staff-004', name: 'Jessica Chen' },
]

const statusStyles: Record<InquiryStatus, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  in_progress: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  responded: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  closed: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
}

const typeStyles: Record<InquiryType, string> = {
  price: 'bg-green-500/10 text-green-600 border-green-500/20',
  availability: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  shipping: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  inspection: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  general: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
}

// FAQ Types and Mock Data
type FAQCategory = 'general' | 'bidding' | 'shipping' | 'payment' | 'inspection'

interface FAQ {
  id: string
  question: string
  answer: string
  category: FAQCategory
  order: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const faqCategories: Record<FAQCategory, string> = {
  general: 'General',
  bidding: 'Bidding & Auctions',
  shipping: 'Shipping & Delivery',
  payment: 'Payment & Fees',
  inspection: 'Inspection & Reports',
}

const initialFaqs: FAQ[] = [
  { id: '1', question: 'How do I place a bid on a vehicle?', answer: 'To place a bid, browse our auction listings and click on any vehicle you\'re interested in. Review the vehicle details, then click the "Place Bid" button. Enter your maximum bid amount and confirm. Our system will automatically bid on your behalf up to your maximum.', category: 'bidding', order: 1, isPublished: true, createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-01-15') },
  { id: '2', question: 'What payment methods do you accept?', answer: 'We accept bank wire transfers for all purchases. For deposits, we also accept credit cards. Payment must be received within 7 business days of winning an auction.', category: 'payment', order: 1, isPublished: true, createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-01-20') },
  { id: '3', question: 'How long does shipping take?', answer: 'Shipping times vary by destination. Typically, vehicles shipped to the US West Coast take 2-3 weeks, East Coast 4-5 weeks. European destinations usually take 6-8 weeks. We\'ll provide tracking information once your vehicle is loaded.', category: 'shipping', order: 1, isPublished: true, createdAt: new Date('2024-01-16'), updatedAt: new Date('2024-01-16') },
  { id: '4', question: 'Can I request a vehicle inspection before bidding?', answer: 'Yes! We offer pre-purchase inspection services. Our team can physically inspect any vehicle at auction and provide detailed photos, video, and a condition report. This service is available for a fee.', category: 'inspection', order: 1, isPublished: true, createdAt: new Date('2024-01-17'), updatedAt: new Date('2024-01-17') },
  { id: '5', question: 'What is included in the auction sheet translation?', answer: 'Our auction sheet translation includes a complete translation of the Japanese auction grade, interior/exterior ratings, accident history, repair records, mileage verification, and any inspector notes or comments.', category: 'inspection', order: 2, isPublished: true, createdAt: new Date('2024-01-18'), updatedAt: new Date('2024-01-18') },
  { id: '6', question: 'What fees are involved in purchasing a vehicle?', answer: 'Fees include: auction fee (varies by auction house), our commission (negotiable based on purchase price), shipping costs, port handling fees, and import duties/taxes at your destination. We provide a full cost breakdown before bidding.', category: 'payment', order: 2, isPublished: true, createdAt: new Date('2024-01-19'), updatedAt: new Date('2024-01-19') },
  { id: '7', question: 'How do I create an account?', answer: 'Click the "Sign Up" button on our website. You\'ll need to provide your contact information, verify your email, and submit identification documents. Account approval typically takes 1-2 business days.', category: 'general', order: 1, isPublished: true, createdAt: new Date('2024-01-20'), updatedAt: new Date('2024-01-20') },
  { id: '8', question: 'What happens if I win an auction?', answer: 'When you win, you\'ll receive an email notification with payment instructions. After payment is received, we\'ll handle all export paperwork and arrange shipping. You\'ll receive regular updates throughout the process.', category: 'bidding', order: 2, isPublished: true, createdAt: new Date('2024-01-21'), updatedAt: new Date('2024-01-21') },
]

export function Inquiries() {
  const [mainTab, setMainTab] = useState<'inquiries' | 'faq'>('inquiries')
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [activeTab, setActiveTab] = useState<'all' | InquiryStatus>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // FAQ State
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs)
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('all')
  const [faqSearchTerm, setFaqSearchTerm] = useState('')
  const [faqDialogOpen, setFaqDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'general' as FAQCategory,
    isPublished: true,
  })

  const stats = useMemo(() => getInquiryStats(), [])

  const filteredInquiries = useMemo(() => {
    let result = [...inquiries]

    if (activeTab !== 'all') {
      result = result.filter(i => i.status === activeTab)
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(i =>
        i.inquiryNumber.toLowerCase().includes(search) ||
        i.customerName.toLowerCase().includes(search) ||
        i.customerEmail.toLowerCase().includes(search) ||
        i.vehicleName.toLowerCase().includes(search) ||
        i.subject.toLowerCase().includes(search)
      )
    }

    if (typeFilter !== 'all') {
      result = result.filter(i => i.type === typeFilter)
    }

    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        result = result.filter(i => !i.assignedTo)
      } else {
        result = result.filter(i => i.assignedTo === assigneeFilter)
      }
    }

    result.sort((a, b) => {
      let aVal: string | number | Date
      let bVal: string | number | Date

      switch (sortField) {
        case 'inquiryNumber':
          aVal = a.inquiryNumber
          bVal = b.inquiryNumber
          break
        case 'customerName':
          aVal = a.customerName.toLowerCase()
          bVal = b.customerName.toLowerCase()
          break
        case 'vehicleName':
          aVal = a.vehicleName.toLowerCase()
          bVal = b.vehicleName.toLowerCase()
          break
        case 'createdAt':
          aVal = a.createdAt
          bVal = b.createdAt
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        case 'type':
          aVal = a.type
          bVal = b.type
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [inquiries, activeTab, searchTerm, typeFilter, assigneeFilter, sortField, sortOrder])

  // FAQ filtering
  const filteredFaqs = useMemo(() => {
    let result = [...faqs]

    if (faqCategoryFilter !== 'all') {
      result = result.filter(f => f.category === faqCategoryFilter)
    }

    if (faqSearchTerm) {
      const search = faqSearchTerm.toLowerCase()
      result = result.filter(f =>
        f.question.toLowerCase().includes(search) ||
        f.answer.toLowerCase().includes(search)
      )
    }

    return result.sort((a, b) => a.order - b.order)
  }, [faqs, faqCategoryFilter, faqSearchTerm])

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage)
  const paginatedInquiries = filteredInquiries.slice(
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // FAQ handlers
  const handleAddFaq = () => {
    setEditingFaq(null)
    setFaqForm({ question: '', answer: '', category: 'general', isPublished: true })
    setFaqDialogOpen(true)
  }

  const handleEditFaq = (faq: FAQ) => {
    setEditingFaq(faq)
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isPublished: faq.isPublished,
    })
    setFaqDialogOpen(true)
  }

  const handleSaveFaq = () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (editingFaq) {
      setFaqs(faqs.map(f =>
        f.id === editingFaq.id
          ? { ...f, ...faqForm, updatedAt: new Date() }
          : f
      ))
      toast.success('FAQ updated successfully')
    } else {
      const newFaq: FAQ = {
        id: String(Date.now()),
        ...faqForm,
        order: faqs.filter(f => f.category === faqForm.category).length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setFaqs([...faqs, newFaq])
      toast.success('FAQ added successfully')
    }
    setFaqDialogOpen(false)
  }

  const handleDeleteFaq = (faq: FAQ) => {
    setFaqs(faqs.filter(f => f.id !== faq.id))
    toast.success('FAQ deleted')
  }

  const handleTogglePublish = (faq: FAQ) => {
    setFaqs(faqs.map(f =>
      f.id === faq.id
        ? { ...f, isPublished: !f.isPublished, updatedAt: new Date() }
        : f
    ))
    toast.success(faq.isPublished ? 'FAQ unpublished' : 'FAQ published')
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
            <h1 className='text-2xl font-bold tracking-tight'>Inquiries & FAQ</h1>
            <p className='text-muted-foreground'>Manage customer inquiries and frequently asked questions</p>
          </div>
        </div>

        {/* Main Tabs - Inquiries vs FAQ */}
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as typeof mainTab)}>
          <TabsList>
            <TabsTrigger value='inquiries'>
              <HelpCircle className='mr-2 h-4 w-4' />
              Inquiries
            </TabsTrigger>
            <TabsTrigger value='faq'>
              <FileQuestion className='mr-2 h-4 w-4' />
              FAQ Management
            </TabsTrigger>
          </TabsList>

          {/* Inquiries Tab Content */}
          <TabsContent value='inquiries' className='mt-4 space-y-4'>
            {/* Status Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setCurrentPage(1) }}>
              <TabsList>
                <TabsTrigger value='all'>
                  All
                  <Badge variant='secondary' className='ml-2'>{stats.total}</Badge>
                </TabsTrigger>
                <TabsTrigger value='new'>
                  New
                  <Badge variant='blue' className='ml-2'>{stats.new}</Badge>
                </TabsTrigger>
                <TabsTrigger value='in_progress'>
                  In Progress
                  <Badge variant='amber' className='ml-2'>{stats.inProgress}</Badge>
                </TabsTrigger>
                <TabsTrigger value='responded'>
                  Responded
                  <Badge variant='emerald' className='ml-2'>{stats.responded}</Badge>
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
                          placeholder='Search inquiries...'
                          value={searchTerm}
                          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                          className='pl-10'
                        />
                      </div>
                      <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
                        <SelectTrigger className='w-[140px]'>
                          <SelectValue placeholder='Type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>All Types</SelectItem>
                          {Object.entries(inquiryTypeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
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
                          {salesStaff.map(staff => (
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
                              <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('inquiryNumber')}>
                                Inquiry # <ArrowUpDown className='ml-2 h-4 w-4' />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('customerName')}>
                                Customer <ArrowUpDown className='ml-2 h-4 w-4' />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('vehicleName')}>
                                Vehicle <ArrowUpDown className='ml-2 h-4 w-4' />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('type')}>
                                Type <ArrowUpDown className='ml-2 h-4 w-4' />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('status')}>
                                Status <ArrowUpDown className='ml-2 h-4 w-4' />
                              </Button>
                            </TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>
                              <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('createdAt')}>
                                Created <ArrowUpDown className='ml-2 h-4 w-4' />
                              </Button>
                            </TableHead>
                            <TableHead className='text-right'>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedInquiries.length > 0 ? (
                            paginatedInquiries.map((inquiry) => (
                              <TableRow key={inquiry.id} className='cursor-pointer hover:bg-muted/50'>
                                <TableCell>
                                  <span className='font-mono text-sm font-medium'>{inquiry.inquiryNumber}</span>
                                </TableCell>
                                <TableCell>
                                  <div className='flex items-center gap-2'>
                                    <Avatar className='h-8 w-8'>
                                      <AvatarFallback className='text-xs'>
                                        {getInitials(inquiry.customerName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className='min-w-0'>
                                      <p className='text-sm font-medium truncate'>{inquiry.customerName}</p>
                                      <p className='text-xs text-muted-foreground truncate'>{inquiry.customerEmail}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className='flex items-center gap-2'>
                                    <Car className='h-4 w-4 text-muted-foreground' />
                                    <span className='text-sm truncate max-w-[200px]'>{inquiry.vehicleName}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant='outline' className={cn('text-xs', typeStyles[inquiry.type])}>
                                    {inquiryTypeLabels[inquiry.type]}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant='outline' className={cn('text-xs', statusStyles[inquiry.status])}>
                                    {inquiryStatusLabels[inquiry.status]}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {inquiry.assignedToName ? (
                                    <span className='text-sm'>{inquiry.assignedToName}</span>
                                  ) : (
                                    <span className='text-sm text-muted-foreground italic'>Unassigned</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className='text-sm'>
                                    {formatDistanceToNow(inquiry.createdAt, { addSuffix: true })}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    {format(inquiry.createdAt, 'MMM dd, HH:mm')}
                                  </div>
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
                                      <DropdownMenuItem>
                                        <Eye className='mr-2 h-4 w-4' />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <MessageSquare className='mr-2 h-4 w-4' />
                                        Respond
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <UserPlus className='mr-2 h-4 w-4' />
                                        Assign
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <Mail className='mr-2 h-4 w-4' />
                                        Send Email
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Phone className='mr-2 h-4 w-4' />
                                        Call Customer
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <CheckCircle className='mr-2 h-4 w-4' />
                                        Mark Responded
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <XCircle className='mr-2 h-4 w-4' />
                                        Close
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
                                  <HelpCircle className='h-8 w-8 text-muted-foreground/50 mb-2' />
                                  <p className='text-muted-foreground'>No inquiries found</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {filteredInquiries.length > 0 && (
                      <div className='flex items-center justify-between p-4 border-t'>
                        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                          <span>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                            {Math.min(currentPage * itemsPerPage, filteredInquiries.length)} of{' '}
                            {filteredInquiries.length}
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
          </TabsContent>

          {/* FAQ Tab Content */}
          <TabsContent value='faq' className='mt-4 space-y-4'>
            {/* Header with Add Button */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='relative w-[300px]'>
                  <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                  <Input
                    placeholder='Search FAQs...'
                    value={faqSearchTerm}
                    onChange={(e) => setFaqSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
                <Select value={faqCategoryFilter} onValueChange={setFaqCategoryFilter}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    {Object.entries(faqCategories).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddFaq}>
                <Plus className='mr-2 h-4 w-4' />
                Add FAQ
              </Button>
            </div>

            {/* FAQ List */}
            <div className='space-y-4'>
              {Object.entries(faqCategories).map(([categoryKey, categoryLabel]) => {
                const categoryFaqs = filteredFaqs.filter(f => f.category === categoryKey)
                if (faqCategoryFilter !== 'all' && faqCategoryFilter !== categoryKey) return null
                if (categoryFaqs.length === 0) return null

                return (
                  <Card key={categoryKey}>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg'>{categoryLabel}</CardTitle>
                      <CardDescription>{categoryFaqs.length} question{categoryFaqs.length !== 1 ? 's' : ''}</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      {categoryFaqs.map((faq) => (
                        <div
                          key={faq.id}
                          className={cn(
                            'rounded-lg border p-4 transition-colors',
                            !faq.isPublished && 'bg-muted/50 opacity-60'
                          )}
                        >
                          <div className='flex items-start justify-between gap-4'>
                            <div className='flex-1 space-y-2'>
                              <div className='flex items-center gap-2'>
                                <p className='font-medium'>{faq.question}</p>
                                {!faq.isPublished && (
                                  <Badge variant='outline' className='text-xs'>Draft</Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground line-clamp-2'>{faq.answer}</p>
                              <p className='text-xs text-muted-foreground'>
                                Updated {formatDistanceToNow(faq.updatedAt, { addSuffix: true })}
                              </p>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Switch
                                checked={faq.isPublished}
                                onCheckedChange={() => handleTogglePublish(faq)}
                              />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant='ghost' size='icon'>
                                    <MoreHorizontal className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuItem onClick={() => handleEditFaq(faq)}>
                                    <Pencil className='mr-2 h-4 w-4' />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className='text-destructive'
                                    onClick={() => handleDeleteFaq(faq)}
                                  >
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}

              {filteredFaqs.length === 0 && (
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-12'>
                    <FileQuestion className='h-12 w-12 text-muted-foreground/50 mb-4' />
                    <p className='text-muted-foreground'>No FAQs found</p>
                    <Button variant='outline' className='mt-4' onClick={handleAddFaq}>
                      <Plus className='mr-2 h-4 w-4' />
                      Add your first FAQ
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* FAQ Dialog */}
        <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
              <DialogDescription>
                {editingFaq ? 'Update the FAQ details below' : 'Add a new frequently asked question'}
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label>Category</Label>
                <Select
                  value={faqForm.category}
                  onValueChange={(v) => setFaqForm({ ...faqForm, category: v as FAQCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(faqCategories).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Question</Label>
                <Input
                  placeholder='Enter the question...'
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label>Answer</Label>
                <Textarea
                  placeholder='Enter the answer...'
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  rows={5}
                />
              </div>
              <div className='flex items-center gap-2'>
                <Switch
                  id='published'
                  checked={faqForm.isPublished}
                  onCheckedChange={(checked) => setFaqForm({ ...faqForm, isPublished: checked })}
                />
                <Label htmlFor='published'>Publish immediately</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setFaqDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFaq}>
                {editingFaq ? 'Save Changes' : 'Add FAQ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
