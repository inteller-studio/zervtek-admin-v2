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
  const pendingPayment = auctions.filter((a) => a.paymentStatus !== 'completed').length
  const inShipping = auctions.filter((a) => a.status === 'shipping').length
  const totalValue = auctions.reduce((sum, a) => sum + a.winningBid, 0)

  // Calculate changes (mock data - in real app, compare with previous period)
  const totalChange = 12
  const pendingChange = -8
  const shippingChange = 5
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
        title='Pending Payment'
        value={pendingPayment}
        change={pendingChange}
        loading={loading}
        description='vs last month'
      />
      <StatsCard
        title='In Shipping'
        value={inShipping}
        change={shippingChange}
        loading={loading}
        description='vs last month'
      />
      <StatsCard
        title='Total Value'
        value={totalValue}
        change={valueChange}
        loading={loading}
        prefix='$'
        description='vs last month'
      />
    </div>
  )
}
