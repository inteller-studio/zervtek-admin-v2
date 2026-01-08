'use client'

import { useMemo } from 'react'
import {
  MdArrowUpward,
  MdArrowDownward,
  MdAccountBalance,
  MdTrendingUp,
} from 'react-icons/md'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
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
import type { CashFlowData } from '../types/accounting'

interface CashFlowReportProps {
  data: CashFlowData
  currency?: string
}

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

export function CashFlowReport({ data, currency = 'JPY' }: CashFlowReportProps) {
  // Prepare chart data for inflows by method
  const inflowsChartData = useMemo(() => {
    return Object.entries(data.inflows.byPaymentMethod).map(([method, amount]) => ({
      name: categoryLabels[method] || method,
      value: amount,
    }))
  }, [data.inflows.byPaymentMethod])

  // Prepare chart data for outflows by category
  const outflowsChartData = useMemo(() => {
    return Object.entries(data.outflows.byCategory).map(([category, amount]) => ({
      name: categoryLabels[category] || category,
      value: amount,
    }))
  }, [data.outflows.byCategory])

  // Prepare running balance chart data
  const balanceChartData = useMemo(() => {
    return data.runningBalance.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: item.balance,
    }))
  }, [data.runningBalance])

  // Combine inflows and outflows by date for bar chart
  const dailyFlowData = useMemo(() => {
    const allDates = new Set<string>()
    data.inflows.byDate.forEach((d) => allDates.add(d.date))
    data.outflows.byDate.forEach((d) => allDates.add(d.date))

    return Array.from(allDates)
      .sort()
      .map((date) => {
        const inflow = data.inflows.byDate.find((d) => d.date === date)?.amount || 0
        const outflow = data.outflows.byDate.find((d) => d.date === date)?.amount || 0
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          inflows: inflow,
          outflows: -outflow,
          net: inflow - outflow,
        }
      })
  }, [data])

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Cash Inflows</CardTitle>
            <MdArrowUpward className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {formatCurrency(data.inflows.total, currency)}
            </div>
            <p className='text-muted-foreground text-xs'>
              {data.inflows.byDate.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Cash Outflows</CardTitle>
            <MdArrowDownward className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {formatCurrency(data.outflows.total, currency)}
            </div>
            <p className='text-muted-foreground text-xs'>
              {data.outflows.byDate.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Net Cash Flow</CardTitle>
            <MdAccountBalance className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(data.netCashFlow, currency)}
            </div>
            <p className='text-muted-foreground text-xs'>
              {data.netCashFlow >= 0 ? 'Positive' : 'Negative'} cash flow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Cash Ratio</CardTitle>
            <MdTrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {data.outflows.total > 0
                ? (data.inflows.total / data.outflows.total).toFixed(2)
                : '0.00'}
              x
            </div>
            <p className='text-muted-foreground text-xs'>
              Inflows to outflows ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Cash Flow Bar Chart */}
      {dailyFlowData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Cash Flow</CardTitle>
            <CardDescription>Inflows and outflows by date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={dailyFlowData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(Math.abs(value), currency)}
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

      {/* Running Balance Line Chart */}
      {balanceChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Running Balance</CardTitle>
            <CardDescription>Cumulative cash position over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={balanceChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
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

      {/* Breakdown Pie Charts */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Inflows by Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Inflows by Payment Method</CardTitle>
            <CardDescription>Distribution of cash received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[250px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={inflowsChartData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {inflowsChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Outflows by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Outflows by Category</CardTitle>
            <CardDescription>Distribution of expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[250px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={outflowsChartData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {outflowsChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
