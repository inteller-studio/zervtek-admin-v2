'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatsCard } from '@/features/dashboard/components/stats-card'
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
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Gauge,
  LayoutGrid,
  LayoutList,
  MapPin,
  Plus,
  RotateCcw,
  Search as SearchIcon,
  Settings,
} from 'lucide-react'
import { vehicles as initialVehicles, type Vehicle } from './data/vehicles'

export function StockVehicles() {
  const [vehicles] = useState(initialVehicles)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

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

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === 'available').length,
    totalValue: vehicles.reduce((sum, v) => sum + v.price, 0),
    reserved: vehicles.filter((v) => v.status === 'reserved').length,
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

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
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
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <StatsCard
            title='Total Vehicles'
            value={stats.total}
            change={8}
            description='vs last month'
          />
          <StatsCard
            title='Available'
            value={stats.available}
            change={12}
            description='vs last month'
          />
          <StatsCard
            title='Total Value'
            value={stats.totalValue}
            change={15}
            prefix='¥'
            description='vs last month'
          />
          <StatsCard
            title='Reserved'
            value={stats.reserved}
            change={-3}
            description='vs last month'
          />
        </div>

        {/* Search and Filter Bar */}
        <div className='space-y-4'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
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
                  <LayoutGrid className='h-4 w-4' />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('list')}
                  className='h-full rounded-l-none'
                >
                  <LayoutList className='h-4 w-4' />
                </Button>
              </div>
              <Button
                variant={isFilterOpen ? 'default' : 'outline'}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className='relative'
              >
                <Filter className='mr-2 h-4 w-4' />
                Filters
                {hasActiveFilters && (
                  <span className='absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary' />
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant='ghost' size='sm' onClick={clearFilters}>
                  <RotateCcw className='mr-2 h-4 w-4' />
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
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value)
              resetPagination()
            }}
          >
            <TabsList>
              <TabsTrigger value='all'>All ({vehicles.length})</TabsTrigger>
              <TabsTrigger value='available'>
                Available ({vehicles.filter((v) => v.status === 'available').length})
              </TabsTrigger>
              <TabsTrigger value='reserved'>
                Reserved ({vehicles.filter((v) => v.status === 'reserved').length})
              </TabsTrigger>
              <TabsTrigger value='sold'>
                Sold ({vehicles.filter((v) => v.status === 'sold').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
          <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            {paginatedVehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className='group cursor-pointer overflow-hidden rounded-xl border border-border/50 shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg'
                onClick={() => {
                  // Navigate to vehicle details
                  console.log('View vehicle:', vehicle.id)
                }}
              >
                {/* Image Section */}
                <div className='relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 overflow-hidden'>
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <Image
                      src={vehicle.images[1] || vehicle.images[0]}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      fill
                      sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw'
                      className='object-cover transition-transform duration-500 group-hover:scale-105'
                    />
                  ) : (
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <Car className='h-12 w-12 text-muted-foreground/20 transition-transform duration-500 group-hover:scale-110' />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className='absolute left-2 top-2 z-10'>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </div>
                  {/* Score Badge */}
                  {vehicle.score && (
                    <div className='absolute right-2 top-2 z-10'>
                      <span className='inline-flex items-center rounded-full bg-background/90 px-1.5 py-0.5 text-[10px] font-bold backdrop-blur-sm'>
                        {vehicle.score}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <CardContent className='p-2 md:p-3'>
                  {/* Title */}
                  <h3 className='mb-1 truncate text-xs font-bold text-foreground md:text-sm'>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>

                  {/* Specs Row */}
                  <div className='mb-2 flex items-center gap-1 border-b border-border/50 pb-2 text-[10px] text-muted-foreground md:gap-2 md:text-xs'>
                    <span className='font-medium'>{vehicle.mileageDisplay || `${vehicle.mileage.toLocaleString()} km`}</span>
                    <span className='text-muted-foreground/50'>•</span>
                    <span className='truncate'>{vehicle.transmission}</span>
                  </div>

                  {/* Price Section */}
                  <div className='rounded-md bg-muted/50 p-2'>
                    <p className='text-[9px] text-muted-foreground md:text-[10px]'>Price</p>
                    <p className='text-sm font-bold text-foreground md:text-base'>
                      {vehicle.priceDisplay || `¥${vehicle.price.toLocaleString()}`}
                    </p>
                  </div>

                  {/* Grade & Location */}
                  <div className='mt-2 flex items-center justify-between text-[9px] text-muted-foreground md:text-[10px]'>
                    <span className='truncate max-w-[60%]' title={vehicle.grade}>{vehicle.grade}</span>
                    <div className='flex items-center gap-0.5'>
                      <MapPin className='h-2.5 w-2.5' />
                      <span>{vehicle.location}</span>
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
                    onClick={() => console.log('View vehicle:', vehicle.id)}
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
                              <Car className='h-8 w-8 text-muted-foreground/20' />
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
                              <Gauge className='h-3 w-3' />
                              {vehicle.mileageDisplay || `${vehicle.mileage.toLocaleString()} km`}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Settings className='h-3 w-3' />
                              {vehicle.transmission}
                            </span>
                            <span className='flex items-center gap-1'>
                              <MapPin className='h-3 w-3' />
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
                          <Eye className='h-4 w-4' />
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
              <ChevronLeft className='h-4 w-4' />
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
              <ChevronRight className='h-4 w-4' />
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
      </Main>
    </>
  )
}
