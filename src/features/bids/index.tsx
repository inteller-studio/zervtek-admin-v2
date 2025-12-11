'use client'

import { useState, useMemo } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  Filter,
  Hand,
  Hash,
  LayoutGrid,
  LayoutList,
  Plus,
  RotateCcw,
  Search as SearchIcon,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  UserCog,
} from 'lucide-react'
import { format, differenceInHours, differenceInMinutes } from 'date-fns'
import { bids as initialBids, type Bid } from './data/bids'

export function Bids() {
  const [bids] = useState(initialBids)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Filter states
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedBidderTypes, setSelectedBidderTypes] = useState<string[]>([])
  const [selectedAuctionStatuses, setSelectedAuctionStatuses] = useState<string[]>([])
  const [amountRange, setAmountRange] = useState([0, 100000])
  const [onlyWinning, setOnlyWinning] = useState(false)

  // Modal states
  const [isViewBidModalOpen, setIsViewBidModalOpen] = useState(false)
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)

  // Get unique values for filters
  const uniqueStatuses: Bid['status'][] = ['active', 'outbid', 'winning', 'won', 'lost', 'retracted', 'expired']
  const uniqueTypes: Bid['type'][] = ['manual', 'assisted', 'buy_now']
  const uniqueBidderTypes: Bid['bidder']['type'][] = ['individual', 'dealer', 'corporate']
  const uniqueAuctionStatuses: Bid['auctionStatus'][] = ['live', 'upcoming', 'ended']

  // Filter logic
  const filteredBids = useMemo(() => {
    let filtered = bids.filter((bid) => {
      const matchesSearch =
        bid.bidNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.auctionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.bidder.name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'active' && bid.status === 'active') ||
        (activeTab === 'winning' && bid.status === 'winning') ||
        (activeTab === 'outbid' && bid.status === 'outbid') ||
        (activeTab === 'won' && bid.status === 'won') ||
        (activeTab === 'lost' && bid.status === 'lost')

      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(bid.status)
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(bid.type)
      const matchesBidderType = selectedBidderTypes.length === 0 || selectedBidderTypes.includes(bid.bidder.type)
      const matchesAuctionStatus = selectedAuctionStatuses.length === 0 || selectedAuctionStatuses.includes(bid.auctionStatus)
      const matchesAmount = bid.amount >= amountRange[0] && bid.amount <= amountRange[1]
      const matchesWinning = !onlyWinning || bid.status === 'winning' || bid.status === 'won'

      return matchesSearch && matchesTab && matchesStatus && matchesType &&
        matchesBidderType && matchesAuctionStatus && matchesAmount &&
        matchesWinning
    })

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.timestamp.getTime() - a.timestamp.getTime()
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime()
        case 'amount-high':
          return b.amount - a.amount
        case 'amount-low':
          return a.amount - b.amount
        case 'ending-soon':
          if (!a.timeRemaining && !b.timeRemaining) return 0
          if (!a.timeRemaining) return 1
          if (!b.timeRemaining) return -1
          return a.timeRemaining.getTime() - b.timeRemaining.getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [bids, searchQuery, activeTab, selectedStatuses, selectedTypes, selectedBidderTypes,
    selectedAuctionStatuses, amountRange, onlyWinning, sortBy])

  // Pagination logic
  const totalPages = Math.ceil(filteredBids.length / itemsPerPage)
  const paginatedBids = filteredBids.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const resetPagination = () => {
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedStatuses([])
    setSelectedTypes([])
    setSelectedBidderTypes([])
    setSelectedAuctionStatuses([])
    setAmountRange([0, 100000])
    setOnlyWinning(false)
    setActiveTab('all')
    setSortBy('recent')
    resetPagination()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'winning':
        return 'bg-green-100 text-green-800'
      case 'outbid':
        return 'bg-orange-100 text-orange-800'
      case 'won':
        return 'bg-emerald-100 text-emerald-800'
      case 'lost':
        return 'bg-gray-100 text-gray-800'
      case 'retracted':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'manual':
        return <User className='h-3 w-3' />
      case 'assisted':
        return <UserCog className='h-3 w-3' />
      case 'buy_now':
        return <DollarSign className='h-3 w-3' />
      default:
        return null
    }
  }

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date()
    const hours = differenceInHours(endTime, now)
    const minutes = differenceInMinutes(endTime, now) % 60

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m`
    } else {
      return 'Ended'
    }
  }

  const stats = {
    total: bids.length,
    active: bids.filter((b) => b.status === 'active').length,
    winning: bids.filter((b) => b.status === 'winning').length,
    won: bids.filter((b) => b.status === 'won').length,
    totalValue: bids.reduce((sum, b) => sum + b.amount, 0),
    avgBid: Math.round(bids.reduce((sum, b) => sum + b.amount, 0) / bids.length),
  }

  const hasActiveFilters = selectedStatuses.length > 0 || selectedTypes.length > 0 ||
    selectedBidderTypes.length > 0 || selectedAuctionStatuses.length > 0 ||
    amountRange[0] !== 0 || amountRange[1] !== 100000 ||
    onlyWinning

  const handleViewBid = (bid: Bid) => {
    setSelectedBid(bid)
    setIsViewBidModalOpen(true)
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
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Bids Management</h2>
            <p className='text-muted-foreground'>Track and manage all bidding activities</p>
          </div>
          <div className='flex items-center gap-3'>
            <Badge variant='outline' className='px-3 py-1'>
              {filteredBids.length} Bids
            </Badge>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Assist Customer Bid
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-6'>
          <StatsCard
            title='Total Bids'
            value={stats.total}
            change={18}
            description='vs last month'
          />
          <StatsCard
            title='Active'
            value={stats.active}
            change={5}
            description='vs last month'
          />
          <StatsCard
            title='Winning'
            value={stats.winning}
            change={12}
            description='vs last month'
          />
          <StatsCard
            title='Won'
            value={stats.won}
            change={8}
            description='vs last month'
          />
          <StatsCard
            title='Total Value'
            value={stats.totalValue}
            change={22}
            prefix='$'
            description='vs last month'
          />
          <StatsCard
            title='Avg Bid'
            value={Math.round(stats.avgBid)}
            change={-3}
            prefix='$'
            description='vs last month'
          />
        </div>

        {/* Search and Filter Bar */}
        <div className='space-y-4'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search by bid number, auction, vehicle, or bidder...'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  resetPagination()
                }}
                className='pl-10'
              />
            </div>
            <div className='flex gap-2'>
              <Select value={sortBy} onValueChange={(value) => {
                setSortBy(value)
                resetPagination()
              }}>
                <SelectTrigger className='w-[160px]'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='recent'>Most Recent</SelectItem>
                  <SelectItem value='oldest'>Oldest First</SelectItem>
                  <SelectItem value='amount-high'>Amount: High to Low</SelectItem>
                  <SelectItem value='amount-low'>Amount: Low to High</SelectItem>
                  <SelectItem value='ending-soon'>Ending Soon</SelectItem>
                </SelectContent>
              </Select>
              <div className='flex rounded-lg border'>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('table')}
                  className='rounded-r-none'
                >
                  <LayoutList className='h-4 w-4' />
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('cards')}
                  className='rounded-l-none'
                >
                  <LayoutGrid className='h-4 w-4' />
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
                  <div className='grid gap-6 md:grid-cols-3 lg:grid-cols-5'>
                    {/* Status Filter */}
                    <div className='space-y-3'>
                      <Label>Bid Status</Label>
                      <div className='space-y-2'>
                        {uniqueStatuses.map(status => (
                          <div key={status} className='flex items-center space-x-2'>
                            <Checkbox
                              checked={selectedStatuses.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedStatuses([...selectedStatuses, status])
                                } else {
                                  setSelectedStatuses(selectedStatuses.filter(s => s !== status))
                                }
                                resetPagination()
                              }}
                            />
                            <Label className='cursor-pointer text-sm font-normal capitalize'>
                              {status}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Type Filter */}
                    <div className='space-y-3'>
                      <Label>Bid Type</Label>
                      <div className='space-y-2'>
                        {uniqueTypes.map(type => (
                          <div key={type} className='flex items-center space-x-2'>
                            <Checkbox
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTypes([...selectedTypes, type])
                                } else {
                                  setSelectedTypes(selectedTypes.filter(t => t !== type))
                                }
                                resetPagination()
                              }}
                            />
                            <Label className='cursor-pointer text-sm font-normal capitalize'>
                              {type === 'buy_now' ? 'Buy Now' : type === 'assisted' ? 'Assisted' : type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bidder Type Filter */}
                    <div className='space-y-3'>
                      <Label>Bidder Type</Label>
                      <div className='space-y-2'>
                        {uniqueBidderTypes.map(type => (
                          <div key={type} className='flex items-center space-x-2'>
                            <Checkbox
                              checked={selectedBidderTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedBidderTypes([...selectedBidderTypes, type])
                                } else {
                                  setSelectedBidderTypes(selectedBidderTypes.filter(t => t !== type))
                                }
                                resetPagination()
                              }}
                            />
                            <Label className='cursor-pointer text-sm font-normal capitalize'>
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Auction Status Filter */}
                    <div className='space-y-3'>
                      <Label>Auction Status</Label>
                      <div className='space-y-2'>
                        {uniqueAuctionStatuses.map(status => (
                          <div key={status} className='flex items-center space-x-2'>
                            <Checkbox
                              checked={selectedAuctionStatuses.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAuctionStatuses([...selectedAuctionStatuses, status])
                                } else {
                                  setSelectedAuctionStatuses(selectedAuctionStatuses.filter(s => s !== status))
                                }
                                resetPagination()
                              }}
                            />
                            <Label className='cursor-pointer text-sm font-normal capitalize'>
                              {status}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amount Range */}
                    <div className='space-y-3'>
                      <Label>
                        Bid Amount: ${amountRange[0].toLocaleString()} - ${amountRange[1].toLocaleString()}
                      </Label>
                      <Slider
                        value={amountRange}
                        onValueChange={(value) => {
                          setAmountRange(value)
                          resetPagination()
                        }}
                        min={0}
                        max={100000}
                        step={1000}
                        className='w-full'
                      />
                      <div className='flex items-center space-x-2 pt-2'>
                        <Checkbox
                          checked={onlyWinning}
                          onCheckedChange={(checked) => {
                            setOnlyWinning(checked as boolean)
                            resetPagination()
                          }}
                        />
                        <Label className='cursor-pointer text-sm font-normal'>
                          Only Winning Bids
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value)
            resetPagination()
          }}>
            <TabsList>
              <TabsTrigger value='all'>All Bids</TabsTrigger>
              <TabsTrigger value='active'>Active</TabsTrigger>
              <TabsTrigger value='winning'>Winning</TabsTrigger>
              <TabsTrigger value='outbid'>Outbid</TabsTrigger>
              <TabsTrigger value='won'>Won</TabsTrigger>
              <TabsTrigger value='lost'>Lost</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Results count and items per page */}
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBids.length)} of {filteredBids.length} bids
          </p>
          <div className='flex items-center gap-2'>
            <Label className='text-sm'>Items per page:</Label>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}>
              <SelectTrigger className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='10'>10</SelectItem>
                <SelectItem value='20'>20</SelectItem>
                <SelectItem value='50'>50</SelectItem>
                <SelectItem value='100'>100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bids Display */}
        {viewMode === 'table' ? (
          <Card>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bid #</TableHead>
                    <TableHead>Auction / Vehicle</TableHead>
                    <TableHead>Bidder</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Auction Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell className='font-mono text-sm'>
                        {bid.bidNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='line-clamp-1 font-medium'>{bid.auctionTitle}</p>
                          <p className='text-sm text-muted-foreground'>
                            {bid.vehicle.year} • {bid.vehicle.mileage.toLocaleString()} mi
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{bid.bidder.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {bid.bidder.type} • {bid.bidder.location}
                          </p>
                          {bid.type === 'assisted' && (
                            <Badge variant='outline' className='mt-1 text-xs'>
                              Assisted
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-semibold'>${bid.amount.toLocaleString()}</p>
                          {bid.maxBid && (
                            <p className='text-xs text-muted-foreground'>
                              Max: ${bid.maxBid.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bid.status)}>
                          {bid.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          {getTypeIcon(bid.type)}
                          <span className='text-sm capitalize'>
                            {bid.type === 'buy_now' ? 'Buy Now' : bid.type === 'assisted' ? 'Assisted' : bid.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='text-sm'>{format(bid.timestamp, 'MMM dd')}</p>
                          <p className='text-xs text-muted-foreground'>
                            {format(bid.timestamp, 'h:mm a')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline' className='text-xs'>
                            {bid.auctionStatus}
                          </Badge>
                          {bid.timeRemaining && bid.auctionStatus === 'live' && (
                            <span className='flex items-center gap-1 text-xs text-slate-700'>
                              <Clock className='h-3 w-3' />
                              {getTimeRemaining(bid.timeRemaining)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button variant='ghost' size='sm' onClick={() => handleViewBid(bid)}>
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {paginatedBids.map((bid) => (
              <Card key={bid.id} className='overflow-hidden transition-shadow hover:shadow-lg'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <Hash className='h-4 w-4 text-muted-foreground' />
                        {bid.bidNumber}
                      </CardTitle>
                      <CardDescription className='mt-1'>
                        {format(bid.timestamp, 'MMM dd, yyyy h:mm a')}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(bid.status)}>
                      {bid.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Vehicle Info */}
                  <div>
                    <p className='line-clamp-1 text-sm font-semibold'>{bid.auctionTitle}</p>
                    <p className='text-sm text-muted-foreground'>
                      {bid.vehicle.year} • {bid.vehicle.mileage.toLocaleString()} mi • {bid.vehicle.vin}
                    </p>
                  </div>

                  {/* Bid Amount */}
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-2xl font-bold text-primary'>
                        ${bid.amount.toLocaleString()}
                      </p>
                      {bid.maxBid && (
                        <p className='text-xs text-muted-foreground'>
                          Max bid: ${bid.maxBid.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className='text-right'>
                      <div className='flex items-center gap-1 text-sm'>
                        {getTypeIcon(bid.type)}
                        <span className='capitalize'>
                          {bid.type === 'buy_now' ? 'Buy Now' : bid.type === 'assisted' ? 'Assisted' : bid.type}
                        </span>
                      </div>
                      {bid.status === 'winning' && (
                        <div className='mt-1 flex items-center gap-1 text-xs text-green-600'>
                          <TrendingUp className='h-3 w-3' />
                          Leading
                        </div>
                      )}
                      {bid.status === 'outbid' && (
                        <div className='mt-1 flex items-center gap-1 text-xs text-orange-600'>
                          <TrendingDown className='h-3 w-3' />
                          Outbid by ${(bid.currentHighBid - bid.amount).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bidder Info */}
                  <div className='border-t pt-3'>
                    <div className='flex items-center justify-between text-sm'>
                      <div>
                        <p className='font-medium'>{bid.bidder.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {bid.bidder.type} • {bid.bidder.totalBids} total bids
                        </p>
                        {bid.type === 'assisted' && (
                          <Badge variant='outline' className='mt-1 text-xs'>
                            Assisted
                          </Badge>
                        )}
                      </div>
                      <div className='text-right'>
                        <p className='text-xs text-muted-foreground'>Win Rate</p>
                        <p className='font-medium'>{bid.bidder.winRate}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Auction Info */}
                  <div className='flex items-center justify-between border-t pt-3'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        {bid.auctionStatus}
                      </Badge>
                      {bid.timeRemaining && bid.auctionStatus === 'live' && (
                        <span className='flex items-center gap-1 text-xs text-slate-700'>
                          <Clock className='h-3 w-3' />
                          {getTimeRemaining(bid.timeRemaining)}
                        </span>
                      )}
                    </div>
                    <Button variant='ghost' size='sm' onClick={() => handleViewBid(bid)}>
                      <Eye className='h-4 w-4' />
                      <span className='ml-1 text-xs'>View</span>
                    </Button>
                  </div>

                  {/* Progress to Reserve */}
                  {bid.auctionStatus === 'live' && (
                    <div className='space-y-1'>
                      <div className='flex justify-between text-xs text-muted-foreground'>
                        <span>Current: ${bid.currentHighBid.toLocaleString()}</span>
                        <span>Reserve: ${bid.reservePrice.toLocaleString()}</span>
                      </div>
                      <div className='h-2 overflow-hidden rounded-full bg-secondary'>
                        <div
                          className='h-full bg-primary transition-all'
                          style={{ width: `${Math.min((bid.currentHighBid / bid.reservePrice) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
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
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

      {/* View Bid Modal */}
      <Dialog open={isViewBidModalOpen} onOpenChange={setIsViewBidModalOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Bid Details</DialogTitle>
            <DialogDescription>
              Complete information about bid #{selectedBid?.bidNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedBid && (
            <div className='space-y-6 py-4'>
              {/* Bid Status and Type */}
              <div className='flex items-center justify-between'>
                <Badge className={getStatusColor(selectedBid.status)} variant='outline'>
                  {selectedBid.status.toUpperCase()}
                </Badge>
                <div className='flex items-center gap-2'>
                  {getTypeIcon(selectedBid.type)}
                  <span className='font-medium'>
                    {selectedBid.type === 'buy_now' ? 'Buy Now' :
                      selectedBid.type === 'assisted' ? 'Assisted Bid' : 'Manual Bid'}
                  </span>
                  {selectedBid.type === 'assisted' && (
                    <Badge variant='secondary'>Admin Placed</Badge>
                  )}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className='space-y-2'>
                <h3 className='flex items-center gap-2 font-semibold'>
                  <Car className='h-4 w-4' />
                  Vehicle Information
                </h3>
                <div className='rounded-lg bg-muted p-4'>
                  <p className='font-medium'>{selectedBid.auctionTitle}</p>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    {selectedBid.vehicle.year} • {selectedBid.vehicle.make} {selectedBid.vehicle.model}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    VIN: {selectedBid.vehicle.vin} • Mileage: {selectedBid.vehicle.mileage.toLocaleString()} mi
                  </p>
                </div>
              </div>

              {/* Bidder Information */}
              <div className='space-y-2'>
                <h3 className='flex items-center gap-2 font-semibold'>
                  <User className='h-4 w-4' />
                  Bidder Information
                </h3>
                <div className='rounded-lg bg-muted p-4'>
                  <p className='font-medium'>{selectedBid.bidder.name}</p>
                  <p className='text-sm text-muted-foreground'>
                    {selectedBid.bidder.email}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Type: {selectedBid.bidder.type} • Location: {selectedBid.bidder.location}
                  </p>
                  <div className='mt-2 flex gap-4'>
                    <span className='text-sm'>
                      <strong>Total Bids:</strong> {selectedBid.bidder.totalBids}
                    </span>
                    <span className='text-sm'>
                      <strong>Win Rate:</strong> {selectedBid.bidder.winRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bid Information */}
              <div className='space-y-2'>
                <h3 className='flex items-center gap-2 font-semibold'>
                  <DollarSign className='h-4 w-4' />
                  Bid Information
                </h3>
                <div className='rounded-lg bg-muted p-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Bid Amount</p>
                      <p className='text-xl font-bold'>${selectedBid.amount.toLocaleString()}</p>
                    </div>
                    {selectedBid.maxBid && (
                      <div>
                        <p className='text-sm text-muted-foreground'>Max Bid</p>
                        <p className='text-xl font-bold'>${selectedBid.maxBid.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className='text-sm text-muted-foreground'>Current High Bid</p>
                      <p className='text-lg font-semibold'>${selectedBid.currentHighBid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Reserve Price</p>
                      <p className='text-lg font-semibold'>${selectedBid.reservePrice.toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedBid.previousBid && (
                    <div className='mt-3 border-t pt-3'>
                      <p className='text-sm text-muted-foreground'>
                        Previous Bid: ${selectedBid.previousBid.toLocaleString()}
                        • Increment: ${selectedBid.bidIncrement.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Auction Status */}
              <div className='space-y-2'>
                <h3 className='flex items-center gap-2 font-semibold'>
                  <Calendar className='h-4 w-4' />
                  Auction Details
                </h3>
                <div className='rounded-lg bg-muted p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Auction Status</p>
                      <Badge variant='outline' className='mt-1'>
                        {selectedBid.auctionStatus.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Placed On</p>
                      <p className='font-medium'>{format(selectedBid.timestamp, 'PPpp')}</p>
                    </div>
                    {selectedBid.timeRemaining && selectedBid.auctionStatus === 'live' && (
                      <div>
                        <p className='text-sm text-muted-foreground'>Time Remaining</p>
                        <p className='font-medium text-slate-700'>
                          {getTimeRemaining(selectedBid.timeRemaining)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className='mt-3'>
                    <p className='text-sm text-muted-foreground'>Total Bids on Auction</p>
                    <p className='font-medium'>{selectedBid.totalBids} bids</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBid.notes && (
                <div className='space-y-2'>
                  <h3 className='font-semibold'>Notes</h3>
                  <div className='rounded-lg bg-muted p-4'>
                    <p className='text-sm'>{selectedBid.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsViewBidModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
