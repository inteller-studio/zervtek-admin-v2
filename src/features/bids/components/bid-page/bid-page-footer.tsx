'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdCheck,
  MdCancel,
  MdEmojiEvents,
  MdDescription,
  MdGavel,
  MdHandshake,
  MdMessage,
  MdGroup,
  MdNotInterested,
  MdBlock,
  MdHelp,
  MdExpandMore,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { type Bid } from '../../data/bids'

interface BidPageFooterProps {
  bid: Bid
  onApprove: () => void
  onDecline: () => void
  onMarkWon: (type: 'bid_accepted' | 'contract' | 'contract_nego') => void
  onSoldToOthers: () => void
  onMarkUnsold: () => void
  onCancelBid: () => void
  onAuctionCancelled: () => void
  onIncreaseBid: () => void
  onCreateInvoice: () => void
}

export function BidPageFooter({
  bid,
  onApprove,
  onDecline,
  onMarkWon,
  onSoldToOthers,
  onMarkUnsold,
  onCancelBid,
  onAuctionCancelled,
  onIncreaseBid,
  onCreateInvoice,
}: BidPageFooterProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  const isPendingApproval = bid.status === 'pending_approval'
  const isActiveOrWinning = bid.status === 'active' || bid.status === 'winning'
  const isWon = bid.status === 'won'
  const canIncreaseBid =
    bid.auctionStatus === 'live' && bid.status !== 'winning' && bid.status !== 'pending_approval'

  const handleApprove = async () => {
    setIsApproving(true)
    await onApprove()
    setIsApproving(false)
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    await onDecline()
    setIsDeclining(false)
  }

  return (
    <motion.div
      className='flex items-center justify-between border-t px-6 py-4 shrink-0 relative overflow-hidden'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Glass morphism background */}
      <div className='absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-muted/30 backdrop-blur-sm' />

      {/* Subtle animated gradient overlay */}
      <motion.div
        className='absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] opacity-50'
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <div className='relative flex items-center justify-between w-full'>
        {/* Left Side - Primary Actions */}
        <div className='flex items-center gap-3'>
          <AnimatePresence mode='wait'>
            {/* Pending Approval Actions */}
            {isPendingApproval && (
              <motion.div
                key='pending-actions'
                className='flex items-center gap-3'
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size='default'
                        className='group relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 text-white'
                        disabled={isApproving}
                      >
                        <motion.div
                          className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent'
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                        <MdCheck className='mr-2 h-4 w-4 group-hover:scale-110 transition-transform' />
                        {isApproving ? 'Approving...' : 'Approve Bid'}
                      </Button>
                    </motion.div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Bid</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve this bid of ¥{bid.amount.toLocaleString()} for{' '}
                        {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className='bg-emerald-600 hover:bg-emerald-700'
                        onClick={handleApprove}
                      >
                        Approve
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size='default'
                        variant='outline'
                        className='group relative overflow-hidden bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:text-red-700'
                        disabled={isDeclining}
                      >
                        <motion.div
                          className='absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent'
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                        <MdCancel className='mr-2 h-4 w-4 group-hover:scale-110 transition-transform' />
                        {isDeclining ? 'Declining...' : 'Decline'}
                      </Button>
                    </motion.div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Decline Bid</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to decline this bid? This action cannot be undone and the
                        bidder will be notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className='bg-red-600 hover:bg-red-700' onClick={handleDecline}>
                        Decline Bid
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            )}

            {/* Active/Winning Bid Actions */}
            {isActiveOrWinning && (
              <motion.div
                key='active-actions'
                className='flex items-center gap-3'
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size='default'
                        className='group relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 text-white'
                      >
                        <motion.div
                          className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent'
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                        <MdEmojiEvents className='mr-2 h-4 w-4 group-hover:scale-110 transition-transform' />
                        Mark Won
                        <MdExpandMore className='ml-2 h-4 w-4' />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-52'>
                    <DropdownMenuLabel className='text-xs text-muted-foreground'>
                      Won Results
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onMarkWon('bid_accepted')}>
                      <MdEmojiEvents className='mr-2 h-4 w-4 text-emerald-600' />
                      Bid Accepted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMarkWon('contract')}>
                      <MdHandshake className='mr-2 h-4 w-4 text-emerald-600' />
                      Contract
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMarkWon('contract_nego')}>
                      <MdMessage className='mr-2 h-4 w-4 text-emerald-600' />
                      Contract by Nego
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button size='default' variant='outline' className='group relative overflow-hidden'>
                        <motion.div
                          className='absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent'
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                        <MdCancel className='mr-2 h-4 w-4 group-hover:scale-110 transition-transform' />
                        Mark Lost
                        <MdExpandMore className='ml-2 h-4 w-4' />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-52'>
                    <DropdownMenuLabel className='text-xs text-muted-foreground'>
                      Lost Results
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={onSoldToOthers}>
                      <MdGroup className='mr-2 h-4 w-4 text-red-500' />
                      Sold to Others
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onMarkUnsold}>
                      <MdNotInterested className='mr-2 h-4 w-4 text-orange-500' />
                      Unsold
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className='text-xs text-muted-foreground'>Other</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onCancelBid}>
                      <MdCancel className='mr-2 h-4 w-4' />
                      Bid Canceled
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onAuctionCancelled}>
                      <MdBlock className='mr-2 h-4 w-4' />
                      Auction Cancelled
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MdHelp className='mr-2 h-4 w-4' />
                      Unknown
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}

            {/* Won Bid Actions */}
            {isWon && (
              <motion.div
                key='won-actions'
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size='default'
                    className='group relative overflow-hidden'
                    onClick={onCreateInvoice}
                  >
                    <motion.div
                      className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent'
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <MdDescription className='mr-2 h-4 w-4 group-hover:scale-110 transition-transform' />
                    Create Invoice
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          {(isPendingApproval || isActiveOrWinning || isWon) && canIncreaseBid && (
            <div className='w-px h-8 bg-border/50' />
          )}

          {/* Increase Bid */}
          {canIncreaseBid && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size='default'
                  variant='outline'
                  className='group relative overflow-hidden'
                  onClick={onIncreaseBid}
                >
                  <motion.div
                    className='absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent'
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                  <MdGavel className='mr-2 h-4 w-4 group-hover:scale-110 transition-transform' />
                  Increase Bid
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Right Side - Bid Info */}
        <motion.div
          className={cn(
            'px-4 py-2 rounded-xl text-sm relative overflow-hidden',
            'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20'
          )}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <div className='relative flex items-center gap-2'>
            <MdGavel className='h-4 w-4 text-primary' />
            <span className='font-medium'>¥{bid.amount.toLocaleString()}</span>
            <span className='text-muted-foreground'>•</span>
            <span className='text-muted-foreground'>{bid.auctionHouse}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
