import { useQuery } from '@tanstack/react-query'
import { fetchDashboardStats, fetchChartData, fetchRecentActivity } from '@/lib/api/dashboard'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useChartData() {
  return useQuery({
    queryKey: ['chart-data'],
    queryFn: fetchChartData,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: fetchRecentActivity,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time feel
  })
}
