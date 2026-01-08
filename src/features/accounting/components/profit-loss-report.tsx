'use client'

import { useMemo } from 'react'
import {
  MdTrendingUp,
  MdTrendingDown,
  MdAttachMoney,
  MdShoppingCart,
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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ProfitLossData, ProfitLossLineItem } from '../types/accounting'

interface ProfitLossReportProps {
  data: ProfitLossData
  currency?: string
}

const formatCurrency = (amount: number, currency: string = 'JPY') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

// Category display names
const categoryLabels: Record<string, string> = {
  auction: 'Auction Fees',
  transport: 'Transport Costs',
  repair: 'Repair & Maintenance',
  documents: 'Document & Legal',
  shipping: 'Shipping & Freight',
  customs: 'Customs & Duties',
  storage: 'Storage Fees',
  other: 'Other Expenses',
  card: 'Credit Card',
  wire_transfer: 'Wire Transfer',
  bank_check: 'Bank Check',
  paypal: 'PayPal',
}

export function ProfitLossReport({ data, currency = 'JPY' }: ProfitLossReportProps) {
  // Build line items for the P&L table
  const lineItems = useMemo((): ProfitLossLineItem[] => {
    const items: ProfitLossLineItem[] = []

    // Revenue section
    items.push({ label: 'Revenue', amount: 0, isSubtotal: true })
    Object.entries(data.revenue.byPaymentMethod).forEach(([method, amount]) => {
      items.push({
        label: categoryLabels[method] || method,
        amount,
        percentage: data.revenue.total > 0 ? (amount / data.revenue.total) * 100 : 0,
        indent: 1,
      })
    })
    items.push({ label: 'Total Revenue', amount: data.revenue.total, isSubtotal: true })

    // COGS section
    items.push({ label: '', amount: 0 }) // Spacer
    items.push({ label: 'Cost of Goods Sold', amount: 0, isSubtotal: true })
    Object.entries(data.costOfGoodsSold.byCategory).forEach(([category, amount]) => {
      items.push({
        label: categoryLabels[category] || category,
        amount,
        percentage: data.costOfGoodsSold.total > 0 ? (amount / data.costOfGoodsSold.total) * 100 : 0,
        indent: 1,
      })
    })
    items.push({ label: 'Total COGS', amount: data.costOfGoodsSold.total, isSubtotal: true })

    // Profit section
    items.push({ label: '', amount: 0 }) // Spacer
    items.push({
      label: 'Gross Profit',
      amount: data.grossProfit,
      percentage: data.grossMargin,
      isTotal: true,
    })
    items.push({
      label: 'Net Profit',
      amount: data.netProfit,
      percentage: data.netMargin,
      isTotal: true,
    })

    return items
  }, [data])

  // Combine revenue and cost data by month for chart
  const chartData = useMemo(() => {
    const months = new Set<string>()
    data.revenue.byMonth.forEach((r) => months.add(r.month))
    data.costOfGoodsSold.byMonth.forEach((c) => months.add(c.month))

    return Array.from(months)
      .sort()
      .map((month) => {
        const revenue = data.revenue.byMonth.find((r) => r.month === month)?.amount || 0
        const costs = data.costOfGoodsSold.byMonth.find((c) => c.month === month)?.amount || 0
        return {
          month,
          revenue,
          costs,
          profit: revenue - costs,
        }
      })
  }, [data])

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
            <div className='text-2xl font-bold'>{formatCurrency(data.revenue.total, currency)}</div>
            <p className='text-muted-foreground text-xs'>
              From {Object.keys(data.revenue.byPaymentMethod).length} payment methods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total COGS</CardTitle>
            <MdShoppingCart className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(data.costOfGoodsSold.total, currency)}</div>
            <p className='text-muted-foreground text-xs'>
              Across {Object.keys(data.costOfGoodsSold.byCategory).length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Gross Profit</CardTitle>
            {data.grossProfit >= 0 ? (
              <MdTrendingUp className='h-4 w-4 text-green-500' />
            ) : (
              <MdTrendingDown className='h-4 w-4 text-red-500' />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.grossProfit, currency)}
            </div>
            <p className='text-muted-foreground text-xs'>
              Margin: {formatPercentage(data.grossMargin)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Net Profit</CardTitle>
            {data.netProfit >= 0 ? (
              <MdTrendingUp className='h-4 w-4 text-green-500' />
            ) : (
              <MdTrendingDown className='h-4 w-4 text-red-500' />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.netProfit, currency)}
            </div>
            <p className='text-muted-foreground text-xs'>
              Margin: {formatPercentage(data.netMargin)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Costs Trend Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Costs Trend</CardTitle>
            <CardDescription>Monthly comparison of revenue and costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
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

      {/* P&L Statement Table */}
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Statement</CardTitle>
          <CardDescription>Detailed breakdown of revenue and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50%]'>Line Item</TableHead>
                <TableHead className='text-right'>Amount</TableHead>
                <TableHead className='text-right'>%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item, index) => {
                if (item.label === '') {
                  return <TableRow key={index} className='h-4' />
                }
                return (
                  <TableRow
                    key={index}
                    className={
                      item.isTotal
                        ? 'bg-muted/50 font-bold'
                        : item.isSubtotal
                          ? 'font-semibold'
                          : ''
                    }
                  >
                    <TableCell
                      style={{ paddingLeft: item.indent ? `${item.indent * 24 + 16}px` : undefined }}
                    >
                      {item.label}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        item.isTotal && item.amount < 0 ? 'text-red-600' : ''
                      } ${item.isTotal && item.amount >= 0 ? 'text-green-600' : ''}`}
                    >
                      {item.amount !== 0 || item.isSubtotal || item.isTotal
                        ? formatCurrency(item.amount, currency)
                        : ''}
                    </TableCell>
                    <TableCell className='text-muted-foreground text-right'>
                      {item.percentage !== undefined ? formatPercentage(item.percentage) : ''}
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
