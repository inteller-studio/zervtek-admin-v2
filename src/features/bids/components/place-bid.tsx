'use client'

import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MdSearch,
  MdPerson,
  MdAccessTime,
  MdError,
  MdCheckCircle,
  MdHistory,
  MdGavel,
  MdManageAccounts,
  MdArrowUpward,
} from 'react-icons/md'
import { differenceInHours, differenceInMinutes } from 'date-fns'
import { toast } from 'sonner'

interface CustomerBid {
  id: string
  auctionId: string
  auctionTitle: string
  vehicle: {
    make: string
    model: string
    year: number
    vin: string
    mileage: number
    imageUrl?: string
  }
  currentBid: number
  customerLastBid: number
  highestBid: number
  reservePrice: number
  totalBids: number
  customerTotalBids: number
  status: 'winning' | 'outbid' | 'watching'
  endTime: Date
  bidHistory: {
    id: string
    amount: number
    timestamp: Date
    isCustomer: boolean
    type: 'manual' | 'assisted'
  }[]
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalBids: number
  activeBids: number
  wonAuctions: number
  registeredDate: Date
}

const mockCustomersWithBids: Customer[] = [
  {
    id: 'cust-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 234-567-8900',
    totalBids: 45,
    activeBids: 3,
    wonAuctions: 5,
    registeredDate: new Date('2023-06-15'),
  },
  {
    id: 'cust-2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 234-567-8901',
    totalBids: 28,
    activeBids: 2,
    wonAuctions: 3,
    registeredDate: new Date('2023-08-20'),
  },
  {
    id: 'cust-3',
    name: 'Mike Davis',
    email: 'mike.d@example.com',
    phone: '+1 234-567-8902',
    totalBids: 62,
    activeBids: 4,
    wonAuctions: 8,
    registeredDate: new Date('2023-04-10'),
  },
]

const mockCustomerBids: Record<string, CustomerBid[]> = {
  'cust-1': [
    {
      id: 'bid-1',
      auctionId: 'AUC001',
      auctionTitle: '2022 Toyota Camry - Premium Edition',
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        vin: 'VIN123456789',
        mileage: 15000,
      },
      currentBid: 26000,
      customerLastBid: 25500,
      highestBid: 26000,
      reservePrice: 28000,
      totalBids: 12,
      customerTotalBids: 3,
      status: 'outbid',
      endTime: new Date(Date.now() + 86400000),
      bidHistory: [
        { id: 'h1', amount: 24000, timestamp: new Date(Date.now() - 7200000), isCustomer: true, type: 'manual' },
        { id: 'h2', amount: 24500, timestamp: new Date(Date.now() - 6000000), isCustomer: false, type: 'manual' },
        { id: 'h3', amount: 25000, timestamp: new Date(Date.now() - 4800000), isCustomer: true, type: 'manual' },
        { id: 'h4', amount: 25500, timestamp: new Date(Date.now() - 3600000), isCustomer: true, type: 'assisted' },
        { id: 'h5', amount: 26000, timestamp: new Date(Date.now() - 1800000), isCustomer: false, type: 'manual' },
      ],
    },
    {
      id: 'bid-2',
      auctionId: 'AUC002',
      auctionTitle: '2021 Honda CR-V - Sport Model',
      vehicle: {
        make: 'Honda',
        model: 'CR-V',
        year: 2021,
        vin: 'VIN987654321',
        mileage: 22000,
      },
      currentBid: 28500,
      customerLastBid: 28500,
      highestBid: 28500,
      reservePrice: 30000,
      totalBids: 8,
      customerTotalBids: 2,
      status: 'winning',
      endTime: new Date(Date.now() + 172800000),
      bidHistory: [
        { id: 'h6', amount: 27000, timestamp: new Date(Date.now() - 5400000), isCustomer: false, type: 'manual' },
        { id: 'h7', amount: 27500, timestamp: new Date(Date.now() - 4200000), isCustomer: true, type: 'manual' },
        { id: 'h8', amount: 28000, timestamp: new Date(Date.now() - 3000000), isCustomer: false, type: 'manual' },
        { id: 'h9', amount: 28500, timestamp: new Date(Date.now() - 1800000), isCustomer: true, type: 'manual' },
      ],
    },
  ],
  'cust-2': [
    {
      id: 'bid-3',
      auctionId: 'AUC003',
      auctionTitle: '2023 Ford F-150 - Limited',
      vehicle: {
        make: 'Ford',
        model: 'F-150',
        year: 2023,
        vin: 'VIN456789123',
        mileage: 8000,
      },
      currentBid: 45500,
      customerLastBid: 44000,
      highestBid: 45500,
      reservePrice: 48000,
      totalBids: 15,
      customerTotalBids: 4,
      status: 'outbid',
      endTime: new Date(Date.now() + 259200000),
      bidHistory: [
        { id: 'h10', amount: 43000, timestamp: new Date(Date.now() - 10800000), isCustomer: true, type: 'manual' },
        { id: 'h11', amount: 43500, timestamp: new Date(Date.now() - 9600000), isCustomer: false, type: 'manual' },
        { id: 'h12', amount: 44000, timestamp: new Date(Date.now() - 7200000), isCustomer: true, type: 'assisted' },
        { id: 'h13', amount: 45000, timestamp: new Date(Date.now() - 3600000), isCustomer: false, type: 'manual' },
        { id: 'h14', amount: 45500, timestamp: new Date(Date.now() - 1800000), isCustomer: false, type: 'manual' },
      ],
    },
  ],
  'cust-3': [
    {
      id: 'bid-4',
      auctionId: 'AUC004',
      auctionTitle: '2020 BMW 3 Series - M Sport',
      vehicle: {
        make: 'BMW',
        model: '3 Series',
        year: 2020,
        vin: 'VIN789456123',
        mileage: 28000,
      },
      currentBid: 35000,
      customerLastBid: 35000,
      highestBid: 35000,
      reservePrice: 38000,
      totalBids: 10,
      customerTotalBids: 5,
      status: 'winning',
      endTime: new Date(Date.now() + 345600000),
      bidHistory: [
        { id: 'h15', amount: 32000, timestamp: new Date(Date.now() - 14400000), isCustomer: false, type: 'manual' },
        { id: 'h16', amount: 32500, timestamp: new Date(Date.now() - 12000000), isCustomer: true, type: 'manual' },
        { id: 'h17', amount: 33000, timestamp: new Date(Date.now() - 9600000), isCustomer: false, type: 'manual' },
        { id: 'h18', amount: 34000, timestamp: new Date(Date.now() - 7200000), isCustomer: true, type: 'manual' },
        { id: 'h19', amount: 34500, timestamp: new Date(Date.now() - 5400000), isCustomer: false, type: 'manual' },
        { id: 'h20', amount: 35000, timestamp: new Date(Date.now() - 3600000), isCustomer: true, type: 'assisted' },
      ],
    },
  ],
}

export function PlaceBid() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerBids, setCustomerBids] = useState<CustomerBid[]>([])
  const [selectedBid, setSelectedBid] = useState<CustomerBid | null>(null)
  const [isPlaceBidModalOpen, setIsPlaceBidModalOpen] = useState(false)
  const [bidAmount, setBidAmount] = useState<number>(0)
  const [maxBidAmount, setMaxBidAmount] = useState<number>(0)
  const [bidNotes, setBidNotes] = useState('')

  const handleCustomerSearch = () => {
    const customer = mockCustomersWithBids.find(
      c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (customer) {
      setSelectedCustomer(customer)
      setCustomerBids(mockCustomerBids[customer.id] || [])
    } else {
      toast.error('No customer found with active bids')
    }
  }

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date()
    const hours = differenceInHours(endTime, now)
    const minutes = differenceInMinutes(endTime, now) % 60

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} day${days > 1 ? 's' : ''} left`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`
    } else if (minutes > 0) {
      return `${minutes} minutes left`
    } else {
      return 'Ended'
    }
  }

  const getStatusColor = (status: CustomerBid['status']) => {
    switch (status) {
      case 'winning':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'outbid':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'watching':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleOpenPlaceBid = (bid: CustomerBid) => {
    setSelectedBid(bid)
    const suggestedBid = bid.highestBid + 500
    setBidAmount(suggestedBid)
    setIsPlaceBidModalOpen(true)
  }

  const handlePlaceBid = () => {
    if (!selectedBid || !bidAmount) return

    if (bidAmount <= selectedBid.highestBid) {
      toast.error('Bid must be higher than current highest bid')
      return
    }

    toast.success(`Bid of ¥${bidAmount.toLocaleString()} placed successfully`)

    setBidAmount(0)
    setMaxBidAmount(0)
    setBidNotes('')
    setIsPlaceBidModalOpen(false)
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ConfigDrawer />
        </div>
        <HeaderActions />
      </Header>

      <Main>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Place Bid for Customer</h1>
            <p className="text-muted-foreground">
              Continue bidding on behalf of customers who have already placed bids
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search Customer</CardTitle>
              <CardDescription>
                Find a customer with active bids to continue bidding on their behalf
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <MdSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomerSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleCustomerSearch}>
                  Search Customer
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedCustomer && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedCustomer.name}</CardTitle>
                      <CardDescription>{selectedCustomer.email} • {selectedCustomer.phone}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedCustomer.activeBids}</p>
                      <p className="text-muted-foreground">Active Bids</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedCustomer.totalBids}</p>
                      <p className="text-muted-foreground">Total Bids</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedCustomer.wonAuctions}</p>
                      <p className="text-muted-foreground">Won</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {customerBids.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Customer&apos;s Active Bids</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customerBids.map((bid) => (
                  <Card key={bid.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{bid.auctionTitle}</CardTitle>
                          <CardDescription className="mt-1">
                            {bid.vehicle.year} • {bid.vehicle.mileage.toLocaleString()} mi • {bid.vehicle.vin}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(bid.status)} variant="outline">
                          {bid.status === 'winning' ? 'Winning' : bid.status === 'outbid' ? 'Outbid' : 'Watching'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Customer&apos;s Last Bid</span>
                          <span className="font-semibold">¥{bid.customerLastBid.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current Highest</span>
                          <span className="text-lg font-bold text-primary">
                            ¥{bid.highestBid.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Reserve Price</span>
                          <span className="text-sm">¥{bid.reservePrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress to Reserve</span>
                          <span>{Math.round((bid.highestBid / bid.reservePrice) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min((bid.highestBid / bid.reservePrice) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MdGavel className="h-3 w-3" />
                            {bid.totalBids} bids
                          </span>
                          <span className="flex items-center gap-1">
                            <MdPerson className="h-3 w-3" />
                            {bid.customerTotalBids} by customer
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-slate-700">
                          <MdAccessTime className="h-3 w-3" />
                          {getTimeRemaining(bid.endTime)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Recent Activity</p>
                        <div className="space-y-1">
                          {bid.bidHistory.slice(-3).map((history) => (
                            <div key={history.id} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                {history.isCustomer ? (
                                  <>
                                    <MdPerson className="h-3 w-3 text-blue-600" />
                                    <span className="text-blue-600">Customer</span>
                                    {history.type === 'assisted' && (
                                      <Badge variant="outline" className="text-xs scale-75 -ml-1">
                                        Assisted
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <MdPerson className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-600">Other</span>
                                  </>
                                )}
                              </div>
                              <span className="font-medium">¥{history.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleOpenPlaceBid(bid)}
                          disabled={bid.status === 'winning'}
                        >
                          {bid.status === 'winning' ? (
                            <>
                              <MdCheckCircle className="h-4 w-4 mr-2" />
                              Currently Winning
                            </>
                          ) : (
                            <>
                              <MdArrowUpward className="h-4 w-4 mr-2" />
                              Place Higher Bid
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="icon">
                          <MdHistory className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedCustomer && customerBids.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <MdError className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Bids</h3>
                <p className="text-muted-foreground">
                  This customer doesn&apos;t have any active bids. Admins can only continue existing bids.
                </p>
              </CardContent>
            </Card>
          )}

          <Dialog open={isPlaceBidModalOpen} onOpenChange={setIsPlaceBidModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Place Bid for {selectedCustomer?.name}</DialogTitle>
                <DialogDescription>
                  Continue bidding on {selectedBid?.auctionTitle}
                </DialogDescription>
              </DialogHeader>

              {selectedBid && (
                <div className="space-y-4 py-4">
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Highest Bid</span>
                      <span className="text-xl font-bold">¥{selectedBid.highestBid.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Customer&apos;s Last Bid</span>
                      <span className="font-semibold">¥{selectedBid.customerLastBid.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Time Remaining</span>
                      <span className="text-slate-700 font-medium">{getTimeRemaining(selectedBid.endTime)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bidAmount">Bid Amount (¥)</Label>
                      <NumericInput
                        id="bidAmount"
                        placeholder="Enter bid amount"
                        value={bidAmount}
                        onChange={setBidAmount}
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum bid: ¥{(selectedBid.highestBid + 100).toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxBidAmount">Max Bid Amount (Optional)</Label>
                      <NumericInput
                        id="maxBidAmount"
                        placeholder="Set maximum for auto-bidding"
                        value={maxBidAmount}
                        onChange={setMaxBidAmount}
                      />
                      <p className="text-xs text-muted-foreground">
                        System will automatically bid up to this amount
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes about this bid (optional)"
                        value={bidNotes}
                        onChange={(e) => setBidNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <MdManageAccounts className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-900">
                      This bid will be marked as an <strong>Assisted Bid</strong> placed by admin on behalf of the customer
                    </span>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPlaceBidModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handlePlaceBid}
                  disabled={!bidAmount || bidAmount <= (selectedBid?.highestBid || 0)}
                >
                  Place Bid
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Main>
    </>
  )
}
