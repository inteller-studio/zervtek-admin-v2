import { faker } from '@faker-js/faker'
import { stockVehiclesFromSQL } from './vehicles-from-sql'

faker.seed(56789)

// Real vehicle data from SQL for images
const realVehicleImages = stockVehiclesFromSQL.map(v => ({
  make: v.makeEn || v.make,
  model: v.modelEn || v.model,
  year: v.year,
  images: v.imageUrl || [],
  color: (v.colorEn || v.color || 'Unknown').trim(),
}))

export interface Bid {
  id: string
  bidNumber: string
  auctionId: string
  lotNumber: string
  auctionHouse: string
  auctionTitle: string
  vehicle: {
    make: string
    model: string
    year: number
    chassisNumber: string
    thumbnailImage: string
  }
  bidder: {
    id: string
    name: string
    email: string
    type: 'individual' | 'dealer' | 'corporate'
    location: string
    level: 'unverified' | 'verified' | 'premium' | 'business' | 'business_premium'
    depositAmount: number
  }
  amount: number
  maxBid?: number
  timestamp: Date
  status: 'pending_approval' | 'active' | 'outbid' | 'winning' | 'won' | 'lost' | 'retracted' | 'expired' | 'declined'
  type: 'manual' | 'assisted'
  assistedBy?: string
  previousBid?: number
  bidIncrement: number
  reservePrice: number
  currentHighBid: number
  totalBids: number
  timeRemaining?: Date
  auctionStatus: 'live' | 'upcoming' | 'ended'
  notes?: string
  source: 'web' | 'mobile' | 'api'
  approvalStatus: 'pending_review' | 'approved' | 'rejected'
  serviceFee: number
}

// Real vehicles from customer portal mock data
const vehicles = [
  { make: 'Toyota', model: 'Corolla Axio', years: [2018, 2019, 2020, 2021], basePrice: 1800000 },
  { make: 'Toyota', model: 'Land Cruiser 250 VX', years: [2023, 2024], basePrice: 8500000 },
  { make: 'Toyota', model: 'Land Cruiser Prado', years: [2019, 2020, 2021, 2022], basePrice: 5400000 },
  { make: 'Toyota', model: 'Alphard Executive Lounge', years: [2021, 2022, 2023], basePrice: 7200000 },
  { make: 'Toyota', model: 'Vellfire Z G Edition', years: [2020, 2021, 2022, 2023], basePrice: 6800000 },
  { make: 'Toyota', model: 'Crown Crossover RS', years: [2022, 2023, 2024], basePrice: 5500000 },
  { make: 'Toyota', model: 'GR Supra RZ', years: [2020, 2021, 2022, 2023], basePrice: 6200000 },
  { make: 'Toyota', model: 'Hiace Super GL', years: [2019, 2020, 2021, 2022], basePrice: 3200000 },
  { make: 'Toyota', model: 'RAV4 Adventure', years: [2020, 2021, 2022, 2023], basePrice: 3800000 },
  { make: 'Honda', model: 'Civic Type R', years: [2022, 2023, 2024], basePrice: 5200000 },
  { make: 'Honda', model: 'CR-V e:HEV', years: [2021, 2022, 2023], basePrice: 4200000 },
  { make: 'Honda', model: 'N-BOX Custom', years: [2021, 2022, 2023], basePrice: 1950000 },
  { make: 'Honda', model: 'Step WGN Spada', years: [2022, 2023], basePrice: 3600000 },
  { make: 'Honda', model: 'Vezel e:HEV Z', years: [2021, 2022, 2023], basePrice: 3200000 },
  { make: 'Nissan', model: 'Skyline GT-R R34', years: [1999, 2000, 2001, 2002], basePrice: 9400000 },
  { make: 'Nissan', model: 'GT-R NISMO', years: [2020, 2021, 2022], basePrice: 15000000 },
  { make: 'Nissan', model: 'Serena e-POWER', years: [2022, 2023, 2024], basePrice: 3800000 },
  { make: 'Nissan', model: 'X-Trail e-4ORCE', years: [2022, 2023], basePrice: 4200000 },
  { make: 'Nissan', model: 'Note Aura NISMO', years: [2021, 2022, 2023], basePrice: 2800000 },
  { make: 'BMW', model: '3 Series 320i M Sport', years: [2021, 2022, 2023], basePrice: 4850000 },
  { make: 'BMW', model: 'M4 Competition', years: [2021, 2022, 2023], basePrice: 12500000 },
  { make: 'BMW', model: 'X5 xDrive40d', years: [2021, 2022, 2023], basePrice: 9800000 },
  { make: 'Mercedes-Benz', model: 'C-Class C200', years: [2021, 2022, 2023], basePrice: 5200000 },
  { make: 'Mercedes-Benz', model: 'G 63 AMG', years: [2021, 2022, 2023], basePrice: 22000000 },
  { make: 'Mercedes-Benz', model: 'E 300 AMG Line', years: [2021, 2022, 2023], basePrice: 7800000 },
  { make: 'Mazda', model: 'RX-7 FD3S Spirit R', years: [1997, 1998, 1999, 2000, 2001, 2002], basePrice: 6500000 },
  { make: 'Mazda', model: 'CX-60 Premium Sports', years: [2022, 2023, 2024], basePrice: 4800000 },
  { make: 'Mazda', model: 'MX-5 RF RS', years: [2021, 2022, 2023], basePrice: 3800000 },
  { make: 'Subaru', model: 'WRX STI', years: [2018, 2019, 2020, 2021], basePrice: 3250000 },
  { make: 'Subaru', model: 'Levorg STI Sport', years: [2021, 2022, 2023], basePrice: 4200000 },
  { make: 'Subaru', model: 'Forester STI', years: [2021, 2022, 2023], basePrice: 3600000 },
  { make: 'Lexus', model: 'LS 500h Executive', years: [2020, 2021, 2022], basePrice: 6800000 },
  { make: 'Lexus', model: 'LX 600', years: [2022, 2023, 2024], basePrice: 12800000 },
  { make: 'Lexus', model: 'LC 500 Convertible', years: [2021, 2022, 2023], basePrice: 14500000 },
  { make: 'Lexus', model: 'RX 500h F Sport', years: [2023, 2024], basePrice: 8200000 },
  { make: 'Suzuki', model: 'Jimny Sierra JC', years: [2020, 2021, 2022, 2023], basePrice: 2200000 },
  { make: 'Suzuki', model: 'Swift Sport', years: [2020, 2021, 2022], basePrice: 2100000 },
  { make: 'Mitsubishi', model: 'Delica D:5 Urban Gear', years: [2020, 2021, 2022], basePrice: 4200000 },
  { make: 'Mitsubishi', model: 'Outlander PHEV', years: [2022, 2023], basePrice: 4800000 },
  { make: 'Porsche', model: '911 Carrera S', years: [2020, 2021, 2022], basePrice: 16500000 },
  { make: 'Porsche', model: 'Cayenne GTS', years: [2021, 2022, 2023], basePrice: 14200000 },
  { make: 'Tesla', model: 'Model 3 Long Range', years: [2022, 2023], basePrice: 5500000 },
]

// Japanese auction houses
const auctionHouses = [
  'USS Tokyo',
  'USS Nagoya',
  'USS Osaka',
  'USS Yokohama',
  'USS Kobe',
  'USS Fukuoka',
  'USS Sapporo',
  'USS R Nagoya',
  'JAA',
  'TAA Kinki',
  'TAA Chubu',
  'HAA Kobe',
  'HAA Osaka',
  'CAA Tokyo',
  'CAA Gifu',
  'AUCNET',
  'JU Nagoya',
  'JU Tokyo',
  'JU Saitama',
  'Arai Sendai',
  'Bayauc',
  'ZIP Tokyo',
  'LAA Kansai',
  'NAA Nagoya',
]

// Bidder names matching customer portal
const bidderNames = [
  'Tanaka San',
  'Suzuki San',
  'Yamamoto San',
  'Watanabe San',
  'Ito San',
  'Kamal Perera',
  'Nuwan Silva',
  'Saman Fernando',
  'Ruwan Jayawardena',
  'Chaminda Bandara',
  'Thilak Kumara',
  'Mohammed Al-Rashid',
  'Ahmed Hassan',
  'Vladimir Petrov',
  'Dmitri Volkov',
  'James Thompson',
  'Michael Chen',
  'David Park',
  'Sunil Sharma',
  'Rajesh Patel',
  'Carlos Rodriguez',
  'Antonio Santos',
  'Hassan Ali',
  'Omar Farooq',
  'Anil Kumar',
]

const locations = [
  'Colombo, Sri Lanka',
  'Kandy, Sri Lanka',
  'Galle, Sri Lanka',
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'Sharjah, UAE',
  'Moscow, Russia',
  'Vladivostok, Russia',
  'London, UK',
  'Birmingham, UK',
  'Sydney, Australia',
  'Melbourne, Australia',
  'Auckland, NZ',
  'Nairobi, Kenya',
  'Mombasa, Kenya',
  'Dar es Salaam, Tanzania',
  'Karachi, Pakistan',
  'Lahore, Pakistan',
  'Kingston, Jamaica',
  'Port Louis, Mauritius',
  'Dhaka, Bangladesh',
  'Chittagong, Bangladesh',
]

// Staff members who can assist buyers
const staffMembers = [
  'Yuki Tanaka',
  'Kenji Yamamoto',
  'Sakura Sato',
  'Hiroshi Nakamura',
  'Aiko Suzuki',
  'Takeshi Ito',
  'Mika Watanabe',
  'Ryo Kobayashi',
]

// Generate chassis number
const generateChassisNumber = (make: string): string => {
  const prefixes: Record<string, string[]> = {
    'Toyota': ['GRS', 'ZRE', 'NRE', 'GRJ', 'TRJ', 'AGH', 'AYH', 'MXAA'],
    'Honda': ['FK', 'FL', 'RW', 'GB', 'DBA', 'ZE', 'RU'],
    'Nissan': ['BNR', 'GTR', 'E13', 'C28', 'T33', 'SNE'],
    'BMW': ['3K', '5K', '7K', 'JC', 'JG'],
    'Mercedes-Benz': ['WDB', 'WDC', 'WDD', 'W1K'],
    'Mazda': ['FD3S', 'KF', 'DK', 'ND5'],
    'Subaru': ['VAB', 'VN', 'SK', 'SJ'],
    'Lexus': ['VXF', 'URZ', 'GVF', 'AGL'],
    'Suzuki': ['JB74', 'ZC33'],
    'Mitsubishi': ['CV', 'GN'],
    'Porsche': ['WP0', 'WP1'],
    'Tesla': ['5YJ', 'LRW'],
  }
  const prefix = prefixes[make]?.[Math.floor(Math.random() * (prefixes[make]?.length || 1))] || 'ABC'
  const numbers = Math.floor(Math.random() * 9000000) + 1000000
  return `${prefix}-${numbers}`
}

// Helper to generate a bid
const generateBid = (index: number, forceToday: boolean = false, forceStatus?: Bid['status']) => {
  const vehicleData = faker.helpers.arrayElement(vehicles)
  const year = faker.helpers.arrayElement(vehicleData.years)
  // Get a real vehicle image based on index
  const realVehicle = realVehicleImages[index % realVehicleImages.length]
  const auctionStatus = forceStatus === 'won' || forceStatus === 'lost'
    ? 'ended' as const
    : faker.helpers.arrayElement(['live', 'upcoming', 'ended'] as const)

  // Price variation around base price (±30%)
  const priceVariation = 0.7 + Math.random() * 0.6
  const baseAmount = Math.round((vehicleData.basePrice * priceVariation) / 10000) * 10000
  const amount = baseAmount
  const currentHighBid = amount + Math.floor(Math.random() * 500000 / 10000) * 10000
  const reservePrice = Math.round((vehicleData.basePrice * 0.9) / 10000) * 10000
  const bidType = forceStatus === 'pending_approval' ? 'assisted' as const : faker.helpers.arrayElement(['manual', 'assisted'] as const)
  const source = faker.helpers.arrayElement(['web', 'mobile', 'api'] as const)

  let status: Bid['status']
  let approvalStatus: Bid['approvalStatus'] = 'approved'

  if (forceStatus) {
    status = forceStatus
    if (forceStatus === 'pending_approval') {
      approvalStatus = 'pending_review'
    }
  } else if (auctionStatus === 'ended') {
    status = Math.random() > 0.3 ? 'won' : 'lost'
  } else if (auctionStatus === 'upcoming') {
    status = 'active'
  } else {
    if (bidType === 'assisted' && Math.random() > 0.6) {
      status = 'pending_approval'
      approvalStatus = 'pending_review'
    } else {
      status = faker.helpers.arrayElement(['active', 'outbid', 'winning'] as const)
    }
  }

  const bidderName = faker.helpers.arrayElement(bidderNames)
  const bidder = {
    id: faker.string.uuid(),
    name: bidderName,
    email: `${bidderName.toLowerCase().replace(' ', '.')}@${faker.helpers.arrayElement(['gmail.com', 'yahoo.com', 'outlook.com', 'mail.com'])}`,
    type: faker.helpers.arrayElement(['individual', 'dealer', 'corporate'] as const),
    location: faker.helpers.arrayElement(locations),
    level: faker.helpers.arrayElement(['unverified', 'verified', 'premium', 'business', 'business_premium'] as const),
    depositAmount: faker.helpers.arrayElement([0, 100000, 300000, 500000, 1000000]),
  }

  const auctionHouse = faker.helpers.arrayElement(auctionHouses)
  const lotNumber = `${String(Math.floor(Math.random() * 90000) + 10000)}`
  const serviceFee = Math.round(amount * 0.05)

  // Generate timestamp - today if forced, otherwise random from past 30 days
  let timestamp: Date
  if (forceToday) {
    // Random time today (between midnight and now)
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    timestamp = new Date(todayStart.getTime() + Math.random() * (now.getTime() - todayStart.getTime()))
  } else {
    timestamp = faker.date.recent({ days: 30 })
  }

  return {
    id: faker.string.uuid(),
    bidNumber: `BID-2024-${String(index + 1).padStart(5, '0')}`,
    auctionId: `AUC-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
    lotNumber,
    auctionHouse,
    auctionTitle: `${year} ${vehicleData.make} ${vehicleData.model}`,
    vehicle: {
      make: vehicleData.make,
      model: vehicleData.model,
      year,
      chassisNumber: generateChassisNumber(vehicleData.make),
      thumbnailImage: realVehicle.images[0] || '#',
    },
    bidder,
    amount,
    maxBid: bidType === 'assisted' ? amount + Math.floor(Math.random() * 500000 / 10000) * 10000 : undefined,
    timestamp,
    status,
    type: bidType,
    assistedBy: bidType === 'assisted' ? faker.helpers.arrayElement(staffMembers) : undefined,
    previousBid: amount - Math.floor(Math.random() * 200000 / 10000) * 10000,
    bidIncrement: 10000,
    reservePrice,
    currentHighBid,
    totalBids: Math.floor(Math.random() * 50) + 5,
    timeRemaining: auctionStatus === 'live' ? new Date(Date.now() + Math.random() * 86400000) : undefined,
    auctionStatus,
    notes: faker.helpers.maybe(() => faker.lorem.sentence()),
    source,
    approvalStatus,
    serviceFee,
  }
}

// Generate bids with some guaranteed today's bids
export const bids: Bid[] = [
  // 15 pending approval bids from today
  ...Array.from({ length: 15 }, (_, i) => generateBid(i + 1, true, 'pending_approval')),
  // 10 active bids from today
  ...Array.from({ length: 10 }, (_, i) => generateBid(i + 16, true, 'active')),
  // 8 winning bids from today
  ...Array.from({ length: 8 }, (_, i) => generateBid(i + 26, true, 'winning')),
  // 5 won bids from today
  ...Array.from({ length: 5 }, (_, i) => generateBid(i + 34, true, 'won')),
  // 3 lost bids from today
  ...Array.from({ length: 3 }, (_, i) => generateBid(i + 39, true, 'lost')),
  // 5 outbid from today
  ...Array.from({ length: 5 }, (_, i) => generateBid(i + 42, true, 'outbid')),
  // Rest are random from past 30 days
  ...Array.from({ length: 104 }, (_, i) => generateBid(i + 47, false)),
].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
