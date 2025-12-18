'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, X, Image as ImageIcon, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  file: File
  preview?: string
}

interface WorkflowFileUploadProps {
  onFilesSelected: (files: UploadedFile[]) => void
  accept?: string
  maxFiles?: number
  maxSize?: number // in bytes
  label?: string
  description?: string
  showPreview?: boolean
  className?: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon
  if (type.includes('pdf')) return FileText
  return File
}

export function WorkflowFileUpload({
  onFilesSelected,
  accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg',
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  label = 'Upload Files',
  description = 'Drag and drop or click to browse',
  showPreview = true,
  className,
}: WorkflowFileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFiles = useCallback(
    (fileList: FileList) => {
      setError(null)
      const newFiles: UploadedFile[] = []

      Array.from(fileList).forEach((file) => {
        // Check max files
        if (files.length + newFiles.length >= maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`)
          return
        }

        // Check file size
        if (file.size > maxSize) {
          setError(`File "${file.name}" exceeds ${formatFileSize(maxSize)} limit`)
          return
        }

        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          file,
        }

        // Create preview for images
        if (file.type.startsWith('image/')) {
          uploadedFile.preview = URL.createObjectURL(file)
        }

        newFiles.push(uploadedFile)
      })

      if (newFiles.length > 0) {
        const updatedFiles = [...files, ...newFiles]
        setFiles(updatedFiles)
        onFilesSelected(updatedFiles)
      }
    },
    [files, maxFiles, maxSize, onFilesSelected]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files)
      }
    },
    [processFiles]
  )

  const removeFile = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      const updatedFiles = files.filter((f) => f.id !== fileId)
      setFiles(updatedFiles)
      onFilesSelected(updatedFiles)
    },
    [files, onFilesSelected]
  )

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          'cursor-pointer'
        )}
      >
        <input
          type='file'
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
        />
        <div className='flex flex-col items-center justify-center py-6 px-4'>
          <div className='h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3'>
            <Upload className='h-5 w-5 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium'>{label}</p>
          <p className='text-xs text-muted-foreground mt-1'>{description}</p>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Max {formatFileSize(maxSize)} per file • {maxFiles} files max
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className='text-xs text-destructive'>{error}</p>
      )}

      {/* File List */}
      {showPreview && files.length > 0 && (
        <div className='space-y-2'>
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type)
            return (
              <div
                key={file.id}
                className='flex items-center gap-3 p-2 rounded-md border bg-muted/30'
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className='h-10 w-10 rounded object-cover'
                  />
                ) : (
                  <div className='h-10 w-10 rounded bg-muted flex items-center justify-center'>
                    <FileIcon className='h-5 w-5 text-muted-foreground' />
                  </div>
                )}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>{file.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-muted-foreground hover:text-destructive'
                  onClick={() => removeFile(file.id)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
