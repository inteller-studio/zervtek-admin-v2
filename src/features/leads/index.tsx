'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AnimatedTabs, AnimatedTabsContent, type TabItem } from '@/components/ui/animated-tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MdSearch as SearchIcon,
  MdPersonAdd,
  MdDirectionsCar,
  MdVerifiedUser,
  MdFactCheck,
  MdFilterList,
  MdClose,
} from 'react-icons/md'
import { useRBAC } from '@/hooks/use-rbac'
import {
  inquiries as initialInquiries,
  signups as initialSignups,
  onboardingRequests as initialOnboarding,
  type InquirySubmission,
  type SignupSubmission,
  type OnboardingSubmission,
  type InquiryStatus,
  type SignupStatus,
  type OnboardingStatus,
  staffMembers,
} from './data/submissions'
import { InquiriesTable } from './components/inquiries-table'
import { InquiryModal } from './components/inquiry-modal'
import { SignupsBoard } from './components/signups-board'
import { SignupModal } from './components/signup-modal'
import { OnboardingTimeline } from './components/onboarding-timeline'
import { OnboardingModal } from './components/onboarding-modal'
import { AssignCustomersTab } from './components/assign-customers-tab'

type TabValue = 'inquiries' | 'signups' | 'onboarding' | 'assign_customers'

export function Leads() {
  const { isAdmin } = useRBAC()

  // Separate state for each type
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [signups, setSignups] = useState(initialSignups)
  const [onboardingRequests, setOnboardingRequests] = useState(initialOnboarding)

  // Tab and filter state
  const [activeTab, setActiveTab] = useState<TabValue>('inquiries')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Modal state for each type
  const [selectedInquiry, setSelectedInquiry] = useState<InquirySubmission | null>(null)
  const [selectedSignup, setSelectedSignup] = useState<SignupSubmission | null>(null)
  const [selectedOnboarding, setSelectedOnboarding] = useState<OnboardingSubmission | null>(null)
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false)

  // Counts for badges
  const counts = useMemo(() => ({
    inquiries: inquiries.filter(i => i.status === 'new').length,
    signups: signups.filter(s => s.metadata.verificationStatus === 'pending').length,
    onboarding: onboardingRequests.filter(o => o.status === 'new' || !o.metadata.scheduledDate).length,
  }), [inquiries, signups, onboardingRequests])

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

  // Filtered signups
  const filteredSignups = useMemo(() => {
    let result = [...signups]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(s =>
        s.submissionNumber.toLowerCase().includes(search) ||
        s.customerName.toLowerCase().includes(search) ||
        s.customerEmail.toLowerCase().includes(search) ||
        s.metadata.country.toLowerCase().includes(search)
      )
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [signups, searchTerm])

  // Filtered onboarding
  const filteredOnboarding = useMemo(() => {
    let result = [...onboardingRequests]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(o =>
        o.submissionNumber.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.customerEmail.toLowerCase().includes(search) ||
        o.metadata.vehicles.some(v =>
          `${v.make} ${v.model}`.toLowerCase().includes(search)
        )
      )
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [onboardingRequests, searchTerm])

  // Reset filters when tab changes
  useEffect(() => {
    setSearchTerm('')
    setStatusFilter('all')
    setAssigneeFilter('all')
    setShowFilters(false)
  }, [activeTab])

  // Update selected items when data changes
  useEffect(() => {
    if (selectedInquiry) {
      const updated = inquiries.find(i => i.id === selectedInquiry.id)
      if (updated) setSelectedInquiry(updated)
    }
  }, [inquiries, selectedInquiry?.id])

  useEffect(() => {
    if (selectedSignup) {
      const updated = signups.find(s => s.id === selectedSignup.id)
      if (updated) setSelectedSignup(updated)
    }
  }, [signups, selectedSignup?.id])

  useEffect(() => {
    if (selectedOnboarding) {
      const updated = onboardingRequests.find(o => o.id === selectedOnboarding.id)
      if (updated) setSelectedOnboarding(updated)
    }
  }, [onboardingRequests, selectedOnboarding?.id])

  // Inquiry handlers
  const handleInquiryClick = useCallback((inquiry: InquirySubmission) => {
    setSelectedInquiry(inquiry)
    setIsInquiryModalOpen(true)
  }, [])

  const handleInquiryStatusChange = useCallback((id: string, status: InquiryStatus) => {
    setInquiries(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status,
          respondedAt: status === 'responded' ? new Date() : i.respondedAt,
        }
      }
      return i
    }))
  }, [])

  const handleInquiryAssign = useCallback((id: string, staffId: string, staffName: string) => {
    setInquiries(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          assignedTo: staffId,
          assignedToName: staffName,
          status: i.status === 'new' ? 'in_progress' : i.status,
        } as InquirySubmission
      }
      return i
    }))
  }, [])

  const handleInquiryReply = useCallback((id: string, _message: string) => {
    setInquiries(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status: 'responded' as InquiryStatus,
          respondedAt: new Date(),
        }
      }
      return i
    }))
  }, [])

  // Signup handlers
  const handleSignupClick = useCallback((signup: SignupSubmission) => {
    setSelectedSignup(signup)
    setIsSignupModalOpen(true)
  }, [])

  const handleSignupApprove = useCallback((id: string) => {
    setSignups(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: 'responded' as const,
          metadata: { ...s.metadata, verificationStatus: 'verified' as const },
          respondedAt: new Date(),
        }
      }
      return s
    }))
  }, [])

  const handleSignupReject = useCallback((id: string) => {
    setSignups(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: 'closed' as const,
          metadata: { ...s.metadata, verificationStatus: 'rejected' as const },
          respondedAt: new Date(),
        }
      }
      return s
    }))
  }, [])

  const handleSignupAssign = useCallback((id: string, staffId: string, staffName: string) => {
    setSignups(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          assignedTo: staffId,
          assignedToName: staffName,
        }
      }
      return s
    }))
  }, [])

  // Onboarding handlers
  const handleOnboardingClick = useCallback((onboarding: OnboardingSubmission) => {
    setSelectedOnboarding(onboarding)
    setIsOnboardingModalOpen(true)
  }, [])

  const handleOnboardingStatusChange = useCallback((id: string, status: OnboardingStatus) => {
    setOnboardingRequests(prev => prev.map(o => {
      if (o.id === id) {
        const newStatus = status === 'completed' ? 'closed' as const :
                         status === 'new' ? 'new' as const : 'in_progress' as const
        return {
          ...o,
          status: newStatus,
          respondedAt: status === 'completed' ? new Date() : o.respondedAt,
        }
      }
      return o
    }))
  }, [])

  const handleOnboardingAssign = useCallback((id: string, staffId: string, staffName: string) => {
    setOnboardingRequests(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          assignedTo: staffId,
          assignedToName: staffName,
        }
      }
      return o
    }))
  }, [])

  const handleOnboardingSchedule = useCallback((id: string, date: string, time: string) => {
    setOnboardingRequests(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: 'in_progress' as const,
          metadata: {
            ...o.metadata,
            scheduledDate: date,
            scheduledTime: time,
          },
        }
      }
      return o
    }))
  }, [])

  const hasActiveFilters = statusFilter !== 'all' || assigneeFilter !== 'all'

  return (
    <TooltipProvider>
      <Header fixed>
        <Search />
        <HeaderActions />
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-5">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground text-sm">Manage inquiries, signups, and onboarding requests</p>
          </div>
        </div>

        {/* Tabs */}
        <AnimatedTabs
          tabs={useMemo(() => {
            const baseTabs: TabItem[] = [
              {
                id: 'inquiries',
                label: 'Inquiries',
                icon: MdDirectionsCar,
                badge: counts.inquiries > 0 ? counts.inquiries : undefined,
                badgeColor: 'primary'
              },
              {
                id: 'signups',
                label: 'Signups',
                icon: MdVerifiedUser,
                badge: counts.signups > 0 ? counts.signups : undefined,
                badgeColor: 'amber'
              },
              {
                id: 'onboarding',
                label: 'Onboarding',
                icon: MdFactCheck,
                badge: counts.onboarding > 0 ? counts.onboarding : undefined,
                badgeColor: 'primary'
              },
            ]
            if (isAdmin) {
              baseTabs.push({
                id: 'assign_customers',
                label: 'Assign Customers',
                icon: MdPersonAdd,
              })
            }
            return baseTabs
          }, [counts, isAdmin])}
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          variant="compact"
        >
          {/* Search & Filter Controls */}
          <div className="flex items-center justify-end gap-3 flex-wrap px-4 py-3 border-b bg-card">
            {/* Search & Filter Toggle (only for inquiries tab) */}
            {activeTab === 'inquiries' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search inquiries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 w-[200px]"
                  />
                </div>
                <Button
                  variant={hasActiveFilters ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-9"
                >
                  <MdFilterList className="h-4 w-4 mr-1" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-[10px] rounded-full">
                      {(statusFilter !== 'all' ? 1 : 0) + (assigneeFilter !== 'all' ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </div>
            )}

            {/* Search for signups and onboarding */}
            {(activeTab === 'signups' || activeTab === 'onboarding') && (
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 w-[200px]"
                />
              </div>
            )}
          </div>

          {/* Filter Bar (only for inquiries) */}
          {showFilters && activeTab === 'inquiries' && (
            <Card className="mx-4 mt-3">
              <CardContent className="py-3 flex items-center gap-3">
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
          )}

          {/* Inquiries Tab */}
          <AnimatedTabsContent value="inquiries" className="mt-4 px-4">
            <InquiriesTable
              data={filteredInquiries}
              selectedId={isInquiryModalOpen ? selectedInquiry?.id || null : null}
              onRowClick={handleInquiryClick}
            />
          </AnimatedTabsContent>

          {/* Signups Tab */}
          <AnimatedTabsContent value="signups" className="mt-4 px-4">
            <SignupsBoard
              data={filteredSignups}
              onCardClick={handleSignupClick}
            />
          </AnimatedTabsContent>

          {/* Onboarding Tab */}
          <AnimatedTabsContent value="onboarding" className="mt-4 px-4">
            <OnboardingTimeline
              data={filteredOnboarding}
              onItemClick={handleOnboardingClick}
            />
          </AnimatedTabsContent>

          {/* Assign Customers Tab */}
          {isAdmin && (
            <AnimatedTabsContent value="assign_customers" className="mt-4 px-4">
              <AssignCustomersTab />
            </AnimatedTabsContent>
          )}
        </AnimatedTabs>
      </Main>

      {/* Inquiry Modal */}
      <InquiryModal
        inquiry={selectedInquiry}
        open={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        onStatusChange={handleInquiryStatusChange}
        onAssign={handleInquiryAssign}
        onReply={handleInquiryReply}
      />

      {/* Signup Modal */}
      <SignupModal
        signup={selectedSignup}
        open={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onApprove={handleSignupApprove}
        onReject={handleSignupReject}
        onAssign={handleSignupAssign}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        onboarding={selectedOnboarding}
        open={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onStatusChange={handleOnboardingStatusChange}
        onAssign={handleOnboardingAssign}
        onSchedule={handleOnboardingSchedule}
      />
    </TooltipProvider>
  )
}
