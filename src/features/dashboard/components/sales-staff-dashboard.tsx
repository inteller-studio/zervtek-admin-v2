'use client'

import { motion } from 'framer-motion'
import {
  MdAttachMoney,
  MdTrendingUp,
  MdPeople,
  MdGavel,
  MdDirectionsCar,
  MdPublic,
  MdShoppingCart,
  MdPersonAdd,
  MdPersonOff,
  MdTrendingDown,
} from 'react-icons/md'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Mock data - in production this would come from API
const salesStats = {
  totalRevenue: 12500000,
  revenueChange: 18,
  totalSales: 24,
  salesChange: 12,
  avgDealSize: 520833,
  avgDealSizeChange: 8,
  conversionRate: 32,
  conversionRateChange: 5,
}

const countriesSoldTo = [
  { country: 'United States', code: 'US', sales: 8, revenue: 4200000, percentage: 34 },
  { country: 'United Kingdom', code: 'GB', sales: 5, revenue: 2800000, percentage: 22 },
  { country: 'Australia', code: 'AU', sales: 4, revenue: 2100000, percentage: 17 },
  { country: 'Germany', code: 'DE', sales: 3, revenue: 1600000, percentage: 13 },
  { country: 'Canada', code: 'CA', sales: 2, revenue: 1000000, percentage: 8 },
  { country: 'Others', code: 'XX', sales: 2, revenue: 800000, percentage: 6 },
]

const recentSales = [
  { id: '1', vehicle: '2023 Toyota Supra', customer: 'John Smith', country: 'US', amount: 580000, date: '2 hours ago' },
  { id: '2', vehicle: '2022 Nissan GT-R', customer: 'Emily Davis', country: 'UK', amount: 720000, date: '5 hours ago' },
  { id: '3', vehicle: '2021 Honda NSX', customer: 'Mike Johnson', country: 'AU', amount: 890000, date: '1 day ago' },
  { id: '4', vehicle: '2023 Lexus LC 500', customer: 'Sarah Wilson', country: 'DE', amount: 450000, date: '2 days ago' },
]

const customerBids = [
  { id: '1', customer: 'John Smith', vehicle: '2022 BMW M3', bidAmount: 320000, status: 'pending', time: '30 min ago' },
  { id: '2', customer: 'Emily Davis', vehicle: '2023 Mercedes AMG', bidAmount: 580000, status: 'active', time: '1 hour ago' },
  { id: '3', customer: 'Mike Johnson', vehicle: '2021 Porsche 911', bidAmount: 720000, status: 'won', time: '2 hours ago' },
  { id: '4', customer: 'Sarah Wilson', vehicle: '2022 Audi RS6', bidAmount: 450000, status: 'pending', time: '3 hours ago' },
]

const stockRequests = [
  { id: '1', customer: 'John Smith', vehicle: '2023 Toyota Land Cruiser', status: 'new', date: '1 hour ago' },
  { id: '2', customer: 'Emily Davis', vehicle: '2022 Lexus LX 600', status: 'reviewing', date: '3 hours ago' },
  { id: '3', customer: 'Mike Johnson', vehicle: '2023 Nissan Patrol', status: 'new', date: '5 hours ago' },
]

const newSignups = [
  { id: '1', name: 'Robert Chen', email: 'robert@email.com', country: 'US', date: '2 hours ago' },
  { id: '2', name: 'Lisa Park', email: 'lisa@email.com', country: 'AU', date: '5 hours ago' },
  { id: '3', name: 'David Kim', email: 'david@email.com', country: 'CA', date: '1 day ago' },
]

const customersWithNoAgent = [
  { id: '1', name: 'Alex Turner', email: 'alex@email.com', country: 'UK', registeredAt: '3 days ago' },
  { id: '2', name: 'Maria Garcia', email: 'maria@email.com', country: 'ES', registeredAt: '5 days ago' },
  { id: '3', name: 'James Lee', email: 'james@email.com', country: 'US', registeredAt: '1 week ago' },
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

export function SalesStaffDashboard() {
  const getBidStatusBadge = (status: string) => {
    switch (status) {
      case 'won':
        return <Badge variant="green">Won</Badge>
      case 'active':
        return <Badge variant="blue">Active</Badge>
      case 'pending':
        return <Badge variant="amber">Pending</Badge>
      default:
        return <Badge variant="zinc">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={salesStats.totalRevenue} change={salesStats.revenueChange} prefix="¥" />
        <StatCard title="Total Sales" value={salesStats.totalSales} change={salesStats.salesChange} />
        <StatCard title="Avg Deal Size" value={salesStats.avgDealSize} change={salesStats.avgDealSizeChange} prefix="¥" />
        <StatCard title="Conversion Rate" value={salesStats.conversionRate} change={salesStats.conversionRateChange} suffix="%" />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Countries Sold To */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPublic className="h-5 w-5 text-blue-500" />
              Countries Sold To
            </CardTitle>
            <CardDescription>Sales distribution by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {countriesSoldTo.map((country, index) => (
                <motion.div
                  key={country.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{country.country}</span>
                    <span className="text-muted-foreground">{country.sales} sales · ¥{(country.revenue / 1000000).toFixed(1)}M</span>
                  </div>
                  <Progress value={country.percentage} className="h-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdTrendingUp className="h-5 w-5 text-emerald-500" />
              Recent Sales
            </CardTitle>
            <CardDescription>Your latest closed deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.map((sale, index) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{sale.vehicle}</p>
                    <p className="text-xs text-muted-foreground">{sale.customer} · {sale.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">¥{sale.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{sale.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Bids */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdGavel className="h-5 w-5 text-purple-500" />
              Customer Bids
            </CardTitle>
            <CardDescription>Bids placed by your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customerBids.map((bid, index) => (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{bid.vehicle}</p>
                    <p className="text-xs text-muted-foreground">{bid.customer} · {bid.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold">¥{bid.bidAmount.toLocaleString()}</p>
                    {getBidStatusBadge(bid.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Purchase Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdShoppingCart className="h-5 w-5 text-orange-500" />
              Stock Purchase Requests
            </CardTitle>
            <CardDescription>Customer requests for stock vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stockRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{request.vehicle}</p>
                    <p className="text-xs text-muted-foreground">{request.customer}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={request.status === 'new' ? 'blue' : 'amber'}>{request.status}</Badge>
                    <span className="text-xs text-muted-foreground">{request.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New Customer Sign-ups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPersonAdd className="h-5 w-5 text-green-500" />
              New Sign-ups (Under You)
            </CardTitle>
            <CardDescription>Customers who signed up under your referral</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {newSignups.map((signup, index) => (
                <motion.div
                  key={signup.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                      <MdPeople className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{signup.name}</p>
                      <p className="text-xs text-muted-foreground">{signup.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{signup.country}</Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{signup.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customers with No Agent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPersonOff className="h-5 w-5 text-red-500" />
              Customers Without Agent
            </CardTitle>
            <CardDescription>Unassigned customers you can claim</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customersWithNoAgent.map((customer, index) => (
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
