import { faker } from '@faker-js/faker'

faker.seed(23456)

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  country: string
  address: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  totalPurchases: number
  totalSpent: number
  totalBids: number
  wonAuctions: number
  verificationStatus: 'verified' | 'pending' | 'unverified'
  createdAt: Date
  lastActivity: Date
}

const countries = ['United States', 'United Kingdom', 'Germany', 'Japan', 'Canada', 'Australia', 'France', 'Italy', 'Spain', 'Netherlands']

export const customers: Customer[] = Array.from({ length: 200 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  return {
    id: faker.string.uuid(),
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number({ style: 'international' }),
    country: faker.helpers.arrayElement(countries),
    address: faker.location.streetAddress({ useFullAddress: true }),
    status: faker.helpers.arrayElement(['active', 'inactive', 'pending', 'suspended']),
    totalPurchases: faker.number.int({ min: 0, max: 20 }),
    totalSpent: faker.number.int({ min: 0, max: 500000 }),
    totalBids: faker.number.int({ min: 0, max: 100 }),
    wonAuctions: faker.number.int({ min: 0, max: 10 }),
    verificationStatus: faker.helpers.arrayElement(['verified', 'pending', 'unverified']),
    createdAt: faker.date.past({ years: 3 }),
    lastActivity: faker.date.recent(),
  }
})
