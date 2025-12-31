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
  MdLocationOn,
  MdBusiness,
  MdCampaign,
  MdAccessTime,
  MdCheckCircle,
  MdCancel,
  MdArrowForward,
  MdPeople,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import {
  signups as initialSignups,
  type SignupSubmission,
  type SignupStatus,
  staffMembers,
} from '../data/submissions'

const statusConfig: Record<SignupStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    icon: MdAccessTime,
  },
  verified: {
    label: 'Verified',
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    icon: MdCheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500/15 text-red-600 dark:text-red-400',
    icon: MdCancel,
  },
}

const sourceColors: Record<string, string> = {
  'Google Search': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  'Social Media': 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  'YouTube': 'bg-red-500/15 text-red-600 dark:text-red-400',
  'Friend Referral': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'Online Ad': 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  'Trade Show': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'Existing Customer': 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  'Other': 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
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

export function SignupsPage() {
  const router = useRouter()
  const [signups] = useState(initialSignups)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Stats
  const stats = useMemo(() => ({
    total: signups.length,
    pending: signups.filter(s => s.metadata.verificationStatus === 'pending').length,
    verified: signups.filter(s => s.metadata.verificationStatus === 'verified').length,
    rejected: signups.filter(s => s.metadata.verificationStatus === 'rejected').length,
  }), [signups])

  // Unique sources
  const uniqueSources = useMemo(() => {
    const sources = new Set(signups.map(s => s.metadata.hearAboutUs))
    return Array.from(sources).sort()
  }, [signups])

  // Filtered signups
  const filteredSignups = useMemo(() => {
    let result = [...signups]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(s =>
        s.submissionNumber.toLowerCase().includes(search) ||
        s.customerName.toLowerCase().includes(search) ||
        s.customerEmail.toLowerCase().includes(search) ||
        s.metadata.company?.toLowerCase().includes(search) ||
        s.metadata.country.toLowerCase().includes(search) ||
        s.metadata.city?.toLowerCase().includes(search)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(s => s.metadata.verificationStatus === statusFilter)
    }

    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        result = result.filter(s => !s.assignedTo)
      } else {
        result = result.filter(s => s.assignedTo === assigneeFilter)
      }
    }

    if (sourceFilter !== 'all') {
      result = result.filter(s => s.metadata.hearAboutUs === sourceFilter)
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [signups, searchTerm, statusFilter, assigneeFilter, sourceFilter])

  const handleRowClick = useCallback((signup: SignupSubmission) => {
    router.push(`/leads/signups/${signup.id}`)
  }, [router])

  const hasActiveFilters = statusFilter !== 'all' || assigneeFilter !== 'all' || sourceFilter !== 'all'

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
            <h1 className="text-2xl font-bold tracking-tight">Signups</h1>
            <p className="text-muted-foreground text-sm">Customer registration requests</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Total"
            value={stats.total}
            description="all signups"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            description="awaiting verification"
          />
          <StatsCard
            title="Verified"
            value={stats.verified}
            description="approved"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            description="declined"
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
              placeholder="Search by name, email, company..."
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
                {(statusFilter !== 'all' ? 1 : 0) + (assigneeFilter !== 'all' ? 1 : 0) + (sourceFilter !== 'all' ? 1 : 0)}
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
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[160px] h-8">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {uniqueSources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
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
                      setSourceFilter('all')
                    }}
                    className="h-8 text-muted-foreground"
                  >
                    <MdClose className="h-3.5 w-3.5 mr-1" />
                    Clear
                  </Button>
                )}
                <div className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  {filteredSignups.length} result{filteredSignups.length !== 1 ? 's' : ''}
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
                    <TableHead>Location</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="w-[140px]">Source</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[90px]">Time</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSignups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <MdPeople className="h-8 w-8" />
                          <p>No signups found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSignups.map((signup, index) => {
                      const status = statusConfig[signup.metadata.verificationStatus]
                      const sourceColor = sourceColors[signup.metadata.hearAboutUs] || sourceColors['Other']
                      const StatusIcon = status.icon

                      return (
                        <motion.tr
                          key={signup.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          onClick={() => handleRowClick(signup)}
                          className={cn(
                            "group cursor-pointer border-b transition-colors",
                            "hover:bg-muted/50",
                            signup.metadata.verificationStatus === 'pending' && "border-l-2 border-l-amber-500"
                          )}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {signup.submissionNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-muted">
                                  {signup.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{signup.customerName}</p>
                                <p className="text-xs text-muted-foreground truncate">{signup.customerEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-0">
                              <MdLocationOn className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm truncate">
                                {signup.metadata.city ? `${signup.metadata.city}, ` : ''}{signup.metadata.country}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {signup.metadata.company ? (
                              <div className="flex items-center gap-2 min-w-0">
                                <MdBusiness className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm truncate max-w-[150px]">{signup.metadata.company}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={cn("text-xs font-normal gap-1", sourceColor)}>
                              <MdCampaign className="h-3 w-3" />
                              <span className="truncate max-w-[80px]">{signup.metadata.hearAboutUs}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs font-medium gap-1", status.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatTimeAgo(signup.createdAt)}
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
