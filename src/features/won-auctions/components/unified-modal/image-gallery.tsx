'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdDirectionsCar,
  MdZoomIn,
} from 'react-icons/md'
import { cn } from '@/lib/utils'

// Compact Image Gallery for Modal
interface ModalImageGalleryProps {
  images: string[]
  alt: string
}

export function ModalImageGallery({ images, alt }: ModalImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Filter valid images
  const validImages = images.filter((img) => img && img !== '#' && img !== '')

  const goToNext = useCallback(() => {
    if (validImages.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % validImages.length)
    }
  }, [validImages.length])

  const goToPrev = useCallback(() => {
    if (validImages.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
    }
  }, [validImages.length])

  if (!validImages || validImages.length === 0) {
    return (
      <div className='flex h-full w-full items-center justify-center bg-muted rounded-xl'>
        <MdDirectionsCar className='h-8 w-8 text-muted-foreground/50' />
      </div>
    )
  }

  return (
    <>
      <div className='space-y-2'>
        {/* Main Image */}
        <div
          className='relative h-48 rounded-xl overflow-hidden bg-muted cursor-pointer group'
          onClick={() => setLightboxOpen(true)}
        >
          <AnimatePresence mode='wait'>
            <motion.img
              key={currentIndex}
              src={validImages[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              className='h-full w-full object-cover'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>

          {/* Zoom overlay */}
          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center'>
            <motion.div
              className='opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2 backdrop-blur-sm'
              whileHover={{ scale: 1.1 }}
            >
              <MdZoomIn className='h-5 w-5 text-white' />
            </motion.div>
          </div>

          {/* Navigation arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrev()
                }}
                className='absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 opacity-0 group-hover:opacity-100'
              >
                <MdChevronLeft className='h-5 w-5' />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className='absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 opacity-0 group-hover:opacity-100'
              >
                <MdChevronRight className='h-5 w-5' />
              </button>
            </>
          )}

          {/* Image counter */}
          {validImages.length > 1 && (
            <div className='absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/50 text-xs text-white backdrop-blur-sm'>
              {currentIndex + 1} / {validImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {validImages.length > 1 && (
          <div className='flex gap-1.5 overflow-x-auto pb-1'>
            {validImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'flex-shrink-0 h-12 w-16 rounded-lg overflow-hidden transition-all',
                  currentIndex === idx
                    ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                    : 'opacity-60 hover:opacity-100'
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
      </div>

      {/* Lightbox */}
      <ModalLightbox
        images={validImages}
        initialIndex={currentIndex}
        alt={alt}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setCurrentIndex}
      />
    </>
  )
}

// Lightbox Component
interface ModalLightboxProps {
  images: string[]
  initialIndex: number
  alt: string
  open: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
}

function ModalLightbox({
  images,
  initialIndex,
  alt,
  open,
  onClose,
  onIndexChange,
}: ModalLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const goToNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % images.length
    setCurrentIndex(newIndex)
    onIndexChange(newIndex)
  }, [currentIndex, images.length, onIndexChange])

  const goToPrev = useCallback(() => {
    const newIndex = (currentIndex - 1 + images.length) % images.length
    setCurrentIndex(newIndex)
    onIndexChange(newIndex)
  }, [currentIndex, images.length, onIndexChange])

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
          className='fixed inset-0 z-[200] bg-black/95'
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className='absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20'
          >
            <MdClose className='h-6 w-6' />
          </button>

          {/* Image counter */}
          <div className='absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm'>
            {currentIndex + 1} / {images.length}
          </div>

          {/* Main image */}
          <div
            className='flex h-full w-full items-center justify-center p-4 md:p-16'
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode='wait'>
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`${alt} - Image ${currentIndex + 1}`}
                className='max-h-full max-w-full object-contain rounded-lg'
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
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrev()
                }}
                className='absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20'
              >
                <MdChevronLeft className='h-8 w-8' />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className='absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20'
              >
                <MdChevronRight className='h-8 w-8' />
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2 rounded-xl bg-black/50 backdrop-blur-sm'>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentIndex(idx)
                    onIndexChange(idx)
                  }}
                  className={cn(
                    'flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden transition-all',
                    currentIndex === idx
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
  )
}
