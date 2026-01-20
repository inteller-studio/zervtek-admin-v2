'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import {
  MdAttachMoney,
  MdLocalShipping,
  MdBuild,
  MdDescription,
  MdDirectionsBoat,
  MdWarehouse,
  MdGavel,
  MdMoreHoriz,
  MdReceipt,
  MdTrendingUp,
  MdTrendingDown,
  MdExpandMore,
  MdExpandLess,
  MdCreditCard,
  MdAccountBalanceWallet,
} from 'react-icons/md'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type Purchase, type CostItem, type OurCosts } from '../../data/won-auctions'
import { type PurchaseWorkflow, PAYMENT_METHODS } from '../../types/workflow'
import { mergeAllCosts } from '../../utils/workflow'

interface CostsBreakdownPanelProps {
  auction: Purchase
  workflow?: PurchaseWorkflow
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

// Get payment method label
const getMethodLabel = (method: string) => {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label || method
}

export function CostsBreakdownPanel({ auction, workflow }: CostsBreakdownPanelProps) {
  const [showCostDetails, setShowCostDetails] = useState(false)

  // === CUSTOMER PAYMENTS (Synced with Process tab) ===
  const customerPayments = workflow?.stages.paymentProcessing
  const invoiceTotal = auction.totalAmount
  const totalReceived = customerPayments?.totalReceived || 0
  const outstanding = invoiceTotal - totalReceived
  const paymentProgress = invoiceTotal > 0 ? Math.round((totalReceived / invoiceTotal) * 100) : 0
  const isFullyPaid = totalReceived >= invoiceTotal

  // === OUR COSTS ===
  const costs: OurCosts = useMemo(() => {
    return mergeAllCosts(auction.ourCosts, workflow)
  }, [auction.ourCosts, workflow])

  const vehicleCost = auction.winningBid
  const totalInvestment = vehicleCost + costs.totalCost

  // Get active categories
  const activeCategories = useMemo(() => {
    return Object.entries(costs.categoryTotals)
      .filter(([_, amount]) => amount > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([category]) => category as CostItem['category'])
  }, [costs.categoryTotals])

  // === PROFIT/LOSS ===
  const profitLoss = totalReceived - totalInvestment
  const isProfitable = profitLoss >= 0
  const profitMargin = totalInvestment > 0 ? Math.abs((profitLoss / totalInvestment) * 100).toFixed(1) : '0.0'

  return (
    <div className='p-4 space-y-4'>
      {/* === HERO: PROFIT/LOSS CARD === */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          'relative overflow-hidden rounded-xl border p-6',
          'shadow-sm transition-all duration-300',
          isProfitable
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-red-500/5 border-red-500/20'
        )}
      >
        <div className='flex items-start justify-between'>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>
              Net {isProfitable ? 'Profit' : 'Loss'}
            </p>
            <p className={cn(
              'text-4xl font-semibold tracking-tight mt-2 font-data',
              isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}>
              {isProfitable ? '+' : '-'}{formatCurrency(Math.abs(profitLoss), auction.currency)}
            </p>
          </div>
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium',
            isProfitable
              ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
          )}>
            {isProfitable ? <MdTrendingUp className='h-4 w-4' /> : <MdTrendingDown className='h-4 w-4' />}
            {profitMargin}%
          </span>
        </div>

        {/* Comparison row */}
        <div className='mt-6 pt-4 border-t border-border/50 flex gap-8'>
          <div>
            <p className='text-xs text-muted-foreground'>Revenue Received</p>
            <p className='text-lg font-semibold font-data'>{formatCurrency(totalReceived, auction.currency)}</p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground'>Total Investment</p>
            <p className='text-lg font-semibold font-data'>{formatCurrency(totalInvestment, auction.currency)}</p>
          </div>
        </div>
        <p className='text-xs text-muted-foreground mt-3'>Based on received payments</p>
      </motion.div>

      {/* === STATS CARDS ROW === */}
      <div className='grid gap-4 md:grid-cols-3'>
        {/* Invoice Total */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className='group'
        >
          <div className={cn(
            'relative overflow-hidden rounded-xl border bg-card p-6',
            'border-border/50 hover:border-border',
            'shadow-sm hover:shadow-md',
            'transition-all duration-300 ease-out'
          )}>
            <div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/[0.02] to-transparent' />
            <div className='relative'>
              <p className='text-sm font-medium text-muted-foreground'>Invoice Total</p>
              <p className='text-3xl font-semibold tracking-tight mt-2 font-data'>
                {formatCurrency(invoiceTotal, auction.currency)}
              </p>
              <p className='text-xs text-muted-foreground mt-2'>Amount owed by customer</p>
            </div>
          </div>
        </motion.div>

        {/* Received */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className='group'
        >
          <div className={cn(
            'relative overflow-hidden rounded-xl border bg-card p-6',
            'border-border/50 hover:border-border',
            'shadow-sm hover:shadow-md',
            'transition-all duration-300 ease-out'
          )}>
            <div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/[0.02] to-transparent' />
            <div className='relative'>
              <p className='text-sm font-medium text-muted-foreground'>Received</p>
              <p className={cn(
                'text-3xl font-semibold tracking-tight mt-2 font-data',
                isFullyPaid && 'text-emerald-600 dark:text-emerald-400'
              )}>
                {formatCurrency(totalReceived, auction.currency)}
              </p>
              <div className='flex items-center gap-2 mt-2'>
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  isFullyPaid
                    ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                )}>
                  {paymentProgress}%
                </span>
                <span className='text-xs text-muted-foreground'>of invoice</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Outstanding */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className='group'
        >
          <div className={cn(
            'relative overflow-hidden rounded-xl border bg-card p-6',
            'border-border/50 hover:border-border',
            'shadow-sm hover:shadow-md',
            'transition-all duration-300 ease-out',
            outstanding > 0 && 'border-amber-500/30'
          )}>
            <div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/[0.02] to-transparent' />
            <div className='relative'>
              <p className='text-sm font-medium text-muted-foreground'>Outstanding</p>
              <p className={cn(
                'text-3xl font-semibold tracking-tight mt-2 font-data',
                outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              )}>
                {formatCurrency(outstanding, auction.currency)}
              </p>
              <p className='text-xs text-muted-foreground mt-2'>
                {outstanding > 0 ? 'Awaiting payment' : 'Fully paid'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* === INVESTMENT CARD === */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className='group'
      >
        <div className={cn(
          'relative overflow-hidden rounded-xl border bg-card p-6',
          'border-border/50 hover:border-border',
          'shadow-sm hover:shadow-md',
          'transition-all duration-300 ease-out'
        )}>
          <div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/[0.02] to-transparent' />

          <div className='relative'>
            <div className='flex items-start justify-between mb-6'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Total Investment</p>
                <p className='text-3xl font-semibold tracking-tight mt-2 font-data'>
                  {formatCurrency(totalInvestment, auction.currency)}
                </p>
              </div>
              <MdAccountBalanceWallet className='h-6 w-6 text-muted-foreground' />
            </div>

            {/* Two mini stats */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='rounded-lg bg-muted/50 p-4'>
                <p className='text-xs text-muted-foreground'>Vehicle Cost</p>
                <p className='text-xl font-semibold mt-1 font-data'>{formatCurrency(vehicleCost, auction.currency)}</p>
              </div>
              <div className='rounded-lg bg-muted/50 p-4'>
                <p className='text-xs text-muted-foreground'>Expenses</p>
                <p className='text-xl font-semibold mt-1 font-data'>{formatCurrency(costs.totalCost, auction.currency)}</p>
              </div>
            </div>

            {/* Expandable breakdown */}
            {activeCategories.length > 0 && (
              <div className='mt-4 pt-4 border-t border-border/50'>
                <button
                  onClick={() => setShowCostDetails(!showCostDetails)}
                  className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showCostDetails ? (
                    <MdExpandLess className='h-4 w-4' />
                  ) : (
                    <MdExpandMore className='h-4 w-4' />
                  )}
                  {showCostDetails ? 'Hide' : 'Show'} breakdown ({activeCategories.length} categories)
                </button>

                {showCostDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className='mt-3 flex flex-wrap gap-2'
                  >
                    {activeCategories.map((category) => {
                      const config = CATEGORY_CONFIG[category]
                      const Icon = config.icon
                      const amount = costs.categoryTotals[category]

                      return (
                        <div
                          key={category}
                          className='inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5'
                        >
                          <Icon className='h-4 w-4 text-muted-foreground' />
                          <span className='text-sm'>{config.label}</span>
                          <span className='text-sm font-medium font-data'>
                            {formatCurrency(amount, auction.currency)}
                          </span>
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </div>
            )}

            {activeCategories.length === 0 && costs.totalCost === 0 && (
              <div className='mt-4 pt-4 border-t border-border/50'>
                <p className='text-sm text-muted-foreground text-center py-2'>No additional expenses recorded</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* === PAYMENT HISTORY CARD === */}
      {customerPayments && customerPayments.payments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className='group'
        >
          <div className={cn(
            'relative overflow-hidden rounded-xl border bg-card p-6',
            'border-border/50 hover:border-border',
            'shadow-sm hover:shadow-md',
            'transition-all duration-300 ease-out'
          )}>
            <div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/[0.02] to-transparent' />

            <div className='relative'>
              <div className='flex items-center justify-between mb-4'>
                <p className='text-sm font-medium text-muted-foreground'>Payment History</p>
                <Badge variant='outline' className='text-xs'>
                  Synced with Process
                </Badge>
              </div>

              <div className='space-y-3'>
                {customerPayments.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className='flex items-center justify-between py-2 border-b border-border/30 last:border-0'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center'>
                        <MdCreditCard className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                      </div>
                      <div>
                        <p className='text-sm font-medium'>
                          {format(new Date(payment.receivedAt), 'MMM d, yyyy')}
                        </p>
                        <p className='text-xs text-muted-foreground'>{getMethodLabel(payment.method)}</p>
                      </div>
                    </div>
                    <p className='text-lg font-semibold text-emerald-600 dark:text-emerald-400 font-data'>
                      {formatCurrency(payment.amount, auction.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* === NO PAYMENTS PLACEHOLDER === */}
      {(!customerPayments || customerPayments.payments.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className='group'
        >
          <div className={cn(
            'relative overflow-hidden rounded-xl border bg-card p-6',
            'border-border/50',
            'shadow-sm',
            'transition-all duration-300 ease-out'
          )}>
            <div className='relative'>
              <div className='flex items-center justify-between mb-4'>
                <p className='text-sm font-medium text-muted-foreground'>Payment History</p>
                <Badge variant='outline' className='text-xs'>
                  Synced with Process
                </Badge>
              </div>

              <div className='flex flex-col items-center justify-center py-8 text-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3'>
                  <MdReceipt className='h-6 w-6 text-muted-foreground/50' />
                </div>
                <p className='text-sm text-muted-foreground'>No payments recorded yet</p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Add payments in Process tab
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
