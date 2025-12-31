import { faker } from '@faker-js/faker'

faker.seed(54321)

export type LeadStatus = 'new' | 'in_progress' | 'responded' | 'closed'
export type LeadType = 'price' | 'availability' | 'shipping' | 'inspection' | 'general'

export interface Lead {
  id: string
  leadNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerId?: string
  vehicleName: string
  vehicleId?: string
  type: LeadType
  status: LeadStatus
  subject: string
  message: string
  assignedTo?: string
  assignedToName?: string
  createdAt: Date
  updatedAt: Date
  respondedAt?: Date
}

const leadTypes: LeadType[] = ['price', 'availability', 'shipping', 'inspection', 'general']
const leadStatuses: LeadStatus[] = ['new', 'in_progress', 'responded', 'closed']

const vehicles = [
  '2023 Toyota Supra GR',
  '2022 Nissan GT-R Nismo',
  '2021 Honda NSX',
  '2023 Lexus LC 500',
  '2022 Mazda RX-7 FD',
  '2023 Subaru WRX STI',
  '2022 Mitsubishi Lancer Evo X',
  '2021 Toyota GR Yaris',
  '2023 Honda Civic Type R',
  '2022 Nissan Fairlady Z',
  '2023 BMW M3 Competition',
  '2022 Mercedes-AMG GT',
  '2021 Porsche 911 GT3',
  '2023 Audi RS6 Avant',
  '2022 Ferrari F8 Tributo',
]

const salesStaff = [
  { id: 'staff-001', name: 'Mike Johnson' },
  { id: 'staff-002', name: 'Sarah Williams' },
  { id: 'staff-003', name: 'Tom Anderson' },
  { id: 'staff-004', name: 'Jessica Chen' },
]

const subjects: Record<LeadType, string[]> = {
  price: ['Price inquiry', 'Best price request', 'Discount inquiry', 'Final price confirmation'],
  availability: ['Stock availability', 'Expected arrival date', 'Vehicle availability check'],
  shipping: ['Shipping cost estimate', 'Delivery time inquiry', 'Port shipping options'],
  inspection: ['Pre-purchase inspection', 'Condition report request', 'Vehicle inspection inquiry'],
  general: ['General inquiry', 'Information request', 'Question about vehicle'],
}

export const leads: Lead[] = Array.from({ length: 45 }, (_, i) => {
  const type = faker.helpers.arrayElement(leadTypes)
  const status = faker.helpers.weightedArrayElement([
    { value: 'new' as const, weight: 4 },
    { value: 'in_progress' as const, weight: 3 },
    { value: 'responded' as const, weight: 2 },
    { value: 'closed' as const, weight: 1 },
  ])
  const createdAt = faker.date.recent({ days: 30 })
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() })
  const shouldAssign = status !== 'new' || faker.datatype.boolean({ probability: 0.3 })
  const assignedStaff = shouldAssign ? faker.helpers.arrayElement(salesStaff) : null

  return {
    id: faker.string.uuid(),
    leadNumber: `LEAD-${String(1000 + i).padStart(5, '0')}`,
    customerName: faker.person.fullName(),
    customerEmail: faker.internet.email().toLowerCase(),
    customerPhone: faker.phone.number({ style: 'international' }),
    customerId: faker.datatype.boolean({ probability: 0.7 }) ? faker.string.uuid() : undefined,
    vehicleName: faker.helpers.arrayElement(vehicles),
    vehicleId: faker.datatype.boolean({ probability: 0.8 }) ? faker.string.uuid() : undefined,
    type,
    status,
    subject: faker.helpers.arrayElement(subjects[type]),
    message: faker.lorem.paragraph(),
    assignedTo: assignedStaff?.id,
    assignedToName: assignedStaff?.name,
    createdAt,
    updatedAt,
    respondedAt: status === 'responded' || status === 'closed' ? updatedAt : undefined,
  }
}).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

export const leadTypeLabels: Record<LeadType, string> = {
  price: 'Price',
  availability: 'Availability',
  shipping: 'Shipping',
  inspection: 'Inspection',
  general: 'General',
}

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  responded: 'Responded',
  closed: 'Closed',
}

export function getLeadStats() {
  return {
    total: leads.length,
    new: leads.filter(i => i.status === 'new').length,
    inProgress: leads.filter(i => i.status === 'in_progress').length,
    responded: leads.filter(i => i.status === 'responded').length,
    closed: leads.filter(i => i.status === 'closed').length,
    unassigned: leads.filter(i => !i.assignedTo).length,
  }
}
