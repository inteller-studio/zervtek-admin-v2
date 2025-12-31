'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdArrowBack,
  MdChevronLeft,
  MdChevronRight,
  MdZoomIn,
  MdFullscreen,
  MdClose,
  MdDirectionsCar,
  MdAccessTime,
  MdGavel,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type Bid } from '../../data/bids'

const statusStyles: Record<string, string> = {
  pending_approval: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  active: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  winning: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  outbid: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
  won: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  lost: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
  retracted: 'bg-red-500/15 text-red-600 border-red-500/30',
  expired: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
  declined: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
}

const statusLabels: Record<string, string> = {
  pending_approval: 'Pending Approval',
  active: 'Active',
  winning: 'Winning',
  outbid: 'Outbid',
  won: 'Won',
  lost: 'Lost',
  retracted: 'Retracted',
  expired: 'Expired',
  declined: 'Declined',
}

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

// Image Gallery Component
interface ImageGalleryProps {
  images: string[]
  alt: string
  onOpenLightbox: (index: number) => void
}

function ImageGallery({ images, alt, onOpenLightbox }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const minSwipeDistance = 50

  const goToNext = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }
  }, [images.length])

  const goToPrev = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev()
      else if (e.key === 'ArrowRight') goToNext()
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      return () => container.removeEventListener('keydown', handleKeyDown)
    }
  }, [goToNext, goToPrev])

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) goToNext()
    else if (distance < -minSwipeDistance) goToPrev()
  }

  useEffect(() => {
    if (images.length > 1) {
      const nextIndex = (currentIndex + 1) % images.length
      const prevIndex = (currentIndex - 1 + images.length) % images.length

      ;[nextIndex, prevIndex].forEach((idx) => {
        if (!loadedImages.has(idx)) {
          const img = new Image()
          img.src = images[idx]
          img.onload = () => setLoadedImages((prev) => new Set(prev).add(idx))
        }
      })
    }
  }, [currentIndex, images, loadedImages])

  const handleImageLoad = () => {
    setIsLoading(false)
    setLoadedImages((prev) => new Set(prev).add(currentIndex))
  }

  useEffect(() => {
    setCurrentIndex(0)
    setLoadedImages(new Set())
    setIsLoading(true)
  }, [images])

  if (!images || images.length === 0) {
    return (
      <div className='relative h-80 md:h-96 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden'>
        <div className='flex h-full w-full items-center justify-center'>
          <MdDirectionsCar className='h-24 w-24 text-muted-foreground/30' />
        </div>
      </div>
    )
  }

  return (
    <div className='relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900'>
      <div
        ref={containerRef}
        tabIndex={0}
        className='relative h-80 md:h-96 focus:outline-none cursor-pointer group'
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => onOpenLightbox(currentIndex)}
      >
        {isLoading && (
          <div className='absolute inset-0 z-10'>
            <Skeleton className='h-full w-full' />
          </div>
        )}

        <AnimatePresence mode='wait'>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className='h-full w-full object-cover'
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            onLoad={handleImageLoad}
          />
        </AnimatePresence>

        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center'>
          <motion.div
            className='opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-4 backdrop-blur-sm'
            whileHover={{ scale: 1.1 }}
          >
            <MdZoomIn className='h-8 w-8 text-white' />
          </motion.div>
        </div>

        {images.length > 1 && (
          <>
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                goToPrev()
              }}
              className='absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 opacity-0 group-hover:opacity-100'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <MdChevronLeft className='h-7 w-7' />
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className='absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 opacity-0 group-hover:opacity-100'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <MdChevronRight className='h-7 w-7' />
            </motion.button>
          </>
        )}

        {images.length > 1 && (
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2.5 backdrop-blur-sm'>
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(idx)
                }}
                className={cn(
                  'rounded-full transition-all',
                  currentIndex === idx ? 'w-3 h-3 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                )}
              />
            ))}
          </div>
        )}

        <div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity'>
          <div className='flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-sm'>
            <MdFullscreen className='h-4 w-4' />
            <span>Click to expand</span>
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <div className='flex gap-2 overflow-x-auto p-3 bg-black/10 dark:bg-white/5'>
          {images.map((img, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden transition-all',
                currentIndex === idx
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'opacity-50 hover:opacity-100'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className='h-full w-full object-cover' />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

// Lightbox Component
interface LightboxProps {
  images: string[]
  initialIndex: number
  alt: string
  open: boolean
  onClose: () => void
}

export function Lightbox({ images, initialIndex, alt, open, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev()
      else if (e.key === 'ArrowRight') goToNext()
      else if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, goToNext, goToPrev, onClose])

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) goToNext()
    else if (distance < -minSwipeDistance) goToPrev()
  }

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-[100] bg-black'
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <motion.button
            onClick={onClose}
            className='absolute top-6 right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20'
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MdClose className='h-7 w-7' />
          </motion.button>

          <div className='absolute top-6 left-6 z-10 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm'>
            {currentIndex + 1} / {images.length}
          </div>

          <div className='flex h-full w-full items-center justify-center p-6 md:p-20'>
            <AnimatePresence mode='wait'>
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`${alt} - Image ${currentIndex + 1}`}
                className='max-h-full max-w-full object-contain'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>
          </div>

          {images.length > 1 && (
            <>
              <motion.button
                onClick={goToPrev}
                className='absolute left-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <MdChevronLeft className='h-9 w-9' />
              </motion.button>
              <motion.button
                onClick={goToNext}
                className='absolute right-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <MdChevronRight className='h-9 w-9' />
              </motion.button>
            </>
          )}

          {images.length > 1 && (
            <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3'>
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    'rounded-full transition-all',
                    currentIndex === idx ? 'w-3.5 h-3.5 bg-white' : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                  )}
                />
              ))}
            </div>
          )}

          {images.length > 1 && (
            <div className='absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3 overflow-x-auto max-w-[90vw] p-3 rounded-2xl bg-black/50 backdrop-blur-sm'>
              {images.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    'flex-shrink-0 h-20 w-28 rounded-xl overflow-hidden transition-all',
                    currentIndex === idx
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                      : 'opacity-50 hover:opacity-100'
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className='h-full w-full object-cover' />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface BidPageHeaderProps {
  bid: Bid
}

export function BidPageHeader({ bid }: BidPageHeaderProps) {
  const router = useRouter()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const animatedAmount = useAnimatedNumber(bid.amount)

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()
    if (diff <= 0) return null

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const timeRemaining = bid.timeRemaining ? getTimeRemaining(bid.timeRemaining) : null
  const isAuctionLive = bid.auctionStatus === 'live' && timeRemaining

  return (
    <>
      <motion.div
        className='space-y-6'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back Navigation */}
        <motion.div whileHover={{ x: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.back()}
            className='gap-2 text-muted-foreground hover:text-foreground'
          >
            <MdArrowBack className='h-4 w-4' />
            Back to Bids
          </Button>
        </motion.div>

        {/* Image Gallery */}
        <ImageGallery
          images={bid.vehicle.images || []}
          alt={`${bid.vehicle.year} ${bid.vehicle.make} ${bid.vehicle.model}`}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* Vehicle Title & Bid Amount */}
        <div className='flex items-start justify-between gap-4'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
              {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}
            </h1>
            <div className='flex items-center gap-3 mt-2'>
              <span className='text-sm text-muted-foreground font-mono'>{bid.bidNumber}</span>
              <span className='text-muted-foreground'>•</span>
              <span className='text-sm text-muted-foreground'>Lot #{bid.lotNumber}</span>
            </div>
          </motion.div>

          <motion.div
            className='text-right'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1'>
              Bid Amount
            </p>
            <motion.p
              className='text-3xl md:text-4xl font-bold tracking-tight'
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              ¥{animatedAmount.toLocaleString()}
            </motion.p>
          </motion.div>
        </div>

        {/* Status Row */}
        <motion.div
          className='flex items-center gap-3 flex-wrap'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Badge className={cn('text-sm px-3 py-1.5 font-medium', statusStyles[bid.status])}>
            {statusLabels[bid.status]}
          </Badge>

          <Badge variant='outline' className='text-sm px-3 py-1.5 font-medium'>
            <MdGavel className='h-3.5 w-3.5 mr-1.5' />
            {bid.type === 'assisted' ? 'Assisted Bid' : 'Manual Bid'}
          </Badge>

          {isAuctionLive && (
            <motion.div
              className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium'
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
                <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500' />
              </span>
              Live • {timeRemaining}
            </motion.div>
          )}

          {bid.auctionStatus === 'ended' && (
            <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium'>
              <MdAccessTime className='h-3.5 w-3.5' />
              Auction Ended
            </div>
          )}
        </motion.div>
      </motion.div>

      <Lightbox
        images={bid.vehicle.images || []}
        initialIndex={lightboxIndex}
        alt={`${bid.vehicle.year} ${bid.vehicle.make} ${bid.vehicle.model}`}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
