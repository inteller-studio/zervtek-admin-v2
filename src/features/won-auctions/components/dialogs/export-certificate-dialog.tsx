'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  MdVerified,
  MdCheck,
  MdUploadFile,
  MdDescription,
  MdClose,
  MdImage,
  MdInsertDriveFile,
  MdCalendarToday,
  MdNumbers,
  MdChat,
} from 'react-icons/md'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../data/won-auctions'
import { type PurchaseWorkflow } from '../../types/workflow'
import { updateWorkflowStage, updateTaskCompletion } from '../../utils/workflow'

interface ExportCertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auction: Purchase | null
  workflow?: PurchaseWorkflow
  onWorkflowUpdate?: (workflow: PurchaseWorkflow) => void
  currentUser?: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return MdImage
  if (type.includes('pdf')) return MdDescription
  return MdInsertDriveFile
}

export function ExportCertificateDialog({
  open,
  onOpenChange,
  auction,
  workflow,
  onWorkflowUpdate,
  currentUser = 'System',
}: ExportCertificateDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [certificateNumber, setCertificateNumber] = useState('')
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [expiryDate, setExpiryDate] = useState('')
  const [notes, setNotes] = useState('')

  // File state
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!auction) return null

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
      setPendingFiles((prev) => [...prev, ...validFiles])
    }

    // Reset input to allow selecting same file again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setCertificateNumber('')
    setIssueDate(format(new Date(), 'yyyy-MM-dd'))
    setExpiryDate('')
    setNotes('')
    setPendingFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (pendingFiles.length === 0) {
      toast.error('Please upload the export certificate document')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update workflow if provided
    if (workflow && onWorkflowUpdate) {
      const stage = workflow.stages.documentsReceived
      const isRegistered = stage.isRegistered === true
      const isUnregistered = stage.isRegistered === false

      const noteText = certificateNumber ? `Certificate #${certificateNumber}` : undefined

      // Only update if registration status has been set and tasks exist
      if (isRegistered && stage.registeredTasks) {
        const updatedStage = {
          ...stage,
          registeredTasks: {
            ...stage.registeredTasks,
            exportCertificateCreated: updateTaskCompletion(
              stage.registeredTasks.exportCertificateCreated,
              true,
              currentUser,
              noteText
            ),
          },
        }
        onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
      } else if (isUnregistered && stage.unregisteredTasks) {
        // For unregistered vehicles, there's only one task (exportCertificateCreated)
        // So when it's complete, the stage is complete
        const updatedStage = {
          ...stage,
          unregisteredTasks: {
            ...stage.unregisteredTasks,
            exportCertificateCreated: updateTaskCompletion(
              stage.unregisteredTasks.exportCertificateCreated,
              true,
              currentUser,
              noteText
            ),
          },
          status: 'completed' as const,
        }
        onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
      }
    }

    toast.success('Export certificate uploaded', {
      description: `Certificate for ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`,
    })

    setIsSubmitting(false)
    resetForm()
    onOpenChange(false)
  }

  const handleDialogClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MdVerified className='h-5 w-5 text-emerald-500' />
            Export Certificate
          </DialogTitle>
          <DialogDescription>
            Upload export certificate for {auction.vehicleInfo.year} {auction.vehicleInfo.make}{' '}
            {auction.vehicleInfo.model}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className='space-y-4 py-4'
        >
          {/* Certificate Number */}
          <div className='space-y-2'>
            <label className='text-sm font-medium flex items-center gap-2'>
              <MdNumbers className='h-4 w-4 text-muted-foreground' />
              Certificate Number (optional)
            </label>
            <Input
              placeholder='e.g., EXP-2026-001234'
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
            />
          </div>

          {/* Issue & Expiry Dates */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdCalendarToday className='h-4 w-4 text-muted-foreground' />
                Issue Date
              </label>
              <Input
                type='date'
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <MdCalendarToday className='h-4 w-4 text-muted-foreground' />
                Expiry Date
              </label>
              <Input
                type='date'
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className='space-y-2'>
            <label className='text-sm font-medium flex items-center gap-2'>
              <MdChat className='h-4 w-4 text-muted-foreground' />
              Notes (optional)
            </label>
            <Textarea
              placeholder='Add any notes about this certificate...'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className='resize-none'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  if (!isSubmitting && pendingFiles.length > 0) {
                    handleSubmit()
                  }
                }
              }}
            />
            <p className='text-[10px] text-muted-foreground'>Press Ctrl+Enter to submit</p>
          </div>

          {/* File upload area */}
          <div className='space-y-2'>
            <label className='text-sm font-medium flex items-center gap-2'>
              <MdDescription className='h-4 w-4 text-muted-foreground' />
              Certificate Document
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
                  {pendingFiles.map((file, index) => {
                    const FileIcon = getFileIcon(file.type)
                    return (
                      <div
                        key={index}
                        className='flex items-center gap-3 p-2 bg-muted/50 rounded-lg'
                      >
                        <div className='h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0'>
                          <FileIcon className='h-4 w-4 text-emerald-600' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium truncate'>{file.name}</p>
                          <p className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</p>
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
                    )
                  })}
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
                  <p className='text-sm font-medium'>Click to upload certificate</p>
                  <p className='text-xs text-muted-foreground mt-1'>PDF or image files up to 10MB each</p>
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
              onClick={handleDialogClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='flex-1'
              disabled={isSubmitting || pendingFiles.length === 0}
            >
              {isSubmitting ? (
                'Uploading...'
              ) : (
                <>
                  <MdCheck className='h-4 w-4 mr-2' />
                  Upload
                  <span className='ml-2 text-[10px] opacity-50 font-mono'>↵</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
