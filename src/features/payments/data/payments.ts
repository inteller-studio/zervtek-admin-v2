import { faker } from '@faker-js/faker'

faker.seed(34567)

export interface Payment {
  id: string
  paymentId: string
  customerId: string
  customerName: string
  customerEmail: string
  type: 'auction_payment' | 'deposit' | 'shipping' | 'customs' | 'refund' | 'other'
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  paymentMethod: 'wire_transfer' | 'credit_card' | 'paypal' | 'crypto' | 'bank_check'
  referenceNumber?: string
  auctionId?: string
  invoiceId?: string
  notes?: string
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const paymentTypes: Payment['type'][] = ['auction_payment', 'deposit', 'shipping', 'customs', 'refund', 'other']
const paymentStatuses: Payment['status'][] = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']
const paymentMethods: Payment['paymentMethod'][] = ['wire_transfer', 'credit_card', 'paypal', 'crypto', 'bank_check']

export const payments: Payment[] = Array.from({ length: 150 }, (_, index) => {
  const status = faker.helpers.arrayElement(paymentStatuses)
  const type = faker.helpers.arrayElement(paymentTypes)
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  return {
    id: faker.string.uuid(),
    paymentId: `PAY-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
    customerId: faker.string.uuid(),
    customerName: `${firstName} ${lastName}`,
    customerEmail: faker.internet.email({ firstName, lastName }).toLowerCase(),
    type,
    amount: type === 'refund'
      ? -faker.number.int({ min: 500, max: 15000 })
      : faker.number.int({ min: 500, max: 50000 }),
    currency: 'USD',
    status,
    paymentMethod: faker.helpers.arrayElement(paymentMethods),
    referenceNumber: faker.helpers.maybe(() => faker.string.alphanumeric(12).toUpperCase()),
    auctionId: type === 'auction_payment' || type === 'deposit'
      ? `AUC-${faker.number.int({ min: 2020, max: 2024 })}-${String(faker.number.int({ min: 1, max: 999 })).padStart(3, '0')}`
      : undefined,
    invoiceId: faker.helpers.maybe(() => `INV-${faker.number.int({ min: 2020, max: 2024 })}-${String(faker.number.int({ min: 1, max: 999 })).padStart(3, '0')}`),
    notes: faker.helpers.maybe(() => faker.lorem.sentence()),
    processedAt: status === 'completed' || status === 'refunded' ? faker.date.recent() : undefined,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
