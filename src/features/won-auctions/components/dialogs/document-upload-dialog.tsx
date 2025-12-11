'use client'

import { useState, useRef } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { type WonAuction, type Document } from '../../data/won-auctions'
import { DOCUMENT_TYPE_LABELS } from '../../types'

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auction: WonAuction | null
  onUpload: (auctionId: string, documents: Document[]) => void
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  auction,
  onUpload,
}: DocumentUploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [documentType, setDocumentType] = useState<Document['type']>('other')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = () => {
    if (!auction || uploadedFiles.length === 0) return

    const newDocuments: Document[] = uploadedFiles.map((file) => ({
      id: String(Date.now() + Math.random()),
      name: file.name,
      type: documentType,
      uploadedAt: new Date(),
      uploadedBy: 'Current Admin',
      size: file.size,
      url: URL.createObjectURL(file),
    }))

    onUpload(auction.id, newDocuments)

    toast.success('Documents uploaded successfully', {
      description: `${uploadedFiles.length} file(s) uploaded`,
    })

    setUploadedFiles([])
    setDocumentType('other')
    onOpenChange(false)
  }

  if (!auction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload documents for {auction.vehicleInfo.year} {auction.vehicleInfo.make}{' '}
            {auction.vehicleInfo.model}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Document Type</Label>
            <Select
              value={documentType}
              onValueChange={(value) => setDocumentType(value as Document['type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className='cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50'
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept='.pdf,.doc,.docx,.png,.jpg,.jpeg'
              onChange={handleFileSelect}
              className='hidden'
            />
            <Upload className='mx-auto mb-2 h-8 w-8 text-muted-foreground' />
            <p className='text-sm text-muted-foreground'>
              Click to select files or drag & drop
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              PDF, DOC, DOCX, PNG, JPG up to 10MB
            </p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className='space-y-2'>
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between rounded-lg bg-muted p-2'
                >
                  <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm'>{file.name}</span>
                    <span className='text-xs text-muted-foreground'>
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
                    }
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploadedFiles.length === 0}>
            <Upload className='mr-2 h-4 w-4' />
            Upload Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
