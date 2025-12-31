'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MdAutorenew } from 'react-icons/md'
import { toast } from 'sonner'
import { bids, type Bid } from '../data/bids'
import { BidPageHeader } from './bid-page/bid-page-header'
import { BidPageSidebar } from './bid-page/bid-page-sidebar'
import { BidPageContent } from './bid-page/bid-page-content'
import { BidPageFooter } from './bid-page/bid-page-footer'

interface BidDetailPageProps {
  bidId: string
}

export function BidDetailPage({ bidId }: BidDetailPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Find the bid from mock data
  const bid = useMemo(() => {
    return bids.find((b) => b.id === bidId)
  }, [bidId])

  if (!bid) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold mb-2'>Bid Not Found</h2>
          <p className='text-muted-foreground mb-4'>
            The bid you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/bids')}
            className='text-primary hover:underline'
          >
            Go back to bids
          </button>
        </div>
      </div>
    )
  }

  // Handler functions
  const handleApprove = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Bid approved successfully', {
      description: `Bid ${bid.bidNumber} has been approved.`,
    })
    setIsLoading(false)
  }

  const handleDecline = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Bid declined', {
      description: `Bid ${bid.bidNumber} has been declined.`,
    })
    setIsLoading(false)
  }

  const handleMarkWon = (type: 'bid_accepted' | 'contract' | 'contract_nego') => {
    const typeLabels = {
      bid_accepted: 'Bid Accepted',
      contract: 'Contract',
      contract_nego: 'Contract by Negotiation',
    }
    toast.success(`Bid marked as Won - ${typeLabels[type]}`, {
      description: `Bid ${bid.bidNumber} has been marked as won.`,
    })
  }

  const handleSoldToOthers = () => {
    toast.info('Bid marked as Lost - Sold to Others', {
      description: `Bid ${bid.bidNumber} has been marked as lost.`,
    })
  }

  const handleMarkUnsold = () => {
    toast.info('Bid marked as Lost - Unsold', {
      description: `Bid ${bid.bidNumber} has been marked as unsold.`,
    })
  }

  const handleCancelBid = () => {
    toast.warning('Bid Canceled', {
      description: `Bid ${bid.bidNumber} has been canceled.`,
    })
  }

  const handleAuctionCancelled = () => {
    toast.warning('Auction Cancelled', {
      description: `The auction for bid ${bid.bidNumber} has been cancelled.`,
    })
  }

  const handleIncreaseBid = () => {
    toast.info('Increase Bid', {
      description: 'Bid increase functionality will be implemented.',
    })
  }

  const handleCreateInvoice = () => {
    toast.success('Invoice Created', {
      description: `Invoice for bid ${bid.bidNumber} has been created.`,
    })
    router.push('/invoices')
  }

  return (
    <motion.div
      className='flex flex-col h-full bg-background'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <motion.div
          className='absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className='flex items-center gap-3'>
            <MdAutorenew className='h-6 w-6 animate-spin text-primary' />
            <span className='text-sm font-medium'>Processing...</span>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar */}
        <BidPageSidebar bid={bid} />

        {/* Main Content */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          {/* Header with Image Gallery */}
          <div className='p-6 border-b bg-gradient-to-b from-muted/20 to-transparent'>
            <BidPageHeader bid={bid} />
          </div>

          {/* Tabbed Content */}
          <BidPageContent bid={bid} />
        </div>
      </div>

      {/* Footer */}
      <BidPageFooter
        bid={bid}
        onApprove={handleApprove}
        onDecline={handleDecline}
        onMarkWon={handleMarkWon}
        onSoldToOthers={handleSoldToOthers}
        onMarkUnsold={handleMarkUnsold}
        onCancelBid={handleCancelBid}
        onAuctionCancelled={handleAuctionCancelled}
        onIncreaseBid={handleIncreaseBid}
        onCreateInvoice={handleCreateInvoice}
      />
    </motion.div>
  )
}
