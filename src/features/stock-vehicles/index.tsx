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
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
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
} from 'react-icons/md'
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
  const [selectedMakes, setSelectedMakes] = useState<string[]>([])
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [yearRange, setYearRange] = useState([2020, 2025])
  const [priceRange, setPriceRange] = useState([0, 10000000])
  const [mileageRange, setMileageRange] = useState([0, 200000])

  // Get unique values for filters
  const uniqueMakes = [...new Set(vehicles.map((v) => v.make))].sort()
  const uniqueColors = [...new Set(vehicles.map((v) => v.exteriorColor))].filter(c => c && c !== 'Unknown').sort()
  const uniqueTransmissions = [...new Set(vehicles.map((v) => v.transmission))].filter(Boolean).sort()

  // Filter logic
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.stockNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.grade && vehicle.grade.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesTab = activeTab === 'all' || vehicle.status === activeTab

      // Advanced filters
      const matchesMake = selectedMakes.length === 0 || selectedMakes.includes(vehicle.make)
      const matchesTransmission =
        selectedTransmissions.length === 0 || selectedTransmissions.includes(vehicle.transmission)
      const matchesColor = selectedColors.length === 0 || selectedColors.includes(vehicle.exteriorColor)
      const matchesYear = vehicle.year >= yearRange[0] && vehicle.year <= yearRange[1]
      const matchesPrice = vehicle.price >= priceRange[0] && vehicle.price <= priceRange[1]
      const matchesMileage =
        vehicle.mileage >= mileageRange[0] && vehicle.mileage <= mileageRange[1]

      return (
        matchesSearch &&
        matchesTab &&
        matchesMake &&
        matchesTransmission &&
        matchesColor &&
        matchesYear &&
        matchesPrice &&
        matchesMileage
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
    selectedMakes,
    selectedTransmissions,
    selectedColors,
    yearRange,
    priceRange,
    mileageRange,
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
    setSelectedMakes([])
    setSelectedTransmissions([])
    setSelectedColors([])
    setYearRange([2020, 2025])
    setPriceRange([0, 10000000])
    setMileageRange([0, 200000])
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

  const hasActiveFilters =
    selectedMakes.length > 0 ||
    selectedTransmissions.length > 0 ||
    selectedColors.length > 0 ||
    yearRange[0] !== 2020 ||
    yearRange[1] !== 2025 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 10000000 ||
    mileageRange[0] !== 0 ||
    mileageRange[1] !== 200000

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
                variant={isFilterOpen ? 'default' : 'outline'}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className='relative'
              >
                <MdFilterList className='mr-2 h-4 w-4' />
                Filters
                {hasActiveFilters && (
                  <span className='absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary' />
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant='ghost' size='sm' onClick={clearFilters}>
                  <MdRefresh className='mr-2 h-4 w-4' />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <CollapsibleContent>
              <Card>
                <CardContent className='pt-6'>
                  <div className='grid gap-6 md:grid-cols-3 lg:grid-cols-4'>
                    {/* Make Filter */}
                    <div className='space-y-3'>
                      <Label>Vehicle Make</Label>
                      <div className='max-h-48 space-y-2 overflow-y-auto'>
                        {uniqueMakes.map((make) => (
                          <div key={make} className='flex items-center space-x-2'>
                            <Checkbox
                              checked={selectedMakes.includes(make)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMakes([...selectedMakes, make])
                                } else {
                                  setSelectedMakes(selectedMakes.filter((m) => m !== make))
                                }
                                resetPagination()
                              }}
                            />
                            <Label className='cursor-pointer text-sm font-normal'>{make}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Transmission Filter */}
                    <div className='space-y-3'>
                      <Label>Transmission</Label>
                      <div className='space-y-2'>
                        {uniqueTransmissions.map((transmission) => (
                          <div key={transmission} className='flex items-center space-x-2'>
                            <Checkbox
                              checked={selectedTransmissions.includes(transmission)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTransmissions([...selectedTransmissions, transmission])
                                } else {
                                  setSelectedTransmissions(
                                    selectedTransmissions.filter((t) => t !== transmission)
                                  )
                                }
                                resetPagination()
                              }}
                            />
                            <Label className='cursor-pointer text-sm font-normal capitalize'>
                              {transmission === 'cvt' ? 'CVT' : transmission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Color Filter */}
                    <div className='space-y-3'>
                      <Label>Exterior Color</Label>
                      <div className='max-h-48 space-y-2 overflow-y-auto'>
                        {uniqueColors.map((color) => (
                          <div key={color} className='flex items-center space-x-2'>
                            <Checkbox
                              checked={selectedColors.includes(color)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedColors([...selectedColors, color])
                                } else {
                                  setSelectedColors(selectedColors.filter((c) => c !== color))
                                }
                                resetPagination()
                              }}
                            />
                            <Label className='cursor-pointer text-sm font-normal'>
                              {color}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Year Range */}
                    <div className='space-y-3'>
                      <Label>
                        Year: {yearRange[0]} - {yearRange[1]}
                      </Label>
                      <Slider
                        value={yearRange}
                        onValueChange={(value) => {
                          setYearRange(value)
                          resetPagination()
                        }}
                        min={2015}
                        max={2025}
                        step={1}
                        className='w-full'
                      />
                    </div>

                    {/* Price Range */}
                    <div className='space-y-3'>
                      <Label>
                        Price: ¥{priceRange[0].toLocaleString()} - ¥{priceRange[1].toLocaleString()}
                      </Label>
                      <Slider
                        value={priceRange}
                        onValueChange={(value) => {
                          setPriceRange(value)
                          resetPagination()
                        }}
                        min={0}
                        max={10000000}
                        step={100000}
                        className='w-full'
                      />
                    </div>

                    {/* Mileage Range */}
                    <div className='space-y-3'>
                      <Label>
                        Mileage: {mileageRange[0].toLocaleString()} - {mileageRange[1].toLocaleString()} km
                      </Label>
                      <Slider
                        value={mileageRange}
                        onValueChange={(value) => {
                          setMileageRange(value)
                          resetPagination()
                        }}
                        min={0}
                        max={200000}
                        step={5000}
                        className='w-full'
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

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

        {/* Results count and items per page */}
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
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
    </>
  )
}
