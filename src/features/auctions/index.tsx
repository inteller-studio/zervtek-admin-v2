'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
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
import { AuctionCard } from './components/auction-card'
import { AssistBuyerDrawer } from './components/assist-buyer-drawer'
import { auctions, type Auction } from './data/auctions'
import {
  MdSearch,
  MdGavel,
  MdChevronLeft,
  MdChevronRight,
  MdExpandMore,
  MdPanTool,
  MdContentPaste,
  MdTune,
  MdClose,
  MdHelp,
  MdDirectionsCar,
  MdSettings,
  MdContentCopy,
  MdCheck,
  MdZoomIn,
  MdPhotoLibrary,
  MdCalendarToday,
  MdAccountBalance,
  MdLocalOffer,
  MdSpeed,
  MdBuild,
  MdBolt,
  MdAccessTime,
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [priceFrom, setPriceFrom] = useState<number>(0)
  const [priceTo, setPriceTo] = useState<number>(0)
  const [mileageFrom, setMileageFrom] = useState<number>(0)
  const [mileageTo, setMileageTo] = useState<number>(0)
  const [auctionDateFrom, setAuctionDateFrom] = useState<Date | undefined>()
  const [auctionDateTo, setAuctionDateTo] = useState<Date | undefined>()
  const [lotNumber, setLotNumber] = useState('')
  const [isLHD, setIsLHD] = useState(false)

  // Collapsible states for advanced sections
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  // Detail modal states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [copiedLot, setCopiedLot] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [_showThumbnails, setShowThumbnails] = useState(false)

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
    make,
    model,
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
    setMake('')
    setModel('')
    setSelectedColors([])
    setSelectedScores([])
    setSelectedVehicleTypes([])
    setSelectedTransmission([])
    setSelectedSpecialVehicles([])
    setSelectedEquipment([])
    setYearFrom('')
    setYearTo('')
    setPriceFrom(0)
    setPriceTo(0)
    setMileageFrom(0)
    setMileageTo(0)
    setAuctionDateFrom(undefined)
    setAuctionDateTo(undefined)
    setLotNumber('')
    setIsLHD(false)
  }

  // Generate active filter tags for display
  const getActiveFilterTags = () => {
    const tags: { key: string; label: string }[] = []

    if (make) tags.push({ key: 'make', label: make })
    if (model) tags.push({ key: 'model', label: model })
    if (yearFrom || yearTo) {
      tags.push({ key: 'year', label: `${yearFrom || 'Any'} - ${yearTo || 'Any'}` })
    }
    if (priceFrom || priceTo) {
      const from = priceFrom ? `¥${priceFrom.toLocaleString()}` : 'Any'
      const to = priceTo ? `¥${priceTo.toLocaleString()}` : 'Any'
      tags.push({ key: 'price', label: `${from} - ${to}` })
    }
    if (mileageFrom || mileageTo) {
      const from = mileageFrom ? `${mileageFrom.toLocaleString()}km` : 'Any'
      const to = mileageTo ? `${mileageTo.toLocaleString()}km` : 'Any'
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
    if (key === 'make') { setMake(''); setModel('') }
    else if (key === 'model') { setModel('') }
    else if (key === 'year') { setYearFrom(''); setYearTo('') }
    else if (key === 'price') { setPriceFrom(0); setPriceTo(0) }
    else if (key === 'mileage') { setMileageFrom(0); setMileageTo(0) }
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
    const filtered = auctions.filter((auction) => {
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

      const matchesPriceFrom = !priceFrom || auction.currentBid >= priceFrom
      const matchesPriceTo = !priceTo || auction.currentBid <= priceTo

      const matchesMileageFrom = !mileageFrom || auction.vehicleInfo.mileage >= mileageFrom
      const matchesMileageTo = !mileageTo || auction.vehicleInfo.mileage <= mileageTo

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

      return matchesSearch && matchesMake && matchesModel &&
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
  }, [searchTerm, sortBy, make, model, selectedColors, selectedScores,
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

  const _getStatusBadge = (status: Auction['status']) => {
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
          <ConfigDrawer />
        </div>
        <HeaderActions />
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
              <MdSearch className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
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
              <MdContentPaste className='h-4 w-4' />
            </Button>
          </div>

          {/* Advanced Search Button */}
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
        </div>

        {/* Filters - Row 2: Sort */}
        <div className='flex flex-wrap items-center gap-4'>
          <div className='ml-auto flex items-center gap-2'>
            {activeFilterCount > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  clearAllFilters()
                  setCurrentPage(1)
                }}
                className='text-muted-foreground hover:text-foreground'
              >
                <MdClose className='mr-1 h-4 w-4' />
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
            <MdGavel className='h-12 w-12 text-muted-foreground' />
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
                <MdChevronLeft className='h-4 w-4' />
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
                <MdChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </Main>

      {/* View Details Modal - Matching Bids Modal Design */}
      <AnimatePresence>
        {viewDialogOpen && selectedAuction && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
              onClick={() => {
                setViewDialogOpen(false)
                setSelectedImageIndex(0)
                setCopiedLot(false)
                setCopiedLink(false)
                setIsImageDialogOpen(false)
                setShowThumbnails(false)
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2',
                'max-h-[90vh] overflow-hidden rounded-2xl',
                'bg-background shadow-2xl',
                'focus:outline-none',
                'flex flex-col'
              )}
            >
              {/* Header with Title and Close */}
              <div className='flex items-center justify-between px-5 py-4 border-b'>
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0'>
                    <MdDirectionsCar className='h-5 w-5 text-primary' />
                  </div>
                  <div className='min-w-0'>
                    <h2 className='font-semibold truncate'>
                      {selectedAuction.vehicleInfo.year} {selectedAuction.vehicleInfo.make} {selectedAuction.vehicleInfo.model}
                    </h2>
                    <p className='text-xs text-muted-foreground'>Lot #{selectedAuction.lotNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setViewDialogOpen(false)
                    setSelectedImageIndex(0)
                    setCopiedLot(false)
                    setCopiedLink(false)
                    setShowThumbnails(false)
                  }}
                  className='h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors'
                >
                  <MdClose className='h-5 w-5' />
                </button>
              </div>

              {/* Image and Details Row */}
              <div className='px-5 py-4 border-b bg-muted/20'>
                <div className='flex gap-4'>
                  {/* Bigger Image */}
                  {selectedAuction.vehicleInfo.images.length > 0 ? (
                    <button
                      onClick={() => {
                        setSelectedImageIndex(0)
                        setIsImageDialogOpen(true)
                      }}
                      className='h-36 w-52 rounded-lg overflow-hidden bg-muted shrink-0 hover:ring-2 hover:ring-primary/50 transition-all group relative'
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedAuction.vehicleInfo.images[0]}
                        alt={`${selectedAuction.vehicleInfo.make} ${selectedAuction.vehicleInfo.model}`}
                        className='h-full w-full object-cover group-hover:scale-105 transition-transform'
                      />
                      <div className='absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors'>
                        <MdZoomIn className='h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                      </div>
                      {selectedAuction.vehicleInfo.images.length > 1 && (
                        <div className='absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white'>
                          <MdPhotoLibrary className='h-3 w-3' />
                          {selectedAuction.vehicleInfo.images.length}
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className='h-36 w-52 rounded-lg bg-muted shrink-0 flex items-center justify-center'>
                      <span className='text-sm text-muted-foreground'>No image</span>
                    </div>
                  )}

                  {/* Right Side Details */}
                  <div className='flex-1 flex flex-col justify-between min-w-0'>
                    <div className='space-y-1.5'>
                      {selectedAuction.vehicleInfo.score && (
                        <p className='text-sm font-semibold'>Grade {selectedAuction.vehicleInfo.score}</p>
                      )}
                      <p className='text-sm text-muted-foreground'>{selectedAuction.vehicleInfo.mileageDisplay}</p>
                      {selectedAuction.vehicleInfo.transmission && (
                        <p className='text-sm text-muted-foreground'>{selectedAuction.vehicleInfo.transmission.toUpperCase()}</p>
                      )}
                      {selectedAuction.vehicleInfo.color && (
                        <p className='text-sm text-muted-foreground'>{selectedAuction.vehicleInfo.color.toUpperCase()}</p>
                      )}
                    </div>

                    {/* Copy Link */}
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-fit mt-2'
                      onClick={() => {
                        const url = `https://customer-portal-v3.vercel.app/dashboard/auction/${selectedAuction.id}`
                        navigator.clipboard.writeText(url)
                        setCopiedLink(true)
                        setTimeout(() => setCopiedLink(false), 2000)
                        toast.success('Link copied to clipboard')
                      }}
                    >
                      {copiedLink ? (
                        <>
                          <MdCheck className='mr-1.5 h-4 w-4 text-emerald-500' />
                          Copied!
                        </>
                      ) : (
                        <>
                          <MdContentCopy className='mr-1.5 h-4 w-4' />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className='flex-1 overflow-y-auto'>
                {/* Price Section */}
                <div className='px-5 py-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Starting Price</p>
                      <p className='text-3xl font-bold tracking-tight mt-0.5'>
                        ¥{selectedAuction.startingBid.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className='text-sm px-3 py-1.5 font-semibold rounded-md'
                      style={{
                        backgroundColor:
                          selectedAuction.status === 'draft' ? '#f59e0b' :
                          selectedAuction.status === 'active' ? '#10b981' :
                          selectedAuction.status === 'scheduled' ? '#3b82f6' :
                          selectedAuction.status === 'ended' ? '#64748b' :
                          selectedAuction.status === 'sold' ? '#a855f7' :
                          selectedAuction.status === 'cancelled' ? '#ef4444' : '#64748b',
                        color: '#ffffff'
                      }}
                    >
                      {selectedAuction.status.charAt(0).toUpperCase() + selectedAuction.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className='px-5 pb-5 space-y-4'>
                  {/* Info Sections - Two Column Grid */}
                  <div className='grid gap-4 grid-cols-2'>
                    {/* Auction Details */}
                    <div className='rounded-xl bg-muted/30 p-4'>
                      <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                        Auction Details
                      </h3>
                      <div className='space-y-0.5'>
                        <div className='flex justify-between items-center py-2.5'>
                          <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                            <MdAccountBalance className='h-3.5 w-3.5' />
                            House
                          </span>
                          <span className='text-sm font-medium'>{selectedAuction.auctionHouse}</span>
                        </div>
                        <div className='flex justify-between items-center py-2.5'>
                          <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                            <MdLocalOffer className='h-3.5 w-3.5' />
                            Lot No.
                          </span>
                          <div className='flex items-center gap-1.5'>
                            <span className='text-sm font-medium font-mono'>{selectedAuction.lotNumber}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedAuction.lotNumber)
                                setCopiedLot(true)
                                setTimeout(() => setCopiedLot(false), 2000)
                                toast.success('Copied to clipboard')
                              }}
                              className='p-1 rounded hover:bg-muted transition-colors'
                            >
                              {copiedLot ? (
                                <MdCheck className='h-3 w-3 text-emerald-500' />
                              ) : (
                                <MdContentCopy className='h-3 w-3 text-muted-foreground' />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className='flex justify-between items-center py-2.5'>
                          <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                            <MdCalendarToday className='h-3.5 w-3.5' />
                            Date
                          </span>
                          <span className='text-sm font-medium'>{format(new Date(selectedAuction.startTime), 'MMM d, yyyy')}</span>
                        </div>
                        <div className='flex justify-between items-center py-2.5'>
                          <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                            <MdAccessTime className='h-3.5 w-3.5' />
                            End Time
                          </span>
                          <span className='text-sm font-medium'>{format(new Date(selectedAuction.endTime), 'HH:mm')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Specs */}
                    <div className='rounded-xl bg-muted/30 p-4'>
                      <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                        Vehicle Specs
                      </h3>
                      <div className='space-y-0.5'>
                        <div className='flex justify-between items-center py-2.5'>
                          <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                            <MdSpeed className='h-3.5 w-3.5' />
                            Mileage
                          </span>
                          <span className={cn(
                            'text-sm font-medium',
                            selectedAuction.vehicleInfo.mileage > 0 && selectedAuction.vehicleInfo.mileage < 50000 && 'text-emerald-600'
                          )}>
                            {selectedAuction.vehicleInfo.mileageDisplay}
                          </span>
                        </div>
                        <div className='flex justify-between items-center py-2.5'>
                          <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                            <MdBuild className='h-3.5 w-3.5' />
                            Trans
                          </span>
                          <span className='text-sm font-medium'>{selectedAuction.vehicleInfo.transmission}</span>
                        </div>
                        <div className='flex justify-between items-center py-2.5'>
                          <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                            <MdBolt className='h-3.5 w-3.5' />
                            Engine
                          </span>
                          <span className='text-sm font-medium'>{selectedAuction.vehicleInfo.displacement || '—'}</span>
                        </div>
                        <div className='flex justify-between items-center py-2.5'>
                          <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                            <span className='w-3.5 h-3.5 rounded-full border border-muted-foreground/30' style={{ backgroundColor: selectedAuction.vehicleInfo.color?.toLowerCase().includes('white') ? '#fff' : selectedAuction.vehicleInfo.color?.toLowerCase().includes('black') ? '#1a1a1a' : selectedAuction.vehicleInfo.color?.toLowerCase().includes('silver') ? '#C0C0C0' : selectedAuction.vehicleInfo.color?.toLowerCase().includes('red') ? '#DC2626' : selectedAuction.vehicleInfo.color?.toLowerCase().includes('blue') ? '#2563EB' : '#6B7280' }} />
                            Color
                          </span>
                          <span className='text-sm font-medium'>{selectedAuction.vehicleInfo.color}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className='flex items-center justify-between border-t px-5 py-4 bg-background'>
                <div className='flex items-center gap-2'>
                  {selectedAuction.status === 'active' && (
                    <Button
                      size='default'
                      className='h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white'
                      onClick={() => setIsAssistBuyerOpen(true)}
                    >
                      <MdPanTool className='mr-2 h-4 w-4' />
                      Assist Buyer
                    </Button>
                  )}
                </div>
                <Button
                  variant='ghost'
                  className='h-10 rounded-lg text-muted-foreground'
                  onClick={() => {
                    setViewDialogOpen(false)
                    setSelectedImageIndex(0)
                    setCopiedLot(false)
                    setCopiedLink(false)
                    setShowThumbnails(false)
                  }}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                    <MdHelp className='w-3.5 h-3.5 text-muted-foreground/70 cursor-help hover:text-muted-foreground transition-colors' />
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
                  <MdExpandMore className={cn('w-4 h-4 transition-transform duration-150', showMoreFilters && 'rotate-180')} />
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
                    <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
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
                      <MdClose className='w-3 h-3' />
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

      {/* Full-Screen Image Lightbox */}
      <AnimatePresence>
        {isImageDialogOpen && selectedAuction && selectedAuction.vehicleInfo.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[200] bg-black/95'
            onClick={() => setIsImageDialogOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsImageDialogOpen(false)}
              className='absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20'
            >
              <MdClose className='h-6 w-6' />
            </button>

            {/* Image counter */}
            <div className='absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm'>
              {selectedImageIndex + 1} / {selectedAuction.vehicleInfo.images.length}
            </div>

            {/* Main image */}
            <div
              className='flex h-full w-full items-center justify-center p-4 md:p-16 pb-28'
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode='wait'>
                <motion.img
                  key={selectedImageIndex}
                  src={selectedAuction.vehicleInfo.images[selectedImageIndex]}
                  alt={`${selectedAuction.vehicleInfo.make} ${selectedAuction.vehicleInfo.model}`}
                  className='max-h-full max-w-full object-contain rounded-lg'
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            {selectedAuction.vehicleInfo.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? selectedAuction.vehicleInfo.images.length - 1 : prev - 1
                    )
                  }}
                  className='absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20'
                >
                  <MdChevronLeft className='h-8 w-8' />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) =>
                      prev === selectedAuction.vehicleInfo.images.length - 1 ? 0 : prev + 1
                    )
                  }}
                  className='absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20'
                >
                  <MdChevronRight className='h-8 w-8' />
                </button>
              </>
            )}

            {/* Thumbnail strip */}
            {selectedAuction.vehicleInfo.images.length > 1 && (
              <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2 rounded-xl bg-black/50 backdrop-blur-sm'>
                {selectedAuction.vehicleInfo.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImageIndex(idx)
                    }}
                    className={cn(
                      'flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden transition-all',
                      selectedImageIndex === idx
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                        : 'opacity-50 hover:opacity-100'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className='h-full w-full object-cover'
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
