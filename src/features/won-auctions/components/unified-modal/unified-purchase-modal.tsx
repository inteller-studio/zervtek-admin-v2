'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { type WonAuction, type Document } from '../../data/won-auctions'
import {
  type PurchaseWorkflow,
  WORKFLOW_STAGES,
} from '../../types/workflow'
import {
  createDefaultWorkflow,
  canAccessStage,
  getStageKey,
  isStageComplete,
} from '../../utils/workflow'
import { mockYards } from '../../../yards/data/yards'
import { UnifiedModalHeader } from './unified-modal-header'
import { UnifiedModalFooter } from './unified-modal-footer'
import { OverviewPanel } from './overview/overview-panel'
import { UnifiedDocumentPanel } from './document-panel/unified-document-panel'
import { WorkflowSidebar } from '../workflow/workflow-sidebar'
import { type ModalMode } from './shared/mode-toggle'

interface UnifiedPurchaseModalProps {
  open: boolean
  onClose: () => void
  auction: WonAuction | null
  initialMode?: ModalMode
  onWorkflowUpdate: (auctionId: string, workflow: PurchaseWorkflow) => void
  onDocumentUpload: (auctionId: string, documents: Document[]) => void
  onDocumentDelete?: (auctionId: string, documentId: string) => void
  onRecordPayment?: () => void
  onUpdateShipping?: () => void
  onGenerateInvoice?: () => void
  onMarkDelivered?: (auction: WonAuction) => void
  onMarkCompleted?: (auction: WonAuction) => void
}

export function UnifiedPurchaseModal({
  open,
  onClose,
  auction,
  initialMode = 'overview',
  onWorkflowUpdate,
  onDocumentUpload,
  onDocumentDelete,
  onRecordPayment,
  onUpdateShipping,
  onGenerateInvoice,
  onMarkDelivered,
  onMarkCompleted,
}: UnifiedPurchaseModalProps) {
  // Mode state
  const [mode, setMode] = useState<ModalMode>(initialMode)

  // Workflow state for optimistic updates
  const [localWorkflow, setLocalWorkflow] = useState<PurchaseWorkflow | null>(null)

  // Active stage for workflow accordion
  const [activeStage, setActiveStage] = useState<string>('afterPurchase')

  // Document panel collapse state
  const [isDocumentPanelCollapsed, setIsDocumentPanelCollapsed] = useState(false)

  // Mock current user - in real app, get from auth context
  const currentUser = 'Admin User'

  // Initialize workflow when auction changes
  useEffect(() => {
    if (auction) {
      const workflow = auction.workflow || createDefaultWorkflow()
      setLocalWorkflow(workflow)

      // Set active stage to current stage
      const stageKey = getStageKey(workflow.currentStage)
      if (stageKey) {
        setActiveStage(stageKey)
      }
    }
  }, [auction])

  // Reset mode when modal opens with initialMode
  useEffect(() => {
    if (open) {
      setMode(initialMode)
    }
  }, [open, initialMode])

  // Handle workflow updates with optimistic UI
  const handleWorkflowUpdate = useCallback(
    (updatedWorkflow: PurchaseWorkflow) => {
      if (!auction) return

      // Optimistic update
      setLocalWorkflow(updatedWorkflow)

      // Call parent handler
      onWorkflowUpdate(auction.id, updatedWorkflow)

      // Auto-advance to next stage if current is complete
      const currentStageComplete = isStageComplete(updatedWorkflow, updatedWorkflow.currentStage)
      if (currentStageComplete && updatedWorkflow.currentStage < 8) {
        const nextStage = updatedWorkflow.currentStage + 1
        const nextStageKey = getStageKey(nextStage)

        // Update workflow with new current stage
        const advancedWorkflow = {
          ...updatedWorkflow,
          currentStage: nextStage,
          updatedAt: new Date(),
        }
        setLocalWorkflow(advancedWorkflow)
        onWorkflowUpdate(auction.id, advancedWorkflow)

        // Switch accordion to next stage
        if (nextStageKey) {
          setActiveStage(nextStageKey)
        }

        toast.success(
          `Stage ${updatedWorkflow.currentStage} completed! Moving to Stage ${nextStage}.`
        )
      }
    },
    [auction, onWorkflowUpdate]
  )

  // Handle document upload
  const handleDocumentUpload = useCallback(
    (documents: Document[]) => {
      if (!auction) return
      onDocumentUpload(auction.id, documents)
      toast.success(`${documents.length} document(s) uploaded`)
    },
    [auction, onDocumentUpload]
  )

  // Handle document delete
  const handleDocumentDelete = useCallback(
    (documentId: string) => {
      if (!auction || !onDocumentDelete) return
      onDocumentDelete(auction.id, documentId)
      toast.success('Document deleted')
    },
    [auction, onDocumentDelete]
  )

  // Handle stage click from progress indicator
  const handleStageClick = useCallback(
    (stageNumber: number) => {
      if (!localWorkflow) return

      if (canAccessStage(localWorkflow, stageNumber)) {
        const stageKey = getStageKey(stageNumber)
        if (stageKey) {
          setActiveStage(stageKey)
          // Auto-switch to workflow mode when clicking on a stage
          setMode('workflow')
        }
      } else {
        toast.error('Complete previous stages first')
      }
    },
    [localWorkflow]
  )

  // Handle mode change
  const handleModeChange = useCallback((newMode: ModalMode) => {
    setMode(newMode)
  }, [])

  if (!auction || !localWorkflow) {
    return null
  }

  // Filter active yards for workflow
  const activeYards = mockYards.filter((y) => y.status === 'active')

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side='right'
        className='w-full max-w-none sm:max-w-none md:max-w-[90vw] lg:max-w-[1400px] p-0 flex flex-col gap-0'
      >
        {/* Header */}
        <UnifiedModalHeader
          auction={auction}
          workflow={localWorkflow}
          mode={mode}
          onModeChange={handleModeChange}
          onClose={onClose}
          onStageClick={handleStageClick}
        />

        {/* Main Content - Split View */}
        <div className='flex-1 flex overflow-hidden'>
          {/* Left: Main Content (Overview or Workflow) */}
          <div
            className={
              isDocumentPanelCollapsed
                ? 'flex-1'
                : 'flex-1 w-[70%]'
            }
          >
            {mode === 'overview' ? (
              <OverviewPanel
                auction={auction}
                onRecordPayment={onRecordPayment}
                onUpdateShipping={onUpdateShipping}
                onGenerateInvoice={onGenerateInvoice}
              />
            ) : (
              <WorkflowSidebar
                auction={auction}
                workflow={localWorkflow}
                activeStage={activeStage}
                onStageChange={setActiveStage}
                onWorkflowUpdate={handleWorkflowUpdate}
                currentUser={currentUser}
                yards={activeYards}
              />
            )}
          </div>

          {/* Right: Document Panel */}
          <div
            className={
              isDocumentPanelCollapsed
                ? 'w-12 shrink-0'
                : 'w-[30%] shrink-0'
            }
          >
            <UnifiedDocumentPanel
              auction={auction}
              workflow={localWorkflow}
              isCollapsed={isDocumentPanelCollapsed}
              onToggleCollapse={() => setIsDocumentPanelCollapsed(!isDocumentPanelCollapsed)}
              onDocumentUpload={handleDocumentUpload}
              onDocumentDelete={onDocumentDelete ? handleDocumentDelete : undefined}
            />
          </div>
        </div>

        {/* Footer */}
        <UnifiedModalFooter
          auction={auction}
          workflow={localWorkflow}
          mode={mode}
          onClose={onClose}
          onRecordPayment={onRecordPayment}
          onUpdateShipping={onUpdateShipping}
          onGenerateInvoice={onGenerateInvoice}
          onMarkDelivered={onMarkDelivered ? () => onMarkDelivered(auction) : undefined}
          onMarkCompleted={onMarkCompleted ? () => onMarkCompleted(auction) : undefined}
        />
      </SheetContent>
    </Sheet>
  )
}
