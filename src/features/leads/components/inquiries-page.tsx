'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent } from '@/components/ui/card'
import { StatsCard } from '@/features/dashboard/components/stats-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MdSearch as SearchIcon,
  MdFilterList,
  MdClose,
  MdDirectionsCar,
  MdEmail,
  MdLocationOn,
  MdAttachMoney,
  MdSpeed,
  MdAccessTime,
  MdArrowForward,
  MdInbox,
} from 'react-icons/md'
import { ArrowRight, Car, Clock, DollarSign, Eye, Filter, Inbox, Mail, MapPin, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  inquiries as initialInquiries,
  type InquirySubmission,
  type InquiryStatus,
  staffMembers,
} from '../data/submissions'

const statusConfig: Record<InquiryStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  in_progress: { label: 'In Progress', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  responded: { label: 'Responded', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground' },
}

const inquiryTypeIcons = {
  price: MdAttachMoney,
  availability: MdAccessTime,
  shipping: MdLocationOn,
  inspection: MdDirectionsCar,
  general: MdEmail,
}

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function InquiriesPage() {
  const router = useRouter()
  const [inquiries] = useState(initialInquiries)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Stats
  const stats = useMemo(() => ({
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    inProgress: inquiries.filter(i => i.status === 'in_progress').length,
    responded: inquiries.filter(i => i.status === 'responded').length,
  }), [inquiries])

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    let result = [...inquiries]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(i =>
        i.submissionNumber.toLowerCase().includes(search) ||
        i.customerName.toLowerCase().includes(search) ||
        i.customerEmail.toLowerCase().includes(search) ||
        i.metadata.vehicleTitle.toLowerCase().includes(search)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter)
    }

    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        result = result.filter(i => !i.assignedTo)
      } else {
        result = result.filter(i => i.assignedTo === assigneeFilter)
      }
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [inquiries, searchTerm, statusFilter, assigneeFilter])

  const handleRowClick = useCallback((inquiry: InquirySubmission) => {
    router.push(`/leads/inquiries/${inquiry.id}`)
  }, [router])

  const hasActiveFilters = statusFilter !== 'all' || assigneeFilter !== 'all'

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
            <h1 className="text-2xl font-bold tracking-tight">Inquiries</h1>
            <p className="text-muted-foreground text-sm">Vehicle inquiries from potential customers</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Inquiries"
            value={stats.total}
            description="all inquiries"
          />
          <StatsCard
            title="New"
            value={stats.new}
            description="awaiting response"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            description="being handled"
          />
          <StatsCard
            title="Responded"
            value={stats.responded}
            description="completed"
          />
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                {(statusFilter !== 'all' ? 1 : 0) + (assigneeFilter !== 'all' ? 1 : 0)}
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="w-[160px] h-8">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
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
                      setAssigneeFilter('all')
                    }}
                    className="h-8 text-muted-foreground"
                  >
                    <MdClose className="h-3.5 w-3.5 mr-1" />
                    Clear
                  </Button>
                )}
                <div className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  {filteredInquiries.length} result{filteredInquiries.length !== 1 ? 's' : ''}
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
            <ScrollArea className="h-[calc(100vh-380px)]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                    <TableHead className="w-[90px]">Time</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <MdInbox className="h-8 w-8" />
                          <p>No inquiries found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInquiries.map((inquiry, index) => {
                      const TypeIcon = inquiryTypeIcons[inquiry.metadata.inquiryType] || MdEmail
                      const status = statusConfig[inquiry.status as InquiryStatus]

                      return (
                        <motion.tr
                          key={inquiry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          onClick={() => handleRowClick(inquiry)}
                          className={cn(
                            "group cursor-pointer border-b transition-colors",
                            "hover:bg-muted/50",
                            inquiry.status === 'new' && "border-l-2 border-l-blue-500"
                          )}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {inquiry.submissionNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-muted">
                                  {inquiry.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{inquiry.customerName}</p>
                                <p className="text-xs text-muted-foreground truncate">{inquiry.customerEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-0">
                              <MdDirectionsCar className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm truncate max-w-[200px]">{inquiry.metadata.vehicleTitle}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>${inquiry.metadata.vehiclePrice?.toLocaleString() ?? 'N/A'}</span>
                                  <span className="text-border">|</span>
                                  <span>{inquiry.metadata.vehicleMileage?.toLocaleString() ?? 'N/A'} km</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1 text-xs font-normal">
                              <TypeIcon className="h-3 w-3" />
                              <span className="capitalize">{inquiry.metadata.inquiryType}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs font-medium", status.color)}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatTimeAgo(inquiry.createdAt)}
                          </TableCell>
                          <TableCell>
                            <MdArrowForward className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </TableCell>
                        </motion.tr>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </motion.div>
      </Main>
    </>
  )
}
