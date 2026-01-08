'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import {
  MdArrowBack,
  MdCheckCircle,
  MdTranslate,
  MdFactCheck,
  MdSend,
  MdEmail,
  MdCloudUpload,
  MdDescription,
  MdClose,
  MdAccessTime,
  MdChevronLeft,
  MdChevronRight,
  MdContentCopy,
  MdFullscreen,
} from 'react-icons/md'
import { motion } from 'framer-motion'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

import { requests as allRequests, type ServiceRequest, type InspectionMedia, type InspectionNote } from '../../requests/data/requests'
import { auctions } from '../../auctions/data/auctions'
import { MediaUploadSection } from './media-upload-section'
import { InspectionNotes } from './inspection-notes'
import { getStatusVariant, CURRENT_USER_NAME } from '../types'

interface TaskDetailPageProps {
  taskId: string
}

const auctionMap = new Map(auctions.map((a) => [a.id, a]))

export function TaskDetailPage({ taskId }: TaskDetailPageProps) {
  const router = useRouter()

  const [request, setRequest] = useState<ServiceRequest | null>(() => {
    return allRequests.find((r) => r.id === taskId) || null
  })

  const [translationText, setTranslationText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [auctionSheet, setAuctionSheet] = useState<File | null>(null)
  const [auctionSheetPreview, setAuctionSheetPreview] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [countdown, setCountdown] = useState<string>('')

  const auction = useMemo(() => {
    if (!request?.auctionId) return null
    return auctionMap.get(request.auctionId)
  }, [request?.auctionId])

  const vehicleInfo = useMemo(() => {
    if (auction) {
      return {
        name: `${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`,
        lotNo: auction.lotNumber,
        auctionHouse: auction.auctionHouse,
        image: auction.vehicleInfo.images?.[0] || '/placeholder-car.jpg',
        images: auction.vehicleInfo.images || [],
        grade: auction.vehicleInfo.grade,
        startTime: auction.startTime,
        endTime: auction.endTime,
      }
    }
    if (request?.vehicleInfo) {
      return {
        name: `${request.vehicleInfo.year} ${request.vehicleInfo.make} ${request.vehicleInfo.model}`,
        lotNo: 'N/A',
        auctionHouse: 'N/A',
        image: '/placeholder-car.jpg',
        images: [],
        grade: null,
        startTime: null,
        endTime: null,
      }
    }
    return null
  }, [auction, request?.vehicleInfo])

  // Generate preview URL for auction sheet
  useEffect(() => {
    if (!auctionSheet) {
      setAuctionSheetPreview(null)
      return
    }

    const url = URL.createObjectURL(auctionSheet)
    setAuctionSheetPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [auctionSheet])

  // Paste handler for auction sheet
  useEffect(() => {
    if (request?.type !== 'translation') return

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            // Create a new file with a proper name
            const namedFile = new File([file], `pasted-image-${Date.now()}.png`, { type: file.type })
            setAuctionSheet(namedFile)
            toast.success('Image pasted from clipboard')
          }
          break
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [request?.type])

  // Countdown timer effect
  useEffect(() => {
    if (!vehicleInfo?.endTime) return

    const calculateCountdown = () => {
      const now = new Date().getTime()
      const end = new Date(vehicleInfo.endTime).getTime()
      const diff = end - now

      if (diff <= 0) {
        setCountdown('Ended')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setCountdown(`${minutes}m ${seconds}s`)
      }
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)
    return () => clearInterval(interval)
  }, [vehicleInfo?.endTime])

  if (!request) {
    return (
      <Main className='flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold'>Task not found</h2>
          <Button variant='outline' className='mt-4' onClick={() => router.push('/tasks')}>
            <MdArrowBack className='mr-2 h-4 w-4' />
            Back to Tasks
          </Button>
        </div>
      </Main>
    )
  }

  const isTranslation = request.type === 'translation'
  const isCompleted = request.status === 'completed'

  // Handlers
  const handleAddMedia = (newMedia: InspectionMedia[]) => {
    setRequest(prev => prev ? {
      ...prev,
      inspectionMedia: [...(prev.inspectionMedia || []), ...newMedia],
    } : null)
  }

  const handleDeleteMedia = (mediaId: string) => {
    setRequest(prev => prev ? {
      ...prev,
      inspectionMedia: (prev.inspectionMedia || []).filter(m => m.id !== mediaId),
    } : null)
  }

  const handleAddNote = (note: InspectionNote) => {
    setRequest(prev => prev ? {
      ...prev,
      inspectionNotes: [...(prev.inspectionNotes || []), note],
    } : null)
  }

  const handleSendTranslation = async () => {
    if (!translationText.trim()) {
      toast.error('Please enter translation text')
      return
    }
    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setRequest(prev => prev ? {
      ...prev,
      status: 'completed',
      updatedAt: new Date(),
      completedAt: new Date()
    } : null)
    setIsSending(false)
    toast.success('Translation sent successfully!')
  }

  const handleCompleteInspection = async () => {
    const mediaCount = request?.inspectionMedia?.length || 0
    const notesCount = request?.inspectionNotes?.length || 0

    if (mediaCount === 0 && notesCount === 0) {
      toast.error('Please add at least one photo or note before completing')
      return
    }

    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setRequest(prev => prev ? {
      ...prev,
      status: 'completed',
      updatedAt: new Date(),
      completedAt: new Date()
    } : null)
    setIsSending(false)
    toast.success('Inspection completed successfully!')
  }

  const handleCopyVehicleImage = async () => {
    const imageUrl = vehicleInfo?.images[currentImageIndex] || vehicleInfo?.image
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      toast.success('Image copied to clipboard')
    } catch {
      toast.error('Failed to copy image')
    }
  }

  return (
    <>
      <Header fixed>
        <Button variant='ghost' size='sm' onClick={() => router.push('/tasks')} className='gap-2'>
          <MdArrowBack className='h-4 w-4' />
          Back to Tasks
        </Button>
      </Header>

      <Main className='p-6'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className='w-full lg:w-80 flex-shrink-0'
          >
            <div className={cn(
              'rounded-2xl overflow-hidden sticky top-20',
              'bg-gradient-to-b from-primary/[0.03] to-card',
              'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)]',
              'ring-1 ring-border/50'
            )}>
              {/* Vehicle Image Gallery */}
              {vehicleInfo && (
                <div className='relative aspect-[4/3] bg-muted group'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vehicleInfo.images[currentImageIndex] || vehicleInfo.image}
                    alt={vehicleInfo.name}
                    className='h-full w-full object-cover cursor-pointer'
                    onClick={() => setIsFullscreen(true)}
                  />
                  {/* Gradient Scrim */}
                  <div className='absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none' />

                  {/* Fullscreen overlay on hover */}
                  <div
                    className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none'
                  >
                    <div className='h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30'>
                      <MdFullscreen className='h-7 w-7 text-white' />
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {vehicleInfo.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentImageIndex(prev => prev === 0 ? vehicleInfo.images.length - 1 : prev - 1)
                        }}
                        className='absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10'
                      >
                        <MdChevronLeft className='h-6 w-6' />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentImageIndex(prev => prev === vehicleInfo.images.length - 1 ? 0 : prev + 1)
                        }}
                        className='absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10'
                      >
                        <MdChevronRight className='h-6 w-6' />
                      </button>
                    </>
                  )}

                  {/* Image Counter & Thumbnails */}
                  {vehicleInfo.images.length > 1 && (
                    <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10'>
                      {vehicleInfo.images.slice(0, 5).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation()
                            setCurrentImageIndex(idx)
                          }}
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            idx === currentImageIndex
                              ? 'w-4 bg-white'
                              : 'w-1.5 bg-white/50 hover:bg-white/70'
                          )}
                        />
                      ))}
                      {vehicleInfo.images.length > 5 && (
                        <span className='text-[10px] text-white/70 ml-1'>+{vehicleInfo.images.length - 5}</span>
                      )}
                    </div>
                  )}

                  {/* Image Count Badge */}
                  {vehicleInfo.images.length > 1 && (
                    <div className='absolute top-3 left-3 z-10'>
                      <span className='inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium bg-black/40 backdrop-blur-sm text-white'>
                        {currentImageIndex + 1} / {vehicleInfo.images.length}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Vehicle Details */}
              <div className='p-5 space-y-4'>
                {vehicleInfo && (
                  <div>
                    <div className='flex items-start justify-between gap-2'>
                      <h1 className='text-lg font-semibold'>{vehicleInfo.name}</h1>
                      <span className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium shrink-0',
                        isTranslation
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20'
                      )}>
                        {isTranslation ? <MdTranslate className='h-3 w-3' /> : <MdFactCheck className='h-3 w-3' />}
                        {isTranslation ? 'Translation' : 'Inspection'}
                      </span>
                    </div>
                    <p className='text-sm text-muted-foreground mt-1'>
                      <span className='font-mono'>{vehicleInfo.lotNo}</span>
                      <span className='mx-1.5'>•</span>
                      <span>{vehicleInfo.auctionHouse}</span>
                    </p>
                    <div className='mt-3 flex flex-wrap items-center gap-2'>
                      {vehicleInfo.grade && (
                        <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium ring-1 ring-border/50'>
                          <span className='text-muted-foreground'>Auction Grade</span>
                          <span className='font-semibold'>{vehicleInfo.grade}</span>
                        </span>
                      )}
                      {vehicleInfo.startTime && (
                        <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium ring-1 ring-border/50 tabular-nums'>
                          {format(new Date(vehicleInfo.startTime), 'MMM d, yyyy')}
                        </span>
                      )}
                      {vehicleInfo.endTime && countdown && (
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ring-1',
                          countdown === 'Ended'
                            ? 'bg-red-500/10 text-red-700 dark:text-red-400 ring-red-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20'
                        )}>
                          <MdAccessTime className='h-3.5 w-3.5' />
                          <span className='tabular-nums'>{countdown}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className='h-px bg-border/60' />

                {/* Customer Info */}
                <div className='space-y-2'>
                  <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>Customer</p>
                  <button
                    onClick={() => router.push(`/customers/${request.customerId || request.id}`)}
                    className='w-full bg-secondary/50 p-3 rounded-xl hover:bg-secondary/70 transition-colors text-left group'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all'>
                        <span className='text-sm font-semibold text-primary'>
                          {request.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium truncate group-hover:text-primary transition-colors'>{request.customerName}</p>
                        <p className='text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5'>
                          <MdEmail className='h-3.5 w-3.5' />
                          <span className='truncate'>{request.customerEmail}</span>
                        </p>
                      </div>
                      <MdChevronRight className='h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0' />
                    </div>
                  </button>
                </div>

                <div className='h-px bg-border/60' />

                {/* Status & Meta */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2'>
                    <span className='text-sm text-muted-foreground'>Status</span>
                    <div className='flex items-center gap-2'>
                      {request.status === 'in_progress' && (
                        <span className='relative flex h-2 w-2'>
                          <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75' />
                          <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-500' />
                        </span>
                      )}
                      <Badge variant={getStatusVariant(request.status) as any} className='capitalize'>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {request.assignedToName && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>Assigned to</span>
                      <div className='flex items-center gap-2'>
                        <div className='h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium'>
                          {request.assignedToName.charAt(0)}
                        </div>
                        <span className='text-sm font-medium'>{request.assignedToName}</span>
                      </div>
                    </div>
                  )}

                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Created</span>
                    <span className='text-sm tabular-nums'>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                  </div>

                  {request.completedAt && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>Completed</span>
                      <span className='text-sm tabular-nums'>{format(new Date(request.completedAt), 'MMM d, HH:mm')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className='flex-1 space-y-6'
          >
            
            {/* Translation Content */}
            {isTranslation && (
              <div className='space-y-6'>
                {/* Auction Sheet Upload */}
                <div className={cn(
                  'rounded-3xl overflow-hidden',
                  'bg-gradient-to-b from-primary/[0.02] to-card',
                  'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)]',
                  'ring-1 ring-border/40'
                )}>
                  <div className='px-6 py-5 border-b border-border/50 bg-gradient-to-r from-secondary/40 to-secondary/20'>
                    <h2 className='text-base font-semibold tracking-tight'>Auction Sheet</h2>
                    <p className='text-[13px] text-muted-foreground mt-1'>Upload the original auction document</p>
                  </div>
                  <div className='p-6'>
                    {/* Upload Area */}
                    {auctionSheet && auctionSheetPreview ? (
                      <div className='relative rounded-2xl overflow-hidden ring-1 ring-border/50 bg-secondary/20'>
                        {/* Image Preview */}
                        <div className='relative max-h-[400px] overflow-y-auto bg-muted'>
                          {auctionSheet.type.startsWith('image/') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={auctionSheetPreview}
                              alt='Auction sheet preview'
                              className='w-full object-contain'
                            />
                          ) : (
                            <div className='w-full min-h-[200px] flex items-center justify-center py-12'>
                              <div className='text-center'>
                                <MdDescription className='h-16 w-16 mx-auto text-muted-foreground/50' />
                                <p className='mt-2 text-sm text-muted-foreground'>PDF Document</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Remove button - outside scroll container */}
                        <div className='absolute top-9 right-9'>
                          <Button
                            variant='secondary'
                            size='icon'
                            className='h-9 w-9 rounded-full shadow-lg backdrop-blur-sm bg-black/40 hover:bg-black/60 text-white hover:text-white'
                            onClick={() => setAuctionSheet(null)}
                          >
                            <MdClose className='h-5 w-5' />
                          </Button>
                        </div>
                        {/* File info bar */}
                        <div className='px-4 py-3 flex items-center justify-between bg-emerald-500/5 border-t border-emerald-500/10'>
                          <div className='flex items-center gap-2'>
                            <div className='h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center'>
                              <MdCheckCircle className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                            </div>
                            <div>
                              <p className='text-sm font-medium truncate max-w-[200px]'>{auctionSheet.name}</p>
                              <p className='text-xs text-muted-foreground'>
                                {(auctionSheet.size / 1024).toFixed(1)} KB • Ready for translation
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
                          isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/[0.02]'
                        )}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setIsDragging(false)
                          const file = e.dataTransfer.files[0]
                          if (file) {
                            setAuctionSheet(file)
                            toast.success('Auction sheet uploaded')
                          }
                        }}
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*,.pdf'
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) {
                              setAuctionSheet(file)
                              toast.success('Auction sheet uploaded')
                            }
                          }
                          input.click()
                        }}
                      >
                        <div className='h-14 w-14 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center'>
                          <MdCloudUpload className='h-7 w-7 text-primary/60' />
                        </div>
                        <p className='mt-4 text-sm font-medium'>
                          Drop, click, or paste image
                        </p>
                        <p className='mt-1 text-xs text-muted-foreground'>
                          Supports images and PDF • <span className='font-medium'>Ctrl+V to paste</span>
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Translation Text Area */}
                <div className={cn(
                  'rounded-3xl overflow-hidden',
                  'bg-gradient-to-b from-primary/[0.02] to-card',
                  'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)]',
                  'ring-1 ring-border/40'
                )}>
                  <div className='px-6 py-5 border-b border-border/50 bg-gradient-to-r from-secondary/40 to-secondary/20'>
                    <h2 className='text-base font-semibold tracking-tight'>Translation</h2>
                    <p className='text-[13px] text-muted-foreground mt-1'>Enter the translated auction sheet content</p>
                  </div>
                  <div className='p-6'>
                    {isCompleted ? (
                      <div className='rounded-2xl bg-emerald-500/5 ring-1 ring-emerald-500/20 p-6 text-center'>
                        <div className='h-14 w-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4'>
                          <MdCheckCircle className='h-7 w-7 text-emerald-600 dark:text-emerald-400' />
                        </div>
                        <p className='font-semibold text-emerald-700 dark:text-emerald-400'>Translation completed</p>
                        {request.completedAt && (
                          <p className='text-sm text-emerald-600/80 dark:text-emerald-500/80 mt-1'>
                            Sent on {format(new Date(request.completedAt), 'PPp')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        <div className='relative rounded-2xl ring-1 ring-border focus-within:ring-2 focus-within:ring-primary transition-shadow'>
                          <Textarea
                            placeholder='Enter translation here...'
                            value={translationText}
                            onChange={(e) => setTranslationText(e.target.value)}
                            className='min-h-[200px] resize-none border-0 rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0 pb-10'
                          />
                          <div className='absolute bottom-3 right-4'>
                            <span className='inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-[11px] font-medium text-muted-foreground'>
                              {translationText.length} chars
                            </span>
                          </div>
                        </div>
                        <div className='flex justify-end'>
                          <Button
                            size='lg'
                            onClick={handleSendTranslation}
                            disabled={isSending || !translationText.trim()}
                            className='rounded-full min-w-[160px] shadow-lg'
                          >
                            <MdSend className='h-5 w-5 mr-2' />
                            {isSending ? 'Sending...' : 'Send Translation'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Inspection Content */}
            {!isTranslation && (
              <div className='space-y-6'>
                <div className='flex flex-col xl:flex-row gap-6'>
                  {/* Media Section - Takes more space */}
                  <div className='flex-1'>
                    <div className={cn(
                      'rounded-3xl overflow-hidden',
                      'bg-gradient-to-b from-primary/[0.02] to-card',
                      'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)]',
                      'ring-1 ring-border/40'
                    )}>
                      <div className='px-6 py-5 border-b border-border/50 bg-gradient-to-r from-secondary/40 to-secondary/20'>
                        <h2 className='text-base font-semibold tracking-tight'>Inspection Media</h2>
                        <p className='text-[13px] text-muted-foreground mt-1'>Upload photos and videos</p>
                      </div>
                      <div className='p-6'>
                        <MediaUploadSection
                          media={request.inspectionMedia || []}
                          onAddMedia={handleAddMedia}
                          onDeleteMedia={handleDeleteMedia}
                          disabled={isCompleted}
                          currentUser={CURRENT_USER_NAME}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes Section - Sticky on the right */}
                  <div className='xl:w-80 flex-shrink-0'>
                    <div className={cn(
                      'rounded-3xl overflow-hidden sticky top-20',
                      'bg-gradient-to-b from-primary/[0.02] to-card',
                      'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)]',
                      'ring-1 ring-border/40'
                    )}>
                      <div className='px-6 py-5 border-b border-border/50 bg-gradient-to-r from-secondary/40 to-secondary/20'>
                        <h2 className='text-base font-semibold tracking-tight'>Inspection Notes</h2>
                        <p className='text-[13px] text-muted-foreground mt-1'>Add findings and observations</p>
                      </div>
                      <div className='p-6'>
                        <InspectionNotes
                          notes={request.inspectionNotes || []}
                          onAddNote={handleAddNote}
                          disabled={isCompleted}
                          currentUser={CURRENT_USER_NAME}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complete Inspection */}
                <div className={cn(
                  'rounded-3xl overflow-hidden',
                  'bg-gradient-to-b from-primary/[0.02] to-card',
                  'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)]',
                  'ring-1 ring-border/40'
                )}>
                  <div className='p-6'>
                    {isCompleted ? (
                      <div className='rounded-2xl bg-emerald-500/5 ring-1 ring-emerald-500/20 p-6 text-center'>
                        <div className='h-14 w-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4'>
                          <MdCheckCircle className='h-7 w-7 text-emerald-600 dark:text-emerald-400' />
                        </div>
                        <p className='font-semibold text-emerald-700 dark:text-emerald-400'>Inspection completed</p>
                        {request.completedAt && (
                          <p className='text-sm text-emerald-600/80 dark:text-emerald-500/80 mt-1'>
                            Completed on {format(new Date(request.completedAt), 'PPp')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>Ready to submit?</p>
                          <p className='text-sm text-muted-foreground mt-0.5'>
                            {(request.inspectionMedia?.length || 0)} photos • {(request.inspectionNotes?.length || 0)} notes
                          </p>
                        </div>
                        <Button
                          size='lg'
                          onClick={handleCompleteInspection}
                          disabled={isSending}
                          className='rounded-full min-w-[180px] shadow-lg'
                        >
                          <MdSend className='h-5 w-5 mr-2' />
                          {isSending ? 'Submitting...' : 'Complete Inspection'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </Main>

      {/* Fullscreen Vehicle Image Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className='max-w-[95vw] max-h-[95vh] p-0 overflow-hidden rounded-3xl border-0 bg-black/95' showCloseButton={false}>
          <div className='relative w-full h-full flex items-center justify-center group'>
            {vehicleInfo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vehicleInfo.images[currentImageIndex] || vehicleInfo.image}
                alt={vehicleInfo.name}
                className='max-w-full max-h-[85vh] object-contain'
              />
            )}

            {/* Navigation Arrows */}
            {vehicleInfo && vehicleInfo.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? vehicleInfo.images.length - 1 : prev - 1)}
                  className='absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors'
                >
                  <MdChevronLeft className='h-8 w-8' />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === vehicleInfo.images.length - 1 ? 0 : prev + 1)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors'
                >
                  <MdChevronRight className='h-8 w-8' />
                </button>
              </>
            )}

            {/* Action buttons */}
            <div className='absolute top-4 right-4 flex items-center gap-2'>
              {isTranslation && (
                <Button
                  variant='secondary'
                  size='icon'
                  className='h-10 w-10 rounded-full backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white hover:text-white'
                  onClick={handleCopyVehicleImage}
                >
                  <MdContentCopy className='h-5 w-5' />
                </Button>
              )}
              <Button
                variant='secondary'
                size='icon'
                className='h-10 w-10 rounded-full backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white hover:text-white'
                onClick={() => setIsFullscreen(false)}
              >
                <MdClose className='h-5 w-5' />
              </Button>
            </div>

            {/* Image counter & vehicle name footer */}
            {vehicleInfo && (
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2'>
                <div className='inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm'>
                  {vehicleInfo.images.length > 1 && (
                    <span className='text-sm text-white font-medium tabular-nums'>
                      {currentImageIndex + 1} / {vehicleInfo.images.length}
                    </span>
                  )}
                  <span className='text-sm text-white/80'>
                    {vehicleInfo.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
