import { stockVehiclesFromSQL } from './stock-vehicles-sql'

export type VehicleSource = 'auction' | 'vendor'

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
  source: VehicleSource
  vendorName?: string
  vendorContact?: string
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
    source: 'auction' as VehicleSource,
  }
})

// Sample vendor partners
export const vendorPartners = [
  { name: 'Tokyo Auto Traders', contact: '+81-3-1234-5678' },
  { name: 'Osaka Premium Cars', contact: '+81-6-9876-5432' },
  { name: 'Nagoya Motors Direct', contact: '+81-52-1111-2222' },
  { name: 'Yokohama Car Exchange', contact: '+81-45-3333-4444' },
  { name: 'Fukuoka Auto Partners', contact: '+81-92-5555-6666' },
]

// Vendor stock vehicles (test data)
export const vendorVehicles: Vehicle[] = [
  {
    id: 'vendor-001',
    stockNumber: 'VND-00001',
    make: 'Toyota',
    model: 'Land Cruiser 300',
    year: 2024,
    grade: 'ZX',
    modelCode: 'VJA300W',
    mileage: 5000,
    mileageDisplay: '5,000 km',
    price: 8500000,
    priceDisplay: '¥8,500,000',
    status: 'available',
    transmission: 'Automatic',
    displacement: '3.5L',
    fuelType: 'Gasoline',
    exteriorColor: 'Pearl White',
    exteriorGrade: 'A',
    interiorGrade: 'Black Leather',
    score: '4.5',
    location: 'Tokyo',
    auctionHouse: '',
    images: [],
    history: 'One owner, full service history',
    dateAvailable: '2024-12-01',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date(),
    source: 'vendor',
    vendorName: 'Tokyo Auto Traders',
    vendorContact: '+81-3-1234-5678',
  },
  {
    id: 'vendor-002',
    stockNumber: 'VND-00002',
    make: 'Lexus',
    model: 'LX 600',
    year: 2023,
    grade: 'Executive',
    modelCode: 'URJ201W',
    mileage: 12000,
    mileageDisplay: '12,000 km',
    price: 12000000,
    priceDisplay: '¥12,000,000',
    status: 'available',
    transmission: 'Automatic',
    displacement: '3.5L Twin Turbo',
    fuelType: 'Gasoline',
    exteriorColor: 'Sonic Titanium',
    exteriorGrade: 'S',
    interiorGrade: 'Semi-Aniline Leather',
    score: '5',
    location: 'Osaka',
    auctionHouse: '',
    images: [],
    history: 'Dealer demo vehicle',
    dateAvailable: '2024-11-15',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date(),
    source: 'vendor',
    vendorName: 'Osaka Premium Cars',
    vendorContact: '+81-6-9876-5432',
  },
  {
    id: 'vendor-003',
    stockNumber: 'VND-00003',
    make: 'Mercedes-Benz',
    model: 'G63 AMG',
    year: 2024,
    grade: 'AMG Line',
    modelCode: 'W463',
    mileage: 3000,
    mileageDisplay: '3,000 km',
    price: 22000000,
    priceDisplay: '¥22,000,000',
    status: 'reserved',
    transmission: 'Automatic',
    displacement: '4.0L V8 Biturbo',
    fuelType: 'Gasoline',
    exteriorColor: 'Obsidian Black',
    exteriorGrade: 'S',
    interiorGrade: 'Nappa Leather',
    score: '5',
    location: 'Tokyo',
    auctionHouse: '',
    images: [],
    history: 'Brand new condition',
    dateAvailable: '2024-12-10',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date(),
    source: 'vendor',
    vendorName: 'Tokyo Auto Traders',
    vendorContact: '+81-3-1234-5678',
  },
  {
    id: 'vendor-004',
    stockNumber: 'VND-00004',
    make: 'Porsche',
    model: 'Cayenne Turbo GT',
    year: 2023,
    grade: 'Turbo GT',
    modelCode: '9YA',
    mileage: 8500,
    mileageDisplay: '8,500 km',
    price: 18500000,
    priceDisplay: '¥18,500,000',
    status: 'available',
    transmission: 'Automatic',
    displacement: '4.0L V8',
    fuelType: 'Gasoline',
    exteriorColor: 'Carmine Red',
    exteriorGrade: 'A',
    interiorGrade: 'Black/Red Leather',
    score: '4.5',
    location: 'Nagoya',
    auctionHouse: '',
    images: [],
    history: 'Full Porsche service history',
    dateAvailable: '2024-11-20',
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date(),
    source: 'vendor',
    vendorName: 'Nagoya Motors Direct',
    vendorContact: '+81-52-1111-2222',
  },
  {
    id: 'vendor-005',
    stockNumber: 'VND-00005',
    make: 'BMW',
    model: 'X7 M60i',
    year: 2024,
    grade: 'M Sport',
    modelCode: 'G07',
    mileage: 2000,
    mileageDisplay: '2,000 km',
    price: 15800000,
    priceDisplay: '¥15,800,000',
    status: 'available',
    transmission: 'Automatic',
    displacement: '4.4L V8',
    fuelType: 'Gasoline',
    exteriorColor: 'Marina Bay Blue',
    exteriorGrade: 'S',
    interiorGrade: 'Merino Leather',
    score: '5',
    location: 'Yokohama',
    auctionHouse: '',
    images: [],
    history: 'Ex-showroom vehicle',
    dateAvailable: '2024-12-05',
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date(),
    source: 'vendor',
    vendorName: 'Yokohama Car Exchange',
    vendorContact: '+81-45-3333-4444',
  },
  {
    id: 'vendor-006',
    stockNumber: 'VND-00006',
    make: 'Range Rover',
    model: 'Sport SVR',
    year: 2023,
    grade: 'SVR Carbon Edition',
    modelCode: 'L461',
    mileage: 15000,
    mileageDisplay: '15,000 km',
    price: 16500000,
    priceDisplay: '¥16,500,000',
    status: 'available',
    transmission: 'Automatic',
    displacement: '5.0L V8 Supercharged',
    fuelType: 'Gasoline',
    exteriorColor: 'Santorini Black',
    exteriorGrade: 'A',
    interiorGrade: 'Windsor Leather',
    score: '4',
    location: 'Fukuoka',
    auctionHouse: '',
    images: [],
    history: 'One owner, garaged',
    dateAvailable: '2024-11-25',
    createdAt: new Date('2024-11-25'),
    updatedAt: new Date(),
    source: 'vendor',
    vendorName: 'Fukuoka Auto Partners',
    vendorContact: '+81-92-5555-6666',
  },
]
