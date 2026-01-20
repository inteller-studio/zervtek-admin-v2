'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  MdArrowBack,
  MdArrowForward,
  MdDirectionsCar,
  MdCheck,
  MdDescription,
  MdSync,
  MdEmail,
  MdDirectionsBoat,
  MdPerson,
} from 'react-icons/md'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../data/won-auctions'

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auction: Purchase | null
}

// Format price
const formatPrice = (price: number, currency = '¥') => `${currency}${price.toLocaleString()}`

export function InvoiceDialog({
  open,
  onOpenChange,
  auction,
}: InvoiceDialogProps) {
  const router = useRouter()

  // Step state
  const [currentStep, setCurrentStep] = useState(1)
  const maxSteps = 2

  // Form state
  const [invoiceType, setInvoiceType] = useState<'full' | 'deposit' | 'balance'>('full')
  const [includeShipping, setIncludeShipping] = useState(true)
  const [includeCustoms, setIncludeCustoms] = useState(true)
  const [additionalFees, setAdditionalFees] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [dueInDays, setDueInDays] = useState('14')

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!auction) return null

  // Calculate amounts
  const vehiclePrice = auction.winningBid
  const shippingCost = includeShipping ? auction.shippingCost : 0
  const insuranceFee = includeCustoms ? auction.insuranceFee : 0
  const additionalAmount = additionalFees
  const discountAmount = discount
  const subtotal = vehiclePrice + shippingCost + insuranceFee + additionalAmount
  const total = subtotal - discountAmount
  const amountDue = invoiceType === 'deposit'
    ? Math.round(total * 0.3)
    : invoiceType === 'balance'
    ? total - auction.paidAmount
    : total - auction.paidAmount

  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
  const dueDate = new Date(Date.now() + Number(dueInDays) * 24 * 60 * 60 * 1000)

  // Navigation
  const nextStep = () => {
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setInvoiceType('full')
    setIncludeShipping(true)
    setIncludeCustoms(true)
    setAdditionalFees(0)
    setDiscount(0)
    setNotes('')
    setDueInDays('14')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.success('Invoice created successfully', {
      description: `${invoiceNumber} for ${auction.winnerName}`,
    })

    setIsSubmitting(false)
    resetForm()
    onOpenChange(false)

    // Navigate to invoices page
    router.push('/invoices')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  // Handle Enter key for form navigation/submission
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ignore if target is a textarea (allow normal Enter behavior)
    if (e.target instanceof HTMLTextAreaElement) {
      // Only submit on Cmd/Ctrl + Enter in textarea
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (currentStep === maxSteps && !isSubmitting) {
          handleSubmit()
        } else if (currentStep < maxSteps) {
          nextStep()
        }
      }
      return
    }

    // Enter key navigates to next step or submits
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (currentStep === maxSteps && !isSubmitting) {
        handleSubmit()
      } else if (currentStep < maxSteps) {
        nextStep()
      }
    }
  }, [currentStep, maxSteps, isSubmitting])

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className='flex flex-col gap-0 p-0 sm:max-w-lg' onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className='border-b bg-muted/30'>
          <SheetHeader className='p-4'>
            <SheetTitle className='flex items-center gap-2'>
              <MdDescription className='h-5 w-5' />
              Create Invoice
            </SheetTitle>
            <SheetDescription>
              Create invoice for {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
            </SheetDescription>
          </SheetHeader>

          {/* Step Indicator */}
          <div className='px-4 pb-4'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                  currentStep >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                )}>
                  {currentStep > 1 ? <MdCheck className='h-4 w-4' /> : '1'}
                </div>
                <span className={cn('text-sm', currentStep === 1 ? 'font-medium' : 'text-muted-foreground')}>
                  Configure
                </span>
              </div>
              <div className={cn('h-0.5 flex-1', currentStep > 1 ? 'bg-primary' : 'bg-muted-foreground/30')} />
              <div className='flex items-center gap-2'>
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                  currentStep >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                )}>
                  2
                </div>
                <span className={cn('text-sm', currentStep === 2 ? 'font-medium' : 'text-muted-foreground')}>
                  Review
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          <AnimatePresence mode='wait'>
            {/* Step 1: Configure Invoice */}
            {currentStep === 1 && (
              <motion.div
                key='step1'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='space-y-4 p-4'
              >
                {/* Customer Info */}
                <div className='flex items-center gap-3 rounded-lg border p-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                    <MdPerson className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <p className='font-medium'>{auction.winnerName}</p>
                    <p className='text-sm text-muted-foreground'>{auction.winnerEmail}</p>
                  </div>
                </div>

                {/* Invoice Type */}
                <div className='space-y-2'>
                  <Label>Invoice Type</Label>
                  <Select value={invoiceType} onValueChange={(v: 'full' | 'deposit' | 'balance') => setInvoiceType(v)}>
                    <SelectTrigger autoFocus>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='full'>Full Payment</SelectItem>
                      <SelectItem value='deposit'>Deposit Only (30%)</SelectItem>
                      <SelectItem value='balance'>Balance Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className='space-y-2'>
                  <Label>Payment Due In</Label>
                  <Select value={dueInDays} onValueChange={setDueInDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='7'>7 days</SelectItem>
                      <SelectItem value='14'>14 days</SelectItem>
                      <SelectItem value='30'>30 days</SelectItem>
                      <SelectItem value='60'>60 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Include Options */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Include in Invoice</Label>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='flex items-center gap-2'>
                      <MdDirectionsBoat className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm font-medium'>Shipping Cost</p>
                        <p className='text-xs text-muted-foreground'>{formatPrice(auction.shippingCost)}</p>
                      </div>
                    </div>
                    <Switch checked={includeShipping} onCheckedChange={setIncludeShipping} />
                  </div>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='flex items-center gap-2'>
                      <MdDescription className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm font-medium'>Insurance</p>
                        <p className='text-xs text-muted-foreground'>{formatPrice(auction.insuranceFee)}</p>
                      </div>
                    </div>
                    <Switch checked={includeCustoms} onCheckedChange={setIncludeCustoms} />
                  </div>
                </div>

                <Separator />

                {/* Additional Fees & Discount */}
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-2'>
                    <Label className='text-sm'>Additional Fees (¥)</Label>
                    <NumericInput
                      placeholder='0'
                      value={additionalFees}
                      onChange={setAdditionalFees}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-sm'>Discount (¥)</Label>
                    <NumericInput
                      placeholder='0'
                      value={discount}
                      onChange={setDiscount}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className='space-y-2'>
                  <Label className='text-sm'>Notes <span className='text-muted-foreground font-normal'>(Optional - ⌘/Ctrl+Enter to continue)</span></Label>
                  <Textarea
                    placeholder='Add any notes for this invoice...'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Price Summary */}
                <Card className='bg-muted/30'>
                  <CardContent className='space-y-2 p-4'>
                    <div className='flex justify-between text-sm'>
                      <span>Vehicle Price</span>
                      <span>{formatPrice(vehiclePrice)}</span>
                    </div>
                    {includeShipping && (
                      <div className='flex justify-between text-sm text-muted-foreground'>
                        <span>Shipping</span>
                        <span>{formatPrice(shippingCost)}</span>
                      </div>
                    )}
                    {includeCustoms && (
                      <div className='flex justify-between text-sm text-muted-foreground'>
                        <span>Insurance</span>
                        <span>{formatPrice(insuranceFee)}</span>
                      </div>
                    )}
                    {additionalAmount > 0 && (
                      <div className='flex justify-between text-sm text-muted-foreground'>
                        <span>Additional Fees</span>
                        <span>{formatPrice(additionalAmount)}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className='flex justify-between text-sm text-green-600'>
                        <span>Discount</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <Separator className='my-2' />
                    <div className='flex justify-between font-bold'>
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    {auction.paidAmount > 0 && (
                      <div className='flex justify-between text-sm text-green-600'>
                        <span>Already Paid</span>
                        <span>-{formatPrice(auction.paidAmount)}</span>
                      </div>
                    )}
                    <div className='flex justify-between text-lg font-bold text-primary'>
                      <span>Amount Due</span>
                      <span>{formatPrice(amountDue)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Review & Confirm */}
            {currentStep === 2 && (
              <motion.div
                key='step2'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='space-y-4 p-4'
              >
                <div>
                  <h3 className='font-semibold'>Review Invoice</h3>
                  <p className='text-sm text-muted-foreground'>Confirm all details before creating</p>
                </div>

                {/* Invoice Details */}
                <div className='rounded-xl border bg-card p-4'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <p className='text-xs text-muted-foreground'>Invoice Number</p>
                      <p className='font-mono font-semibold'>{invoiceNumber}</p>
                    </div>
                    <Badge variant='outline'>{invoiceType === 'full' ? 'Full Payment' : invoiceType === 'deposit' ? 'Deposit' : 'Balance'}</Badge>
                  </div>
                  <Separator className='mb-4' />
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-xs text-muted-foreground'>Issue Date</p>
                      <p className='font-medium'>{format(new Date(), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Due Date</p>
                      <p className='font-medium'>{format(dueDate, 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Card */}
                <div className='rounded-xl border p-4'>
                  <div className='mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    <MdPerson className='h-3.5 w-3.5' />
                    Bill To
                  </div>
                  <p className='font-semibold'>{auction.winnerName}</p>
                  <p className='text-sm text-muted-foreground'>{auction.winnerEmail}</p>
                </div>

                {/* Vehicle Card */}
                <div className='rounded-xl border p-4'>
                  <div className='mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    <MdDirectionsCar className='h-3.5 w-3.5' />
                    Vehicle
                  </div>
                  <p className='font-semibold'>
                    {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
                  </p>
                  <p className='font-mono text-xs text-muted-foreground'>VIN: {auction.vehicleInfo.vin}</p>
                  <p className='text-sm text-muted-foreground'>Auction: {auction.auctionId}</p>
                </div>

                {/* Amount Summary */}
                <div className='rounded-xl border border-primary/20 bg-primary/5 p-4'>
                  <div className='mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary'>
                    <MdDescription className='h-3.5 w-3.5' />
                    Amount Summary
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Vehicle Price</span>
                      <span>{formatPrice(vehiclePrice)}</span>
                    </div>
                    {includeShipping && (
                      <div className='flex justify-between text-sm'>
                        <span>Shipping</span>
                        <span>{formatPrice(shippingCost)}</span>
                      </div>
                    )}
                    {includeCustoms && (
                      <div className='flex justify-between text-sm'>
                        <span>Insurance</span>
                        <span>{formatPrice(insuranceFee)}</span>
                      </div>
                    )}
                    {additionalAmount > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Additional</span>
                        <span>{formatPrice(additionalAmount)}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className='flex justify-between text-sm text-green-600'>
                        <span>Discount</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <Separator className='my-2' />
                    <div className='flex justify-between font-bold text-lg'>
                      <span>Amount Due</span>
                      <span className='text-primary'>{formatPrice(amountDue)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div className='rounded-xl border p-4'>
                    <div className='mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                      Notes
                    </div>
                    <p className='text-sm'>{notes}</p>
                  </div>
                )}

                {/* Email Info */}
                <div className='flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground'>
                  <MdEmail className='h-4 w-4 shrink-0' />
                  <span>
                    Invoice will be saved and can be sent to{' '}
                    <span className='font-medium text-foreground'>{auction.winnerEmail}</span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t bg-muted/30 p-4'>
          <Button
            variant='ghost'
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
          >
            <MdArrowBack className='mr-2 h-4 w-4' />
            Back
          </Button>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {currentStep < maxSteps ? (
              <Button onClick={nextStep}>
                Next
                <MdArrowForward className='ml-2 h-4 w-4' />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <MdSync className='mr-2 h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    <MdCheck className='mr-2 h-4 w-4' />
                    Create Invoice
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
