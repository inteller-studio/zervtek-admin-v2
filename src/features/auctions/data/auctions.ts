import { stockVehiclesFromSQL } from '@/features/stock-vehicles/data/stock-vehicles-sql'

export interface Auction {
  id: string
  auctionId: string
  lotNumber: string
  vehicleInfo: {
    make: string
    model: string
    year: number
    vin: string
    mileage: number
    mileageDisplay: string
    color: string
    grade: string
    modelCode: string
    transmission: string
    displacement: string
    fuelType: string
    exteriorGrade: string
    interiorGrade: string
    score: string
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
  location: string
  auctionHouse: string
  createdAt: Date
  updatedAt: Date
}

// Names for bidders
const bidderNames = [
  'John Smith', 'Emily Johnson', 'Michael Williams', 'Sarah Brown', 'David Jones',
  'Jessica Garcia', 'Christopher Miller', 'Ashley Davis', 'Matthew Rodriguez', 'Amanda Martinez',
  'Daniel Anderson', 'Jennifer Taylor', 'James Thomas', 'Elizabeth Hernandez', 'Robert Moore',
  'Michelle Jackson', 'William Martin', 'Stephanie Lee', 'Richard Thompson', 'Nicole White'
]

// Generate VIN-like string
const generateVIN = (index: number): string => {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'
  let vin = ''
  for (let i = 0; i < 17; i++) {
    vin += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return vin
}

// Get random status with weighted distribution
const getRandomStatus = (index: number): Auction['status'] => {
  const statuses: Auction['status'][] = ['draft', 'scheduled', 'active', 'ended', 'sold', 'cancelled']
  const weights = [0.05, 0.15, 0.35, 0.15, 0.25, 0.05] // More active and sold
  const random = (index * 0.618033988749895) % 1 // Golden ratio for better distribution
  let cumulative = 0
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i]
    if (random < cumulative) return statuses[i]
  }
  return 'active'
}

// Transform stock vehicles data to auction format
export const auctions: Auction[] = stockVehiclesFromSQL.slice(0, 50).map((v, index) => {
  const status = getRandomStatus(index)
  const basePrice = v.stockPrice || 1500000
  const startingBid = Math.floor(basePrice * 0.7) // Starting at 70% of stock price

  // Calculate current bid based on status
  let currentBid = startingBid
  let totalBids = 0
  if (status === 'active' || status === 'ended' || status === 'sold') {
    const bidIncreasePercent = 0.05 + (index % 20) * 0.02 // 5-45% increase
    currentBid = Math.floor(startingBid * (1 + bidIncreasePercent))
    totalBids = Math.floor(3 + (index % 30))
  }

  // Generate dates
  const now = new Date()
  let startTime: Date
  let endTime: Date

  switch (status) {
    case 'draft':
      startTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000)
      break
    case 'scheduled':
      startTime = new Date(now.getTime() + (1 + index % 5) * 24 * 60 * 60 * 1000)
      endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000)
      break
    case 'active':
      startTime = new Date(now.getTime() - (index % 5) * 24 * 60 * 60 * 1000)
      endTime = new Date(now.getTime() + (1 + index % 7) * 24 * 60 * 60 * 1000)
      break
    case 'ended':
    case 'sold':
      startTime = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      endTime = new Date(now.getTime() - (1 + index % 7) * 24 * 60 * 60 * 1000)
      break
    case 'cancelled':
      startTime = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
      endTime = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      break
    default:
      startTime = now
      endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  }

  return {
    id: String(v.id),
    auctionId: `AUC-${v.year}-${String(index + 1).padStart(4, '0')}`,
    lotNumber: `LOT-${String(index + 1001).padStart(6, '0')}`,
    vehicleInfo: {
      make: v.makeEn || v.make || 'Unknown',
      model: v.modelEn || v.model || 'Unknown',
      year: v.year,
      vin: generateVIN(index),
      mileage: v.mileageKm || 0,
      mileageDisplay: v.mileage || '0 km',
      color: (v.colorEn || v.color || 'Unknown').trim(),
      grade: v.gradeEn || v.grade || '',
      modelCode: v.modelCode || '',
      transmission: v.transmissionEn || v.transmission || 'Automatic',
      displacement: v.displacement || '',
      fuelType: v.fuelType || 'Gasoline',
      exteriorGrade: v.exteriorGrade || '',
      interiorGrade: v.interiorGrade || '',
      score: v.scoreEn || v.score || '',
      images: v.imageUrl || [],
    },
    startingBid,
    currentBid,
    buyNowPrice: index % 3 === 0 ? Math.floor(basePrice * 1.1) : undefined, // 10% above stock price
    currency: 'JPY',
    status,
    startTime,
    endTime,
    totalBids,
    watchers: Math.floor(10 + (index * 7) % 150),
    highestBidderId: totalBids > 0 ? `bidder-${index}` : undefined,
    highestBidderName: totalBids > 0 ? bidderNames[index % bidderNames.length] : undefined,
    location: v.location || 'Japan',
    auctionHouse: v.auctionHouse || 'GAO Stock',
    createdAt: new Date(v.dateAvailable || Date.now()),
    updatedAt: new Date(),
  }
})
