'use client'

import { motion } from 'framer-motion'
import {
  MdBarChart,
  MdTrendingUp,
  MdAccessTime,
  MdDescription,
  MdPublic,
  MdSearch,
  MdVisibility,
  MdMouse,
  MdTrendingDown,
  MdOpenInNew,
} from 'react-icons/md'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Mock data - in production this would come from API
const seoStats = {
  organicTraffic: 125000,
  organicTrafficChange: 18,
  pageViews: 342000,
  pageViewsChange: 12,
  avgSessionDuration: 245,
  avgSessionDurationChange: 8,
  bounceRate: 42,
  bounceRateChange: -5,
}

const topKeywords = [
  { keyword: 'Japanese car export', position: 3, volume: 12000, change: 2, clicks: 4200 },
  { keyword: 'JDM vehicles for sale', position: 5, volume: 8500, change: -1, clicks: 2100 },
  { keyword: 'Toyota Land Cruiser Japan', position: 1, volume: 6200, change: 0, clicks: 3800 },
  { keyword: 'Buy cars from Japan', position: 4, volume: 9800, change: 3, clicks: 2800 },
  { keyword: 'Lexus export Japan', position: 2, volume: 4500, change: 1, clicks: 2400 },
  { keyword: 'Japanese auction cars', position: 6, volume: 7200, change: -2, clicks: 1600 },
]

const topPages = [
  { page: '/stock/toyota-land-cruiser', views: 28500, avgTime: '3:45', bounceRate: 32 },
  { page: '/auctions', views: 22100, avgTime: '4:12', bounceRate: 28 },
  { page: '/stock/lexus-lx600', views: 18400, avgTime: '3:22', bounceRate: 35 },
  { page: '/how-to-buy', views: 15200, avgTime: '5:30', bounceRate: 22 },
  { page: '/stock/nissan-gtr', views: 12800, avgTime: '2:58', bounceRate: 38 },
]

const trafficSources = [
  { source: 'Organic Search', visits: 75000, percentage: 60, color: 'bg-blue-500' },
  { source: 'Direct', visits: 25000, percentage: 20, color: 'bg-green-500' },
  { source: 'Referral', visits: 12500, percentage: 10, color: 'bg-purple-500' },
  { source: 'Social', visits: 7500, percentage: 6, color: 'bg-pink-500' },
  { source: 'Email', visits: 5000, percentage: 4, color: 'bg-orange-500' },
]

const countriesTraffic = [
  { country: 'United States', code: 'US', visits: 45000, percentage: 36 },
  { country: 'United Kingdom', code: 'GB', visits: 22000, percentage: 18 },
  { country: 'Australia', code: 'AU', visits: 18000, percentage: 14 },
  { country: 'Germany', code: 'DE', visits: 12000, percentage: 10 },
  { country: 'Canada', code: 'CA', visits: 10000, percentage: 8 },
  { country: 'Others', code: 'XX', visits: 18000, percentage: 14 },
]

const contentPerformance = [
  { title: '2024 Toyota Land Cruiser 300 - Complete Guide', type: 'Blog', views: 8500, shares: 234, published: 'Dec 15' },
  { title: 'How to Buy a Car from Japan in 2024', type: 'Guide', views: 6200, shares: 189, published: 'Dec 10' },
  { title: 'JDM Legends: Nissan Skyline GT-R History', type: 'Blog', views: 5400, shares: 156, published: 'Dec 8' },
  { title: 'Japanese Auction Grading System Explained', type: 'Guide', views: 4800, shares: 145, published: 'Dec 5' },
]

const recentSearchQueries = [
  { query: 'land cruiser 300 price japan', impressions: 15000, clicks: 2400, ctr: 16 },
  { query: 'buy lexus lx from japan', impressions: 8500, clicks: 1200, ctr: 14.1 },
  { query: 'jdm cars for export', impressions: 12000, clicks: 1600, ctr: 13.3 },
  { query: 'japanese car auction online', impressions: 9200, clicks: 1100, ctr: 12 },
  { query: 'toyota hiace export', impressions: 6800, clicks: 780, ctr: 11.5 },
]

function StatCard({ title, value, change, suffix = '', icon: Icon }: {
  title: string
  value: number | string
  change: number
  suffix?: string
  icon: React.ElementType
}) {
  const isPositive = change >= 0
  const isNegativeGood = title === 'Bounce Rate'
  const showPositiveColor = isNegativeGood ? !isPositive : isPositive

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className={`flex items-center gap-1 text-xs ${showPositiveColor ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? <MdTrendingUp className="h-3 w-3" /> : <MdTrendingDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold">
          {typeof value === 'number' && value > 1000 ? `${(value / 1000).toFixed(1)}K` : value}{suffix}
        </p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  )
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function ContentManagerDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Organic Traffic"
          value={seoStats.organicTraffic}
          change={seoStats.organicTrafficChange}
          icon={MdTrendingUp}
        />
        <StatCard
          title="Page Views"
          value={seoStats.pageViews}
          change={seoStats.pageViewsChange}
          icon={MdVisibility}
        />
        <StatCard
          title="Avg Session Duration"
          value={formatDuration(seoStats.avgSessionDuration)}
          change={seoStats.avgSessionDurationChange}
          icon={MdAccessTime}
        />
        <StatCard
          title="Bounce Rate"
          value={seoStats.bounceRate}
          change={seoStats.bounceRateChange}
          suffix="%"
          icon={MdMouse}
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdSearch className="h-5 w-5 text-blue-500" />
              Top Keywords
            </CardTitle>
            <CardDescription>Your best performing search terms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topKeywords.map((kw, index) => (
                <motion.div
                  key={kw.keyword}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{kw.keyword}</p>
                    <p className="text-xs text-muted-foreground">{kw.volume.toLocaleString()} monthly searches</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">#{kw.position}</p>
                      <div className={`flex items-center gap-1 text-xs ${kw.change > 0 ? 'text-emerald-600' : kw.change < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {kw.change > 0 ? <MdTrendingUp className="h-3 w-3" /> : kw.change < 0 ? <MdTrendingDown className="h-3 w-3" /> : null}
                        {kw.change !== 0 ? Math.abs(kw.change) : '-'}
                      </div>
                    </div>
                    <Badge variant="secondary">{kw.clicks.toLocaleString()} clicks</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdDescription className="h-5 w-5 text-purple-500" />
              Top Pages
            </CardTitle>
            <CardDescription>Most visited pages on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPages.map((page, index) => (
                <motion.div
                  key={page.page}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.page}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MdAccessTime className="h-3 w-3" />
                        {page.avgTime}
                      </span>
                      <span>Bounce: {page.bounceRate}%</span>
                    </div>
                  </div>
                  <Badge variant="outline">{page.views.toLocaleString()} views</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdBarChart className="h-5 w-5 text-emerald-500" />
              Traffic Sources
            </CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <motion.div
                  key={source.source}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${source.color}`} />
                      <span className="font-medium">{source.source}</span>
                    </div>
                    <span className="text-muted-foreground">{source.visits.toLocaleString()} · {source.percentage}%</span>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Countries Traffic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPublic className="h-5 w-5 text-cyan-500" />
              Traffic by Country
            </CardTitle>
            <CardDescription>Geographic distribution of visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {countriesTraffic.map((country, index) => (
                <motion.div
                  key={country.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{country.country}</span>
                    <span className="text-muted-foreground">{country.visits.toLocaleString()} visits · {country.percentage}%</span>
                  </div>
                  <Progress value={country.percentage} className="h-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdTrendingUp className="h-5 w-5 text-pink-500" />
              Content Performance
            </CardTitle>
            <CardDescription>How your content is performing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contentPerformance.map((content, index) => (
                <motion.div
                  key={content.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{content.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{content.type}</Badge>
                        <span className="text-xs text-muted-foreground">{content.published}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{content.views.toLocaleString()} views</p>
                      <p className="text-xs text-muted-foreground">{content.shares} shares</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Queries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdSearch className="h-5 w-5 text-orange-500" />
              Search Console Data
            </CardTitle>
            <CardDescription>Recent search queries from Google</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSearchQueries.map((query, index) => (
                <motion.div
                  key={query.query}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{query.query}</p>
                    <p className="text-xs text-muted-foreground">{query.impressions.toLocaleString()} impressions</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{query.clicks.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">clicks</p>
                    </div>
                    <Badge variant={query.ctr >= 15 ? 'green' : query.ctr >= 10 ? 'amber' : 'zinc'}>
                      {query.ctr}% CTR
                    </Badge>
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
