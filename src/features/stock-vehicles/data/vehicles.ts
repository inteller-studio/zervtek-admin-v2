import { stockVehiclesFromSQL } from './stock-vehicles-sql'

export interface Vehicle {
  id: string
  stockNumber: string
  make: string
  model: string
  year: number
  grade: string
  modelCode: string
  mileage: number
  mileageDisplay: string
  price: number
  priceDisplay: string
  status: 'available' | 'reserved' | 'sold'
  transmission: string
  displacement: string
  fuelType: string
  exteriorColor: string
  exteriorGrade: string
  interiorGrade: string
  score: string
  location: string
  auctionHouse: string
  images: string[]
  history: string
  dateAvailable: string
  createdAt: Date
  updatedAt: Date
}

// Transform SQL data to admin dashboard format
export const vehicles: Vehicle[] = stockVehiclesFromSQL.map((v, index) => {
  // Randomly assign status for demo purposes
  const statuses: Vehicle['status'][] = ['available', 'reserved', 'sold']
  const statusWeights = [0.6, 0.25, 0.15] // 60% available, 25% reserved, 15% sold
  const random = Math.random()
  let status: Vehicle['status'] = 'available'
  if (random > statusWeights[0] + statusWeights[1]) {
    status = 'sold'
  } else if (random > statusWeights[0]) {
    status = 'reserved'
  }

  return {
    id: String(v.id),
    stockNumber: `STK-${String(index + 1).padStart(5, '0')}`,
    make: v.makeEn || v.make,
    model: v.modelEn || v.model,
    year: v.year,
    grade: v.gradeEn || v.grade || '',
    modelCode: v.modelCode || '',
    mileage: v.mileageKm || 0,
    mileageDisplay: v.mileage || '0 km',
    price: v.stockPrice,
    priceDisplay: v.stockPriceDisplay,
    status,
    transmission: v.transmissionEn || v.transmission || 'Automatic',
    displacement: v.displacement || '',
    fuelType: v.fuelType || 'Gasoline',
    exteriorColor: (v.colorEn || v.color || 'Unknown').trim(),
    exteriorGrade: v.exteriorGrade || '',
    interiorGrade: v.interiorGrade || '',
    score: v.scoreEn || v.score || '',
    location: v.location || 'Japan',
    auctionHouse: v.auctionHouse || '',
    images: v.imageUrl || [],
    history: v.history || '',
    dateAvailable: v.dateAvailable || '',
    createdAt: new Date(v.dateAvailable || Date.now()),
    updatedAt: new Date(),
  }
})
