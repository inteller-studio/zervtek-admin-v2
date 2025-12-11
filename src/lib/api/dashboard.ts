import {
  generateMockStats,
  generateUserGrowthData,
  generateCountryData,
  generateVehicleInventoryData,
  generateBidActivityData,
  generateRecentActivity,
  type DashboardStats,
  type ChartData,
  type Activity,
} from './mock-data'

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchDashboardStats(): Promise<DashboardStats> {
  await delay(500)
  return generateMockStats()
}

export async function fetchChartData(): Promise<ChartData> {
  await delay(800)
  return {
    userGrowth: generateUserGrowthData(),
    countryDistribution: generateCountryData(),
    vehicleInventory: generateVehicleInventoryData(),
    bidActivity: generateBidActivityData(),
  }
}

export async function fetchRecentActivity(): Promise<Activity[]> {
  await delay(600)
  return generateRecentActivity()
}
