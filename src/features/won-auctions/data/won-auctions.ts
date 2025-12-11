import { faker } from '@faker-js/faker'

faker.seed(67890)

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

export interface Document {
  id: string
  name: string
  type: 'invoice' | 'export_certificate' | 'bill_of_lading' | 'insurance' | 'inspection' | 'other'
  uploadedAt: Date
  uploadedBy: string
  size: number
  url: string
}

export interface ShipmentTracking {
  carrier: string
  trackingNumber: string
  status: 'preparing' | 'in_transit' | 'at_port' | 'customs_clearance' | 'delivered'
  currentLocation: string
  estimatedDelivery?: Date
  lastUpdate: Date
  events: {
    date: Date
    location: string
    status: string
    description: string
  }[]
}

export interface WonAuction {
  id: string
  auctionId: string
  vehicleInfo: {
    make: string
    model: string
    year: number
    vin: string
    mileage: number
    color: string
    images: string[]
  }
  winnerId: string
  winnerName: string
  winnerEmail: string
  winnerPhone: string
  winnerAddress?: string
  winningBid: number
  totalAmount: number
  shippingCost: number
  customsFee: number
  currency: string
  status: 'payment_pending' | 'processing' | 'documents_pending' | 'shipping' | 'delivered' | 'completed'
  paymentStatus: 'pending' | 'partial' | 'completed'
  paidAmount: number
  payments: Payment[]
  documents: Document[]
  shipment?: ShipmentTracking
  destinationPort?: string
  estimatedShippingCost?: number
  notes?: string
  timeline: {
    paymentReceived?: Date
    documentsUploaded?: Date
    shippingStarted?: Date
    delivered?: Date
    completed?: Date
  }
  auctionEndDate: Date
  createdAt: Date
  updatedAt: Date
}

const makes = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Lexus', 'Porsche']
const models: Record<string, string[]> = {
  'Toyota': ['Camry', 'Land Cruiser', 'Supra', '4Runner'],
  'Honda': ['Accord', 'NSX', 'Pilot'],
  'BMW': ['5 Series', 'X5', 'M3'],
  'Mercedes-Benz': ['E-Class', 'S-Class', 'G-Class'],
  'Audi': ['A6', 'Q7', 'RS5'],
  'Nissan': ['GT-R', 'Patrol'],
  'Lexus': ['LX', 'LC', 'RX'],
  'Porsche': ['911', 'Cayenne'],
}
const colors = ['Black', 'White', 'Silver', 'Red', 'Blue', 'Gray', 'Pearl White']
const ports = ['Los Angeles, USA', 'Hamburg, Germany', 'Dubai, UAE', 'Sydney, Australia', 'Singapore', 'London, UK', 'Tokyo, Japan']
const carriers = ['Maersk Line', 'MSC', 'CMA CGM', 'COSCO', 'Hapag-Lloyd', 'DHL', 'FedEx']
const paymentMethods = ['card', 'wire_transfer', 'bank_check', 'paypal'] as const

const generatePayments = (
  auctionId: string,
  totalAmount: number,
  paymentStatus: 'pending' | 'partial' | 'completed',
  paidAmount: number
): Payment[] => {
  if (paymentStatus === 'pending' || paidAmount === 0) {
    return []
  }

  const payments: Payment[] = []

  if (paymentStatus === 'completed') {
    // Either 1 full payment or 2 payments
    const hasMultiplePayments = faker.datatype.boolean()
    if (hasMultiplePayments) {
      const firstPayment = Math.floor(totalAmount * 0.6)
      payments.push({
        id: faker.string.uuid(),
        auctionId,
        amount: firstPayment,
        method: faker.helpers.arrayElement(paymentMethods),
        date: faker.date.recent({ days: 14 }),
        referenceNumber: `TXN-${faker.string.alphanumeric(10).toUpperCase()}`,
        notes: 'Initial deposit',
        recordedBy: 'Admin',
        recordedAt: faker.date.recent({ days: 14 }),
      })
      payments.push({
        id: faker.string.uuid(),
        auctionId,
        amount: totalAmount - firstPayment,
        method: faker.helpers.arrayElement(paymentMethods),
        date: faker.date.recent({ days: 7 }),
        referenceNumber: `TXN-${faker.string.alphanumeric(10).toUpperCase()}`,
        notes: 'Final payment',
        recordedBy: 'Admin',
        recordedAt: faker.date.recent({ days: 7 }),
      })
    } else {
      payments.push({
        id: faker.string.uuid(),
        auctionId,
        amount: totalAmount,
        method: faker.helpers.arrayElement(paymentMethods),
        date: faker.date.recent({ days: 10 }),
        referenceNumber: `TXN-${faker.string.alphanumeric(10).toUpperCase()}`,
        notes: 'Full payment',
        recordedBy: 'Admin',
        recordedAt: faker.date.recent({ days: 10 }),
      })
    }
  } else if (paymentStatus === 'partial') {
    payments.push({
      id: faker.string.uuid(),
      auctionId,
      amount: paidAmount,
      method: faker.helpers.arrayElement(paymentMethods),
      date: faker.date.recent({ days: 12 }),
      referenceNumber: `TXN-${faker.string.alphanumeric(10).toUpperCase()}`,
      notes: 'Partial payment - deposit',
      recordedBy: 'Admin',
      recordedAt: faker.date.recent({ days: 12 }),
    })
  }

  return payments
}

const generateDocuments = (hasInvoice: boolean, hasExport: boolean): Document[] => {
  const docs: Document[] = []

  if (hasInvoice) {
    docs.push({
      id: faker.string.uuid(),
      name: `Invoice_${faker.string.alphanumeric(8)}.pdf`,
      type: 'invoice',
      uploadedAt: faker.date.recent(),
      uploadedBy: 'System',
      size: faker.number.int({ min: 100000, max: 500000 }),
      url: '#',
    })
  }

  if (hasExport) {
    docs.push({
      id: faker.string.uuid(),
      name: `Export_Certificate_${faker.string.alphanumeric(6)}.pdf`,
      type: 'export_certificate',
      uploadedAt: faker.date.recent(),
      uploadedBy: 'Admin',
      size: faker.number.int({ min: 80000, max: 300000 }),
      url: '#',
    })
  }

  return docs
}

const generateShipment = (status: WonAuction['status']): ShipmentTracking | undefined => {
  if (status !== 'shipping' && status !== 'delivered' && status !== 'completed') {
    return undefined
  }

  const shipmentStatus = status === 'shipping'
    ? faker.helpers.arrayElement(['preparing', 'in_transit', 'at_port', 'customs_clearance'] as const)
    : 'delivered'

  return {
    carrier: faker.helpers.arrayElement(carriers),
    trackingNumber: faker.string.alphanumeric(12).toUpperCase(),
    status: shipmentStatus,
    currentLocation: shipmentStatus === 'in_transit'
      ? 'Pacific Ocean'
      : faker.helpers.arrayElement(ports),
    estimatedDelivery: faker.date.future(),
    lastUpdate: faker.date.recent(),
    events: [
      {
        date: faker.date.recent({ days: 3 }),
        location: 'Yokohama Port, Japan',
        status: 'Departed',
        description: 'Vessel departed from port',
      },
      {
        date: faker.date.recent({ days: 5 }),
        location: 'Yokohama Port, Japan',
        status: 'Loaded',
        description: 'Container loaded onto vessel',
      },
    ],
  }
}

export const wonAuctions: WonAuction[] = Array.from({ length: 80 }, (_, index) => {
  const make = faker.helpers.arrayElement(makes)
  const model = faker.helpers.arrayElement(models[make] || ['Model'])
  const year = faker.number.int({ min: 2018, max: 2024 })
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const winningBid = faker.number.int({ min: 15000, max: 120000 })
  const shippingCost = faker.number.int({ min: 2000, max: 8000 })
  const customsFee = faker.number.int({ min: 1000, max: 5000 })
  const totalAmount = winningBid + shippingCost + customsFee
  const paymentStatus = faker.helpers.arrayElement(['pending', 'partial', 'completed'] as const)
  const paidAmount = paymentStatus === 'completed' ? totalAmount : paymentStatus === 'partial' ? Math.floor(totalAmount * 0.5) : 0
  const status = faker.helpers.arrayElement(['payment_pending', 'processing', 'documents_pending', 'shipping', 'delivered', 'completed'] as const)

  const auctionId = `AUC-${faker.number.int({ min: 2023, max: 2024 })}-${String(index + 1).padStart(3, '0')}`

  const timeline: WonAuction['timeline'] = {}
  if (paymentStatus === 'completed' || paymentStatus === 'partial') {
    timeline.paymentReceived = faker.date.recent({ days: 10 })
  }
  if (status === 'shipping' || status === 'delivered' || status === 'completed') {
    timeline.documentsUploaded = faker.date.recent({ days: 7 })
    timeline.shippingStarted = faker.date.recent({ days: 5 })
  }
  if (status === 'delivered' || status === 'completed') {
    timeline.delivered = faker.date.recent({ days: 2 })
  }
  if (status === 'completed') {
    timeline.completed = faker.date.recent({ days: 1 })
  }

  return {
    id: faker.string.uuid(),
    auctionId,
    vehicleInfo: {
      make,
      model,
      year,
      vin: faker.vehicle.vin(),
      mileage: faker.number.int({ min: 10000, max: 150000 }),
      color: faker.helpers.arrayElement(colors),
      images: ['#'],
    },
    winnerId: faker.string.uuid(),
    winnerName: `${firstName} ${lastName}`,
    winnerEmail: faker.internet.email({ firstName, lastName }).toLowerCase(),
    winnerPhone: faker.phone.number({ style: 'international' }),
    winnerAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`,
    winningBid,
    totalAmount,
    shippingCost,
    customsFee,
    currency: 'USD',
    status,
    paymentStatus,
    paidAmount,
    payments: generatePayments(auctionId, totalAmount, paymentStatus, paidAmount),
    documents: generateDocuments(
      paymentStatus !== 'pending',
      status === 'shipping' || status === 'delivered' || status === 'completed'
    ),
    shipment: generateShipment(status),
    destinationPort: faker.helpers.arrayElement(ports),
    estimatedShippingCost: shippingCost,
    notes: faker.helpers.maybe(() => faker.lorem.sentence()),
    timeline,
    auctionEndDate: faker.date.past(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
