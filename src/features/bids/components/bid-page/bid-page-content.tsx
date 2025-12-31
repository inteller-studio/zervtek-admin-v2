'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdDirectionsCar,
  MdDescription,
  MdAccessTime,
  MdContentCopy,
  MdCheck,
  MdTag,
  MdLocalGasStation,
  MdSpeed,
  MdSettings,
  MdPalette,
  MdCalendarToday,
  MdGavel,
  MdEmojiEvents,
  MdCancel,
  MdCheckCircle,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import { type Bid } from '../../data/bids'
import { toast } from 'sonner'

interface BidPageContentProps {
  bid: Bid
}

interface TabItem {
  id: string
  label: string
  icon: React.ReactNode
}

const tabs: TabItem[] = [
  { id: 'details', label: 'Details', icon: <MdDescription className='h-4 w-4' /> },
  { id: 'vehicle', label: 'Vehicle', icon: <MdDirectionsCar className='h-4 w-4' /> },
  { id: 'timeline', label: 'Timeline', icon: <MdAccessTime className='h-4 w-4' /> },
]

// Info Row Component with copy functionality
function InfoRow({
  label,
  value,
  mono,
  copyable,
}: {
  label: string
  value: string | React.ReactNode
  mono?: boolean
  copyable?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className='flex justify-between items-center py-3 border-b border-border/50 last:border-0'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <div className='flex items-center gap-2'>
        <span className={cn('text-sm font-medium text-right', mono && 'font-mono text-xs')}>
          {value}
        </span>
        {copyable && typeof value === 'string' && (
          <motion.button
            onClick={handleCopy}
            className='p-1.5 rounded-lg hover:bg-muted transition-colors'
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode='wait'>
              {copied ? (
                <motion.div
                  key='check'
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <MdCheck className='h-3.5 w-3.5 text-emerald-500' />
                </motion.div>
              ) : (
                <motion.div key='copy' initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <MdContentCopy className='h-3.5 w-3.5 text-muted-foreground' />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </div>
  )
}

// Mock timeline events
function getTimelineEvents(bid: Bid) {
  const events = [
    {
      id: 1,
      type: 'created',
      title: 'Bid Placed',
      description: `Bid of ¥${bid.amount.toLocaleString()} placed via ${bid.source}`,
      timestamp: bid.timestamp,
      icon: <MdGavel className='h-4 w-4' />,
      iconBg: 'bg-blue-500/15 text-blue-600',
    },
  ]

  if (bid.type === 'assisted' && bid.assistedBy) {
    events.push({
      id: 2,
      type: 'assisted',
      title: 'Bid Assisted',
      description: `Bid was assisted by ${bid.assistedBy}`,
      timestamp: new Date(bid.timestamp.getTime() + 1000 * 60 * 5),
      icon: <MdCheckCircle className='h-4 w-4' />,
      iconBg: 'bg-emerald-500/15 text-emerald-600',
    })
  }

  if (bid.status === 'pending_approval') {
    events.push({
      id: 3,
      type: 'pending',
      title: 'Awaiting Approval',
      description: 'Bid is pending review and approval',
      timestamp: new Date(bid.timestamp.getTime() + 1000 * 60 * 10),
      icon: <MdAccessTime className='h-4 w-4' />,
      iconBg: 'bg-amber-500/15 text-amber-600',
    })
  } else if (bid.status === 'won') {
    events.push({
      id: 4,
      type: 'won',
      title: 'Auction Won',
      description: 'Congratulations! The bid was successful',
      timestamp: new Date(bid.timestamp.getTime() + 1000 * 60 * 60 * 24),
      icon: <MdEmojiEvents className='h-4 w-4' />,
      iconBg: 'bg-emerald-500/15 text-emerald-700',
    })
  } else if (bid.status === 'lost') {
    events.push({
      id: 5,
      type: 'lost',
      title: 'Auction Lost',
      description: 'The bid was unsuccessful',
      timestamp: new Date(bid.timestamp.getTime() + 1000 * 60 * 60 * 24),
      icon: <MdCancel className='h-4 w-4' />,
      iconBg: 'bg-slate-500/15 text-slate-600',
    })
  } else if (bid.status === 'active' || bid.status === 'winning') {
    events.push({
      id: 6,
      type: 'active',
      title: bid.status === 'winning' ? 'Currently Winning' : 'Bid Active',
      description:
        bid.status === 'winning'
          ? 'Your bid is currently the highest'
          : 'Bid is active in the auction',
      timestamp: new Date(),
      icon: bid.status === 'winning' ? <MdEmojiEvents className='h-4 w-4' /> : <MdGavel className='h-4 w-4' />,
      iconBg:
        bid.status === 'winning' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-blue-500/15 text-blue-600',
    })
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function BidPageContent({ bid }: BidPageContentProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [previousTab, setPreviousTab] = useState('details')

  const handleTabChange = (tabId: string) => {
    setPreviousTab(activeTab)
    setActiveTab(tabId)
  }

  const getTabDirection = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab)
    const prevIndex = tabs.findIndex((t) => t.id === previousTab)
    return currentIndex > prevIndex ? 1 : -1
  }

  const direction = getTabDirection()
  const timelineEvents = getTimelineEvents(bid)

  return (
    <motion.div
      className='flex-1 overflow-hidden flex flex-col'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Tab Navigation */}
      <div className='border-b px-6 py-4'>
        <div className='flex gap-1 p-1 bg-muted/50 rounded-lg w-fit'>
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className='flex-1 overflow-y-auto p-6'>
        <AnimatePresence mode='wait' custom={direction}>
          {activeTab === 'details' && (
            <motion.div
              key='details'
              custom={direction}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              {/* Bid Information Card */}
              <motion.div
                className='rounded-xl border bg-card p-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <MdDescription className='h-5 w-5 text-primary' />
                  Bid Information
                </h3>
                <div className='space-y-0'>
                  <InfoRow label='Bid Number' value={bid.bidNumber} mono copyable />
                  <InfoRow label='Bid Amount' value={`¥${bid.amount.toLocaleString()}`} />
                  {bid.maxBid && (
                    <InfoRow label='Maximum Bid' value={`¥${bid.maxBid.toLocaleString()}`} />
                  )}
                  <InfoRow label='Service Fee' value={`¥${bid.serviceFee.toLocaleString()}`} />
                  <InfoRow
                    label='Total with Fee'
                    value={`¥${(bid.amount + bid.serviceFee).toLocaleString()}`}
                  />
                  <InfoRow label='Bid Increment' value={`¥${bid.bidIncrement.toLocaleString()}`} />
                </div>
              </motion.div>

              {/* Auction Information Card */}
              <motion.div
                className='rounded-xl border bg-card p-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <MdGavel className='h-5 w-5 text-primary' />
                  Auction Information
                </h3>
                <div className='space-y-0'>
                  <InfoRow label='Auction House' value={bid.auctionHouse} />
                  <InfoRow label='Auction ID' value={bid.auctionId} mono copyable />
                  <InfoRow label='Lot Number' value={`#${bid.lotNumber}`} mono />
                  <InfoRow label='Placed On' value={format(bid.timestamp, 'MMMM d, yyyy')} />
                  <InfoRow label='Placed At' value={format(bid.timestamp, 'h:mm:ss a')} />
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'vehicle' && (
            <motion.div
              key='vehicle'
              custom={direction}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              {/* Vehicle Details Card */}
              <motion.div
                className='rounded-xl border bg-card p-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <MdDirectionsCar className='h-5 w-5 text-primary' />
                  Vehicle Details
                </h3>
                <div className='space-y-0'>
                  <InfoRow label='Make' value={bid.vehicle.make} />
                  <InfoRow label='Model' value={bid.vehicle.model} />
                  <InfoRow label='Year' value={bid.vehicle.year.toString()} />
                  <InfoRow label='Chassis Number' value={bid.vehicle.chassisNumber} mono copyable />
                </div>
              </motion.div>

              {/* Specifications Card */}
              <motion.div
                className='rounded-xl border bg-card p-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <MdSettings className='h-5 w-5 text-primary' />
                  Auction Listing
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <motion.div
                    className='p-4 rounded-xl bg-muted/50 text-center'
                    whileHover={{ scale: 1.02 }}
                  >
                    <MdCalendarToday className='h-5 w-5 text-primary mx-auto mb-2' />
                    <p className='text-2xl font-bold'>{bid.vehicle.year}</p>
                    <p className='text-xs text-muted-foreground'>Year</p>
                  </motion.div>

                  <motion.div
                    className='p-4 rounded-xl bg-muted/50 text-center'
                    whileHover={{ scale: 1.02 }}
                  >
                    <MdTag className='h-5 w-5 text-blue-500 mx-auto mb-2' />
                    <p className='text-2xl font-bold'>{bid.totalBids}</p>
                    <p className='text-xs text-muted-foreground'>Total Bids</p>
                  </motion.div>

                  <motion.div
                    className='p-4 rounded-xl bg-muted/50 text-center'
                    whileHover={{ scale: 1.02 }}
                  >
                    <MdGavel className='h-5 w-5 text-emerald-500 mx-auto mb-2' />
                    <p className='text-lg font-bold'>¥{bid.reservePrice.toLocaleString()}</p>
                    <p className='text-xs text-muted-foreground'>Reserve Price</p>
                  </motion.div>

                  <motion.div
                    className='p-4 rounded-xl bg-muted/50 text-center'
                    whileHover={{ scale: 1.02 }}
                  >
                    <MdEmojiEvents className='h-5 w-5 text-amber-500 mx-auto mb-2' />
                    <p className='text-lg font-bold'>¥{bid.currentHighBid.toLocaleString()}</p>
                    <p className='text-xs text-muted-foreground'>Current High</p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key='timeline'
              custom={direction}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className='rounded-xl border bg-card p-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className='text-lg font-semibold mb-6 flex items-center gap-2'>
                  <MdAccessTime className='h-5 w-5 text-primary' />
                  Bid Timeline
                </h3>

                <div className='relative'>
                  {/* Timeline line */}
                  <div className='absolute left-5 top-0 bottom-0 w-px bg-border' />

                  {/* Timeline events */}
                  <div className='space-y-6'>
                    {timelineEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        className='relative flex gap-4'
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {/* Icon */}
                        <motion.div
                          className={cn(
                            'relative z-10 flex h-10 w-10 items-center justify-center rounded-full',
                            event.iconBg
                          )}
                          whileHover={{ scale: 1.1 }}
                        >
                          {event.icon}
                        </motion.div>

                        {/* Content */}
                        <div className='flex-1 pt-1'>
                          <div className='flex items-center justify-between'>
                            <h4 className='font-medium'>{event.title}</h4>
                            <span className='text-xs text-muted-foreground'>
                              {format(event.timestamp, 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className='text-sm text-muted-foreground mt-0.5'>{event.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
