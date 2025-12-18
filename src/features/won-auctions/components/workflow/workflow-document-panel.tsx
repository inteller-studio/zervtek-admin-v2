'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Check,
  Circle,
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { type WonAuction, type Document } from '../../data/won-auctions'
import { type PurchaseWorkflow, DOCUMENT_TYPES } from '../../types/workflow'
import { WorkflowFileUpload } from './shared/workflow-file-upload'

interface WorkflowDocumentPanelProps {
  auction: WonAuction
  workflow: PurchaseWorkflow
  onDocumentUpload: (documents: Document[]) => void
  onDocumentDelete?: (documentId: string) => void
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function WorkflowDocumentPanel({
  auction,
  workflow,
  onDocumentUpload,
  onDocumentDelete,
}: WorkflowDocumentPanelProps) {
  const [uploadOpen, setUploadOpen] = useState(true)
  const [documentsOpen, setDocumentsOpen] = useState(true)

  // Group documents by type
  const documentsByType = auction.documents.reduce<Record<string, Document[]>>(
    (acc, doc) => {
      const type = doc.type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(doc)
      return acc
    },
    {}
  )

  // Check which documents are present
  const hasDocument = (type: string) => {
    return auction.documents.some((d) => d.type === type)
  }

  // Calculate checklist progress
  const requiredDocs = DOCUMENT_TYPES.slice(0, 5) // First 5 are commonly required
  const completedDocs = requiredDocs.filter((doc) => hasDocument(doc.key))

  const handleFilesSelected = (files: { id: string; name: string; size: number; type: string; file: File }[]) => {
    const newDocs: Document[] = files.map((f) => ({
      id: f.id,
      name: f.name,
      type: 'other' as const,
      uploadedAt: new Date(),
      uploadedBy: 'Current User',
      size: f.size,
      url: URL.createObjectURL(f.file),
    }))
    onDocumentUpload(newDocs)
  }

  return (
    <div className='h-full flex flex-col bg-muted/30'>
      {/* Header */}
      <div className='p-4 border-b bg-background'>
        <h3 className='font-semibold text-sm'>Documents</h3>
        <p className='text-xs text-muted-foreground mt-0.5'>
          {completedDocs.length}/{requiredDocs.length} required documents uploaded
        </p>
      </div>

      <ScrollArea className='flex-1'>
        <div className='p-4 space-y-4'>
          {/* Document Checklist */}
          <div className='rounded-lg border bg-background p-3'>
            <h4 className='text-sm font-medium mb-3'>Required Documents</h4>
            <div className='space-y-2'>
              {DOCUMENT_TYPES.map((docType) => {
                const isPresent = hasDocument(docType.key)
                const docs = documentsByType[docType.key] || []

                return (
                  <div
                    key={docType.key}
                    className={cn(
                      'flex items-center gap-2 py-1.5 px-2 rounded-md',
                      isPresent ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                    )}
                  >
                    {isPresent ? (
                      <div className='h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center'>
                        <Check className='h-3 w-3 text-white' />
                      </div>
                    ) : (
                      <Circle className='h-5 w-5 text-muted-foreground/40' />
                    )}
                    <span
                      className={cn(
                        'text-sm flex-1',
                        isPresent
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      )}
                    >
                      {docType.label}
                    </span>
                    {isPresent && docs.length > 0 && (
                      <Badge variant='secondary' className='text-xs'>
                        {docs.length}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload Section */}
          <Collapsible open={uploadOpen} onOpenChange={setUploadOpen}>
            <div className='rounded-lg border bg-background'>
              <CollapsibleTrigger asChild>
                <button className='flex items-center justify-between w-full p-3 text-left'>
                  <div className='flex items-center gap-2'>
                    <Upload className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>Upload Documents</span>
                  </div>
                  {uploadOpen ? (
                    <ChevronUp className='h-4 w-4 text-muted-foreground' />
                  ) : (
                    <ChevronDown className='h-4 w-4 text-muted-foreground' />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='px-3 pb-3'>
                  <WorkflowFileUpload
                    onFilesSelected={handleFilesSelected}
                    accept='.pdf,.doc,.docx,.png,.jpg,.jpeg'
                    maxFiles={10}
                    maxSize={10 * 1024 * 1024}
                    label='Drop files here'
                    description='PDF, DOC, PNG, JPG up to 10MB'
                    showPreview={false}
                  />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Uploaded Documents */}
          <Collapsible open={documentsOpen} onOpenChange={setDocumentsOpen}>
            <div className='rounded-lg border bg-background'>
              <CollapsibleTrigger asChild>
                <button className='flex items-center justify-between w-full p-3 text-left'>
                  <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>
                      Uploaded ({auction.documents.length})
                    </span>
                  </div>
                  {documentsOpen ? (
                    <ChevronUp className='h-4 w-4 text-muted-foreground' />
                  ) : (
                    <ChevronDown className='h-4 w-4 text-muted-foreground' />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='px-3 pb-3'>
                  {auction.documents.length === 0 ? (
                    <p className='text-xs text-muted-foreground text-center py-4'>
                      No documents uploaded yet
                    </p>
                  ) : (
                    <div className='space-y-2'>
                      {auction.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className='flex items-center gap-2 p-2 rounded-md bg-muted/50 group'
                        >
                          <FileText className='h-4 w-4 text-muted-foreground shrink-0' />
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium truncate'>
                              {doc.name}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {formatFileSize(doc.size)} •{' '}
                              {format(new Date(doc.uploadedAt), 'MMM d')}
                            </p>
                          </div>
                          <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => window.open(doc.url, '_blank')}
                            >
                              <Eye className='h-3.5 w-3.5' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                            >
                              <Download className='h-3.5 w-3.5' />
                            </Button>
                            {onDocumentDelete && (
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-7 w-7 text-destructive hover:text-destructive'
                                onClick={() => onDocumentDelete(doc.id)}
                              >
                                <Trash2 className='h-3.5 w-3.5' />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  )
}
