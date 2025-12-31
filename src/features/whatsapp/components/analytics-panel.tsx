'use client'

import { motion } from 'framer-motion'
import {
  MdMessage,
  MdSend,
  MdPeople,
  MdAccessTime,
  MdTrendingUp,
  MdTrendingDown,
  MdBarChart,
  MdRadio,
  MdDescription,
} from 'react-icons/md'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useWhatsAppStats } from '@/hooks/use-whatsapp'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number | string
  change?: number
  icon: React.ElementType
  iconColor: string
  iconBg: string
  suffix?: string
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBg,
  suffix,
}: StatCardProps) {
  const isPositive = change && change > 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>{title}</p>
              <p className='text-3xl font-bold'>
                {typeof value === 'number' ? value.toLocaleString() : value}
                {suffix && (
                  <span className='text-lg font-normal text-muted-foreground'>
                    {suffix}
                  </span>
                )}
              </p>
              {change !== undefined && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {isPositive ? (
                    <MdTrendingUp className='h-3 w-3' />
                  ) : (
                    <MdTrendingDown className='h-3 w-3' />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {change}% from last week
                  </span>
                </div>
              )}
            </div>
            <div className={cn('rounded-full p-3', iconBg)}>
              <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AnalyticsPanel() {
  const { data: stats, isLoading } = useWhatsAppStats()

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className='pt-6'>
              <div className='h-24 animate-pulse rounded bg-muted' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Main Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Messages Sent'
          value={stats?.messagesSent || 0}
          change={12}
          icon={MdSend}
          iconColor='text-blue-600'
          iconBg='bg-blue-100 dark:bg-blue-950'
        />
        <StatCard
          title='Messages Received'
          value={stats?.messagesReceived || 0}
          change={8}
          icon={MdMessage}
          iconColor='text-green-600'
          iconBg='bg-green-100 dark:bg-green-950'
        />
        <StatCard
          title='Total Contacts'
          value={stats?.totalContacts || 0}
          change={5}
          icon={MdPeople}
          iconColor='text-purple-600'
          iconBg='bg-purple-100 dark:bg-purple-950'
        />
        <StatCard
          title='Active Chats'
          value={stats?.activeChats || 0}
          change={-3}
          icon={MdMessage}
          iconColor='text-orange-600'
          iconBg='bg-orange-100 dark:bg-orange-950'
        />
      </div>

      {/* Secondary Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Broadcasts Sent'
          value={stats?.broadcastsSent || 0}
          icon={MdRadio}
          iconColor='text-indigo-600'
          iconBg='bg-indigo-100 dark:bg-indigo-950'
        />
        <StatCard
          title='Templates Used'
          value={stats?.templatesUsed || 0}
          icon={MdDescription}
          iconColor='text-pink-600'
          iconBg='bg-pink-100 dark:bg-pink-950'
        />
        <StatCard
          title='Avg Response Time'
          value={stats?.avgResponseTime || 0}
          suffix=' min'
          icon={MdAccessTime}
          iconColor='text-cyan-600'
          iconBg='bg-cyan-100 dark:bg-cyan-950'
        />
        <StatCard
          title='Total Chats'
          value={stats?.totalChats || 0}
          icon={MdBarChart}
          iconColor='text-amber-600'
          iconBg='bg-amber-100 dark:bg-amber-950'
        />
      </div>

      {/* Message Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Message Distribution</CardTitle>
          <CardDescription>Breakdown of message types and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            <div className='flex items-center gap-3 rounded-lg border p-4'>
              <div className='rounded-full bg-blue-100 p-2 dark:bg-blue-950'>
                <MdMessage className='h-4 w-4 text-blue-600' />
              </div>
              <div>
                <p className='text-xl font-semibold'>68%</p>
                <p className='text-xs text-muted-foreground'>Text Messages</p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-lg border p-4'>
              <div className='rounded-full bg-green-100 p-2 dark:bg-green-950'>
                <MdMessage className='h-4 w-4 text-green-600' />
              </div>
              <div>
                <p className='text-xl font-semibold'>18%</p>
                <p className='text-xs text-muted-foreground'>Images</p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-lg border p-4'>
              <div className='rounded-full bg-purple-100 p-2 dark:bg-purple-950'>
                <MdMessage className='h-4 w-4 text-purple-600' />
              </div>
              <div>
                <p className='text-xl font-semibold'>8%</p>
                <p className='text-xs text-muted-foreground'>Documents</p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-lg border p-4'>
              <div className='rounded-full bg-orange-100 p-2 dark:bg-orange-950'>
                <MdMessage className='h-4 w-4 text-orange-600' />
              </div>
              <div>
                <p className='text-xl font-semibold'>4%</p>
                <p className='text-xs text-muted-foreground'>Audio</p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-lg border p-4'>
              <div className='rounded-full bg-pink-100 p-2 dark:bg-pink-950'>
                <MdMessage className='h-4 w-4 text-pink-600' />
              </div>
              <div>
                <p className='text-xl font-semibold'>2%</p>
                <p className='text-xs text-muted-foreground'>Other</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
