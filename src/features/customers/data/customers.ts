import { faker } from '@faker-js/faker'

faker.seed(23456)

export type UserLevel = 'unverified' | 'verified' | 'premium' | 'business' | 'business_premium'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  country: string
  city: string
  address: string
  company?: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
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

export const customers: Customer[] = Array.from({ length: 150 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const countryData = faker.helpers.arrayElement(countries)
  const totalSpent = faker.number.int({ min: 0, max: 800000 })
  const totalBids = faker.number.int({ min: 0, max: 150 })
  const wonAuctions = faker.number.int({ min: 0, max: Math.min(25, Math.floor(totalBids * 0.3)) })
  const lostAuctions = faker.number.int({ min: 0, max: totalBids - wonAuctions })
  const status = faker.helpers.arrayElement(['active', 'active', 'active', 'inactive', 'pending', 'suspended']) as Customer['status']
  const verificationStatus = faker.helpers.weightedArrayElement([
    { value: 'verified' as const, weight: 6 },
    { value: 'pending' as const, weight: 2 },
    { value: 'unverified' as const, weight: 2 },
  ])
  const depositAmount = faker.helpers.arrayElement([0, 50000, 100000, 200000, 500000, 1000000])
  const outstandingBalance = faker.helpers.maybe(() => faker.number.int({ min: 10000, max: 200000 })) || 0
  const hasCompany = faker.datatype.boolean()
  const lastPurchaseDate = wonAuctions > 0 ? faker.date.recent({ days: 90 }) : undefined
  // Most active customers get assigned to staff (80% chance for active, 50% for others)
  const shouldAssign = status === 'active' ? faker.datatype.boolean({ probability: 0.8 }) : faker.datatype.boolean({ probability: 0.5 })
  const assignedStaff = shouldAssign ? faker.helpers.arrayElement(salesStaff) : null

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
  }
}).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
