'use client'

import { useMemo } from 'react'
import { StatsCard } from '@/features/dashboard/components/stats-card'
import { type Submission, getDisplayStatus } from '../data/unified-leads'

interface LeadsStatsOverviewProps {
  leads: Submission[]
}

export function LeadsStatsOverview({ leads }: LeadsStatsOverviewProps) {
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const newToday = leads.filter((l) => l.createdAt >= today).length
    const pendingAssignment = leads.filter(
      (l) => !l.assignedTo && l.status !== 'closed'
    ).length

    // Count leads awaiting response (new/pending/in_progress based on type)
    const awaitingResponse = leads.filter((l) => {
      const status = getDisplayStatus(l)
      return ['new', 'pending', 'in_progress'].includes(status)
    }).length

    return {
      total: leads.length,
      newToday,
      pendingAssignment,
      awaitingResponse,
    }
  }, [leads])

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <StatsCard
        title='Total Leads'
        value={stats.total}
        description='all lead types'
      />
      <StatsCard
        title='New Today'
        value={stats.newToday}
        description='received today'
      />
      <StatsCard
        title='Pending Assignment'
        value={stats.pendingAssignment}
        description='needs attention'
      />
      <StatsCard
        title='Awaiting Response'
        value={stats.awaitingResponse}
        description='in progress'
      />
    </div>
  )
}
