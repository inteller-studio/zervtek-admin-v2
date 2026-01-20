'use client'

import { useWhatsAppInstance } from '@/hooks/use-whatsapp'
import { WhatsAppLayout } from './components/layout/whatsapp-layout'
import { IconSidebar } from './components/layout/icon-sidebar'
import { ChatInterface } from './components/chat-interface'
import { MaintenanceOverlay } from '@/components/ui/maintenance-overlay'

export function WhatsApp() {
  const { data: instance } = useWhatsAppInstance()

  const isOnline = instance?.status === 'open'

  return (
    <WhatsAppLayout>
      <MaintenanceOverlay />
      {/* Icon Sidebar */}
      <IconSidebar isOnline={isOnline} />

      {/* Content Area */}
      <div className='flex flex-1 overflow-hidden'>
        <ChatInterface />
      </div>
    </WhatsAppLayout>
  )
}
