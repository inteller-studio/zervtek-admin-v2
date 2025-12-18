// Yard Types for vehicle storage/staging locations

export interface Yard {
  id: string
  name: string
  address: string
  city: string
  prefecture: string // Japanese prefecture
  country: string
  postalCode?: string
  contactPerson: string
  contactEmail?: string
  contactPhone: string
  capacity: number // Maximum vehicles
  currentVehicles: number // Current count
  status: 'active' | 'inactive'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type YardStatus = Yard['status']

export interface YardFormData {
  name: string
  address: string
  city: string
  prefecture: string
  country: string
  postalCode?: string
  contactPerson: string
  contactEmail?: string
  contactPhone: string
  capacity: number
  status: YardStatus
  notes?: string
}

export const YARD_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const

// Common Japanese prefectures for yard locations
export const JAPANESE_PREFECTURES = [
  'Aichi',
  'Chiba',
  'Fukuoka',
  'Hiroshima',
  'Hokkaido',
  'Hyogo',
  'Kanagawa',
  'Kyoto',
  'Nagasaki',
  'Niigata',
  'Osaka',
  'Saitama',
  'Shizuoka',
  'Tokyo',
  'Yokohama',
] as const
