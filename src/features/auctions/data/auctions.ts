import { faker } from '@faker-js/faker'

faker.seed(12345)

export interface Auction {
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
  startingBid: number
  currentBid: number
  buyNowPrice?: number
  currency: string
  status: 'draft' | 'scheduled' | 'active' | 'ended' | 'sold' | 'cancelled'
  startTime: Date
  endTime: Date
  totalBids: number
  watchers: number
  highestBidderId?: string
  highestBidderName?: string
  createdAt: Date
  updatedAt: Date
}

const makes = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Mazda', 'Lexus', 'Porsche', 'Volkswagen']
const models: Record<string, string[]> = {
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Land Cruiser', 'Supra'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'NSX'],
  'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'M3', 'M5'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'AMG GT'],
  'Audi': ['A4', 'A6', 'Q5', 'Q7', 'RS5', 'e-tron'],
  'Nissan': ['Altima', 'Maxima', 'Rogue', 'Pathfinder', 'GT-R', '370Z'],
  'Mazda': ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'MX-5 Miata', 'CX-30'],
  'Lexus': ['IS', 'ES', 'RX', 'NX', 'GX', 'LC'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster'],
  'Volkswagen': ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas', 'ID.4'],
}
const colors = ['Black', 'White', 'Silver', 'Red', 'Blue', 'Gray', 'Pearl White', 'Midnight Blue', 'Racing Green']
const statuses: Auction['status'][] = ['draft', 'scheduled', 'active', 'ended', 'sold', 'cancelled']

export const auctions: Auction[] = Array.from({ length: 100 }, (_, index) => {
  const make = faker.helpers.arrayElement(makes)
  const model = faker.helpers.arrayElement(models[make] || ['Model'])
  const year = faker.number.int({ min: 2015, max: 2024 })
  const status = faker.helpers.arrayElement(statuses)
  const startingBid = faker.number.int({ min: 5000, max: 50000 })
  const currentBid = status === 'active' || status === 'ended' || status === 'sold'
    ? startingBid + faker.number.int({ min: 0, max: 15000 })
    : startingBid

  const startTime = faker.date.recent({ days: 30 })
  const endTime = new Date(startTime.getTime() + faker.number.int({ min: 1, max: 14 }) * 24 * 60 * 60 * 1000)

  return {
    id: faker.string.uuid(),
    auctionId: `AUC-${year}-${String(index + 1).padStart(3, '0')}`,
    vehicleInfo: {
      make,
      model,
      year,
      vin: faker.vehicle.vin(),
      mileage: faker.number.int({ min: 5000, max: 150000 }),
      color: faker.helpers.arrayElement(colors),
      images: [faker.image.url()],
    },
    startingBid,
    currentBid,
    buyNowPrice: faker.helpers.maybe(() => currentBid + faker.number.int({ min: 5000, max: 20000 })),
    currency: 'USD',
    status,
    startTime,
    endTime,
    totalBids: status === 'active' || status === 'ended' || status === 'sold'
      ? faker.number.int({ min: 1, max: 50 })
      : 0,
    watchers: faker.number.int({ min: 0, max: 200 }),
    highestBidderId: status !== 'draft' && status !== 'scheduled' ? faker.string.uuid() : undefined,
    highestBidderName: status !== 'draft' && status !== 'scheduled' ? faker.person.fullName() : undefined,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent(),
  }
})
