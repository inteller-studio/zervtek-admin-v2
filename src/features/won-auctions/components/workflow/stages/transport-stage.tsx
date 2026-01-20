'use client'

import { useRef, useState } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdLocalShipping,
  MdBusiness,
  MdAttachMoney,
  MdDescription,
  MdUploadFile,
  MdCheck,
  MdClose,
  MdChat,
  MdAdd,
  MdReceipt,
  MdDelete,
  MdOpenInNew,
  MdCameraAlt,
  MdSettings,
  MdEdit,
} from 'react-icons/md'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../../data/won-auctions'
import { type PurchaseWorkflow, type WorkflowAttachment, type TransportCost, type TaskCompletion } from '../../../types/workflow'
import { updateWorkflowStage, updateTaskCompletion } from '../../../utils/workflow'
import { WorkflowCheckbox } from '../shared/workflow-checkbox'
import { YardSelector } from '../shared/yard-selector'
import { type Yard } from '../../../../yards/types'
import { toast } from 'sonner'

interface TransportStageProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
  yards: Yard[]
  onAddYard?: () => void
}

type TaskKey = 'transportArranged' | 'photosRequested'

export function TransportStage({
  auction,
  workflow,
  onWorkflowUpdate,
  currentUser,
  yards,
  onAddYard,
}: TransportStageProps) {
  const stage = workflow.stages.transport

  // Dialog state for transport arranged
  const [transportDialogOpen, setTransportDialogOpen] = useState(false)
  const [transportAmount, setTransportAmount] = useState<number>(0)
  const [transportNotes, setTransportNotes] = useState('')
  const [transportFiles, setTransportFiles] = useState<File[]>([])
  const transportFileRef = useRef<HTMLInputElement>(null)
  const [transportEditMode, setTransportEditMode] = useState(false)

  // Dialog state for photos requested
  const [photosDialogOpen, setPhotosDialogOpen] = useState(false)
  const [photosAmount, setPhotosAmount] = useState<number>(0)
  const [photosNotes, setPhotosNotes] = useState('')
  const [photosFiles, setPhotosFiles] = useState<File[]>([])
  const photosFileRef = useRef<HTMLInputElement>(null)
  const [photosEditMode, setPhotosEditMode] = useState(false)

  // Cost dialog state
  const [costDialogOpen, setCostDialogOpen] = useState(false)
  const [costTaskKey, setCostTaskKey] = useState<TaskKey>('transportArranged')
  const [costDescription, setCostDescription] = useState('')
  const [costAmount, setCostAmount] = useState<number>(0)
  const [costFile, setCostFile] = useState<File | null>(null)
  const costFileRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleYardSelect = (yard: Yard | null) => {
    const updatedStage = {
      ...stage,
      yardId: yard?.id || null,
      yardName: yard?.name,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
  }

  // Generic file validation
  const validateFiles = (files: FileList | null): File[] => {
    if (!files) return []
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    const validFiles: File[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`)
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: File too large (max 10MB)`)
        continue
      }
      validFiles.push(file)
    }
    return validFiles
  }

  // Transport Arranged handlers
  const handleTransportCheckboxClick = () => {
    if (stage.transportArranged.completed) {
      // Unchecking - reset related data
      const updatedStage = {
        ...stage,
        transportArranged: updateTaskCompletion(stage.transportArranged, false, currentUser),
        transportArrangedAmount: undefined,
        transportArrangedCurrency: undefined,
        transportArrangedInvoices: undefined,
      }
      onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
    } else {
      setTransportDialogOpen(true)
    }
  }

  const handleTransportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateFiles(e.target.files)
    if (validFiles.length > 0) {
      setTransportFiles(prev => [...prev, ...validFiles])
    }
    if (transportFileRef.current) transportFileRef.current.value = ''
  }

  const handleTransportComplete = () => {
    const amount = transportAmount || undefined
    const attachments: WorkflowAttachment[] = transportFiles.map((file, index) => ({
      id: `transport-inv-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
      size: file.size,
      uploadedBy: currentUser,
      uploadedAt: new Date(),
    }))

    const updatedStage = {
      ...stage,
      transportArranged: updateTaskCompletion(
        stage.transportArranged,
        true,
        currentUser,
        transportNotes || undefined
      ),
      transportArrangedAmount: amount,
      transportArrangedCurrency: amount ? (auction.currency || 'JPY') : undefined,
      transportArrangedInvoices: attachments.length > 0 ? attachments : undefined,
    }

    // Check completion status
    const allComplete = stage.yardId !== null &&
      true && // transportArranged is now complete
      stage.yardNotified.completed &&
      stage.photosRequested.completed
    updatedStage.status = allComplete ? 'completed' : 'in_progress'

    onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
    const wasEditMode = transportEditMode
    handleTransportDialogClose()
    toast.success(wasEditMode ? 'Transport details updated' : 'Transport arranged completed')
  }

  const handleTransportDialogClose = () => {
    setTransportDialogOpen(false)
    setTransportAmount(0)
    setTransportNotes('')
    setTransportFiles([])
    setTransportEditMode(false)
    if (transportFileRef.current) transportFileRef.current.value = ''
  }

  const handleTransportEditClick = () => {
    // Pre-populate form with existing data
    setTransportAmount(stage.transportArrangedAmount || 0)
    setTransportNotes(stage.transportArranged.completion?.notes || '')
    setTransportFiles([]) // Files can't be pre-populated, but existing ones are shown separately
    setTransportEditMode(true)
    setTransportDialogOpen(true)
  }

  // Photos Requested handlers
  const handlePhotosCheckboxClick = () => {
    if (stage.photosRequested.completed) {
      const updatedStage = {
        ...stage,
        photosRequested: updateTaskCompletion(stage.photosRequested, false, currentUser),
        photosRequestedAmount: undefined,
        photosRequestedCurrency: undefined,
        photosRequestedInvoices: undefined,
      }
      onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
    } else {
      setPhotosDialogOpen(true)
    }
  }

  const handlePhotosFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateFiles(e.target.files)
    if (validFiles.length > 0) {
      setPhotosFiles(prev => [...prev, ...validFiles])
    }
    if (photosFileRef.current) photosFileRef.current.value = ''
  }

  const handlePhotosComplete = () => {
    const amount = photosAmount || undefined
    const attachments: WorkflowAttachment[] = photosFiles.map((file, index) => ({
      id: `photos-inv-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
      size: file.size,
      uploadedBy: currentUser,
      uploadedAt: new Date(),
    }))

    const updatedStage = {
      ...stage,
      photosRequested: updateTaskCompletion(
        stage.photosRequested,
        true,
        currentUser,
        photosNotes || undefined
      ),
      photosRequestedAmount: amount,
      photosRequestedCurrency: amount ? (auction.currency || 'JPY') : undefined,
      photosRequestedInvoices: attachments.length > 0 ? attachments : undefined,
    }

    // Check completion status
    const allComplete = stage.yardId !== null &&
      stage.transportArranged.completed &&
      stage.yardNotified.completed &&
      true // photosRequested is now complete
    updatedStage.status = allComplete ? 'completed' : 'in_progress'

    onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
    const wasEditMode = photosEditMode
    handlePhotosDialogClose()
    toast.success(wasEditMode ? 'Photos request details updated' : 'Photos requested completed')
  }

  const handlePhotosDialogClose = () => {
    setPhotosDialogOpen(false)
    setPhotosAmount(0)
    setPhotosNotes('')
    setPhotosFiles([])
    setPhotosEditMode(false)
    if (photosFileRef.current) photosFileRef.current.value = ''
  }

  const handlePhotosEditClick = () => {
    // Pre-populate form with existing data
    setPhotosAmount(stage.photosRequestedAmount || 0)
    setPhotosNotes(stage.photosRequested.completion?.notes || '')
    setPhotosFiles([]) // Files can't be pre-populated, but existing ones are shown separately
    setPhotosEditMode(true)
    setPhotosDialogOpen(true)
  }

  // Yard Notified handler (simple, no cost)
  const handleYardNotifiedChange = (checked: boolean, notes?: string) => {
    const updatedStage = {
      ...stage,
      yardNotified: updateTaskCompletion(stage.yardNotified, checked, currentUser, notes),
    }
    const allComplete = stage.yardId !== null &&
      stage.transportArranged.completed &&
      (checked) &&
      stage.photosRequested.completed
    updatedStage.status = allComplete ? 'completed' : 'in_progress'
    onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
  }

  // Yard Notified edit handler (for inline note editing)
  const handleYardNotifiedEdit = (completion: TaskCompletion) => {
    const updatedStage = {
      ...stage,
      yardNotified: {
        ...stage.yardNotified,
        completion,
      },
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
  }

  // Cost handlers
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

  const handleAddCost = () => {
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
        id: `transport-cost-att-${Date.now()}`,
        name: costFile.name,
        url: URL.createObjectURL(costFile),
        type: costFile.type.startsWith('image/') ? 'image' : 'document',
        size: costFile.size,
        uploadedBy: currentUser,
        uploadedAt: new Date(),
      }
    }

    const newCost: TransportCost = {
      id: `transport-cost-${Date.now()}`,
      taskKey: costTaskKey,
      description: costDescription.trim(),
      amount: costAmount,
      currency: auction.currency || 'JPY',
      attachment,
      createdBy: currentUser,
      createdAt: new Date(),
    }

    const updatedStage = {
      ...stage,
      costs: [...(stage.costs || []), newCost],
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
    handleCostDialogClose()
    toast.success('Cost added')
  }

  const handleRemoveCost = (costId: string) => {
    const updatedCosts = stage.costs?.filter(c => c.id !== costId)
    const updatedStage = {
      ...stage,
      costs: updatedCosts && updatedCosts.length > 0 ? updatedCosts : undefined,
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
    toast.success('Cost removed')
  }

  const handleCostDialogClose = () => {
    setCostDialogOpen(false)
    setCostTaskKey('transportArranged')
    setCostDescription('')
    setCostAmount(0)
    setCostFile(null)
    if (costFileRef.current) costFileRef.current.value = ''
  }

  const handleRemoveInvoice = (taskKey: TaskKey, invoiceId: string) => {
    if (taskKey === 'transportArranged') {
      const updatedInvoices = stage.transportArrangedInvoices?.filter(inv => inv.id !== invoiceId)
      const updatedStage = {
        ...stage,
        transportArrangedInvoices: updatedInvoices && updatedInvoices.length > 0 ? updatedInvoices : undefined,
      }
      onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
    } else {
      const updatedInvoices = stage.photosRequestedInvoices?.filter(inv => inv.id !== invoiceId)
      const updatedStage = {
        ...stage,
        photosRequestedInvoices: updatedInvoices && updatedInvoices.length > 0 ? updatedInvoices : undefined,
      }
      onWorkflowUpdate(updateWorkflowStage(workflow, 'transport', updatedStage))
    }
    toast.success('Invoice removed')
  }

  const isYardSelected = stage.yardId !== null

  // Calculate totals
  const transportCosts = stage.costs?.filter(c => c.taskKey === 'transportArranged') || []
  const photosCosts = stage.costs?.filter(c => c.taskKey === 'photosRequested') || []
  const totalCosts = (stage.costs || []).reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className='space-y-4'>
      {/* Info Alert */}
      <Alert>
        <MdLocalShipping className='h-4 w-4' />
        <AlertDescription>
          Select a yard and arrange transport for the vehicle.
        </AlertDescription>
      </Alert>

      {/* Yard Selection */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-medium'>
            <MdBusiness className='h-4 w-4 inline mr-1.5' />
            Select Yard
          </Label>
          <Link
            href='/admin/yards'
            target='_blank'
            className='flex items-center gap-1 text-xs text-primary hover:underline'
          >
            <MdSettings className='h-3 w-3' />
            Manage Yards
          </Link>
        </div>
        <YardSelector
          yards={yards}
          selectedYardId={stage.yardId}
          onSelect={handleYardSelect}
          onAddYard={onAddYard}
          placeholder='Choose a storage yard...'
          disabled={workflow.finalized}
        />
        {stage.yardName && (
          <p className='text-xs text-muted-foreground'>
            Selected: {stage.yardName}
          </p>
        )}
      </div>

      {/* Tasks */}
      <div className='border rounded-lg divide-y'>
        {/* Transport Arranged - Custom implementation */}
        <div className='px-3'>
          <div className='flex items-start gap-3 py-3'>
            <motion.button
              type='button'
              role='checkbox'
              aria-checked={stage.transportArranged.completed}
              id='transport-arranged'
              disabled={!isYardSelected || workflow.finalized}
              onClick={() => (isYardSelected && !workflow.finalized) && handleTransportCheckboxClick()}
              className={cn(
                'mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                stage.transportArranged.completed
                  ? 'bg-foreground border-foreground'
                  : 'border-muted-foreground/50 dark:border-muted-foreground/70 hover:border-foreground/60',
                (!isYardSelected || workflow.finalized) && 'opacity-50 cursor-not-allowed'
              )}
              whileTap={(isYardSelected && !workflow.finalized) ? { scale: 0.85 } : undefined}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <AnimatePresence>
                {stage.transportArranged.completed && (
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
                  htmlFor='transport-arranged'
                  className={cn(
                    'text-sm font-medium cursor-pointer select-none',
                    stage.transportArranged.completed && 'text-muted-foreground line-through',
                    !isYardSelected && 'cursor-not-allowed opacity-50'
                  )}
                >
                  Transport Arranged
                </label>
                {stage.transportArranged.completed && !workflow.finalized && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTransportEditClick()
                    }}
                  >
                    <MdEdit className='h-3 w-3 mr-0.5' />
                    Edit
                  </Button>
                )}
              </div>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Confirm that transport to the yard has been arranged
              </p>

              {/* Completion info */}
              {stage.transportArranged.completed && stage.transportArranged.completion && (
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground'>
                  {stage.transportArrangedAmount && (
                    <span className='font-semibold text-foreground'>
                      {new Intl.NumberFormat('ja-JP', {
                        style: 'currency',
                        currency: stage.transportArrangedCurrency || 'JPY',
                        minimumFractionDigits: 0,
                      }).format(stage.transportArrangedAmount)}
                    </span>
                  )}
                  <span>by {stage.transportArranged.completion.completedBy}</span>
                  <span>
                    {format(new Date(stage.transportArranged.completion.completedAt), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
            <AnimatePresence>
              {stage.transportArranged.completed && (
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

          {/* Show attached invoices */}
          {stage.transportArranged.completed && stage.transportArrangedInvoices && stage.transportArrangedInvoices.length > 0 && (
            <div className='pb-3 space-y-1.5'>
              {stage.transportArrangedInvoices.map((invoice) => (
                <div key={invoice.id} className='flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm'>
                  <MdDescription className='h-4 w-4 text-muted-foreground shrink-0' />
                  <span className='flex-1 truncate'>{invoice.name}</span>
                  <Button variant='ghost' size='icon' className='h-6 w-6' onClick={() => window.open(invoice.url, '_blank')}>
                    <MdOpenInNew className='h-3 w-3' />
                  </Button>
                  {!workflow.finalized && (
                    <Button variant='ghost' size='icon' className='h-6 w-6 text-destructive' onClick={() => handleRemoveInvoice('transportArranged', invoice.id)}>
                      <MdDelete className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Yard Notified - Simple checkbox */}
        <WorkflowCheckbox
          id='yard-notified'
          label='Notify the Yard'
          description='Inform the yard that a vehicle is coming'
          checked={stage.yardNotified.completed}
          completion={stage.yardNotified.completion}
          disabled={!isYardSelected || !stage.transportArranged.completed || workflow.finalized}
          onCheckedChange={(checked, notes) => handleYardNotifiedChange(checked, notes)}
          onEdit={handleYardNotifiedEdit}
          showNoteOnComplete
          className='px-3'
        />

        {/* Photos Requested - Custom implementation */}
        <div className='px-3'>
          <div className='flex items-start gap-3 py-3'>
            <motion.button
              type='button'
              role='checkbox'
              aria-checked={stage.photosRequested.completed}
              id='photos-requested'
              disabled={!isYardSelected || !stage.yardNotified.completed || workflow.finalized}
              onClick={() => (isYardSelected && stage.yardNotified.completed && !workflow.finalized) && handlePhotosCheckboxClick()}
              className={cn(
                'mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                stage.photosRequested.completed
                  ? 'bg-foreground border-foreground'
                  : 'border-muted-foreground/50 dark:border-muted-foreground/70 hover:border-foreground/60',
                (!isYardSelected || !stage.yardNotified.completed || workflow.finalized) && 'opacity-50 cursor-not-allowed'
              )}
              whileTap={(isYardSelected && stage.yardNotified.completed && !workflow.finalized) ? { scale: 0.85 } : undefined}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <AnimatePresence>
                {stage.photosRequested.completed && (
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
                  htmlFor='photos-requested'
                  className={cn(
                    'text-sm font-medium cursor-pointer select-none',
                    stage.photosRequested.completed && 'text-muted-foreground line-through',
                    (!isYardSelected || !stage.yardNotified.completed) && 'cursor-not-allowed opacity-50'
                  )}
                >
                  Photos Requested
                </label>
                {stage.photosRequested.completed && !workflow.finalized && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground'
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePhotosEditClick()
                    }}
                  >
                    <MdEdit className='h-3 w-3 mr-0.5' />
                    Edit
                  </Button>
                )}
              </div>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Request photos of the vehicle from the yard
              </p>

              {/* Completion info */}
              {stage.photosRequested.completed && stage.photosRequested.completion && (
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground'>
                  {stage.photosRequestedAmount && (
                    <span className='font-semibold text-foreground'>
                      {new Intl.NumberFormat('ja-JP', {
                        style: 'currency',
                        currency: stage.photosRequestedCurrency || 'JPY',
                        minimumFractionDigits: 0,
                      }).format(stage.photosRequestedAmount)}
                    </span>
                  )}
                  <span>by {stage.photosRequested.completion.completedBy}</span>
                  <span>
                    {format(new Date(stage.photosRequested.completion.completedAt), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
            <AnimatePresence>
              {stage.photosRequested.completed && (
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

          {/* Show attached invoices */}
          {stage.photosRequested.completed && stage.photosRequestedInvoices && stage.photosRequestedInvoices.length > 0 && (
            <div className='pb-3 space-y-1.5'>
              {stage.photosRequestedInvoices.map((invoice) => (
                <div key={invoice.id} className='flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm'>
                  <MdDescription className='h-4 w-4 text-muted-foreground shrink-0' />
                  <span className='flex-1 truncate'>{invoice.name}</span>
                  <Button variant='ghost' size='icon' className='h-6 w-6' onClick={() => window.open(invoice.url, '_blank')}>
                    <MdOpenInNew className='h-3 w-3' />
                  </Button>
                  {!workflow.finalized && (
                    <Button variant='ghost' size='icon' className='h-6 w-6 text-destructive' onClick={() => handleRemoveInvoice('photosRequested', invoice.id)}>
                      <MdDelete className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Costs Section */}
      <div className='border rounded-lg p-3'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <MdReceipt className='h-4 w-4 text-muted-foreground' />
            <h4 className='text-sm font-medium'>Invoices</h4>
            {stage.costs && stage.costs.length > 0 && (
              <Badge variant='secondary' className='text-xs'>
                {stage.costs.length}
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

        {stage.costs && stage.costs.length > 0 ? (
          <div className='space-y-2'>
            {stage.costs.map((cost) => (
              <div key={cost.id} className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                <div className='h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0'>
                  <MdReceipt className='h-5 w-5 text-amber-600' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium truncate'>{cost.description}</p>
                    <Badge variant='outline' className='text-[10px] shrink-0'>
                      {cost.taskKey === 'transportArranged' ? 'Transport' : 'Photos'}
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
                      onClick={() => handleRemoveCost(cost.id)}
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
            No invoices added yet. Click "Add Invoice" to track transport costs.
          </p>
        )}
      </div>

      {/* Status Summary */}
      {!isYardSelected && (
        <p className='text-xs text-muted-foreground text-center'>
          Select a yard to enable transport tasks
        </p>
      )}

      {/* Transport Arranged Dialog */}
      <Dialog open={transportDialogOpen} onOpenChange={handleTransportDialogClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MdLocalShipping className='h-5 w-5' />
              {transportEditMode ? 'Edit Transport Details' : 'Complete Transport Arrangement'}
            </DialogTitle>
            <DialogDescription>
              {transportEditMode ? 'Update the cost and invoices for transport' : 'Add cost and attach invoices for transport (optional)'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleTransportComplete(); }} className='space-y-4 py-4'>
            {/* Amount */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdAttachMoney className='h-4 w-4 text-muted-foreground' />
                Transport Cost ({auction.currency || 'JPY'})
              </label>
              <NumericInput
                placeholder='0'
                value={transportAmount}
                onChange={setTransportAmount}
              />
            </div>

            {/* Notes */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdChat className='h-4 w-4 text-muted-foreground' />
                Notes (optional)
              </label>
              <Textarea
                placeholder='Add any notes...'
                value={transportNotes}
                onChange={(e) => setTransportNotes(e.target.value)}
                rows={2}
                className='resize-none'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleTransportComplete()
                  }
                }}
              />
              <p className='text-[10px] text-muted-foreground'>Press Ctrl+Enter to submit</p>
            </div>

            {/* File upload */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdDescription className='h-4 w-4 text-muted-foreground' />
                Invoices (optional)
              </label>
              <div className='border-2 border-dashed rounded-lg p-3'>
                <input
                  ref={transportFileRef}
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png,.webp'
                  className='hidden'
                  onChange={handleTransportFileSelect}
                  multiple
                />

                {transportFiles.length > 0 ? (
                  <div className='space-y-2'>
                    {transportFiles.map((file, index) => (
                      <div key={index} className='flex items-center gap-2 p-2 bg-muted/50 rounded-lg'>
                        <MdDescription className='h-4 w-4 text-primary shrink-0' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm truncate'>{file.name}</p>
                          <p className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6'
                          onClick={() => setTransportFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <MdClose className='h-3 w-3' />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='w-full'
                      onClick={() => transportFileRef.current?.click()}
                    >
                      <MdUploadFile className='h-4 w-4 mr-2' />
                      Add More Files
                    </Button>
                  </div>
                ) : (
                  <div
                    className='text-center cursor-pointer py-2'
                    onClick={() => transportFileRef.current?.click()}
                  >
                    <MdUploadFile className='h-6 w-6 mx-auto text-muted-foreground mb-1' />
                    <p className='text-xs text-muted-foreground'>Click to upload invoices</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-2'>
              <Button type='button' variant='outline' className='flex-1' onClick={handleTransportDialogClose}>
                Cancel
              </Button>
              <Button type='submit' className='flex-1'>
                {transportEditMode ? 'Update' : 'Complete'}
                <span className='ml-2 text-[10px] opacity-50 font-mono'>↵</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Photos Requested Dialog */}
      <Dialog open={photosDialogOpen} onOpenChange={handlePhotosDialogClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MdCameraAlt className='h-5 w-5' />
              {photosEditMode ? 'Edit Photos Request Details' : 'Complete Photos Request'}
            </DialogTitle>
            <DialogDescription>
              {photosEditMode ? 'Update the cost and invoices for photo service' : 'Add cost and attach invoices for photo service (optional)'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handlePhotosComplete(); }} className='space-y-4 py-4'>
            {/* Amount */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdAttachMoney className='h-4 w-4 text-muted-foreground' />
                Photo Cost ({auction.currency || 'JPY'})
              </label>
              <NumericInput
                placeholder='0'
                value={photosAmount}
                onChange={setPhotosAmount}
              />
            </div>

            {/* Notes */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdChat className='h-4 w-4 text-muted-foreground' />
                Notes (optional)
              </label>
              <Textarea
                placeholder='Add any notes...'
                value={photosNotes}
                onChange={(e) => setPhotosNotes(e.target.value)}
                rows={2}
                className='resize-none'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handlePhotosComplete()
                  }
                }}
              />
              <p className='text-[10px] text-muted-foreground'>Press Ctrl+Enter to submit</p>
            </div>

            {/* File upload */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdDescription className='h-4 w-4 text-muted-foreground' />
                Invoices (optional)
              </label>
              <div className='border-2 border-dashed rounded-lg p-3'>
                <input
                  ref={photosFileRef}
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png,.webp'
                  className='hidden'
                  onChange={handlePhotosFileSelect}
                  multiple
                />

                {photosFiles.length > 0 ? (
                  <div className='space-y-2'>
                    {photosFiles.map((file, index) => (
                      <div key={index} className='flex items-center gap-2 p-2 bg-muted/50 rounded-lg'>
                        <MdDescription className='h-4 w-4 text-primary shrink-0' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm truncate'>{file.name}</p>
                          <p className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6'
                          onClick={() => setPhotosFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <MdClose className='h-3 w-3' />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='w-full'
                      onClick={() => photosFileRef.current?.click()}
                    >
                      <MdUploadFile className='h-4 w-4 mr-2' />
                      Add More Files
                    </Button>
                  </div>
                ) : (
                  <div
                    className='text-center cursor-pointer py-2'
                    onClick={() => photosFileRef.current?.click()}
                  >
                    <MdUploadFile className='h-6 w-6 mx-auto text-muted-foreground mb-1' />
                    <p className='text-xs text-muted-foreground'>Click to upload invoices</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-2'>
              <Button type='button' variant='outline' className='flex-1' onClick={handlePhotosDialogClose}>
                Cancel
              </Button>
              <Button type='submit' className='flex-1'>
                {photosEditMode ? 'Update' : 'Complete'}
                <span className='ml-2 text-[10px] opacity-50 font-mono'>↵</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Cost Dialog */}
      <Dialog open={costDialogOpen} onOpenChange={handleCostDialogClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MdReceipt className='h-5 w-5' />
              Add Invoice
            </DialogTitle>
            <DialogDescription>
              Add additional transport or photo-related invoices
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleAddCost(); }} className='space-y-4 py-4'>
            {/* Task selector */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Related To</label>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant={costTaskKey === 'transportArranged' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-1'
                  onClick={() => setCostTaskKey('transportArranged')}
                >
                  <MdLocalShipping className='h-4 w-4 mr-1' />
                  Transport
                </Button>
                <Button
                  type='button'
                  variant={costTaskKey === 'photosRequested' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-1'
                  onClick={() => setCostTaskKey('photosRequested')}
                >
                  <MdCameraAlt className='h-4 w-4 mr-1' />
                  Photos
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Description</label>
              <Input
                placeholder='e.g., Additional transport fee...'
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
                  ref={costFileRef}
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
                      <p className='text-xs text-muted-foreground'>{formatFileSize(costFile.size)}</p>
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => {
                        setCostFile(null)
                        if (costFileRef.current) costFileRef.current.value = ''
                      }}
                    >
                      <MdClose className='h-4 w-4' />
                    </Button>
                  </div>
                ) : (
                  <div
                    className='text-center cursor-pointer py-2'
                    onClick={() => costFileRef.current?.click()}
                  >
                    <MdUploadFile className='h-6 w-6 mx-auto text-muted-foreground mb-1' />
                    <p className='text-xs text-muted-foreground'>Click to attach invoice</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-2'>
              <Button type='button' variant='outline' className='flex-1' onClick={handleCostDialogClose}>
                Cancel
              </Button>
              <Button type='submit' className='flex-1'>
                <MdAdd className='h-4 w-4 mr-2' />
                Add Invoice
                <span className='ml-2 text-[10px] opacity-50 font-mono'>↵</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
