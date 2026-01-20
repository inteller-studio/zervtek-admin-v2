'use client'

import { useRef, useState } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAttachMoney, MdError, MdUploadFile, MdDescription, MdDelete, MdOpenInNew, MdCheck, MdClose, MdChat, MdAdd, MdReceipt, MdEdit } from 'react-icons/md'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Purchase } from '../../../data/won-auctions'
import { type PurchaseWorkflow, type WorkflowAttachment, type CostInvoice, type CostType, COST_TYPES } from '../../../types/workflow'
import { updateWorkflowStage, updateTaskCompletion } from '../../../utils/workflow'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AfterPurchaseStageProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
}

export function AfterPurchaseStage({
  auction,
  workflow,
  onWorkflowUpdate,
  currentUser,
}: AfterPurchaseStageProps) {
  const stage = workflow.stages.afterPurchase
  const fileInputRef = useRef<HTMLInputElement>(null)
  const costFileInputRef = useRef<HTMLInputElement>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [notes, setNotes] = useState('')
  const [paymentAmount, setPaymentAmount] = useState<number>(0)

  // Edit mode state
  const [editMode, setEditMode] = useState(false)

  // Cost invoice dialog state
  const [costDialogOpen, setCostDialogOpen] = useState(false)
  const [costType, setCostType] = useState<CostType>('tax')
  const [costDescription, setCostDescription] = useState('')
  const [costAmount, setCostAmount] = useState<number>(0)
  const [costFile, setCostFile] = useState<File | null>(null)

  // Handle checkbox click - open dialog to ask about invoice
  const handleCheckboxClick = () => {
    if (stage.paymentToAuctionHouse.completed) {
      // If unchecking, just update the state
      const updatedStage = {
        ...stage,
        status: 'in_progress' as const,
        paymentToAuctionHouse: updateTaskCompletion(
          stage.paymentToAuctionHouse,
          false,
          currentUser
        ),
        invoiceAttachments: undefined,
      }
      onWorkflowUpdate(updateWorkflowStage(workflow, 'afterPurchase', updatedStage))
    } else {
      // If checking, open dialog to ask about invoice
      setEditMode(false)
      setDialogOpen(true)
    }
  }

  // Handle edit button click - pre-populate and open dialog
  const handleEditClick = () => {
    // Pre-populate form with existing data
    setPaymentAmount(stage.paymentAmount || 0)
    setNotes(stage.paymentToAuctionHouse.completion?.notes || '')
    // Note: We can't restore File objects from URLs, so pendingFiles stays empty
    // Existing attachments remain on the stage and can be managed separately
    setEditMode(true)
    setDialogOpen(true)
  }

  // Complete without invoice
  const handleCompleteWithoutInvoice = () => {
    const amount = paymentAmount || undefined
    const updatedStage = {
      ...stage,
      status: 'completed' as const,
      paymentToAuctionHouse: updateTaskCompletion(
        stage.paymentToAuctionHouse,
        true,
        currentUser,
        notes || undefined
      ),
      paymentAmount: amount,
      paymentCurrency: amount ? (auction.currency || 'JPY') : undefined,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'afterPurchase', updatedStage))
    setDialogOpen(false)
    setNotes('')
    setPaymentAmount(0)
    setEditMode(false)
    toast.success(editMode ? 'Payment details updated' : 'Payment marked as completed')
  }

  // Handle file selection from dialog
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    const validFiles: File[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`)
        continue
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: File too large (max 10MB)`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...validFiles])
    }

    // Reset input to allow selecting same file again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Remove a pending file
  const handleRemovePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Complete with invoices
  const handleCompleteWithInvoice = () => {
    if (pendingFiles.length === 0) {
      toast.error('Please select at least one invoice file')
      return
    }

    // Create attachment objects for all files
    const attachments: WorkflowAttachment[] = pendingFiles.map((file, index) => ({
      id: `inv-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
      size: file.size,
      uploadedBy: currentUser,
      uploadedAt: new Date(),
    }))

    const amount = paymentAmount || undefined
    const updatedStage = {
      ...stage,
      status: 'completed' as const,
      paymentToAuctionHouse: updateTaskCompletion(
        stage.paymentToAuctionHouse,
        true,
        currentUser,
        notes || undefined
      ),
      paymentAmount: amount,
      paymentCurrency: amount ? (auction.currency || 'JPY') : undefined,
      invoiceAttachments: attachments,
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'afterPurchase', updatedStage))
    setDialogOpen(false)
    setPendingFiles([])
    setNotes('')
    setPaymentAmount(0)
    setEditMode(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.success(editMode ? `Payment updated with ${attachments.length} invoice(s)` : `Payment completed with ${attachments.length} invoice(s) attached`)
  }

  const handleRemoveInvoice = (invoiceId: string) => {
    const updatedAttachments = stage.invoiceAttachments?.filter(inv => inv.id !== invoiceId)
    const updatedStage = {
      ...stage,
      invoiceAttachments: updatedAttachments && updatedAttachments.length > 0 ? updatedAttachments : undefined,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'afterPurchase', updatedStage))
    toast.success('Invoice removed')
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setPendingFiles([])
    setNotes('')
    setPaymentAmount(0)
    setEditMode(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Cost invoice handlers
  const handleCostFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setCostFile(file)
  }

  const handleAddCostInvoice = () => {
    if (!costDescription.trim()) {
      toast.error('Please enter a description')
      return
    }

    if (!costAmount || costAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    let attachment: WorkflowAttachment | undefined
    if (costFile) {
      attachment = {
        id: `cost-att-${Date.now()}`,
        name: costFile.name,
        url: URL.createObjectURL(costFile),
        type: costFile.type.startsWith('image/') ? 'image' : 'document',
        size: costFile.size,
        uploadedBy: currentUser,
        uploadedAt: new Date(),
      }
    }

    const newCostInvoice: CostInvoice = {
      id: `cost-${Date.now()}`,
      costType,
      description: costDescription.trim(),
      amount: costAmount,
      currency: auction.currency || 'JPY',
      attachment,
      createdBy: currentUser,
      createdAt: new Date(),
    }

    const updatedStage = {
      ...stage,
      costInvoices: [...(stage.costInvoices || []), newCostInvoice],
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'afterPurchase', updatedStage))
    handleCostDialogClose()
    toast.success('Invoice added')
  }

  const handleRemoveCostInvoice = (costId: string) => {
    const updatedCosts = stage.costInvoices?.filter(c => c.id !== costId)
    const updatedStage = {
      ...stage,
      costInvoices: updatedCosts && updatedCosts.length > 0 ? updatedCosts : undefined,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'afterPurchase', updatedStage))
    toast.success('Invoice removed')
  }

  const handleCostDialogClose = () => {
    setCostDialogOpen(false)
    setCostType('tax')
    setCostDescription('')
    setCostAmount(0)
    setCostFile(null)
    if (costFileInputRef.current) costFileInputRef.current.value = ''
  }

  // Calculate total costs
  const totalCosts = stage.costInvoices?.reduce((sum, cost) => sum + cost.amount, 0) || 0

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className='space-y-4'>
      {/* Info Alert */}
      <Alert>
        <MdAttachMoney className='h-4 w-4' />
        <AlertDescription>
          Confirm that payment to the auction house has been completed before proceeding.
        </AlertDescription>
      </Alert>

      {/* Payment Summary */}
      <div className='rounded-lg border p-3 bg-muted/30'>
        <h4 className='text-sm font-medium mb-2'>Auction Payment Details</h4>
        <div className='space-y-1 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Winning Bid</span>
            <span className='font-medium'>¥{auction.winningBid.toLocaleString()}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Auction ID</span>
            <span className='font-mono text-xs'>{auction.auctionId}</span>
          </div>
        </div>
      </div>

      {/* Task - Custom checkbox with click handler */}
      <div className='border rounded-lg p-3'>
        <div className='flex items-start gap-3 py-2'>
          <motion.button
            type='button'
            role='checkbox'
            aria-checked={stage.paymentToAuctionHouse.completed}
            id='payment-auction-house'
            disabled={workflow.finalized}
            onClick={() => !workflow.finalized && handleCheckboxClick()}
            className={cn(
              'mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              stage.paymentToAuctionHouse.completed
                ? 'bg-foreground border-foreground'
                : 'border-muted-foreground/50 dark:border-muted-foreground/70 hover:border-foreground/60',
              workflow.finalized && 'opacity-50 cursor-not-allowed'
            )}
            whileTap={!workflow.finalized ? { scale: 0.85 } : undefined}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <AnimatePresence>
              {stage.paymentToAuctionHouse.completed && (
                <motion.svg
                  viewBox='0 0 24 24'
                  className='h-3.5 w-3.5 text-background'
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <motion.path
                    d='M5 12l5 5L20 7'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={3}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <label
                htmlFor='payment-auction-house'
                className={cn(
                  'text-sm font-medium cursor-pointer select-none',
                  stage.paymentToAuctionHouse.completed && 'text-muted-foreground line-through'
                )}
              >
                Payment to Auction House Completed
              </label>
              {/* Edit button - shown when completed and not finalized */}
              {stage.paymentToAuctionHouse.completed && !workflow.finalized && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground'
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditClick()
                  }}
                >
                  <MdEdit className='h-3 w-3 mr-0.5' />
                  Edit
                </Button>
              )}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Confirm that the full auction amount has been paid to the auction house
            </p>

            {/* Completion info */}
            {stage.paymentToAuctionHouse.completed && stage.paymentToAuctionHouse.completion && (
              <div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground'>
                {stage.paymentAmount && (
                  <span className='font-semibold text-foreground'>
                    {new Intl.NumberFormat('ja-JP', {
                      style: 'currency',
                      currency: stage.paymentCurrency || 'JPY',
                      minimumFractionDigits: 0,
                    }).format(stage.paymentAmount)}
                  </span>
                )}
                <span>Completed by {stage.paymentToAuctionHouse.completion.completedBy}</span>
                <span>
                  {format(new Date(stage.paymentToAuctionHouse.completion.completedAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
            )}
          </div>

          {/* Status indicator */}
          <AnimatePresence>
            {stage.paymentToAuctionHouse.completed && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className='shrink-0'
              >
                <div className='h-5 w-5 rounded-full bg-foreground flex items-center justify-center'>
                  <MdCheck className='h-3 w-3 text-background' />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Show attached invoices if exists */}
      {stage.paymentToAuctionHouse.completed && stage.invoiceAttachments && stage.invoiceAttachments.length > 0 && (
        <div className='border rounded-lg p-3'>
          <div className='flex items-center gap-2 mb-2'>
            <MdDescription className='h-4 w-4 text-muted-foreground' />
            <h4 className='text-sm font-medium'>
              Attached Invoices ({stage.invoiceAttachments.length})
            </h4>
          </div>
          <div className='space-y-2'>
            {stage.invoiceAttachments.map((invoice) => (
              <div key={invoice.id} className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                  <MdDescription className='h-5 w-5 text-primary' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>{invoice.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {formatFileSize(invoice.size)} • {invoice.uploadedBy} •{' '}
                    {format(new Date(invoice.uploadedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className='flex items-center gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => window.open(invoice.url, '_blank')}
                  >
                    <MdOpenInNew className='h-4 w-4' />
                  </Button>
                  {!workflow.finalized && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-destructive hover:text-destructive'
                      onClick={() => handleRemoveInvoice(invoice.id)}
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

      {/* Cost Invoices Section */}
      <div className='border rounded-lg p-3'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <MdReceipt className='h-4 w-4 text-muted-foreground' />
            <h4 className='text-sm font-medium'>Invoices</h4>
            {stage.costInvoices && stage.costInvoices.length > 0 && (
              <Badge variant='secondary' className='text-xs'>
                {stage.costInvoices.length}
              </Badge>
            )}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCostDialogOpen(true)}
            disabled={workflow.finalized}
          >
            <MdAdd className='h-4 w-4 mr-1' />
            Add Invoice
          </Button>
        </div>

        {stage.costInvoices && stage.costInvoices.length > 0 ? (
          <div className='space-y-2'>
            {stage.costInvoices.map((cost) => (
              <div key={cost.id} className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                <div className='h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0'>
                  <MdReceipt className='h-5 w-5 text-amber-600' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium truncate'>{cost.description}</p>
                    <Badge variant='outline' className='text-[10px] shrink-0'>
                      {COST_TYPES.find(t => t.value === cost.costType)?.label}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-2 mt-0.5'>
                    <p className='text-sm font-semibold text-amber-600'>
                      {new Intl.NumberFormat('ja-JP', {
                        style: 'currency',
                        currency: cost.currency,
                        minimumFractionDigits: 0,
                      }).format(cost.amount)}
                    </p>
                    <span className='text-xs text-muted-foreground'>
                      • {cost.createdBy} • {format(new Date(cost.createdAt), 'MMM d')}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  {cost.attachment && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => window.open(cost.attachment!.url, '_blank')}
                    >
                      <MdOpenInNew className='h-4 w-4' />
                    </Button>
                  )}
                  {!workflow.finalized && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-destructive hover:text-destructive'
                      onClick={() => handleRemoveCostInvoice(cost.id)}
                    >
                      <MdDelete className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Total */}
            <div className='flex items-center justify-between pt-2 border-t mt-2'>
              <span className='text-sm font-medium'>Total Costs</span>
              <span className='text-sm font-bold'>
                {new Intl.NumberFormat('ja-JP', {
                  style: 'currency',
                  currency: auction.currency || 'JPY',
                  minimumFractionDigits: 0,
                }).format(totalCosts)}
              </span>
            </div>
          </div>
        ) : (
          <p className='text-xs text-muted-foreground text-center py-4'>
            No invoices added yet. Click &quot;Add Invoice&quot; to add tax, fees, or other expenses.
          </p>
        )}
      </div>

      {/* Warning if not complete */}
      {!stage.paymentToAuctionHouse.completed && (
        <Alert variant='destructive' className='bg-destructive/10 border-destructive/30'>
          <MdError className='h-4 w-4' />
          <AlertDescription>
            Complete the auction house payment to proceed to the next stage.
          </AlertDescription>
        </Alert>
      )}

      {/* Invoice Dialog */}
      <Dialog open={costDialogOpen} onOpenChange={handleCostDialogClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MdReceipt className='h-5 w-5' />
              Add Invoice
            </DialogTitle>
            <DialogDescription>
              Add tax, fees, or other invoices for this purchase
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleAddCostInvoice(); }} className='space-y-4 py-4'>
            {/* Cost Type */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Cost Type</label>
              <Select value={costType} onValueChange={(v) => setCostType(v as CostType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Description</label>
              <Input
                placeholder='e.g., Consumption Tax, Transport Fee...'
                value={costDescription}
                onChange={(e) => setCostDescription(e.target.value)}
              />
            </div>

            {/* Amount */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Amount ({auction.currency || 'JPY'})</label>
              <NumericInput
                placeholder='0'
                value={costAmount}
                onChange={setCostAmount}
              />
            </div>

            {/* Invoice attachment */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdDescription className='h-4 w-4 text-muted-foreground' />
                Invoice (optional)
              </label>
              <div className='border-2 border-dashed rounded-lg p-3'>
                <input
                  ref={costFileInputRef}
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png,.webp'
                  className='hidden'
                  onChange={handleCostFileSelect}
                />

                {costFile ? (
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                      <MdDescription className='h-4 w-4 text-primary' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate'>{costFile.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {formatFileSize(costFile.size)}
                      </p>
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => {
                        setCostFile(null)
                        if (costFileInputRef.current) costFileInputRef.current.value = ''
                      }}
                    >
                      <MdClose className='h-4 w-4' />
                    </Button>
                  </div>
                ) : (
                  <div
                    className='text-center cursor-pointer py-2'
                    onClick={() => costFileInputRef.current?.click()}
                  >
                    <MdUploadFile className='h-6 w-6 mx-auto text-muted-foreground mb-1' />
                    <p className='text-xs text-muted-foreground'>
                      Click to attach invoice
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                className='flex-1'
                onClick={handleCostDialogClose}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='flex-1'
              >
                <MdAdd className='h-4 w-4 mr-2' />
                Add Invoice
                <span className='ml-2 text-[10px] opacity-50 font-mono'>↵</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Attachment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MdDescription className='h-5 w-5' />
              {editMode ? 'Edit Payment Details' : 'Complete Payment'}
            </DialogTitle>
            <DialogDescription>
              {editMode ? 'Update payment details and attachments' : 'Add notes and attach invoices for this auction house payment (optional)'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); pendingFiles.length > 0 ? handleCompleteWithInvoice() : handleCompleteWithoutInvoice(); }} className='space-y-4 py-4'>
            {/* Amount field */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdAttachMoney className='h-4 w-4 text-muted-foreground' />
                Payment Amount ({auction.currency || 'JPY'})
              </label>
              <NumericInput
                placeholder={`e.g., ${auction.winningBid.toLocaleString()}`}
                value={paymentAmount}
                onChange={setPaymentAmount}
              />
            </div>

            {/* Notes field */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdChat className='h-4 w-4 text-muted-foreground' />
                Notes (optional)
              </label>
              <Textarea
                placeholder='Add any notes about this payment...'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className='resize-none'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    pendingFiles.length > 0 ? handleCompleteWithInvoice() : handleCompleteWithoutInvoice()
                  }
                }}
              />
              <p className='text-[10px] text-muted-foreground'>Press Ctrl+Enter to submit</p>
            </div>

            {/* File upload area */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdDescription className='h-4 w-4 text-muted-foreground' />
                Invoices (optional)
              </label>
              <div className='border-2 border-dashed rounded-lg p-4'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png,.webp'
                  className='hidden'
                  onChange={handleFileSelect}
                  multiple
                />

                {pendingFiles.length > 0 ? (
                  <div className='space-y-2'>
                    {pendingFiles.map((file, index) => (
                      <div key={index} className='flex items-center gap-3 p-2 bg-muted/50 rounded-lg'>
                        <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                          <MdDescription className='h-4 w-4 text-primary' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium truncate'>{file.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={() => handleRemovePendingFile(index)}
                        >
                          <MdClose className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='w-full mt-2'
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <MdUploadFile className='h-4 w-4 mr-2' />
                      Add More Files
                    </Button>
                  </div>
                ) : (
                  <div
                    className='text-center cursor-pointer'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <MdUploadFile className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
                    <p className='text-sm font-medium'>Click to upload invoices</p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      PDF or image files up to 10MB each
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex gap-2'>
              <Button
                type='submit'
                variant={pendingFiles.length > 0 ? 'outline' : 'default'}
                className='flex-1'
              >
                {pendingFiles.length === 0 ? (editMode ? 'Update' : 'Complete') : 'Skip Files'}
                <span className='ml-2 text-[10px] opacity-50 font-mono'>↵</span>
              </Button>
              {pendingFiles.length > 0 && (
                <Button
                  type='button'
                  className='flex-1'
                  onClick={handleCompleteWithInvoice}
                >
                  <MdUploadFile className='h-4 w-4 mr-2' />
                  {editMode ? 'Update' : 'Attach & Complete'}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
