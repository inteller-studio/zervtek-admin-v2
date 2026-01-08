'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddVehicleDrawer } from './components/dialogs/add-vehicle-drawer'
import { VehicleDetailModal } from './components/vehicle-detail-modal'
import { toast } from 'sonner'
import { Slider } from '@/components/ui/slider'
import { AnimatedTabs, AnimatedTabsContent, type TabItem } from '@/components/ui/animated-tabs'
import {
  MdBusiness,
  MdDirectionsCar,
  MdChevronLeft,
  MdChevronRight,
  MdVisibility,
  MdFilterList,
  MdSpeed,
  MdGavel,
  MdGridView,
  MdViewList,
  MdLocationOn,
  MdAdd,
  MdRefresh,
  MdSearch,
  MdSettings,
  MdTune,
  MdClose,
  MdExpandMore,
  MdHelp,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import { vehicles as initialVehicles, vendorVehicles as initialVendorVehicles, vendorPartners, type Vehicle, type VehicleSource } from './data/vehicles'


export function StockVehicles() {
  const [auctionVehicles, setAuctionVehicles] = useState(initialVehicles)

  // Vehicle detail modal state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false)

  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsVehicleModalOpen(true)
  }

  const closeVehicleModal = () => {
    setIsVehicleModalOpen(false)
    setSelectedVehicle(null)
  }
  const [vendorVehicles, setVendorVehicles] = useState(initialVendorVehicles)
  const [mainTab, setMainTab] = useState<'auction' | 'vendor'>('auction')

  // Combined vehicles for filtering
  const vehicles = mainTab === 'auction' ? auctionVehicles : vendorVehicles
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('available')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Advanced filter states
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [selectedMakes, setSelectedMakes] = useState<string[]>([])
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [priceFrom, setPriceFrom] = useState<number>(0)
  const [priceTo, setPriceTo] = useState<number>(0)
  const [mileageFrom, setMileageFrom] = useState<number>(0)
  const [mileageTo, setMileageTo] = useState<number>(0)
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  // Keep old range states for compatibility
  const [yearRange, setYearRange] = useState([2020, 2025])
  const [priceRange, setPriceRange] = useState([0, 10000000])
  const [mileageRange, setMileageRange] = useState([0, 200000])

  // Get unique values for filters
  const uniqueMakes = [...new Set(vehicles.map((v) => v.make))].sort()
  const uniqueColors = [...new Set(vehicles.map((v) => v.exteriorColor))].filter(c => c && c !== 'Unknown').sort()
  const uniqueTransmissions = [...new Set(vehicles.map((v) => v.transmission))].filter(Boolean).sort()

  // Available models based on selected make
  const availableModels = useMemo(() => {
    if (!make) return []
    const models = new Set(
      vehicles
        .filter(v => v.make === make)
        .map(v => v.model)
    )
    return Array.from(models).filter(Boolean).sort()
  }, [make, vehicles])

  // Year options
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  // Filter logic
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.stockNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.grade && vehicle.grade.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesTab = activeTab === 'all' || vehicle.status === activeTab

      // Make & Model filters (from advanced modal)
      const matchesMakeDropdown = !make || vehicle.make === make
      const matchesModelDropdown = !model || vehicle.model === model

      // Advanced filters
      const matchesMake = selectedMakes.length === 0 || selectedMakes.includes(vehicle.make)
      const matchesTransmission =
        selectedTransmissions.length === 0 || selectedTransmissions.includes(vehicle.transmission)
      const matchesColor = selectedColors.length === 0 || selectedColors.includes(vehicle.exteriorColor)

      // Year filter (from advanced modal inputs)
      const matchesYearFrom = !yearFrom || vehicle.year >= parseInt(yearFrom)
      const matchesYearTo = !yearTo || vehicle.year <= parseInt(yearTo)

      // Price filter (from advanced modal inputs)
      const matchesPriceFrom = !priceFrom || vehicle.price >= priceFrom
      const matchesPriceTo = !priceTo || vehicle.price <= priceTo

      // Mileage filter (from advanced modal inputs)
      const matchesMileageFrom = !mileageFrom || vehicle.mileage >= mileageFrom
      const matchesMileageTo = !mileageTo || vehicle.mileage <= mileageTo

      return (
        matchesSearch &&
        matchesTab &&
        matchesMakeDropdown &&
        matchesModelDropdown &&
        matchesMake &&
        matchesTransmission &&
        matchesColor &&
        matchesYearFrom &&
        matchesYearTo &&
        matchesPriceFrom &&
        matchesPriceTo &&
        matchesMileageFrom &&
        matchesMileageTo
      )
    })

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime()
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime()
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'mileage-low':
          return a.mileage - b.mileage
        case 'mileage-high':
          return b.mileage - a.mileage
        default:
          return 0
      }
    })

    return filtered
  }, [
    vehicles,
    searchQuery,
    activeTab,
    make,
    model,
    selectedMakes,
    selectedTransmissions,
    selectedColors,
    yearFrom,
    yearTo,
    priceFrom,
    priceTo,
    mileageFrom,
    mileageTo,
    sortBy,
  ])

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredVehicles, currentPage, itemsPerPage])

  const resetPagination = () => {
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setMake('')
    setModel('')
    setSelectedMakes([])
    setSelectedTransmissions([])
    setSelectedColors([])
    setYearFrom('')
    setYearTo('')
    setPriceFrom(0)
    setPriceTo(0)
    setMileageFrom(0)
    setMileageTo(0)
    setActiveTab('all')
    setSortBy('newest')
    resetPagination()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      case 'sold':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate active filter count
  const activeFilterCount = [
    make,
    model,
    selectedMakes.length > 0,
    selectedTransmissions.length > 0,
    selectedColors.length > 0,
    yearFrom,
    yearTo,
    priceFrom,
    priceTo,
    mileageFrom,
    mileageTo,
  ].filter(Boolean).length

  const hasActiveFilters = activeFilterCount > 0

  // Main source tabs configuration
  const mainTabs: TabItem[] = useMemo(() => [
    { id: 'auction', label: 'Auction Stock', icon: MdGavel },
    { id: 'vendor', label: 'Zervtek Stock', icon: MdBusiness },
  ], [])

  // Status tabs configuration with dynamic counts
  const statusTabs: TabItem[] = useMemo(() => [
    { id: 'all', label: 'All', badge: vehicles.length },
    { id: 'available', label: 'Available', badge: vehicles.filter((v) => v.status === 'available').length, badgeColor: 'emerald' as const },
    { id: 'reserved', label: 'Reserved', badge: vehicles.filter((v) => v.status === 'reserved').length, badgeColor: 'amber' as const },
    { id: 'sold', label: 'Sold', badge: vehicles.filter((v) => v.status === 'sold').length },
  ], [vehicles])

  const handleAddVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const vehicle: Vehicle = {
      ...vehicleData,
      id: String(Date.now()),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    // Add to the correct list based on vehicle source
    if (vehicleData.source === 'vendor') {
      setVendorVehicles([vehicle, ...vendorVehicles])
    } else {
      setAuctionVehicles([vehicle, ...auctionVehicles])
    }
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ConfigDrawer />
        </div>
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Stock Vehicles</h2>
            <p className='text-muted-foreground'>Browse vehicle inventory</p>
          </div>
          <div className='flex items-center gap-3'>
            <Badge variant='outline' className='px-3 py-1'>
              {filteredVehicles.length} Vehicles
            </Badge>
            <Button size='xs' onClick={() => setAddDrawerOpen(true)}>
              <MdAdd />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Main Source Tabs */}
        <AnimatedTabs
          tabs={mainTabs}
          value={mainTab}
          onValueChange={(v) => setMainTab(v as 'auction' | 'vendor')}
          variant='compact'
        >
          <AnimatedTabsContent value='auction' className='mt-4 space-y-4'>
        {/* Search and Filter Bar */}
        <div className='space-y-4'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <MdSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search by make, model, VIN, or stock number...'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  resetPagination()
                }}
                className='pl-10'
              />
            </div>
            <div className='flex gap-2'>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value)
                  resetPagination()
                }}
              >
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='newest'>Newest First</SelectItem>
                  <SelectItem value='oldest'>Oldest First</SelectItem>
                  <SelectItem value='price-low'>Price: Low to High</SelectItem>
                  <SelectItem value='price-high'>Price: High to Low</SelectItem>
                  <SelectItem value='mileage-low'>Mileage: Low to High</SelectItem>
                  <SelectItem value='mileage-high'>Mileage: High to Low</SelectItem>
                </SelectContent>
              </Select>
              <div className='flex items-center rounded-lg border'>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('grid')}
                  className='h-full rounded-r-none'
                >
                  <MdGridView className='h-4 w-4' />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('list')}
                  className='h-full rounded-l-none'
                >
                  <MdViewList className='h-4 w-4' />
                </Button>
              </div>
              <Button
                variant={activeFilterCount > 0 ? 'default' : 'outline'}
                onClick={() => setIsAdvancedOpen(true)}
                className='gap-2'
              >
                <MdTune className='h-4 w-4' />
                Advanced
                {activeFilterCount > 0 && (
                  <Badge variant='secondary' className='ml-1 h-5 w-5 rounded-full p-0 text-xs'>
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant='ghost' size='sm' onClick={clearFilters}>
                  <MdClose className='mr-2 h-4 w-4' />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Status Tabs */}
          <AnimatedTabs
            tabs={statusTabs}
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value)
              resetPagination()
            }}
            variant='compact'
          />
        </div>

        {/* Vehicle Grid / List View */}
        {viewMode === 'grid' ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {paginatedVehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className='group cursor-pointer overflow-hidden transition-all hover:shadow-md !py-0 !gap-0'
                onClick={() => handleViewVehicle(vehicle)}
              >
                <CardContent className='p-0'>
                  {/* Image Section */}
                  <div className='relative h-44 w-full overflow-hidden bg-muted'>
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <Image
                        src={vehicle.images[1] || vehicle.images[0]}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        fill
                        sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw'
                        className='object-cover transition-transform group-hover:scale-105'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center bg-muted'>
                        <MdDirectionsCar className='h-12 w-12 text-muted-foreground/20' />
                      </div>
                    )}
                    {/* Score Badge */}
                    {vehicle.score && (
                      <div className='absolute right-2 top-2'>
                        <Badge variant='secondary' className='bg-black/70 text-white text-[10px] px-1.5 py-0.5'>
                          {vehicle.score}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className='p-4'>
                    {/* Title */}
                    <div>
                      <h3 className='truncate text-sm font-semibold'>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className='truncate text-xs text-muted-foreground'>
                        {vehicle.grade || vehicle.stockNumber}
                      </p>
                    </div>

                    {/* Vehicle Info */}
                    <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                      <span>{vehicle.mileageDisplay || `${vehicle.mileage.toLocaleString()} km`}</span>
                      <span className='text-muted-foreground/50'>•</span>
                      <span>{vehicle.transmission}</span>
                      <span className='text-muted-foreground/50'>•</span>
                      <span>{vehicle.exteriorColor}</span>
                    </div>

                    {/* Price & Stock Info */}
                    <div className='mt-3 border-t pt-3'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <p className='text-xs text-muted-foreground'>Price</p>
                          <p className='text-lg font-bold'>
                            {vehicle.priceDisplay || `¥${vehicle.price.toLocaleString()}`}
                          </p>
                        </div>
                        <div className='text-right text-xs'>
                          <p>
                            <span className='text-muted-foreground'>ID:</span>{' '}
                            <span className='font-medium'>{vehicle.stockNumber}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className='p-0'>
              <div className='divide-y'>
                {paginatedVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className='cursor-pointer p-4 transition-colors hover:bg-muted/50'
                    onClick={() => handleViewVehicle(vehicle)}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <div className='relative h-16 w-24 overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/50'>
                          {vehicle.images && vehicle.images.length > 0 ? (
                            <Image
                              src={vehicle.images[1] || vehicle.images[0]}
                              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                              fill
                              sizes='96px'
                              className='object-cover'
                            />
                          ) : (
                            <div className='flex h-full w-full items-center justify-center'>
                              <MdDirectionsCar className='h-8 w-8 text-muted-foreground/20' />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-semibold'>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                            <Badge className={getStatusColor(vehicle.status)}>
                              {vehicle.status}
                            </Badge>
                            {vehicle.score && (
                              <Badge variant='outline'>Score: {vehicle.score}</Badge>
                            )}
                          </div>
                          <div className='mt-1 flex items-center gap-4 text-sm text-muted-foreground'>
                            <span className='flex items-center gap-1'>
                              <MdSpeed className='h-3 w-3' />
                              {vehicle.mileageDisplay || `${vehicle.mileage.toLocaleString()} km`}
                            </span>
                            <span className='flex items-center gap-1'>
                              <MdSettings className='h-3 w-3' />
                              {vehicle.transmission}
                            </span>
                            <span className='flex items-center gap-1'>
                              <MdLocationOn className='h-3 w-3' />
                              {vehicle.location}
                            </span>
                          </div>
                          {vehicle.grade && (
                            <p className='mt-1 text-xs text-muted-foreground truncate max-w-md'>
                              {vehicle.grade}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        <div className='text-right'>
                          <p className='text-xl font-bold text-primary'>
                            {vehicle.priceDisplay || `¥${vehicle.price.toLocaleString()}`}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {vehicle.auctionHouse}
                          </p>
                        </div>
                        <Button variant='ghost' size='sm'>
                          <MdVisibility className='h-4 w-4' />
                          <span className='ml-1 text-xs'>View</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results count and items per page */}
        <div className='flex items-center justify-between pt-4'>
          <p className='text-sm text-muted-foreground'>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
            <span className='mx-2'>•</span>
            <span className='text-green-600 font-medium'>{filteredVehicles.filter(v => v.status === 'available').length} in stock</span>
          </p>
          <div className='flex items-center gap-2'>
            <Label className='text-sm'>Items per page:</Label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='20'>20</SelectItem>
                <SelectItem value='40'>40</SelectItem>
                <SelectItem value='60'>60</SelectItem>
                <SelectItem value='100'>100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-center gap-2 pt-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <MdChevronLeft className='h-4 w-4' />
            </Button>
            <span className='px-4 text-sm'>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <MdChevronRight className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        )}
          </AnimatedTabsContent>
          <AnimatedTabsContent value='vendor' className='mt-4 space-y-4'>
            {/* Zervtek Stock Stats */}
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                {vendorVehicles.length} vehicles from {vendorPartners.length} vendor partners
              </p>
              <Button onClick={() => setAddDrawerOpen(true)}>
                <MdAdd className='mr-2 h-4 w-4' />
                Add Zervtek Vehicle
              </Button>
            </div>

            {vendorVehicles.length === 0 ? (
              /* Empty State */
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-16'>
                  <MdBusiness className='h-16 w-16 text-muted-foreground/30 mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>No Vendor Vehicles</h3>
                  <p className='text-sm text-muted-foreground text-center max-w-md mb-6'>
                    Add vehicles from your trusted vendor partners. These vehicles are manually entered and managed separately from auction stock.
                  </p>
                  <Button onClick={() => setAddDrawerOpen(true)}>
                    <MdAdd className='mr-2 h-4 w-4' />
                    Add First Vendor Vehicle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Vendor Vehicles Grid */
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {vendorVehicles.map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    className='group cursor-pointer overflow-hidden transition-all hover:shadow-md'
                    onClick={() => handleViewVehicle(vehicle)}
                  >
                    <div className='relative aspect-[4/3] overflow-hidden bg-muted'>
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <Image
                          src={vehicle.images[0]}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          fill
                          className='object-cover transition-transform group-hover:scale-105'
                        />
                      ) : (
                        <div className='flex h-full items-center justify-center'>
                          <MdDirectionsCar className='h-12 w-12 text-muted-foreground/30' />
                        </div>
                      )}
                      <Badge
                        className='absolute right-2 top-2'
                        variant={
                          vehicle.status === 'available'
                            ? 'emerald'
                            : vehicle.status === 'reserved'
                              ? 'amber'
                              : 'zinc'
                        }
                      >
                        {vehicle.status}
                      </Badge>
                      <Badge className='absolute left-2 top-2' variant='violet'>
                        Vendor
                      </Badge>
                    </div>
                    <CardContent className='p-4'>
                      <div className='mb-2'>
                        <p className='font-semibold'>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                        {vehicle.grade && (
                          <p className='text-sm text-muted-foreground'>{vehicle.grade}</p>
                        )}
                      </div>
                      <div className='mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <MdSpeed className='h-3 w-3' />
                          {vehicle.mileageDisplay}
                        </span>
                        <span className='flex items-center gap-1'>
                          <MdLocationOn className='h-3 w-3' />
                          {vehicle.location}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <p className='text-lg font-bold text-primary'>
                          {vehicle.priceDisplay}
                        </p>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewVehicle(vehicle)
                          }}
                        >
                          <MdVisibility className='h-4 w-4' />
                        </Button>
                      </div>
                      {vehicle.vendorName && (
                        <div className='mt-2 pt-2 border-t'>
                          <p className='text-xs text-muted-foreground flex items-center gap-1'>
                            <MdBusiness className='h-3 w-3' />
                            {vehicle.vendorName}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </AnimatedTabsContent>
        </AnimatedTabs>
      </Main>

      {/* Add Vehicle Drawer */}
      <AddVehicleDrawer
        open={addDrawerOpen}
        onOpenChange={setAddDrawerOpen}
        onAddVehicle={handleAddVehicle}
        defaultSource={mainTab}
      />

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        open={isVehicleModalOpen}
        onClose={closeVehicleModal}
        onCreateInvoice={(vehicle) => {
          toast.success(`Creating invoice for ${vehicle.year} ${vehicle.make} ${vehicle.model}`)
          closeVehicleModal()
        }}
        onEdit={(vehicle) => {
          toast.info(`Edit vehicle: ${vehicle.stockNumber}`)
          closeVehicleModal()
        }}
        onDelete={(vehicle) => {
          toast.success(`Vehicle ${vehicle.stockNumber} deleted`)
          closeVehicleModal()
        }}
      />

      {/* Advanced Search Dialog */}
      <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <DialogContent className='sm:max-w-3xl w-[90vw] max-h-[85vh] overflow-hidden !flex !flex-col !gap-0 p-0'>
          <DialogHeader className='flex-shrink-0 p-6 pb-4 border-b'>
            <div className='flex items-center justify-between'>
              <DialogTitle className='text-lg'>Advanced Search</DialogTitle>
              {activeFilterCount > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearFilters}
                  className='text-muted-foreground hover:text-foreground h-8'
                >
                  Clear all
                </Button>
              )}
            </div>
            <DialogDescription>
              Refine your search with additional filters
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className='flex-1 overflow-y-auto px-6 py-4 space-y-6'>

            {/* Make & Model */}
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Make & Model</h3>
              <div className='grid grid-cols-2 gap-4'>
                {/* Make Filter */}
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Make</Label>
                  <Select value={make} onValueChange={(value) => {
                    setMake(value === 'any' ? '' : value)
                    setModel('')
                  }}>
                    <SelectTrigger className='h-9 w-full'>
                      <MdDirectionsCar className='mr-2 h-4 w-4 text-muted-foreground' />
                      <SelectValue placeholder='Any Make' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='any'>Any Make</SelectItem>
                      {uniqueMakes.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Filter */}
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Model</Label>
                  <Select
                    value={model}
                    onValueChange={(value) => {
                      setModel(value === 'any' ? '' : value)
                    }}
                    disabled={!make}
                  >
                    <SelectTrigger className={cn('h-9 w-full', !make && 'opacity-50')}>
                      <MdSettings className='mr-2 h-4 w-4 text-muted-foreground' />
                      <SelectValue placeholder={make ? 'Any Model' : 'Select make first'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='any'>Any Model</SelectItem>
                      {availableModels.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Year */}
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Year</h3>
              <div className='grid grid-cols-2 gap-4'>
                <Select value={yearFrom} onValueChange={(v) => setYearFrom(v === 'any' ? '' : v)}>
                  <SelectTrigger className='h-9 w-full'>
                    <SelectValue placeholder='From' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='any'>Any</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={yearTo} onValueChange={(v) => setYearTo(v === 'any' ? '' : v)}>
                  <SelectTrigger className='h-9 w-full'>
                    <SelectValue placeholder='To' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='any'>Any</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price & Mileage */}
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Price & Mileage</h3>
              <div className='grid grid-cols-2 gap-4'>
                {/* Price Range */}
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Price (¥)</Label>
                  <div className='flex gap-2'>
                    <NumericInput
                      value={priceFrom}
                      onChange={setPriceFrom}
                      placeholder='Min'
                      className='h-9 rounded-lg'
                    />
                    <NumericInput
                      value={priceTo}
                      onChange={setPriceTo}
                      placeholder='Max'
                      className='h-9 rounded-lg'
                    />
                  </div>
                </div>

                {/* Mileage Range */}
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Mileage (km)</Label>
                  <div className='flex gap-2'>
                    <NumericInput
                      value={mileageFrom}
                      onChange={setMileageFrom}
                      placeholder='Min'
                      className='h-9 rounded-lg'
                    />
                    <NumericInput
                      value={mileageTo}
                      onChange={setMileageTo}
                      placeholder='Max'
                      className='h-9 rounded-lg'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transmission - Pill Toggles */}
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Transmission</h3>
              <div className='flex flex-wrap gap-2'>
                {uniqueTransmissions.map((trans) => (
                  <button
                    key={trans}
                    type='button'
                    onClick={() => {
                      if (selectedTransmissions.includes(trans)) {
                        setSelectedTransmissions(selectedTransmissions.filter(t => t !== trans))
                      } else {
                        setSelectedTransmissions([...selectedTransmissions, trans])
                      }
                    }}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border',
                      selectedTransmissions.includes(trans)
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background hover:bg-muted border-border hover:border-muted-foreground/30'
                    )}
                  >
                    {trans === 'cvt' ? 'CVT' : trans}
                  </button>
                ))}
              </div>
            </div>

            {/* More Filters - Collapsible */}
            <Collapsible open={showMoreFilters} onOpenChange={setShowMoreFilters}>
              <CollapsibleTrigger asChild>
                <button
                  type='button'
                  className='flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150'
                >
                  <MdExpandMore className={cn('w-4 h-4 transition-transform duration-150', showMoreFilters && 'rotate-180')} />
                  {showMoreFilters ? 'Show less' : 'Show more filters'}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className='space-y-6 pt-6'>

                {/* Color Filter */}
                <div className='space-y-3'>
                  <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Exterior Color</h3>
                  <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
                    {uniqueColors.map((color) => (
                      <label
                        key={color}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 border',
                          selectedColors.includes(color)
                            ? 'bg-muted border-primary/50'
                            : 'hover:bg-muted/50 border-border hover:border-muted-foreground/30'
                        )}
                      >
                        <Checkbox
                          checked={selectedColors.includes(color)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedColors([...selectedColors, color])
                            } else {
                              setSelectedColors(selectedColors.filter(c => c !== color))
                            }
                          }}
                        />
                        <span className='text-sm'>{color}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </CollapsibleContent>
            </Collapsible>

          </div>

          {/* Footer */}
          <DialogFooter className='flex-shrink-0 border-t p-6 pt-4 bg-muted/30'>
            <div className='flex w-full items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>
                  {filteredVehicles.length}
                </span>
                <span className='text-sm text-muted-foreground'>
                  {filteredVehicles.length === 1 ? 'vehicle found' : 'vehicles found'}
                </span>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => setIsAdvancedOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  resetPagination()
                  setIsAdvancedOpen(false)
                }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
