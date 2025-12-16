'use client'

import { motion } from 'framer-motion'
import {
  Gavel,
  ShoppingCart,
  Clock,
  Trophy,
  TrendingUp,
  Calendar,
  Car,
  DollarSign,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatsCard } from './stats-card'

// Mock data for user dashboard - in production this would come from API
const userStats = {
  activeBids: 5,
  activeBidsChange: 25,
  wonAuctions: 12,
  wonAuctionsChange: 8,
  totalSpent: 145000,
  totalSpentChange: 15,
  watchlist: 8,
  watchlistChange: -10,
}

const recentBids = [
  {
    id: '1',
    vehicle: '2022 Toyota Land Cruiser',
    currentBid: 45000,
    yourBid: 44500,
    status: 'outbid',
    endsIn: '2 hours',
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=100&h=60&fit=crop',
  },
  {
    id: '2',
    vehicle: '2021 Mercedes-Benz G-Class',
    currentBid: 85000,
    yourBid: 85000,
    status: 'winning',
    endsIn: '5 hours',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=100&h=60&fit=crop',
  },
  {
    id: '3',
    vehicle: '2023 BMW X5',
    currentBid: 52000,
    yourBid: 51000,
    status: 'outbid',
    endsIn: '1 day',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100&h=60&fit=crop',
  },
]

const upcomingAuctions = [
  {
    id: '1',
    vehicle: '2023 Porsche 911 Carrera',
    startingBid: 95000,
    startsIn: '3 hours',
    interested: 24,
  },
  {
    id: '2',
    vehicle: '2022 Range Rover Sport',
    startingBid: 68000,
    startsIn: '6 hours',
    interested: 18,
  },
  {
    id: '3',
    vehicle: '2021 Audi RS6 Avant',
    startingBid: 78000,
    startsIn: '1 day',
    interested: 31,
  },
]

const wonAuctions = [
  {
    id: '1',
    vehicle: '2020 Lexus LX 570',
    finalPrice: 62000,
    date: '2024-01-15',
    status: 'delivered',
  },
  {
    id: '2',
    vehicle: '2022 Tesla Model S',
    finalPrice: 58000,
    date: '2024-01-10',
    status: 'in_transit',
  },
]

export function UserDashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'winning':
        return <Badge className='bg-green-100 text-green-700'>Winning</Badge>
      case 'outbid':
        return <Badge className='bg-red-100 text-red-700'>Outbid</Badge>
      case 'delivered':
        return <Badge className='bg-blue-100 text-blue-700'>Delivered</Badge>
      case 'in_transit':
        return <Badge className='bg-yellow-100 text-yellow-700'>In Transit</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  return (
    <div className='space-y-6'>
      {/* User Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Active Bids'
          value={userStats.activeBids}
          change={userStats.activeBidsChange}
          description='current auctions'
        />
        <StatsCard
          title='Won Auctions'
          value={userStats.wonAuctions}
          change={userStats.wonAuctionsChange}
          description='all time'
        />
        <StatsCard
          title='Total Spent'
          value={userStats.totalSpent}
          change={userStats.totalSpentChange}
          prefix='$'
          description='this year'
        />
        <StatsCard
          title='Watchlist'
          value={userStats.watchlist}
          change={userStats.watchlistChange}
          description='vehicles saved'
        />
      </div>

      {/* Main Content Grid */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Active Bids */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Gavel className='h-5 w-5 text-purple-500' />
                  Your Active Bids
                </CardTitle>
                <CardDescription>Monitor your current auction participation</CardDescription>
              </div>
              <Badge variant='secondary'>{recentBids.length} active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentBids.map((bid, index) => (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50'
                >
                  <img
                    src={bid.image}
                    alt={bid.vehicle}
                    className='h-12 w-20 rounded-md object-cover'
                  />
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium'>{bid.vehicle}</p>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span>Your bid: ${bid.yourBid.toLocaleString()}</span>
                      <span>•</span>
                      <span>Current: ${bid.currentBid.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className='text-right'>
                    {getStatusBadge(bid.status)}
                    <p className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                      <Clock className='h-3 w-3' />
                      {bid.endsIn}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Auctions */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5 text-blue-500' />
                  Upcoming Auctions
                </CardTitle>
                <CardDescription>Auctions starting soon from your watchlist</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {upcomingAuctions.map((auction, index) => (
                <motion.div
                  key={auction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='rounded-lg border p-3 transition-colors hover:bg-muted/50'
                >
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>{auction.vehicle}</p>
                      <p className='text-xs text-muted-foreground'>
                        Starting bid: ${auction.startingBid.toLocaleString()}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='flex items-center gap-1 text-sm font-medium text-blue-600'>
                        <Clock className='h-4 w-4' />
                        {auction.startsIn}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {auction.interested} interested
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Won Auctions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5 text-yellow-500' />
              Recent Wins
            </CardTitle>
            <CardDescription>Your recently won auctions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {wonAuctions.map((auction, index) => (
                <motion.div
                  key={auction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100'>
                      <Car className='h-5 w-5 text-yellow-600' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>{auction.vehicle}</p>
                      <p className='text-xs text-muted-foreground'>{auction.date}</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-semibold'>${auction.finalPrice.toLocaleString()}</p>
                    {getStatusBadge(auction.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spending Summary */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5 text-green-500' />
              Spending Summary
            </CardTitle>
            <CardDescription>Your auction spending this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              <div>
                <div className='mb-2 flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Monthly Budget</span>
                  <span className='font-medium'>$45,000 / $50,000</span>
                </div>
                <Progress value={90} className='h-2' />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='rounded-lg bg-muted/50 p-3'>
                  <p className='text-xs text-muted-foreground'>This Month</p>
                  <p className='text-xl font-semibold'>$45,000</p>
                  <p className='flex items-center gap-1 text-xs text-green-600'>
                    <TrendingUp className='h-3 w-3' />
                    +12% from last month
                  </p>
                </div>
                <div className='rounded-lg bg-muted/50 p-3'>
                  <p className='text-xs text-muted-foreground'>Avg. per Auction</p>
                  <p className='text-xl font-semibold'>$12,083</p>
                  <p className='text-xs text-muted-foreground'>Based on 12 wins</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
