'use client'

import {
  MdArrowDownward,
  MdArrowUpward,
  MdAccessTime,
  MdMessage,
  MdForum,
  MdTrackChanges,
} from 'react-icons/md'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { EnhancedWhatsAppStats } from '../../types'

interface StatsOverviewCardsProps {
  stats: EnhancedWhatsAppStats
  previousStats?: EnhancedWhatsAppStats
  className?: string
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: number
  changeLabel?: string
  className?: string
}

function StatCard({ title, value, icon, change, changeLabel, className }: StatCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card className={cn('transition-shadow hover:shadow-sm', className)}>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        <div className='text-muted-foreground'>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {change !== undefined && (
          <div className='mt-1 flex items-center gap-1 text-xs'>
            {isPositive && (
              <>
                <MdArrowUpward className='h-3 w-3 text-green-500' />
                <span className='text-green-500'>+{change}%</span>
              </>
            )}
            {isNegative && (
              <>
                <MdArrowDownward className='h-3 w-3 text-red-500' />
                <span className='text-red-500'>{change}%</span>
              </>
            )}
            {change === 0 && <span className='text-muted-foreground'>No change</span>}
            {changeLabel && (
              <span className='text-muted-foreground'>{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsOverviewCards({
  stats,
  previousStats,
  className,
}: StatsOverviewCardsProps) {
  // Calculate changes if previous stats available
  const calculateChange = (current: number, previous?: number) => {
    if (!previous || previous === 0) return undefined
    return Math.round(((current - previous) / previous) * 100)
  }

  // Format response time
  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      <StatCard
        title='Messages Sent Today'
        value={stats.messagesSent.toLocaleString()}
        icon={<MdMessage className='h-4 w-4' />}
        change={calculateChange(stats.messagesSent, previousStats?.messagesSent)}
        changeLabel='vs average'
      />
      <StatCard
        title='Active Conversations'
        value={stats.activeChats}
        icon={<MdForum className='h-4 w-4' />}
        change={calculateChange(stats.activeChats, previousStats?.activeChats)}
        changeLabel='vs yesterday'
      />
      <StatCard
        title='Avg Response Time'
        value={formatResponseTime(stats.avgResponseTime)}
        icon={<MdAccessTime className='h-4 w-4' />}
        change={
          previousStats
            ? -calculateChange(stats.avgResponseTime, previousStats.avgResponseTime)!
            : undefined
        }
        changeLabel='faster is better'
      />
      <StatCard
        title='Resolution Rate'
        value={`${Math.round((stats.messagesRead / Math.max(stats.messagesSent, 1)) * 100)}%`}
        icon={<MdTrackChanges className='h-4 w-4' />}
      />
    </div>
  )
}
