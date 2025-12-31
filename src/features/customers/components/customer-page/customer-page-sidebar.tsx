'use client'

import { format } from 'date-fns'
import { motion } from 'framer-motion'
import {
  MdCalendarToday,
  MdAccessTime,
  MdPersonAdd,
  MdVerifiedUser,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { type Customer } from '../../data/customers'

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
      damping: 24,
    },
  },
}

interface CustomerPageSidebarProps {
  customer: Customer
  onClaimCustomer: () => void
}

export function CustomerPageSidebar({ customer, onClaimCustomer }: CustomerPageSidebarProps) {
  const getDaysSinceActive = (date: Date) => {
    const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  const isRecentlyActive = () => {
    const days = Math.floor((new Date().getTime() - customer.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    return days <= 7
  }

  return (
    <motion.div
      className='w-[280px] shrink-0 border-r bg-gradient-to-b from-muted/10 via-muted/20 to-muted/30 overflow-y-auto'
      initial='hidden'
      animate='visible'
      variants={containerVariants}
    >
      <div className='p-4 space-y-4'>
        {/* Account Details Card */}
        <motion.div
          className='rounded-xl border border-border/50 bg-card overflow-hidden'
          variants={cardVariants}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className='px-4 py-3 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent border-b border-border/50'>
            <div className='flex items-center gap-2'>
              <div className='p-1.5 rounded-lg bg-emerald-500/10'>
                <MdVerifiedUser className='h-4 w-4 text-emerald-500' />
              </div>
              <h3 className='text-sm font-semibold'>Account Details</h3>
            </div>
          </div>

          <div className='p-4 space-y-3'>
            {/* Assigned To */}
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Assigned To</span>
              {customer.assignedToName ? (
                <span className='font-medium flex items-center gap-1.5'>
                  <MdVerifiedUser className='h-3.5 w-3.5 text-emerald-500' />
                  {customer.assignedToName}
                </span>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  className='h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:hover:bg-emerald-950'
                  onClick={onClaimCustomer}
                >
                  <MdPersonAdd className='mr-1.5 h-3.5 w-3.5' />
                  Claim
                </Button>
              )}
            </div>

            {/* Registered */}
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground flex items-center gap-1.5'>
                <MdCalendarToday className='h-3.5 w-3.5' />
                Registered
              </span>
              <span className='font-medium'>{format(customer.createdAt, 'MMM dd, yyyy')}</span>
            </div>

            {/* Last Active */}
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground flex items-center gap-1.5'>
                <MdAccessTime className='h-3.5 w-3.5' />
                Last Active
              </span>
              <span className='font-medium flex items-center gap-1.5'>
                {isRecentlyActive() && (
                  <motion.div
                    className='h-2 w-2 rounded-full bg-emerald-500'
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                {getDaysSinceActive(customer.lastActivity)}
              </span>
            </div>

            {/* Last Purchase */}
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Last Purchase</span>
              <span className='font-medium'>
                {customer.lastPurchase ? format(customer.lastPurchase, 'MMM dd, yyyy') : 'Never'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Notes Card */}
        {customer.notes && (
          <motion.div
            className='rounded-xl border border-border/50 bg-card overflow-hidden'
            variants={cardVariants}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className='px-4 py-3 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent border-b border-border/50'>
              <h3 className='text-sm font-semibold'>Notes</h3>
            </div>
            <div className='p-4'>
              <p className='text-sm text-muted-foreground'>{customer.notes}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
