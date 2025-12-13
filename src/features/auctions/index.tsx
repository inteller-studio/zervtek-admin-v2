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
import { StatsCard } from '@/features/dashboard/components/stats-card'
import { AuctionCard } from './components/auction-card'
import { AssistBuyerDrawer } from './components/assist-buyer-drawer'
import { auctions, type Auction } from './data/auctions'
import {
  Search as SearchIcon,
  Gavel,
  ChevronLeft,
  ChevronRight,
  Hand,
  Clipboard,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

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

  // Stats calculations
  const stats = useMemo(() => {
    const active = auctions.filter((a) => a.status === 'active').length
    const totalBids = auctions.reduce((sum, a) => sum + a.totalBids, 0)
    const totalValue = auctions
      .filter((a) => a.status === 'active' || a.status === 'sold')
      .reduce((sum, a) => sum + a.currentBid, 0)
    const sold = auctions.filter((a) => a.status === 'sold').length
    return { active, totalBids, totalValue, sold }
  }, [])

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

      return matchesSearch && matchesStatus
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
      case 'bids':
        filtered.sort((a, b) => b.totalBids - a.totalBids)
        break
      case 'ending-soon':
        filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
        break
    }

    return filtered
  }, [searchTerm, statusFilter, sortBy])

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

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <StatsCard
            title='Active Auctions'
            value={stats.active}
            change={12}
            description='currently live'
          />
          <StatsCard
            title='Total Bids'
            value={stats.totalBids}
            change={24}
            description='all auctions'
          />
          <StatsCard
            title='Total Value'
            value={stats.totalValue}
            change={18}
            prefix='¥'
            description='active & sold'
          />
          <StatsCard
            title='Sold'
            value={stats.sold}
            change={8}
            description='completed sales'
          />
        </div>

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex min-w-[250px] flex-1 gap-2'>
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='newest'>Newest First</SelectItem>
              <SelectItem value='oldest'>Oldest First</SelectItem>
              <SelectItem value='price-high'>Price: High to Low</SelectItem>
              <SelectItem value='price-low'>Price: Low to High</SelectItem>
              <SelectItem value='bids'>Most Bids</SelectItem>
              <SelectItem value='ending-soon'>Ending Soon</SelectItem>
            </SelectContent>
          </Select>
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

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
          {selectedAuction && (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  {selectedAuction.vehicleInfo.year} {selectedAuction.vehicleInfo.make}{' '}
                  {selectedAuction.vehicleInfo.model}
                  <Badge variant='outline' className={getStatusBadge(selectedAuction.status)}>
                    {selectedAuction.status.charAt(0).toUpperCase() + selectedAuction.status.slice(1)}
                  </Badge>
                </DialogTitle>
                <DialogDescription className='flex items-center gap-3'>
                  <span>Lot: <strong>{selectedAuction.lotNumber}</strong></span>
                  <span>•</span>
                  <span>Auction ID: {selectedAuction.auctionId}</span>
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-6'>
                {/* Vehicle Image */}
                <div className='overflow-hidden rounded-lg'>
                  {selectedAuction.vehicleInfo.images.length > 0 ? (
                    <img
                      src={selectedAuction.vehicleInfo.images[0]}
                      alt={`${selectedAuction.vehicleInfo.make} ${selectedAuction.vehicleInfo.model}`}
                      className='h-64 w-full object-cover'
                    />
                  ) : (
                    <div className='flex h-64 w-full items-center justify-center bg-muted'>
                      <span className='text-muted-foreground'>No Image Available</span>
                    </div>
                  )}
                </div>

                {/* Multiple Images Preview */}
                {selectedAuction.vehicleInfo.images.length > 1 && (
                  <div className='flex gap-2 overflow-x-auto pb-2'>
                    {selectedAuction.vehicleInfo.images.slice(0, 5).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Image ${idx + 1}`}
                        className='h-16 w-24 flex-shrink-0 rounded-md object-cover'
                      />
                    ))}
                  </div>
                )}

                {/* Bid Information */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='rounded-lg bg-muted/50 p-4 text-center'>
                    <p className='text-sm text-muted-foreground'>Starting Price</p>
                    <p className='text-xl font-bold'>
                      ¥{selectedAuction.startingBid.toLocaleString()}
                    </p>
                  </div>
                  <div className='rounded-lg bg-primary/10 p-4 text-center'>
                    <p className='text-sm text-muted-foreground'>Current Bid</p>
                    <p className='text-xl font-bold text-primary'>
                      ¥{selectedAuction.currentBid.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-3'>
                    <h4 className='font-semibold'>Vehicle Information</h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Make</span>
                        <span>{selectedAuction.vehicleInfo.make}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Model</span>
                        <span>{selectedAuction.vehicleInfo.model}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Year</span>
                        <span>{selectedAuction.vehicleInfo.year}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Grade</span>
                        <span className='text-right max-w-[150px] truncate'>{selectedAuction.vehicleInfo.grade || '-'}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Color</span>
                        <span>{selectedAuction.vehicleInfo.color}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Mileage</span>
                        <span>{selectedAuction.vehicleInfo.mileageDisplay}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Transmission</span>
                        <span>{selectedAuction.vehicleInfo.transmission}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Displacement</span>
                        <span>{selectedAuction.vehicleInfo.displacement || '-'}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Score</span>
                        <span>{selectedAuction.vehicleInfo.score || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <h4 className='font-semibold'>Auction Details</h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Total Bids</span>
                        <span>{selectedAuction.totalBids}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Location</span>
                        <span>{selectedAuction.location}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Auction House</span>
                        <span>{selectedAuction.auctionHouse}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Start Time</span>
                        <span>{format(new Date(selectedAuction.startTime), 'MMM d, yyyy HH:mm')}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>End Time</span>
                        <span>{format(new Date(selectedAuction.endTime), 'MMM d, yyyy HH:mm')}</span>
                      </div>
                      {selectedAuction.highestBidderName && (
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Highest Bidder</span>
                          <span>{selectedAuction.highestBidderName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dialog Footer with Actions */}
              <DialogFooter className='mt-6'>
                <Button variant='outline' onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>

                {/* Active auctions - Assist Buyer */}
                {selectedAuction.status === 'active' && (
                  <Button onClick={() => setIsAssistBuyerOpen(true)}>
                    <Hand className='mr-2 h-4 w-4' />
                    Assist Buyer
                  </Button>
                )}
              </DialogFooter>
            </>
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
    </>
  )
}
