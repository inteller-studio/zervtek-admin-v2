'use client'

import { type WonAuction } from '../data/won-auctions'
import { StatsCard } from '@/features/dashboard/components/stats-card'

interface WonAuctionsStatsProps {
  auctions: WonAuction[]
  loading?: boolean
}

export function WonAuctionsStats({ auctions, loading = false }: WonAuctionsStatsProps) {
  // Calculate stats
  const totalAuctions = auctions.length
  const totalValue = auctions.reduce((sum, a) => sum + a.winningBid, 0)
  const pendingPayment = auctions.filter((a) => a.status === 'payment_pending').length
  const inShipping = auctions.filter((a) => a.status === 'shipping').length

  // Calculate changes (mock data - in real app, compare with previous period)
  const totalChange = 12
  const valueChange = 15

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <StatsCard
        title='Total Purchases'
        value={totalAuctions}
        change={totalChange}
        loading={loading}
        description='vs last month'
      />
      <StatsCard
        title='Total Value'
        value={totalValue}
        change={valueChange}
        loading={loading}
        prefix='¥'
        description='all purchases'
      />
      <StatsCard
        title='Pending Payment'
        value={pendingPayment}
        loading={loading}
        description='awaiting payment'
      />
      <StatsCard
        title='In Shipping'
        value={inShipping}
        loading={loading}
        description='in transit'
      />
    </div>
  )
}
