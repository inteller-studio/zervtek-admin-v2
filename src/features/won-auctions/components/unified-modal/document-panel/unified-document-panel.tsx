'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { format } from 'date-fns'
import {
  MdCheck,
  MdRadioButtonUnchecked,
  MdDescription,
  MdUpload,
  MdDownload,
  MdDelete,
  MdVisibility,
  MdExpandMore,
  MdExpandLess,
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdReceipt,
  MdVerified,
  MdLocalShipping,
  MdSecurity,
  MdFactCheck,
  MdBadge,
  MdConfirmationNumber,
  MdMoreHoriz,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { type Purchase, type Document } from '../../../data/won-auctions'
import { type PurchaseWorkflow, DOCUMENT_TYPES, COST_TYPES } from '../../../types/workflow'
import { WorkflowFileUpload } from '../../workflow/shared/workflow-file-upload'

interface UnifiedDocumentPanelProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  isCollapsed: boolean
  onToggleCollapse: () => void
  onDocumentUpload: (documents: Document[], checklistKey?: string) => void
  onDocumentDelete?: (documentId: string) => void
}

// Map document types to workflow checklist keys
const DOC_TYPE_TO_CHECKLIST_KEY: Record<string, string> = {
  invoice: 'invoice',
  export_certificate: 'exportCertificate',
  bill_of_lading: 'billOfLading',
  insurance: 'insurance',
  inspection: 'inspectionReport',
  deregistration: 'deregistrationCertificate',
  number_plates: 'numberPlates',
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Document type configuration with icons and colors
const DOCUMENT_TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof MdReceipt; color: string; bgColor: string }
> = {
  invoice: {
    label: 'Invoices',
    icon: MdReceipt,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  export_certificate: {
    label: 'Export Certificates',
    icon: MdVerified,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  bill_of_lading: {
    label: 'Bill of Lading',
    icon: MdLocalShipping,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  insurance: {
    label: 'Insurance',
    icon: MdSecurity,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  inspection: {
    label: 'Inspection Reports',
    icon: MdFactCheck,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  deregistration: {
    label: 'Deregistration',
    icon: MdBadge,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
  },
  number_plates: {
    label: 'Number Plates',
    icon: MdConfirmationNumber,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  other: {
    label: 'Other Documents',
    icon: MdMoreHoriz,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
  },
}

export function UnifiedDocumentPanel({
  auction,
  workflow,
  isCollapsed,
  onToggleCollapse,
  onDocumentUpload,
  onDocumentDelete,
}: UnifiedDocumentPanelProps) {
  const [uploadOpen, setUploadOpen] = useState(true)
  const [highlightedGroup, setHighlightedGroup] = useState<string | null>(null)
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Pending files waiting for type selection
  const [pendingFiles, setPendingFiles] = useState<{ id: string; name: string; size: number; type: string; file: File }[]>([])
  const [selectedDocType, setSelectedDocType] = useState<string>('invoice')
  const [showTypeSelection, setShowTypeSelection] = useState(false)

  // Get all document types that have documents - initialize as expanded
  const documentTypes = useMemo(() => {
    const types = new Set<string>()
    auction.documents.forEach(doc => types.add(doc.type || 'other'))
    return types
  }, [auction.documents])

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(documentTypes))

  // Handle clicking on a required document to scroll to and highlight its group
  const handleDocumentTypeClick = useCallback((docTypeKey: string) => {
    // Expand the group
    setExpandedGroups(prev => new Set([...prev, docTypeKey]))

    // Highlight temporarily
    setHighlightedGroup(docTypeKey)
    setTimeout(() => setHighlightedGroup(null), 2000)

    // Scroll to the group
    const groupElement = groupRefs.current[docTypeKey]
    if (groupElement) {
      groupElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  // Combine auction documents with workflow invoice attachments
  const workflowInvoices: Document[] = (workflow.stages.afterPurchase?.invoiceAttachments || []).map(inv => ({
    id: inv.id,
    name: inv.name,
    type: 'invoice' as const,
    uploadedAt: new Date(inv.uploadedAt),
    uploadedBy: inv.uploadedBy,
    size: inv.size,
    url: inv.url,
  }))

  // Get cost invoice attachments with cost type info
  const costInvoiceAttachments: (Document & { costType?: string })[] = (workflow.stages.afterPurchase?.costInvoices || [])
    .filter(cost => cost.attachment)
    .map(cost => ({
      id: cost.attachment!.id,
      name: cost.attachment!.name,
      type: 'invoice' as const,
      uploadedAt: new Date(cost.attachment!.uploadedAt),
      uploadedBy: cost.attachment!.uploadedBy,
      size: cost.attachment!.size,
      url: cost.attachment!.url,
      costType: cost.costType,
    }))

  const allDocuments = [...auction.documents, ...workflowInvoices, ...costInvoiceAttachments]

  // Group documents by type
  const documentsByType = allDocuments.reduce<Record<string, Document[]>>(
    (acc, doc) => {
      const type = doc.type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(doc)
      return acc
    },
    {}
  )

  // Define the order for document types (required docs first, then others)
  const DOCUMENT_TYPE_ORDER = [
    'invoice',
    'export_certificate',
    'bill_of_lading',
    'insurance',
    'inspection',
    'deregistration',
    'number_plates',
    'other',
  ]

  // Get sorted document type entries
  const sortedDocumentEntries = useMemo(() => {
    const entries = Object.entries(documentsByType)
    return entries.sort(([typeA], [typeB]) => {
      const indexA = DOCUMENT_TYPE_ORDER.indexOf(typeA)
      const indexB = DOCUMENT_TYPE_ORDER.indexOf(typeB)
      // If type not in order list, put it at the end
      const orderA = indexA === -1 ? DOCUMENT_TYPE_ORDER.length : indexA
      const orderB = indexB === -1 ? DOCUMENT_TYPE_ORDER.length : indexB
      return orderA - orderB
    })
  }, [documentsByType])

  // Check which documents are present
  const hasDocument = (type: string) => {
    return allDocuments.some((d) => d.type === type)
  }

  // Calculate checklist progress
  const requiredDocs = DOCUMENT_TYPES.slice(0, 5) // First 5 are commonly required
  const completedDocs = requiredDocs.filter((doc) => hasDocument(doc.key))

  // When files are selected, show type selection
  const handleFilesSelected = (
    files: { id: string; name: string; size: number; type: string; file: File }[]
  ) => {
    if (files.length > 0) {
      setPendingFiles(files)
      setShowTypeSelection(true)
      // Pre-select first missing required document type
      const missingDocType = DOCUMENT_TYPES.find(dt => !hasDocument(dt.key))
      if (missingDocType) {
        setSelectedDocType(missingDocType.key)
      }
    }
  }

  // Confirm upload with selected type
  const handleConfirmUpload = useCallback(() => {
    if (pendingFiles.length === 0) return

    const newDocs: Document[] = pendingFiles.map((f) => ({
      id: f.id,
      name: f.name,
      type: selectedDocType as Document['type'],
      uploadedAt: new Date(),
      uploadedBy: 'Current User',
      size: f.size,
      url: URL.createObjectURL(f.file),
    }))

    // Get the workflow checklist key for this document type
    const checklistKey = DOC_TYPE_TO_CHECKLIST_KEY[selectedDocType]

    // Pass the document and checklistKey to auto-update the workflow
    onDocumentUpload(newDocs, checklistKey)

    // Expand and highlight the group the document was added to
    setExpandedGroups(prev => new Set([...prev, selectedDocType]))
    setHighlightedGroup(selectedDocType)
    setTimeout(() => setHighlightedGroup(null), 2000)

    // Reset state
    setPendingFiles([])
    setShowTypeSelection(false)
    setSelectedDocType('invoice')
  }, [pendingFiles, selectedDocType, onDocumentUpload])

  // Cancel upload
  const handleCancelUpload = useCallback(() => {
    setPendingFiles([])
    setShowTypeSelection(false)
    setSelectedDocType('invoice')
  }, [])

  // Collapsed state - show just a thin bar with toggle
  if (isCollapsed) {
    return (
      <div className='h-full flex flex-col items-center py-4 px-2 border-l bg-muted/30'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={onToggleCollapse}
              >
                <MdKeyboardDoubleArrowLeft className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='left'>
              <p>Show Documents</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Vertical text indicator */}
        <div className='mt-4 flex flex-col items-center gap-2'>
          <MdDescription className='h-4 w-4 text-muted-foreground' />
          <span
            className='text-xs text-muted-foreground'
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            Documents ({allDocuments.length})
          </span>
          {completedDocs.length === requiredDocs.length && (
            <div className='h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center'>
              <MdCheck className='h-3 w-3 text-white' />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='h-full flex flex-col bg-muted/30 border-l'>
      {/* Header */}
      <div className='p-4 border-b bg-background flex items-center justify-between'>
        <div>
          <h3 className='font-semibold text-sm'>Documents</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {completedDocs.length}/{requiredDocs.length} required
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={onToggleCollapse}
              >
                <MdKeyboardDoubleArrowRight className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='left'>
              <p>Hide Documents</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
                const config = DOCUMENT_TYPE_CONFIG[docType.key] || DOCUMENT_TYPE_CONFIG.other
                const Icon = config.icon

                return (
                  <button
                    key={docType.key}
                    onClick={() => isPresent && handleDocumentTypeClick(docType.key)}
                    disabled={!isPresent}
                    className={cn(
                      'w-full flex items-center gap-2 py-2 px-2.5 rounded-lg transition-all text-left',
                      isPresent
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 cursor-pointer'
                        : 'cursor-default opacity-60'
                    )}
                  >
                    {isPresent ? (
                      <div className='h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0'>
                        <MdCheck className='h-3 w-3 text-white' />
                      </div>
                    ) : (
                      <MdRadioButtonUnchecked className='h-5 w-5 text-muted-foreground/40 shrink-0' />
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
                      <Badge variant='secondary' className={cn('text-xs', config.bgColor, config.color)}>
                        {docs.length}
                      </Badge>
                    )}
                    {isPresent && (
                      <MdExpandMore className='h-4 w-4 text-muted-foreground' />
                    )}
                  </button>
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
                    <MdUpload className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>Upload Documents</span>
                  </div>
                  {uploadOpen ? (
                    <MdExpandLess className='h-4 w-4 text-muted-foreground' />
                  ) : (
                    <MdExpandMore className='h-4 w-4 text-muted-foreground' />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='px-3 pb-3'>
                  {showTypeSelection ? (
                    /* Document Type Selection */
                    <div className='space-y-4'>
                      <div className='p-3 rounded-lg bg-muted/50 border'>
                        <p className='text-sm font-medium mb-1'>Selected Files ({pendingFiles.length})</p>
                        <div className='space-y-1'>
                          {pendingFiles.map(f => (
                            <p key={f.id} className='text-xs text-muted-foreground truncate'>
                              {f.name} ({formatFileSize(f.size)})
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className='text-sm font-medium mb-2'>What type of document is this?</p>
                        <div className='space-y-1.5'>
                          {DOCUMENT_TYPES.map((docType) => {
                            const isPresent = hasDocument(docType.key)
                            const config = DOCUMENT_TYPE_CONFIG[docType.key] || DOCUMENT_TYPE_CONFIG.other
                            const Icon = config.icon
                            const isSelected = selectedDocType === docType.key

                            return (
                              <button
                                key={docType.key}
                                onClick={() => setSelectedDocType(docType.key)}
                                className={cn(
                                  'w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left',
                                  isSelected
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                )}
                              >
                                <div className={cn('h-7 w-7 rounded-md flex items-center justify-center', config.bgColor)}>
                                  <Icon className={cn('h-3.5 w-3.5', config.color)} />
                                </div>
                                <span className='text-sm font-medium flex-1'>{docType.label}</span>
                                {isPresent ? (
                                  <Badge variant='secondary' className='text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400'>
                                    Uploaded
                                  </Badge>
                                ) : (
                                  <Badge variant='outline' className='text-[10px] text-amber-600 border-amber-300'>
                                    Required
                                  </Badge>
                                )}
                              </button>
                            )
                          })}
                          {/* Other option */}
                          <button
                            onClick={() => setSelectedDocType('other')}
                            className={cn(
                              'w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left',
                              selectedDocType === 'other'
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            )}
                          >
                            <div className='h-7 w-7 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-900/30'>
                              <MdMoreHoriz className='h-3.5 w-3.5 text-gray-600 dark:text-gray-400' />
                            </div>
                            <span className='text-sm font-medium flex-1'>Other Document</span>
                            <Badge variant='outline' className='text-[10px]'>
                              Optional
                            </Badge>
                          </button>
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <Button variant='outline' size='sm' className='flex-1' onClick={handleCancelUpload}>
                          Cancel
                        </Button>
                        <Button size='sm' className='flex-1' onClick={handleConfirmUpload}>
                          <MdUpload className='h-4 w-4 mr-1.5' />
                          Upload as {DOCUMENT_TYPE_CONFIG[selectedDocType]?.label || 'Other'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <WorkflowFileUpload
                      onFilesSelected={handleFilesSelected}
                      accept='.pdf,.doc,.docx,.png,.jpg,.jpeg'
                      maxFiles={10}
                      maxSize={10 * 1024 * 1024}
                      label='Drop files here'
                      description='PDF, DOC, PNG, JPG up to 10MB'
                      showPreview={false}
                    />
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Uploaded Documents - Grouped by Type */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-medium flex items-center gap-2'>
                <MdDescription className='h-4 w-4 text-muted-foreground' />
                Uploaded Documents ({allDocuments.length})
              </h4>
            </div>

            {allDocuments.length === 0 ? (
              <div className='rounded-lg border bg-background p-6 text-center'>
                <MdDescription className='h-10 w-10 text-muted-foreground/30 mx-auto mb-2' />
                <p className='text-sm text-muted-foreground'>No documents uploaded yet</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {sortedDocumentEntries.map(([type, docs]) => {
                  const config = DOCUMENT_TYPE_CONFIG[type] || DOCUMENT_TYPE_CONFIG.other
                  const Icon = config.icon
                  const isHighlighted = highlightedGroup === type
                  const isExpanded = expandedGroups.has(type)

                  return (
                    <Collapsible
                      key={type}
                      open={isExpanded}
                      onOpenChange={(open) => {
                        setExpandedGroups(prev => {
                          const next = new Set(prev)
                          if (open) {
                            next.add(type)
                          } else {
                            next.delete(type)
                          }
                          return next
                        })
                      }}
                      defaultOpen
                    >
                      <div
                        ref={(el) => { groupRefs.current[type] = el }}
                        className={cn(
                          'rounded-lg border bg-background overflow-hidden transition-all duration-300',
                          isHighlighted && 'ring-2 ring-primary ring-offset-2 shadow-lg'
                        )}
                      >
                        <CollapsibleTrigger asChild>
                          <button className='flex items-center justify-between w-full p-3 text-left hover:bg-muted/50 transition-colors'>
                            <div className='flex items-center gap-3'>
                              <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', config.bgColor)}>
                                <Icon className={cn('h-4 w-4', config.color)} />
                              </div>
                              <div>
                                <span className='text-sm font-medium'>{config.label}</span>
                                <p className='text-xs text-muted-foreground'>{docs.length} file{docs.length !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge variant='secondary' className={cn('text-xs', config.bgColor, config.color)}>
                                {docs.length}
                              </Badge>
                              <MdExpandMore className='h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180' />
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className='px-3 pb-3 space-y-1.5'>
                            {docs.map((doc) => {
                              const isWorkflowInvoice = workflowInvoices.some(inv => inv.id === doc.id)
                              const costInvoice = costInvoiceAttachments.find(c => c.id === doc.id)
                              const isCostInvoice = !!costInvoice
                              const isWorkflowDoc = isWorkflowInvoice || isCostInvoice
                              const costTypeLabel = costInvoice ? COST_TYPES.find(t => t.value === costInvoice.costType)?.label : null

                              return (
                                <div
                                  key={doc.id}
                                  className='flex items-center gap-2 p-2 rounded-md bg-muted/50 group hover:bg-muted transition-colors'
                                >
                                  <MdDescription className={cn('h-4 w-4 shrink-0', config.color)} />
                                  <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-2'>
                                      <p className='text-sm font-medium truncate'>{doc.name}</p>
                                      {isWorkflowInvoice && (
                                        <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>
                                          Workflow
                                        </Badge>
                                      )}
                                      {isCostInvoice && costTypeLabel && (
                                        <Badge variant='outline' className='text-[10px] px-1.5 py-0'>
                                          {costTypeLabel}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className='text-xs text-muted-foreground'>
                                      {formatFileSize(doc.size)} • {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                                    </p>
                                  </div>
                                  <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='h-7 w-7'
                                      onClick={() => window.open(doc.url, '_blank')}
                                    >
                                      <MdVisibility className='h-3.5 w-3.5' />
                                    </Button>
                                    <Button variant='ghost' size='icon' className='h-7 w-7'>
                                      <MdDownload className='h-3.5 w-3.5' />
                                    </Button>
                                    {onDocumentDelete && !isWorkflowDoc && (
                                      <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-7 w-7 text-destructive hover:text-destructive'
                                        onClick={() => onDocumentDelete(doc.id)}
                                      >
                                        <MdDelete className='h-3.5 w-3.5' />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
