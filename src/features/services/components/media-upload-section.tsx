'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { format } from 'date-fns'
import {
  MdImage,
  MdVideocam,
  MdUpload,
  MdClose,
  MdPlayArrow,
  MdFullscreen,
  MdDelete,
  MdAdd,
} from 'react-icons/md'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { type InspectionMedia } from '@/features/requests/data/requests'

interface MediaUploadSectionProps {
  media: InspectionMedia[]
  onAddMedia: (media: InspectionMedia[]) => void
  onDeleteMedia: (mediaId: string) => void
  disabled?: boolean
  currentUser: string
}

export function MediaUploadSection({
  media,
  onAddMedia,
  onDeleteMedia,
  disabled = false,
  currentUser,
}: MediaUploadSectionProps) {
  const [previewMedia, setPreviewMedia] = useState<InspectionMedia | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newMedia: InspectionMedia[] = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      url: URL.createObjectURL(file),
      thumbnail: URL.createObjectURL(file),
      uploadedBy: currentUser,
      uploadedAt: new Date(),
    }))

    onAddMedia(newMedia)
    toast.success(`${acceptedFiles.length} file(s) uploaded`)
  }, [onAddMedia, currentUser])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
    disabled,
  })

  const handleDelete = (mediaId: string) => {
    onDeleteMedia(mediaId)
    toast.success('Media deleted')
  }

  const images = media.filter((m) => m.type === 'image')
  const videos = media.filter((m) => m.type === 'video')

  return (
    <div className='space-y-5'>
      {/* Upload Zone */}
      {!disabled && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
            isDragActive
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/[0.02]'
          )}
        >
          <input {...getInputProps()} />
          <div className='flex flex-col items-center gap-3'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5'>
              <MdUpload className='h-7 w-7 text-primary/60' />
            </div>
            <div>
              <p className='font-medium'>
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className='text-sm text-muted-foreground mt-1'>
                or click to browse • Images & Videos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {media.length > 0 && (
        <div className='space-y-4'>
          {/* Images */}
          {images.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <div className='h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center'>
                  <MdImage className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                </div>
                <span className='text-sm font-medium'>Images</span>
                <span className='text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full'>{images.length}</span>
              </div>
              <div className='grid grid-cols-4 gap-2.5'>
                {images.map((item) => (
                  <div
                    key={item.id}
                    className='group relative aspect-square rounded-xl overflow-hidden ring-1 ring-border/50 bg-muted shadow-sm'
                  >
                    <img
                      src={item.url}
                      alt='Inspection'
                      className='w-full h-full object-cover transition-transform group-hover:scale-105'
                    />
                    {/* Overlay */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2 gap-1.5'>
                      <Button
                        size='icon'
                        variant='secondary'
                        className='h-8 w-8 rounded-full backdrop-blur-sm'
                        onClick={() => setPreviewMedia(item)}
                      >
                        <MdFullscreen className='h-4 w-4' />
                      </Button>
                      {!disabled && (
                        <Button
                          size='icon'
                          variant='destructive'
                          className='h-8 w-8 rounded-full'
                          onClick={() => handleDelete(item.id)}
                        >
                          <MdDelete className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    {/* Note indicator */}
                    {item.note && (
                      <div className='absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-2 py-1'>
                        <p className='text-[10px] text-white truncate'>{item.note}</p>
                      </div>
                    )}
                  </div>
                ))}
                {!disabled && (
                  <div
                    {...getRootProps()}
                    className='aspect-square rounded-xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] transition-all'
                  >
                    <MdAdd className='h-6 w-6 text-muted-foreground' />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <div className='h-6 w-6 rounded-lg bg-rose-500/10 flex items-center justify-center'>
                  <MdVideocam className='h-3.5 w-3.5 text-rose-600 dark:text-rose-400' />
                </div>
                <span className='text-sm font-medium'>Videos</span>
                <span className='text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full'>{videos.length}</span>
              </div>
              <div className='grid grid-cols-2 gap-2.5'>
                {videos.map((item) => (
                  <div
                    key={item.id}
                    className='group relative aspect-video rounded-xl overflow-hidden ring-1 ring-border/50 bg-muted shadow-sm'
                  >
                    <video
                      src={item.url}
                      className='w-full h-full object-cover'
                    />
                    {/* Play overlay */}
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20'>
                        <MdPlayArrow className='h-6 w-6 text-white fill-white' />
                      </div>
                    </div>
                    {/* Hover overlay */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-1.5'>
                      <Button
                        size='icon'
                        variant='secondary'
                        className='h-8 w-8 rounded-full backdrop-blur-sm'
                        onClick={() => setPreviewMedia(item)}
                      >
                        <MdFullscreen className='h-4 w-4' />
                      </Button>
                      {!disabled && (
                        <Button
                          size='icon'
                          variant='destructive'
                          className='h-8 w-8 rounded-full'
                          onClick={() => handleDelete(item.id)}
                        >
                          <MdDelete className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {media.length === 0 && disabled && (
        <div className='flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-secondary/30 ring-1 ring-border/50'>
          <div className='h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-4'>
            <MdImage className='h-7 w-7 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium text-muted-foreground'>No media uploaded yet</p>
        </div>
      )}

      {/* Fullscreen Preview Dialog */}
      <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
        <DialogContent className='max-w-[95vw] max-h-[95vh] p-0 overflow-hidden rounded-3xl border-0 bg-black/95' showCloseButton={false}>
          {previewMedia && (
            <div className='relative w-full h-full flex items-center justify-center'>
              {previewMedia.type === 'image' ? (
                <img
                  src={previewMedia.url}
                  alt='Preview'
                  className='max-w-full max-h-[85vh] object-contain'
                />
              ) : (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className='max-w-full max-h-[85vh]'
                />
              )}
              {/* Close button */}
              <div className='absolute top-4 right-4'>
                <Button
                  variant='secondary'
                  size='icon'
                  className='h-10 w-10 rounded-full backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white hover:text-white'
                  onClick={() => setPreviewMedia(null)}
                >
                  <MdClose className='h-5 w-5' />
                </Button>
              </div>
              {/* Info footer */}
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2'>
                <div className='inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm'>
                  <Badge variant='secondary' className='capitalize rounded-full bg-white/20 text-white border-0'>
                    {previewMedia.type}
                  </Badge>
                  <span className='text-sm text-white/80'>
                    {previewMedia.uploadedBy}
                  </span>
                  <span className='text-sm text-white/60 tabular-nums'>
                    {format(new Date(previewMedia.uploadedAt), 'MMM dd, HH:mm')}
                  </span>
                </div>
              </div>
              {/* Note header */}
              {previewMedia.note && (
                <div className='absolute top-4 left-4 right-16'>
                  <span className='inline-block px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm text-sm text-white max-w-full'>
                    {previewMedia.note}
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
