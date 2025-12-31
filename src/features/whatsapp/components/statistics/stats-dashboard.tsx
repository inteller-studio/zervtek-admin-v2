'use client'

import { useState } from 'react'
import { subDays, startOfDay, endOfDay } from 'date-fns'
import { MdBarChart, MdLock, MdPeople } from 'react-icons/md'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedTabs, AnimatedTabsContent, type TabItem } from '@/components/ui/animated-tabs'
import { cn } from '@/lib/utils'
import type { EnhancedWhatsAppStats, StaffPerformance, StatsDateRange, StaffRole } from '../../types'
import { StatsDateRangeFilter } from './stats-date-range-filter'
import { StatsOverviewCards } from './stats-overview-cards'
import { TeamPerformanceTable } from './team-performance-table'

interface StatsDashboardProps {
  stats: EnhancedWhatsAppStats
  teamPerformance?: StaffPerformance[]
  userRole: StaffRole
  userId?: string
  onDateRangeChange?: (range: StatsDateRange) => void
  className?: string
}

export function StatsDashboard({
  stats,
  teamPerformance,
  userRole,
  userId,
  onDateRangeChange,
  className,
}: StatsDashboardProps) {
  const [dateRange, setDateRange] = useState<StatsDateRange>({
    from: startOfDay(subDays(new Date(), 6)),
    to: endOfDay(new Date()),
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'team'>('overview')

  // Determine what the user can see based on role
  const canSeeTeamStats = userRole === 'admin' || userRole === 'manager'
  const canSeeAllStats = userRole === 'admin'

  // Filter team performance based on role
  const visibleTeamPerformance = teamPerformance
    ? canSeeAllStats
      ? teamPerformance
      : teamPerformance.filter(
          (p) =>
            p.staff.id === userId ||
            (userRole === 'manager' &&
              (p.staff.role === 'sales_staff' || p.staff.role === 'support_staff'))
        )
    : []

  // Get user's own stats if available
  const myStats = teamPerformance?.find((p) => p.staff.id === userId)

  const handleDateRangeChange = (range: StatsDateRange) => {
    setDateRange(range)
    onDateRangeChange?.(range)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold'>Statistics</h2>
          <p className='text-sm text-muted-foreground'>
            {canSeeAllStats
              ? 'Overview of all WhatsApp activity'
              : canSeeTeamStats
                ? 'Your team performance overview'
                : 'Your performance overview'}
          </p>
        </div>
        <StatsDateRangeFilter value={dateRange} onValueChange={handleDateRangeChange} />
      </div>

      {/* Tabs for different views */}
      <AnimatedTabs
        tabs={[
          { id: 'overview', label: 'Overview', icon: MdBarChart },
          ...(canSeeTeamStats ? [{ id: 'team', label: 'Team', icon: MdPeople }] : []),
        ] as TabItem[]}
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'overview' | 'team')}
        variant='compact'
      >
        <AnimatedTabsContent value='overview' className='mt-4 space-y-6'>
          {/* Overview cards */}
          <StatsOverviewCards stats={stats} />

          {/* My performance (for non-admins) */}
          {myStats && !canSeeAllStats && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>My Performance</CardTitle>
                <CardDescription>Your personal stats for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 md:grid-cols-4'>
                  <StatBox label='Messages Sent' value={myStats.messagesSent.toLocaleString()} />
                  <StatBox
                    label='Avg Response Time'
                    value={formatResponseTime(myStats.avgResponseTime)}
                  />
                  <StatBox label='Active Chats' value={myStats.activeChats} />
                  <StatBox label='Resolution Rate' value={`${myStats.resolutionRate}%`} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Placeholder for charts */}
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Messages Over Time</CardTitle>
              </CardHeader>
              <CardContent className='h-[200px] p-4'>
                <div className='flex h-full flex-col items-end justify-end gap-1'>
                  <div className='flex w-full items-end gap-1'>
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                      <div
                        key={i}
                        className='flex-1 rounded-t bg-primary/20 transition-all hover:bg-primary/30'
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <p className='mt-2 text-xs text-muted-foreground'>Chart data will appear here</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Conversations by Label</CardTitle>
              </CardHeader>
              <CardContent className='h-[200px] p-4'>
                <div className='flex h-full items-center justify-center'>
                  <div className='relative h-32 w-32'>
                    <div className='absolute inset-0 rounded-full border-8 border-primary/20' />
                    <div className='absolute inset-0 rounded-full border-8 border-transparent border-t-green-400 border-r-blue-400 border-b-amber-400' style={{ transform: 'rotate(-45deg)' }} />
                    <div className='absolute inset-4 rounded-full bg-background' />
                  </div>
                </div>
                <p className='mt-2 text-center text-xs text-muted-foreground'>Chart data will appear here</p>
              </CardContent>
            </Card>
          </div>
        </AnimatedTabsContent>

        {canSeeTeamStats && (
          <AnimatedTabsContent value='team' className='mt-4 space-y-6'>
            {visibleTeamPerformance.length > 0 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Team Performance</CardTitle>
                    <CardDescription>
                      {canSeeAllStats
                        ? 'Performance metrics for all team members'
                        : 'Performance metrics for your team'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TeamPerformanceTable data={visibleTeamPerformance} />
                  </CardContent>
                </Card>

                {/* Team summary */}
                <div className='grid gap-4 md:grid-cols-3'>
                  <StatSummaryCard
                    title='Top Performer'
                    value={getTopPerformer(visibleTeamPerformance, 'messagesSent')}
                    description='Most messages sent'
                  />
                  <StatSummaryCard
                    title='Fastest Response'
                    value={getTopPerformer(visibleTeamPerformance, 'avgResponseTime', 'lowest')}
                    description='Best average response time'
                  />
                  <StatSummaryCard
                    title='Best Resolution'
                    value={getTopPerformer(visibleTeamPerformance, 'resolutionRate')}
                    description='Highest resolution rate'
                  />
                </div>
              </>
            ) : (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <MdLock className='h-12 w-12 text-muted-foreground/50' />
                  <p className='mt-4 text-sm font-medium'>No team data available</p>
                  <p className='text-sm text-muted-foreground'>
                    Team performance data will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </AnimatedTabsContent>
        )}
      </AnimatedTabs>
    </div>
  )
}

// Helper components
function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className='rounded-lg border bg-muted/50 p-3 transition-shadow hover:shadow-sm'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='text-lg font-semibold'>{value}</p>
    </div>
  )
}

function StatSummaryCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <Card>
      <CardContent className='pt-6'>
        <p className='text-sm text-muted-foreground'>{title}</p>
        <p className='mt-1 text-xl font-semibold'>{value}</p>
        <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
      </CardContent>
    </Card>
  )
}

// Helper functions
function formatResponseTime(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function getTopPerformer(
  data: StaffPerformance[],
  metric: keyof StaffPerformance,
  order: 'highest' | 'lowest' = 'highest'
): string {
  if (data.length === 0) return 'N/A'

  const sorted = [...data].sort((a, b) => {
    const aVal = a[metric] as number
    const bVal = b[metric] as number
    return order === 'highest' ? bVal - aVal : aVal - bVal
  })

  const top = sorted[0]
  return `${top.staff.firstName} ${top.staff.lastName}`
}
