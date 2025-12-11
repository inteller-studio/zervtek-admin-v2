'use client'

import { useState, useMemo, useCallback } from 'react'
import { type WonAuction } from '../data/won-auctions'
import { type FilterState, type SortOption } from '../types'

const defaultFilters: FilterState = {
  search: '',
  status: 'all',
  paymentStatus: 'all',
  dateRange: {},
  valueRange: {},
  destinationPort: [],
  vinSearch: '',
}

export function useWonAuctionsFilters(auctions: WonAuction[]) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [sortBy, setSortBy] = useState<SortOption>('date-newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const filteredAndSorted = useMemo(() => {
    let result = auctions.filter((auction) => {
      // Search filter (make, model, customer name, auction ID)
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        !filters.search ||
        auction.vehicleInfo.make.toLowerCase().includes(searchLower) ||
        auction.vehicleInfo.model.toLowerCase().includes(searchLower) ||
        auction.winnerName.toLowerCase().includes(searchLower) ||
        auction.auctionId.toLowerCase().includes(searchLower)

      // VIN search
      const matchesVin =
        !filters.vinSearch ||
        auction.vehicleInfo.vin.toLowerCase().includes(filters.vinSearch.toLowerCase())

      // Status filter
      const matchesStatus = filters.status === 'all' || auction.status === filters.status

      // Payment status filter
      const matchesPayment =
        filters.paymentStatus === 'all' || auction.paymentStatus === filters.paymentStatus

      // Date range filter
      const auctionDate = new Date(auction.auctionEndDate)
      const matchesDateFrom = !filters.dateRange.from || auctionDate >= filters.dateRange.from
      const matchesDateTo = !filters.dateRange.to || auctionDate <= filters.dateRange.to

      // Value range filter
      const matchesValueMin =
        filters.valueRange.min === undefined || auction.totalAmount >= filters.valueRange.min
      const matchesValueMax =
        filters.valueRange.max === undefined || auction.totalAmount <= filters.valueRange.max

      // Destination port filter
      const matchesPort =
        filters.destinationPort.length === 0 ||
        (auction.destinationPort && filters.destinationPort.includes(auction.destinationPort))

      return (
        matchesSearch &&
        matchesVin &&
        matchesStatus &&
        matchesPayment &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesValueMin &&
        matchesValueMax &&
        matchesPort
      )
    })

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date-newest':
          return new Date(b.auctionEndDate).getTime() - new Date(a.auctionEndDate).getTime()
        case 'date-oldest':
          return new Date(a.auctionEndDate).getTime() - new Date(b.auctionEndDate).getTime()
        case 'value-high':
          return b.totalAmount - a.totalAmount
        case 'value-low':
          return a.totalAmount - b.totalAmount
        case 'payment-progress':
          return b.paidAmount / b.totalAmount - a.paidAmount / a.totalAmount
        default:
          return 0
      }
    })

    return result
  }, [auctions, filters, sortBy])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSorted.slice(start, start + itemsPerPage)
  }, [filteredAndSorted, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
    setCurrentPage(1)
  }, [])

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }, [])

  const hasActiveFilters =
    filters.search !== '' ||
    filters.vinSearch !== '' ||
    filters.status !== 'all' ||
    filters.paymentStatus !== 'all' ||
    filters.destinationPort.length > 0 ||
    filters.dateRange.from !== undefined ||
    filters.dateRange.to !== undefined ||
    filters.valueRange.min !== undefined ||
    filters.valueRange.max !== undefined

  return {
    filters,
    sortBy,
    currentPage,
    itemsPerPage,
    filteredData: filteredAndSorted,
    paginatedData,
    totalPages,
    totalItems: filteredAndSorted.length,
    hasActiveFilters,
    setFilters,
    setSortBy,
    setCurrentPage,
    setItemsPerPage,
    resetFilters,
    updateFilter,
  }
}
