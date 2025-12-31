'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  MdArrowBack,
  MdArrowForward,
  MdCheck,
  MdGavel,
  MdSync,
  MdEmail,
  MdLocationOn,
  MdPhone,
  MdSearch,
  MdPerson,
  MdVerifiedUser,
  MdClose,
} from 'react-icons/md'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { customers, type Customer } from '@/features/customers/data/customers'
import { type Auction } from '../data/auctions'

interface AssistBuyerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auction: Auction | null
  onSuccess: () => void
}

// Format price in JPY
const formatPrice = (price: number) => {
  return `¥${price.toLocaleString()}`
}

export function AssistBuyerDrawer({
  open,
  onOpenChange,
  auction,
  onSuccess,
}: AssistBuyerDrawerProps) {
  const [step, setStep] = useState<'search' | 'bid'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Customer[]>([])

  const minimumBid = auction ? auction.currentBid + 10000 : 0

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setIsSearching(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const query = searchQuery.toLowerCase()
    const results = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query)
    )

    setIsSearching(false)

    if (results.length === 0) {
      toast.error('No customers found')
      setSearchResults([])
      return
    }

    setSearchResults(results.slice(0, 5))
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setSearchResults([])
    setSearchQuery('')
  }

  const handleContinueToBid = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer first')
      return
    }
    // Pre-fill with minimum bid
    setBidAmount(minimumBid.toString())
    setStep('bid')
  }

  const handlePlaceBid = async () => {
    if (!bidAmount || Number(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount')
      return
    }

    if (auction && Number(bidAmount) <= auction.currentBid) {
      toast.error(`Bid must be higher than current bid (${formatPrice(auction.currentBid)})`)
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success(
      `Bid of ${formatPrice(Number(bidAmount))} placed on behalf of ${selectedCustomer?.name}`
    )

    setIsSubmitting(false)
    resetForm()
    onSuccess()
  }

  const resetForm = () => {
    setStep('search')
    setSearchQuery('')
    setSelectedCustomer(null)
    setBidAmount('')
    setNotes('')
    setSearchResults([])
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  if (!auction) return null

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className='flex flex-col gap-0 p-0 sm:max-w-lg'>
        {/* Header with Vehicle Preview */}
        <div className='border-b bg-muted/30'>
          <SheetHeader className='p-4 pb-0'>
            <SheetTitle className='flex items-center gap-2'>
              <MdGavel className='h-5 w-5' />
              Assist Customer Bid
            </SheetTitle>
            <SheetDescription>
              Place a bid on behalf of a customer
            </SheetDescription>
          </SheetHeader>

          {/* Vehicle Preview Card */}
          <div className='p-4'>
            <div className='flex gap-3 rounded-lg border bg-background p-3'>
              {auction.vehicleInfo.images.length > 0 ? (
                <img
                  src={auction.vehicleInfo.images[1] || auction.vehicleInfo.images[0]}
                  alt={`${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`}
                  className='h-16 w-24 rounded-md object-cover'
                />
              ) : (
                <div className='flex h-16 w-24 items-center justify-center rounded-md bg-muted'>
                  <span className='text-xs text-muted-foreground'>No image</span>
                </div>
              )}
              <div className='flex-1'>
                <p className='font-semibold'>
                  {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {auction.lotNumber} • {auction.vehicleInfo.mileageDisplay}
                </p>
                <div className='mt-1 flex items-center gap-2'>
                  <Badge variant='secondary' className='text-xs'>
                    Current: {formatPrice(auction.currentBid)}
                  </Badge>
                  <Badge variant='outline' className='text-xs'>
                    {auction.totalBids} bids
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className='flex items-center gap-2 px-4 pb-4'>
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
              step === 'search'
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/20 text-primary'
            }`}>
              {selectedCustomer && step === 'bid' ? <MdCheck className='h-4 w-4' /> : '1'}
            </div>
            <span className={`text-sm ${step === 'search' ? 'font-medium' : 'text-muted-foreground'}`}>
              Select Customer
            </span>
            <div className='h-px flex-1 bg-border' />
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
              step === 'bid'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <span className={`text-sm ${step === 'bid' ? 'font-medium' : 'text-muted-foreground'}`}>
              Place Bid
            </span>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-4'>
          {step === 'search' ? (
            <div className='space-y-4'>
              {/* Search Section */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Find Customer</Label>
                <div className='flex gap-2'>
                  <div className='relative flex-1'>
                    <MdSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                      placeholder='Search by name, email, or phone...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className='pl-9'
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                      <MdSync className='h-4 w-4 animate-spin' />
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className='space-y-2'>
                  <Label className='text-xs text-muted-foreground'>
                    {searchResults.length} customer{searchResults.length > 1 ? 's' : ''} found
                  </Label>
                  <div className='space-y-2'>
                    {searchResults.map((customer) => (
                      <Card
                        key={customer.id}
                        className='cursor-pointer transition-all hover:border-primary hover:shadow-sm'
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <CardContent className='p-3'>
                          <div className='flex items-center gap-3'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                              <MdPerson className='h-5 w-5 text-muted-foreground' />
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2'>
                                <p className='font-medium'>{customer.name}</p>
                                {customer.verificationStatus === 'verified' && (
                                  <MdVerifiedUser className='h-4 w-4 text-green-600' />
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                {customer.email}
                              </p>
                            </div>
                            <MdArrowForward className='h-4 w-4 text-muted-foreground' />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Customer */}
              {selectedCustomer && (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-sm font-medium'>Selected Customer</Label>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-auto p-1 text-xs text-muted-foreground hover:text-foreground'
                      onClick={() => setSelectedCustomer(null)}
                    >
                      <MdClose className='mr-1 h-3 w-3' />
                      Change
                    </Button>
                  </div>
                  <Card className='border-primary bg-primary/5'>
                    <CardContent className='p-4'>
                      <div className='flex items-start gap-3'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                          <MdPerson className='h-6 w-6 text-primary' />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <p className='font-semibold'>{selectedCustomer.name}</p>
                            {selectedCustomer.verificationStatus === 'verified' && (
                              <Badge variant='default' className='h-5 text-xs'>
                                <MdVerifiedUser className='mr-1 h-3 w-3' />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className='mt-1 space-y-1 text-sm text-muted-foreground'>
                            <div className='flex items-center gap-2'>
                              <MdEmail className='h-3 w-3' />
                              {selectedCustomer.email}
                            </div>
                            <div className='flex items-center gap-2'>
                              <MdPhone className='h-3 w-3' />
                              {selectedCustomer.phone}
                            </div>
                            <div className='flex items-center gap-2'>
                              <MdLocationOn className='h-3 w-3' />
                              {selectedCustomer.country}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className='my-3' />

                      {/* Customer Stats */}
                      <div className='grid grid-cols-3 gap-3'>
                        <div className='rounded-lg bg-background p-2 text-center'>
                          <p className='text-lg font-bold'>{selectedCustomer.totalBids}</p>
                          <p className='text-xs text-muted-foreground'>Total Bids</p>
                        </div>
                        <div className='rounded-lg bg-background p-2 text-center'>
                          <p className='text-lg font-bold text-green-600'>{selectedCustomer.wonAuctions}</p>
                          <p className='text-xs text-muted-foreground'>Won</p>
                        </div>
                        <div className='rounded-lg bg-background p-2 text-center'>
                          <p className='text-lg font-bold'>{selectedCustomer.totalPurchases}</p>
                          <p className='text-xs text-muted-foreground'>Purchases</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Empty State */}
              {!selectedCustomer && searchResults.length === 0 && (
                <div className='flex flex-col items-center justify-center py-8 text-center'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                    <MdSearch className='h-8 w-8 text-muted-foreground' />
                  </div>
                  <p className='mt-4 font-medium'>Search for a customer</p>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    Enter a name, email, or phone number to find the customer
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Selected Customer Summary */}
              {selectedCustomer && (
                <div className='flex items-center gap-3 rounded-lg border bg-muted/30 p-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                    <MdPerson className='h-5 w-5 text-primary' />
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium'>{selectedCustomer.name}</p>
                    <p className='text-sm text-muted-foreground'>{selectedCustomer.email}</p>
                  </div>
                  {selectedCustomer.verificationStatus === 'verified' && (
                    <Badge variant='outline' className='text-xs'>
                      <MdVerifiedUser className='mr-1 h-3 w-3' />
                      Verified
                    </Badge>
                  )}
                </div>
              )}

              {/* Current Bid Info */}
              <Card className='bg-gradient-to-br from-primary/5 to-primary/10'>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Current Highest Bid</p>
                      <p className='text-2xl font-bold'>{formatPrice(auction.currentBid)}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-muted-foreground'>Minimum Bid</p>
                      <p className='text-lg font-semibold text-primary'>{formatPrice(minimumBid)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bid Form */}
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='bidAmount'>Bid Amount (¥)</Label>
                  <Input
                    id='bidAmount'
                    type='number'
                    placeholder={`Minimum: ${formatPrice(minimumBid)}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className='text-lg font-semibold'
                  />
                  {bidAmount && Number(bidAmount) < minimumBid && (
                    <p className='text-xs text-destructive'>
                      Bid must be at least {formatPrice(minimumBid)}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='notes'>
                    Notes
                    <span className='ml-1 text-xs font-normal text-muted-foreground'>Optional</span>
                  </Label>
                  <Textarea
                    id='notes'
                    placeholder='Add any notes about this bid...'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              {/* Assisted Bid Indicator */}
              <div className='flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground'>
                <MdVerifiedUser className='h-4 w-4 shrink-0' />
                <span>
                  Bid placed on behalf of <span className='font-medium text-foreground'>{selectedCustomer?.name}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className='flex-row gap-2 border-t bg-muted/30 p-4'>
          {step === 'search' ? (
            <>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className='flex-1'
                onClick={handleContinueToBid}
                disabled={!selectedCustomer}
              >
                Continue
                <MdArrowForward className='ml-2 h-4 w-4' />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => setStep('search')}
                disabled={isSubmitting}
              >
                <MdArrowBack className='mr-2 h-4 w-4' />
                Back
              </Button>
              <Button
                className='flex-1'
                onClick={handlePlaceBid}
                disabled={isSubmitting || !bidAmount || Number(bidAmount) < minimumBid}
              >
                {isSubmitting ? (
                  <>
                    <MdSync className='mr-2 h-4 w-4 animate-spin' />
                    Placing...
                  </>
                ) : (
                  <>
                    <MdGavel className='mr-2 h-4 w-4' />
                    Place Bid
                  </>
                )}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
