import { faker } from '@faker-js/faker'

faker.seed(23456)

export type UserLevel = 'unverified' | 'verified' | 'premium' | 'business' | 'business_premium'
export type CustomerStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'banned'
export type RiskLevel = 'low' | 'medium' | 'high'
export type BusinessType = 'dealer' | 'exporter' | 'retailer' | 'wholesaler' | 'individual'

// Business profile for business accounts
export interface BusinessProfile {
  registrationNumber?: string
  vatNumber?: string
  businessType: BusinessType
  yearEstablished?: number
  purchaseFrequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  website?: string
}

// Saved address
export interface SavedAddress {
  id: string
  label: string // 'Home', 'Office', 'Warehouse'
  type: 'shipping' | 'billing'
  isDefault: boolean
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

// Saved payment method
export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_transfer' | 'crypto'
  isDefault: boolean
  // Card details
  cardBrand?: 'visa' | 'mastercard' | 'amex' | 'jcb'
  cardLast4?: string
  cardExpiry?: string
  // Bank details
  bankName?: string
  accountLast4?: string
  // General
  createdAt: Date
}

// Active session
export interface ActiveSession {
  id: string
  device: string
  browser: string
  ipAddress: string
  location: string
  lastActive: Date
  isCurrent: boolean
}

// Verification document
export interface VerificationDocument {
  id: string
  type: 'passport' | 'drivers_license' | 'national_id' | 'proof_of_address' | 'business_license' | 'bank_statement'
  fileName: string
  uploadedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  country: string
  city: string
  address: string
  company?: string
  status: CustomerStatus
  totalPurchases: number
  totalSpent: number
  totalBids: number
  wonAuctions: number
  lostAuctions: number
  activeBids: number
  verificationStatus: 'verified' | 'pending' | 'unverified' | 'documents_requested'
  depositAmount: number
  outstandingBalance: number
  userLevel: UserLevel
  preferredLanguage: string
  notes?: string
  tags: string[]
  assignedTo?: string
  assignedToName?: string
  createdAt: Date
  lastActivity: Date
  lastPurchase?: Date

  // Account management fields
  suspendedAt?: Date
  suspendedUntil?: Date
  suspensionReason?: string
  bannedAt?: Date
  banReason?: string

  // Login tracking fields
  lastLoginAt?: Date
  lastLoginIp?: string
  loginCount: number
  failedLoginAttempts: number

  // Risk assessment
  riskLevel: RiskLevel

  // Business profile (for business accounts)
  businessProfile?: BusinessProfile

  // Saved addresses and payment methods
  savedAddresses: SavedAddress[]
  paymentMethods: PaymentMethod[]

  // Security
  twoFactorEnabled: boolean
  activeSessions: ActiveSession[]

  // Verification documents
  verificationDocuments: VerificationDocument[]
}

// Login history entry
export interface LoginEntry {
  id: string
  customerId: string
  timestamp: Date
  ipAddress: string
  location: string
  device: string
  browser: string
  status: 'success' | 'failed' | 'blocked'
  sessionDuration?: string
  failureReason?: string
}

// Activity log entry
export interface ActivityEntry {
  id: string
  customerId: string
  timestamp: Date
  type: 'bid' | 'purchase' | 'payment' | 'message' | 'document' | 'login' | 'profile_update' | 'verification' | 'suspension' | 'level_change'
  description: string
  metadata?: {
    amount?: number
    vehicle?: string
    invoiceId?: string
    bidId?: string
    oldValue?: string
    newValue?: string
  }
  performedBy?: string
}

// Purchase history entry
export interface PurchaseEntry {
  id: string
  customerId: string
  invoiceNumber: string
  vehicle: {
    make: string
    model: string
    year: number
    chassisNumber: string
    color: string
    mileage: number
    imageUrl?: string
  }
  auctionDate: Date
  purchaseDate: Date
  bidAmount: number
  finalPrice: number
  fees: {
    auctionFee: number
    shippingFee: number
    inspectionFee: number
    documentFee: number
    otherFees: number
  }
  totalAmount: number
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue'
  amountPaid: number
  amountDue: number
  deliveryStatus: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'customs' | 'delivered'
  shipmentId?: string
  createdAt: Date
}

// Bid history entry
export interface BidHistoryEntry {
  id: string
  customerId: string
  bidNumber: string
  vehicle: {
    make: string
    model: string
    year: number
    chassisNumber: string
    lotNumber: string
    imageUrl?: string
  }
  auctionHouse: string
  auctionDate: Date
  bidTimestamp: Date
  bidAmount: number
  maxBidLimit: number
  outcome: 'won' | 'lost' | 'cancelled' | 'pending'
  winningAmount?: number
  competitorBids?: number
  notes?: string
}

// Shipment entry
export interface ShipmentEntry {
  id: string
  customerId: string
  containerNumber: string
  bookingNumber: string
  shippingLine: string
  vehicles: {
    chassisNumber: string
    make: string
    model: string
    invoiceNumber: string
  }[]
  origin: {
    port: string
    country: string
    departureDate: Date
  }
  destination: {
    port: string
    country: string
    eta: Date
    ata?: Date
  }
  status: 'booked' | 'loaded' | 'departed' | 'in_transit' | 'arrived' | 'customs_clearance' | 'delivered'
  trackingUrl?: string
  documents: {
    type: 'bl' | 'invoice' | 'packing_list' | 'certificate_of_origin'
    fileName: string
    uploadedAt: Date
  }[]
  createdAt: Date
}

// Communication entry
export interface CommunicationEntry {
  id: string
  customerId: string
  type: 'email_sent' | 'email_received' | 'whatsapp_sent' | 'whatsapp_received' | 'call_outgoing' | 'call_incoming' | 'sms_sent' | 'sms_received'
  subject?: string
  message?: string
  duration?: string // For calls
  staffMember: string
  timestamp: Date
  attachments?: string[]
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'missed' | 'answered'
}

const countries = [
  { name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'] },
  { name: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'] },
  { name: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'] },
  { name: 'Japan', cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo'] },
  { name: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'] },
  { name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
  { name: 'France', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'] },
  { name: 'Italy', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'] },
  { name: 'Spain', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'] },
  { name: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'] },
  { name: 'United Arab Emirates', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'] },
  { name: 'Singapore', cities: ['Singapore'] },
  { name: 'South Korea', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu'] },
  { name: 'China', cities: ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Hong Kong'] },
  { name: 'Russia', cities: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg'] },
]

const languages = ['English', 'Japanese', 'German', 'French', 'Spanish', 'Chinese', 'Korean', 'Arabic', 'Russian', 'Italian']
const tags = ['VIP Client', 'Repeat Buyer', 'High Volume', 'New Customer', 'Preferred', 'Wholesale', 'Dealer', 'Collector', 'First-Time', 'International']
const companies = ['Auto Imports LLC', 'Premium Cars Inc', 'Global Motors', 'Elite Vehicles', 'Car Enthusiasts Co', 'Luxury Auto Group', 'Speed Imports', 'Classic Cars Ltd', '']

// Sales staff / account managers
const salesStaff = [
  { id: 'staff-001', name: 'Mike Johnson' },
  { id: 'staff-002', name: 'Sarah Williams' },
  { id: 'staff-003', name: 'Tom Anderson' },
  { id: 'staff-004', name: 'Jessica Chen' },
  { id: 'staff-005', name: 'Kevin Miller' },
  { id: 'staff-006', name: 'Emily Davis' },
  { id: 'staff-007', name: 'David Wilson' },
  { id: 'staff-008', name: 'Rachel Brown' },
]

const getUserLevel = (totalSpent: number): UserLevel => {
  if (totalSpent >= 500000) return 'business_premium'
  if (totalSpent >= 300000) return 'business'
  if (totalSpent >= 150000) return 'premium'
  if (totalSpent >= 50000) return 'verified'
  return 'unverified'
}

// Device and browser options for login history
const devices = ['Windows PC', 'MacBook Pro', 'iPhone 15', 'Samsung Galaxy S24', 'iPad Pro', 'Android Tablet', 'Linux Desktop']
const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera', 'Mobile Safari', 'Samsung Internet']
const suspensionReasons = ['Payment Issues', 'Suspicious Activity', 'Document Verification Required', 'Customer Request', 'Policy Violation']
const banReasons = ['Fraud', 'Repeated Policy Violations', 'Chargebacks', 'Identity Theft']
const businessTypes: BusinessType[] = ['dealer', 'exporter', 'retailer', 'wholesaler', 'individual']
const cardBrands: PaymentMethod['cardBrand'][] = ['visa', 'mastercard', 'amex', 'jcb']
const bankNames = ['MUFG Bank', 'Mizuho Bank', 'SMBC', 'Chase', 'HSBC', 'Barclays', 'Deutsche Bank']
const documentTypes: VerificationDocument['type'][] = ['passport', 'drivers_license', 'national_id', 'proof_of_address', 'business_license', 'bank_statement']

// Generate saved addresses for a customer
function generateSavedAddresses(countryData: typeof countries[0]): SavedAddress[] {
  const count = faker.number.int({ min: 1, max: 3 })
  const labels = ['Home', 'Office', 'Warehouse', 'Branch Office']
  return Array.from({ length: count }, (_, i) => ({
    id: faker.string.uuid(),
    label: labels[i] || 'Address',
    type: i === 0 ? 'shipping' as const : faker.helpers.arrayElement(['shipping', 'billing'] as const),
    isDefault: i === 0,
    recipientName: faker.person.fullName(),
    phone: faker.phone.number({ style: 'international' }),
    addressLine1: faker.location.streetAddress(),
    addressLine2: faker.helpers.maybe(() => faker.location.secondaryAddress()),
    city: faker.helpers.arrayElement(countryData.cities),
    state: faker.location.state(),
    postalCode: faker.location.zipCode(),
    country: countryData.name,
  }))
}

// Generate payment methods for a customer
function generatePaymentMethods(): PaymentMethod[] {
  const count = faker.number.int({ min: 0, max: 3 })
  return Array.from({ length: count }, (_, i) => {
    const type = faker.helpers.weightedArrayElement([
      { value: 'card' as const, weight: 60 },
      { value: 'bank_transfer' as const, weight: 35 },
      { value: 'crypto' as const, weight: 5 },
    ])
    return {
      id: faker.string.uuid(),
      type,
      isDefault: i === 0,
      cardBrand: type === 'card' ? faker.helpers.arrayElement(cardBrands) : undefined,
      cardLast4: type === 'card' ? faker.finance.creditCardNumber().slice(-4) : undefined,
      cardExpiry: type === 'card' ? `${faker.number.int({ min: 1, max: 12 }).toString().padStart(2, '0')}/${faker.number.int({ min: 25, max: 29 })}` : undefined,
      bankName: type === 'bank_transfer' ? faker.helpers.arrayElement(bankNames) : undefined,
      accountLast4: type === 'bank_transfer' ? faker.finance.accountNumber(4) : undefined,
      createdAt: faker.date.past({ years: 2 }),
    }
  })
}

// Generate active sessions for a customer
function generateActiveSessions(): ActiveSession[] {
  const count = faker.number.int({ min: 1, max: 4 })
  return Array.from({ length: count }, (_, i) => {
    const countryData = faker.helpers.arrayElement(countries)
    return {
      id: faker.string.uuid(),
      device: faker.helpers.arrayElement(devices),
      browser: faker.helpers.arrayElement(browsers),
      ipAddress: faker.internet.ip(),
      location: `${faker.helpers.arrayElement(countryData.cities)}, ${countryData.name}`,
      lastActive: i === 0 ? new Date() : faker.date.recent({ days: 7 }),
      isCurrent: i === 0,
    }
  })
}

// Generate verification documents for a customer
function generateVerificationDocuments(verificationStatus: Customer['verificationStatus']): VerificationDocument[] {
  if (verificationStatus === 'unverified') return []
  const count = faker.number.int({ min: 1, max: 4 })
  const usedTypes: VerificationDocument['type'][] = []

  return Array.from({ length: count }, () => {
    let type = faker.helpers.arrayElement(documentTypes)
    while (usedTypes.includes(type)) {
      type = faker.helpers.arrayElement(documentTypes)
    }
    usedTypes.push(type)

    const status = verificationStatus === 'verified'
      ? 'approved' as const
      : faker.helpers.weightedArrayElement([
          { value: 'pending' as const, weight: 50 },
          { value: 'approved' as const, weight: 40 },
          { value: 'rejected' as const, weight: 10 },
        ])

    return {
      id: faker.string.uuid(),
      type,
      fileName: `${type.replace('_', '-')}-${faker.string.alphanumeric(8)}.pdf`,
      uploadedAt: faker.date.recent({ days: 60 }),
      status,
      reviewedBy: status !== 'pending' ? faker.helpers.arrayElement(salesStaff).name : undefined,
      reviewedAt: status !== 'pending' ? faker.date.recent({ days: 30 }) : undefined,
      rejectionReason: status === 'rejected' ? faker.helpers.arrayElement(['Document expired', 'Image unclear', 'Information mismatch', 'Invalid document type']) : undefined,
    }
  })
}

// Generate business profile for business accounts
function generateBusinessProfile(userLevel: UserLevel, company?: string): BusinessProfile | undefined {
  if (!['business', 'business_premium'].includes(userLevel) && !company) return undefined
  if (!company && faker.datatype.boolean({ probability: 0.3 })) return undefined

  return {
    registrationNumber: faker.string.alphanumeric(10).toUpperCase(),
    vatNumber: faker.helpers.maybe(() => `VAT${faker.string.alphanumeric(9).toUpperCase()}`),
    businessType: faker.helpers.arrayElement(businessTypes),
    yearEstablished: faker.number.int({ min: 1990, max: 2023 }),
    purchaseFrequency: faker.helpers.arrayElement(['weekly', 'monthly', 'quarterly', 'yearly'] as const),
    website: faker.helpers.maybe(() => faker.internet.url()),
  }
}

export const customers: Customer[] = Array.from({ length: 150 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const countryData = faker.helpers.arrayElement(countries)
  const totalSpent = faker.number.int({ min: 0, max: 800000 })
  const totalBids = faker.number.int({ min: 0, max: 150 })
  const wonAuctions = faker.number.int({ min: 0, max: Math.min(25, Math.floor(totalBids * 0.3)) })
  const lostAuctions = faker.number.int({ min: 0, max: totalBids - wonAuctions })
  const status = faker.helpers.weightedArrayElement([
    { value: 'active' as const, weight: 60 },
    { value: 'inactive' as const, weight: 15 },
    { value: 'pending' as const, weight: 10 },
    { value: 'suspended' as const, weight: 10 },
    { value: 'banned' as const, weight: 5 },
  ])
  const verificationStatus = faker.helpers.weightedArrayElement([
    { value: 'verified' as const, weight: 6 },
    { value: 'pending' as const, weight: 2 },
    { value: 'unverified' as const, weight: 2 },
  ])
  const depositAmount = faker.helpers.arrayElement([0, 50000, 100000, 200000, 500000, 1000000])
  const outstandingBalance = faker.helpers.maybe(() => faker.number.int({ min: 10000, max: 200000 })) || 0
  const hasCompany = faker.datatype.boolean()
  const lastPurchaseDate = wonAuctions > 0 ? faker.date.recent({ days: 90 }) : undefined
  const shouldAssign = status === 'active' ? faker.datatype.boolean({ probability: 0.8 }) : faker.datatype.boolean({ probability: 0.5 })
  const assignedStaff = shouldAssign ? faker.helpers.arrayElement(salesStaff) : null

  // Login tracking
  const loginCount = faker.number.int({ min: 1, max: 200 })
  const failedLoginAttempts = faker.number.int({ min: 0, max: 5 })
  const lastLoginAt = faker.date.recent({ days: 14 })

  // Risk assessment
  const riskLevel = faker.helpers.weightedArrayElement([
    { value: 'low' as const, weight: 70 },
    { value: 'medium' as const, weight: 20 },
    { value: 'high' as const, weight: 10 },
  ])

  // Suspension/ban details
  const isSuspended = status === 'suspended'
  const isBanned = status === 'banned'

  return {
    id: faker.string.uuid(),
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number({ style: 'international' }),
    country: countryData.name,
    city: faker.helpers.arrayElement(countryData.cities),
    address: faker.location.streetAddress({ useFullAddress: true }),
    company: hasCompany ? faker.helpers.arrayElement(companies.filter(c => c)) : undefined,
    status,
    totalPurchases: wonAuctions,
    totalSpent,
    totalBids,
    wonAuctions,
    lostAuctions,
    activeBids: status === 'active' ? faker.number.int({ min: 0, max: 5 }) : 0,
    verificationStatus,
    depositAmount,
    outstandingBalance,
    userLevel: getUserLevel(totalSpent),
    preferredLanguage: faker.helpers.arrayElement(languages),
    notes: faker.helpers.maybe(() => faker.lorem.sentence()),
    tags: faker.helpers.arrayElements(tags, faker.number.int({ min: 0, max: 3 })),
    assignedTo: assignedStaff?.id,
    assignedToName: assignedStaff?.name,
    createdAt: faker.date.past({ years: 3 }),
    lastActivity: faker.date.recent({ days: 60 }),
    lastPurchase: lastPurchaseDate,

    // Account management
    suspendedAt: isSuspended ? faker.date.recent({ days: 30 }) : undefined,
    suspendedUntil: isSuspended && faker.datatype.boolean() ? faker.date.soon({ days: 30 }) : undefined,
    suspensionReason: isSuspended ? faker.helpers.arrayElement(suspensionReasons) : undefined,
    bannedAt: isBanned ? faker.date.recent({ days: 60 }) : undefined,
    banReason: isBanned ? faker.helpers.arrayElement(banReasons) : undefined,

    // Login tracking
    lastLoginAt,
    lastLoginIp: faker.internet.ip(),
    loginCount,
    failedLoginAttempts,

    // Risk assessment
    riskLevel,

    // Business profile
    businessProfile: generateBusinessProfile(getUserLevel(totalSpent), hasCompany ? faker.helpers.arrayElement(companies.filter(c => c)) : undefined),

    // Saved addresses and payment methods
    savedAddresses: generateSavedAddresses(countryData),
    paymentMethods: generatePaymentMethods(),

    // Security
    twoFactorEnabled: faker.datatype.boolean({ probability: 0.4 }),
    activeSessions: generateActiveSessions(),

    // Verification documents
    verificationDocuments: generateVerificationDocuments(verificationStatus),
  }
}).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())

// Generate mock login history for a customer
export function generateLoginHistory(customerId: string, count: number = 20): LoginEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const status = faker.helpers.weightedArrayElement([
      { value: 'success' as const, weight: 85 },
      { value: 'failed' as const, weight: 12 },
      { value: 'blocked' as const, weight: 3 },
    ])
    const countryData = faker.helpers.arrayElement(countries)

    return {
      id: `login-${customerId}-${i}`,
      customerId,
      timestamp: faker.date.recent({ days: Math.max(1, 180 - i * 5) }),
      ipAddress: faker.internet.ip(),
      location: `${faker.helpers.arrayElement(countryData.cities)}, ${countryData.name}`,
      device: faker.helpers.arrayElement(devices),
      browser: faker.helpers.arrayElement(browsers),
      status,
      sessionDuration: status === 'success' ? `${faker.number.int({ min: 5, max: 180 })}m` : undefined,
      failureReason: status === 'failed' ? faker.helpers.arrayElement(['Invalid password', 'Account locked', 'Too many attempts']) : status === 'blocked' ? 'IP blocked' : undefined,
    }
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Generate mock activity log for a customer
export function generateActivityLog(customerId: string, count: number = 30): ActivityEntry[] {
  const activityTypes: ActivityEntry['type'][] = ['bid', 'purchase', 'payment', 'message', 'document', 'login', 'profile_update', 'verification', 'suspension', 'level_change']

  return Array.from({ length: count }, (_, i) => {
    const type = faker.helpers.weightedArrayElement([
      { value: 'login' as const, weight: 30 },
      { value: 'bid' as const, weight: 25 },
      { value: 'payment' as const, weight: 15 },
      { value: 'message' as const, weight: 10 },
      { value: 'purchase' as const, weight: 8 },
      { value: 'document' as const, weight: 5 },
      { value: 'profile_update' as const, weight: 3 },
      { value: 'verification' as const, weight: 2 },
      { value: 'level_change' as const, weight: 1 },
      { value: 'suspension' as const, weight: 1 },
    ])

    const descriptions: Record<ActivityEntry['type'], () => string> = {
      bid: () => `Placed bid on ${faker.vehicle.vehicle()}`,
      purchase: () => `Completed purchase of ${faker.vehicle.vehicle()}`,
      payment: () => `Made payment of ¥${faker.number.int({ min: 50000, max: 500000 }).toLocaleString()}`,
      message: () => faker.helpers.arrayElement(['Sent inquiry about shipping', 'Requested vehicle inspection', 'Asked about payment options', 'Submitted support ticket']),
      document: () => faker.helpers.arrayElement(['Uploaded passport', 'Submitted ID verification', 'Uploaded proof of address', 'Submitted business license']),
      login: () => faker.helpers.arrayElement(['Logged in from new device', 'Successful login', 'Login from new location']),
      profile_update: () => faker.helpers.arrayElement(['Updated phone number', 'Changed shipping address', 'Updated payment method', 'Changed email address']),
      verification: () => faker.helpers.arrayElement(['Verification approved', 'Documents reviewed', 'Identity verified', 'Pending document review']),
      suspension: () => faker.helpers.arrayElement(['Account suspended for review', 'Suspension lifted', 'Temporary hold placed']),
      level_change: () => faker.helpers.arrayElement(['Upgraded to Premium', 'Upgraded to Business', 'Level adjusted by admin']),
    }

    const metadata: Record<ActivityEntry['type'], () => ActivityEntry['metadata']> = {
      bid: () => ({ amount: faker.number.int({ min: 500000, max: 5000000 }), vehicle: faker.vehicle.vehicle(), bidId: faker.string.alphanumeric(8).toUpperCase() }),
      purchase: () => ({ amount: faker.number.int({ min: 1000000, max: 8000000 }), vehicle: faker.vehicle.vehicle(), invoiceId: `INV-${faker.string.alphanumeric(6).toUpperCase()}` }),
      payment: () => ({ amount: faker.number.int({ min: 50000, max: 500000 }) }),
      message: () => ({}),
      document: () => ({}),
      login: () => ({}),
      profile_update: () => ({ oldValue: 'Previous value', newValue: 'New value' }),
      verification: () => ({}),
      suspension: () => ({}),
      level_change: () => ({ oldValue: 'Verified', newValue: 'Premium' }),
    }

    return {
      id: `activity-${customerId}-${i}`,
      customerId,
      timestamp: faker.date.recent({ days: Math.max(1, 180 - i * 5) }),
      type,
      description: descriptions[type](),
      metadata: metadata[type](),
      performedBy: ['verification', 'suspension', 'level_change'].includes(type) ? faker.helpers.arrayElement(salesStaff).name : undefined,
    }
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Vehicle makes and models for realistic data
const vehicleMakes = [
  { make: 'Toyota', models: ['Supra', 'GT86', 'Land Cruiser', 'Alphard', 'Crown', 'Camry', 'Prius'] },
  { make: 'Nissan', models: ['GT-R', 'Skyline', 'Fairlady Z', 'Silvia', 'Patrol', 'Elgrand'] },
  { make: 'Honda', models: ['NSX', 'Civic Type R', 'S2000', 'Integra', 'Accord', 'CR-V'] },
  { make: 'Mazda', models: ['RX-7', 'RX-8', 'MX-5', 'CX-5', 'Mazda3', 'Mazda6'] },
  { make: 'Subaru', models: ['WRX STI', 'Impreza', 'BRZ', 'Forester', 'Legacy', 'Outback'] },
  { make: 'Mitsubishi', models: ['Lancer Evolution', 'Pajero', 'Eclipse', 'Outlander', 'Delica'] },
  { make: 'Lexus', models: ['LFA', 'LC500', 'LS', 'RX', 'GX', 'IS'] },
  { make: 'BMW', models: ['M3', 'M4', 'M5', 'X5', 'X6', '3 Series', '5 Series'] },
  { make: 'Mercedes-Benz', models: ['AMG GT', 'C-Class', 'E-Class', 'S-Class', 'G-Class', 'GLE'] },
]

const auctionHouses = ['USS Tokyo', 'USS Nagoya', 'USS Osaka', 'TAA Kinki', 'HAA Kobe', 'JAA', 'CAA Gifu', 'NAA Nagoya']
const shippingLines = ['NYK Line', 'MOL', 'K Line', 'Evergreen', 'Maersk', 'MSC', 'Hapag-Lloyd', 'COSCO']
const ports = [
  { port: 'Yokohama', country: 'Japan' },
  { port: 'Nagoya', country: 'Japan' },
  { port: 'Osaka', country: 'Japan' },
  { port: 'Kobe', country: 'Japan' },
  { port: 'Tokyo', country: 'Japan' },
]
const destPorts = [
  { port: 'Los Angeles', country: 'USA' },
  { port: 'Long Beach', country: 'USA' },
  { port: 'New York', country: 'USA' },
  { port: 'Felixstowe', country: 'UK' },
  { port: 'Hamburg', country: 'Germany' },
  { port: 'Rotterdam', country: 'Netherlands' },
  { port: 'Sydney', country: 'Australia' },
  { port: 'Auckland', country: 'New Zealand' },
  { port: 'Mombasa', country: 'Kenya' },
  { port: 'Dar es Salaam', country: 'Tanzania' },
  { port: 'Durban', country: 'South Africa' },
  { port: 'Colombo', country: 'Sri Lanka' },
  { port: 'Karachi', country: 'Pakistan' },
  { port: 'Jebel Ali', country: 'UAE' },
]

const colors = ['White', 'Black', 'Silver', 'Blue', 'Red', 'Grey', 'Pearl White', 'Midnight Blue', 'Racing Red', 'Graphite']

// Generate mock purchase history for a customer
export function generatePurchaseHistory(customerId: string, count: number = 8): PurchaseEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const vehicleData = faker.helpers.arrayElement(vehicleMakes)
    const model = faker.helpers.arrayElement(vehicleData.models)
    const year = faker.number.int({ min: 2015, max: 2024 })
    const bidAmount = faker.number.int({ min: 1000000, max: 15000000 })
    const fees = {
      auctionFee: Math.round(bidAmount * 0.05),
      shippingFee: faker.number.int({ min: 150000, max: 400000 }),
      inspectionFee: faker.number.int({ min: 15000, max: 35000 }),
      documentFee: faker.number.int({ min: 25000, max: 50000 }),
      otherFees: faker.number.int({ min: 0, max: 30000 }),
    }
    const totalAmount = bidAmount + Object.values(fees).reduce((a, b) => a + b, 0)
    const paymentStatus = faker.helpers.weightedArrayElement([
      { value: 'paid' as const, weight: 60 },
      { value: 'partial' as const, weight: 20 },
      { value: 'pending' as const, weight: 15 },
      { value: 'overdue' as const, weight: 5 },
    ])
    const amountPaid = paymentStatus === 'paid' ? totalAmount : paymentStatus === 'pending' ? 0 : faker.number.int({ min: Math.round(totalAmount * 0.3), max: Math.round(totalAmount * 0.9) })

    return {
      id: `purchase-${customerId}-${i}`,
      customerId,
      invoiceNumber: `INV-${faker.date.recent({ days: 180 }).getFullYear()}-${faker.string.numeric(4)}`,
      vehicle: {
        make: vehicleData.make,
        model,
        year,
        chassisNumber: `${faker.string.alpha(3).toUpperCase()}${faker.string.alphanumeric(14).toUpperCase()}`,
        color: faker.helpers.arrayElement(colors),
        mileage: faker.number.int({ min: 5000, max: 150000 }),
      },
      auctionDate: faker.date.recent({ days: Math.max(1, 365 - i * 30) }),
      purchaseDate: faker.date.recent({ days: Math.max(1, 360 - i * 30) }),
      bidAmount,
      finalPrice: bidAmount,
      fees,
      totalAmount,
      paymentStatus,
      amountPaid,
      amountDue: totalAmount - amountPaid,
      deliveryStatus: faker.helpers.weightedArrayElement([
        { value: 'delivered' as const, weight: 40 },
        { value: 'in_transit' as const, weight: 25 },
        { value: 'shipped' as const, weight: 15 },
        { value: 'customs' as const, weight: 10 },
        { value: 'processing' as const, weight: 5 },
        { value: 'pending' as const, weight: 5 },
      ]),
      shipmentId: faker.datatype.boolean({ probability: 0.7 }) ? `SHP-${faker.string.alphanumeric(8).toUpperCase()}` : undefined,
      createdAt: faker.date.recent({ days: Math.max(1, 365 - i * 30) }),
    }
  }).sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())
}

// Generate mock bid history for a customer
export function generateBidHistory(customerId: string, count: number = 20): BidHistoryEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const vehicleData = faker.helpers.arrayElement(vehicleMakes)
    const model = faker.helpers.arrayElement(vehicleData.models)
    const year = faker.number.int({ min: 2015, max: 2024 })
    const outcome = faker.helpers.weightedArrayElement([
      { value: 'won' as const, weight: 25 },
      { value: 'lost' as const, weight: 50 },
      { value: 'cancelled' as const, weight: 10 },
      { value: 'pending' as const, weight: 15 },
    ])
    const bidAmount = faker.number.int({ min: 500000, max: 15000000 })

    return {
      id: `bid-${customerId}-${i}`,
      customerId,
      bidNumber: `BID-${faker.string.alphanumeric(8).toUpperCase()}`,
      vehicle: {
        make: vehicleData.make,
        model,
        year,
        chassisNumber: `${faker.string.alpha(3).toUpperCase()}${faker.string.alphanumeric(14).toUpperCase()}`,
        lotNumber: `${faker.string.alphanumeric(6).toUpperCase()}`,
      },
      auctionHouse: faker.helpers.arrayElement(auctionHouses),
      auctionDate: faker.date.recent({ days: Math.max(1, 365 - i * 15) }),
      bidTimestamp: faker.date.recent({ days: Math.max(1, 365 - i * 15) }),
      bidAmount,
      maxBidLimit: bidAmount + faker.number.int({ min: 50000, max: 500000 }),
      outcome,
      winningAmount: outcome === 'won' ? bidAmount : outcome === 'lost' ? bidAmount + faker.number.int({ min: 10000, max: 300000 }) : undefined,
      competitorBids: faker.number.int({ min: 2, max: 25 }),
      notes: faker.helpers.maybe(() => faker.helpers.arrayElement(['Customer priority bid', 'Inspected on-site', 'No major issues found', 'Minor scratches noted'])),
    }
  }).sort((a, b) => b.auctionDate.getTime() - a.auctionDate.getTime())
}

// Generate mock shipments for a customer
export function generateShipments(customerId: string, count: number = 5): ShipmentEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const origin = faker.helpers.arrayElement(ports)
    const destination = faker.helpers.arrayElement(destPorts)
    const vehicleCount = faker.number.int({ min: 1, max: 4 })
    const departureDate = faker.date.recent({ days: Math.max(1, 180 - i * 25) })
    const transitDays = faker.number.int({ min: 21, max: 45 })
    const etaDate = new Date(departureDate.getTime() + transitDays * 24 * 60 * 60 * 1000)

    const status = faker.helpers.weightedArrayElement([
      { value: 'delivered' as const, weight: 30 },
      { value: 'in_transit' as const, weight: 30 },
      { value: 'arrived' as const, weight: 15 },
      { value: 'customs_clearance' as const, weight: 10 },
      { value: 'departed' as const, weight: 10 },
      { value: 'loaded' as const, weight: 3 },
      { value: 'booked' as const, weight: 2 },
    ])

    return {
      id: `shipment-${customerId}-${i}`,
      customerId,
      containerNumber: `${faker.string.alpha(4).toUpperCase()}${faker.string.numeric(7)}`,
      bookingNumber: `BK${faker.string.alphanumeric(10).toUpperCase()}`,
      shippingLine: faker.helpers.arrayElement(shippingLines),
      vehicles: Array.from({ length: vehicleCount }, () => {
        const vehicleData = faker.helpers.arrayElement(vehicleMakes)
        return {
          chassisNumber: `${faker.string.alpha(3).toUpperCase()}${faker.string.alphanumeric(14).toUpperCase()}`,
          make: vehicleData.make,
          model: faker.helpers.arrayElement(vehicleData.models),
          invoiceNumber: `INV-${faker.date.recent().getFullYear()}-${faker.string.numeric(4)}`,
        }
      }),
      origin: {
        port: origin.port,
        country: origin.country,
        departureDate,
      },
      destination: {
        port: destination.port,
        country: destination.country,
        eta: etaDate,
        ata: ['delivered', 'customs_clearance', 'arrived'].includes(status) ? new Date(etaDate.getTime() + faker.number.int({ min: -3, max: 5 }) * 24 * 60 * 60 * 1000) : undefined,
      },
      status,
      trackingUrl: faker.helpers.maybe(() => `https://track.${faker.helpers.arrayElement(['maersk', 'msc', 'nykline', 'mol'])}.com/${faker.string.alphanumeric(12)}`),
      documents: faker.datatype.boolean({ probability: 0.7 }) ? [
        { type: 'bl' as const, fileName: `BL-${faker.string.alphanumeric(8)}.pdf`, uploadedAt: faker.date.recent({ days: 30 }) },
        { type: 'invoice' as const, fileName: `Invoice-${faker.string.alphanumeric(8)}.pdf`, uploadedAt: faker.date.recent({ days: 30 }) },
      ] : [],
      createdAt: faker.date.recent({ days: Math.max(1, 180 - i * 25) }),
    }
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// Generate mock communication history for a customer
export function generateCommunicationHistory(customerId: string, count: number = 25): CommunicationEntry[] {
  const communicationTypes: CommunicationEntry['type'][] = ['email_sent', 'email_received', 'whatsapp_sent', 'whatsapp_received', 'call_outgoing', 'call_incoming', 'sms_sent', 'sms_received']

  const emailSubjects = [
    'Invoice #INV-2024-XXX - Payment Reminder',
    'Your Vehicle Has Shipped!',
    'Auction Results - Bid Update',
    'Document Request for Verification',
    'Shipping Update - ETA Revised',
    'Welcome to Our Platform',
    'New Vehicles Matching Your Criteria',
    'RE: Question about shipping costs',
    'FW: Customs Documentation Required',
    'Payment Confirmation',
  ]

  const whatsappMessages = [
    'Hi, the vehicle has arrived at the port. We\'ll start customs clearance tomorrow.',
    'Your payment has been received. Thank you!',
    'The auction for your bid starts in 2 hours.',
    'Please send the required documents at your earliest convenience.',
    'Great news! You won the auction!',
    'The container has been loaded and will depart this week.',
    'Do you have any questions about the shipping process?',
  ]

  const callNotes = [
    'Discussed shipping options and timeline',
    'Customer inquired about payment methods',
    'Followed up on pending document submission',
    'Explained auction process and bidding limits',
    'Resolved issue with invoice discrepancy',
    'Customer requested update on shipment status',
  ]

  return Array.from({ length: count }, (_, i) => {
    const type = faker.helpers.weightedArrayElement([
      { value: 'email_sent' as const, weight: 20 },
      { value: 'email_received' as const, weight: 15 },
      { value: 'whatsapp_sent' as const, weight: 25 },
      { value: 'whatsapp_received' as const, weight: 20 },
      { value: 'call_outgoing' as const, weight: 10 },
      { value: 'call_incoming' as const, weight: 8 },
      { value: 'sms_sent' as const, weight: 1 },
      { value: 'sms_received' as const, weight: 1 },
    ])

    const isCall = type.includes('call')
    const isEmail = type.includes('email')
    const isWhatsApp = type.includes('whatsapp')

    return {
      id: `comm-${customerId}-${i}`,
      customerId,
      type,
      subject: isEmail ? faker.helpers.arrayElement(emailSubjects).replace('XXX', faker.string.numeric(3)) : undefined,
      message: isWhatsApp ? faker.helpers.arrayElement(whatsappMessages) : isCall ? faker.helpers.arrayElement(callNotes) : undefined,
      duration: isCall ? `${faker.number.int({ min: 1, max: 45 })}:${faker.number.int({ min: 10, max: 59 })}` : undefined,
      staffMember: faker.helpers.arrayElement(salesStaff).name,
      timestamp: faker.date.recent({ days: Math.max(1, 180 - i * 5) }),
      attachments: isEmail && faker.datatype.boolean({ probability: 0.3 }) ? [`attachment-${faker.string.alphanumeric(6)}.pdf`] : undefined,
      status: isCall
        ? faker.helpers.arrayElement(['answered', 'missed'] as const)
        : faker.helpers.weightedArrayElement([
            { value: 'read' as const, weight: 40 },
            { value: 'delivered' as const, weight: 30 },
            { value: 'sent' as const, weight: 20 },
            { value: 'replied' as const, weight: 10 },
          ]),
    }
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}
