'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfDay } from 'date-fns'
import { MdCalendarToday } from 'react-icons/md'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { useDateNavigation } from '@/hooks/use-date-navigation'
import { StatsCard } from '@/features/dashboard/components/stats-card'

import { requests as allRequests, type ServiceRequest } from '../requests/data/requests'
import { auctions, type Auction } from '../auctions/data/auctions'

import type { ServiceTypeFilter } from './types'
import { ITEMS_PER_PAGE } from './types'

// Components
import { ServicesDateStrip } from './components/services-date-strip'
import { ServicesFilterTabs } from './components/services-filter-tabs'
import { ServiceTasksGrid } from './components/service-tasks-grid'
import { ServicesPagination } from './components/services-pagination'

// Create auction lookup map
const auctionMap = new Map(auctions.map((a) => [a.id, a]))

// Get auction for a request
const getAuctionForRequest = (request: ServiceRequest): Auction | undefined => {
  if (!request.auctionId) return undefined
  return auctionMap.get(request.auctionId)
}

// Get all service requests (translations + inspections)
const initialRequests = allRequests.filter(
  (r) => (r.type === 'translation' && r.title.includes('Auction Sheet')) || r.type === 'inspection'
)

export function Services() {
  const router = useRouter()
  const [requests] = useState<ServiceRequest[]>(initialRequests)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ServiceTypeFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Date Navigation
  const {
    selectedDate,
    dateRangeStart,
    dateRangeLabel,
    visibleDates,
    isCalendarOpen,
    setIsCalendarOpen,
    navigateDate,
    selectDate,
    selectDateRange,
  } = useDateNavigation()

  // Get count for a specific date
  const getDateCount = (date: Date) => {
    return requests.filter((r) => {
      const requestDate =
        r.status === 'completed' && r.completedAt
          ? startOfDay(new Date(r.completedAt))
          : r.auctionId
            ? startOfDay(new Date(getAuctionForRequest(r)?.startTime || r.createdAt))
            : startOfDay(new Date(r.createdAt))
      return requestDate.getTime() === date.getTime()
    }).length
  }

  // Filtered requests by date and type
  const filteredRequests = useMemo(() => {
    let result = [...requests]

    // Filter by date range
    const filterDateStart = dateRangeStart ? startOfDay(dateRangeStart) : selectedDate
    const filterDateEnd = selectedDate

    result = result.filter((r) => {
      const requestDate =
        r.status === 'completed' && r.completedAt
          ? startOfDay(new Date(r.completedAt))
          : r.auctionId
            ? startOfDay(new Date(getAuctionForRequest(r)?.startTime || r.createdAt))
            : startOfDay(new Date(r.createdAt))
      return (
        requestDate.getTime() >= filterDateStart.getTime() &&
        requestDate.getTime() <= filterDateEnd.getTime()
      )
    })

    // Filter by type
    if (typeFilter !== 'all') {
      result = result.filter((r) => r.type === typeFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((r) => {
        const auction = getAuctionForRequest(r)
        const vehicleName = auction
          ? `${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`
          : r.vehicleInfo
            ? `${r.vehicleInfo.year} ${r.vehicleInfo.make} ${r.vehicleInfo.model}`
            : r.title
        return (
          vehicleName.toLowerCase().includes(query) ||
          r.customerName.toLowerCase().includes(query) ||
          auction?.lotNumber.toLowerCase().includes(query) ||
          auction?.auctionHouse.toLowerCase().includes(query)
        )
      })
    }

    // Sort: pending first, then by time
    result.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (b.status === 'pending' && a.status !== 'pending') return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [requests, selectedDate, dateRangeStart, typeFilter, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedDate, typeFilter, searchQuery])

  // Get vehicle info helper
  const getVehicleInfo = (request: ServiceRequest) => {
    const auction = getAuctionForRequest(request)
    if (auction) {
      return {
        name: `${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`,
        lotNo: auction.lotNumber,
        auctionHouse: auction.auctionHouse,
        time: format(new Date(auction.startTime), 'HH:mm'),
        grade: auction.vehicleInfo.grade || 'N/A',
        image: auction.vehicleInfo.images?.[1] || auction.vehicleInfo.images?.[0] || '/placeholder-car.jpg',
      }
    }
    if (request.vehicleInfo) {
      return {
        name: `${request.vehicleInfo.year} ${request.vehicleInfo.make} ${request.vehicleInfo.model}`,
        lotNo: 'N/A',
        auctionHouse: 'N/A',
        time: format(new Date(request.createdAt), 'HH:mm'),
        grade: 'N/A',
        image: '/placeholder-car.jpg',
      }
    }
    return { name: 'Unknown Vehicle', lotNo: 'N/A', auctionHouse: 'N/A', time: 'N/A', grade: 'N/A', image: '/placeholder-car.jpg' }
  }

  // Card click handler - navigate to detail page
  const handleCardClick = (request: ServiceRequest) => {
    router.push(`/tasks/${request.id}`)
  }

  // Calculate stats
  const stats = useMemo(() => {
    const pendingTranslations = requests.filter(r => r.type === 'translation' && r.status === 'pending').length
    const pendingInspections = requests.filter(r => r.type === 'inspection' && (r.status === 'pending' || r.status === 'assigned')).length
    const completedToday = requests.filter(r => {
      if (r.status !== 'completed' || !r.completedAt) return false
      return startOfDay(new Date(r.completedAt)).getTime() === startOfDay(new Date()).getTime()
    }).length
    const inProgress = requests.filter(r => r.status === 'in_progress').length
    return { pendingTranslations, pendingInspections, completedToday, inProgress }
  }, [requests])

  // Date handlers
  const handleDateSelect = (date: Date, label: string) => {
    selectDate(date, label)
    setCurrentPage(1)
  }

  const handleDateRangeSelect = (start: Date | undefined, end: Date, label: string) => {
    selectDateRange(start, end, label)
    setCurrentPage(1)
  }

  return (
    <>
      <Header fixed>
        <Search className='md:w-auto flex-1' />
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 p-4 sm:p-6'>
        {/* Page Header */}
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center'>
              <MdCalendarToday className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Tasks</h1>
              <p className='text-muted-foreground text-sm'>Translations & Inspections</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <StatsCard
            title='Pending Translations'
            value={stats.pendingTranslations}
          />
          <StatsCard
            title='Pending Inspections'
            value={stats.pendingInspections}
          />
          <StatsCard
            title='In Progress'
            value={stats.inProgress}
          />
          <StatsCard
            title='Completed Today'
            value={stats.completedToday}
          />
        </div>

        <ServicesDateStrip
          selectedDate={selectedDate}
          dateRangeStart={dateRangeStart}
          dateRangeLabel={dateRangeLabel}
          visibleDates={visibleDates}
          isCalendarOpen={isCalendarOpen}
          onCalendarOpenChange={setIsCalendarOpen}
          getDateCount={getDateCount}
          onDateSelect={handleDateSelect}
          onNavigate={navigateDate}
          onDateRangeSelect={handleDateRangeSelect}
        />

        <ServicesFilterTabs
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          translationCount={stats.pendingTranslations}
          inspectionCount={stats.pendingInspections}
        />

        <ServiceTasksGrid
          requests={paginatedRequests}
          selectedDate={selectedDate}
          getVehicleInfo={getVehicleInfo}
          onCardClick={handleCardClick}
        />

        <ServicesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRequests.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </Main>
    </>
  )
}
