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
    <div className='space-y-4'>
      {/* Upload Zone */}
      {!disabled && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <div className='flex flex-col items-center gap-2'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
              <MdUpload className='h-6 w-6 text-muted-foreground' />
            </div>
            <div>
              <p className='font-medium'>
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className='text-sm text-muted-foreground'>
                or click to browse • Images & Videos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {media.length > 0 && (
        <div className='space-y-3'>
          {/* Images */}
          {images.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <MdImage className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Images ({images.length})</span>
              </div>
              <div className='grid grid-cols-4 gap-2'>
                {images.map((item) => (
                  <div
                    key={item.id}
                    className='group relative aspect-square rounded-lg overflow-hidden border bg-muted'
                  >
                    <img
                      src={item.url}
                      alt='Inspection'
                      className='w-full h-full object-cover'
                    />
                    {/* Overlay */}
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100'>
                      <Button
                        size='icon'
                        variant='secondary'
                        className='h-7 w-7'
                        onClick={() => setPreviewMedia(item)}
                      >
                        <MdFullscreen className='h-3.5 w-3.5' />
                      </Button>
                      {!disabled && (
                        <Button
                          size='icon'
                          variant='destructive'
                          className='h-7 w-7'
                          onClick={() => handleDelete(item.id)}
                        >
                          <MdDelete className='h-3.5 w-3.5' />
                        </Button>
                      )}
                    </div>
                    {/* Note indicator */}
                    {item.note && (
                      <div className='absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5'>
                        <p className='text-[10px] text-white truncate'>{item.note}</p>
                      </div>
                    )}
                  </div>
                ))}
                {!disabled && (
                  <div
                    {...getRootProps()}
                    className='aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors'
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
              <div className='flex items-center gap-2 mb-2'>
                <MdVideocam className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Videos ({videos.length})</span>
              </div>
              <div className='grid grid-cols-3 gap-2'>
                {videos.map((item) => (
                  <div
                    key={item.id}
                    className='group relative aspect-video rounded-lg overflow-hidden border bg-muted'
                  >
                    <video
                      src={item.url}
                      className='w-full h-full object-cover'
                    />
                    {/* Play overlay */}
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='h-10 w-10 rounded-full bg-black/60 flex items-center justify-center'>
                        <MdPlayArrow className='h-5 w-5 text-white fill-white' />
                      </div>
                    </div>
                    {/* Hover overlay */}
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100'>
                      <Button
                        size='icon'
                        variant='secondary'
                        className='h-7 w-7'
                        onClick={() => setPreviewMedia(item)}
                      >
                        <MdFullscreen className='h-3.5 w-3.5' />
                      </Button>
                      {!disabled && (
                        <Button
                          size='icon'
                          variant='destructive'
                          className='h-7 w-7'
                          onClick={() => handleDelete(item.id)}
                        >
                          <MdDelete className='h-3.5 w-3.5' />
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
        <div className='flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20'>
          <MdImage className='h-8 w-8 text-muted-foreground mb-2' />
          <p className='text-sm text-muted-foreground'>No media uploaded yet</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
        <DialogContent className='max-w-4xl p-0 overflow-hidden'>
          {previewMedia && (
            <div className='relative'>
              {previewMedia.type === 'image' ? (
                <img
                  src={previewMedia.url}
                  alt='Preview'
                  className='w-full h-auto max-h-[80vh] object-contain bg-black'
                />
              ) : (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className='w-full h-auto max-h-[80vh] bg-black'
                />
              )}
              {/* Info bar */}
              <div className='absolute bottom-0 left-0 right-0 bg-black/80 p-3 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Badge variant='secondary' className='capitalize'>
                    {previewMedia.type}
                  </Badge>
                  <span className='text-sm text-white/80'>
                    Uploaded by {previewMedia.uploadedBy}
                  </span>
                  <span className='text-sm text-white/60'>
                    {format(new Date(previewMedia.uploadedAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                <Button
                  size='sm'
                  variant='ghost'
                  className='text-white hover:text-white hover:bg-white/20'
                  onClick={() => setPreviewMedia(null)}
                >
                  <MdClose className='h-4 w-4' />
                </Button>
              </div>
              {/* Note */}
              {previewMedia.note && (
                <div className='absolute top-0 left-0 right-0 bg-black/80 p-3'>
                  <p className='text-sm text-white'>{previewMedia.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
