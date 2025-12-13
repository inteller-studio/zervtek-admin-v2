'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Calculator,
  Car,
  Check,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Bid } from '../data/bids'

interface CreateInvoiceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bid: Bid | null
  onSuccess: () => void
}

// Format price in JPY
const formatPrice = (price: number) => {
  return `¥${price.toLocaleString()}`
}

export function CreateInvoiceDrawer({
  open,
  onOpenChange,
  bid,
  onSuccess,
}: CreateInvoiceDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invoiceType, setInvoiceType] = useState<'full' | 'deposit' | 'balance'>('full')
  const [shippingCost, setShippingCost] = useState('')
  const [additionalFees, setAdditionalFees] = useState('')
  const [discount, setDiscount] = useState('')
  const [notes, setNotes] = useState('')

  // Calculate totals
  const bidAmount = bid?.amount || 0
  const serviceFee = bid?.serviceFee || 0
  const shippingAmount = Number(shippingCost) || 0
  const additionalAmount = Number(additionalFees) || 0
  const discountAmount = Number(discount) || 0
  const subtotal = bidAmount + serviceFee + shippingAmount + additionalAmount
  const total = subtotal - discountAmount

  const handleCreateInvoice = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success(`Invoice created for ${bid?.bidder.name}`)

    setIsSubmitting(false)
    resetForm()
    onSuccess()
  }

  const resetForm = () => {
    setInvoiceType('full')
    setShippingCost('')
    setAdditionalFees('')
    setDiscount('')
    setNotes('')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  if (!bid) return null

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className='flex flex-col gap-0 p-0 sm:max-w-lg'>
        {/* Header */}
        <div className='border-b bg-muted/30'>
          <SheetHeader className='p-4 pb-0'>
            <SheetTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Create Invoice
            </SheetTitle>
            <SheetDescription>
              Generate invoice for won auction bid
            </SheetDescription>
          </SheetHeader>

          {/* Vehicle Preview Card */}
          <div className='p-4'>
            <div className='flex gap-3 rounded-lg border bg-background p-3'>
              <div className='flex h-16 w-24 items-center justify-center rounded-md bg-muted'>
                <Car className='h-6 w-6 text-muted-foreground' />
              </div>
              <div className='flex-1'>
                <p className='font-semibold'>
                  {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {bid.lotNumber} • {bid.auctionHouse}
                </p>
                <div className='mt-1 flex items-center gap-2'>
                  <Badge variant='secondary' className='text-xs'>
                    Won: {formatPrice(bid.amount)}
                  </Badge>
                  <Badge variant='outline' className='bg-emerald-50 text-xs text-emerald-700'>
                    <Check className='mr-1 h-3 w-3' />
                    Won
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-4'>
            {/* Customer Info */}
            <div className='space-y-2'>
              <Label className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                Customer
              </Label>
              <div className='flex items-center gap-3 rounded-lg border p-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                  <User className='h-5 w-5 text-primary' />
                </div>
                <div className='flex-1'>
                  <p className='font-medium'>{bid.bidder.name}</p>
                  <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <Mail className='h-3 w-3' />
                      {bid.bidder.email}
                    </span>
                  </div>
                  <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <MapPin className='h-3 w-3' />
                      {bid.bidder.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Type */}
            <div className='space-y-2'>
              <Label>Invoice Type</Label>
              <Select value={invoiceType} onValueChange={(v: 'full' | 'deposit' | 'balance') => setInvoiceType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='full'>Full Payment</SelectItem>
                  <SelectItem value='deposit'>Deposit Only (30%)</SelectItem>
                  <SelectItem value='balance'>Balance Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Breakdown */}
            <div className='space-y-2'>
              <Label className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                Price Breakdown
              </Label>
              <Card>
                <CardContent className='space-y-3 p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Winning Bid</span>
                    <span className='font-semibold'>{formatPrice(bidAmount)}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Service Fee (5%)</span>
                    <span className='text-sm'>{formatPrice(serviceFee)}</span>
                  </div>
                  <Separator />

                  {/* Additional Costs */}
                  <div className='space-y-3'>
                    <div className='space-y-1'>
                      <Label className='text-sm'>Shipping Cost</Label>
                      <Input
                        type='number'
                        placeholder='0'
                        value={shippingCost}
                        onChange={(e) => setShippingCost(e.target.value)}
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-sm'>Additional Fees</Label>
                      <Input
                        type='number'
                        placeholder='0'
                        value={additionalFees}
                        onChange={(e) => setAdditionalFees(e.target.value)}
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-sm'>Discount</Label>
                      <Input
                        type='number'
                        placeholder='0'
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className='flex items-center justify-between text-sm text-green-600'>
                        <span>Discount</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className='flex items-center justify-between text-lg font-bold'>
                      <span>Total</span>
                      <span className='text-primary'>{formatPrice(total)}</span>
                    </div>
                    {invoiceType === 'deposit' && (
                      <div className='flex items-center justify-between rounded-md bg-amber-50 p-2 text-sm text-amber-800'>
                        <span>Deposit Amount (30%)</span>
                        <span className='font-semibold'>{formatPrice(Math.round(total * 0.3))}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            <div className='space-y-2'>
              <Label>
                Notes
                <span className='ml-1 text-xs font-normal text-muted-foreground'>Optional</span>
              </Label>
              <Textarea
                placeholder='Add any notes for this invoice...'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Invoice Preview Indicator */}
            <div className='flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground'>
              <Calculator className='h-4 w-4 shrink-0' />
              <span>
                Invoice will be sent to <span className='font-medium text-foreground'>{bid.bidder.email}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className='flex-row gap-2 border-t bg-muted/30 p-4'>
          <Button
            variant='outline'
            className='flex-1'
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className='flex-1'
            onClick={handleCreateInvoice}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating...
              </>
            ) : (
              <>
                <FileText className='mr-2 h-4 w-4' />
                Create Invoice
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
