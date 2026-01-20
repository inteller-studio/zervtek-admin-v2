'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  submissions as initialSubmissions,
  type Submission,
  type InquirySubmission,
  type SignupSubmission,
  type OnboardingSubmission,
  type InquiryStatus,
  type OnboardingStatus,
  getDisplayStatus,
} from './data/unified-leads'
import { LeadsStatsOverview } from './components/leads-stats-overview'
import { LeadsFilters, type LeadsFilterState } from './components/leads-filters'
import { UnifiedLeadsTable } from './components/unified-leads-table'
import { InquiryModal } from './components/inquiry-modal'
import { SignupModal } from './components/signup-modal'
import { OnboardingModal } from './components/onboarding-modal'

export function Leads() {

  // Submissions state (for updates)
  const [submissions, setSubmissions] = useState(initialSubmissions)

  // Filter state
  const [filters, setFilters] = useState<LeadsFilterState>({
    typeFilter: 'all',
    searchTerm: '',
    statusFilter: 'all',
    assigneeFilter: 'all',
  })

  // Modal state for each type
  const [selectedInquiry, setSelectedInquiry] = useState<InquirySubmission | null>(null)
  const [selectedSignup, setSelectedSignup] = useState<SignupSubmission | null>(null)
  const [selectedOnboarding, setSelectedOnboarding] = useState<OnboardingSubmission | null>(null)
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false)

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions]

    // Type filter
    if (filters.typeFilter !== 'all') {
      result = result.filter((s) => s.type === filters.typeFilter)
    }

    // Search filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase()
      result = result.filter(
        (s) =>
          s.submissionNumber.toLowerCase().includes(search) ||
          s.customerName.toLowerCase().includes(search) ||
          s.customerEmail.toLowerCase().includes(search) ||
          s.subject.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      result = result.filter((s) => {
        const status = getDisplayStatus(s)
        return status === filters.statusFilter
      })
    }

    // Assignee filter
    if (filters.assigneeFilter === 'unassigned') {
      result = result.filter((s) => !s.assignedTo)
    } else if (filters.assigneeFilter !== 'all') {
      result = result.filter((s) => s.assignedTo === filters.assigneeFilter)
    }

    // Sort by newest first
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [submissions, filters])

  // Update selected items when data changes
  useEffect(() => {
    if (selectedInquiry) {
      const updated = submissions.find((s) => s.id === selectedInquiry.id) as InquirySubmission | undefined
      if (updated) setSelectedInquiry(updated)
    }
  }, [submissions, selectedInquiry?.id])

  useEffect(() => {
    if (selectedSignup) {
      const updated = submissions.find((s) => s.id === selectedSignup.id) as SignupSubmission | undefined
      if (updated) setSelectedSignup(updated)
    }
  }, [submissions, selectedSignup?.id])

  useEffect(() => {
    if (selectedOnboarding) {
      const updated = submissions.find((s) => s.id === selectedOnboarding.id) as OnboardingSubmission | undefined
      if (updated) setSelectedOnboarding(updated)
    }
  }, [submissions, selectedOnboarding?.id])

  // Row click handler - opens the correct modal based on type
  const handleRowClick = useCallback((submission: Submission) => {
    switch (submission.type) {
      case 'inquiry':
        setSelectedInquiry(submission as InquirySubmission)
        setIsInquiryModalOpen(true)
        break
      case 'signup':
        setSelectedSignup(submission as SignupSubmission)
        setIsSignupModalOpen(true)
        break
      case 'onboarding':
        setSelectedOnboarding(submission as OnboardingSubmission)
        setIsOnboardingModalOpen(true)
        break
    }
  }, [])

  // Inquiry handlers
  const handleInquiryStatusChange = useCallback((id: string, status: InquiryStatus) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status,
            respondedAt: status === 'responded' ? new Date() : s.respondedAt,
          }
        }
        return s
      })
    )
  }, [])

  const handleInquiryAssign = useCallback((id: string, staffId: string, staffName: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            assignedTo: staffId,
            assignedToName: staffName,
            status: s.status === 'new' ? 'in_progress' : s.status,
          }
        }
        return s
      })
    )
  }, [])

  const handleInquiryReply = useCallback((id: string, _message: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: 'responded' as const,
            respondedAt: new Date(),
          }
        }
        return s
      })
    )
  }, [])

  // Signup handlers
  const handleSignupApprove = useCallback((id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id && s.type === 'signup') {
          const signup = s as SignupSubmission
          return {
            ...signup,
            status: 'responded' as const,
            metadata: { ...signup.metadata, verificationStatus: 'verified' as const },
            respondedAt: new Date(),
          }
        }
        return s
      })
    )
  }, [])

  const handleSignupReject = useCallback((id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id && s.type === 'signup') {
          const signup = s as SignupSubmission
          return {
            ...signup,
            status: 'closed' as const,
            metadata: { ...signup.metadata, verificationStatus: 'rejected' as const },
            respondedAt: new Date(),
          }
        }
        return s
      })
    )
  }, [])

  const handleSignupAssign = useCallback((id: string, staffId: string, staffName: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            assignedTo: staffId,
            assignedToName: staffName,
          }
        }
        return s
      })
    )
  }, [])

  // Onboarding handlers
  const handleOnboardingStatusChange = useCallback((id: string, status: OnboardingStatus) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStatus =
            status === 'completed'
              ? ('closed' as const)
              : status === 'new'
                ? ('new' as const)
                : ('in_progress' as const)
          return {
            ...s,
            status: newStatus,
            respondedAt: status === 'completed' ? new Date() : s.respondedAt,
          }
        }
        return s
      })
    )
  }, [])

  const handleOnboardingAssign = useCallback((id: string, staffId: string, staffName: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            assignedTo: staffId,
            assignedToName: staffName,
          }
        }
        return s
      })
    )
  }, [])

  const handleOnboardingSchedule = useCallback((id: string, date: string, time: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id && s.type === 'onboarding') {
          const onboarding = s as OnboardingSubmission
          return {
            ...onboarding,
            status: 'in_progress' as const,
            metadata: {
              ...onboarding.metadata,
              scheduledDate: date,
              scheduledTime: time,
            },
          }
        }
        return s
      })
    )
  }, [])

  // Get currently selected ID for highlighting
  const selectedId = isInquiryModalOpen
    ? selectedInquiry?.id
    : isSignupModalOpen
      ? selectedSignup?.id
      : isOnboardingModalOpen
        ? selectedOnboarding?.id
        : null

  return (
    <TooltipProvider>
      <Header fixed>
        <Search />
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-5'>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='flex flex-wrap items-center justify-between gap-2'
        >
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Leads</h1>
            <p className='text-muted-foreground text-sm'>
              Manage inquiries, signups, and onboarding requests
            </p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <LeadsStatsOverview leads={submissions} />

        {/* Main Content */}
        <LeadsFilters
          filters={filters}
          onFiltersChange={setFilters}
          resultCount={filteredSubmissions.length}
        >
          <div className='p-4'>
            <UnifiedLeadsTable
              data={filteredSubmissions}
              selectedId={selectedId}
              onRowClick={handleRowClick}
            />
          </div>
        </LeadsFilters>
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
