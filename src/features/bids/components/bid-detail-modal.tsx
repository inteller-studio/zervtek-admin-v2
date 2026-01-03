'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdPerson,
  MdAccessTime,
  MdGavel,
  MdEmojiEvents,
  MdDescription,
  MdHandshake,
  MdMessage,
  MdGroup,
  MdNotInterested,
  MdCancel,
  MdBlock,
  MdHelp,
  MdCheck,
  MdManageAccounts,
  MdDirectionsCar,
  MdChevronLeft,
  MdChevronRight,
  MdWarning,
  MdContentCopy,
  MdClose,
  MdZoomIn,
  MdFullscreen,
  MdPhotoLibrary,
  MdLink,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { type Bid } from '../data/bids'
import { toast } from 'sonner'

interface BidDetailModalProps {
  bid: Bid | null
  open: boolean
  onClose: () => void
  onApprove?: (bid: Bid) => void
  onDecline?: (bid: Bid) => void
  onMarkWon?: (bid: Bid, type: 'bid_accepted' | 'contract' | 'contract_nego') => void
  onSoldToOthers?: (bid: Bid) => void
  onMarkUnsold?: (bid: Bid) => void
  onCancelBid?: (bid: Bid) => void
  onAuctionCancelled?: (bid: Bid) => void
  onIncreaseBid?: (bid: Bid) => void
  onCreateInvoice?: (bid: Bid) => void
  onViewCustomer?: (bid: Bid) => void
  loading?: boolean
}

// Softer status styles
const statusStyles: Record<string, string> = {
  pending_approval: 'bg-amber-500/15 text-amber-600',
  active: 'bg-blue-500/15 text-blue-600',
  winning: 'bg-emerald-500/15 text-emerald-600',
  outbid: 'bg-orange-500/15 text-orange-600',
  won: 'bg-emerald-500/15 text-emerald-700',
  lost: 'bg-slate-500/15 text-slate-600',
  retracted: 'bg-red-500/15 text-red-600',
  expired: 'bg-slate-500/15 text-slate-600',
  declined: 'bg-rose-500/15 text-rose-600',
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      return () => container.removeEventListener('keydown', handleKeyDown)
    }
  }, [goToNext, goToPrev])

  // Touch handlers for swipe
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
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrev()
    }
  }

  // Preload adjacent images
  useEffect(() => {
    if (images.length > 1) {
      const nextIndex = (currentIndex + 1) % images.length
      const prevIndex = (currentIndex - 1 + images.length) % images.length

      ;[nextIndex, prevIndex].forEach((idx) => {
        if (!loadedImages.has(idx)) {
          const img = new Image()
          img.src = images[idx]
          img.onload = () => {
            setLoadedImages((prev) => new Set(prev).add(idx))
          }
        }
      })
    }
  }, [currentIndex, images, loadedImages])

  const handleImageLoad = () => {
    setIsLoading(false)
    setLoadedImages((prev) => new Set(prev).add(currentIndex))
  }

  // Reset when images change
  useEffect(() => {
    setCurrentIndex(0)
    setLoadedImages(new Set())
    setIsLoading(true)
  }, [images])

  if (!images || images.length === 0) {
    return (
      <div className="relative h-72 md:h-80 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        <div className="flex h-full w-full items-center justify-center">
          <MdDirectionsCar className="h-20 w-20 text-muted-foreground/30" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
      {/* Main Image */}
      <div
        ref={containerRef}
        tabIndex={0}
        className="relative h-72 md:h-80 focus:outline-none cursor-pointer group"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => onOpenLightbox(currentIndex)}
      >
          {/* Loading skeleton */}
          {isLoading && (
            <div className="absolute inset-0 z-10">
              <Skeleton className="h-full w-full" />
            </div>
          )}

          {/* Image with animation */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              className="h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onLoad={handleImageLoad}
            />
          </AnimatePresence>

          {/* Zoom hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-3 backdrop-blur-sm">
              <MdZoomIn className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrev()
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-110 opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <MdChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-110 opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <MdChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-2 backdrop-blur-sm">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentIndex(idx)
                  }}
                  className={cn(
                    "rounded-full transition-all",
                    currentIndex === idx
                      ? "w-2.5 h-2.5 bg-white"
                      : "w-2 h-2 bg-white/50 hover:bg-white/75"
                  )}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Fullscreen hint */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1.5 text-xs text-white backdrop-blur-sm">
              <MdFullscreen className="h-3.5 w-3.5" />
              <span>Click to expand</span>
            </div>
          </div>
      </div>

      {/* Thumbnails - Bottom */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-2.5 bg-black/10 dark:bg-white/5">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "flex-shrink-0 h-14 w-20 rounded-md overflow-hidden transition-all",
                currentIndex === idx
                  ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                  : "opacity-50 hover:opacity-100"
              )}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
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

function Lightbox({ images, initialIndex, alt, open, onClose }: LightboxProps) {
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

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, goToNext, goToPrev, onClose])

  // Touch handlers
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
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrev()
    }
  }

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
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
          className="fixed inset-0 z-[100] bg-black"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <MdClose className="h-6 w-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Main image */}
          <div className="flex h-full w-full items-center justify-center p-4 md:p-16">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`${alt} - Image ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"
                aria-label="Previous image"
              >
                <MdChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"
                aria-label="Next image"
              >
                <MdChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "rounded-full transition-all",
                    currentIndex === idx
                      ? "w-3 h-3 bg-white"
                      : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
                  )}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2 rounded-xl bg-black/50 backdrop-blur-sm">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "flex-shrink-0 h-16 w-20 rounded-lg overflow-hidden transition-all",
                    currentIndex === idx
                      ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                      : "opacity-50 hover:opacity-100"
                  )}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-5">
      <div className="relative h-72 md:h-80 rounded-xl overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono, copyable }: { label: string; value: string | React.ReactNode; mono?: boolean; copyable?: boolean }) {
  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value)
      toast.success('Copied to clipboard')
    }
  }

  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={cn("text-sm font-medium text-right", mono && "font-mono text-xs")}>{value}</span>
        {copyable && typeof value === 'string' && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-muted transition-colors"
            aria-label="Copy to clipboard"
          >
            <MdContentCopy className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  )
}

export function BidDetailModal({
  bid,
  open,
  onClose,
  onApprove,
  onDecline,
  onMarkWon,
  onSoldToOthers,
  onMarkUnsold,
  onCancelBid,
  onAuctionCancelled,
  onIncreaseBid,
  onCreateInvoice,
  onViewCustomer,
  loading = false,
}: BidDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [copiedLink, setCopiedLink] = useState(false)

  // Reset state when bid changes
  useEffect(() => {
    if (bid) {
      setIsApproving(false)
      setIsDeclining(false)
      setLightboxOpen(false)
      setCopiedLink(false)
    }
  }, [bid?.id])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !lightboxOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, lightboxOpen])

  // Focus management
  useEffect(() => {
    if (open && firstFocusableRef.current) {
      firstFocusableRef.current.focus()
    }
  }, [open])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
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

  const handleApprove = async () => {
    if (!bid) return
    setIsApproving(true)
    await onApprove?.(bid)
    setIsApproving(false)
  }

  const handleDecline = async () => {
    if (!bid) return
    setIsDeclining(true)
    await onDecline?.(bid)
    setIsDeclining(false)
  }

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const isPendingApproval = bid?.status === 'pending_approval'
  const isActiveOrWinning = bid?.status === 'active' || bid?.status === 'winning'
  const isWon = bid?.status === 'won'
  const canIncreaseBid = bid?.auctionStatus === 'live' && bid?.status !== 'winning' && bid?.status !== 'pending_approval'

  // Determine actual auction end status
  const timeRemaining = bid?.timeRemaining ? getTimeRemaining(bid.timeRemaining) : null
  const isAuctionEnded = bid?.auctionStatus === 'ended' || !timeRemaining

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="bid-detail-title"
              className={cn(
                'fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2',
                'max-h-[90vh] overflow-hidden rounded-2xl',
                'bg-background shadow-2xl',
                'focus:outline-none',
                'flex flex-col'
              )}
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <LoadingSkeleton />
                ) : bid ? (
                  <>
                    {/* Header with Title and Close */}
                    <div className='flex items-center justify-between px-5 py-4 border-b'>
                      <div className='flex items-center gap-3 min-w-0'>
                        <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0'>
                          <MdDirectionsCar className='h-5 w-5 text-primary' />
                        </div>
                        <div className='min-w-0'>
                          <h2 id='bid-detail-title' className='font-semibold truncate'>
                            {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}
                          </h2>
                          <p className='text-xs text-muted-foreground'>Bid #{bid.bidNumber}</p>
                        </div>
                      </div>
                      <button
                        ref={firstFocusableRef}
                        onClick={onClose}
                        className='h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors'
                      >
                        <MdClose className='h-5 w-5' />
                      </button>
                    </div>

                    {/* Image and Details Row */}
                    <div className='px-5 py-4 border-b bg-muted/20'>
                      <div className='flex gap-4'>
                        {/* Bigger Image */}
                        {bid.vehicle.images && bid.vehicle.images.length > 0 ? (
                          <button
                            onClick={() => handleOpenLightbox(0)}
                            className='h-36 w-52 rounded-lg overflow-hidden bg-muted shrink-0 hover:ring-2 hover:ring-primary/50 transition-all group relative'
                          >
                            <img
                              src={bid.vehicle.images[0]}
                              alt={`${bid.vehicle.make} ${bid.vehicle.model}`}
                              className='h-full w-full object-cover group-hover:scale-105 transition-transform'
                            />
                            <div className='absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors'>
                              <MdZoomIn className='h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                            </div>
                            {bid.vehicle.images.length > 1 && (
                              <div className='absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white'>
                                <MdPhotoLibrary className='h-3 w-3' />
                                {bid.vehicle.images.length}
                              </div>
                            )}
                          </button>
                        ) : (
                          <div className='h-36 w-52 rounded-lg bg-muted shrink-0 flex items-center justify-center'>
                            <MdDirectionsCar className='h-10 w-10 text-muted-foreground/30' />
                          </div>
                        )}

                        {/* Right Side Details */}
                        <div className='flex-1 flex flex-col justify-between min-w-0'>
                          <div className='space-y-1.5'>
                            {bid.vehicle.grade && (
                              <p className='text-sm font-semibold'>Grade {bid.vehicle.grade}</p>
                            )}
                            {bid.vehicle.mileage && (
                              <p className='text-sm text-muted-foreground'>{bid.vehicle.mileage.toLocaleString()} km</p>
                            )}
                            {bid.vehicle.transmission && (
                              <p className='text-sm text-muted-foreground'>{bid.vehicle.transmission.toUpperCase()}</p>
                            )}
                            {bid.vehicle.color && (
                              <p className='text-sm text-muted-foreground'>{bid.vehicle.color.toUpperCase()}</p>
                            )}
                          </div>

                          {/* Copy Link */}
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-fit mt-2'
                            onClick={() => {
                              const url = `${window.location.origin}/bids/${bid.id}`
                              navigator.clipboard.writeText(url)
                              setCopiedLink(true)
                              setTimeout(() => setCopiedLink(false), 2000)
                              toast.success('Link copied to clipboard')
                            }}
                          >
                            {copiedLink ? (
                              <>
                                <MdCheck className='mr-1.5 h-4 w-4 text-emerald-500' />
                                Copied!
                              </>
                            ) : (
                              <>
                                <MdContentCopy className='mr-1.5 h-4 w-4' />
                                Copy Link
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Amount Section */}
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</p>
                          <p className="text-3xl font-bold tracking-tight mt-0.5">
                            ¥{bid.amount.toLocaleString()}
                          </p>
                        </div>
                        <span
                          className='text-sm px-3 py-1.5 font-semibold rounded-md'
                          style={{
                            backgroundColor:
                              bid.status === 'pending_approval' ? '#f59e0b' :
                              bid.status === 'active' ? '#3b82f6' :
                              bid.status === 'winning' ? '#10b981' :
                              bid.status === 'outbid' ? '#f97316' :
                              bid.status === 'won' ? '#10b981' :
                              bid.status === 'lost' ? '#64748b' :
                              bid.status === 'retracted' ? '#ef4444' :
                              bid.status === 'expired' ? '#64748b' :
                              bid.status === 'declined' ? '#f43f5e' : '#64748b',
                            color: '#ffffff'
                          }}
                        >
                          {statusLabels[bid.status]}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-5 pb-5 space-y-4">
                      {/* User Card */}
                      <TooltipProvider>
                        <button
                          onClick={() => onViewCustomer?.(bid)}
                          className={cn(
                            "w-full flex items-center gap-4 rounded-xl bg-muted/30 p-4 text-left",
                            "transition-all duration-200",
                            "hover:bg-muted/50",
                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          )}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                              {getInitials(bid.bidder.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold truncate">{bid.bidder.name}</p>
                              {bid.bidder.level === 'unverified' ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <MdWarning className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Unverified user</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Badge className={cn('text-xs border-0', levelStyles[bid.bidder.level])}>
                                  {levelLabels[bid.bidder.level]}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{bid.bidder.email}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              <span className="capitalize">{bid.bidder.type}</span>
                              <span className="mx-1.5">•</span>
                              <span>{bid.bidder.location}</span>
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">Deposit</p>
                            <p className={cn(
                              "text-lg font-semibold",
                              bid.bidder.depositAmount > 0 ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {bid.bidder.depositAmount > 0 ? `¥${bid.bidder.depositAmount.toLocaleString()}` : '—'}
                            </p>
                          </div>
                        </button>
                      </TooltipProvider>

                      {/* Info Sections */}
                      <div className="grid gap-4 grid-cols-2">
                        {/* Bid Details */}
                        <div className="rounded-xl bg-muted/30 p-4">
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                            Bid Details
                          </h3>
                          <div className="space-y-0.5">
                            <InfoRow label="Bid Number" value={bid.bidNumber} mono copyable />
                            <InfoRow
                              label="Type"
                              value={
                                <span className="flex items-center gap-1.5">
                                  {bid.type === 'assisted' ? <MdManageAccounts className="h-3.5 w-3.5" /> : <MdPerson className="h-3.5 w-3.5" />}
                                  {bid.type === 'assisted' ? 'Assisted' : 'Manual'}
                                </span>
                              }
                            />
                            {bid.type === 'assisted' && bid.assistedBy && (
                              <InfoRow label="Assisted By" value={bid.assistedBy} />
                            )}
                            <InfoRow label="Placed" value={format(bid.timestamp, 'MMM d, yyyy h:mm a')} />
                            <InfoRow
                              label="Status"
                              value={
                                isAuctionEnded ? (
                                  <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <MdAccessTime className="h-3.5 w-3.5" />
                                    Ended
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-emerald-600">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Live • {timeRemaining}
                                  </span>
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* Auction Info */}
                        <div className="rounded-xl bg-muted/30 p-4">
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                            Auction Info
                          </h3>
                          <div className="space-y-0.5">
                            <InfoRow
                              label="Vehicle"
                              value={
                                <span className="font-semibold">
                                  {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}
                                </span>
                              }
                            />
                            <InfoRow label="Auction House" value={bid.auctionHouse} />
                            <InfoRow label="Lot Number" value={`#${bid.lotNumber}`} mono />
                            <InfoRow label="Date" value={format(bid.timestamp, 'MMM d, yyyy')} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Sticky Footer */}
              {bid && !loading && (
                <div className="flex items-center justify-between border-t px-5 py-4 bg-background">
                  <div className="flex items-center gap-2">
                    {/* Pending Approval Actions */}
                    {isPendingApproval && (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              ref={firstFocusableRef}
                              size="default"
                              className="h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                              disabled={isApproving}
                            >
                              <MdCheck className="mr-2 h-4 w-4" />
                              {isApproving ? 'Approving...' : 'Approve'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Bid</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve this bid of ¥{bid.amount.toLocaleString()} for {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleApprove}
                              >
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="default"
                              variant="outline"
                              className="h-10 rounded-lg bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:text-red-600"
                              disabled={isDeclining}
                            >
                              <MdCancel className="mr-2 h-4 w-4" />
                              {isDeclining ? 'Declining...' : 'Decline'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Decline Bid</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to decline this bid? This action cannot be undone and the bidder will be notified.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={handleDecline}
                              >
                                Decline Bid
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}

                    {/* Active/Winning Bid Actions */}
                    {isActiveOrWinning && (
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              ref={firstFocusableRef}
                              size="default"
                              className="h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <MdEmojiEvents className="mr-2 h-4 w-4" />
                              Mark Won
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Won Results</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onMarkWon?.(bid, 'bid_accepted')}>
                              <MdEmojiEvents className="mr-2 h-4 w-4 text-emerald-600" />
                              Bid Accepted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMarkWon?.(bid, 'contract')}>
                              <MdHandshake className="mr-2 h-4 w-4 text-emerald-600" />
                              Contract
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMarkWon?.(bid, 'contract_nego')}>
                              <MdMessage className="mr-2 h-4 w-4 text-emerald-600" />
                              Contract by Nego
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="default"
                              variant="outline"
                              className="h-10 rounded-lg"
                            >
                              <MdCancel className="mr-2 h-4 w-4" />
                              Mark Lost
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Lost Results</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onSoldToOthers?.(bid)}>
                              <MdGroup className="mr-2 h-4 w-4 text-red-500" />
                              Sold to Others
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMarkUnsold?.(bid)}>
                              <MdNotInterested className="mr-2 h-4 w-4 text-orange-500" />
                              Unsold
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Other</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onCancelBid?.(bid)}>
                              <MdCancel className="mr-2 h-4 w-4" />
                              Bid Canceled
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAuctionCancelled?.(bid)}>
                              <MdBlock className="mr-2 h-4 w-4" />
                              Auction Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MdHelp className="mr-2 h-4 w-4" />
                              Unknown
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}

                    {/* Won Bid Actions */}
                    {isWon && onCreateInvoice && (
                      <Button
                        ref={firstFocusableRef}
                        size="default"
                        className="h-10 rounded-lg"
                        onClick={() => onCreateInvoice(bid)}
                      >
                        <MdDescription className="mr-2 h-4 w-4" />
                        Create Invoice
                      </Button>
                    )}

                    {/* Increase Bid */}
                    {canIncreaseBid && onIncreaseBid && (
                      <Button
                        size="default"
                        variant="outline"
                        className="h-10 rounded-lg"
                        onClick={() => onIncreaseBid(bid)}
                      >
                        <MdGavel className="mr-2 h-4 w-4" />
                        Increase Bid
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    className="h-10 rounded-lg text-muted-foreground"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      {bid && (
        <Lightbox
          images={bid.vehicle.images || []}
          initialIndex={lightboxIndex}
          alt={`${bid.vehicle.year} ${bid.vehicle.make} ${bid.vehicle.model}`}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
