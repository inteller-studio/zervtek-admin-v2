'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  MdAccountBalance,
  MdTrendingUp,
  MdTrendingDown,
  MdAttachMoney,
  MdReceipt,
  MdDownload,
  MdShoppingCart,
} from 'react-icons/md'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { AnimatedTabs, AnimatedTabsContent, type TabItem } from '@/components/ui/animated-tabs'
import { StatsCard } from '@/features/dashboard/components/stats-card'

import { useDateRange } from './hooks/use-date-range'
import { useFinancialData } from './hooks/use-financial-data'
import { ReportFilters } from './components/report-filters'
import { ProfitLossReport } from './components/profit-loss-report'
import { CashFlowReport } from './components/cash-flow-report'
import { RevenueAnalytics } from './components/revenue-analytics'
import { CostAnalysis } from './components/cost-analysis'
import { ReceivablesReport } from './components/receivables-report'
import { ExpensesTab } from './components/expenses-tab'
import { MaintenanceOverlay } from '@/components/ui/maintenance-overlay'

export function Accounting() {
  const [activeTab, setActiveTab] = useState('overview')
  const { dateRange, rangeType, setRange, formatRangeLabel } = useDateRange('year')
  const {
    profitLossData,
    cashFlowData,
    revenueAnalytics,
    costAnalysis,
    accountsReceivable,
    summary,
  } = useFinancialData(dateRange)

  const handleExport = () => {
    toast.success('Export feature coming soon!')
  }

  // Tabs configuration
  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: MdAccountBalance },
    { id: 'profit-loss', label: 'Profit & Loss', icon: MdTrendingUp },
    { id: 'cash-flow', label: 'Cash Flow', icon: MdAttachMoney },
    { id: 'revenue', label: 'Revenue', icon: MdReceipt },
    { id: 'costs', label: 'Costs', icon: MdTrendingDown },
    { id: 'expenses', label: 'Expenses', icon: MdShoppingCart },
    { id: 'receivables', label: 'Receivables', icon: MdAccountBalance },
  ]

  return (
    <>
      <MaintenanceOverlay />
      <Header fixed>
        <Search className='md:w-auto flex-1' />
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Header */}
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>Accounting</h1>
            <p className='text-muted-foreground'>Financial reports and analytics</p>
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

        {/* Tabs */}
        <AnimatedTabs
          tabs={tabs}
          value={activeTab}
          onValueChange={setActiveTab}
          variant='compact'
        >
          {/* Overview Tab */}
          <AnimatedTabsContent value='overview' className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid gap-4 md:grid-cols-5'>
              <StatsCard
                title='Total Revenue'
                value={summary.totalRevenue}
                change={summary.revenueChange}
                prefix='¥'
                description='For selected period'
              />
              <StatsCard
                title='Total Costs'
                value={summary.totalCosts}
                change={-5.2}
                prefix='¥'
                description='Cost of goods sold'
              />
              <StatsCard
                title='Gross Profit'
                value={summary.grossProfit}
                change={summary.profitChange}
                prefix='¥'
                description='Revenue minus COGS'
              />
              <StatsCard
                title='Net Profit'
                value={summary.netProfit}
                change={summary.profitChange}
                prefix='¥'
                description='After all expenses'
              />
              <StatsCard
                title='Outstanding'
                value={summary.outstandingReceivables}
                change={-8.5}
                prefix='¥'
                description='Accounts receivable'
              />
            </div>

            {/* Quick View of All Reports */}
            <div className='grid gap-6 lg:grid-cols-2'>
              {/* P&L Summary */}
              <div className='lg:col-span-2'>
                <ProfitLossReport data={profitLossData} />
              </div>
            </div>
          </AnimatedTabsContent>

          {/* Profit & Loss Tab */}
          <AnimatedTabsContent value='profit-loss' className='space-y-6'>
            <ProfitLossReport data={profitLossData} />
          </AnimatedTabsContent>

          {/* Cash Flow Tab */}
          <AnimatedTabsContent value='cash-flow' className='space-y-6'>
            <CashFlowReport data={cashFlowData} />
          </AnimatedTabsContent>

          {/* Revenue Tab */}
          <AnimatedTabsContent value='revenue' className='space-y-6'>
            <RevenueAnalytics data={revenueAnalytics} />
          </AnimatedTabsContent>

          {/* Costs Tab */}
          <AnimatedTabsContent value='costs' className='space-y-6'>
            <CostAnalysis data={costAnalysis} />
          </AnimatedTabsContent>

          {/* Expenses Tab */}
          <AnimatedTabsContent value='expenses' className='space-y-6'>
            <ExpensesTab dateRange={dateRange} />
          </AnimatedTabsContent>

          {/* Receivables Tab */}
          <AnimatedTabsContent value='receivables' className='space-y-6'>
            <ReceivablesReport data={accountsReceivable} />
          </AnimatedTabsContent>
        </AnimatedTabs>
      </Main>
    </>
  )
}
