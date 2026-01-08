'use client'

import { useMemo } from 'react'
import {
  MdAttachMoney,
  MdReceipt,
  MdPeople,
  MdDirectionsCar,
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
import type { RevenueAnalytics as RevenueAnalyticsType } from '../types/accounting'

interface RevenueAnalyticsProps {
  data: RevenueAnalyticsType
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
  card: 'Credit Card',
  wire_transfer: 'Wire Transfer',
  bank_check: 'Bank Check',
  paypal: 'PayPal',
  crypto: 'Crypto',
  credit_card: 'Credit Card',
}

export function RevenueAnalytics({ data, currency = 'JPY' }: RevenueAnalyticsProps) {
  // Prepare revenue by period chart data
  const revenueByPeriodData = useMemo(() => {
    return data.revenueByPeriod.map((item) => ({
      period: item.period,
      revenue: item.revenue,
      transactions: item.transactions,
    }))
  }, [data.revenueByPeriod])

  // Prepare payment method pie chart data
  const paymentMethodData = useMemo(() => {
    return data.revenueByPaymentMethod.map((item) => ({
      name: categoryLabels[item.method] || item.method,
      value: item.amount,
      percentage: item.percentage,
    }))
  }, [data.revenueByPaymentMethod])

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <MdAttachMoney className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(data.totalRevenue, currency)}</div>
            <p className='text-muted-foreground text-xs'>
              For selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Transactions</CardTitle>
            <MdReceipt className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.transactionCount}</div>
            <p className='text-muted-foreground text-xs'>
              Total payments received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Avg Transaction</CardTitle>
            <MdAttachMoney className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(data.averageTransactionValue, currency)}
            </div>
            <p className='text-muted-foreground text-xs'>
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Top Customers</CardTitle>
            <MdPeople className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.revenueByCustomer.length}</div>
            <p className='text-muted-foreground text-xs'>
              Active customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Period Bar Chart */}
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
                      name === 'revenue'
                        ? formatCurrency(value, currency)
                        : value
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

      <div className='grid gap-4 md:grid-cols-2'>
        {/* Payment Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
            <CardDescription>Distribution of revenue by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[250px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {paymentMethodData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MdDirectionsCar className='h-5 w-5' />
              Top Vehicles by Revenue
            </CardTitle>
            <CardDescription>Best performing vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[250px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={data.topVehicles.slice(0, 5)}
                  layout='vertical'
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis type='number' tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <YAxis
                    type='category'
                    dataKey='vehicle'
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Bar dataKey='amount' name='Revenue' fill='#3b82f6' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Customers ranked by total revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className='text-right'>Transactions</TableHead>
                <TableHead className='text-right'>Total Revenue</TableHead>
                <TableHead className='text-right'>Avg per Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.revenueByCustomer.slice(0, 10).map((customer, index) => (
                <TableRow key={customer.customerId}>
                  <TableCell className='font-medium'>#{index + 1}</TableCell>
                  <TableCell>{customer.customerName}</TableCell>
                  <TableCell className='text-right'>{customer.transactions}</TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatCurrency(customer.amount, currency)}
                  </TableCell>
                  <TableCell className='text-muted-foreground text-right'>
                    {formatCurrency(customer.amount / customer.transactions, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
