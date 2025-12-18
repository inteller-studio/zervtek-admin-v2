'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Wrench, Plus, MessageSquare, Image, FileText, Check } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { type WonAuction } from '../../../data/won-auctions'
import {
  type PurchaseWorkflow,
  type RepairUpdate,
  type RepairUpdateType,
} from '../../../types/workflow'
import { updateWorkflowStage, updateTaskCompletion } from '../../../utils/workflow'
import { WorkflowCheckbox } from '../shared/workflow-checkbox'
import { WorkflowFileUpload } from '../shared/workflow-file-upload'

interface RepairStoredStageProps {
  auction: WonAuction
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
}

const UPDATE_TYPES: { value: RepairUpdateType; label: string; icon: typeof MessageSquare }[] = [
  { value: 'comment', label: 'Comment', icon: MessageSquare },
  { value: 'photo', label: 'Photo', icon: Image },
  { value: 'invoice', label: 'Invoice', icon: FileText },
]

export function RepairStoredStage({
  auction,
  workflow,
  onWorkflowUpdate,
  currentUser,
}: RepairStoredStageProps) {
  const stage = workflow.stages.repairStored
  const [dialogOpen, setDialogOpen] = useState(false)
  const [updateType, setUpdateType] = useState<RepairUpdateType>('comment')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<{ id: string; name: string; size: number; type: string; file: File }[]>([])

  const handleAddUpdate = () => {
    if (!content.trim() && files.length === 0) return

    const update: RepairUpdate = {
      id: crypto.randomUUID(),
      type: updateType,
      content: content.trim(),
      attachments: files.map((f) => ({
        id: f.id,
        name: f.name,
        url: URL.createObjectURL(f.file),
        type: f.type.startsWith('image/') ? 'image' : 'document',
        size: f.size,
        uploadedBy: currentUser,
        uploadedAt: new Date(),
      })),
      createdBy: currentUser,
      createdAt: new Date(),
    }

    const updatedStage = {
      ...stage,
      updates: [...stage.updates, update],
      status: 'in_progress' as const,
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'repairStored', updatedStage))
    setDialogOpen(false)
    setContent('')
    setFiles([])
    setUpdateType('comment')
  }

  const handleMarkComplete = (checked: boolean, notes?: string) => {
    const updatedStage = {
      ...stage,
      markedComplete: updateTaskCompletion(stage.markedComplete, checked, currentUser, notes),
      status: checked ? ('completed' as const) : ('in_progress' as const),
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'repairStored', updatedStage))
  }

  const getUpdateIcon = (type: RepairUpdateType) => {
    const updateType = UPDATE_TYPES.find((t) => t.value === type)
    return updateType?.icon || MessageSquare
  }

  return (
    <div className='space-y-4'>
      {/* Info Alert */}
      <Alert>
        <Wrench className='h-4 w-4' />
        <AlertDescription>
          Add comments, photos, or invoices related to repairs or storage of the vehicle.
        </AlertDescription>
      </Alert>

      {/* Add Update Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant='outline' className='w-full'>
            <Plus className='h-4 w-4 mr-2' />
            Add Update
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Add Repair/Storage Update</DialogTitle>
            <DialogDescription>
              Record comments, photos, or invoices for this vehicle.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>Update Type</Label>
              <Select
                value={updateType}
                onValueChange={(value) => setUpdateType(value as RepairUpdateType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UPDATE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className='flex items-center gap-2'>
                        <type.icon className='h-4 w-4' />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Description</Label>
              <Textarea
                placeholder='Enter details about the update...'
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
            </div>
            {(updateType === 'photo' || updateType === 'invoice') && (
              <div className='space-y-2'>
                <Label>Attachments</Label>
                <WorkflowFileUpload
                  onFilesSelected={setFiles}
                  accept={updateType === 'photo' ? '.png,.jpg,.jpeg,.webp' : '.pdf,.doc,.docx,.png,.jpg'}
                  maxFiles={5}
                  maxSize={10 * 1024 * 1024}
                  label={`Drop ${updateType === 'photo' ? 'photos' : 'files'} here`}
                  description={updateType === 'photo' ? 'PNG, JPG up to 10MB' : 'PDF, DOC, images up to 10MB'}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddUpdate}
              disabled={!content.trim() && files.length === 0}
            >
              Add Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Updates Timeline */}
      <div className='space-y-2'>
        <Label className='text-sm font-medium'>Updates Timeline</Label>
        {stage.updates.length === 0 ? (
          <div className='text-center py-6 border rounded-lg bg-muted/30'>
            <Wrench className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
            <p className='text-sm text-muted-foreground'>No updates recorded yet</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {stage.updates.map((update, index) => {
              const Icon = getUpdateIcon(update.type)
              return (
                <div
                  key={update.id}
                  className={cn(
                    'relative pl-6 pb-3',
                    index !== stage.updates.length - 1 && 'border-l-2 border-muted ml-2'
                  )}
                >
                  <div className='absolute left-0 -translate-x-1/2 bg-background p-1'>
                    <div
                      className={cn(
                        'h-6 w-6 rounded-full flex items-center justify-center',
                        update.type === 'comment' && 'bg-blue-100 text-blue-600',
                        update.type === 'photo' && 'bg-purple-100 text-purple-600',
                        update.type === 'invoice' && 'bg-amber-100 text-amber-600'
                      )}
                    >
                      <Icon className='h-3.5 w-3.5' />
                    </div>
                  </div>
                  <div className='bg-muted/30 rounded-lg p-3 ml-2'>
                    <div className='flex items-center justify-between mb-1'>
                      <Badge variant='outline' className='text-xs'>
                        {UPDATE_TYPES.find((t) => t.value === update.type)?.label}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        {format(new Date(update.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    {update.content && (
                      <p className='text-sm mt-1'>{update.content}</p>
                    )}
                    {update.attachments.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-2'>
                        {update.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-xs text-primary hover:underline flex items-center gap-1'
                          >
                            {att.type === 'image' ? (
                              <Image className='h-3 w-3' />
                            ) : (
                              <FileText className='h-3 w-3' />
                            )}
                            {att.name}
                          </a>
                        ))}
                      </div>
                    )}
                    <p className='text-xs text-muted-foreground mt-1'>
                      By {update.createdBy}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mark Complete Checkbox */}
      <div className='border rounded-lg'>
        <WorkflowCheckbox
          id='repair-complete'
          label='Mark Repair/Storage Stage Complete'
          description='Confirm that all repair work and storage documentation is complete'
          checked={stage.markedComplete.completed}
          completion={stage.markedComplete.completion}
          onCheckedChange={handleMarkComplete}
          showNoteOnComplete
          className='px-3'
        />
      </div>
    </div>
  )
}
