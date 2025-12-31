'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import {
  MdPerson,
  MdManageAccounts,
  MdLocationOn,
  MdEmail,
  MdAccountBalanceWallet,
  MdAccessTime,
  MdGavel,
  MdBusiness,
  MdTag,
  MdCalendarToday,
  MdTrendingUp,
  MdWarning,
  MdChevronRight,
  MdVerifiedUser,
} from 'react-icons/md'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type Bid } from '../../data/bids'

// Animated number counter hook
function useAnimatedNumber(value: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round(startValue + (value - startValue) * easeProgress)
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return displayValue
}

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
      damping: 24,
    },
  },
}

const levelStyles: Record<string, string> = {
  unverified: 'bg-muted text-muted-foreground',
  verified: 'bg-emerald-500/15 text-emerald-600',
  premium: 'bg-amber-500/15 text-amber-700',
  business: 'bg-blue-500/15 text-blue-600',
  business_premium: 'bg-purple-500/15 text-purple-700',
}

const levelLabels: Record<string, string> = {
  unverified: 'Unverified',
  verified: 'Verified',
  premium: 'Premium',
  business: 'Business',
  business_premium: 'Business Premium',
}

interface BidPageSidebarProps {
  bid: Bid
}

export function BidPageSidebar({ bid }: BidPageSidebarProps) {
  const router = useRouter()
  const animatedDeposit = useAnimatedNumber(bid.bidder.depositAmount)
  const animatedServiceFee = useAnimatedNumber(bid.serviceFee)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleViewCustomer = () => {
    router.push(`/customers/${bid.bidder.id}`)
  }

  return (
    <motion.div
      className='w-[300px] shrink-0 border-r bg-gradient-to-b from-muted/10 via-muted/20 to-muted/30 overflow-y-auto'
      initial='hidden'
      animate='visible'
      variants={containerVariants}
    >
      <div className='p-4 space-y-4'>
        {/* Bidder Card */}
        <motion.div
          className='rounded-xl border border-border/50 bg-card overflow-hidden cursor-pointer'
          variants={cardVariants}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={handleViewCustomer}
        >
          <div className='px-4 py-3 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/50'>
            <div className='flex items-center gap-2'>
              <div className='p-1.5 rounded-lg bg-primary/10'>
                <MdPerson className='h-4 w-4 text-primary' />
              </div>
              <h3 className='text-sm font-semibold'>Bidder</h3>
            </div>
          </div>

          <div className='p-4'>
            <div className='flex items-start gap-3'>
              <motion.div
                className='relative'
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Avatar className='h-14 w-14'>
                  <AvatarFallback
                    className={cn(
                      'text-sm font-semibold',
                      bid.bidder.level === 'premium' || bid.bidder.level === 'business_premium'
                        ? 'bg-amber-500/20 text-amber-600'
                        : 'bg-primary/10 text-primary'
                    )}
                  >
                    {getInitials(bid.bidder.name)}
                  </AvatarFallback>
                </Avatar>
                {bid.bidder.level === 'unverified' && (
                  <div className='absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500'>
                    <MdWarning className='h-3 w-3 text-white' />
                  </div>
                )}
                {bid.bidder.level === 'verified' && (
                  <div className='absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500'>
                    <MdVerifiedUser className='h-3 w-3 text-white' />
                  </div>
                )}
              </motion.div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <p className='font-semibold truncate'>{bid.bidder.name}</p>
                  <MdChevronRight className='h-4 w-4 text-muted-foreground' />
                </div>
                <Badge className={cn('text-xs mt-1', levelStyles[bid.bidder.level])}>
                  {levelLabels[bid.bidder.level]}
                </Badge>
              </div>
            </div>

            <div className='mt-4 space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <MdEmail className='h-3.5 w-3.5' />
                <span className='truncate'>{bid.bidder.email}</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <MdLocationOn className='h-3.5 w-3.5' />
                <span className='truncate'>{bid.bidder.location}</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <MdAccountBalanceWallet className='h-3.5 w-3.5 text-muted-foreground' />
                <span
                  className={cn(
                    'font-medium',
                    bid.bidder.depositAmount > 0 ? 'text-emerald-600' : 'text-muted-foreground'
                  )}
                >
                  {bid.bidder.depositAmount > 0
                    ? `¥${animatedDeposit.toLocaleString()} deposit`
                    : 'No deposit'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bid Stats Card */}
        <motion.div
          className='rounded-xl border border-border/50 bg-card overflow-hidden'
          variants={cardVariants}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className='px-4 py-3 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent border-b border-border/50'>
            <div className='flex items-center gap-2'>
              <div className='p-1.5 rounded-lg bg-blue-500/10'>
                <MdTrendingUp className='h-4 w-4 text-blue-500' />
              </div>
              <h3 className='text-sm font-semibold'>Bid Stats</h3>
            </div>
          </div>

          <div className='p-4 space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Type</span>
              <span className='text-sm font-medium flex items-center gap-1.5'>
                {bid.type === 'assisted' ? (
                  <>
                    <MdManageAccounts className='h-3.5 w-3.5' />
                    Assisted
                  </>
                ) : (
                  <>
                    <MdPerson className='h-3.5 w-3.5' />
                    Manual
                  </>
                )}
              </span>
            </div>

            {bid.type === 'assisted' && bid.assistedBy && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Assisted By</span>
                <span className='text-sm font-medium'>{bid.assistedBy}</span>
              </div>
            )}

            {bid.maxBid && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Max Bid</span>
                <span className='text-sm font-medium text-blue-600'>
                  ¥{bid.maxBid.toLocaleString()}
                </span>
              </div>
            )}

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Service Fee</span>
              <span className='text-sm font-medium'>¥{animatedServiceFee.toLocaleString()}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Total Bids</span>
              <span className='text-sm font-medium'>{bid.totalBids}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Source</span>
              <Badge variant='outline' className='text-xs capitalize'>
                {bid.source}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Auction Details Card */}
        <motion.div
          className='rounded-xl border border-border/50 bg-card overflow-hidden'
          variants={cardVariants}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className='px-4 py-3 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent border-b border-border/50'>
            <div className='flex items-center gap-2'>
              <div className='p-1.5 rounded-lg bg-emerald-500/10'>
                <MdGavel className='h-4 w-4 text-emerald-500' />
              </div>
              <h3 className='text-sm font-semibold'>Auction Details</h3>
            </div>
          </div>

          <div className='p-4 space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                <MdBusiness className='h-3.5 w-3.5' />
                House
              </span>
              <span className='text-sm font-medium'>{bid.auctionHouse}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                <MdTag className='h-3.5 w-3.5' />
                Lot Number
              </span>
              <span className='text-sm font-mono font-medium'>#{bid.lotNumber}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                <MdCalendarToday className='h-3.5 w-3.5' />
                Placed
              </span>
              <span className='text-sm font-medium'>{format(bid.timestamp, 'MMM d, yyyy')}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                <MdAccessTime className='h-3.5 w-3.5' />
                Time
              </span>
              <span className='text-sm font-medium'>{format(bid.timestamp, 'h:mm a')}</span>
            </div>
          </div>
        </motion.div>

        {/* Price Comparison Card */}
        <motion.div
          className='rounded-xl border border-border/50 bg-card overflow-hidden'
          variants={cardVariants}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className='px-4 py-3 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent border-b border-border/50'>
            <div className='flex items-center gap-2'>
              <div className='p-1.5 rounded-lg bg-amber-500/10'>
                <MdTrendingUp className='h-4 w-4 text-amber-500' />
              </div>
              <h3 className='text-sm font-semibold'>Price Comparison</h3>
            </div>
          </div>

          <div className='p-4 space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Our Bid</span>
              <span className='text-sm font-bold'>¥{bid.amount.toLocaleString()}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Current High</span>
              <span
                className={cn(
                  'text-sm font-medium',
                  bid.currentHighBid > bid.amount ? 'text-red-500' : 'text-emerald-600'
                )}
              >
                ¥{bid.currentHighBid.toLocaleString()}
              </span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Reserve</span>
              <span className='text-sm font-medium'>¥{bid.reservePrice.toLocaleString()}</span>
            </div>

            {bid.previousBid && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Previous Bid</span>
                <span className='text-sm font-medium text-muted-foreground'>
                  ¥{bid.previousBid.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Notes Card */}
        {bid.notes && (
          <motion.div
            className='rounded-xl border border-border/50 bg-card overflow-hidden'
            variants={cardVariants}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className='px-4 py-3 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent border-b border-border/50'>
              <h3 className='text-sm font-semibold'>Notes</h3>
            </div>
            <div className='p-4'>
              <p className='text-sm text-muted-foreground'>{bid.notes}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
