// Purchase Workflow Type Definitions
// This defines the complete lifecycle of a vehicle after auction purchase

// ============================================
// Base Types
// ============================================

/** Stage status */
export type WorkflowStageStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

/** Attachment for documents/photos */
export interface WorkflowAttachment {
  id: string
  name: string
  url: string
  type: 'image' | 'document'
  size: number
  uploadedBy: string
  uploadedAt: Date
}

/** Audit trail for task completions */
export interface TaskCompletion {
  completedBy: string
  completedAt: Date
  notes?: string
  attachments?: WorkflowAttachment[]
}

/** Task with completion tracking */
export interface WorkflowTask {
  completed: boolean
  completion?: TaskCompletion
}

// ============================================
// Stage 1: After Purchase
// ============================================

export type CostType = 'tax' | 'auction_fee' | 'transport' | 'inspection' | 'storage' | 'other'

export interface CostInvoice {
  id: string
  costType: CostType
  description: string
  amount: number
  currency: string
  attachment?: WorkflowAttachment
  createdBy: string
  createdAt: Date
}

export interface AfterPurchaseStage {
  status: WorkflowStageStatus
  paymentToAuctionHouse: WorkflowTask
  paymentAmount?: number
  paymentCurrency?: string
  invoiceAttachments?: WorkflowAttachment[]
  costInvoices?: CostInvoice[]
}

export const COST_TYPES: { value: CostType; label: string }[] = [
  { value: 'tax', label: 'Tax' },
  { value: 'auction_fee', label: 'Auction Fee' },
  { value: 'transport', label: 'Transport' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'storage', label: 'Storage' },
  { value: 'other', label: 'Other' },
]

// ============================================
// Stage 2: Transport
// ============================================

export interface TransportCost {
  id: string
  taskKey: 'transportArranged' | 'photosRequested'
  description: string
  amount: number
  currency: string
  attachment?: WorkflowAttachment
  createdBy: string
  createdAt: Date
}

export interface TransportStage {
  status: WorkflowStageStatus
  yardId: string | null
  yardName?: string
  transportArranged: WorkflowTask
  transportArrangedAmount?: number
  transportArrangedCurrency?: string
  transportArrangedInvoices?: WorkflowAttachment[]
  yardNotified: WorkflowTask
  photosRequested: WorkflowTask
  photosRequestedAmount?: number
  photosRequestedCurrency?: string
  photosRequestedInvoices?: WorkflowAttachment[]
  costs?: TransportCost[]
}

// ============================================
// Stage 3: Payment Processing
// ============================================

export interface WorkflowPayment {
  id: string
  amount: number
  method: 'bank_transfer' | 'cash' | 'check' | 'paypal' | 'card' | 'other'
  referenceNumber: string
  receivedAt: Date
  recordedBy: string
  notes?: string
}

export interface PaymentProcessingStage {
  status: WorkflowStageStatus
  payments: WorkflowPayment[]
  totalReceived: number
}

// ============================================
// Stage 4: Repair/Stored
// ============================================

export type RepairUpdateType = 'comment' | 'photo' | 'invoice'

export interface RepairUpdate {
  id: string
  type: RepairUpdateType
  content: string
  attachments: WorkflowAttachment[]
  createdBy: string
  createdAt: Date
}

export interface RepairStoredStage {
  status: WorkflowStageStatus
  updates: RepairUpdate[]
  markedComplete: WorkflowTask
  skipped?: boolean
  skippedBy?: string
  skippedAt?: Date
  skipReason?: string
}

// ============================================
// Stage 5: Documents Received
// ============================================

/** Document checklist item */
export interface DocumentChecklistItem {
  received: boolean
  receivedAt?: Date
  documentId?: string
  receivedBy?: string
}

/** Full document checklist */
export interface DocumentChecklist {
  invoice: DocumentChecklistItem
  exportCertificate: DocumentChecklistItem
  billOfLading: DocumentChecklistItem
  insurance: DocumentChecklistItem
  inspectionReport: DocumentChecklistItem
  deregistrationCertificate: DocumentChecklistItem
  numberPlates: DocumentChecklistItem
  [key: string]: DocumentChecklistItem // Allow additional documents
}

/** Tasks for registered vehicles */
export interface RegisteredVehicleTasks {
  receivedNumberPlates: WorkflowTask
  deregistered: WorkflowTask
  exportCertificateCreated: WorkflowTask
  sentDeregistrationCopy: WorkflowTask
  insuranceRefundReceived: WorkflowTask
}

/** Tasks for unregistered vehicles */
export interface UnregisteredVehicleTasks {
  exportCertificateCreated: WorkflowTask
}

/** Accessories sub-items */
export interface AccessoriesSubItems {
  remotes: boolean
  shiftKnobs: boolean
  floorMats: boolean
  originalRemote: boolean
  antenna: boolean
  jackSet: boolean
  toolKit: boolean
}

/** Accessories checklist for vehicles */
export interface AccessoriesChecklist {
  spareKeys: boolean
  maintenanceRecords: boolean
  manuals: boolean
  catalogues: boolean
  accessories: boolean
  accessoriesSubItems?: AccessoriesSubItems
  others: boolean
  othersText?: string
}

export interface DocumentsReceivedStage {
  status: WorkflowStageStatus
  isRegistered: boolean | null // null = not yet determined
  checklist: DocumentChecklist
  registeredTasks?: RegisteredVehicleTasks
  unregisteredTasks?: UnregisteredVehicleTasks
  accessories?: AccessoriesChecklist
}

// ============================================
// Stage 6: Booking
// ============================================

export type ShippingMethod = 'roro' | 'container'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
export type ContainerSize = '20ft' | '40ft' | '40ft_hc'

export interface BookingDetails {
  // Common fields (RoRo & Container)
  bookingNumber?: string
  vesselName?: string
  voyageNumber?: string
  portOfLoading?: string
  portOfDischarge?: string
  etd?: Date // Estimated Time of Departure
  eta?: Date // Estimated Time of Arrival
  notes?: string
  // Container-specific fields
  containerNumber?: string
  containerSize?: ContainerSize
  sealNumber?: string
  cfsLocation?: string // Container Freight Station
  stuffingDate?: Date // When vehicle is loaded into container
  unitsPerContainer?: number // Number of vehicles in container
}

export const CONTAINER_SIZES = [
  { value: '20ft', label: '20ft' },
  { value: '40ft', label: '40ft' },
  { value: '40ft_hc', label: '40ft HC (High Cube)' },
] as const

export interface BookingStage {
  status: WorkflowStageStatus
  bookingRequested: WorkflowTask
  shippingMethod: ShippingMethod | null
  shippingAgentId: string | null
  shippingAgentName?: string
  bookingDetails: BookingDetails
  bookingStatus: BookingStatus
  sentSIAndEC: WorkflowTask // SI = Shipping Instructions, EC = Export Certificate
  receivedSO: WorkflowTask // SO = Shipping Order
}

// ============================================
// Stage 7: Shipped
// ============================================

export type BLDeliveryMethod = 'released' | 'original_dhl'

export interface ShippedStage {
  status: WorkflowStageStatus
  blCopy: {
    uploaded: boolean
    documentId?: string
    uploadedAt?: Date
  }
  blPaid: WorkflowTask
  blDeliveryMethod: BLDeliveryMethod | null
  exportDeclaration: {
    uploaded: boolean
    documentId?: string
    uploadedAt?: Date
  }
  recycleApplied: WorkflowTask
}

// ============================================
// Stage 8: DHL Documents
// ============================================

export interface DHLDocumentsStage {
  status: WorkflowStageStatus
  documentsSent: WorkflowTask
  trackingNumber?: string
  sentAt?: Date
  documentsIncluded?: string[] // List of document names sent
}

// ============================================
// Complete Workflow
// ============================================

export interface WorkflowStages {
  afterPurchase: AfterPurchaseStage
  transport: TransportStage
  paymentProcessing: PaymentProcessingStage
  repairStored: RepairStoredStage
  documentsReceived: DocumentsReceivedStage
  booking: BookingStage
  shipped: ShippedStage
  dhlDocuments: DHLDocumentsStage
}

export interface PurchaseWorkflow {
  currentStage: number // 1-8
  stages: WorkflowStages
  finalized: boolean
  finalizedAt?: Date
  finalizedBy?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Stage Configuration
// ============================================

export const WORKFLOW_STAGES = [
  { number: 1, key: 'afterPurchase', label: 'After Purchase', shortLabel: 'Purchase' },
  { number: 2, key: 'transport', label: 'Transport', shortLabel: 'Transport' },
  { number: 3, key: 'paymentProcessing', label: 'Payment Processing', shortLabel: 'Payment' },
  { number: 4, key: 'repairStored', label: 'Repair/Stored', shortLabel: 'Repair' },
  { number: 5, key: 'documentsReceived', label: 'Documents Received', shortLabel: 'Documents' },
  { number: 6, key: 'booking', label: 'Booking', shortLabel: 'Booking' },
  { number: 7, key: 'shipped', label: 'Shipped', shortLabel: 'Shipped' },
  { number: 8, key: 'dhlDocuments', label: 'DHL Documents', shortLabel: 'DHL' },
] as const

export type WorkflowStageKey = keyof WorkflowStages

export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'other', label: 'Other' },
] as const

export const SHIPPING_METHODS = [
  { value: 'roro', label: 'Roll on Roll off (RoRo)' },
  { value: 'container', label: 'Container' },
] as const

export const BL_DELIVERY_METHODS = [
  { value: 'released', label: 'Released (Telex)' },
  { value: 'original_dhl', label: 'Original sent via DHL' },
] as const

export const DOCUMENT_TYPES = [
  { key: 'invoice', label: 'Invoice' },
  { key: 'exportCertificate', label: 'Export Certificate' },
  { key: 'billOfLading', label: 'Bill of Lading' },
  { key: 'insurance', label: 'Insurance Certificate' },
  { key: 'inspectionReport', label: 'Inspection Report' },
  { key: 'deregistrationCertificate', label: 'Deregistration Certificate' },
  { key: 'numberPlates', label: 'Number Plates' },
] as const
