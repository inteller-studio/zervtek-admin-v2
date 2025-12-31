'use client'

import { motion } from 'framer-motion'
import {
  MdGavel,
  MdDirectionsCar,
  MdCalendarToday,
  MdAccessTime,
  MdCheckCircle,
  MdError,
  MdSearch,
  MdTranslate,
  MdAssignment,
  MdDirectionsBoat,
  MdTrendingUp,
  MdTrendingDown,
} from 'react-icons/md'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Mock data - in production this would come from API
const backofficeStats = {
  pendingBids: 15,
  pendingBidsChange: 8,
  pendingInspections: 6,
  pendingInspectionsChange: -10,
  pendingTranslations: 12,
  pendingTranslationsChange: 5,
  completedToday: 18,
  completedTodayChange: 25,
}

const upcomingBids = [
  { id: '1', vehicle: '2023 Toyota Supra', auction: 'USS Tokyo', date: 'Dec 22', time: '10:30', customer: 'John Smith', maxBid: 3500000 },
  { id: '2', vehicle: '2022 Nissan GT-R', auction: 'HAA Kobe', date: 'Dec 22', time: '14:00', customer: 'Emily Davis', maxBid: 5200000 },
  { id: '3', vehicle: '2021 Honda NSX', auction: 'JAA', date: 'Dec 23', time: '09:00', customer: 'Mike Johnson', maxBid: 8500000 },
  { id: '4', vehicle: '2023 Lexus LC 500', auction: 'USS Nagoya', date: 'Dec 23', time: '11:30', customer: 'Sarah Wilson', maxBid: 4200000 },
  { id: '5', vehicle: '2022 Mazda RX-7', auction: 'TAA', date: 'Dec 24', time: '10:00', customer: 'David Kim', maxBid: 2800000 },
]

const pendingInspections = [
  { id: '1', vehicle: '2023 BMW M3', location: 'USS Tokyo Yard', requestedBy: 'Taro Yamada', requestedAt: '2 hours ago', priority: 'high' },
  { id: '2', vehicle: '2022 Mercedes AMG GT', location: 'HAA Kobe Yard', requestedBy: 'Yuki Tanaka', requestedAt: '4 hours ago', priority: 'medium' },
  { id: '3', vehicle: '2021 Porsche 911', location: 'JAA Yard', requestedBy: 'Kenji Sato', requestedAt: '6 hours ago', priority: 'low' },
  { id: '4', vehicle: '2023 Audi RS6', location: 'USS Nagoya Yard', requestedBy: 'Mika Honda', requestedAt: '1 day ago', priority: 'urgent' },
]

const pendingTranslations = [
  { id: '1', type: 'Auction Sheet', vehicle: '2023 Toyota Land Cruiser', requestedBy: 'John Smith', requestedAt: '30 min ago', pages: 2 },
  { id: '2', type: 'Service Records', vehicle: '2022 Lexus LX 600', requestedBy: 'Emily Davis', requestedAt: '1 hour ago', pages: 8 },
  { id: '3', type: 'Auction Sheet', vehicle: '2021 Nissan Patrol', requestedBy: 'Mike Johnson', requestedAt: '2 hours ago', pages: 2 },
  { id: '4', type: 'Import Documents', vehicle: '2023 Honda Civic Type R', requestedBy: 'Sarah Wilson', requestedAt: '3 hours ago', pages: 5 },
]

const recentlyPurchasedCars = [
  { id: '1', vehicle: '2023 Toyota Supra', purchasePrice: 3200000, auction: 'USS Tokyo', purchasedAt: '2 hours ago', status: 'awaiting_pickup' },
  { id: '2', vehicle: '2022 Nissan GT-R', purchasePrice: 4800000, auction: 'HAA Kobe', purchasedAt: '5 hours ago', status: 'in_yard' },
  { id: '3', vehicle: '2021 Honda NSX', purchasePrice: 7200000, auction: 'JAA', purchasedAt: '1 day ago', status: 'preparing_export' },
  { id: '4', vehicle: '2023 Lexus LC 500', purchasePrice: 3800000, auction: 'USS Nagoya', purchasedAt: '2 days ago', status: 'shipped' },
]

const myTasks = [
  { id: '1', task: 'Complete inspection report - BMW M3', type: 'inspection', dueIn: '2 hours', status: 'in_progress' },
  { id: '2', task: 'Translate auction sheet - Land Cruiser', type: 'translation', dueIn: '4 hours', status: 'pending' },
  { id: '3', task: 'Process export documents - GT-R', type: 'documents', dueIn: '1 day', status: 'pending' },
  { id: '4', task: 'Coordinate pickup - NSX', type: 'logistics', dueIn: '2 days', status: 'pending' },
]

const shippingCalendar = [
  { date: 'Dec 22', day: 'Today', events: [
    { type: 'departure', vehicle: '2023 Toyota Land Cruiser', port: 'Yokohama', destination: 'Los Angeles' },
    { type: 'arrival', vehicle: '2022 BMW X5', port: 'Southampton', destination: 'UK Customer' },
  ]},
  { date: 'Dec 24', day: 'Tue', events: [
    { type: 'loading', vehicle: '2022 Lexus LX 600', port: 'Nagoya', destination: 'Dubai' },
  ]},
  { date: 'Dec 26', day: 'Thu', events: [
    { type: 'departure', vehicle: '2021 Nissan GT-R', port: 'Osaka', destination: 'Sydney' },
    { type: 'departure', vehicle: '2023 Honda NSX', port: 'Yokohama', destination: 'Berlin' },
  ]},
  { date: 'Dec 28', day: 'Sat', events: [
    { type: 'arrival', vehicle: '2023 Toyota Supra', port: 'Los Angeles', destination: 'US Customer' },
  ]},
  { date: 'Jan 2', day: 'Thu', events: [
    { type: 'loading', vehicle: '2022 Mercedes AMG', port: 'Tokyo', destination: 'Vancouver' },
    { type: 'arrival', vehicle: '2021 Porsche 911', port: 'Rotterdam', destination: 'DE Customer' },
  ]},
]

function StatCard({ title, value, change, icon: Icon, iconColor }: {
  title: string
  value: number
  change: number
  icon: React.ElementType
  iconColor: string
}) {
  const isPositive = change >= 0
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? <MdTrendingUp className="h-3 w-3" /> : <MdTrendingDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  )
}

export function BackofficeDashboard() {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="red">Urgent</Badge>
      case 'high':
        return <Badge variant="orange">High</Badge>
      case 'medium':
        return <Badge variant="amber">Medium</Badge>
      case 'low':
        return <Badge variant="green">Low</Badge>
      default:
        return <Badge variant="zinc">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="blue">In Progress</Badge>
      case 'pending':
        return <Badge variant="amber">Pending</Badge>
      case 'completed':
        return <Badge variant="green">Completed</Badge>
      default:
        return <Badge variant="zinc">{status}</Badge>
    }
  }

  const getCarStatusBadge = (status: string) => {
    switch (status) {
      case 'awaiting_pickup':
        return <Badge variant="amber">Awaiting Pickup</Badge>
      case 'in_yard':
        return <Badge variant="blue">In Yard</Badge>
      case 'preparing_export':
        return <Badge variant="purple">Preparing Export</Badge>
      case 'shipped':
        return <Badge variant="green">Shipped</Badge>
      default:
        return <Badge variant="zinc">{status}</Badge>
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'departure':
        return 'bg-blue-500'
      case 'arrival':
        return 'bg-green-500'
      case 'loading':
        return 'bg-amber-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Bids"
          value={backofficeStats.pendingBids}
          change={backofficeStats.pendingBidsChange}
          icon={MdGavel}
          iconColor="bg-purple-100 text-purple-600 dark:bg-purple-950"
        />
        <StatCard
          title="Pending Inspections"
          value={backofficeStats.pendingInspections}
          change={backofficeStats.pendingInspectionsChange}
          icon={MdSearch}
          iconColor="bg-blue-100 text-blue-600 dark:bg-blue-950"
        />
        <StatCard
          title="Pending Translations"
          value={backofficeStats.pendingTranslations}
          change={backofficeStats.pendingTranslationsChange}
          icon={MdTranslate}
          iconColor="bg-orange-100 text-orange-600 dark:bg-orange-950"
        />
        <StatCard
          title="Completed Today"
          value={backofficeStats.completedToday}
          change={backofficeStats.completedTodayChange}
          icon={MdCheckCircle}
          iconColor="bg-green-100 text-green-600 dark:bg-green-950"
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bids */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdGavel className="h-5 w-5 text-purple-500" />
              Upcoming Bids
            </CardTitle>
            <CardDescription>Auctions requiring bidding action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingBids.map((bid, index) => (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{bid.vehicle}</p>
                    <p className="text-xs text-muted-foreground">{bid.auction} · {bid.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">¥{(bid.maxBid / 1000000).toFixed(1)}M max</p>
                    <p className="text-xs text-muted-foreground">{bid.date} {bid.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Inspections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdSearch className="h-5 w-5 text-blue-500" />
              Pending Inspections
            </CardTitle>
            <CardDescription>Vehicle inspections awaiting completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInspections.map((inspection, index) => (
                <motion.div
                  key={inspection.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{inspection.vehicle}</p>
                    <p className="text-xs text-muted-foreground">{inspection.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(inspection.priority)}
                    <span className="text-xs text-muted-foreground">{inspection.requestedAt}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Translations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdTranslate className="h-5 w-5 text-orange-500" />
              Pending Translations
            </CardTitle>
            <CardDescription>Documents awaiting translation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTranslations.map((translation, index) => (
                <motion.div
                  key={translation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{translation.type}</p>
                    <p className="text-xs text-muted-foreground">{translation.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{translation.pages} pages</Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{translation.requestedAt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recently Purchased Cars */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdDirectionsCar className="h-5 w-5 text-emerald-500" />
              Recently Purchased
            </CardTitle>
            <CardDescription>Cars won at auction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyPurchasedCars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{car.vehicle}</p>
                    <p className="text-xs text-muted-foreground">{car.auction} · {car.purchasedAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">¥{(car.purchasePrice / 1000000).toFixed(1)}M</p>
                    <div className="mt-1">{getCarStatusBadge(car.status)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdAssignment className="h-5 w-5 text-indigo-500" />
              My Tasks
            </CardTitle>
            <CardDescription>Your assigned work items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.task}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{task.type}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MdAccessTime className="h-3 w-3" />
                        {task.dueIn}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(task.status)}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdDirectionsBoat className="h-5 w-5 text-cyan-500" />
              Shipping Calendar
            </CardTitle>
            <CardDescription>Upcoming shipping events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shippingCalendar.map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-semibold">{day.date}</span>
                    <Badge variant={day.day === 'Today' ? 'default' : 'outline'} className="text-xs">
                      {day.day}
                    </Badge>
                  </div>
                  <div className="space-y-2 pl-2 border-l-2 border-muted">
                    {day.events.map((event, eventIndex) => (
                      <div key={eventIndex} className="flex items-center gap-2 pl-3">
                        <div className={`h-2 w-2 rounded-full ${getEventTypeColor(event.type)}`} />
                        <div className="flex-1">
                          <p className="text-xs">
                            <span className="font-medium">{event.vehicle}</span>
                            <span className="text-muted-foreground"> · {event.type} · {event.port}</span>
                          </p>
                        </div>
                      </div>
                    ))}
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
