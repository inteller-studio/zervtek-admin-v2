import { faker } from '@faker-js/faker'
import { stockVehiclesFromSQL } from './vehicles-from-sql'
import { type PurchaseWorkflow } from '../types/workflow'

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

// Cost item for tracking our company expenses
export interface CostItem {
  id: string
  category: 'auction' | 'transport' | 'repair' | 'documents' | 'shipping' | 'customs' | 'storage' | 'other'
  description: string
  amount: number
  currency: string
  date: Date
  paidTo?: string
  invoiceRef?: string
  notes?: string
  recordedBy: string
  recordedAt: Date
}

// Our costs breakdown for a purchase
export interface OurCosts {
  items: CostItem[]
  totalCost: number
  // Pre-calculated category totals for quick access
  categoryTotals: {
    auction: number
    transport: number
    repair: number
    documents: number
    shipping: number
    customs: number
    storage: number
    other: number
  }
}

export interface Purchase {
  id: string
  auctionId: string
  // Source tracking - auction or stock vehicle
  source: 'auction' | 'stock'
  // Auction-specific fields
  auctionHouse?: string
  lotNumber?: string
  auctionDate?: Date
  // Stock-specific fields
  stockId?: string
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
  insuranceFee: number
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
  // New workflow management field
  workflow?: PurchaseWorkflow
  // Our company costs for this purchase
  ourCosts?: OurCosts
}

/** @deprecated Use Purchase instead */
export type WonAuction = Purchase

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

const generateShipment = (status: Purchase['status']): ShipmentTracking | undefined => {
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

const costCategories: CostItem['category'][] = ['auction', 'transport', 'repair', 'documents', 'shipping', 'customs', 'storage', 'other']

const costDescriptions: Record<CostItem['category'], string[]> = {
  auction: ['Auction House Fee', 'Buyer Premium', 'Processing Fee', 'Bid Registration Fee'],
  transport: ['Yard Transport', 'Inland Transport', 'Truck Delivery', 'Tow Service'],
  repair: ['Body Work', 'Engine Repair', 'Paint Job', 'Tire Replacement', 'Detailing', 'Window Repair'],
  documents: ['Export Certificate', 'Deregistration Fee', 'Translation Fee', 'Notarization', 'Inspection Fee'],
  shipping: ['Ocean Freight', 'Container Fee', 'RoRo Shipping', 'Port Handling', 'Terminal Fee'],
  customs: ['Customs Clearance', 'Import Duty', 'Customs Broker Fee', 'Inspection Fee'],
  storage: ['Yard Storage', 'Port Storage', 'Warehouse Fee'],
  other: ['Miscellaneous', 'Emergency Repair', 'Special Handling', 'Insurance Premium'],
}

const costVendors: Record<CostItem['category'], string[]> = {
  auction: ['USS Tokyo', 'HAA Kobe', 'TAA Osaka', 'JU Nagoya'],
  transport: ['Yamato Transport', 'Sagawa Express', 'Japan Logistics', 'Quick Delivery'],
  repair: ['Tokyo Auto Works', 'Precision Repairs', 'Quality Body Shop', 'Pro Mechanics'],
  documents: ['Export Agency Japan', 'Document Services Co', 'Legal Docs Ltd', 'Translation Pro'],
  shipping: ['NYK Line', 'K-Line', 'MOL', 'Evergreen'],
  customs: ['Customs Broker Japan', 'Global Clearance', 'Port Services Co'],
  storage: ['Yokohama Yard', 'Nagoya Storage', 'Osaka Depot', 'Kobe Warehouse'],
  other: ['Various', 'General Services', 'Miscellaneous Vendor'],
}

const generateOurCosts = (winningBid: number): OurCosts => {
  const items: CostItem[] = []
  const categoryTotals = {
    auction: 0,
    transport: 0,
    repair: 0,
    documents: 0,
    shipping: 0,
    customs: 0,
    storage: 0,
    other: 0,
  }

  // Always add auction fee (5-10% of winning bid)
  const auctionFee = Math.round(winningBid * faker.number.float({ min: 0.05, max: 0.10 }))
  items.push({
    id: faker.string.uuid(),
    category: 'auction',
    description: faker.helpers.arrayElement(costDescriptions.auction),
    amount: auctionFee,
    currency: 'JPY',
    date: faker.date.recent({ days: 30 }),
    paidTo: faker.helpers.arrayElement(costVendors.auction),
    invoiceRef: `INV-${faker.string.alphanumeric(8).toUpperCase()}`,
    recordedBy: 'Admin',
    recordedAt: faker.date.recent({ days: 28 }),
  })
  categoryTotals.auction += auctionFee

  // Add transport cost
  const transportCost = faker.number.int({ min: 30000, max: 80000 })
  items.push({
    id: faker.string.uuid(),
    category: 'transport',
    description: faker.helpers.arrayElement(costDescriptions.transport),
    amount: transportCost,
    currency: 'JPY',
    date: faker.date.recent({ days: 25 }),
    paidTo: faker.helpers.arrayElement(costVendors.transport),
    invoiceRef: `TRN-${faker.string.alphanumeric(6).toUpperCase()}`,
    recordedBy: 'Admin',
    recordedAt: faker.date.recent({ days: 24 }),
  })
  categoryTotals.transport += transportCost

  // Maybe add repair costs (60% chance)
  if (faker.datatype.boolean({ probability: 0.6 })) {
    const numRepairs = faker.number.int({ min: 1, max: 3 })
    for (let i = 0; i < numRepairs; i++) {
      const repairCost = faker.number.int({ min: 10000, max: 150000 })
      items.push({
        id: faker.string.uuid(),
        category: 'repair',
        description: faker.helpers.arrayElement(costDescriptions.repair),
        amount: repairCost,
        currency: 'JPY',
        date: faker.date.recent({ days: 20 }),
        paidTo: faker.helpers.arrayElement(costVendors.repair),
        invoiceRef: `REP-${faker.string.alphanumeric(6).toUpperCase()}`,
        notes: faker.helpers.maybe(() => faker.lorem.sentence()),
        recordedBy: 'Admin',
        recordedAt: faker.date.recent({ days: 19 }),
      })
      categoryTotals.repair += repairCost
    }
  }

  // Add document costs
  const docCost = faker.number.int({ min: 15000, max: 45000 })
  items.push({
    id: faker.string.uuid(),
    category: 'documents',
    description: faker.helpers.arrayElement(costDescriptions.documents),
    amount: docCost,
    currency: 'JPY',
    date: faker.date.recent({ days: 15 }),
    paidTo: faker.helpers.arrayElement(costVendors.documents),
    invoiceRef: `DOC-${faker.string.alphanumeric(6).toUpperCase()}`,
    recordedBy: 'Admin',
    recordedAt: faker.date.recent({ days: 14 }),
  })
  categoryTotals.documents += docCost

  // Add shipping cost
  const shippingCost = faker.number.int({ min: 150000, max: 450000 })
  items.push({
    id: faker.string.uuid(),
    category: 'shipping',
    description: faker.helpers.arrayElement(costDescriptions.shipping),
    amount: shippingCost,
    currency: 'JPY',
    date: faker.date.recent({ days: 10 }),
    paidTo: faker.helpers.arrayElement(costVendors.shipping),
    invoiceRef: `SHP-${faker.string.alphanumeric(6).toUpperCase()}`,
    recordedBy: 'Admin',
    recordedAt: faker.date.recent({ days: 9 }),
  })
  categoryTotals.shipping += shippingCost

  // Maybe add storage (40% chance)
  if (faker.datatype.boolean({ probability: 0.4 })) {
    const storageCost = faker.number.int({ min: 5000, max: 30000 })
    items.push({
      id: faker.string.uuid(),
      category: 'storage',
      description: faker.helpers.arrayElement(costDescriptions.storage),
      amount: storageCost,
      currency: 'JPY',
      date: faker.date.recent({ days: 18 }),
      paidTo: faker.helpers.arrayElement(costVendors.storage),
      invoiceRef: `STR-${faker.string.alphanumeric(6).toUpperCase()}`,
      recordedBy: 'Admin',
      recordedAt: faker.date.recent({ days: 17 }),
    })
    categoryTotals.storage += storageCost
  }

  const totalCost = Object.values(categoryTotals).reduce((a, b) => a + b, 0)

  return {
    items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    totalCost,
    categoryTotals,
  }
}

// Use real vehicle data from SQL
const realVehicles = stockVehiclesFromSQL.slice(0, 80)

// Auction house names
const auctionHouses = ['USS Tokyo', 'HAA Kobe', 'TAA Osaka', 'JU Nagoya', 'USS Yokohama', 'CAA Gifu', 'NAA Nagoya', 'LAA Kansai']

export const purchases: Purchase[] = realVehicles.map((vehicle, index) => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const winningBid = vehicle.stockPrice || faker.number.int({ min: 1500000, max: 12000000 })
  const shippingCost = faker.number.int({ min: 200000, max: 800000 })
  const insuranceFee = faker.number.int({ min: 100000, max: 500000 })
  const totalAmount = winningBid + shippingCost + insuranceFee
  const paymentStatus = faker.helpers.arrayElement(['pending', 'partial', 'completed'] as const)
  const paidAmount = paymentStatus === 'completed' ? totalAmount : paymentStatus === 'partial' ? Math.floor(totalAmount * 0.5) : 0
  const status = faker.helpers.arrayElement(['payment_pending', 'processing', 'documents_pending', 'shipping', 'delivered', 'completed'] as const)

  // Determine if this is an auction or stock purchase (70% auction, 30% stock)
  const source: 'auction' | 'stock' = faker.datatype.boolean({ probability: 0.7 }) ? 'auction' : 'stock'

  const auctionId = `AUC-${faker.number.int({ min: 2023, max: 2024 })}-${String(index + 1).padStart(3, '0')}`
  const stockId = `STK-${String(faker.number.int({ min: 10000, max: 99999 }))}`
  const lotNumber = `${faker.number.int({ min: 10000, max: 99999 })}`
  const auctionHouse = faker.helpers.arrayElement(auctionHouses)
  const auctionDate = faker.date.past({ years: 1 })

  const timeline: Purchase['timeline'] = {}
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
    // Source tracking
    source,
    // Auction-specific fields (only populated for auction source)
    ...(source === 'auction' ? {
      auctionHouse,
      lotNumber,
      auctionDate,
    } : {}),
    // Stock-specific fields (only populated for stock source)
    ...(source === 'stock' ? {
      stockId,
    } : {}),
    vehicleInfo: {
      make: vehicle.makeEn || vehicle.make,
      model: vehicle.modelEn || vehicle.model,
      year: vehicle.year,
      vin: faker.vehicle.vin(),
      mileage: vehicle.mileageKm || faker.number.int({ min: 10000, max: 150000 }),
      color: (vehicle.colorEn || vehicle.color || 'Unknown').trim(),
      images: vehicle.imageUrl || ['#'],
    },
    winnerId: faker.string.uuid(),
    winnerName: `${firstName} ${lastName}`,
    winnerEmail: faker.internet.email({ firstName, lastName }).toLowerCase(),
    winnerPhone: faker.phone.number({ style: 'international' }),
    winnerAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`,
    winningBid,
    totalAmount,
    shippingCost,
    insuranceFee,
    currency: 'JPY',
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
    ourCosts: generateOurCosts(winningBid),
  }
})

/** @deprecated Use purchases instead */
export const wonAuctions = purchases
