'use client'

import { motion } from 'framer-motion'
import {
  MdDescription,
  MdAccessTime,
  MdError,
  MdPeople,
  MdCalendarToday,
  MdGavel,
  MdDirectionsCar,
  MdCheckCircle,
  MdAssignment,
  MdTranslate,
  MdSearch,
  MdInfo,
  MdWarning,
  MdArrowForward,
  MdCampaign,
} from 'react-icons/md'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from './stats-card'

// Mock data for staff dashboard - in production this would come from API
const staffStats = {
  assignedTasks: 8,
  assignedTasksChange: 12,
  completedToday: 5,
  completedTodayChange: 25,
  pendingRequests: 12,
  pendingRequestsChange: -8,
  avgResponseTime: 2.4,
  avgResponseTimeChange: -15,
}

const assignedTasks = [
  {
    id: '1',
    title: 'Translate auction sheet - 2022 Toyota Supra',
    type: 'translation',
    priority: 'high',
    dueIn: '2 hours',
    customer: 'John Smith',
  },
  {
    id: '2',
    title: 'Vehicle inspection - BMW M3 2023',
    type: 'inspection',
    priority: 'medium',
    dueIn: '4 hours',
    customer: 'Sarah Wilson',
  },
  {
    id: '3',
    title: 'Translate service records - Honda NSX',
    type: 'translation',
    priority: 'low',
    dueIn: '1 day',
    customer: 'Mike Davis',
  },
  {
    id: '4',
    title: 'Pre-purchase check - Mercedes G-Class',
    type: 'inspection',
    priority: 'urgent',
    dueIn: '1 hour',
    customer: 'Emily Johnson',
  },
]

const pendingRequests = [
  {
    id: '1',
    type: 'translation',
    title: 'Auction Sheet Translation',
    vehicle: '2021 Nissan GT-R',
    requestedAt: '30 min ago',
    status: 'unassigned',
  },
  {
    id: '2',
    type: 'inspection',
    title: 'Full Vehicle Inspection',
    vehicle: '2023 Lexus LX 600',
    requestedAt: '1 hour ago',
    status: 'unassigned',
  },
  {
    id: '3',
    type: 'translation',
    title: 'Import Documents Translation',
    vehicle: '2022 Mazda RX-7',
    requestedAt: '2 hours ago',
    status: 'unassigned',
  },
]

const quickActions = [
  { id: '1', label: 'New Bid Request', icon: 'gavel', href: '/bids' },
  { id: '2', label: 'Add Vehicle', icon: 'car', href: '/stock' },
  { id: '3', label: 'View Customers', icon: 'users', href: '/customers' },
  { id: '4', label: 'Auction Calendar', icon: 'calendar', href: '/auctions' },
]

const systemAnnouncements = [
  {
    id: '1',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sunday 2:00 AM - 4:00 AM JST',
    type: 'info',
    date: 'Dec 22',
  },
  {
    id: '2',
    title: 'New Feature Released',
    message: 'Bulk bid approval is now available for managers',
    type: 'success',
    date: 'Dec 18',
  },
  {
    id: '3',
    title: 'Holiday Schedule',
    message: 'Office closed Dec 28 - Jan 3 for New Year holidays',
    type: 'warning',
    date: 'Dec 15',
  },
]

export function StaffDashboard() {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant='red'>Urgent</Badge>
      case 'high':
        return <Badge variant='orange'>High</Badge>
      case 'medium':
        return <Badge variant='amber'>Medium</Badge>
      case 'low':
        return <Badge variant='green'>Low</Badge>
      default:
        return <Badge variant='zinc'>{priority}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'translation':
        return <MdTranslate className='h-4 w-4 text-blue-500' />
      case 'inspection':
        return <MdSearch className='h-4 w-4 text-purple-500' />
      default:
        return <MdDescription className='h-4 w-4 text-gray-500' />
    }
  }

  return (
    <div className='space-y-6'>
      {/* Staff Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Assigned Tasks'
          value={staffStats.assignedTasks}
          change={staffStats.assignedTasksChange}
          description='in your queue'
        />
        <StatsCard
          title='Completed Today'
          value={staffStats.completedToday}
          change={staffStats.completedTodayChange}
          description='tasks finished'
        />
        <StatsCard
          title='Pending Requests'
          value={staffStats.pendingRequests}
          change={staffStats.pendingRequestsChange}
          description='awaiting assignment'
        />
        <StatsCard
          title='Avg Response Time'
          value={staffStats.avgResponseTime}
          change={staffStats.avgResponseTimeChange}
          suffix=' hrs'
          description='this week'
        />
      </div>

      {/* Main Content Grid */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Assigned Tasks */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <MdAssignment className='h-5 w-5 text-purple-500' />
                  My Assigned Tasks
                </CardTitle>
                <CardDescription>Tasks assigned to you that need attention</CardDescription>
              </div>
              <Badge variant='secondary'>{assignedTasks.length} tasks</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {assignedTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50'
                >
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted'>
                    {getTypeIcon(task.type)}
                  </div>
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium'>{task.title}</p>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <MdPeople className='h-3 w-3' />
                      <span>{task.customer}</span>
                    </div>
                  </div>
                  <div className='text-right'>
                    {getPriorityBadge(task.priority)}
                    <p className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                      <MdAccessTime className='h-3 w-3' />
                      {task.dueIn}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <MdError className='h-5 w-5 text-orange-500' />
                  Unassigned Requests
                </CardTitle>
                <CardDescription>New requests waiting to be picked up</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {pendingRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='rounded-lg border p-3 transition-colors hover:bg-muted/50'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      {getTypeIcon(request.type)}
                      <span className='text-sm font-medium'>{request.title}</span>
                    </div>
                    <Badge variant='outline' className='text-xs'>
                      {request.requestedAt}
                    </Badge>
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>{request.vehicle}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MdArrowForward className='h-5 w-5 text-blue-500' />
              Quick Actions
            </CardTitle>
            <CardDescription>Common shortcuts to get things done</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-3'>
              {quickActions.map((action, index) => {
                const IconComponent = action.icon === 'gavel' ? MdGavel : action.icon === 'car' ? MdDirectionsCar : action.icon === 'users' ? MdPeople : MdCalendarToday
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={action.href}
                      className='flex items-center gap-3 rounded-lg border p-4 transition-all hover:bg-muted/50 hover:border-primary/50'
                    >
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                        <IconComponent className='h-5 w-5 text-primary' />
                      </div>
                      <span className='text-sm font-medium'>{action.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* System Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MdCampaign className='h-5 w-5 text-orange-500' />
              Announcements
            </CardTitle>
            <CardDescription>Important updates and notices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {systemAnnouncements.map((announcement, index) => {
                const TypeIcon = announcement.type === 'info' ? MdInfo : announcement.type === 'success' ? MdCheckCircle : MdWarning
                const typeColors = announcement.type === 'info'
                  ? 'text-blue-500 bg-blue-100 dark:bg-blue-950'
                  : announcement.type === 'success'
                  ? 'text-green-500 bg-green-100 dark:bg-green-950'
                  : 'text-amber-500 bg-amber-100 dark:bg-amber-950'

                return (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='rounded-lg border p-3'
                  >
                    <div className='flex items-start gap-3'>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${typeColors}`}>
                        <TypeIcon className='h-4 w-4' />
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-medium'>{announcement.title}</p>
                          <span className='text-xs text-muted-foreground'>{announcement.date}</span>
                        </div>
                        <p className='mt-1 text-xs text-muted-foreground'>{announcement.message}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
