'use client'

import { useState } from 'react'
import {
  MessageSquare,
  FileText,
  Radio,
  Smartphone,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConnectionPanel } from './components/connection-panel'
import { ChatInterface } from './components/chat-interface'
import { TemplatesPanel } from './components/templates-panel'
import { BroadcastPanel } from './components/broadcast-panel'
import { AnalyticsPanel } from './components/analytics-panel'

const tabs = [
  { id: 'overview', label: 'Overview', icon: Smartphone },
  { id: 'chats', label: 'Chats', icon: MessageSquare },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'broadcast', label: 'Broadcast', icon: Radio },
]

export function WhatsApp() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Page Header */}
        <div>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
            WhatsApp Integration
          </h1>
          <p className='text-muted-foreground'>
            Manage your WhatsApp Business messaging powered by Evolution API
          </p>
        </div>

        {/* Connection Status */}
        <ConnectionPanel />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
          <TabsList className='grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex'>
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className='gap-2'
                >
                  <Icon className='h-4 w-4' />
                  <span className='hidden sm:inline'>{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            <AnalyticsPanel />
          </TabsContent>

          <TabsContent value='chats'>
            <ChatInterface />
          </TabsContent>

          <TabsContent value='templates'>
            <TemplatesPanel />
          </TabsContent>

          <TabsContent value='broadcast'>
            <BroadcastPanel />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
