'use client'

import { useMemo } from 'react'
import { MdDownload } from 'react-icons/md'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { toast } from 'sonner'

import { useDateRange } from '@/features/accounting/hooks/use-date-range'
import { useFinancialData } from '@/features/accounting/hooks/use-financial-data'
import { ReportFilters } from '@/features/accounting/components/report-filters'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

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
  card: 'Credit Card',
  wire_transfer: 'Wire Transfer',
  bank_check: 'Bank Check',
  paypal: 'PayPal',
}

export function FinancialDashboard() {
  const { dateRange, rangeType, setRange, formatRangeLabel } = useDateRange('year')
  const {
    profitLossData,
    cashFlowData,
    revenueAnalytics,
    costAnalysis,
  } = useFinancialData(dateRange)

  const handleExport = () => {
    toast.success('Export feature coming soon!')
  }

  // Revenue vs Costs Trend data
  const revenueCostsTrendData = useMemo(() => {
    const months = new Set<string>()
    profitLossData.revenue.byMonth.forEach((r) => months.add(r.month))
    profitLossData.costOfGoodsSold.byMonth.forEach((c) => months.add(c.month))

    return Array.from(months)
      .sort()
      .map((month) => {
        const revenue = profitLossData.revenue.byMonth.find((r) => r.month === month)?.amount || 0
        const costs = profitLossData.costOfGoodsSold.byMonth.find((c) => c.month === month)?.amount || 0
        return {
          month,
          revenue,
          costs,
          profit: revenue - costs,
        }
      })
  }, [profitLossData])

  // Daily cash flow data
  const dailyFlowData = useMemo(() => {
    const allDates = new Set<string>()
    cashFlowData.inflows.byDate.forEach((d) => allDates.add(d.date))
    cashFlowData.outflows.byDate.forEach((d) => allDates.add(d.date))

    return Array.from(allDates)
      .sort()
      .map((date) => {
        const inflow = cashFlowData.inflows.byDate.find((d) => d.date === date)?.amount || 0
        const outflow = cashFlowData.outflows.byDate.find((d) => d.date === date)?.amount || 0
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          inflows: inflow,
          outflows: -outflow,
        }
      })
  }, [cashFlowData])

  // Running balance data
  const balanceChartData = useMemo(() => {
    return cashFlowData.runningBalance.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: item.balance,
    }))
  }, [cashFlowData.runningBalance])

  // Revenue by period data
  const revenueByPeriodData = useMemo(() => {
    return revenueAnalytics.revenueByPeriod.map((item) => ({
      period: item.period,
      revenue: item.revenue,
      transactions: item.transactions,
    }))
  }, [revenueAnalytics.revenueByPeriod])

  // Payment method pie data
  const paymentMethodData = useMemo(() => {
    return revenueAnalytics.revenueByPaymentMethod.map((item) => ({
      name: categoryLabels[item.method] || item.method,
      value: item.amount,
    }))
  }, [revenueAnalytics.revenueByPaymentMethod])

  // Cost breakdown pie data
  const costBreakdownData = useMemo(() => {
    return costAnalysis.costsByCategory.map((item: { category: string; amount: number }) => ({
      name: categoryLabels[item.category] || item.category,
      value: item.amount,
    }))
  }, [costAnalysis.costsByCategory])

  // Cost trend data
  const costTrendData = useMemo(() => {
    return costAnalysis.costTrends.map((item: { period: string; costs: number }) => ({
      period: item.period,
      amount: item.costs,
    }))
  }, [costAnalysis.costTrends])

  return (
    <div className='space-y-6'>
      {/* Header with Export Button */}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <p className='text-muted-foreground'>Financial charts and analytics</p>
        </div>
        <Button variant='outline' size='sm' onClick={handleExport}>
          <MdDownload className='mr-2 h-4 w-4' />
          Export All
        </Button>
      </div>

      {/* Date Range Filter */}
      <ReportFilters
        rangeType={rangeType}
        onRangeChange={setRange}
        formatRangeLabel={formatRangeLabel}
      />

      {/* Charts Grid */}
      <div className='grid gap-6'>
        {/* Revenue vs Costs Trend */}
        {revenueCostsTrendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Costs Trend</CardTitle>
              <CardDescription>Monthly comparison of revenue, costs, and profit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={revenueCostsTrendData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Legend />
                    <Area
                      type='monotone'
                      dataKey='revenue'
                      name='Revenue'
                      stroke='#10b981'
                      fill='#10b98133'
                      strokeWidth={2}
                    />
                    <Area
                      type='monotone'
                      dataKey='costs'
                      name='Costs'
                      stroke='#ef4444'
                      fill='#ef444433'
                      strokeWidth={2}
                    />
                    <Area
                      type='monotone'
                      dataKey='profit'
                      name='Profit'
                      stroke='#3b82f6'
                      fill='#3b82f633'
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two column layout for smaller charts */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Daily Cash Flow */}
          {dailyFlowData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Cash Flow</CardTitle>
                <CardDescription>Inflows and outflows by date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-[280px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={dailyFlowData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(Math.abs(value))}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey='inflows' name='Inflows' fill='#10b981' />
                      <Bar dataKey='outflows' name='Outflows' fill='#ef4444' />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Running Balance */}
          {balanceChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Running Balance</CardTitle>
                <CardDescription>Cumulative cash position over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-[280px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={balanceChartData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type='monotone'
                        dataKey='balance'
                        name='Balance'
                        stroke='#3b82f6'
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Revenue by Period */}
        {revenueByPeriodData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Period</CardTitle>
              <CardDescription>Revenue and transaction trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={revenueByPeriodData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='period' />
                    <YAxis
                      yAxisId='left'
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <YAxis yAxisId='right' orientation='right' />
                    <Tooltip
                      formatter={(value: number, name: string) =>
                        name === 'Revenue' ? formatCurrency(value) : value
                      }
                    />
                    <Legend />
                    <Bar yAxisId='left' dataKey='revenue' name='Revenue' fill='#10b981' />
                    <Bar yAxisId='right' dataKey='transactions' name='Transactions' fill='#3b82f6' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pie Charts Row */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Revenue by Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Payment Method</CardTitle>
              <CardDescription>Distribution of revenue by payment type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[280px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {paymentMethodData.map((_entry: { name: string; value: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>Distribution of costs by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[280px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {costBreakdownData.map((_entry: { name: string; value: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Trend */}
        {costTrendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cost Trend</CardTitle>
              <CardDescription>Cost changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[280px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={costTrendData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='period' />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Line
                      type='monotone'
                      dataKey='amount'
                      name='Costs'
                      stroke='#ef4444'
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
