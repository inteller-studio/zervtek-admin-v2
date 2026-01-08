import { type Document } from '../data/won-auctions'

// Type without null for the hook, the hook manages null internally
export type PurchasesDialogTypeBase =
  | 'purchase' // Unified modal (replaces 'detail' and 'workflow')
  | 'documents'
  | 'document-upload'
  | 'shipping'
  | 'payment'
  | 'invoice'
  | 'export-certificate'

export type PurchasesDialogType = PurchasesDialogTypeBase | null

/** @deprecated Use PurchasesDialogTypeBase instead */
export type WonAuctionsDialogTypeBase = PurchasesDialogTypeBase
/** @deprecated Use PurchasesDialogType instead */
export type WonAuctionsDialogType = PurchasesDialogType

// Initial mode for the unified purchase modal
export type PurchaseModalMode = 'overview' | 'workflow'

export type SortOption =
  | 'date-newest'
  | 'date-oldest'
  | 'value-high'
  | 'value-low'
  | 'payment-progress'

export type ViewMode = 'card' | 'table'

export interface Payment {
  id: string
  auctionId: string
  amount: number
  method: 'card' | 'wire_transfer' | 'bank_check' | 'paypal'
  date: Date
  referenceNumber: string
  notes?: string
  recordedBy: string
  recordedAt: Date
}

export interface DocumentStatus {
  type: Document['type']
  status: 'pending' | 'received' | 'approved' | 'rejected'
  required: boolean
  uploadedAt?: Date
  approvedAt?: Date
}

export interface FilterState {
  search: string
  status: string
  paymentStatus: string
  dateRange: { from?: Date; to?: Date }
  valueRange: { min?: number; max?: number }
  destinationPort: string[]
  vinSearch: string
}

export const PAYMENT_METHODS = [
  { label: 'Credit/Debit Card', value: 'card' as const },
  { label: 'Wire Transfer', value: 'wire_transfer' as const },
  { label: 'Bank Check', value: 'bank_check' as const },
  { label: 'PayPal', value: 'paypal' as const },
]

export const SORT_OPTIONS = [
  { label: 'Date: Newest First', value: 'date-newest' as const },
  { label: 'Date: Oldest First', value: 'date-oldest' as const },
  { label: 'Value: High to Low', value: 'value-high' as const },
  { label: 'Value: Low to High', value: 'value-low' as const },
  { label: 'Payment Progress', value: 'payment-progress' as const },
]

export const ITEMS_PER_PAGE_OPTIONS = [20, 40, 60, 100]

export const DOCUMENT_TYPE_LABELS: Record<Document['type'], string> = {
  invoice: 'Invoice',
  export_certificate: 'Export Certificate',
  bill_of_lading: 'Bill of Lading',
  insurance: 'Insurance Certificate',
  inspection: 'Inspection Report',
  other: 'Other Documents',
}
