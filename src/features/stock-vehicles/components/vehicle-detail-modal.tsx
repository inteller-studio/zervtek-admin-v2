'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdClose,
  MdDirectionsCar,
  MdChevronLeft,
  MdChevronRight,
  MdWarehouse,
  MdSpeed,
  MdBuild,
  MdLocalGasStation,
  MdBrush,
  MdCalendarToday,
  MdDescription,
  MdEdit,
  MdDelete,
  MdLink,
  MdCheck,
  MdContentCopy,
  MdZoomIn,
  MdFullscreen,
  MdLocalOffer,
  MdEmojiEvents,
  MdInventory2,
} from 'react-icons/md'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'
import { type Vehicle } from '../data/vehicles'

interface VehicleDetailModalProps {
  vehicle: Vehicle | null
  open: boolean
  onClose: () => void
  onCreateInvoice?: (vehicle: Vehicle) => void
  onEdit?: (vehicle: Vehicle) => void
  onDelete?: (vehicle: Vehicle) => void
  loading?: boolean
}

const statusStyles: Record<string, string> = {
  available: 'bg-emerald-500/15 text-emerald-600',
  reserved: 'bg-amber-500/15 text-amber-600',
  sold: 'bg-slate-500/15 text-slate-600',
}

const statusLabels: Record<string, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
}

function LoadingSkeleton() {
  return (
    <div className='space-y-6 p-5'>
      <div className='relative h-72 md:h-80 rounded-xl overflow-hidden'>
        <Skeleton className='h-full w-full' />
      </div>
      <div className='flex justify-between items-center'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-32' />
        </div>
        <Skeleton className='h-8 w-28' />
      </div>
      <div className='flex items-center gap-4 p-4 rounded-xl bg-muted/30'>
        <Skeleton className='h-12 w-12 rounded-full' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-4 w-32' />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-3'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
        </div>
        <div className='space-y-3'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon,
  mono,
  copyable,
}: {
  label: string
  value: string | React.ReactNode
  icon?: React.ReactNode
  mono?: boolean
  copyable?: boolean
}) {
  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value)
      toast.success('Copied to clipboard')
    }
  }

  return (
    <div className='flex justify-between items-center py-2.5'>
      <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
        {icon}
        {label}
      </span>
      <div className='flex items-center gap-1.5'>
        <span className={cn('text-sm font-medium text-right', mono && 'font-mono text-xs')}>
          {value}
        </span>
        {copyable && typeof value === 'string' && (
          <button
            onClick={handleCopy}
            className='p-1 rounded hover:bg-muted transition-colors'
            aria-label='Copy to clipboard'
          >
            <MdContentCopy className='h-3 w-3 text-muted-foreground' />
          </button>
        )}
      </div>
    </div>
  )
}

export function VehicleDetailModal({
  vehicle,
  open,
  onClose,
  onCreateInvoice,
  onEdit,
  onDelete,
  loading = false,
}: VehicleDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  // Reset states when vehicle changes
  useEffect(() => {
    if (vehicle) {
      setCurrentImageIndex(0)
      setLightboxOpen(false)
      setCopiedLink(false)
      setCopiedId(false)
    }
  }, [vehicle?.id])

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

  const goToNext = useCallback(() => {
    if (vehicle?.images && vehicle.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length)
    }
  }, [vehicle?.images])

  const goToPrev = useCallback(() => {
    if (vehicle?.images && vehicle.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length)
    }
  }, [vehicle?.images])

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
              className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
              onClick={onClose}
              aria-hidden='true'
            />

            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role='dialog'
              aria-modal='true'
              aria-labelledby='vehicle-detail-title'
              className={cn(
                'fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2',
                'max-h-[90vh] overflow-hidden rounded-2xl',
                'bg-background shadow-2xl',
                'focus:outline-none',
                'flex flex-col'
              )}
            >
              {/* Scrollable Content */}
              <div className='flex-1 overflow-y-auto'>
                {loading ? (
                  <LoadingSkeleton />
                ) : vehicle ? (
                  <>
                    {/* Header with Title and Close */}
                    <div className='flex items-center justify-between px-5 py-4 border-b'>
                      <div className='flex items-center gap-3 min-w-0'>
                        <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0'>
                          <MdDirectionsCar className='h-5 w-5 text-primary' />
                        </div>
                        <div className='min-w-0'>
                          <h2 id='vehicle-detail-title' className='font-semibold truncate'>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h2>
                          <p className='text-xs text-muted-foreground'>Stock #{vehicle.stockNumber}</p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className='h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors'
                      >
                        <MdClose className='h-5 w-5' />
                      </button>
                    </div>

                    {/* Compact Thumbnail Row */}
                    {vehicle.images && vehicle.images.length > 0 && (
                      <div className='px-5 py-3 border-b bg-muted/20'>
                        <div className='flex items-center gap-2'>
                          {vehicle.images.slice(0, 5).map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setCurrentImageIndex(idx)
                                setLightboxOpen(true)
                              }}
                              className='h-12 w-16 rounded-lg overflow-hidden bg-muted shrink-0 hover:ring-2 hover:ring-primary/50 transition-all group relative'
                            >
                              <img
                                src={img}
                                alt={`Photo ${idx + 1}`}
                                className='h-full w-full object-cover group-hover:scale-105 transition-transform'
                              />
                              {idx === 0 && (
                                <div className='absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors'>
                                  <MdZoomIn className='h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                                </div>
                              )}
                            </button>
                          ))}
                          {vehicle.images.length > 5 && (
                            <button
                              onClick={() => {
                                setCurrentImageIndex(5)
                                setLightboxOpen(true)
                              }}
                              className='h-12 w-16 rounded-lg bg-muted shrink-0 flex items-center justify-center hover:bg-muted/80 transition-colors'
                            >
                              <span className='text-sm font-medium text-muted-foreground'>
                                +{vehicle.images.length - 5}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price Section */}
                    <div className='px-5 py-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                            Price
                          </p>
                          <p className='text-3xl font-bold tracking-tight mt-0.5'>
                            {vehicle.priceDisplay || `¥${vehicle.price.toLocaleString()}`}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            'text-sm px-3 py-1.5 font-medium border-0',
                            statusStyles[vehicle.status]
                          )}
                        >
                          {statusLabels[vehicle.status]}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className='px-5 pb-5 space-y-4'>
                      {/* Quick Info Bar */}
                      <div className='flex items-center justify-between rounded-xl bg-muted/30 p-3'>
                        <div className='flex items-center gap-3 flex-wrap'>
                          {vehicle.grade && (
                            <Badge className='text-xs border-0 bg-blue-500/15 text-blue-600'>
                              {vehicle.grade}
                            </Badge>
                          )}
                          <span className='text-sm text-muted-foreground'>
                            {vehicle.mileageDisplay || `${vehicle.mileage.toLocaleString()} km`}
                          </span>
                          <span className='text-sm text-muted-foreground'>•</span>
                          <span className='text-sm text-muted-foreground'>
                            {vehicle.transmission}
                          </span>
                          <span className='text-sm text-muted-foreground'>•</span>
                          <span className='text-sm text-muted-foreground'>
                            {vehicle.exteriorColor}
                          </span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                const url = `https://customer-portal-v3.vercel.app/dashboard/stock/${vehicle.id}`
                                navigator.clipboard.writeText(url)
                                setCopiedLink(true)
                                setTimeout(() => setCopiedLink(false), 2000)
                                toast.success('Link copied to clipboard')
                              }}
                              className='p-2 rounded-lg hover:bg-muted transition-colors'
                            >
                              {copiedLink ? (
                                <MdCheck className='w-4 h-4 text-emerald-500' />
                              ) : (
                                <MdLink className='w-4 h-4 text-muted-foreground' />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side='bottom'>
                            <p className='text-xs'>{copiedLink ? 'Copied!' : 'Copy link'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Info Sections - Two Column Grid */}
                      <div className='grid gap-4 grid-cols-2'>
                        {/* Stock Details */}
                        <div className='rounded-xl bg-muted/30 p-4'>
                          <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                            Stock Details
                          </h3>
                          <div className='space-y-0.5'>
                            <div className='flex justify-between items-center py-2.5'>
                              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                                <MdLocalOffer className='h-3.5 w-3.5' />
                                Stock ID
                              </span>
                              <div className='flex items-center gap-1.5'>
                                <span className='text-sm font-medium font-mono'>{vehicle.id}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(vehicle.id)
                                    setCopiedId(true)
                                    setTimeout(() => setCopiedId(false), 2000)
                                    toast.success('Copied to clipboard')
                                  }}
                                  className='p-1 rounded hover:bg-muted transition-colors'
                                >
                                  {copiedId ? (
                                    <MdCheck className='h-3 w-3 text-emerald-500' />
                                  ) : (
                                    <MdContentCopy className='h-3 w-3 text-muted-foreground' />
                                  )}
                                </button>
                              </div>
                            </div>
                            <InfoRow
                              label='Stock #'
                              value={vehicle.stockNumber}
                              icon={<MdInventory2 className='h-3.5 w-3.5' />}
                              mono
                            />
                            <InfoRow
                              label='Location'
                              value={vehicle.location}
                              icon={<MdWarehouse className='h-3.5 w-3.5' />}
                            />
                            {vehicle.score && (
                              <InfoRow
                                label='Score'
                                value={vehicle.score}
                                icon={<MdEmojiEvents className='h-3.5 w-3.5' />}
                              />
                            )}
                            {vehicle.dateAvailable && (
                              <InfoRow
                                label='Available'
                                value={vehicle.dateAvailable}
                                icon={<MdCalendarToday className='h-3.5 w-3.5' />}
                              />
                            )}
                          </div>
                        </div>

                        {/* Vehicle Specs */}
                        <div className='rounded-xl bg-muted/30 p-4'>
                          <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                            Specifications
                          </h3>
                          <div className='space-y-0.5'>
                            <InfoRow
                              label='Mileage'
                              value={vehicle.mileageDisplay || `${vehicle.mileage.toLocaleString()} km`}
                              icon={<MdSpeed className='h-3.5 w-3.5' />}
                            />
                            <InfoRow
                              label='Trans'
                              value={vehicle.transmission}
                              icon={<MdBuild className='h-3.5 w-3.5' />}
                            />
                            <InfoRow
                              label='Fuel'
                              value={vehicle.fuelType}
                              icon={<MdLocalGasStation className='h-3.5 w-3.5' />}
                            />
                            <InfoRow
                              label='Color'
                              value={vehicle.exteriorColor}
                              icon={<MdBrush className='h-3.5 w-3.5' />}
                            />
                            {vehicle.displacement && (
                              <InfoRow label='Engine' value={vehicle.displacement} />
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </>
                ) : null}
              </div>

              {/* Sticky Footer */}
              {vehicle && !loading && (
                <div className='flex items-center justify-between border-t px-5 py-4 bg-background'>
                  <div className='flex items-center gap-2'>
                    {vehicle.status === 'available' && onCreateInvoice && (
                      <Button
                        size='default'
                        className='h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white'
                        onClick={() => onCreateInvoice(vehicle)}
                      >
                        <MdDescription className='mr-2 h-4 w-4' />
                        Create Invoice
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        size='default'
                        variant='outline'
                        className='h-10 rounded-lg'
                        onClick={() => onEdit(vehicle)}
                      >
                        <MdEdit className='mr-2 h-4 w-4' />
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size='default'
                            variant='outline'
                            className='h-10 rounded-lg text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10'
                          >
                            <MdDelete className='mr-2 h-4 w-4' />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {vehicle.year} {vehicle.make}{' '}
                              {vehicle.model} ({vehicle.stockNumber})? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className='bg-destructive hover:bg-destructive/90'
                              onClick={() => onDelete(vehicle)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  <Button
                    variant='ghost'
                    className='h-10 rounded-lg text-muted-foreground'
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
      <AnimatePresence>
        {lightboxOpen && vehicle?.images && vehicle.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[100] bg-black'
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className='absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20'
            >
              <MdClose className='h-6 w-6' />
            </button>

            {/* Counter */}
            <div className='absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm'>
              {currentImageIndex + 1} / {vehicle.images.length}
            </div>

            {/* Main image */}
            <div className='flex h-full w-full items-center justify-center p-4 md:p-16'>
              <AnimatePresence mode='wait'>
                <motion.img
                  key={currentImageIndex}
                  src={vehicle.images[currentImageIndex]}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className='max-h-full max-w-full object-contain'
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            {vehicle.images.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className='absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110'
                >
                  <MdChevronLeft className='h-8 w-8' />
                </button>
                <button
                  onClick={goToNext}
                  className='absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110'
                >
                  <MdChevronRight className='h-8 w-8' />
                </button>
              </>
            )}

            {/* Dots indicator */}
            {vehicle.images.length > 1 && (
              <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2'>
                {vehicle.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      'rounded-full transition-all',
                      currentImageIndex === idx
                        ? 'w-3 h-3 bg-white'
                        : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail strip */}
            {vehicle.images.length > 1 && (
              <div className='absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2 rounded-xl bg-black/50 backdrop-blur-sm'>
                {vehicle.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      'flex-shrink-0 h-16 w-20 rounded-lg overflow-hidden transition-all',
                      currentImageIndex === idx
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                        : 'opacity-50 hover:opacity-100'
                    )}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className='h-full w-full object-cover'
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
