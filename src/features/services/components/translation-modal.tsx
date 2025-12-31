'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  MdBusiness,
  MdCalendarToday,
  MdCheck,
  MdCheckCircle,
  MdAccessTime,
  MdContentCopy,
  MdDescription,
  MdImage,
  MdTranslate,
  MdSend,
  MdStar,
  MdUpload,
  MdPerson,
  MdClose,
  MdZoomIn,
  MdSync,
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ServiceRequest } from '../../requests/data/requests'
import type { Auction } from '../../auctions/data/auctions'
import { getCurrentStep, MAX_TRANSLATION_CHARACTERS } from '../types'

interface TranslationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: ServiceRequest | null
  auction: Auction | undefined
  onSendTranslation: (replyText: string) => Promise<void>
}

const TRANSLATION_STATUS_STEPS = [
  { key: 'pending', label: 'Requested', icon: MdDescription },
  { key: 'in_progress', label: 'Translating', icon: MdTranslate },
  { key: 'completed', label: 'Completed', icon: MdCheckCircle },
]

export function TranslationModal({
  open,
  onOpenChange,
  request,
  auction,
  onSendTranslation,
}: TranslationModalProps) {
  const [replyText, setReplyText] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setReplyText('')
      setCopiedField(null)
      removeUploadedFile()
    }
  }, [open])

  // Keyboard shortcut for sending (Cmd/Ctrl + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && open && request?.type === 'translation' && replyText.trim()) {
        e.preventDefault()
        handleSend()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, replyText, request])

  const getWaitTime = (createdAt: Date) => {
    const diffMs = new Date().getTime() - new Date(createdAt).getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ${hours % 24}h`
    return `${hours}h`
  }

  // File upload handlers
  const handleFileUpload = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image or PDF.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.')
      return
    }
    setUploadedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    toast.success('Auction sheet uploaded successfully')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) handleFileUpload(files[0])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) handleFileUpload(files[0])
  }

  const removeUploadedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setUploadedFile(null)
    setPreviewUrl(null)
  }

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSend = async () => {
    if (!request || !replyText.trim()) {
      toast.error('Please enter the translation before sending')
      return
    }
    setIsSending(true)
    await onSendTranslation(replyText)
    setIsSending(false)
    setReplyText('')
  }

  if (!request || !auction) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='!max-w-4xl !w-[90vw] p-0 gap-0 overflow-hidden'>
          <AnimatePresence mode='wait'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='flex flex-col max-h-[90vh]'
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='flex items-center justify-between px-6 py-5 border-b bg-muted/30'
              >
                <div className='flex items-center gap-4'>
                  <div className='h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center'>
                    <MdTranslate className='h-6 w-6 text-blue-500' />
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold'>Translation Request</h2>
                    <p className='text-sm text-muted-foreground'>
                      {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
                    </p>
                  </div>
                </div>
                <Badge variant={request.status === 'completed' ? 'emerald' : 'amber'} className='text-xs'>
                  {request.status === 'completed' ? 'Completed' : 'Pending'}
                </Badge>
              </motion.div>

              {/* Status Stepper */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className='px-6 py-4 border-b flex justify-center'
              >
                <div className='flex items-center max-w-md w-full'>
                  {TRANSLATION_STATUS_STEPS.map((step, index) => {
                    const currentStep = getCurrentStep(request.status)
                    const isActive = index <= currentStep
                    const isCurrent = index === currentStep
                    const Icon = step.icon

                    return (
                      <div key={step.key} className='flex items-center flex-1'>
                        <div className='flex flex-col items-center gap-2'>
                          <div
                            className={cn(
                              'h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300',
                              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                              isCurrent && 'ring-4 ring-primary/20'
                            )}
                          >
                            <Icon className='h-5 w-5' />
                          </div>
                          <span
                            className={cn(
                              'text-xs font-medium transition-colors',
                              isActive ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {step.label}
                          </span>
                        </div>
                        {index < TRANSLATION_STATUS_STEPS.length - 1 && (
                          <div
                            className={cn(
                              'flex-1 h-0.5 mx-3 transition-colors duration-300',
                              index < currentStep ? 'bg-primary' : 'bg-muted'
                            )}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Content */}
              <div className='flex-1 overflow-y-auto p-6 space-y-5'>
                {/* Auction Sheet Upload */}
                {request.status !== 'completed' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                    <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
                      Auction Sheet
                    </h3>
                    {!uploadedFile ? (
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={cn(
                          'relative rounded-xl border-2 border-dashed transition-all duration-200',
                          isDragging
                            ? 'border-primary bg-primary/5 scale-[1.01]'
                            : 'border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
                        )}
                      >
                        <input
                          type='file'
                          accept='image/*,.pdf'
                          onChange={handleFileInputChange}
                          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                        />
                        <div className='flex flex-col items-center justify-center py-8 px-4'>
                          <div
                            className={cn(
                              'h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-colors',
                              isDragging ? 'bg-primary/20' : 'bg-muted'
                            )}
                          >
                            <MdUpload
                              className={cn('h-6 w-6 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')}
                            />
                          </div>
                          <p className='text-sm font-medium text-foreground'>
                            {isDragging ? 'Drop file here' : 'Drag & drop auction sheet'}
                          </p>
                          <p className='text-xs text-muted-foreground mt-1'>or click to browse • PNG, JPG, PDF up to 10MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className='relative rounded-xl border bg-card overflow-hidden'>
                        <div className='relative group'>
                          {uploadedFile.type.startsWith('image/') ? (
                            <div className='relative aspect-video bg-muted/30'>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={previewUrl || ''} alt='Auction sheet preview' className='w-full h-full object-contain' />
                              <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center'>
                                <button
                                  onClick={() => setIsPreviewOpen(true)}
                                  className='opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg'
                                >
                                  <MdZoomIn className='h-5 w-5' />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className='aspect-video bg-muted/30 flex items-center justify-center'>
                              <div className='text-center'>
                                <MdDescription className='h-12 w-12 text-muted-foreground mx-auto mb-2' />
                                <p className='text-sm text-muted-foreground'>PDF Document</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className='flex items-center justify-between p-3 border-t bg-muted/20'>
                          <div className='flex items-center gap-2 min-w-0'>
                            <MdImage className='h-4 w-4 text-muted-foreground shrink-0' />
                            <span className='text-sm text-foreground truncate'>{uploadedFile.name}</span>
                            <span className='text-xs text-muted-foreground shrink-0'>
                              ({(uploadedFile.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <button
                            onClick={removeUploadedFile}
                            className='text-muted-foreground hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10'
                          >
                            <MdClose className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Vehicle Details Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='rounded-xl border bg-card p-5'
                >
                  <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4'>Vehicle Details</h3>
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <MdBusiness className='h-4 w-4' />
                        <span className='text-xs'>Lot Number</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='font-mono font-semibold'>{auction.lotNumber}</span>
                        <button
                          onClick={() => handleCopy(auction.lotNumber, 'lot')}
                          className='text-muted-foreground hover:text-foreground transition-colors'
                        >
                          {copiedField === 'lot' ? (
                            <MdCheck className='h-3.5 w-3.5 text-emerald-500' />
                          ) : (
                            <MdContentCopy className='h-3.5 w-3.5' />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <MdBusiness className='h-4 w-4' />
                        <span className='text-xs'>Auction House</span>
                      </div>
                      <span className='font-semibold'>{auction.auctionHouse}</span>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <MdCalendarToday className='h-4 w-4' />
                        <span className='text-xs'>Date</span>
                      </div>
                      <span className='font-semibold'>{format(new Date(auction.startTime), 'MMM d, yyyy')}</span>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <MdStar className='h-4 w-4' />
                        <span className='text-xs'>Grade</span>
                      </div>
                      <span className='font-semibold'>{auction.vehicleInfo.grade || 'N/A'}</span>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <MdAccessTime className='h-4 w-4' />
                        <span className='text-xs'>Ending Time</span>
                      </div>
                      <span className='font-semibold'>
                        {format(new Date(auction.endTime || auction.startTime), 'HH:mm')}
                      </span>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <MdPerson className='h-4 w-4' />
                        <span className='text-xs'>Customer</span>
                      </div>
                      <span className='font-semibold'>{request.customerName}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Translation Section */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  {request.status === 'completed' ? (
                    <div className='rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5'>
                      <div className='flex items-center gap-3'>
                        <div className='h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center'>
                          <MdCheckCircle className='h-5 w-5 text-emerald-600' />
                        </div>
                        <div>
                          <span className='font-semibold text-emerald-700 dark:text-emerald-400'>Translation Completed</span>
                          <p className='text-sm text-muted-foreground'>This translation has been sent to the customer.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Translation</h3>
                        <span className='text-xs text-muted-foreground flex items-center gap-1'>
                          <MdAccessTime className='h-3 w-3' />
                          Waiting {getWaitTime(request.createdAt)}
                        </span>
                      </div>
                      <div className='relative'>
                        <Textarea
                          placeholder='Enter your translation here...'
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value.slice(0, MAX_TRANSLATION_CHARACTERS))}
                          className='min-h-[180px] resize-none rounded-xl bg-muted/30 border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                          autoFocus
                        />
                      </div>
                      <div className='flex items-center justify-between text-xs text-muted-foreground'>
                        <span className='flex items-center gap-1.5'>
                          <kbd className='px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]'>⌘</kbd>
                          <span>+</span>
                          <kbd className='px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]'>Enter</kbd>
                          <span>to send</span>
                        </span>
                        <span
                          className={cn(
                            replyText.length >= MAX_TRANSLATION_CHARACTERS * 0.8 &&
                              replyText.length < MAX_TRANSLATION_CHARACTERS &&
                              'text-amber-500',
                            replyText.length >= MAX_TRANSLATION_CHARACTERS && 'text-red-500'
                          )}
                        >
                          {replyText.length.toLocaleString()} / {MAX_TRANSLATION_CHARACTERS.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Sticky Footer */}
              {request.status !== 'completed' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className='px-6 py-4 border-t bg-muted/30'
                >
                  <div className='flex items-center justify-end gap-3'>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={!replyText.trim() || isSending} className='min-w-[140px]'>
                      {isSending ? (
                        <>
                          <MdSync className='h-4 w-4 mr-2 animate-spin' />
                          Sending...
                        </>
                      ) : (
                        <>
                          <MdSend className='h-4 w-4 mr-2' />
                          Send Translation
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className='!max-w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden bg-black/95 border-none'>
          <div className='relative w-full h-full flex items-center justify-center p-4'>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className='absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10'
            >
              <MdClose className='h-5 w-5' />
            </button>
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt='Auction sheet full preview' className='max-w-full max-h-[90vh] object-contain rounded-lg' />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
