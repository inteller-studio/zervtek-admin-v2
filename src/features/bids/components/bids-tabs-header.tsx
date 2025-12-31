'use client'

import { useMemo } from 'react'
import { AnimatedTabs, type TabItem } from '@/components/ui/animated-tabs'
import type { BidTab } from '../types'

interface BidsTabsHeaderProps {
  activeTab: BidTab
  onTabChange: (tab: BidTab) => void
  pendingCount: number
}

export function BidsTabsHeader({ activeTab, onTabChange, pendingCount }: BidsTabsHeaderProps) {
  const tabs: TabItem[] = useMemo(() => [
    { id: 'all', label: 'All Bids' },
    {
      id: 'pending',
      label: 'Pending Approval',
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'amber'
    },
    { id: 'active', label: 'Active' },
    { id: 'outbid', label: 'Outbid' },
    { id: 'won', label: 'Won' },
    { id: 'lost', label: 'Lost' },
    { id: 'declined', label: 'Declined' },
  ], [pendingCount])

  return (
    <AnimatedTabs
      tabs={tabs}
      value={activeTab}
      onValueChange={(value) => onTabChange(value as BidTab)}
      variant="compact"
    />
  )
}
