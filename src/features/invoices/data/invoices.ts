import { faker } from '@faker-js/faker'

faker.seed(89012)

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  customerAddress: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  items: InvoiceItem[]
  subtotal: number
  tax: number
  taxRate: number
  total: number
  currency: string
  dueDate: Date
  paidAt?: Date
  notes?: string
  paymentMethod?: string
  referenceNumber?: string
  auctionId?: string
  createdAt: Date
  updatedAt: Date
}

const itemDescriptions = [
  'Vehicle Purchase',
  'Inspection Fee',
  'Translation Service',
  'Shipping Fee',
  'Customs & Duties',
  'Documentation Fee',
  'Processing Fee',
  'Storage Fee',
  'Insurance',
  'Handling Fee',
]

export const invoices: Invoice[] = Array.from({ length: 100 }, (_, index) => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const itemCount = faker.number.int({ min: 1, max: 5 })

  const items: InvoiceItem[] = Array.from({ length: itemCount }, () => {
    const quantity = faker.number.int({ min: 1, max: 3 })
    const unitPrice = faker.number.int({ min: 100, max: 50000 })
    return {
      id: faker.string.uuid(),
      description: faker.helpers.arrayElement(itemDescriptions),
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    }
  })

  const subtotal = items.reduce((acc, item) => acc + item.total, 0)
  const taxRate = faker.helpers.arrayElement([0, 5, 10, 15])
  const tax = (subtotal * taxRate) / 100
  const total = subtotal + tax

  return {
    id: faker.string.uuid(),
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
    customerId: faker.string.uuid(),
    customerName: `${firstName} ${lastName}`,
    customerEmail: faker.internet.email({ firstName, lastName }).toLowerCase(),
    customerAddress: faker.location.streetAddress({ useFullAddress: true }),
    status: faker.helpers.arrayElement(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
    items,
    subtotal,
    tax,
    taxRate,
    total,
    currency: 'JPY',
    dueDate: faker.date.future({ years: 0.1 }),
    paidAt: faker.helpers.maybe(() => faker.date.past()),
    notes: faker.helpers.maybe(() => faker.lorem.sentence()),
    paymentMethod: faker.helpers.maybe(() =>
      faker.helpers.arrayElement(['Wire Transfer', 'Credit Card', 'PayPal', 'Bank Check'])
    ),
    referenceNumber: faker.helpers.maybe(() => faker.string.alphanumeric(10).toUpperCase()),
    auctionId: faker.helpers.maybe(() =>
      `AUC-${faker.number.int({ min: 2023, max: 2024 })}-${String(faker.number.int({ min: 1, max: 999 })).padStart(3, '0')}`
    ),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
