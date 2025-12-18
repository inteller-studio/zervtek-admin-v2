// Support Ticket Types

export type TicketStatus = 'open' | 'in_progress' | 'awaiting_customer' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketCategory =
  | 'technical_issue'
  | 'payment'
  | 'inspection'
  | 'shipping'
  | 'bidding'
  | 'documents'
  | 'account'
  | 'general'

export interface TicketAttachment {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
  uploadedAt: Date
  uploadedBy: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  content: string
  senderType: 'customer' | 'staff' | 'system'
  senderId: string
  senderName: string
  senderAvatar?: string
  attachments: TicketAttachment[]
  createdAt: Date
  isInternal: boolean // Internal notes visible only to staff
}

export interface SupportTicket {
  id: string
  ticketNumber: string // Human-readable ticket number like TKT-001234
  subject: string
  description: string
  category: TicketCategory
  status: TicketStatus
  priority: TicketPriority

  // Customer info
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAvatar?: string

  // Assignment
  assignedTo?: string
  assignedToName?: string
  assignedAt?: Date

  // Related entities
  relatedVehicleId?: string
  relatedVehicleName?: string
  relatedBidId?: string
  relatedOrderId?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
  firstResponseAt?: Date
  resolvedAt?: Date
  closedAt?: Date

  // Metrics
  messageCount: number
  lastMessageAt?: Date
  lastMessageBy?: 'customer' | 'staff'

  // Tags
  tags: string[]
}

export interface TicketWithMessages extends SupportTicket {
  messages: TicketMessage[]
}

// Category configuration for display
export const ticketCategories: Record<TicketCategory, { label: string; description: string }> = {
  technical_issue: { label: 'Technical Issue', description: 'Platform or system problems' },
  payment: { label: 'Payment', description: 'Payment-related inquiries' },
  inspection: { label: 'Inspection', description: 'Vehicle inspection requests' },
  shipping: { label: 'Shipping', description: 'Shipment and logistics' },
  bidding: { label: 'Bidding', description: 'Auction bidding issues' },
  documents: { label: 'Documents', description: 'Documentation and certificates' },
  account: { label: 'Account', description: 'Account management' },
  general: { label: 'General', description: 'General inquiries' },
}

// Status configuration for display
export const ticketStatuses: Record<TicketStatus, { label: string; color: string; description: string }> = {
  open: { label: 'Open', color: 'blue', description: 'New ticket awaiting response' },
  in_progress: { label: 'In Progress', color: 'amber', description: 'Being actively worked on' },
  awaiting_customer: { label: 'Awaiting Customer', color: 'purple', description: 'Waiting for customer reply' },
  resolved: { label: 'Resolved', color: 'emerald', description: 'Issue has been resolved' },
  closed: { label: 'Closed', color: 'zinc', description: 'Ticket closed' },
}

// Priority configuration for display
export const ticketPriorities: Record<TicketPriority, { label: string; color: string; description: string }> = {
  low: { label: 'Low', color: 'zinc', description: 'Standard priority' },
  medium: { label: 'Medium', color: 'blue', description: 'Normal priority' },
  high: { label: 'High', color: 'orange', description: 'High priority' },
  urgent: { label: 'Urgent', color: 'red', description: 'Critical, needs immediate attention' },
}

// Staff members who can be assigned tickets
export interface StaffMember {
  id: string
  name: string
  email: string
  avatar?: string
  department: string
  isAvailable: boolean
}
