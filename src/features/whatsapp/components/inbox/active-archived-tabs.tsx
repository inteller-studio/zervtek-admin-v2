'use client'

import { AnimatedTabs, type TabItem } from '@/components/ui/animated-tabs'
import { useWhatsAppUIStore } from '../../stores/whatsapp-ui-store'

interface ActiveArchivedTabsProps {
  activeCount: number
  archivedCount: number
}

export function ActiveArchivedTabs({ activeCount, archivedCount }: ActiveArchivedTabsProps) {
  const { activeTab, setActiveTab } = useWhatsAppUIStore()

  const tabs: TabItem[] = [
    {
      id: 'active',
      label: 'Active',
      badge: activeCount > 0 ? activeCount : undefined,
      badgeColor: 'primary',
    },
    {
      id: 'archived',
      label: 'Archived',
      badge: archivedCount > 0 ? archivedCount : undefined,
    },
  ]

  return (
    <AnimatedTabs
      tabs={tabs}
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as 'active' | 'archived')}
      variant='compact'
    />
  )
}
