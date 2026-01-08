'use client'

import { useState, useRef, FormEvent } from 'react'
import { MdDescription, MdUpload, MdClose, MdCheck, MdRadioButtonUnchecked, MdSync } from 'react-icons/md'
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
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { type Purchase, type Document } from '../../data/won-auctions'
import { type DocumentChecklist } from '../../types/workflow'

// Required document types that sync with workflow checklist
const REQUIRED_DOCUMENT_TYPES: { key: Document['type']; label: string; checklistKey: keyof DocumentChecklist }[] = [
  { key: 'invoice', label: 'Invoice', checklistKey: 'invoice' },
  { key: 'export_certificate', label: 'Export Certificate', checklistKey: 'exportCertificate' },
  { key: 'bill_of_lading', label: 'Bill of Lading', checklistKey: 'billOfLading' },
  { key: 'insurance', label: 'Insurance Certificate', checklistKey: 'insurance' },
  { key: 'inspection', label: 'Inspection Report', checklistKey: 'inspectionReport' },
]

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auction: Purchase | null
  onUpload: (auctionId: string, documents: Document[], checklistKey?: keyof DocumentChecklist) => void
  documentChecklist?: DocumentChecklist
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  auction,
  onUpload,
  documentChecklist,
}: DocumentUploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [documentType, setDocumentType] = useState<Document['type'] | 'custom'>('invoice')
  const [customTypeName, setCustomTypeName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!auction || uploadedFiles.length === 0 || isSubmitting) return

    setIsSubmitting(true)

    const finalType: Document['type'] = documentType === 'custom' ? 'other' : documentType

    const newDocuments: Document[] = uploadedFiles.map((file) => ({
      id: String(Date.now() + Math.random()),
      name: documentType === 'custom' && customTypeName ? `${customTypeName} - ${file.name}` : file.name,
      type: finalType,
      uploadedAt: new Date(),
      uploadedBy: 'Current Admin',
      size: file.size,
      url: URL.createObjectURL(file),
    }))

    // Find the checklist key if it's a required document type
    const checklistKey = REQUIRED_DOCUMENT_TYPES.find(d => d.key === finalType)?.checklistKey

    try {
      onUpload(auction.id, newDocuments, checklistKey)

      toast.success('Documents uploaded successfully', {
        description: `${uploadedFiles.length} file(s) uploaded as ${documentType === 'custom' ? customTypeName || 'Other' : REQUIRED_DOCUMENT_TYPES.find(d => d.key === documentType)?.label || 'Other'}`,
      })

      setUploadedFiles([])
      setDocumentType('invoice')
      setCustomTypeName('')
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if a document type is already uploaded
  const isDocumentUploaded = (checklistKey: keyof DocumentChecklist) => {
    if (!documentChecklist) return false
    return documentChecklist[checklistKey]?.received === true
  }

  // Check if document exists in auction documents
  const hasDocument = (type: Document['type']) => {
    if (!auction) return false
    return auction.documents.some(d => d.type === type)
  }

  if (!auction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Select document type for {auction.vehicleInfo.year} {auction.vehicleInfo.make}{' '}
            {auction.vehicleInfo.model}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpload} className='space-y-4'>
          {/* Document Type Selection */}
          <div className='space-y-2'>
            <Label>What type of document is this?</Label>
            <RadioGroup
              value={documentType}
              onValueChange={(value) => setDocumentType(value as Document['type'] | 'custom')}
              className='space-y-2'
            >
              {/* Required Documents - Show pending/uploaded status */}
              {REQUIRED_DOCUMENT_TYPES.map((docType) => {
                const isUploaded = isDocumentUploaded(docType.checklistKey) || hasDocument(docType.key)
                return (
                  <label
                    key={docType.key}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                      documentType === docType.key
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50',
                      isUploaded && 'bg-emerald-50 dark:bg-emerald-900/20'
                    )}
                  >
                    <RadioGroupItem value={docType.key} className='sr-only' />
                    <div className='flex items-center gap-3 flex-1'>
                      {isUploaded ? (
                        <div className='h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0'>
                          <MdCheck className='h-3 w-3 text-white' />
                        </div>
                      ) : (
                        <MdRadioButtonUnchecked className='h-5 w-5 text-muted-foreground/40 shrink-0' />
                      )}
                      <span className={cn(
                        'text-sm font-medium',
                        isUploaded ? 'text-emerald-700 dark:text-emerald-400' : ''
                      )}>
                        {docType.label}
                      </span>
                    </div>
                    {isUploaded ? (
                      <Badge variant='secondary' className='text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400'>
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge variant='outline' className='text-xs text-amber-600 border-amber-300'>
                        Required
                      </Badge>
                    )}
                  </label>
                )
              })}

              {/* Other Option */}
              <label
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  documentType === 'custom'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <RadioGroupItem value='custom' className='sr-only' />
                <div className='flex items-center gap-3 flex-1'>
                  <MdDescription className='h-5 w-5 text-muted-foreground shrink-0' />
                  <span className='text-sm font-medium'>Other Document</span>
                </div>
                <Badge variant='outline' className='text-xs'>
                  Optional
                </Badge>
              </label>
            </RadioGroup>

            {/* Custom type name input */}
            {documentType === 'custom' && (
              <Input
                placeholder='Enter document name (e.g., Customs Declaration)'
                value={customTypeName}
                onChange={(e) => setCustomTypeName(e.target.value)}
                className='mt-2'
              />
            )}
          </div>

          {/* File Upload Area */}
          <div
            className='cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50'
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
            <MdUpload className='mx-auto mb-2 h-8 w-8 text-muted-foreground' />
            <p className='text-sm text-muted-foreground'>
              Click to select files or drag & drop
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              PDF, DOC, DOCX, PNG, JPG up to 10MB
            </p>
          </div>

          {/* Selected Files */}
          {uploadedFiles.length > 0 && (
            <div className='space-y-2'>
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between rounded-lg bg-muted p-2'
                >
                  <div className='flex items-center gap-2'>
                    <MdDescription className='h-4 w-4' />
                    <span className='text-sm truncate max-w-[200px]'>{file.name}</span>
                    <span className='text-xs text-muted-foreground'>
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon-xs'
                    onClick={() =>
                      setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
                    }
                  >
                    <MdClose className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type='button' variant='outline' size='sm' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type='submit' size='sm' disabled={uploadedFiles.length === 0 || isSubmitting}>
              {isSubmitting ? (
                <>
                  <MdSync className='mr-2 h-4 w-4 animate-spin' />
                  Uploading...
                </>
              ) : (
                <>
                  <MdUpload className='mr-2 h-4 w-4' />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
