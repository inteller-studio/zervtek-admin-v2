'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  MdDownload,
  MdVisibility,
  MdDescription,
  MdDelete,
  MdUpload,
  MdCloudDownload,
  MdClose,
  MdChecklist,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { AnimatedTabs, AnimatedTabsContent, type TabItem } from '@/components/ui/animated-tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { type Purchase, type Document } from '../../data/won-auctions'
import { DocumentChecklist } from '../document-checklist'
import { DOCUMENT_TYPE_LABELS } from '../../types'

interface DocumentManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auction: Purchase | null
  onUpload?: (auctionId: string, files: File[], type: Document['type']) => void
  onDelete?: (auctionId: string, documentId: string) => void
}

export function DocumentManagementDialog({
  open,
  onOpenChange,
  auction,
  onUpload,
  onDelete,
}: DocumentManagementDialogProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null)
  const [uploadType, setUploadType] = useState<Document['type']>('invoice')
  const [activeTab, setActiveTab] = useState('all')

  if (!auction) return null

  const handleBatchDownload = () => {
    if (selectedDocs.length === 0) {
      toast.error('Please select documents to download')
      return
    }
    toast.success(`Downloading ${selectedDocs.length} documents...`)
    setSelectedDocs([])
  }

  const handleDelete = (docId: string) => {
    if (onDelete) {
      onDelete(auction.id, docId)
    }
    toast.success('Document deleted successfully')
    setDeleteDocId(null)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && onUpload) {
      onUpload(auction.id, Array.from(files), uploadType)
      toast.success(`${files.length} file(s) uploaded successfully`)
    }
    e.target.value = ''
  }

  const groupedDocuments = auction.documents.reduce(
    (acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = []
      acc[doc.type].push(doc)
      return acc
    },
    {} as Record<string, Document[]>
  )

  const toggleSelectAll = () => {
    if (selectedDocs.length === auction.documents.length) {
      setSelectedDocs([])
    } else {
      setSelectedDocs(auction.documents.map((d) => d.id))
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[90vh] max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Document Management</DialogTitle>
            <DialogDescription>
              Manage documents for {auction.vehicleInfo.year} {auction.vehicleInfo.make}{' '}
              {auction.vehicleInfo.model} - {auction.auctionId}
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const docTabs: TabItem[] = [
              { id: 'all', label: 'All Documents', icon: MdDescription, badge: auction.documents.length > 0 ? auction.documents.length : undefined },
              { id: 'required', label: 'Required Checklist', icon: MdChecklist },
              { id: 'upload', label: 'Upload New', icon: MdUpload },
            ]

            return (
              <AnimatedTabs
                tabs={docTabs}
                value={activeTab}
                onValueChange={setActiveTab}
                variant='compact'
              >
                {/* All Documents Tab */}
                <AnimatedTabsContent value='all' className='space-y-4 pt-4'>
              {/* Batch Actions */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    checked={
                      selectedDocs.length === auction.documents.length &&
                      auction.documents.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    disabled={auction.documents.length === 0}
                  />
                  <span className='text-sm text-muted-foreground'>
                    {selectedDocs.length > 0
                      ? `${selectedDocs.length} selected`
                      : 'Select all'}
                  </span>
                </div>
                {selectedDocs.length > 0 && (
                  <Button size='sm' onClick={handleBatchDownload}>
                    <MdCloudDownload className='mr-2 h-4 w-4' />
                    Download Selected
                  </Button>
                )}
              </div>

              <ScrollArea className='h-[400px]'>
                {Object.entries(groupedDocuments).length > 0 ? (
                  Object.entries(groupedDocuments).map(([type, docs]) => (
                    <div key={type} className='mb-4'>
                      <h4 className='mb-2 text-sm font-medium'>
                        {DOCUMENT_TYPE_LABELS[type as Document['type']] || type}
                      </h4>
                      <div className='space-y-2'>
                        {docs.map((doc) => (
                          <div
                            key={doc.id}
                            className='flex items-center justify-between rounded-lg border p-3'
                          >
                            <div className='flex items-center gap-3'>
                              <Checkbox
                                checked={selectedDocs.includes(doc.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedDocs(
                                    checked
                                      ? [...selectedDocs, doc.id]
                                      : selectedDocs.filter((id) => id !== doc.id)
                                  )
                                }}
                              />
                              <MdDescription className='h-5 w-5 text-muted-foreground' />
                              <div>
                                <p className='text-sm font-medium'>{doc.name}</p>
                                <p className='text-xs text-muted-foreground'>
                                  {(doc.size / 1024).toFixed(1)} KB - Uploaded{' '}
                                  {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')} by{' '}
                                  {doc.uploadedBy}
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => {
                                  toast.info(`Opening preview for ${doc.name}`)
                                }}
                              >
                                <MdVisibility className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => {
                                  toast.success(`Downloading ${doc.name}...`)
                                }}
                              >
                                <MdDownload className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 text-destructive hover:text-destructive'
                                onClick={() => setDeleteDocId(doc.id)}
                              >
                                <MdDelete className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                    <MdDescription className='mb-4 h-12 w-12' />
                    <p>No documents uploaded yet</p>
                    <p className='text-sm'>Switch to the Upload tab to add documents</p>
                  </div>
                )}
              </ScrollArea>
            </AnimatedTabsContent>

            {/* Required Checklist Tab */}
            <AnimatedTabsContent value='required' className='pt-4'>
              <div className='p-4'>
                <DocumentChecklist auction={auction} />
              </div>
            </AnimatedTabsContent>

            {/* Upload Tab */}
            <AnimatedTabsContent value='upload' className='space-y-4 pt-4'>
              <div className='space-y-4 p-4'>
                <div className='space-y-2'>
                  <Label>Document Type</Label>
                  <Select
                    value={uploadType}
                    onValueChange={(v) => setUploadType(v as Document['type'])}
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

                <div className='space-y-2'>
                  <Label>Upload File</Label>
                  <div className='flex items-center gap-4'>
                    <Input
                      type='file'
                      accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                      multiple
                      onChange={handleUpload}
                      className='flex-1'
                    />
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max file size: 10MB
                  </p>
                </div>

                <div className='rounded-lg border-2 border-dashed p-8 text-center'>
                  <MdUpload className='mx-auto mb-4 h-8 w-8 text-muted-foreground' />
                  <p className='text-sm text-muted-foreground'>
                    Drag and drop files here or use the file input above
                  </p>
                </div>
              </div>
              </AnimatedTabsContent>
            </AnimatedTabs>
            )
          })()}

          <DialogFooter>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDocId} onOpenChange={() => setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => deleteDocId && handleDelete(deleteDocId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
