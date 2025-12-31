'use client'

import { motion } from 'framer-motion'
import {
  MdAttachMoney,
  MdTrendingUp,
  MdPeople,
  MdCalendarToday,
  MdBarChart,
  MdAccessTime,
  MdCheckCircle,
  MdError,
  MdDirectionsBoat,
  MdAssignment,
  MdCreditCard,
  MdPersonOff,
  MdTrendingDown,
} from 'react-icons/md'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Mock data - in production this would come from API
const managerStats = {
  totalRevenue: 45000000,
  revenueChange: 22,
  teamSales: 86,
  teamSalesChange: 15,
  vehiclesShipping: 12,
  vehiclesShippingChange: 8,
  pendingPayments: 8500000,
  pendingPaymentsChange: -12,
}

const teamPerformance = [
  { id: '1', name: 'Taro Yamada', sales: 18, revenue: 9200000, target: 10000000, avatar: 'TY' },
  { id: '2', name: 'Yuki Tanaka', sales: 15, revenue: 7800000, target: 8000000, avatar: 'YT' },
  { id: '3', name: 'Kenji Sato', sales: 14, revenue: 7200000, target: 8000000, avatar: 'KS' },
  { id: '4', name: 'Mika Honda', sales: 12, revenue: 6500000, target: 7000000, avatar: 'MH' },
  { id: '5', name: 'Ryu Suzuki', sales: 11, revenue: 5800000, target: 7000000, avatar: 'RS' },
]

const vehiclesBeingShipped = [
  { id: '1', vehicle: '2023 Toyota Land Cruiser', customer: 'John Smith', destination: 'USA', eta: 'Dec 28', status: 'in_transit' },
  { id: '2', vehicle: '2022 Lexus LX 600', customer: 'Emily Davis', destination: 'UK', eta: 'Dec 30', status: 'in_transit' },
  { id: '3', vehicle: '2023 Nissan GT-R', customer: 'Mike Johnson', destination: 'Australia', eta: 'Jan 2', status: 'loading' },
  { id: '4', vehicle: '2022 Honda NSX', customer: 'Sarah Wilson', destination: 'Germany', eta: 'Jan 5', status: 'pending' },
]

const backofficeTasks = [
  { id: '1', task: 'Auction sheet translation', assignee: 'Backoffice Team', count: 8, priority: 'high' },
  { id: '2', task: 'Vehicle inspections', assignee: 'Inspection Team', count: 5, priority: 'medium' },
  { id: '3', task: 'Document processing', assignee: 'Admin Team', count: 12, priority: 'low' },
  { id: '4', task: 'Export paperwork', assignee: 'Shipping Team', count: 6, priority: 'high' },
]

const paymentsDue = [
  { id: '1', customer: 'John Smith', vehicle: '2023 Toyota Supra', amount: 580000, dueDate: 'Dec 24', status: 'overdue' },
  { id: '2', customer: 'Emily Davis', vehicle: '2022 BMW M3', amount: 720000, dueDate: 'Dec 26', status: 'due_soon' },
  { id: '3', customer: 'Mike Johnson', vehicle: '2021 Porsche 911', amount: 890000, dueDate: 'Dec 28', status: 'pending' },
  { id: '4', customer: 'Sarah Wilson', vehicle: '2023 Mercedes AMG', amount: 650000, dueDate: 'Jan 2', status: 'pending' },
]

const shippingTimeline = [
  { id: '1', date: 'Dec 22', events: [{ vehicle: 'Toyota Land Cruiser', type: 'departure', port: 'Yokohama' }] },
  { id: '2', date: 'Dec 24', events: [{ vehicle: 'Lexus LX 600', type: 'arrival', port: 'Southampton' }] },
  { id: '3', date: 'Dec 26', events: [{ vehicle: 'Nissan GT-R', type: 'loading', port: 'Nagoya' }] },
  { id: '4', date: 'Dec 28', events: [{ vehicle: 'Honda NSX', type: 'departure', port: 'Osaka' }, { vehicle: 'BMW M3', type: 'arrival', port: 'Los Angeles' }] },
]

const seoAnalytics = {
  organicTraffic: 45200,
  trafficChange: 18,
  topKeywords: ['Japanese cars export', 'JDM vehicles', 'Toyota Land Cruiser Japan', 'Lexus export'],
  pageViews: 128000,
  pageViewsChange: 12,
  bounceRate: 42,
  bounceRateChange: -5,
}

const unassignedCustomers = [
  { id: '1', name: 'Alex Turner', email: 'alex@email.com', country: 'UK', registeredAt: '2 days ago' },
  { id: '2', name: 'Maria Garcia', email: 'maria@email.com', country: 'Spain', registeredAt: '3 days ago' },
  { id: '3', name: 'James Lee', email: 'james@email.com', country: 'USA', registeredAt: '4 days ago' },
  { id: '4', name: 'Sophie Martin', email: 'sophie@email.com', country: 'France', registeredAt: '5 days ago' },
]

function StatCard({ title, value, change, prefix = '', suffix = '' }: {
  title: string
  value: number
  change: number
  prefix?: string
  suffix?: string
}) {
  const isPositive = change >= 0
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? <MdTrendingUp className="h-3 w-3" /> : <MdTrendingDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold">
          {prefix}{typeof value === 'number' && value > 1000 ? `¥${(value / 1000000).toFixed(1)}M` : value}{suffix}
        </p>
      </CardContent>
    </Card>
  )
}

export function ManagerDashboard() {
  const getShippingStatusBadge = (status: string) => {
    switch (status) {
      case 'in_transit':
        return <Badge variant="blue">In Transit</Badge>
      case 'loading':
        return <Badge variant="amber">Loading</Badge>
      case 'pending':
        return <Badge variant="zinc">Pending</Badge>
      default:
        return <Badge variant="zinc">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="red">Overdue</Badge>
      case 'due_soon':
        return <Badge variant="amber">Due Soon</Badge>
      case 'pending':
        return <Badge variant="zinc">Pending</Badge>
      default:
        return <Badge variant="zinc">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="red">High</Badge>
      case 'medium':
        return <Badge variant="amber">Medium</Badge>
      case 'low':
        return <Badge variant="green">Low</Badge>
      default:
        return <Badge variant="zinc">{priority}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={managerStats.totalRevenue} change={managerStats.revenueChange} prefix="¥" />
        <StatCard title="Team Sales" value={managerStats.teamSales} change={managerStats.teamSalesChange} suffix=" units" />
        <StatCard title="Vehicles Shipping" value={managerStats.vehiclesShipping} change={managerStats.vehiclesShippingChange} />
        <StatCard title="Pending Payments" value={managerStats.pendingPayments} change={managerStats.pendingPaymentsChange} prefix="¥" />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPeople className="h-5 w-5 text-blue-500" />
              Team Performance
            </CardTitle>
            <CardDescription>Sales performance by team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">¥{(member.revenue / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-muted-foreground">/ ¥{(member.target / 1000000).toFixed(0)}M target</p>
                    </div>
                  </div>
                  <Progress value={(member.revenue / member.target) * 100} className="h-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Being Shipped */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdDirectionsBoat className="h-5 w-5 text-cyan-500" />
              Vehicles Being Shipped
            </CardTitle>
            <CardDescription>Current shipment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehiclesBeingShipped.map((shipment, index) => (
                <motion.div
                  key={shipment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{shipment.vehicle}</p>
                    <p className="text-xs text-muted-foreground">{shipment.customer} · {shipment.destination}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getShippingStatusBadge(shipment.status)}
                    <span className="text-xs text-muted-foreground">ETA: {shipment.eta}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Backoffice Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdAssignment className="h-5 w-5 text-purple-500" />
              Backoffice Tasks
            </CardTitle>
            <CardDescription>Team workload overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backofficeTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.assignee}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{task.count} pending</Badge>
                    {getPriorityBadge(task.priority)}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payments Due */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdCreditCard className="h-5 w-5 text-emerald-500" />
              Payments Due
            </CardTitle>
            <CardDescription>Upcoming and overdue payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentsDue.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{payment.customer}</p>
                    <p className="text-xs text-muted-foreground">{payment.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">¥{payment.amount.toLocaleString()}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {getPaymentStatusBadge(payment.status)}
                      <span className="text-xs text-muted-foreground">{payment.dueDate}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdCalendarToday className="h-5 w-5 text-orange-500" />
              Shipping Timeline
            </CardTitle>
            <CardDescription>Upcoming shipping events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shippingTimeline.map((day, index) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-6"
                >
                  <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-primary" />
                  {index < shippingTimeline.length - 1 && (
                    <div className="absolute left-[5px] top-4 h-full w-0.5 bg-border" />
                  )}
                  <p className="text-sm font-semibold">{day.date}</p>
                  <div className="mt-1 space-y-1">
                    {day.events.map((event, eventIndex) => (
                      <p key={eventIndex} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{event.vehicle}</span> · {event.type} at {event.port}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdBarChart className="h-5 w-5 text-pink-500" />
              SEO Analytics
            </CardTitle>
            <CardDescription>Website performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Organic Traffic</p>
                  <p className="text-lg font-bold">{(seoAnalytics.organicTraffic / 1000).toFixed(1)}K</p>
                  <p className={`text-xs ${seoAnalytics.trafficChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {seoAnalytics.trafficChange >= 0 ? '+' : ''}{seoAnalytics.trafficChange}%
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Page Views</p>
                  <p className="text-lg font-bold">{(seoAnalytics.pageViews / 1000).toFixed(0)}K</p>
                  <p className={`text-xs ${seoAnalytics.pageViewsChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {seoAnalytics.pageViewsChange >= 0 ? '+' : ''}{seoAnalytics.pageViewsChange}%
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Bounce Rate</p>
                  <p className="text-lg font-bold">{seoAnalytics.bounceRate}%</p>
                  <p className={`text-xs ${seoAnalytics.bounceRateChange <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {seoAnalytics.bounceRateChange}%
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Top Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {seoAnalytics.topKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unassigned Customers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPersonOff className="h-5 w-5 text-red-500" />
              Customers Without Agent
            </CardTitle>
            <CardDescription>New signups that need to be assigned to sales staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {unassignedCustomers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border border-dashed p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                      <MdPersonOff className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{customer.country}</Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{customer.registeredAt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
