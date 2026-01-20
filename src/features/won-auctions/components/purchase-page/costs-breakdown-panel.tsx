'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import {
  MdAttachMoney,
  MdLocalShipping,
  MdBuild,
  MdDescription,
  MdDirectionsBoat,
  MdWarehouse,
  MdGavel,
  MdMoreHoriz,
  MdAdd,
  MdReceipt,
  MdTrendingUp,
  MdTrendingDown,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { type Purchase, type CostItem, type OurCosts } from '../../data/won-auctions'
import { type PurchaseWorkflow } from '../../types/workflow'
import { mergeAllCosts } from '../../utils/workflow'

interface CostsBreakdownPanelProps {
  auction: Purchase
  workflow?: PurchaseWorkflow
  onAddCost?: () => void
}

// Category configuration with icons
const CATEGORY_CONFIG: Record<CostItem['category'], { label: string; icon: typeof MdAttachMoney }> = {
  auction: { label: 'Auction', icon: MdGavel },
  transport: { label: 'Transport', icon: MdLocalShipping },
  repair: { label: 'Repair', icon: MdBuild },
  documents: { label: 'Documents', icon: MdDescription },
  shipping: { label: 'Shipping', icon: MdDirectionsBoat },
  customs: { label: 'Customs', icon: MdReceipt },
  storage: { label: 'Storage', icon: MdWarehouse },
  other: { label: 'Other', icon: MdMoreHoriz },
}

// Format currency
const formatCurrency = (amount: number, currency: string = 'JPY') => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function CostsBreakdownPanel({ auction, workflow, onAddCost }: CostsBreakdownPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<CostItem['category'] | 'all'>('all')
  const [showAllCategories, setShowAllCategories] = useState(false)

  // Merge purchase costs with workflow costs into a unified view
  const costs: OurCosts = useMemo(() => {
    return mergeAllCosts(auction.ourCosts, workflow)
  }, [auction.ourCosts, workflow])

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return costs.items
    return costs.items.filter((item) => item.category === selectedCategory)
  }, [costs.items, selectedCategory])

  // Calculate totals
  const totalOurCost = costs.totalCost + auction.winningBid
  const estimatedProfit = auction.totalAmount - totalOurCost
  const profitMarginPercent = totalOurCost > 0 ? ((estimatedProfit / totalOurCost) * 100) : 0

  // Get active categories (those with costs)
  const activeCategories = useMemo(() => {
    return Object.entries(costs.categoryTotals)
      .filter(([_, amount]) => amount > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([category]) => category as CostItem['category'])
  }, [costs.categoryTotals])

  // Categories to show (first 4 or all)
  const visibleCategories = showAllCategories ? activeCategories : activeCategories.slice(0, 4)

  return (
    <div className='p-6 space-y-8'>
      {/* Financial Summary - Clean Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Vehicle Cost */}
        <div className='p-4 rounded-xl border bg-card'>
          <p className='text-xs text-muted-foreground uppercase tracking-wider mb-1'>Vehicle Cost</p>
          <p className='text-2xl font-bold font-data'>{formatCurrency(auction.winningBid, auction.currency)}</p>
        </div>

        {/* Our Expenses */}
        <div className='p-4 rounded-xl border bg-card'>
          <p className='text-xs text-muted-foreground uppercase tracking-wider mb-1'>Our Expenses</p>
          <p className='text-2xl font-bold font-data'>{formatCurrency(costs.totalCost, auction.currency)}</p>
        </div>

        {/* Total Investment */}
        <div className='p-4 rounded-xl bg-foreground text-background'>
          <p className='text-xs opacity-70 uppercase tracking-wider mb-1'>Total Investment</p>
          <p className='text-2xl font-bold font-data'>{formatCurrency(totalOurCost, auction.currency)}</p>
        </div>

        {/* Profit/Loss */}
        <div className={cn(
          'p-4 rounded-xl border',
          estimatedProfit >= 0 ? 'bg-card' : 'bg-muted'
        )}>
          <div className='flex items-center gap-1.5 mb-1'>
            {estimatedProfit >= 0 ? (
              <MdTrendingUp className='h-3.5 w-3.5 text-muted-foreground' />
            ) : (
              <MdTrendingDown className='h-3.5 w-3.5 text-muted-foreground' />
            )}
            <p className='text-xs text-muted-foreground uppercase tracking-wider'>
              {estimatedProfit >= 0 ? 'Est. Profit' : 'Est. Loss'}
            </p>
          </div>
          <p className='text-2xl font-bold font-data'>
            {estimatedProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(estimatedProfit), auction.currency)}
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            {profitMarginPercent >= 0 ? '+' : ''}{profitMarginPercent.toFixed(1)}% margin
          </p>
        </div>
      </div>

      {/* Revenue vs Cost Comparison */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-muted-foreground'>Sale Price to Customer</span>
          <span className='font-bold font-data'>{formatCurrency(auction.totalAmount, auction.currency)}</span>
        </div>
        <div className='h-3 bg-muted rounded-full overflow-hidden flex'>
          <div
            className='h-full bg-foreground transition-all'
            style={{ width: `${Math.min((totalOurCost / auction.totalAmount) * 100, 100)}%` }}
          />
        </div>
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span>Our Cost: {((totalOurCost / auction.totalAmount) * 100).toFixed(1)}%</span>
          <span>Margin: {(100 - (totalOurCost / auction.totalAmount) * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Expense Categories */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
            Expense Breakdown
          </h3>
          {onAddCost && (
            <Button size='sm' variant='outline' onClick={onAddCost} className='gap-2 h-8'>
              <MdAdd className='h-4 w-4' />
              Add Cost
            </Button>
          )}
        </div>

        {/* Category Cards */}
        {activeCategories.length > 0 ? (
          <>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
              {visibleCategories.map((category) => {
                const config = CATEGORY_CONFIG[category]
                const Icon = config.icon
                const amount = costs.categoryTotals[category]
                const percentage = costs.totalCost > 0 ? (amount / costs.totalCost) * 100 : 0
                const isSelected = selectedCategory === category

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(isSelected ? 'all' : category)}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all',
                      isSelected
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-card hover:bg-muted/50'
                    )}
                  >
                    <div className='flex items-center gap-2 mb-3'>
                      <Icon className={cn('h-4 w-4', isSelected ? 'text-background' : 'text-muted-foreground')} />
                      <span className='text-sm font-medium'>{config.label}</span>
                    </div>
                    <p className='text-lg font-bold font-data'>{formatCurrency(amount, auction.currency)}</p>
                    <div className='mt-2 h-1 bg-muted rounded-full overflow-hidden'>
                      <div
                        className={cn('h-full rounded-full', isSelected ? 'bg-background' : 'bg-foreground')}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className={cn('text-xs mt-1', isSelected ? 'text-background/70' : 'text-muted-foreground')}>
                      {percentage.toFixed(1)}%
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Show more/less */}
            {activeCategories.length > 4 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className='flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                {showAllCategories ? (
                  <>
                    <MdExpandLess className='h-4 w-4' />
                    Show less
                  </>
                ) : (
                  <>
                    <MdExpandMore className='h-4 w-4' />
                    Show {activeCategories.length - 4} more categories
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            <MdReceipt className='h-12 w-12 mx-auto mb-3 opacity-30' />
            <p>No expenses recorded yet</p>
          </div>
        )}
      </div>

      {/* Cost Items Table */}
      {filteredItems.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
              {selectedCategory === 'all' ? 'All Transactions' : `${CATEGORY_CONFIG[selectedCategory].label} Transactions`}
            </h3>
            <span className='text-sm text-muted-foreground'>{filteredItems.length} items</span>
          </div>

          <Card className='overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  <TableHead className='font-semibold'>Description</TableHead>
                  <TableHead className='font-semibold'>Vendor</TableHead>
                  <TableHead className='font-semibold'>Date</TableHead>
                  <TableHead className='font-semibold'>Ref</TableHead>
                  <TableHead className='text-right font-semibold'>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const config = CATEGORY_CONFIG[item.category]
                  const Icon = config.icon
                  return (
                    <TableRow key={item.id} className='hover:bg-muted/30'>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <div className='h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                            <Icon className='h-4 w-4 text-muted-foreground' />
                          </div>
                          <div>
                            <p className='font-medium'>{item.description}</p>
                            {item.notes && (
                              <p className='text-xs text-muted-foreground truncate max-w-[250px]'>
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>{item.paidTo || '-'}</TableCell>
                      <TableCell className='text-muted-foreground'>
                        {format(new Date(item.date), 'MMM d')}
                      </TableCell>
                      <TableCell>
                        {item.invoiceRef && (
                          <Badge variant='outline' className='text-xs font-mono'>
                            {item.invoiceRef}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-right font-bold font-data'>
                        {formatCurrency(item.amount, item.currency)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Total Footer */}
          <div className='flex justify-between items-center pt-4 border-t'>
            <span className='text-muted-foreground'>
              {selectedCategory === 'all' ? 'Total Expenses' : `${CATEGORY_CONFIG[selectedCategory].label} Total`}
            </span>
            <span className='text-2xl font-bold font-data'>
              {formatCurrency(
                selectedCategory === 'all'
                  ? costs.totalCost
                  : costs.categoryTotals[selectedCategory],
                auction.currency
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
