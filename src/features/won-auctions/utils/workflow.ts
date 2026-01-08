// Workflow Utility Helpers
// Functions for managing purchase workflow state

import {
  type PurchaseWorkflow,
  type WorkflowStages,
  type WorkflowStageStatus,
  type WorkflowTask,
  type TaskCompletion,
  type WorkflowAttachment,
  type AfterPurchaseStage,
  type TransportStage,
  type PaymentProcessingStage,
  type RepairStoredStage,
  type DocumentsReceivedStage,
  type BookingStage,
  type ShippedStage,
  type DHLDocumentsStage,
  type DocumentChecklist,
  type WorkflowStageKey,
  WORKFLOW_STAGES,
} from '../types/workflow'

// ============================================
// Default State Creators
// ============================================

/** Create a default uncompleted task */
export const createEmptyTask = (): WorkflowTask => ({
  completed: false,
})

/** Create a completed task with audit trail */
export const createCompletedTask = (
  completedBy: string,
  notes?: string
): WorkflowTask => ({
  completed: true,
  completion: {
    completedBy,
    completedAt: new Date(),
    notes,
  },
})

/** Create a default document checklist */
export const createEmptyDocumentChecklist = (): DocumentChecklist => ({
  invoice: { received: false },
  exportCertificate: { received: false },
  billOfLading: { received: false },
  insurance: { received: false },
  inspectionReport: { received: false },
  deregistrationCertificate: { received: false },
  numberPlates: { received: false },
})

/** Create default After Purchase stage */
export const createDefaultAfterPurchaseStage = (): AfterPurchaseStage => ({
  status: 'pending',
  paymentToAuctionHouse: createEmptyTask(),
})

/** Create default Transport stage */
export const createDefaultTransportStage = (): TransportStage => ({
  status: 'pending',
  yardId: null,
  transportArranged: createEmptyTask(),
  yardNotified: createEmptyTask(),
  photosRequested: createEmptyTask(),
})

/** Create default Payment Processing stage */
export const createDefaultPaymentProcessingStage = (): PaymentProcessingStage => ({
  status: 'pending',
  payments: [],
  totalReceived: 0,
})

/** Create default Repair/Stored stage */
export const createDefaultRepairStoredStage = (): RepairStoredStage => ({
  status: 'pending',
  updates: [],
  markedComplete: createEmptyTask(),
})

/** Create default Documents Received stage */
export const createDefaultDocumentsReceivedStage = (): DocumentsReceivedStage => ({
  status: 'pending',
  isRegistered: null,
  checklist: createEmptyDocumentChecklist(),
})

/** Create default Booking stage */
export const createDefaultBookingStage = (): BookingStage => ({
  status: 'pending',
  bookingRequested: createEmptyTask(),
  shippingMethod: null,
  shippingAgentId: null,
  bookingDetails: {},
  bookingStatus: 'pending',
  sentSIAndEC: createEmptyTask(),
  receivedSO: createEmptyTask(),
})

/** Create default Shipped stage */
export const createDefaultShippedStage = (): ShippedStage => ({
  status: 'pending',
  blCopy: { uploaded: false },
  blPaid: createEmptyTask(),
  blDeliveryMethod: null,
  exportDeclaration: { uploaded: false },
  recycleApplied: createEmptyTask(),
})

/** Create default DHL Documents stage */
export const createDefaultDHLDocumentsStage = (): DHLDocumentsStage => ({
  status: 'pending',
  documentsSent: createEmptyTask(),
})

/** Create a fresh workflow with all stages in default state */
export const createDefaultWorkflow = (): PurchaseWorkflow => ({
  currentStage: 1,
  stages: {
    afterPurchase: createDefaultAfterPurchaseStage(),
    transport: createDefaultTransportStage(),
    paymentProcessing: createDefaultPaymentProcessingStage(),
    repairStored: createDefaultRepairStoredStage(),
    documentsReceived: createDefaultDocumentsReceivedStage(),
    booking: createDefaultBookingStage(),
    shipped: createDefaultShippedStage(),
    dhlDocuments: createDefaultDHLDocumentsStage(),
  },
  finalized: false,
  createdAt: new Date(),
  updatedAt: new Date(),
})

// ============================================
// Stage Completion Checkers
// ============================================

/** Check if After Purchase stage is complete */
export const isAfterPurchaseComplete = (stage: AfterPurchaseStage): boolean => {
  return stage.paymentToAuctionHouse.completed
}

/** Check if Transport stage is complete */
export const isTransportComplete = (stage: TransportStage): boolean => {
  return (
    stage.yardId !== null &&
    stage.transportArranged.completed &&
    stage.yardNotified.completed &&
    stage.photosRequested.completed
  )
}

/** Check if Payment Processing stage is complete */
export const isPaymentProcessingComplete = (stage: PaymentProcessingStage): boolean => {
  // Payment processing is complete when at least one payment is recorded
  return stage.payments.length > 0
}

/** Check if Repair/Stored stage is complete */
export const isRepairStoredComplete = (stage: RepairStoredStage): boolean => {
  return stage.markedComplete.completed || stage.skipped === true
}

/** Check if Documents Received stage is complete */
export const isDocumentsReceivedComplete = (stage: DocumentsReceivedStage): boolean => {
  if (stage.isRegistered === null) return false

  if (stage.isRegistered && stage.registeredTasks) {
    return (
      stage.registeredTasks.receivedNumberPlates.completed &&
      stage.registeredTasks.deregistered.completed &&
      stage.registeredTasks.exportCertificateCreated.completed &&
      stage.registeredTasks.sentDeregistrationCopy.completed &&
      stage.registeredTasks.insuranceRefundReceived.completed
    )
  }

  if (!stage.isRegistered && stage.unregisteredTasks) {
    return stage.unregisteredTasks.exportCertificateCreated.completed
  }

  return false
}

/** Check if Booking stage is complete */
export const isBookingComplete = (stage: BookingStage): boolean => {
  return (
    stage.bookingRequested.completed &&
    stage.shippingMethod !== null &&
    stage.bookingStatus === 'confirmed' &&
    stage.sentSIAndEC.completed &&
    stage.receivedSO.completed
  )
}

/** Check if Shipped stage is complete */
export const isShippedComplete = (stage: ShippedStage): boolean => {
  return (
    stage.blCopy.uploaded &&
    stage.blPaid.completed &&
    stage.blDeliveryMethod !== null &&
    stage.exportDeclaration.uploaded &&
    stage.recycleApplied.completed
  )
}

/** Check if DHL Documents stage is complete */
export const isDHLDocumentsComplete = (stage: DHLDocumentsStage): boolean => {
  return stage.documentsSent.completed
}

/** Check if a stage is complete by stage number */
export const isStageComplete = (workflow: PurchaseWorkflow, stageNumber: number): boolean => {
  switch (stageNumber) {
    case 1:
      return isAfterPurchaseComplete(workflow.stages.afterPurchase)
    case 2:
      return isTransportComplete(workflow.stages.transport)
    case 3:
      return isPaymentProcessingComplete(workflow.stages.paymentProcessing)
    case 4:
      return isRepairStoredComplete(workflow.stages.repairStored)
    case 5:
      return isDocumentsReceivedComplete(workflow.stages.documentsReceived)
    case 6:
      return isBookingComplete(workflow.stages.booking)
    case 7:
      return isShippedComplete(workflow.stages.shipped)
    case 8:
      return isDHLDocumentsComplete(workflow.stages.dhlDocuments)
    default:
      return false
  }
}

/** Check if a stage can be accessed (all previous stages complete) */
export const canAccessStage = (workflow: PurchaseWorkflow, stageNumber: number): boolean => {
  if (stageNumber === 1) return true

  // Check all previous stages are complete
  for (let i = 1; i < stageNumber; i++) {
    if (!isStageComplete(workflow, i)) {
      return false
    }
  }
  return true
}

/** Get the furthest stage that can be accessed */
export const getMaxAccessibleStage = (workflow: PurchaseWorkflow): number => {
  for (let i = 1; i <= 8; i++) {
    if (!canAccessStage(workflow, i)) {
      return i - 1
    }
  }
  return 8
}

/** Check if all workflow stages are complete */
export const areAllStagesComplete = (workflow: PurchaseWorkflow): boolean => {
  for (let i = 1; i <= 8; i++) {
    if (!isStageComplete(workflow, i)) return false
  }
  return true
}

// ============================================
// Stage Status Helpers
// ============================================

/** Get status for a stage based on completion */
export const getStageStatus = (workflow: PurchaseWorkflow, stageNumber: number): WorkflowStageStatus => {
  const isComplete = isStageComplete(workflow, stageNumber)
  const canAccess = canAccessStage(workflow, stageNumber)
  const isCurrent = workflow.currentStage === stageNumber

  if (isComplete) return 'completed'
  if (isCurrent || canAccess) return 'in_progress'
  return 'pending'
}

/** Get stage key from stage number */
export const getStageKey = (stageNumber: number): WorkflowStageKey | null => {
  const stage = WORKFLOW_STAGES.find((s) => s.number === stageNumber)
  return stage ? (stage.key as WorkflowStageKey) : null
}

/** Get stage number from key */
export const getStageNumber = (key: WorkflowStageKey): number => {
  const stage = WORKFLOW_STAGES.find((s) => s.key === key)
  return stage?.number ?? 0
}

/** Get stage label */
export const getStageLabel = (stageNumber: number): string => {
  const stage = WORKFLOW_STAGES.find((s) => s.number === stageNumber)
  return stage?.label ?? ''
}

// ============================================
// Progress Calculation
// ============================================

/** Calculate overall workflow progress (0-100) */
export const calculateWorkflowProgress = (workflow: PurchaseWorkflow): number => {
  let completedStages = 0
  for (let i = 1; i <= 8; i++) {
    if (isStageComplete(workflow, i)) {
      completedStages++
    }
  }
  return Math.round((completedStages / 8) * 100)
}

/** Calculate progress within a specific stage */
export const calculateStageProgress = (
  workflow: PurchaseWorkflow,
  stageNumber: number
): { completed: number; total: number } => {
  switch (stageNumber) {
    case 1:
      return { completed: workflow.stages.afterPurchase.paymentToAuctionHouse.completed ? 1 : 0, total: 1 }
    case 2: {
      const t = workflow.stages.transport
      let completed = 0
      if (t.yardId) completed++
      if (t.transportArranged.completed) completed++
      if (t.yardNotified.completed) completed++
      if (t.photosRequested.completed) completed++
      return { completed, total: 4 }
    }
    case 3:
      return { completed: workflow.stages.paymentProcessing.payments.length > 0 ? 1 : 0, total: 1 }
    case 4: {
      const r = workflow.stages.repairStored
      if (r.skipped) return { completed: 1, total: 1 }
      return { completed: r.markedComplete.completed ? 1 : 0, total: 1 }
    }
    case 5: {
      const d = workflow.stages.documentsReceived
      if (d.isRegistered === null) return { completed: 0, total: 1 }
      if (d.isRegistered && d.registeredTasks) {
        let completed = 0
        if (d.registeredTasks.receivedNumberPlates.completed) completed++
        if (d.registeredTasks.deregistered.completed) completed++
        if (d.registeredTasks.exportCertificateCreated.completed) completed++
        if (d.registeredTasks.sentDeregistrationCopy.completed) completed++
        if (d.registeredTasks.insuranceRefundReceived.completed) completed++
        return { completed, total: 5 }
      }
      if (!d.isRegistered && d.unregisteredTasks) {
        return { completed: d.unregisteredTasks.exportCertificateCreated.completed ? 1 : 0, total: 1 }
      }
      return { completed: 0, total: 1 }
    }
    case 6: {
      const b = workflow.stages.booking
      let completed = 0
      if (b.bookingRequested.completed) completed++
      if (b.shippingMethod) completed++
      if (b.bookingStatus === 'confirmed') completed++
      if (b.sentSIAndEC.completed) completed++
      if (b.receivedSO.completed) completed++
      return { completed, total: 5 }
    }
    case 7: {
      const s = workflow.stages.shipped
      let completed = 0
      if (s.blCopy.uploaded) completed++
      if (s.blPaid.completed) completed++
      if (s.blDeliveryMethod) completed++
      if (s.exportDeclaration.uploaded) completed++
      if (s.recycleApplied.completed) completed++
      return { completed, total: 5 }
    }
    case 8:
      return { completed: workflow.stages.dhlDocuments.documentsSent.completed ? 1 : 0, total: 1 }
    default:
      return { completed: 0, total: 0 }
  }
}

// ============================================
// Update Helpers
// ============================================

/** Update a task completion */
export const updateTaskCompletion = (
  task: WorkflowTask,
  completed: boolean,
  completedBy?: string,
  notes?: string,
  attachments?: WorkflowAttachment[]
): WorkflowTask => {
  if (completed && completedBy) {
    return {
      completed: true,
      completion: {
        completedBy,
        completedAt: new Date(),
        notes,
        attachments,
      },
    }
  }
  return { completed: false }
}

/** Clone workflow with updates */
export const updateWorkflow = (
  workflow: PurchaseWorkflow,
  updates: Partial<PurchaseWorkflow>
): PurchaseWorkflow => ({
  ...workflow,
  ...updates,
  updatedAt: new Date(),
})

/** Update a specific stage in workflow */
export const updateWorkflowStage = <K extends keyof WorkflowStages>(
  workflow: PurchaseWorkflow,
  stageKey: K,
  updates: Partial<WorkflowStages[K]>
): PurchaseWorkflow => ({
  ...workflow,
  stages: {
    ...workflow.stages,
    [stageKey]: {
      ...workflow.stages[stageKey],
      ...updates,
    },
  },
  updatedAt: new Date(),
})

// ============================================
// Validation
// ============================================

/** Validate if workflow can proceed to next stage */
export const canProceedToNextStage = (workflow: PurchaseWorkflow): boolean => {
  if (workflow.currentStage >= 8) return false
  return isStageComplete(workflow, workflow.currentStage)
}

/** Get validation errors for a stage */
export const getStageValidationErrors = (
  workflow: PurchaseWorkflow,
  stageNumber: number
): string[] => {
  const errors: string[] = []

  switch (stageNumber) {
    case 1:
      if (!workflow.stages.afterPurchase.paymentToAuctionHouse.completed) {
        errors.push('Payment to auction house not confirmed')
      }
      break
    case 2:
      if (!workflow.stages.transport.yardId) errors.push('Yard not selected')
      if (!workflow.stages.transport.transportArranged.completed) errors.push('Transport not arranged')
      if (!workflow.stages.transport.yardNotified.completed) errors.push('Yard not notified')
      if (!workflow.stages.transport.photosRequested.completed) errors.push('Photos not requested')
      break
    case 3:
      if (workflow.stages.paymentProcessing.payments.length === 0) {
        errors.push('No payment recorded')
      }
      break
    case 4:
      if (!workflow.stages.repairStored.markedComplete.completed) {
        errors.push('Stage not marked as complete')
      }
      break
    case 5: {
      const d = workflow.stages.documentsReceived
      if (d.isRegistered === null) {
        errors.push('Vehicle registration status not set')
      } else if (d.isRegistered && d.registeredTasks) {
        if (!d.registeredTasks.receivedNumberPlates.completed) errors.push('Number plates not received')
        if (!d.registeredTasks.deregistered.completed) errors.push('Vehicle not deregistered')
        if (!d.registeredTasks.exportCertificateCreated.completed) errors.push('Export certificate not created')
        if (!d.registeredTasks.sentDeregistrationCopy.completed) errors.push('Deregistration copy not sent')
        if (!d.registeredTasks.insuranceRefundReceived.completed) errors.push('Insurance refund not received')
      } else if (!d.isRegistered && d.unregisteredTasks) {
        if (!d.unregisteredTasks.exportCertificateCreated.completed) errors.push('Export certificate not created')
      }
      break
    }
    case 6: {
      const b = workflow.stages.booking
      if (!b.bookingRequested.completed) errors.push('Booking not requested')
      if (!b.shippingMethod) errors.push('Shipping method not selected')
      if (b.bookingStatus !== 'confirmed') errors.push('Booking not confirmed')
      if (!b.sentSIAndEC.completed) errors.push('SI and EC not sent')
      if (!b.receivedSO.completed) errors.push('SO not received')
      break
    }
    case 7: {
      const s = workflow.stages.shipped
      if (!s.blCopy.uploaded) errors.push('B/L copy not uploaded')
      if (!s.blPaid.completed) errors.push('B/L not paid')
      if (!s.blDeliveryMethod) errors.push('B/L delivery method not selected')
      if (!s.exportDeclaration.uploaded) errors.push('Export declaration not uploaded')
      if (!s.recycleApplied.completed) errors.push('Recycle not applied')
      break
    }
    case 8:
      if (!workflow.stages.dhlDocuments.documentsSent.completed) {
        errors.push('Documents not sent via DHL')
      }
      break
  }

  return errors
}
