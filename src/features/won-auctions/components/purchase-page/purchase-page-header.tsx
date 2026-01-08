'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { MdArrowBack, MdDirectionsCar, MdContentCopy, MdCheck, MdPerson, MdCalendarToday, MdLocationOn, MdChevronLeft, MdChevronRight, MdNotes, MdSave } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../data/won-auctions'

const statusStyles: Record<Purchase['status'], string> = {
  payment_pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  documents_pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
  shipping: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300',
}

const statusLabels: Record<Purchase['status'], string> = {
  payment_pending: 'Payment Pending',
  processing: 'Processing',
  documents_pending: 'Docs Pending',
  shipping: 'Shipping',
  delivered: 'Delivered',
  completed: 'Completed',
}

// Active statuses that should pulse
const activeStatuses: Purchase['status'][] = ['payment_pending', 'processing', 'documents_pending', 'shipping']

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
}

interface PurchasePageHeaderProps {
  auction: Purchase
  vehicleTitle: string
  vinCopied: boolean
  onBack: () => void
  onCopyVin: () => void
  notes?: string
  onNotesUpdate?: (notes: string) => void
}

export function PurchasePageHeader({
  auction,
  vehicleTitle,
  vinCopied,
  onBack,
  onCopyVin,
  notes = '',
  onNotesUpdate,
}: PurchasePageHeaderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [localNotes, setLocalNotes] = useState(notes)
  const [notesOpen, setNotesOpen] = useState(false)

  // Sync local notes when prop changes
  useEffect(() => {
    setLocalNotes(notes)
  }, [notes])

  const handleSaveNotes = () => {
    if (onNotesUpdate && localNotes !== notes) {
      onNotesUpdate(localNotes)
      setNotesOpen(false)
    }
  }
  const images = auction.vehicleInfo.images.filter(img => img && img !== '#')
  const hasMultipleImages = images.length > 1
  const isActiveStatus = activeStatuses.includes(auction.status)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <motion.div
      className='border-b bg-background'
      initial='hidden'
      animate='visible'
      variants={containerVariants}
    >
      <div className='px-6 py-5'>
        <div className='max-w-7xl mx-auto'>
          {/* Back Button - Own Row */}
          <motion.div variants={itemVariants} className='mb-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onBack}
              className='-ml-3 group text-muted-foreground hover:text-foreground'
            >
              <motion.div
                className='flex items-center'
                whileHover={{ x: -3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <MdArrowBack className='h-4 w-4 mr-2' />
                Back
              </motion.div>
            </Button>
          </motion.div>

          {/* Main Content - Horizontal Flex */}
          <div className='flex gap-5'>
            {/* Vehicle Image Gallery - Larger */}
            <motion.div
              className='relative h-[120px] w-[180px] rounded-xl overflow-hidden bg-muted shrink-0 shadow-md hover:shadow-lg transition-shadow'
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {images.length > 0 ? (
                <>
                  <AnimatePresence mode='wait'>
                    <motion.img
                      key={currentImageIndex}
                      src={images[currentImageIndex]}
                      alt={vehicleTitle}
                      className='h-full w-full object-cover'
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                    />
                  </AnimatePresence>

                  {/* Image navigation - Always visible */}
                  {hasMultipleImages && (
                    <div className='absolute inset-0 flex items-center justify-between px-1.5'>
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className='p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors'
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <MdChevronLeft className='h-4 w-4' />
                      </motion.button>
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className='p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors'
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <MdChevronRight className='h-4 w-4' />
                      </motion.button>
                    </div>
                  )}

                  {/* Image counter */}
                  {hasMultipleImages && (
                    <div className='absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm'>
                      {currentImageIndex + 1}/{images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className='h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50'>
                  <MdDirectionsCar className='h-10 w-10 text-muted-foreground/40' />
                </div>
              )}
            </motion.div>

            {/* Vehicle Details Column */}
            <motion.div className='flex-1 min-w-0 space-y-3' variants={itemVariants}>
              {/* Title + VIN */}
              <div>
                <motion.h1
                  className='text-2xl font-semibold tracking-tight text-foreground truncate'
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {vehicleTitle}
                </motion.h1>
                <motion.button
                  onClick={onCopyVin}
                  className='inline-flex items-center gap-1.5 mt-1 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors group/vin'
                  whileTap={{ scale: 0.98 }}
                >
                  <span className='truncate'>VIN: {auction.vehicleInfo.vin}</span>
                  <AnimatePresence mode='wait'>
                    {vinCopied ? (
                      <motion.div
                        key='check'
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 45 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className='shrink-0'
                      >
                        <svg
                          className='h-4 w-4 text-emerald-500'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth={2.5}
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <motion.path
                            d='M5 12l5 5L20 7'
                            variants={checkVariants}
                            initial='hidden'
                            animate='visible'
                          />
                        </svg>
                      </motion.div>
                    ) : (
                      <motion.div
                        key='copy'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='shrink-0'
                      >
                        <MdContentCopy className='h-3.5 w-3.5 opacity-50 group-hover/vin:opacity-100 transition-opacity' />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Badges Row - Status, Auction ID, Destination, Notes */}
              <motion.div
                className='flex items-center gap-2 flex-wrap'
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Status Badge with subtle pulse */}
                <div className='relative'>
                  {isActiveStatus && (
                    <motion.div
                      className={cn(
                        'absolute -inset-0.5 rounded-full blur-sm opacity-50',
                        auction.status === 'payment_pending' && 'bg-amber-400',
                        auction.status === 'processing' && 'bg-blue-400',
                        auction.status === 'documents_pending' && 'bg-slate-400',
                        auction.status === 'shipping' && 'bg-purple-400'
                      )}
                      animate={{
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                  <Badge
                    className={cn('text-xs font-medium relative px-2.5 py-0.5', statusStyles[auction.status])}
                  >
                    {statusLabels[auction.status]}
                  </Badge>
                </div>
                <Badge variant='outline' className='text-xs'>
                  {auction.auctionId}
                </Badge>
                {auction.destinationPort && (
                  <Badge variant='outline' className='text-xs gap-1'>
                    <MdLocationOn className='h-3 w-3' />
                    {auction.destinationPort.split(',')[0]}
                  </Badge>
                )}

                {/* Notes Sheet */}
                {onNotesUpdate && (
                  <Sheet open={notesOpen} onOpenChange={setNotesOpen}>
                    <SheetTrigger asChild>
                      <Button variant='ghost' size='sm' className='h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground'>
                        <MdNotes className='h-4 w-4' />
                        <span className='text-xs'>Notes</span>
                        {notes && <span className='h-1.5 w-1.5 rounded-full bg-primary' />}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side='right' className='w-[400px] sm:w-[450px]'>
                      <SheetHeader>
                        <SheetTitle className='flex items-center gap-2'>
                          <MdNotes className='h-5 w-5' />
                          Internal Notes
                        </SheetTitle>
                      </SheetHeader>
                      <div className='mt-6 space-y-4'>
                        <Textarea
                          placeholder='Add notes about this purchase...'
                          value={localNotes}
                          onChange={(e) => setLocalNotes(e.target.value)}
                          className='min-h-[200px] text-sm'
                        />
                        <div className='flex justify-between items-center'>
                          <p className='text-xs text-muted-foreground'>Visible to staff only</p>
                          <Button onClick={handleSaveNotes} disabled={localNotes === notes}>
                            <MdSave className='h-4 w-4 mr-2' />
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </motion.div>

              {/* Customer Info Row */}
              <motion.div
                className='flex items-center gap-4 text-sm text-muted-foreground'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <Link href={`/customers/${auction.winnerId}`}>
                  <span className='inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer'>
                    <MdPerson className='h-4 w-4' />
                    <span className='hover:underline underline-offset-2'>{auction.winnerName}</span>
                  </span>
                </Link>
                <span className='text-muted-foreground/50'>•</span>
                <span className='inline-flex items-center gap-1.5'>
                  <MdCalendarToday className='h-3.5 w-3.5' />
                  {format(new Date(auction.auctionEndDate), 'MMM d, yyyy')}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
