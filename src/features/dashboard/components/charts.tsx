'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { Filler } from 'chart.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/theme-provider'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Light mode colors - vibrant and visible
const LIGHT_COLORS = {
  primary: 'hsl(221, 83%, 53%)',      // Blue
  secondary: 'hsl(262, 83%, 58%)',    // Purple
  accent1: 'hsl(142, 71%, 45%)',      // Green
  accent2: 'hsl(38, 92%, 50%)',       // Orange
  accent3: 'hsl(0, 84%, 60%)',        // Red
}

// Dark mode colors - Vercel-inspired elegant palette for pure black backgrounds
const DARK_COLORS = {
  primary: 'hsl(160, 45%, 50%)',      // Emerald/teal
  secondary: 'hsl(280, 35%, 58%)',    // Soft violet
  accent1: 'hsl(45, 55%, 55%)',       // Warm gold
  accent2: 'hsl(340, 45%, 60%)',      // Rose/pink
  accent3: 'hsl(20, 50%, 55%)',       // Warm orange
}

function useChartColors() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return {
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)',
    tickColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.6)',
    legendColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
    pointBorderColor: isDark ? '#0a0a0a' : '#ffffff',
    tooltipBg: isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    tooltipText: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
  }
}

interface ChartDataPoint {
  [key: string]: string | number
}

export function UserGrowthChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
  const { colors, gridColor, tickColor, legendColor, pointBorderColor, tooltipBg, tooltipBorder, tooltipText } = useChartColors()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32 bg-muted-foreground/20' />
          <Skeleton className='mt-2 h-4 w-48 bg-muted-foreground/20' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-64 w-full bg-muted-foreground/20' />
        </CardContent>
      </Card>
    )
  }

  const chartData = {
    labels: data?.map((item) => {
      const date = new Date(item.date as string)
      return date.toLocaleDateString('en', { day: '2-digit', month: 'short' })
    }) || [],
    datasets: [
      {
        label: 'Users',
        data: data?.map((item) => item.users) || [],
        borderColor: colors.primary,
        backgroundColor: colors.primary.replace('hsl', 'hsla').replace(')', ', 0.2)'),
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.primary,
        pointBorderColor: pointBorderColor,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          color: legendColor,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: tickColor,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: tickColor,
        },
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Daily user registrations over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <Line data={chartData} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AuctionPerformanceChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
  const { colors, gridColor, tickColor, legendColor, tooltipBg, tooltipBorder, tooltipText } = useChartColors()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32 bg-muted-foreground/20' />
          <Skeleton className='mt-2 h-4 w-48 bg-muted-foreground/20' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-64 w-full bg-muted-foreground/20' />
        </CardContent>
      </Card>
    )
  }

  const chartData = {
    labels: data?.map((item) => item.month) || [],
    datasets: [
      {
        label: 'Completed',
        data: data?.map((item) => item.completed) || [],
        backgroundColor: colors.primary,
        borderRadius: 4,
      },
      {
        label: 'Active',
        data: data?.map((item) => item.active) || [],
        backgroundColor: colors.secondary,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          color: legendColor,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: tickColor,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: tickColor,
        },
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Auction Performance</CardTitle>
          <CardDescription>Completed vs Active auctions by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <Bar data={chartData} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function CountryDistributionChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
  const { colors, legendColor, tooltipBg, tooltipBorder, tooltipText } = useChartColors()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32 bg-muted-foreground/20' />
          <Skeleton className='mt-2 h-4 w-48 bg-muted-foreground/20' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-64 w-full bg-muted-foreground/20' />
        </CardContent>
      </Card>
    )
  }

  const pieColors = [
    colors.primary,
    colors.secondary,
    colors.accent1,
    colors.accent2,
    colors.accent3,
    'hsl(200, 70%, 50%)', // Extra color for 6th item
  ]

  const chartData = {
    labels: data?.map((item) => item.country) || [],
    datasets: [
      {
        data: data?.map((item) => item.value) || [],
        backgroundColor: pieColors,
        borderColor: pieColors.map(color => color.replace('hsl', 'hsla').replace(')', ', 0.8)')),
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          color: legendColor,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context: { label?: string; parsed?: number; dataset: { data: number[] } }) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} users (${percentage}%)`;
          }
        }
      }
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Users by Country</CardTitle>
          <CardDescription>Geographic distribution of registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <Pie data={chartData} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function VehicleInventoryChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
  const { colors, gridColor, tickColor, tooltipBg, tooltipBorder, tooltipText } = useChartColors()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32 bg-muted-foreground/20' />
          <Skeleton className='mt-2 h-4 w-48 bg-muted-foreground/20' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-64 w-full bg-muted-foreground/20' />
        </CardContent>
      </Card>
    )
  }

  const chartData = {
    labels: data?.map((item) => item.status) || [],
    datasets: [
      {
        label: 'Count',
        data: data?.map((item) => item.count) || [],
        backgroundColor: colors.accent1,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: tickColor,
        },
      },
      x: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: tickColor,
        },
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Inventory</CardTitle>
          <CardDescription>Current vehicle status distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <Bar data={chartData} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function BidActivityChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
  const { colors, gridColor, tickColor, pointBorderColor, tooltipBg, tooltipBorder, tooltipText } = useChartColors()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32 bg-muted-foreground/20' />
          <Skeleton className='mt-2 h-4 w-48 bg-muted-foreground/20' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-64 w-full bg-muted-foreground/20' />
        </CardContent>
      </Card>
    )
  }

  const chartData = {
    labels: data?.map((item) => {
      const date = new Date(item.date as string)
      return date.toLocaleDateString('en', { day: '2-digit', month: 'short' })
    }) || [],
    datasets: [
      {
        label: 'Bids',
        data: data?.map((item) => item.bids) || [],
        borderColor: colors.accent2,
        backgroundColor: colors.accent2.replace('hsl', 'hsla').replace(')', ', 0.3)'),
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.accent2,
        pointBorderColor: pointBorderColor,
        pointBorderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context: { parsed: { y: number | null } }) {
            return `${context.parsed.y ?? 0} bids placed`
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: tickColor,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: tickColor,
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Bid Activity</CardTitle>
          <CardDescription>Bids placed over the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <Line data={chartData} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
