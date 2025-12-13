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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  Ban,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Clock,
  Eye,
  FileQuestion,
  FileText,
  Filter,
  Gavel,
  Handshake,
  Hash,
  HelpCircle,
  LayoutGrid,
  LayoutList,
  MessageSquare,
  MoreHorizontal,
  RotateCcw,
  Search as SearchIcon,
  Trophy,
  TrendingDown,
  TrendingUp,
  User,
  UserCog,
  Users,
  XCircle,
} from 'lucide-react'
import { format, differenceInHours, differenceInMinutes, subDays, startOfDay } from 'date-fns'
import { toast } from 'sonner'
import { bids as initialBids, type Bid } from './data/bids'
import { CreateInvoiceDrawer } from './components/create-invoice-drawer'
import { BidDetailModal } from './components/bid-detail-modal'

export function Bids() {
  const [bids] = useState(initialBids)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [activeTab, setActiveTab] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('ending-soon')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Filter states
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedBidderTypes, setSelectedBidderTypes] = useState<string[]>([])
  const [selectedAuctionStatuses, setSelectedAuctionStatuses] = useState<string[]>([])
  const [amountRange, setAmountRange] = useState([0, 30000000])
  const [onlyWinning, setOnlyWinning] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Modal states
  const [isViewBidModalOpen, setIsViewBidModalOpen] = useState(false)
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const [isUnsoldDialogOpen, setIsUnsoldDialogOpen] = useState(false)
  const [unsoldBid, setUnsoldBid] = useState<Bid | null>(null)
  const [unsoldPrice, setUnsoldPrice] = useState('')
  const [negoStartPrice, setNegoStartPrice] = useState('')

  // Sold to others dialog
  const [isSoldToOthersDialogOpen, setIsSoldToOthersDialogOpen] = useState(false)
  const [soldToOthersBid, setSoldToOthersBid] = useState<Bid | null>(null)
  const [soldToOthersPrice, setSoldToOthersPrice] = useState('')

  // Won dialog (Bid Accepted, Contract, Contract by Nego)
  const [isWonDialogOpen, setIsWonDialogOpen] = useState(false)
  const [wonBid, setWonBid] = useState<Bid | null>(null)
  const [wonPrice, setWonPrice] = useState('')
  const [wonType, setWonType] = useState<'bid_accepted' | 'contract' | 'contract_nego'>('bid_accepted')

  // Get unique values for filters
  const uniqueStatuses: Bid['status'][] = ['pending_approval', 'active', 'outbid', 'winning', 'won', 'lost', 'retracted', 'expired', 'declined']
  const uniqueTypes: Bid['type'][] = ['manual', 'assisted']
  const uniqueBidderTypes: Bid['bidder']['type'][] = ['individual', 'dealer', 'corporate']
  const uniqueAuctionStatuses: Bid['auctionStatus'][] = ['live', 'upcoming', 'ended']

  // Filter logic
  const filteredBids = useMemo(() => {
    // Calculate date range based on selected date
    const filterDateStart = selectedDate ? startOfDay(selectedDate) : null
    const filterDateEnd = selectedDate ? new Date(startOfDay(selectedDate).getTime() + 86400000 - 1) : null

    let filtered = bids.filter((bid) => {
      const matchesSearch =
        bid.bidNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.auctionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.bidder.name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'pending' && bid.status === 'pending_approval') ||
        (activeTab === 'active' && (bid.status === 'active' || bid.status === 'winning')) ||
        (activeTab === 'outbid' && bid.status === 'outbid') ||
        (activeTab === 'won' && bid.status === 'won') ||
        (activeTab === 'lost' && bid.status === 'lost') ||
        (activeTab === 'declined' && bid.status === 'declined')

      const matchesDate = !filterDateStart || !filterDateEnd || (bid.timestamp >= filterDateStart && bid.timestamp <= filterDateEnd)
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(bid.status)
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(bid.type)
      const matchesBidderType = selectedBidderTypes.length === 0 || selectedBidderTypes.includes(bid.bidder.type)
      const matchesAuctionStatus = selectedAuctionStatuses.length === 0 || selectedAuctionStatuses.includes(bid.auctionStatus)
      const matchesAmount = bid.amount >= amountRange[0] && bid.amount <= amountRange[1]
      const matchesWinning = !onlyWinning || bid.status === 'winning' || bid.status === 'won'

      return matchesSearch && matchesTab && matchesDate && matchesStatus && matchesType &&
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
  }, [bids, searchQuery, activeTab, selectedDate, selectedStatuses, selectedTypes, selectedBidderTypes,
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
    setAmountRange([0, 30000000])
    setOnlyWinning(false)
    setSelectedDate(undefined)
    setActiveTab('all')
    setSortBy('recent')
    resetPagination()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-amber-100 text-amber-800'
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
      case 'declined':
        return 'bg-rose-100 text-rose-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'Pending'
      case 'declined':
        return 'Declined'
      default:
        return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'manual':
        return <User className='h-3 w-3' />
      case 'assisted':
        return <UserCog className='h-3 w-3' />
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

  // Filter for today's bids
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayBids = bids.filter((b) => {
    const bidDate = new Date(b.timestamp)
    bidDate.setHours(0, 0, 0, 0)
    return bidDate.getTime() === today.getTime()
  })

  const stats = {
    total: todayBids.length,
    pending: todayBids.filter((b) => b.status === 'pending_approval').length,
    active: todayBids.filter((b) => b.status === 'active').length,
    won: todayBids.filter((b) => b.status === 'won').length,
    upcoming: todayBids.filter((b) => b.auctionStatus === 'upcoming').length,
    lost: todayBids.filter((b) => b.status === 'lost').length,
  }

  const hasActiveFilters = selectedStatuses.length > 0 || selectedTypes.length > 0 ||
    selectedBidderTypes.length > 0 || selectedAuctionStatuses.length > 0 ||
    amountRange[0] !== 0 || amountRange[1] !== 30000000 || onlyWinning

  const handleViewBid = (bid: Bid) => {
    setSelectedBid(bid)
    setIsViewBidModalOpen(true)
  }

  const handleMarkUnsold = (bid: Bid) => {
    setUnsoldBid(bid)
    setUnsoldPrice('')
    setNegoStartPrice('')
    setIsUnsoldDialogOpen(true)
  }

  const confirmUnsold = () => {
    if (unsoldBid) {
      const priceText = unsoldPrice ? ` at ¥${Number(unsoldPrice).toLocaleString()}` : ''
      const negoText = negoStartPrice ? ` (Nego starts: ¥${Number(negoStartPrice).toLocaleString()})` : ''
      toast.success(`Bid ${unsoldBid.bidNumber}: Unsold${priceText}${negoText}`)
      setIsUnsoldDialogOpen(false)
      setIsViewBidModalOpen(false)
      setUnsoldBid(null)
      setUnsoldPrice('')
      setNegoStartPrice('')
    }
  }

  // Sold to others handlers
  const handleSoldToOthers = (bid: Bid) => {
    setSoldToOthersBid(bid)
    setSoldToOthersPrice('')
    setIsSoldToOthersDialogOpen(true)
  }

  const confirmSoldToOthers = () => {
    if (soldToOthersBid) {
      const priceText = soldToOthersPrice ? ` at ¥${Number(soldToOthersPrice).toLocaleString()}` : ''
      toast.success(`Bid ${soldToOthersBid.bidNumber}: Sold to Others${priceText}`)
      setIsSoldToOthersDialogOpen(false)
      setIsViewBidModalOpen(false)
      setSoldToOthersBid(null)
      setSoldToOthersPrice('')
    }
  }

  // Won handlers
  const handleMarkWon = (bid: Bid, type: 'bid_accepted' | 'contract' | 'contract_nego') => {
    setWonBid(bid)
    setWonPrice(bid.amount.toString())
    setWonType(type)
    setIsWonDialogOpen(true)
  }

  const confirmWon = () => {
    if (wonBid) {
      const typeLabels = {
        bid_accepted: 'Bid Accepted',
        contract: 'Contract',
        contract_nego: 'Contract by Nego'
      }
      const priceText = wonPrice ? ` at ¥${Number(wonPrice).toLocaleString()}` : ''
      toast.success(`Bid ${wonBid.bidNumber}: ${typeLabels[wonType]}${priceText}`)
      setIsWonDialogOpen(false)
      setIsViewBidModalOpen(false)
      setWonBid(null)
      setWonPrice('')
    }
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
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-6'>
          <StatsCard
            title='Total Bids'
            value={stats.total}
            description='today'
          />
          <StatsCard
            title='Pending'
            value={stats.pending}
            description='today'
          />
          <StatsCard
            title='Active'
            value={stats.active}
            description='today'
          />
          <StatsCard
            title='Won'
            value={stats.won}
            description='today'
          />
          <StatsCard
            title='Upcoming'
            value={stats.upcoming}
            description='today'
          />
          <StatsCard
            title='Lost'
            value={stats.lost}
            description='today'
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
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='w-[180px] justify-start text-left font-normal'
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'All dates'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <div className='p-3 border-b'>
                    <div className='flex gap-2'>
                      <Button
                        variant={selectedDate && startOfDay(selectedDate).getTime() === startOfDay(new Date()).getTime() ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => {
                          setSelectedDate(new Date())
                          resetPagination()
                        }}
                      >
                        Today
                      </Button>
                      <Button
                        variant={!selectedDate ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => {
                          setSelectedDate(undefined)
                          resetPagination()
                        }}
                      >
                        All dates
                      </Button>
                    </div>
                  </div>
                  <Calendar
                    mode='single'
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setIsCalendarOpen(false)
                      resetPagination()
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                              {type === 'assisted' ? 'Assisted' : 'Manual'}
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
                        Bid Amount: ¥{amountRange[0].toLocaleString()} - ¥{amountRange[1].toLocaleString()}
                      </Label>
                      <Slider
                        value={amountRange}
                        onValueChange={(value) => {
                          setAmountRange(value)
                          resetPagination()
                        }}
                        min={0}
                        max={30000000}
                        step={100000}
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
              <TabsTrigger value='pending' className='gap-1.5'>
                Pending Approval
                {stats.pending > 0 && (
                  <Badge variant='secondary' className='ml-1 h-5 px-1.5 text-xs'>
                    {stats.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value='active'>Active</TabsTrigger>
              <TabsTrigger value='outbid'>Outbid</TabsTrigger>
              <TabsTrigger value='won'>Won</TabsTrigger>
              <TabsTrigger value='lost'>Lost</TabsTrigger>
              <TabsTrigger value='declined'>Declined</TabsTrigger>
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
                    <TableHead>Date / Auction</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Bidder</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Auction Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBids.map((bid) => (
                    <TableRow
                      key={bid.id}
                      className='cursor-pointer'
                      onClick={() => handleViewBid(bid)}
                    >
                      <TableCell>
                        <div>
                          <p className='font-medium'>{format(bid.timestamp, 'MMM dd, yyyy')}</p>
                          <p className='text-xs text-muted-foreground'>{format(bid.timestamp, 'h:mm a')}</p>
                          <p className='mt-1 text-xs text-muted-foreground'>
                            {bid.auctionHouse} • Lot #{bid.lotNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className='line-clamp-1 font-medium'>{bid.auctionTitle}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{bid.bidder.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {bid.bidder.type} • {bid.bidder.location}
                          </p>
                          {bid.type === 'assisted' && (
                            <div className='mt-1 flex items-center gap-1'>
                              <Badge variant='outline' className='text-xs'>
                                Assisted
                              </Badge>
                              <span className='text-xs text-muted-foreground'>by {bid.assistedBy}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className='font-semibold'>¥{bid.amount.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bid.status)}>
                          {getStatusLabel(bid.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          {getTypeIcon(bid.type)}
                          <span className='text-sm capitalize'>
                            {bid.type === 'assisted' ? 'Assisted' : 'Manual'}
                          </span>
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
                        {bid.status === 'pending_approval' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant='ghost' size='icon' className='h-7 w-7'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                className='text-green-600'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.success(`Bid ${bid.bidNumber} approved`)
                                }}
                              >
                                <Check className='mr-2 h-4 w-4' />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-red-600'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.success(`Bid ${bid.bidNumber} declined`)
                                }}
                              >
                                <XCircle className='mr-2 h-4 w-4' />
                                Decline
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (bid.status === 'active' || bid.status === 'winning') ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant='ghost' size='icon' className='h-7 w-7'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-48'>
                              <DropdownMenuLabel className='text-xs'>Won Results</DropdownMenuLabel>
                              <DropdownMenuItem
                                className='text-green-600'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkWon(bid, 'bid_accepted')
                                }}
                              >
                                <Trophy className='mr-2 h-4 w-4' />
                                Bid Accepted
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-green-600'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkWon(bid, 'contract')
                                }}
                              >
                                <Handshake className='mr-2 h-4 w-4' />
                                Contract
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-green-600'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkWon(bid, 'contract_nego')
                                }}
                              >
                                <MessageSquare className='mr-2 h-4 w-4' />
                                Contract by Nego
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className='text-xs'>Lost Results</DropdownMenuLabel>
                              <DropdownMenuItem
                                className='text-red-600'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSoldToOthers(bid)
                                }}
                              >
                                <Users className='mr-2 h-4 w-4' />
                                Sold to Others
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-orange-600'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkUnsold(bid)
                                }}
                              >
                                <CircleSlash className='mr-2 h-4 w-4' />
                                Unsold
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className='text-xs'>Other</DropdownMenuLabel>
                              <DropdownMenuItem
                                className='text-slate-600'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.success(`Bid ${bid.bidNumber}: Bid Canceled`)
                                }}
                              >
                                <XCircle className='mr-2 h-4 w-4' />
                                Bid Canceled
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-slate-600'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.success(`Bid ${bid.bidNumber}: Auction Cancelled`)
                                }}
                              >
                                <Ban className='mr-2 h-4 w-4' />
                                Auction Cancelled
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-slate-500'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.success(`Bid ${bid.bidNumber}: Result`)
                                }}
                              >
                                <FileQuestion className='mr-2 h-4 w-4' />
                                Result
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-slate-500'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.success(`Bid ${bid.bidNumber}: Unknown`)
                                }}
                              >
                                <HelpCircle className='mr-2 h-4 w-4' />
                                Unknown
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewBid(bid)
                            }}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                        )}
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
                      {getStatusLabel(bid.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Vehicle Info */}
                  <div>
                    <p className='line-clamp-1 text-sm font-semibold'>{bid.auctionTitle}</p>
                    <p className='text-sm text-muted-foreground'>
                      {bid.auctionHouse} • Lot #{bid.lotNumber}
                    </p>
                  </div>

                  {/* Bid Amount */}
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-2xl font-bold text-primary'>
                        ¥{bid.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='flex items-center gap-1 text-sm'>
                        {getTypeIcon(bid.type)}
                        <span className='capitalize'>
                          {bid.type === 'assisted' ? 'Assisted' : 'Manual'}
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
                          {bid.bidder.type} • {bid.bidder.location}
                        </p>
                        {bid.type === 'assisted' && (
                          <div className='mt-1 flex items-center gap-1'>
                            <Badge variant='outline' className='text-xs'>
                              Assisted
                            </Badge>
                            <span className='text-xs text-muted-foreground'>by {bid.assistedBy}</span>
                          </div>
                        )}
                      </div>
                      <Badge
                        variant='outline'
                        className={
                          bid.bidder.level === 'business_premium'
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : bid.bidder.level === 'business'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : bid.bidder.level === 'premium'
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : bid.bidder.level === 'verified'
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-slate-400 bg-slate-50 text-slate-600'
                        }
                      >
                        {bid.bidder.level === 'business_premium' ? 'Business Premium' : bid.bidder.level.charAt(0).toUpperCase() + bid.bidder.level.slice(1)}
                      </Badge>
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

      {/* View Bid Modal - Improved */}
      <BidDetailModal
        bid={selectedBid}
        open={isViewBidModalOpen}
        onClose={() => setIsViewBidModalOpen(false)}
        onApprove={(bid) => {
          toast.success(`Bid ${bid.bidNumber} approved`)
          setIsViewBidModalOpen(false)
        }}
        onDecline={(bid) => {
          toast.success(`Bid ${bid.bidNumber} declined`)
          setIsViewBidModalOpen(false)
        }}
        onMarkWon={handleMarkWon}
        onSoldToOthers={handleSoldToOthers}
        onMarkUnsold={handleMarkUnsold}
        onCancelBid={(bid) => {
          toast.success(`Bid ${bid.bidNumber}: Bid Canceled`)
          setIsViewBidModalOpen(false)
        }}
        onAuctionCancelled={(bid) => {
          toast.success(`Bid ${bid.bidNumber}: Auction Cancelled`)
          setIsViewBidModalOpen(false)
        }}
        onCreateInvoice={() => setIsCreateInvoiceOpen(true)}
      />

      {/* Create Invoice Drawer */}
      <CreateInvoiceDrawer
        open={isCreateInvoiceOpen}
        onOpenChange={setIsCreateInvoiceOpen}
        bid={selectedBid}
        onSuccess={() => {
          setIsCreateInvoiceOpen(false)
          setIsViewBidModalOpen(false)
        }}
      />

      {/* Unsold Price Dialog */}
      <Dialog open={isUnsoldDialogOpen} onOpenChange={setIsUnsoldDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <CircleSlash className='h-5 w-5 text-orange-500' />
              Mark as Unsold
            </DialogTitle>
            <DialogDescription>
              {unsoldBid && (
                <>
                  Enter the final unsold price for <span className='font-medium'>{unsoldBid.bidNumber}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {unsoldBid && (
              <div className='rounded-lg border bg-muted/30 p-3'>
                <p className='font-medium'>{unsoldBid.auctionTitle}</p>
                <p className='text-sm text-muted-foreground'>
                  {unsoldBid.auctionHouse} • Lot #{unsoldBid.lotNumber}
                </p>
                <p className='mt-2 text-sm'>
                  Original Bid: <span className='font-semibold'>¥{unsoldBid.amount.toLocaleString()}</span>
                </p>
              </div>
            )}
            <div className='space-y-2'>
              <Label htmlFor='unsoldPrice'>Unsold Price (¥)</Label>
              <Input
                id='unsoldPrice'
                type='number'
                placeholder='Enter final price'
                value={unsoldPrice}
                onChange={(e) => setUnsoldPrice(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>
                The price at which the vehicle remained unsold (reserve not met)
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='negoStartPrice'>Starting Negotiating Price (¥)</Label>
              <Input
                id='negoStartPrice'
                type='number'
                placeholder='Enter starting nego price'
                value={negoStartPrice}
                onChange={(e) => setNegoStartPrice(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>
                The price at which post-auction negotiation can begin
              </p>
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => setIsUnsoldDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUnsold} className='bg-orange-600 hover:bg-orange-700'>
              Confirm Unsold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sold to Others Price Dialog */}
      <Dialog open={isSoldToOthersDialogOpen} onOpenChange={setIsSoldToOthersDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-red-500' />
              Sold to Others
            </DialogTitle>
            <DialogDescription>
              {soldToOthersBid && (
                <>
                  Enter the sold price for <span className='font-medium'>{soldToOthersBid.bidNumber}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {soldToOthersBid && (
              <div className='rounded-lg border bg-muted/30 p-3'>
                <p className='font-medium'>{soldToOthersBid.auctionTitle}</p>
                <p className='text-sm text-muted-foreground'>
                  {soldToOthersBid.auctionHouse} • Lot #{soldToOthersBid.lotNumber}
                </p>
                <p className='mt-2 text-sm'>
                  Our Bid: <span className='font-semibold'>¥{soldToOthersBid.amount.toLocaleString()}</span>
                </p>
              </div>
            )}
            <div className='space-y-2'>
              <Label htmlFor='soldToOthersPrice'>Sold Price (¥)</Label>
              <Input
                id='soldToOthersPrice'
                type='number'
                placeholder='Enter the price it sold for'
                value={soldToOthersPrice}
                onChange={(e) => setSoldToOthersPrice(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>
                The price at which the vehicle was sold to another bidder
              </p>
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => setIsSoldToOthersDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSoldToOthers} variant='destructive'>
              Confirm Sold to Others
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Won Price Dialog */}
      <Dialog open={isWonDialogOpen} onOpenChange={setIsWonDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5 text-green-500' />
              {wonType === 'bid_accepted' ? 'Bid Accepted' : wonType === 'contract' ? 'Contract' : 'Contract by Nego'}
            </DialogTitle>
            <DialogDescription>
              {wonBid && (
                <>
                  Enter the final winning price for <span className='font-medium'>{wonBid.bidNumber}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {wonBid && (
              <div className='rounded-lg border bg-green-50 p-3 dark:bg-green-950'>
                <p className='font-medium'>{wonBid.auctionTitle}</p>
                <p className='text-sm text-muted-foreground'>
                  {wonBid.auctionHouse} • Lot #{wonBid.lotNumber}
                </p>
                <p className='mt-2 text-sm'>
                  Our Bid: <span className='font-semibold'>¥{wonBid.amount.toLocaleString()}</span>
                </p>
              </div>
            )}
            <div className='space-y-2'>
              <Label htmlFor='wonPrice'>Winning Price (¥)</Label>
              <Input
                id='wonPrice'
                type='number'
                placeholder='Enter the winning price'
                value={wonPrice}
                onChange={(e) => setWonPrice(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>
                {wonType === 'contract_nego'
                  ? 'The final negotiated price we got the vehicle for'
                  : 'The price at which we won the vehicle'}
              </p>
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => setIsWonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmWon} className='bg-green-600 hover:bg-green-700'>
              Confirm Won
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
