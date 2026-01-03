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
  MdClose,
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

// All document types including "other"
const ALL_DOCUMENT_TYPES = [...DOCUMENT_TYPES, { key: 'other', label: 'Other Documents', required: false }]

export function UnifiedDocumentPanel({
  auction,
  workflow,
  isCollapsed,
  onToggleCollapse,
  onDocumentUpload,
  onDocumentDelete,
}: UnifiedDocumentPanelProps) {
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
        <div className='p-4'>
          {/* Single Unified Documents Box */}
          <div className='rounded-lg border bg-background overflow-hidden'>
            {/* Upload Area at Top - Only show when in upload mode or type selection */}
            {showTypeSelection ? (
              <div className='p-4 border-b bg-muted/30'>
                <div className='flex items-center justify-between mb-3'>
                  <p className='text-sm font-medium'>Select document type</p>
                  <Button variant='ghost' size='icon' className='h-7 w-7' onClick={handleCancelUpload}>
                    <MdClose className='h-4 w-4' />
                  </Button>
                </div>
                <div className='p-3 rounded-lg bg-background border mb-3'>
                  <p className='text-xs text-muted-foreground mb-1'>Files to upload ({pendingFiles.length})</p>
                  <div className='space-y-0.5'>
                    {pendingFiles.slice(0, 3).map(f => (
                      <p key={f.id} className='text-sm truncate'>{f.name}</p>
                    ))}
                    {pendingFiles.length > 3 && (
                      <p className='text-xs text-muted-foreground'>+{pendingFiles.length - 3} more</p>
                    )}
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-2 mb-3'>
                  {ALL_DOCUMENT_TYPES.map((docType) => {
                    const config = DOCUMENT_TYPE_CONFIG[docType.key] || DOCUMENT_TYPE_CONFIG.other
                    const Icon = config.icon
                    const isSelected = selectedDocType === docType.key

                    return (
                      <button
                        key={docType.key}
                        onClick={() => setSelectedDocType(docType.key)}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg border transition-all text-left',
                          isSelected
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        )}
                      >
                        <div className={cn('h-6 w-6 rounded flex items-center justify-center', config.bgColor)}>
                          <Icon className={cn('h-3 w-3', config.color)} />
                        </div>
                        <span className='text-xs font-medium truncate'>{docType.label}</span>
                      </button>
                    )
                  })}
                </div>
                <Button size='sm' className='w-full' onClick={handleConfirmUpload}>
                  <MdUpload className='h-4 w-4 mr-1.5' />
                  Upload
                </Button>
              </div>
            ) : (
              <div className='p-3 border-b'>
                <WorkflowFileUpload
                  onFilesSelected={handleFilesSelected}
                  accept='.pdf,.doc,.docx,.png,.jpg,.jpeg'
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024}
                  label='Drop files to upload'
                  description='PDF, DOC, PNG, JPG'
                  showPreview={false}
                />
              </div>
            )}

            {/* Document Types List */}
            <div className='divide-y'>
              {ALL_DOCUMENT_TYPES.map((docType) => {
                const docs = documentsByType[docType.key] || []
                const isPresent = docs.length > 0
                const config = DOCUMENT_TYPE_CONFIG[docType.key] || DOCUMENT_TYPE_CONFIG.other
                const Icon = config.icon
                const isHighlighted = highlightedGroup === docType.key
                const isExpanded = expandedGroups.has(docType.key)
                const isRequired = docType.key !== 'other'

                return (
                  <div
                    key={docType.key}
                    ref={(el) => { groupRefs.current[docType.key] = el }}
                    className={cn(
                      'transition-all duration-300',
                      isHighlighted && 'bg-primary/5 ring-2 ring-primary ring-inset'
                    )}
                  >
                    {isPresent ? (
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={(open) => {
                          setExpandedGroups(prev => {
                            const next = new Set(prev)
                            if (open) {
                              next.add(docType.key)
                            } else {
                              next.delete(docType.key)
                            }
                            return next
                          })
                        }}
                      >
                        <CollapsibleTrigger asChild>
                          <button className='flex items-center gap-3 w-full p-3 text-left hover:bg-muted/50 transition-colors'>
                            <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', config.bgColor)}>
                              <Icon className={cn('h-4 w-4', config.color)} />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium'>{config.label}</p>
                              <p className='text-xs text-muted-foreground'>{docs.length} file{docs.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className='h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center'>
                              <MdCheck className='h-3 w-3 text-white' />
                            </div>
                            <MdExpandMore className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className='px-3 pb-3 space-y-1'>
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
                                      <p className='text-sm truncate'>{doc.name}</p>
                                      {isWorkflowInvoice && (
                                        <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>Workflow</Badge>
                                      )}
                                      {isCostInvoice && costTypeLabel && (
                                        <Badge variant='outline' className='text-[10px] px-1.5 py-0'>{costTypeLabel}</Badge>
                                      )}
                                    </div>
                                    <p className='text-xs text-muted-foreground'>
                                      {formatFileSize(doc.size)} • {format(new Date(doc.uploadedAt), 'MMM d')}
                                    </p>
                                  </div>
                                  <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <Button variant='ghost' size='icon' className='h-6 w-6' onClick={() => window.open(doc.url, '_blank')}>
                                      <MdVisibility className='h-3 w-3' />
                                    </Button>
                                    <Button variant='ghost' size='icon' className='h-6 w-6'>
                                      <MdDownload className='h-3 w-3' />
                                    </Button>
                                    {onDocumentDelete && !isWorkflowDoc && (
                                      <Button variant='ghost' size='icon' className='h-6 w-6 text-destructive hover:text-destructive' onClick={() => onDocumentDelete(doc.id)}>
                                        <MdDelete className='h-3 w-3' />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <div className='flex items-center gap-3 p-3 opacity-60'>
                        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', config.bgColor)}>
                          <Icon className={cn('h-4 w-4', config.color)} />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-muted-foreground'>{config.label}</p>
                          <p className='text-xs text-muted-foreground'>
                            {isRequired ? 'Required' : 'Optional'}
                          </p>
                        </div>
                        <MdRadioButtonUnchecked className='h-5 w-5 text-muted-foreground/40' />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
