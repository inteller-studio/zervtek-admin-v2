'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Users, Gavel, DollarSign, Car, FileText, RefreshCw, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useDashboardStats, useChartData, useRecentActivity } from '@/hooks/use-dashboard-data'
import { useDashboardStore } from '@/stores/dashboard-store'
import { StatsCard } from './components/stats-card'
import { DraggableChartsContainer } from './components/draggable-charts'

const statsConfig = [
  {
    key: 'totalUsers',
    title: 'Total Users',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  {
    key: 'activeAuctions',
    title: 'Active Auctions',
    icon: Gavel,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
  },
  {
    key: 'totalRevenue',
    title: 'Total Revenue',
    icon: DollarSign,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-950',
    prefix: '$',
  },
  {
    key: 'stockVehicles',
    title: 'Stock Vehicles',
    icon: Car,
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
  },
  {
    key: 'publishedBlogs',
    title: 'Published Blogs',
    icon: FileText,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-950',
  },
]

export function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats()
  const { data: chartData, isLoading: chartsLoading } = useChartData()
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity()
  const { resetWidgetOrder } = useDashboardStore()

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    return `${Math.floor(hours / 24)} days ago`
  }

  return (
    <>
      <Header fixed>
        <Search className='md:w-auto flex-1' />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>Dashboard</h1>
            <p className='text-muted-foreground'>Real-time overview of your auction platform</p>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                refetchStats()
              }}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
            <Button variant='outline' size='sm' onClick={resetWidgetOrder}>
              <Settings2 className='mr-2 h-4 w-4' />
              Reset Layout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          {statsConfig.map((config) => (
            <StatsCard
              key={config.key}
              title={config.title}
              value={stats?.[config.key as keyof typeof stats] || 0}
              change={(stats?.[`${config.key}Change` as keyof typeof stats] as number) || 0}
              loading={statsLoading}
              prefix={config.prefix}
            />
          ))}
        </div>

        {/* Draggable Charts */}
        <DraggableChartsContainer chartData={chartData} loading={chartsLoading} />

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your system</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className='space-y-4'>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className='flex items-center space-x-4'>
                    <Skeleton className='h-2 w-2 rounded-full bg-muted-foreground/20' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-3/4 bg-muted-foreground/20' />
                      <Skeleton className='h-3 w-1/4 bg-muted-foreground/20' />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence>
                <div className='space-y-4'>
                  {activities?.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className='flex items-center space-x-4'
                    >
                      <div className='bg-primary h-2 w-2 animate-pulse rounded-full' />
                      <div className='flex-1 space-y-1'>
                        <p className='text-sm'>
                          <span className='font-medium'>{activity.user}</span> {activity.action}
                          {activity.item && (
                            <span className='text-muted-foreground'> on {activity.item}</span>
                          )}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
