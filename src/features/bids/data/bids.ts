import { faker } from '@faker-js/faker'

faker.seed(56789)

export interface Bid {
  id: string
  bidNumber: string
  auctionId: string
  auctionTitle: string
  vehicle: {
    make: string
    model: string
    year: number
    vin: string
    mileage: number
    imageUrl?: string
  }
  bidder: {
    id: string
    name: string
    email: string
    type: 'individual' | 'dealer' | 'corporate'
    location: string
    totalBids: number
    winRate: number
  }
  amount: number
  maxBid?: number
  timestamp: Date
  status: 'active' | 'outbid' | 'winning' | 'won' | 'lost' | 'retracted' | 'expired'
  type: 'manual' | 'assisted' | 'buy_now'
  previousBid?: number
  bidIncrement: number
  reservePrice: number
  currentHighBid: number
  totalBids: number
  timeRemaining?: Date
  auctionStatus: 'live' | 'upcoming' | 'ended'
  notes?: string
}

const makes = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Lexus', 'Porsche', 'Ford', 'Chevrolet']
const models: Record<string, string[]> = {
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Supra', 'Land Cruiser'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'NSX', 'Pilot'],
  'BMW': ['3 Series', '5 Series', 'X3', 'M3', 'X5'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'AMG GT', 'G-Class'],
  'Audi': ['A4', 'A6', 'Q5', 'RS5', 'Q7'],
  'Nissan': ['Altima', 'GT-R', '370Z', 'Patrol'],
  'Lexus': ['IS', 'ES', 'RX', 'LC', 'LX'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera'],
  'Ford': ['Mustang', 'F-150', 'Explorer', 'Bronco'],
  'Chevrolet': ['Camaro', 'Corvette', 'Tahoe', 'Silverado'],
}

const bidderNames = [
  'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson', 'Robert Brown',
  'Lisa Garcia', 'David Lee', 'Amy Chen', 'Chris Taylor', 'Jennifer Martinez',
  'James Wilson', 'Maria Rodriguez', 'Daniel Kim', 'Rachel Thompson', 'Andrew Clark'
]

const locations = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Miami, FL', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Atlanta, GA',
  'San Francisco, CA', 'Dallas, TX', 'Portland, OR', 'Nashville, TN', 'Austin, TX'
]

export const bids: Bid[] = Array.from({ length: 150 }, (_, index) => {
  const make = faker.helpers.arrayElement(makes)
  const model = faker.helpers.arrayElement(models[make] || ['Model'])
  const year = 2015 + Math.floor(Math.random() * 10)
  const auctionStatus = faker.helpers.arrayElement(['live', 'upcoming', 'ended'] as const)
  const basePrice = Math.floor(Math.random() * 50000) + 15000
  const amount = basePrice + Math.floor(Math.random() * 10000)
  const currentHighBid = amount + Math.floor(Math.random() * 5000)
  const reservePrice = basePrice + Math.floor(Math.random() * 20000)
  const bidType = faker.helpers.arrayElement(['manual', 'assisted', 'buy_now'] as const)

  let status: Bid['status']
  if (auctionStatus === 'ended') {
    status = Math.random() > 0.3 ? 'won' : 'lost'
  } else if (auctionStatus === 'upcoming') {
    status = 'active'
  } else {
    status = faker.helpers.arrayElement(['active', 'outbid', 'winning'] as const)
  }

  const bidder = {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(bidderNames),
    email: faker.internet.email().toLowerCase(),
    type: faker.helpers.arrayElement(['individual', 'dealer', 'corporate'] as const),
    location: faker.helpers.arrayElement(locations),
    totalBids: Math.floor(Math.random() * 200) + 10,
    winRate: Math.floor(Math.random() * 100),
  }

  return {
    id: faker.string.uuid(),
    bidNumber: `BID${String(index + 1).padStart(6, '0')}`,
    auctionId: `AUC${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
    auctionTitle: `${year} ${make} ${model} - Premium Edition`,
    vehicle: {
      make,
      model,
      year,
      vin: faker.vehicle.vin(),
      mileage: Math.floor(Math.random() * 100000),
    },
    bidder,
    amount,
    maxBid: bidType === 'assisted' ? amount + Math.floor(Math.random() * 5000) : undefined,
    timestamp: faker.date.recent({ days: 30 }),
    status,
    type: bidType,
    previousBid: amount - Math.floor(Math.random() * 2000),
    bidIncrement: 250,
    reservePrice,
    currentHighBid,
    totalBids: Math.floor(Math.random() * 50) + 5,
    timeRemaining: auctionStatus === 'live' ? new Date(Date.now() + Math.random() * 86400000) : undefined,
    auctionStatus,
    notes: faker.helpers.maybe(() => faker.lorem.sentence()),
  }
}).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
