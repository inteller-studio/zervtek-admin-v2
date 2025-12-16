'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuctionCard } from './components/auction-card'
import { AssistBuyerDrawer } from './components/assist-buyer-drawer'
import { auctions, type Auction } from './data/auctions'
import {
  Search as SearchIcon,
  Gavel,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Hand,
  Clipboard,
  SlidersHorizontal,
  X,
  HelpCircle,
  Car,
  Cog,
  Copy,
  Check,
  Share2,
  Download,
  Heart,
  MapPin,
  Camera,
  Send,
  Calendar,
  Gauge,
  Palette,
  Settings2,
  Info,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Filter constants
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

// Colors with actual hex values for visual swatches
const colors = [
  { name: 'White', value: 'white', hex: '#FFFFFF', border: true },
  { name: 'Silver', value: 'silver', hex: '#C0C0C0' },
  { name: 'Black', value: 'black', hex: '#1a1a1a' },
  { name: 'Gray', value: 'gray', hex: '#6B7280' },
  { name: 'Red', value: 'red', hex: '#DC2626' },
  { name: 'Blue', value: 'blue', hex: '#2563EB' },
  { name: 'Brown', value: 'brown', hex: '#78350F' },
  { name: 'Green', value: 'green', hex: '#16A34A' },
  { name: 'Yellow', value: 'yellow', hex: '#EAB308' },
  { name: 'Orange', value: 'orange', hex: '#EA580C' },
  { name: 'Purple', value: 'purple', hex: '#7C3AED' },
  { name: 'Gold', value: 'gold', hex: '#CA8A04' },
]

// Auction scores with descriptions
const auctionScoreGroups = [
  { label: 'Excellent', scores: ['S', '6', '5', '4.5'], description: 'Near new condition' },
  { label: 'Good', scores: ['4', '3.5', '3'], description: 'Minor wear, well maintained' },
  { label: 'Fair', scores: ['2', '1', '-'], description: 'Visible wear or damage' },
  { label: 'Special', scores: ['R', 'RA', '***'], description: 'Repaired or special grade' },
]

const vehicleTypes = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Truck', 'Van', 'Convertible', 'Sports Car']

const transmissions = ['Automatic', 'Manual', 'CVT']

const specialVehicles = ['Hybrid', 'Electric', '4WD/AWD', 'Diesel', 'Turbo']

// Equipment with full names
const equipmentItems = [
  { abbr: 'AC', full: 'Air Conditioning' },
  { abbr: 'PS', full: 'Power Steering' },
  { abbr: 'PW', full: 'Power Windows' },
  { abbr: 'AW', full: 'Alloy Wheels' },
  { abbr: 'SR', full: 'Sunroof' },
  { abbr: 'LE', full: 'Leather Seats' },
  { abbr: 'NAV', full: 'Navigation' },
  { abbr: 'TV', full: 'TV/Monitor' },
  { abbr: 'CAM', full: 'Backup Camera' },
  { abbr: 'BT', full: 'Bluetooth' },
  { abbr: 'KEY', full: 'Keyless Entry' },
  { abbr: 'CC', full: 'Cruise Control' },
]

export function Auctions() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [isAssistBuyerOpen, setIsAssistBuyerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Basic filters
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')

  // Advanced search modal
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  // Advanced filter states
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedScores, setSelectedScores] = useState<string[]>([])
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([])
  const [selectedTransmission, setSelectedTransmission] = useState<string[]>([])
  const [selectedSpecialVehicles, setSelectedSpecialVehicles] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [mileageFrom, setMileageFrom] = useState('')
  const [mileageTo, setMileageTo] = useState('')
  const [auctionDateFrom, setAuctionDateFrom] = useState<Date | undefined>()
  const [auctionDateTo, setAuctionDateTo] = useState<Date | undefined>()
  const [lotNumber, setLotNumber] = useState('')
  const [isLHD, setIsLHD] = useState(false)

  // Collapsible states for advanced sections
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  // Detail modal states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Get unique makes and models from data
  const uniqueMakes = useMemo(() => {
    const makes = new Set(auctions.map(a => a.vehicleInfo.make))
    return Array.from(makes).filter(Boolean).sort()
  }, [])

  const availableModels = useMemo(() => {
    if (!make) return []
    const models = new Set(
      auctions
        .filter(a => a.vehicleInfo.make === make)
        .map(a => a.vehicleInfo.model)
    )
    return Array.from(models).filter(Boolean).sort()
  }, [make])

  // Calculate active filter count
  const activeFilterCount = [
    selectedColors.length > 0,
    selectedScores.length > 0,
    selectedVehicleTypes.length > 0,
    selectedTransmission.length > 0,
    selectedSpecialVehicles.length > 0,
    selectedEquipment.length > 0,
    yearFrom,
    yearTo,
    priceFrom,
    priceTo,
    mileageFrom,
    mileageTo,
    auctionDateFrom,
    auctionDateTo,
    lotNumber,
    isLHD,
  ].filter(Boolean).length

  const clearAllFilters = () => {
    setSelectedColors([])
    setSelectedScores([])
    setSelectedVehicleTypes([])
    setSelectedTransmission([])
    setSelectedSpecialVehicles([])
    setSelectedEquipment([])
    setYearFrom('')
    setYearTo('')
    setPriceFrom('')
    setPriceTo('')
    setMileageFrom('')
    setMileageTo('')
    setAuctionDateFrom(undefined)
    setAuctionDateTo(undefined)
    setLotNumber('')
    setIsLHD(false)
  }

  // Generate active filter tags for display
  const getActiveFilterTags = () => {
    const tags: { key: string; label: string }[] = []

    if (yearFrom || yearTo) {
      tags.push({ key: 'year', label: `${yearFrom || 'Any'} - ${yearTo || 'Any'}` })
    }
    if (priceFrom || priceTo) {
      const from = priceFrom ? `¥${parseInt(priceFrom).toLocaleString()}` : 'Any'
      const to = priceTo ? `¥${parseInt(priceTo).toLocaleString()}` : 'Any'
      tags.push({ key: 'price', label: `${from} - ${to}` })
    }
    if (mileageFrom || mileageTo) {
      const from = mileageFrom ? `${parseInt(mileageFrom).toLocaleString()}km` : 'Any'
      const to = mileageTo ? `${parseInt(mileageTo).toLocaleString()}km` : 'Any'
      tags.push({ key: 'mileage', label: `${from} - ${to}` })
    }
    selectedColors.forEach(c => {
      const color = colors.find(col => col.value === c)
      if (color) tags.push({ key: `color-${c}`, label: color.name })
    })
    selectedVehicleTypes.forEach(t => tags.push({ key: `type-${t}`, label: t }))
    selectedTransmission.forEach(t => tags.push({ key: `trans-${t}`, label: t }))
    selectedScores.forEach(s => tags.push({ key: `score-${s}`, label: `Score: ${s}` }))
    selectedSpecialVehicles.forEach(s => tags.push({ key: `special-${s}`, label: s }))
    selectedEquipment.forEach(e => {
      const item = equipmentItems.find(eq => eq.abbr === e)
      tags.push({ key: `equip-${e}`, label: item?.full || e })
    })
    if (isLHD) tags.push({ key: 'lhd', label: 'LHD Only' })
    if (auctionDateFrom || auctionDateTo) {
      const from = auctionDateFrom ? format(auctionDateFrom, 'MMM d') : 'Any'
      const to = auctionDateTo ? format(auctionDateTo, 'MMM d') : 'Any'
      tags.push({ key: 'date', label: `${from} - ${to}` })
    }

    return tags
  }

  const removeFilterTag = (key: string) => {
    if (key === 'year') { setYearFrom(''); setYearTo('') }
    else if (key === 'price') { setPriceFrom(''); setPriceTo('') }
    else if (key === 'mileage') { setMileageFrom(''); setMileageTo('') }
    else if (key === 'date') { setAuctionDateFrom(undefined); setAuctionDateTo(undefined) }
    else if (key === 'lhd') setIsLHD(false)
    else if (key.startsWith('color-')) setSelectedColors(selectedColors.filter(c => c !== key.replace('color-', '')))
    else if (key.startsWith('type-')) setSelectedVehicleTypes(selectedVehicleTypes.filter(t => t !== key.replace('type-', '')))
    else if (key.startsWith('trans-')) setSelectedTransmission(selectedTransmission.filter(t => t !== key.replace('trans-', '')))
    else if (key.startsWith('score-')) setSelectedScores(selectedScores.filter(s => s !== key.replace('score-', '')))
    else if (key.startsWith('special-')) setSelectedSpecialVehicles(selectedSpecialVehicles.filter(s => s !== key.replace('special-', '')))
    else if (key.startsWith('equip-')) setSelectedEquipment(selectedEquipment.filter(e => e !== key.replace('equip-', '')))
    setCurrentPage(1)
  }

  // Extract ID from customer portal URL if pasted
  const extractIdFromUrl = (term: string): string => {
    // Match URLs like https://customer-portal-v3.vercel.app/dashboard/auction/1771597916
    const urlMatch = term.match(/\/auction\/(\d+)/)
    if (urlMatch) {
      return urlMatch[1]
    }
    return term
  }

  // Filtered and sorted auctions
  const filteredAuctions = useMemo(() => {
    let filtered = auctions.filter((auction) => {
      let matchesSearch = true

      if (searchTerm !== '') {
        // Split search term by comma, space, or newline to support multiple lot numbers
        const searchTerms = searchTerm
          .split(/[,\s\n]+/)
          .map(term => extractIdFromUrl(term.trim()).toLowerCase())
          .filter(term => term.length > 0)

        // Check if any search term matches
        matchesSearch = searchTerms.some(term =>
          auction.id.toLowerCase().includes(term) ||
          auction.lotNumber.toLowerCase().includes(term) ||
          auction.auctionId.toLowerCase().includes(term) ||
          auction.vehicleInfo.make.toLowerCase().includes(term) ||
          auction.vehicleInfo.model.toLowerCase().includes(term) ||
          auction.vehicleInfo.vin.toLowerCase().includes(term)
        )
      }

      const matchesStatus = statusFilter === 'all' || auction.status === statusFilter

      // Basic filters
      const matchesMake = !make || auction.vehicleInfo.make === make
      const matchesModel = !model || auction.vehicleInfo.model === model

      // Advanced filters
      const matchesColor = selectedColors.length === 0 ||
        selectedColors.some(c => auction.vehicleInfo.color.toLowerCase().includes(c))

      const matchesScore = selectedScores.length === 0 ||
        selectedScores.includes(auction.vehicleInfo.score)

      const matchesTransmission = selectedTransmission.length === 0 ||
        selectedTransmission.some(t => auction.vehicleInfo.transmission.toLowerCase().includes(t.toLowerCase()))

      const matchesSpecial = selectedSpecialVehicles.length === 0 ||
        selectedSpecialVehicles.some(s => {
          const fuel = auction.vehicleInfo.fuelType?.toLowerCase() || ''
          const grade = auction.vehicleInfo.grade?.toLowerCase() || ''
          return fuel.includes(s.toLowerCase()) || grade.includes(s.toLowerCase())
        })

      const matchesYearFrom = !yearFrom || auction.vehicleInfo.year >= parseInt(yearFrom)
      const matchesYearTo = !yearTo || auction.vehicleInfo.year <= parseInt(yearTo)

      const matchesPriceFrom = !priceFrom || auction.currentBid >= parseInt(priceFrom)
      const matchesPriceTo = !priceTo || auction.currentBid <= parseInt(priceTo)

      const matchesMileageFrom = !mileageFrom || auction.vehicleInfo.mileage >= parseInt(mileageFrom)
      const matchesMileageTo = !mileageTo || auction.vehicleInfo.mileage <= parseInt(mileageTo)

      const matchesAuctionDateFrom = !auctionDateFrom || new Date(auction.startTime) >= auctionDateFrom
      const matchesAuctionDateTo = !auctionDateTo || new Date(auction.startTime) <= auctionDateTo

      // Lot number filter
      const matchesLotNumber = !lotNumber ||
        auction.lotNumber.toLowerCase().includes(lotNumber.toLowerCase()) ||
        auction.id.toLowerCase().includes(lotNumber.toLowerCase())

      // Equipment filter (check in grade field which often contains equipment info)
      const matchesEquipment = selectedEquipment.length === 0 ||
        selectedEquipment.some(e => {
          const grade = auction.vehicleInfo.grade?.toLowerCase() || ''
          return grade.includes(e.toLowerCase())
        })

      // LHD (Left-Hand Drive) filter - typically indicated in grade or other fields
      // For Japanese auctions, most cars are RHD, so LHD is usually noted
      const matchesLHD = !isLHD ||
        auction.vehicleInfo.grade?.toLowerCase().includes('lhd') ||
        auction.vehicleInfo.grade?.toLowerCase().includes('left')

      return matchesSearch && matchesStatus && matchesMake && matchesModel &&
        matchesColor && matchesScore && matchesTransmission && matchesSpecial &&
        matchesYearFrom && matchesYearTo && matchesPriceFrom && matchesPriceTo &&
        matchesMileageFrom && matchesMileageTo && matchesAuctionDateFrom && matchesAuctionDateTo &&
        matchesLotNumber && matchesEquipment && matchesLHD
    })

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'price-high':
        filtered.sort((a, b) => b.currentBid - a.currentBid)
        break
      case 'price-low':
        filtered.sort((a, b) => a.currentBid - b.currentBid)
        break
      case 'ending-soon':
        filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
        break
    }

    return filtered
  }, [searchTerm, statusFilter, sortBy, make, model, selectedColors, selectedScores,
      selectedTransmission, selectedSpecialVehicles, selectedEquipment, yearFrom, yearTo,
      priceFrom, priceTo, mileageFrom, mileageTo, auctionDateFrom, auctionDateTo,
      lotNumber, isLHD])

  // Pagination
  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage)
  const paginatedAuctions = filteredAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handlers
  const handleViewDetails = (auction: Auction) => {
    setSelectedAuction(auction)
    setViewDialogOpen(true)
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setSearchTerm(text)
        setCurrentPage(1)
        toast.success('Pasted from clipboard')
      }
    } catch {
      toast.error('Failed to read clipboard')
    }
  }

  const getStatusBadge = (status: Auction['status']) => {
    const colors: Record<Auction['status'], string> = {
      draft: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
      scheduled: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      active: 'bg-green-500/10 text-green-600 border-green-500/20',
      ended: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      sold: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
    }
    return colors[status]
  }

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
        {/* Page Header */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Auctions</h2>
            <p className='text-muted-foreground'>
              Manage your vehicle auctions and track bidding activity.
            </p>
          </div>
        </div>

        {/* Filters - Row 1: Search, Make, Model */}
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex min-w-[200px] flex-1 gap-2'>
            <div className='relative flex-1'>
              <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Search lot numbers (comma separated)...'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className='pl-10'
              />
            </div>
            <Button
              variant='outline'
              size='icon'
              onClick={handlePasteFromClipboard}
              title='Paste from clipboard'
            >
              <Clipboard className='h-4 w-4' />
            </Button>
          </div>

          {/* Make Filter */}
          <Select value={make} onValueChange={(value) => {
            setMake(value === 'any' ? '' : value)
            setModel('')
            setCurrentPage(1)
          }}>
            <SelectTrigger className='w-[140px]'>
              <Car className='mr-2 h-4 w-4 text-muted-foreground' />
              <SelectValue placeholder='Make' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='any'>Any Make</SelectItem>
              {uniqueMakes.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Model Filter */}
          <Select
            value={model}
            onValueChange={(value) => {
              setModel(value === 'any' ? '' : value)
              setCurrentPage(1)
            }}
            disabled={!make}
          >
            <SelectTrigger className={cn('w-[140px]', !make && 'opacity-50')}>
              <Cog className='mr-2 h-4 w-4 text-muted-foreground' />
              <SelectValue placeholder={make ? 'Model' : 'Select make'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='any'>Any Model</SelectItem>
              {availableModels.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced Search Button */}
          <Button
            variant={activeFilterCount > 0 ? 'default' : 'outline'}
            onClick={() => setIsAdvancedOpen(true)}
            className='gap-2'
          >
            <SlidersHorizontal className='h-4 w-4' />
            Advanced
            {activeFilterCount > 0 && (
              <Badge variant='secondary' className='ml-1 h-5 w-5 rounded-full p-0 text-xs'>
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters - Row 2: Status tabs and sort */}
        <div className='flex flex-wrap items-center gap-4'>
          <Tabs
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}
          >
            <TabsList>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='active'>Active</TabsTrigger>
              <TabsTrigger value='scheduled'>Scheduled</TabsTrigger>
              <TabsTrigger value='ended'>Ended</TabsTrigger>
              <TabsTrigger value='sold'>Sold</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className='ml-auto flex items-center gap-2'>
            {(make || model || activeFilterCount > 0) && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setMake('')
                  setModel('')
                  clearAllFilters()
                  setCurrentPage(1)
                }}
                className='text-muted-foreground hover:text-foreground'
              >
                <X className='mr-1 h-4 w-4' />
                Clear filters
              </Button>
            )}

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Newest First</SelectItem>
                <SelectItem value='oldest'>Oldest First</SelectItem>
                <SelectItem value='price-high'>Price: High to Low</SelectItem>
                <SelectItem value='price-low'>Price: Low to High</SelectItem>
                <SelectItem value='ending-soon'>Ending Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Auction Cards Grid */}
        {paginatedAuctions.length > 0 ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {paginatedAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12'>
            <Gavel className='h-12 w-12 text-muted-foreground' />
            <h3 className='mt-4 text-lg font-semibold'>No auctions found</h3>
            <p className='text-muted-foreground'>Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
        {filteredAuctions.length > itemsPerPage && (
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredAuctions.length)} of{' '}
              {filteredAuctions.length} auctions
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
              <span className='text-sm'>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </Main>

      {/* View Details Dialog - Refined */}
      <Dialog open={viewDialogOpen} onOpenChange={(open) => {
        setViewDialogOpen(open)
        if (!open) setSelectedImageIndex(0)
      }}>
        <DialogContent className='sm:max-w-2xl w-[90vw] max-h-[90vh] !flex !flex-col !gap-0 p-0 overflow-hidden'>
          {selectedAuction && (
            <div className='flex flex-col max-h-[90vh]'>
              {/* Header */}
              <div className='flex items-start justify-between p-6 pb-4'>
                <div className='space-y-1.5 pr-8'>
                  <div className='flex items-center gap-2.5'>
                    <h2 className='text-xl font-semibold text-foreground'>
                      {selectedAuction.vehicleInfo.year} {selectedAuction.vehicleInfo.make} {selectedAuction.vehicleInfo.model}
                    </h2>
                    <Badge
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-md font-medium',
                        selectedAuction.status === 'draft' && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                        selectedAuction.status === 'active' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                        selectedAuction.status === 'scheduled' && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                        selectedAuction.status === 'ended' && 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                        selectedAuction.status === 'sold' && 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                        selectedAuction.status === 'cancelled' && 'bg-red-500/10 text-red-500 border-red-500/20'
                      )}
                    >
                      {selectedAuction.status.charAt(0).toUpperCase() + selectedAuction.status.slice(1)}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedAuction.lotNumber)
                        setCopiedId('lot')
                        setTimeout(() => setCopiedId(null), 2000)
                        toast.success('Lot number copied')
                      }}
                      className='flex items-center gap-1.5 font-mono hover:text-foreground transition-colors group'
                    >
                      <span>Lot: <span className='font-semibold'>{selectedAuction.lotNumber}</span></span>
                      {copiedId === 'lot' ? (
                        <Check className='w-3.5 h-3.5 text-emerald-500' />
                      ) : (
                        <Copy className='w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity' />
                      )}
                    </button>
                    <span className='text-muted-foreground/50'>•</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedAuction.auctionId)
                        setCopiedId('auction')
                        setTimeout(() => setCopiedId(null), 2000)
                        toast.success('Auction ID copied')
                      }}
                      className='flex items-center gap-1.5 font-mono hover:text-foreground transition-colors group'
                    >
                      <span>ID: {selectedAuction.auctionId}</span>
                      {copiedId === 'auction' ? (
                        <Check className='w-3.5 h-3.5 text-emerald-500' />
                      ) : (
                        <Copy className='w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity' />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className='flex-1 overflow-y-auto px-6 pb-6 space-y-6'>
                {/* Image Gallery */}
                <div className='space-y-3'>
                  {/* Main Image */}
                  <div className='relative overflow-hidden rounded-xl bg-muted/20 border border-border/50'>
                    {selectedAuction.vehicleInfo.images.length > 0 ? (
                      <img
                        src={selectedAuction.vehicleInfo.images[selectedImageIndex]}
                        alt={`${selectedAuction.vehicleInfo.make} ${selectedAuction.vehicleInfo.model}`}
                        className='w-full h-72 object-cover'
                      />
                    ) : (
                      <div className='flex flex-col items-center justify-center h-72 text-muted-foreground'>
                        <Camera className='w-12 h-12 mb-2 opacity-50' />
                        <span className='text-sm'>No images available</span>
                      </div>
                    )}
                    {/* Score badge overlay */}
                    {selectedAuction.vehicleInfo.score && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-border/50'>
                            <span className='text-sm font-bold tabular-nums'>
                              Grade: {selectedAuction.vehicleInfo.score}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side='left'>
                          <p className='text-xs'>Japanese auction grade (S is best)</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {/* Image counter */}
                    {selectedAuction.vehicleInfo.images.length > 1 && (
                      <div className='absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium tabular-nums'>
                        {selectedImageIndex + 1} / {selectedAuction.vehicleInfo.images.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {selectedAuction.vehicleInfo.images.length > 1 && (
                    <div className='flex gap-2 overflow-x-auto pb-1'>
                      {selectedAuction.vehicleInfo.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={cn(
                            'relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all duration-150',
                            idx === selectedImageIndex
                              ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                              : 'opacity-60 hover:opacity-100 hover:scale-105'
                          )}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className='w-full h-full object-cover'
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price & Key Info */}
                <div className='bg-muted/30 rounded-xl p-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground mb-1'>Starting Price</p>
                      <p className='text-2xl font-bold text-foreground tabular-nums'>
                        ¥{selectedAuction.startingBid.toLocaleString()}
                      </p>
                    </div>
                    <div className='text-right space-y-1'>
                      <p className='text-sm'>
                        <span className='text-muted-foreground'>Lot:</span>{' '}
                        <span className='font-medium'>{selectedAuction.lotNumber}</span>
                      </p>
                      <p className='text-sm'>
                        <span className='text-muted-foreground'>House:</span>{' '}
                        <span className='font-medium'>{selectedAuction.auctionHouse}</span>
                      </p>
                      <p className='text-sm'>
                        <span className='text-muted-foreground'>Date:</span>{' '}
                        <span className='font-medium tabular-nums'>{format(new Date(selectedAuction.startTime), 'MMM d, yyyy')}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>
                    Vehicle Information
                  </h3>
                  <div className='space-y-2.5'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Make</span>
                      <span className='font-medium'>{selectedAuction.vehicleInfo.make}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Model</span>
                      <span className='font-medium'>{selectedAuction.vehicleInfo.model}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Year</span>
                      <span className='font-medium tabular-nums'>{selectedAuction.vehicleInfo.year}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Grade</span>
                      <span className='font-medium max-w-[200px] text-right truncate'>
                        {selectedAuction.vehicleInfo.grade || '—'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Displacement</span>
                      <span className='font-medium'>{selectedAuction.vehicleInfo.displacement || '—'}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>VIN</span>
                      <span className='font-medium font-mono text-xs'>
                        {selectedAuction.vehicleInfo.vin || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className='bg-border/50' />

                {/* Auction Details */}
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>
                    Auction Details
                  </h3>
                  <div className='space-y-2.5'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground flex items-center gap-1.5'>
                        <Gauge className='w-3.5 h-3.5' />
                        Mileage
                      </span>
                      <span className='font-medium'>{selectedAuction.vehicleInfo.mileageDisplay}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground flex items-center gap-1.5'>
                        <Settings2 className='w-3.5 h-3.5' />
                        Transmission
                      </span>
                      <span className='font-medium'>{selectedAuction.vehicleInfo.transmission}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground flex items-center gap-1.5'>
                        <Palette className='w-3.5 h-3.5' />
                        Color
                      </span>
                      <span className='font-medium'>{selectedAuction.vehicleInfo.color}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground flex items-center gap-1.5'>
                        <MapPin className='w-3.5 h-3.5' />
                        Location
                      </span>
                      <span className='font-medium flex items-center gap-1.5'>
                        {selectedAuction.location}
                        <Badge variant='outline' className='text-[10px] px-1.5 py-0'>JP</Badge>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className='flex items-center justify-between p-4 border-t border-border/50 bg-muted/20'>
                {/* Secondary Actions */}
                <div className='flex items-center gap-1'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-9 w-9 rounded-lg'>
                        <Share2 className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-9 w-9 rounded-lg'>
                        <Download className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download PDF</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-9 w-9 rounded-lg'>
                        <Heart className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add to Watchlist</TooltipContent>
                  </Tooltip>
                </div>

                {/* Primary Actions */}
                <div className='flex items-center gap-2'>
                  {selectedAuction.status === 'draft' && (
                    <Button size='sm'>
                      <Send className='mr-2 h-4 w-4' />
                      Publish
                    </Button>
                  )}
                  {selectedAuction.status === 'active' && (
                    <Button size='sm' onClick={() => setIsAssistBuyerOpen(true)}>
                      <Hand className='mr-2 h-4 w-4' />
                      Assist Buyer
                    </Button>
                  )}
                  {(selectedAuction.status === 'ended' || selectedAuction.status === 'sold') && (
                    <Button variant='outline' size='sm'>
                      <Info className='mr-2 h-4 w-4' />
                      View Results
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assist Buyer Drawer */}
      <AssistBuyerDrawer
        open={isAssistBuyerOpen}
        onOpenChange={setIsAssistBuyerOpen}
        auction={selectedAuction}
        onSuccess={() => {
          setIsAssistBuyerOpen(false)
          setViewDialogOpen(false)
          router.push('/bids')
        }}
      />

      {/* Advanced Search Dialog - Redesigned */}
      <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <DialogContent className='sm:max-w-4xl w-[90vw] max-h-[85vh] overflow-hidden !flex !flex-col !gap-0 p-0'>
          <DialogHeader className='flex-shrink-0 p-6 pb-4 border-b'>
            <div className='flex items-center justify-between'>
              <DialogTitle className='text-lg'>Advanced Search</DialogTitle>
              {activeFilterCount > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearAllFilters}
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

            {/* Primary Filters - Auction Date & Year */}
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Auction Date & Year</h3>
              <div className='grid grid-cols-2 gap-4'>
                {/* Auction Date */}
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Auction Date</Label>
                  <DatePicker
                    date={auctionDateFrom}
                    onDateChange={setAuctionDateFrom}
                    placeholder='Select date'
                  />
                </div>

                {/* Year Range */}
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Year</Label>
                  <div className='grid grid-cols-2 gap-2'>
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
              </div>
            </div>

            {/* Price & Mileage */}
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Price & Mileage</h3>
              <div className='grid grid-cols-2 gap-4'>
                {/* Price Range */}
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Price</Label>
                  <div className='flex gap-2'>
                    <div className='relative flex-1'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>¥</span>
                      <Input
                        type='number'
                        value={priceFrom}
                        onChange={(e) => setPriceFrom(e.target.value)}
                        placeholder='Min'
                        className='h-9 pl-7 rounded-lg'
                      />
                    </div>
                    <div className='relative flex-1'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>¥</span>
                      <Input
                        type='number'
                        value={priceTo}
                        onChange={(e) => setPriceTo(e.target.value)}
                        placeholder='Max'
                        className='h-9 pl-7 rounded-lg'
                      />
                    </div>
                  </div>
                </div>

                {/* Mileage Range */}
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Mileage</Label>
                  <div className='flex gap-2'>
                    <div className='relative flex-1'>
                      <Input
                        type='number'
                        value={mileageFrom}
                        onChange={(e) => setMileageFrom(e.target.value)}
                        placeholder='Min'
                        className='h-9 pr-10 rounded-lg'
                      />
                      <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>km</span>
                    </div>
                    <div className='relative flex-1'>
                      <Input
                        type='number'
                        value={mileageTo}
                        onChange={(e) => setMileageTo(e.target.value)}
                        placeholder='Max'
                        className='h-9 pr-10 rounded-lg'
                      />
                      <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Type - Pill Toggles */}
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Vehicle Type</h3>
              <div className='flex flex-wrap gap-2'>
                {vehicleTypes.map((type) => (
                  <button
                    key={type}
                    type='button'
                    onClick={() => {
                      if (selectedVehicleTypes.includes(type)) {
                        setSelectedVehicleTypes(selectedVehicleTypes.filter(t => t !== type))
                      } else {
                        setSelectedVehicleTypes([...selectedVehicleTypes, type])
                      }
                    }}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border min-w-[80px]',
                      selectedVehicleTypes.includes(type)
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background hover:bg-muted border-border hover:border-muted-foreground/30'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors - Visual Swatches */}
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Color</h3>
              <div className='flex flex-wrap gap-2.5'>
                {colors.map((color) => (
                  <Tooltip key={color.value}>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        onClick={() => {
                          if (selectedColors.includes(color.value)) {
                            setSelectedColors(selectedColors.filter(c => c !== color.value))
                          } else {
                            setSelectedColors([...selectedColors, color.value])
                          }
                        }}
                        className={cn(
                          'w-7 h-7 rounded-full transition-all duration-150',
                          color.border && 'border border-border',
                          selectedColors.includes(color.value)
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                            : 'hover:scale-110 hover:ring-1 hover:ring-muted-foreground/30 hover:ring-offset-1'
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side='bottom' className='text-xs'>
                      {color.name}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Transmission - Pill Toggles */}
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Transmission</h3>
              <div className='flex flex-wrap gap-2'>
                {transmissions.map((trans) => (
                  <button
                    key={trans}
                    type='button'
                    onClick={() => {
                      if (selectedTransmission.includes(trans)) {
                        setSelectedTransmission(selectedTransmission.filter(t => t !== trans))
                      } else {
                        setSelectedTransmission([...selectedTransmission, trans])
                      }
                    }}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border',
                      selectedTransmission.includes(trans)
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background hover:bg-muted border-border hover:border-muted-foreground/30'
                    )}
                  >
                    {trans}
                  </button>
                ))}
              </div>
            </div>

            {/* Auction Score - Grouped with tooltip */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Auction Score</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className='w-3.5 h-3.5 text-muted-foreground/70 cursor-help hover:text-muted-foreground transition-colors' />
                  </TooltipTrigger>
                  <TooltipContent side='right' className='max-w-[220px] p-3'>
                    <p className='text-xs leading-relaxed'>Japanese auction grades: S is best, lower numbers indicate more wear. R means repaired.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className='space-y-2.5 bg-muted/30 rounded-lg p-3'>
                {auctionScoreGroups.map((group) => (
                  <div key={group.label} className='flex items-center gap-4'>
                    <div className='w-16 shrink-0'>
                      <span className='text-xs font-medium text-muted-foreground'>{group.label}</span>
                    </div>
                    <div className='flex gap-1.5'>
                      {group.scores.map((score) => (
                        <button
                          key={score}
                          type='button'
                          onClick={() => {
                            if (selectedScores.includes(score)) {
                              setSelectedScores(selectedScores.filter(s => s !== score))
                            } else {
                              setSelectedScores([...selectedScores, score])
                            }
                          }}
                          className={cn(
                            'w-9 h-9 rounded-lg text-xs font-semibold transition-all duration-150 border',
                            selectedScores.includes(score)
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background hover:bg-muted border-border hover:border-muted-foreground/30'
                          )}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  <ChevronDown className={cn('w-4 h-4 transition-transform duration-150', showMoreFilters && 'rotate-180')} />
                  {showMoreFilters ? 'Show less' : 'Show more filters'}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className='space-y-6 pt-6'>

                {/* Special Features - Pill Toggles */}
                <div className='space-y-3'>
                  <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Special Features</h3>
                  <div className='flex flex-wrap gap-2'>
                    {specialVehicles.map((vehicle) => (
                      <button
                        key={vehicle}
                        type='button'
                        onClick={() => {
                          if (selectedSpecialVehicles.includes(vehicle)) {
                            setSelectedSpecialVehicles(selectedSpecialVehicles.filter(v => v !== vehicle))
                          } else {
                            setSelectedSpecialVehicles([...selectedSpecialVehicles, vehicle])
                          }
                        }}
                        className={cn(
                          'px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border',
                          selectedSpecialVehicles.includes(vehicle)
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background hover:bg-muted border-border hover:border-muted-foreground/30'
                        )}
                      >
                        {vehicle}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equipment - With full names */}
                <div className='space-y-3'>
                  <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Equipment</h3>
                  <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
                    {equipmentItems.map((item) => (
                      <label
                        key={item.abbr}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 border',
                          selectedEquipment.includes(item.abbr)
                            ? 'bg-muted border-primary/50'
                            : 'hover:bg-muted/50 border-border hover:border-muted-foreground/30'
                        )}
                      >
                        <Checkbox
                          checked={selectedEquipment.includes(item.abbr)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEquipment([...selectedEquipment, item.abbr])
                            } else {
                              setSelectedEquipment(selectedEquipment.filter(e => e !== item.abbr))
                            }
                          }}
                        />
                        <span className='text-sm'>{item.full}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Steering Position - Switch */}
                <div className='flex items-center justify-between rounded-lg bg-muted/30 p-4'>
                  <div>
                    <p className='text-sm font-medium'>Left-Hand Drive Only</p>
                    <p className='text-xs text-muted-foreground'>Show only LHD vehicles</p>
                  </div>
                  <Switch
                    checked={isLHD}
                    onCheckedChange={setIsLHD}
                  />
                </div>

                {/* Lot Number Search */}
                <div className='space-y-2'>
                  <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Lot Number</h3>
                  <div className='relative'>
                    <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      placeholder='Search by lot number or auction ID'
                      className='pl-10 h-10 rounded-lg'
                    />
                  </div>
                </div>

              </CollapsibleContent>
            </Collapsible>

          </div>

          {/* Footer */}
          <DialogFooter className='flex-shrink-0 border-t p-6 pt-4 bg-muted/30'>
            <div className='flex w-full flex-col gap-3'>
              {/* Active Filter Tags */}
              {getActiveFilterTags().length > 0 && (
                <div className='flex flex-wrap gap-2 max-h-[72px] overflow-y-auto py-1'>
                  {getActiveFilterTags().slice(0, 10).map((tag) => (
                    <Badge
                      key={tag.key}
                      variant='secondary'
                      className='gap-1.5 pr-1.5 cursor-pointer hover:bg-destructive/20 transition-colors'
                      onClick={() => removeFilterTag(tag.key)}
                    >
                      {tag.label}
                      <X className='w-3 h-3' />
                    </Badge>
                  ))}
                  {getActiveFilterTags().length > 10 && (
                    <Badge variant='outline' className='text-muted-foreground'>
                      +{getActiveFilterTags().length - 10} more
                    </Badge>
                  )}
                </div>
              )}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>
                    {filteredAuctions.length}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    {filteredAuctions.length === 1 ? 'vehicle found' : 'vehicles found'}
                  </span>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' onClick={() => setIsAdvancedOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    setCurrentPage(1)
                    setIsAdvancedOpen(false)
                  }}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
