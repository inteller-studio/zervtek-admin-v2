'use client'

import { useState } from 'react'
import { MdSend, MdInventory2, MdCheck, MdOpenInNew } from 'react-icons/md'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { type Purchase } from '../../../data/won-auctions'
import { type PurchaseWorkflow } from '../../../types/workflow'
import { updateWorkflowStage, updateTaskCompletion } from '../../../utils/workflow'
import { WorkflowCheckbox } from '../shared/workflow-checkbox'

interface DHLDocumentsStageProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
}

const STANDARD_DOCUMENTS = [
  { id: 'bl_original', label: 'Original Bill of Lading' },
  { id: 'export_cert', label: 'Export Certificate' },
  { id: 'invoice', label: 'Commercial Invoice' },
  { id: 'inspection', label: 'Inspection Report' },
  { id: 'deregistration', label: 'Deregistration Certificate' },
]

export function DHLDocumentsStage({
  auction,
  workflow,
  onWorkflowUpdate,
  currentUser,
}: DHLDocumentsStageProps) {
  const stage = workflow.stages.dhlDocuments
  const [dialogOpen, setDialogOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState(stage.trackingNumber || '')
  const [selectedDocs, setSelectedDocs] = useState<string[]>(stage.documentsIncluded || [])

  const handleSendDocuments = () => {
    if (!trackingNumber.trim()) return

    const updatedStage = {
      ...stage,
      documentsSent: updateTaskCompletion(
        { completed: false },
        true,
        currentUser,
        `Tracking: ${trackingNumber}`
      ),
      trackingNumber: trackingNumber.trim(),
      sentAt: new Date(),
      documentsIncluded: selectedDocs,
      status: 'completed' as const,
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'dhlDocuments', updatedStage))
    setDialogOpen(false)
  }

  const handleDocToggle = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((d) => d !== docId) : [...prev, docId]
    )
  }

  const getDocLabel = (docId: string) => {
    return STANDARD_DOCUMENTS.find((d) => d.id === docId)?.label || docId
  }

  return (
    <div className='space-y-4'>
      {/* Info Alert */}
      <Alert>
        <MdSend className='h-4 w-4' />
        <AlertDescription>
          Send the final documents to the customer via DHL. This is the last step in the workflow.
        </AlertDescription>
      </Alert>

      {/* Status Card */}
      {stage.documentsSent.completed ? (
        <div className='rounded-lg border bg-emerald-50/50 dark:bg-emerald-900/10 p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center'>
              <MdCheck className='h-5 w-5 text-white' />
            </div>
            <div>
              <h4 className='font-medium text-emerald-700 dark:text-emerald-400'>
                Documents Sent via DHL
              </h4>
              <p className='text-xs text-muted-foreground'>
                {stage.sentAt &&
                  new Date(stage.sentAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
              </p>
            </div>
          </div>

          {/* Tracking Number */}
          {stage.trackingNumber && (
            <div className='rounded-md bg-background p-3 mb-3'>
              <Label className='text-xs text-muted-foreground'>DHL Tracking Number</Label>
              <div className='flex items-center gap-2 mt-1'>
                <code className='text-sm font-mono bg-muted px-2 py-1 rounded'>
                  {stage.trackingNumber}
                </code>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 text-xs'
                  onClick={() =>
                    window.open(
                      `https://www.dhl.com/en/express/tracking.html?AWB=${stage.trackingNumber}`,
                      '_blank'
                    )
                  }
                >
                  <MdOpenInNew className='h-3 w-3 mr-1' />
                  Track
                </Button>
              </div>
            </div>
          )}

          {/* Documents Included */}
          {stage.documentsIncluded && stage.documentsIncluded.length > 0 && (
            <div>
              <Label className='text-xs text-muted-foreground'>Documents Included</Label>
              <div className='flex flex-wrap gap-1.5 mt-1'>
                {stage.documentsIncluded.map((docId) => (
                  <Badge key={docId} variant='secondary' className='text-xs'>
                    {getDocLabel(docId)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Completion Info */}
          {stage.documentsSent.completion && (
            <p className='text-xs text-muted-foreground mt-3 pt-3 border-t'>
              Completed by {stage.documentsSent.completion.completedBy}
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Send Documents Card */}
          <div className='rounded-lg border p-4 bg-muted/30'>
            <div className='flex items-center gap-3 mb-3'>
              <MdInventory2 className='h-8 w-8 text-muted-foreground' />
              <div>
                <h4 className='font-medium'>Ready to Send Documents</h4>
                <p className='text-sm text-muted-foreground'>
                  Prepare and send final documents via DHL
                </p>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className='w-full'>
                  <MdSend className='h-4 w-4 mr-2' />
                  Send Documents via DHL
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Documents via DHL</DialogTitle>
                  <DialogDescription>
                    Enter the DHL tracking number and select the documents being sent.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <Label>DHL Tracking Number</Label>
                    <Input
                      placeholder='Enter tracking number'
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Documents Included</Label>
                    <div className='space-y-2 rounded-lg border p-3'>
                      {STANDARD_DOCUMENTS.map((doc) => (
                        <div key={doc.id} className='flex items-center gap-2'>
                          <Checkbox
                            id={doc.id}
                            checked={selectedDocs.includes(doc.id)}
                            onCheckedChange={() => handleDocToggle(doc.id)}
                          />
                          <label
                            htmlFor={doc.id}
                            className='text-sm cursor-pointer'
                          >
                            {doc.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant='outline' onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendDocuments}
                    disabled={!trackingNumber.trim()}
                  >
                    <MdSend className='h-4 w-4 mr-2' />
                    Confirm Sent
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Documents Checklist */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Documents to Include</Label>
            <div className='rounded-lg border divide-y'>
              {STANDARD_DOCUMENTS.map((doc) => (
                <div
                  key={doc.id}
                  className='flex items-center justify-between px-3 py-2'
                >
                  <span className='text-sm'>{doc.label}</span>
                  <Badge variant='outline' className='text-xs'>
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Final Message */}
      {stage.documentsSent.completed && (
        <Alert className='bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'>
          <MdCheck className='h-4 w-4 text-emerald-600' />
          <AlertDescription className='text-emerald-700 dark:text-emerald-400'>
            <strong>Workflow Complete!</strong> All documents have been sent to the customer.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
