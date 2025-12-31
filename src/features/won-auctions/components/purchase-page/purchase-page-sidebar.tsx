'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdCreditCard,
  MdDirectionsBoat,
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdAttachMoney,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdOpenInNew,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../data/won-auctions'
import { type PurchaseWorkflow, WORKFLOW_STAGES } from '../../types/workflow'
import { isStageComplete, canAccessStage, getStageKey } from '../../utils/workflow'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
}

const stageItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
  },
}

// Animated number counter hook
function useAnimatedNumber(value: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(startValue + (value - startValue) * easeOut)

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return displayValue
}

interface PurchasePageSidebarProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  activeStage: string
  paymentProgress: number
  onStageChange: (stage: string) => void
  onRecordPayment: () => void
  onUpdateShipping: () => void
}

export function PurchasePageSidebar({
  auction,
  workflow,
  activeStage,
  paymentProgress,
  onStageChange,
  onRecordPayment,
  onUpdateShipping,
}: PurchasePageSidebarProps) {
  const animatedPaid = useAnimatedNumber(auction.paidAmount)
  const animatedTotal = useAnimatedNumber(auction.totalAmount)
  const animatedProgress = useAnimatedNumber(paymentProgress, 800)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: auction.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const outstandingAmount = auction.totalAmount - auction.paidAmount
  const paidPercentage = (auction.paidAmount / auction.totalAmount) * 100

  return (
    <aside className='w-72 shrink-0 border-r bg-gradient-to-b from-muted/10 via-muted/20 to-muted/30 overflow-hidden flex flex-col'>
      <ScrollArea className='flex-1'>
        <motion.div
          className='p-4 space-y-4'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          {/* Payment Stats Card - Premium */}
          <motion.div variants={cardVariants}>
            <Card className='overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all duration-300 group'>
              {/* Gradient header */}
              <CardHeader className='pb-2 bg-gradient-to-r from-primary/5 via-transparent to-transparent'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <motion.div
                    className='p-1.5 rounded-lg bg-primary/10'
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <MdCreditCard className='h-4 w-4 text-primary' />
                  </motion.div>
                  Payment Status
                  <Badge
                    className={cn(
                      'ml-auto text-[10px]',
                      paymentProgress >= 100 && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                      paymentProgress > 0 && paymentProgress < 100 && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                      paymentProgress === 0 && 'bg-red-500/10 text-red-600 border-red-500/20'
                    )}
                    variant='outline'
                  >
                    {paymentProgress >= 100 ? 'Paid' : paymentProgress > 0 ? 'Partial' : 'Pending'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Amount breakdown with animated numbers */}
                <div className='space-y-2'>
                  <motion.div
                    className='flex justify-between items-center'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className='text-sm text-muted-foreground'>Paid</span>
                    <motion.span
                      className='font-bold text-emerald-600 text-lg tabular-nums'
                      key={animatedPaid}
                    >
                      {formatCurrency(animatedPaid)}
                    </motion.span>
                  </motion.div>
                  <motion.div
                    className='flex justify-between items-center'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className='text-sm text-muted-foreground'>Outstanding</span>
                    <span className={cn(
                      'font-semibold tabular-nums',
                      outstandingAmount > 0 ? 'text-amber-600' : 'text-muted-foreground'
                    )}>
                      {formatCurrency(outstandingAmount)}
                      {outstandingAmount > 0 && (
                        <motion.span
                          className='inline-block ml-1 w-1.5 h-1.5 rounded-full bg-amber-500'
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </span>
                  </motion.div>
                  <div className='h-px bg-border my-1' />
                  <motion.div
                    className='flex justify-between items-center'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className='text-sm font-medium'>Total</span>
                    <span className='font-bold text-lg tabular-nums'>{formatCurrency(animatedTotal)}</span>
                  </motion.div>
                </div>

                {/* Multi-segment progress bar */}
                <div className='space-y-2'>
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>Progress</span>
                    <motion.span
                      className={cn(
                        'font-bold',
                        paymentProgress >= 100 ? 'text-emerald-600' : 'text-primary'
                      )}
                      key={animatedProgress}
                    >
                      {animatedProgress}%
                    </motion.span>
                  </div>
                  <div className='h-2.5 bg-muted rounded-full overflow-hidden shadow-inner'>
                    <motion.div
                      className={cn(
                        'h-full rounded-full relative overflow-hidden',
                        paymentProgress >= 100
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : 'bg-gradient-to-r from-primary to-primary/80'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${paidPercentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    >
                      <motion.div
                        className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent'
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                    </motion.div>
                  </div>
                </div>

                {auction.paymentStatus !== 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      size='sm'
                      className='w-full group/btn relative overflow-hidden'
                      onClick={onRecordPayment}
                    >
                      <motion.div
                        className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent'
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                      <MdAttachMoney className='h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform' />
                      Record Payment
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping Status Card - Premium */}
          <motion.div variants={cardVariants}>
            <Card className='overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all duration-300'>
              <CardHeader className='pb-2 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <motion.div
                    className='p-1.5 rounded-lg bg-purple-500/10'
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <MdDirectionsBoat className='h-4 w-4 text-purple-600' />
                  </motion.div>
                  Shipping
                  {auction.shipment && auction.status === 'shipping' && (
                    <div className='ml-auto flex items-center gap-1.5'>
                      <motion.span
                        className='w-2 h-2 rounded-full bg-purple-500'
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className='text-[10px] font-medium text-purple-600'>In Transit</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <AnimatePresence mode='wait'>
                  {auction.shipment ? (
                    <motion.div
                      key='shipping-info'
                      className='space-y-3'
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className='grid grid-cols-2 gap-2 text-sm'>
                        <div className='space-y-0.5'>
                          <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Carrier</span>
                          <p className='font-medium'>{auction.shipment.carrier}</p>
                        </div>
                        <div className='space-y-0.5'>
                          <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Status</span>
                          <Badge variant='outline' className='capitalize text-xs'>
                            {auction.shipment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className='space-y-0.5'>
                        <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Current Location</span>
                        <p className='font-medium text-sm flex items-center gap-1.5'>
                          <MdLocationOn className='h-3 w-3 text-purple-500' />
                          {auction.shipment.currentLocation}
                        </p>
                      </div>
                      {auction.shipment.estimatedDelivery && (
                        <div className='p-2 rounded-lg bg-purple-500/5 border border-purple-500/10'>
                          <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>ETA</span>
                          <p className='font-semibold text-purple-600'>
                            {format(new Date(auction.shipment.estimatedDelivery), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key='no-shipping'
                      className='text-center py-4'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <MdDirectionsBoat className='h-8 w-8 text-muted-foreground/30 mx-auto mb-2' />
                      <p className='text-sm text-muted-foreground mb-3'>No shipping info yet</p>
                      <Button variant='outline' size='sm' onClick={onUpdateShipping} className='group/btn'>
                        <motion.span whileHover={{ x: 3 }} className='flex items-center'>
                          Add Shipping
                          <MdOpenInNew className='h-3 w-3 ml-1.5 opacity-0 group-hover/btn:opacity-100 transition-opacity' />
                        </motion.span>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Info Card - Premium */}
          <motion.div variants={cardVariants}>
            <Card className='overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all duration-300 group'>
              <CardHeader className='pb-2 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <motion.div
                    className='p-1.5 rounded-lg bg-blue-500/10 relative'
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <MdPerson className='h-4 w-4 text-blue-600' />
                    {/* Online indicator */}
                    <motion.span
                      className='absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background'
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <motion.p
                  className='font-semibold text-base'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {auction.winnerName}
                </motion.p>
                <motion.div
                  className='space-y-2'
                  variants={containerVariants}
                  initial='hidden'
                  animate='visible'
                >
                  <motion.a
                    href={`mailto:${auction.winnerEmail}`}
                    className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group/link'
                    variants={stageItemVariants}
                    whileHover={{ x: 2 }}
                  >
                    <MdEmail className='h-3.5 w-3.5 group-hover/link:text-primary transition-colors' />
                    <span className='truncate'>{auction.winnerEmail}</span>
                  </motion.a>
                  <motion.a
                    href={`tel:${auction.winnerPhone}`}
                    className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group/link'
                    variants={stageItemVariants}
                    whileHover={{ x: 2 }}
                  >
                    <MdPhone className='h-3.5 w-3.5 group-hover/link:text-primary transition-colors' />
                    <span>{auction.winnerPhone}</span>
                  </motion.a>
                  {auction.destinationPort && (
                    <motion.div
                      className='flex items-center gap-2 text-sm text-muted-foreground'
                      variants={stageItemVariants}
                    >
                      <MdLocationOn className='h-3.5 w-3.5' />
                      <span>{auction.destinationPort}</span>
                    </motion.div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stage Navigator - Premium */}
          <motion.div variants={cardVariants}>
            <Card className='overflow-hidden border-border/50'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Workflow Stages</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <motion.div
                  className='divide-y'
                  variants={containerVariants}
                  initial='hidden'
                  animate='visible'
                >
                  {WORKFLOW_STAGES.map((stage, index) => {
                    const isComplete = isStageComplete(workflow, stage.number)
                    const canAccess = canAccessStage(workflow, stage.number)
                    const stageKey = getStageKey(stage.number)
                    const isActive = stageKey === activeStage

                    return (
                      <motion.button
                        key={stage.number}
                        onClick={() => stageKey && canAccess && onStageChange(stageKey)}
                        disabled={!canAccess}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 relative',
                          isActive && 'bg-primary/5',
                          canAccess && !isActive && 'hover:bg-muted/50',
                          !canAccess && 'opacity-40 cursor-not-allowed'
                        )}
                        variants={stageItemVariants}
                        whileHover={canAccess ? { x: 4 } : undefined}
                        whileTap={canAccess ? { scale: 0.98 } : undefined}
                      >
                        {/* Active indicator bar */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              className='absolute left-0 top-0 bottom-0 w-0.5 bg-primary'
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              exit={{ scaleY: 0 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            />
                          )}
                        </AnimatePresence>

                        <AnimatePresence mode='wait'>
                          {isComplete ? (
                            <motion.div
                              key='complete'
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            >
                              <MdCheckCircle className='h-4 w-4 text-emerald-500 shrink-0' />
                            </motion.div>
                          ) : (
                            <motion.div
                              key='incomplete'
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                            >
                              <MdRadioButtonUnchecked
                                className={cn(
                                  'h-4 w-4 shrink-0 transition-colors',
                                  isActive ? 'text-primary' : 'text-muted-foreground'
                                )}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <span
                          className={cn(
                            'text-sm transition-colors',
                            isActive && 'font-semibold text-primary',
                            isComplete && !isActive && 'text-muted-foreground'
                          )}
                        >
                          {stage.number}. {stage.shortLabel}
                        </span>
                        {isActive && (
                          <motion.span
                            className='ml-auto text-[10px] text-primary font-medium'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            Current
                          </motion.span>
                        )}
                      </motion.button>
                    )
                  })}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </ScrollArea>
    </aside>
  )
}
