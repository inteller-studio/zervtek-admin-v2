'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  MdPeople,
  MdGavel,
  MdAttachMoney,
  MdDirectionsCar,
  MdDescription,
  MdRefresh,
  MdTune,
} from 'react-icons/md'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useDashboardStats, useChartData, useRecentActivity } from '@/hooks/use-dashboard-data'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useAuthStore } from '@/stores/auth-store'
import { StatsCard } from './components/stats-card'
import { DraggableChartsContainer } from './components/draggable-charts'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { useRBAC } from '@/hooks/use-rbac'
import { ROLES } from '@/lib/rbac/types'
import { ManagerDashboard } from './components/manager-dashboard'
import { SalesStaffDashboard } from './components/sales-staff-dashboard'
import { BackofficeDashboard } from './components/backoffice-dashboard'
import { ContentManagerDashboard } from './components/content-manager-dashboard'

const statsConfig = [
  {
    key: 'totalUsers',
    title: 'Total Users',
    icon: MdPeople,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  {
    key: 'activeAuctions',
    title: 'Active Auctions',
    icon: MdGavel,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
  },
  {
    key: 'totalRevenue',
    title: 'Total Revenue',
    icon: MdAttachMoney,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-950',
    prefix: '$',
  },
  {
    key: 'stockVehicles',
    title: 'Stock Vehicles',
    icon: MdDirectionsCar,
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
  },
  {
    key: 'publishedBlogs',
    title: 'Published Blogs',
    icon: MdDescription,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-950',
  },
]

// Helper function to get time-based greeting
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Helper function to get dashboard title and subtitle based on role
function getDashboardInfo(roles: string[], firstName?: string) {
  const greeting = getGreeting()
  const name = firstName || 'there'

  if (roles.includes(ROLES.MANAGER)) {
    return { title: `${greeting}, ${name}`, subtitle: 'Team performance and business overview' }
  }
  if (roles.includes(ROLES.SALES_STAFF)) {
    return { title: `${greeting}, ${name}`, subtitle: 'Your sales performance and customer activity' }
  }
  if (roles.includes(ROLES.BACKOFFICE_STAFF)) {
    return { title: `${greeting}, ${name}`, subtitle: 'Tasks, inspections, and operations overview' }
  }
  if (roles.includes(ROLES.CONTENT_MANAGER)) {
    return { title: `${greeting}, ${name}`, subtitle: 'SEO performance and content analytics' }
  }
  if (roles.includes(ROLES.ACCOUNTANT)) {
    return { title: `${greeting}, ${name}`, subtitle: 'Financial overview and payment tracking' }
  }
  return { title: `${greeting}, ${name}`, subtitle: 'Real-time overview of your auction platform' }
}

// Role-specific dashboard content component
function RoleDashboardContent({ roles }: { roles: string[] }) {
  // Check roles in order of specificity
  // Manager gets their specialized dashboard
  if (roles.includes(ROLES.MANAGER) && !roles.includes(ROLES.ADMIN)) {
    return <ManagerDashboard />
  }

  // Sales staff gets their specialized dashboard
  if (roles.includes(ROLES.SALES_STAFF)) {
    return <SalesStaffDashboard />
  }

  // Backoffice staff gets their specialized dashboard
  if (roles.includes(ROLES.BACKOFFICE_STAFF)) {
    return <BackofficeDashboard />
  }

  // Content manager gets their specialized dashboard
  if (roles.includes(ROLES.CONTENT_MANAGER)) {
    return <ContentManagerDashboard />
  }

  // Accountant gets the manager dashboard (finance-focused) for now
  if (roles.includes(ROLES.ACCOUNTANT)) {
    return <ManagerDashboard />
  }

  // Admin and other roles get the full admin dashboard
  return null // Will render the default admin dashboard
}

export function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats()
  const { data: chartData, isLoading: chartsLoading } = useChartData()
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity()
  const { resetWidgetOrder } = useDashboardStore()
  const { roles, isAdmin } = useRBAC()
  const user = useAuthStore((state) => state.auth.user)

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    return `${Math.floor(hours / 24)} days ago`
  }

  const { title, subtitle } = getDashboardInfo(roles, user?.firstName)

  // Check if user should see a role-specific dashboard
  const showRoleDashboard = !isAdmin && (
    roles.includes(ROLES.MANAGER) ||
    roles.includes(ROLES.SALES_STAFF) ||
    roles.includes(ROLES.BACKOFFICE_STAFF) ||
    roles.includes(ROLES.CONTENT_MANAGER) ||
    roles.includes(ROLES.ACCOUNTANT)
  )

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <NotificationBell />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{title}</h1>
            <p className='text-muted-foreground'>
              {subtitle}
            </p>
          </div>
          {/* Only show these controls for admin dashboard */}
          {!showRoleDashboard && (
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  refetchStats()
                }}
              >
                <MdRefresh className='mr-2 h-4 w-4' />
                Refresh
              </Button>
              <Button variant='outline' size='sm' onClick={resetWidgetOrder}>
                <MdTune className='mr-2 h-4 w-4' />
                Reset Layout
              </Button>
            </div>
          )}
        </div>

        {/* Role-specific dashboard content */}
        {showRoleDashboard ? (
          <RoleDashboardContent roles={roles} />
        ) : (
          <>
            {/* Stats Cards - Admin Dashboard */}
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
          </>
        )}
      </Main>
    </>
  )
}
