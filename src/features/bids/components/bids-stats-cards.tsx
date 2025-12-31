'use client'

import { StatsCard } from '@/features/dashboard/components/stats-card'

interface BidsStats {
  total: number
  pending: number
  active: number
  won: number
  upcoming: number
  lost: number
}

interface BidsStatsCardsProps {
  stats: BidsStats
}

export function BidsStatsCards({ stats }: BidsStatsCardsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-6'>
      <StatsCard title='Total Bids' value={stats.total} description='today' />
      <StatsCard title='Pending' value={stats.pending} description='today' />
      <StatsCard title='Active' value={stats.active} description='today' />
      <StatsCard title='Won' value={stats.won} description='today' />
      <StatsCard title='Upcoming' value={stats.upcoming} description='today' />
      <StatsCard title='Lost' value={stats.lost} description='today' />
    </div>
  )
}
