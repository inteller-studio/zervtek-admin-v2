'use client'

import { useMemo } from 'react'
import {
  MdShoppingCart,
  MdDirectionsCar,
  MdTrendingUp,
  MdTrendingDown,
} from 'react-icons/md'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { PieChart, Pie } from 'recharts'
import type { CostAnalysis as CostAnalysisType } from '../types/accounting'

interface CostAnalysisProps {
  data: CostAnalysisType
  currency?: string
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const formatCurrency = (amount: number, currency: string = 'JPY') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

const categoryLabels: Record<string, string> = {
  auction: 'Auction Fees',
  transport: 'Transport',
  repair: 'Repairs',
  documents: 'Documents',
  shipping: 'Shipping',
  customs: 'Customs',
  storage: 'Storage',
  other: 'Other',
}

export function CostAnalysis({ data, currency = 'JPY' }: CostAnalysisProps) {
  // Prepare cost by category pie chart data
  const categoryData = useMemo(() => {
    return data.costsByCategory.map((item) => ({
      name: categoryLabels[item.category] || item.category,
      value: item.amount,
      percentage: item.percentage,
    }))
  }, [data.costsByCategory])

  // Prepare cost trends bar chart data
  const trendsData = useMemo(() => {
    return data.costTrends.map((item) => ({
      period: item.period,
      costs: item.costs,
    }))
  }, [data.costTrends])

  // Prepare stacked bar chart data for category trends
  const categoryTrendsData = useMemo(() => {
    return data.categoryTrends.map((item) => ({
      period: item.period,
      ...Object.fromEntries(
        Object.entries(item.categories).map(([cat, val]) => [categoryLabels[cat] || cat, val])
      ),
    }))
  }, [data.categoryTrends])

  // Get all unique categories for stacked bar
  const allCategories = useMemo(() => {
    const cats = new Set<string>()
    data.categoryTrends.forEach((item) => {
      Object.keys(item.categories).forEach((cat) => cats.add(categoryLabels[cat] || cat))
    })
    return Array.from(cats)
  }, [data.categoryTrends])

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Costs</CardTitle>
            <MdShoppingCart className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(data.totalCosts, currency)}</div>
            <p className='text-muted-foreground text-xs'>
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Avg per Vehicle</CardTitle>
            <MdDirectionsCar className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(data.averageCostPerVehicle, currency)}
            </div>
            <p className='text-muted-foreground text-xs'>
              {data.vehicleCount} vehicles processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Avg Margin</CardTitle>
            {data.marginAnalysis.averageMargin >= 0 ? (
              <MdTrendingUp className='h-4 w-4 text-green-500' />
            ) : (
              <MdTrendingDown className='h-4 w-4 text-red-500' />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data.marginAnalysis.averageMargin >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(data.marginAnalysis.averageMargin, currency)}
            </div>
            <p className='text-muted-foreground text-xs'>
              Per vehicle profit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Categories</CardTitle>
            <MdShoppingCart className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.costsByCategory.length}</div>
            <p className='text-muted-foreground text-xs'>
              Cost categories tracked
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        {/* Cost Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Detailed cost breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead className='text-right'>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.costsByCategory.map((item, index) => (
                  <TableRow key={item.category}>
                    <TableCell className='flex items-center gap-2'>
                      <div
                        className='h-3 w-3 rounded-full'
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {categoryLabels[item.category] || item.category}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {formatCurrency(item.amount, currency)}
                    </TableCell>
                    <TableCell className='text-muted-foreground text-right'>
                      {item.percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Cost Trends */}
      {trendsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Trends</CardTitle>
            <CardDescription>Monthly cost evolution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={trendsData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='period' />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Bar dataKey='costs' name='Costs' fill='#ef4444' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Trends Stacked Bar */}
      {categoryTrendsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Trends Over Time</CardTitle>
            <CardDescription>Stacked view of costs by category per period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={categoryTrendsData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='period' />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Legend />
                  {allCategories.map((cat, index) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      stackId='a'
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Margin Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Margin Analysis</CardTitle>
          <CardDescription>Profit margin per vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead className='text-right'>Revenue</TableHead>
                <TableHead className='text-right'>Costs</TableHead>
                <TableHead className='text-right'>Margin</TableHead>
                <TableHead className='text-right'>Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.marginAnalysis.marginByVehicle.slice(0, 10).map((vehicle) => {
                const marginPercent = vehicle.revenue > 0
                  ? (vehicle.margin / vehicle.revenue) * 100
                  : 0
                return (
                  <TableRow key={vehicle.vehicle}>
                    <TableCell className='font-medium'>{vehicle.vehicle}</TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(vehicle.revenue, currency)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(vehicle.costs, currency)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        vehicle.margin >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(vehicle.margin, currency)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        marginPercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {marginPercent.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
