export interface DashboardStats {
  totalUsers: number
  totalUsersChange: number
  activeAuctions: number
  activeAuctionsChange: number
  totalRevenue: number
  totalRevenueChange: number
  stockVehicles: number
  stockVehiclesChange: number
  publishedBlogs: number
  publishedBlogsChange: number
}

export interface ChartData {
  userGrowth: Array<{ date: string; users: number }>
  countryDistribution: Array<{ country: string; value: number; code: string }>
  vehicleInventory: Array<{ status: string; count: number }>
  bidActivity: Array<{ date: string; bids: number }>
}

export interface Activity {
  id: string
  user: string
  action: string
  item: string
  timestamp: Date
  type: 'bid' | 'registration' | 'auction' | 'blog'
}

// Mock data generation
export const generateMockStats = (): DashboardStats => ({
  totalUsers: 2345,
  totalUsersChange: 12,
  activeAuctions: 48,
  activeAuctionsChange: 5,
  totalRevenue: 124592,
  totalRevenueChange: 18,
  stockVehicles: 156,
  stockVehiclesChange: -3,
  publishedBlogs: 24,
  publishedBlogsChange: 8,
})

export const generateUserGrowthData = () => {
  const data = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 100) + 50,
    })
  }
  return data
}

export const generateCountryData = () => [
  { country: 'Japan', value: 4520, code: 'JP' },
  { country: 'United States', value: 2180, code: 'US' },
  { country: 'Germany', value: 1450, code: 'DE' },
  { country: 'United Kingdom', value: 980, code: 'GB' },
  { country: 'Australia', value: 720, code: 'AU' },
  { country: 'Others', value: 1150, code: 'XX' },
]

export const generateVehicleInventoryData = () => [
  { status: 'Available', count: 89 },
  { status: 'In Auction', count: 34 },
  { status: 'Sold', count: 156 },
  { status: 'Reserved', count: 23 },
  { status: 'Maintenance', count: 12 },
]

export const generateBidActivityData = () => {
  const data = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    // Weekends have fewer bids, weekdays more
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseBids = isWeekend ? 15 : 40
    const variance = Math.floor(Math.random() * 30)
    data.push({
      date: date.toISOString().split('T')[0],
      bids: baseBids + variance,
    })
  }
  return data
}

export const generateRecentActivity = (): Activity[] => [
  {
    id: '1',
    user: 'John Doe',
    action: 'placed a bid',
    item: 'Toyota Camry 2020',
    timestamp: new Date(Date.now() - 2 * 60000),
    type: 'bid',
  },
  {
    id: '2',
    user: 'Jane Smith',
    action: 'registered',
    item: '',
    timestamp: new Date(Date.now() - 15 * 60000),
    type: 'registration',
  },
  {
    id: '3',
    user: 'Mike Johnson',
    action: 'published',
    item: 'Blog: Car Maintenance Tips',
    timestamp: new Date(Date.now() - 60 * 60000),
    type: 'blog',
  },
  {
    id: '4',
    user: 'Sarah Williams',
    action: 'won auction',
    item: 'Honda Civic 2019',
    timestamp: new Date(Date.now() - 120 * 60000),
    type: 'auction',
  },
  {
    id: '5',
    user: 'Robert Brown',
    action: 'listed vehicle',
    item: 'Ford F-150 2021',
    timestamp: new Date(Date.now() - 180 * 60000),
    type: 'auction',
  },
]
