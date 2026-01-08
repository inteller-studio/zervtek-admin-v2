'use client'

import { useMemo } from 'react'
import {
  MdAttachMoney,
  MdWarning,
  MdCheckCircle,
  MdAccessTime,
} from 'react-icons/md'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Cell,
} from 'recharts'
import type { AccountsReceivable as AccountsReceivableType } from '../types/accounting'

interface ReceivablesReportProps {
  data: AccountsReceivableType
  currency?: string
}

const AGING_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#991b1b']

const formatCurrency = (amount: number, currency: string = 'JPY') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ReceivablesReport({ data, currency = 'JPY' }: ReceivablesReportProps) {
  // Prepare aging chart data
  const agingChartData = useMemo(() => {
    return [
      { name: 'Current (0-30)', amount: data.aging.current, color: AGING_COLORS[0] },
      { name: '31-60 Days', amount: data.aging.thirtyDays, color: AGING_COLORS[1] },
      { name: '61-90 Days', amount: data.aging.sixtyDays, color: AGING_COLORS[2] },
      { name: '90+ Days', amount: data.aging.ninetyDaysPlus, color: AGING_COLORS[3] },
    ]
  }, [data.aging])

  // Calculate total for percentages
  const totalAging = data.aging.current + data.aging.thirtyDays + data.aging.sixtyDays + data.aging.ninetyDaysPlus

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Outstanding</CardTitle>
            <MdAttachMoney className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(data.totalOutstanding, currency)}
            </div>
            <p className='text-muted-foreground text-xs'>
              Across all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Overdue Amount</CardTitle>
            <MdWarning className='h-4 w-4 text-amber-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-amber-600'>
              {formatCurrency(data.totalOverdue, currency)}
            </div>
            <p className='text-muted-foreground text-xs'>
              {data.totalOutstanding > 0
                ? `${((data.totalOverdue / data.totalOutstanding) * 100).toFixed(1)}% of total`
                : '0% of total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Collection Rate</CardTitle>
            <MdCheckCircle className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {data.collectionRate.toFixed(1)}%
            </div>
            <Progress value={data.collectionRate} className='mt-2' />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Customers</CardTitle>
            <MdAccessTime className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.customerBalances.length}</div>
            <p className='text-muted-foreground text-xs'>
              With outstanding balances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aging Summary */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Aging Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Aging Analysis</CardTitle>
            <CardDescription>Receivables breakdown by age</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[250px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={agingChartData} layout='vertical'>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis type='number' tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <YAxis type='category' dataKey='name' width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Bar dataKey='amount' name='Amount'>
                    {agingChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Aging Breakdown Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Aging Breakdown</CardTitle>
            <CardDescription>Detailed aging buckets</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {agingChartData.map((item, index) => (
              <div key={item.name} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div
                    className='h-4 w-4 rounded-full'
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className='font-medium'>{item.name}</p>
                    <p className='text-muted-foreground text-sm'>
                      {totalAging > 0
                        ? `${((item.amount / totalAging) * 100).toFixed(1)}% of total`
                        : '0%'}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-bold'>{formatCurrency(item.amount, currency)}</p>
                  {index > 0 && item.amount > 0 && (
                    <Badge variant='destructive' className='text-xs'>
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Customer Balances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Balances</CardTitle>
          <CardDescription>Outstanding amounts by customer</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className='text-right'>Total Owed</TableHead>
                <TableHead className='text-right'>Paid</TableHead>
                <TableHead className='text-right'>Outstanding</TableHead>
                <TableHead className='text-right'>Days Past Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.customerBalances.map((customer) => (
                <TableRow key={customer.customerId}>
                  <TableCell>
                    <div>
                      <p className='font-medium'>{customer.customerName}</p>
                      <p className='text-muted-foreground text-xs'>{customer.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(customer.totalOwed, currency)}
                  </TableCell>
                  <TableCell className='text-right text-green-600'>
                    {formatCurrency(customer.paidAmount, currency)}
                  </TableCell>
                  <TableCell className='text-right font-bold'>
                    {formatCurrency(customer.outstanding, currency)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {customer.daysPastDue && customer.daysPastDue > 0 ? (
                      <span className='text-red-600'>{customer.daysPastDue} days</span>
                    ) : (
                      <span className='text-green-600'>Current</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.daysPastDue && customer.daysPastDue > 90 ? (
                      <Badge variant='destructive'>Critical</Badge>
                    ) : customer.daysPastDue && customer.daysPastDue > 60 ? (
                      <Badge className='bg-red-500'>Overdue</Badge>
                    ) : customer.daysPastDue && customer.daysPastDue > 30 ? (
                      <Badge className='bg-amber-500'>Late</Badge>
                    ) : customer.daysPastDue && customer.daysPastDue > 0 ? (
                      <Badge className='bg-yellow-500'>Pending</Badge>
                    ) : (
                      <Badge className='bg-green-500'>Current</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {data.customerBalances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className='py-8 text-center'>
                    <MdCheckCircle className='mx-auto mb-2 h-12 w-12 text-green-500' />
                    <p className='text-muted-foreground'>No outstanding receivables</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
