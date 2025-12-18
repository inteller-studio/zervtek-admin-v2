import { faker } from '@faker-js/faker'
import {
  type SupportTicket,
  type TicketMessage,
  type TicketWithMessages,
  type TicketCategory,
  type TicketStatus,
  type TicketPriority,
  type StaffMember,
} from './types'

// Support staff members
export const supportStaff: StaffMember[] = [
  { id: 'staff-001', name: 'Yuki Tanaka', email: 'yuki@zervtek.com', department: 'Support', isAvailable: true },
  { id: 'staff-002', name: 'Kenji Yamamoto', email: 'kenji@zervtek.com', department: 'Support', isAvailable: true },
  { id: 'staff-003', name: 'Sakura Watanabe', email: 'sakura@zervtek.com', department: 'Support', isAvailable: false },
  { id: 'staff-004', name: 'Takeshi Honda', email: 'takeshi@zervtek.com', department: 'Technical', isAvailable: true },
  { id: 'staff-005', name: 'Mika Suzuki', email: 'mika@zervtek.com', department: 'Billing', isAvailable: true },
]

// Sample customer data for tickets
const sampleCustomers = [
  { id: 'cust-001', name: 'John Smith', email: 'john.smith@email.com', phone: '+1-555-0101' },
  { id: 'cust-002', name: 'Sarah Wilson', email: 'sarah.wilson@email.com', phone: '+1-555-0102' },
  { id: 'cust-003', name: 'Michael Brown', email: 'michael.brown@email.com', phone: '+44-20-1234-5678' },
  { id: 'cust-004', name: 'Emma Davis', email: 'emma.davis@email.com', phone: '+49-30-12345678' },
  { id: 'cust-005', name: 'David Miller', email: 'david.miller@email.com', phone: '+81-3-1234-5678' },
  { id: 'cust-006', name: 'Lisa Anderson', email: 'lisa.anderson@email.com', phone: '+61-2-1234-5678' },
  { id: 'cust-007', name: 'James Taylor', email: 'james.taylor@email.com', phone: '+1-555-0107' },
  { id: 'cust-008', name: 'Jennifer Thomas', email: 'jennifer.thomas@email.com', phone: '+1-555-0108' },
]

// Sample vehicle names for related tickets
const sampleVehicles = [
  { id: 'veh-001', name: '2023 Toyota Supra RZ' },
  { id: 'veh-002', name: '2022 Nissan GT-R Nismo' },
  { id: 'veh-003', name: '2021 Honda NSX Type S' },
  { id: 'veh-004', name: '2023 Mazda RX-7 Spirit R' },
  { id: 'veh-005', name: '2022 Lexus LC 500' },
  { id: 'veh-006', name: '2023 Subaru WRX STI' },
]

// Predefined ticket subjects by category
const ticketSubjects: Record<TicketCategory, string[]> = {
  technical_issue: [
    'Unable to place bid on auction',
    'Website not loading properly',
    'Error when uploading documents',
    'Cannot access my account',
    'Mobile app crashes frequently',
  ],
  payment: [
    'Payment confirmation not received',
    'Refund request for cancelled order',
    'Issue with wire transfer',
    'Credit card declined but charged',
    'Invoice discrepancy',
  ],
  inspection: [
    'Request for additional vehicle photos',
    'Inspection report questions',
    'Request pre-purchase inspection',
    'Vehicle condition concerns',
    'Request video inspection',
  ],
  shipping: [
    'Shipping delay inquiry',
    'Change of delivery address',
    'Tracking information not updating',
    'Customs clearance question',
    'Shipping cost inquiry',
  ],
  bidding: [
    'Question about bidding process',
    'Bid not registered in system',
    'Need to increase maximum bid',
    'Auction ending time question',
    'Reserve price inquiry',
  ],
  documents: [
    'Export certificate request',
    'Missing documentation',
    'Translation of documents needed',
    'Vehicle history report request',
    'Registration documents question',
  ],
  account: [
    'Upgrade to premium account',
    'Change account information',
    'Reset password issues',
    'Verification status question',
    'Close account request',
  ],
  general: [
    'General inquiry about services',
    'Partnership opportunity',
    'Feedback and suggestions',
    'Question about fees',
    'Business hours inquiry',
  ],
}

// Sample message templates
const customerMessages = [
  'Hi, I need help with this issue. Can you please look into it?',
  'I\'ve been waiting for a response for a while now. This is urgent.',
  'Thank you for the update. I have a follow-up question.',
  'I tried the suggested solution but it didn\'t work.',
  'Could you please provide more details about this?',
  'I appreciate your help with this matter.',
  'This issue is affecting my business. Please prioritize.',
  'I\'ve attached screenshots showing the problem.',
]

const staffMessages = [
  'Thank you for contacting us. I\'m looking into this issue now.',
  'I\'ve investigated the issue and here\'s what I found.',
  'Could you please provide more details so I can assist you better?',
  'I\'ve escalated this to our technical team for further review.',
  'The issue has been resolved. Please let me know if you need anything else.',
  'I apologize for the inconvenience. Here\'s what we can do to help.',
  'I\'ve updated your account settings. Please try again.',
  'Your request has been processed successfully.',
]

const systemMessages = [
  'Ticket has been assigned to support team.',
  'Ticket priority has been updated.',
  'Ticket status changed to In Progress.',
  'Customer response received.',
  'Ticket has been escalated.',
]

// Generate a single ticket message
function generateMessage(
  ticketId: string,
  index: number,
  isFirst: boolean,
  ticket: Partial<SupportTicket>
): TicketMessage {
  const isCustomer = isFirst || faker.datatype.boolean({ probability: 0.4 })
  const isSystem = !isFirst && faker.datatype.boolean({ probability: 0.1 })

  let senderType: 'customer' | 'staff' | 'system' = 'staff'
  let senderId = ''
  let senderName = ''
  let content = ''
  let isInternal = false

  if (isSystem) {
    senderType = 'system'
    senderId = 'system'
    senderName = 'System'
    content = faker.helpers.arrayElement(systemMessages)
  } else if (isCustomer || isFirst) {
    senderType = 'customer'
    senderId = ticket.customerId || ''
    senderName = ticket.customerName || ''
    content = isFirst
      ? ticket.description || faker.helpers.arrayElement(customerMessages)
      : faker.helpers.arrayElement(customerMessages)
  } else {
    senderType = 'staff'
    const staff = faker.helpers.arrayElement(supportStaff)
    senderId = staff.id
    senderName = staff.name
    content = faker.helpers.arrayElement(staffMessages)
    isInternal = faker.datatype.boolean({ probability: 0.15 })
    if (isInternal) {
      content = `[Internal Note] ${faker.lorem.sentence()}`
    }
  }

  const baseDate = ticket.createdAt || new Date()
  const messageDate = new Date(baseDate.getTime() + index * faker.number.int({ min: 1800000, max: 86400000 }))

  return {
    id: `msg-${ticketId}-${index}`,
    ticketId,
    content,
    senderType,
    senderId,
    senderName,
    attachments: [],
    createdAt: messageDate,
    isInternal,
  }
}

// Generate tickets
function generateTickets(count: number): TicketWithMessages[] {
  const tickets: TicketWithMessages[] = []

  const categories: TicketCategory[] = [
    'technical_issue', 'payment', 'inspection', 'shipping',
    'bidding', 'documents', 'account', 'general'
  ]

  const statuses: TicketStatus[] = ['open', 'in_progress', 'awaiting_customer', 'resolved', 'closed']
  const priorities: TicketPriority[] = ['low', 'medium', 'high', 'urgent']

  for (let i = 0; i < count; i++) {
    const customer = faker.helpers.arrayElement(sampleCustomers)
    const category = faker.helpers.arrayElement(categories)
    const status = faker.helpers.weightedArrayElement([
      { value: 'open' as TicketStatus, weight: 25 },
      { value: 'in_progress' as TicketStatus, weight: 30 },
      { value: 'awaiting_customer' as TicketStatus, weight: 15 },
      { value: 'resolved' as TicketStatus, weight: 15 },
      { value: 'closed' as TicketStatus, weight: 15 },
    ])
    const priority = faker.helpers.weightedArrayElement([
      { value: 'low' as TicketPriority, weight: 20 },
      { value: 'medium' as TicketPriority, weight: 40 },
      { value: 'high' as TicketPriority, weight: 30 },
      { value: 'urgent' as TicketPriority, weight: 10 },
    ])

    const subject = faker.helpers.arrayElement(ticketSubjects[category])
    const createdAt = faker.date.recent({ days: 30 })
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() })

    const isAssigned = status !== 'open' || faker.datatype.boolean({ probability: 0.3 })
    const assignedStaff = isAssigned ? faker.helpers.arrayElement(supportStaff) : null

    const hasRelatedVehicle = ['inspection', 'bidding', 'shipping', 'documents'].includes(category)
    const relatedVehicle = hasRelatedVehicle ? faker.helpers.arrayElement(sampleVehicles) : null

    const messageCount = faker.number.int({ min: 1, max: 12 })

    const ticketId = `TKT-${String(1000 + i).padStart(6, '0')}`

    const ticketBase: SupportTicket = {
      id: faker.string.uuid(),
      ticketNumber: ticketId,
      subject,
      description: faker.lorem.paragraph(),
      category,
      status,
      priority,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      assignedTo: assignedStaff?.id,
      assignedToName: assignedStaff?.name,
      assignedAt: assignedStaff ? faker.date.between({ from: createdAt, to: updatedAt }) : undefined,
      relatedVehicleId: relatedVehicle?.id,
      relatedVehicleName: relatedVehicle?.name,
      createdAt,
      updatedAt,
      firstResponseAt: status !== 'open' ? faker.date.between({ from: createdAt, to: updatedAt }) : undefined,
      resolvedAt: ['resolved', 'closed'].includes(status) ? faker.date.between({ from: createdAt, to: updatedAt }) : undefined,
      closedAt: status === 'closed' ? updatedAt : undefined,
      messageCount,
      lastMessageAt: updatedAt,
      lastMessageBy: faker.helpers.arrayElement(['customer', 'staff']),
      tags: faker.helpers.arrayElements(
        ['vip', 'escalated', 'follow-up', 'billing', 'technical', 'new-customer'],
        faker.number.int({ min: 0, max: 2 })
      ),
    }

    // Generate messages for this ticket
    const messages: TicketMessage[] = []
    for (let j = 0; j < messageCount; j++) {
      messages.push(generateMessage(ticketBase.id, j, j === 0, ticketBase))
    }

    tickets.push({
      ...ticketBase,
      messages,
    })
  }

  // Sort by updatedAt descending
  return tickets.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

// Generate 50 tickets
export const supportTickets: TicketWithMessages[] = generateTickets(50)

// Helper function to get ticket by ID
export function getTicketById(id: string): TicketWithMessages | undefined {
  return supportTickets.find(t => t.id === id || t.ticketNumber === id)
}

// Helper function to get tickets by status
export function getTicketsByStatus(status: TicketStatus): TicketWithMessages[] {
  return supportTickets.filter(t => t.status === status)
}

// Helper function to get tickets by customer
export function getTicketsByCustomer(customerId: string): TicketWithMessages[] {
  return supportTickets.filter(t => t.customerId === customerId)
}

// Helper function to get tickets assigned to staff
export function getTicketsAssignedTo(staffId: string): TicketWithMessages[] {
  return supportTickets.filter(t => t.assignedTo === staffId)
}

// Stats for dashboard
export function getTicketStats() {
  const total = supportTickets.length
  const open = supportTickets.filter(t => t.status === 'open').length
  const inProgress = supportTickets.filter(t => t.status === 'in_progress').length
  const awaitingCustomer = supportTickets.filter(t => t.status === 'awaiting_customer').length
  const resolved = supportTickets.filter(t => t.status === 'resolved').length
  const closed = supportTickets.filter(t => t.status === 'closed').length

  const urgent = supportTickets.filter(t => t.priority === 'urgent' && !['resolved', 'closed'].includes(t.status)).length
  const high = supportTickets.filter(t => t.priority === 'high' && !['resolved', 'closed'].includes(t.status)).length

  const unassigned = supportTickets.filter(t => !t.assignedTo && !['resolved', 'closed'].includes(t.status)).length

  // Average response time (mock calculation)
  const respondedTickets = supportTickets.filter(t => t.firstResponseAt)
  const avgResponseTime = respondedTickets.length > 0
    ? respondedTickets.reduce((acc, t) => {
        const diff = t.firstResponseAt!.getTime() - t.createdAt.getTime()
        return acc + diff
      }, 0) / respondedTickets.length / (1000 * 60 * 60) // Convert to hours
    : 0

  return {
    total,
    open,
    inProgress,
    awaitingCustomer,
    resolved,
    closed,
    urgent,
    high,
    unassigned,
    avgResponseTime: Math.round(avgResponseTime * 10) / 10,
  }
}
