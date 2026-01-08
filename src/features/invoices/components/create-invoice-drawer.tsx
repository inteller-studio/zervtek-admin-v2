'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  MdArrowBack,
  MdArrowForward,
  MdDirectionsCar,
  MdCheck,
  MdChevronRight,
  MdDescription,
  MdSync,
  MdEmail,
  MdLocationOn,
  MdInventory,
  MdPhone,
  MdSearch,
  MdDirectionsBoat,
  MdPerson,
  MdPeople,
  MdClose,
} from 'react-icons/md'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { cn } from '@/lib/utils'

// Types
interface Customer {
  id: string
  name: string
  email: string
  phone: string
  country: string
  type: 'individual' | 'dealer' | 'corporate'
}

interface Vehicle {
  id: string
  stockNumber: string
  year: number
  make: string
  model: string
  price: number
  status: string
  location: string
  images?: string[]
}

interface CreateInvoiceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  preselectedCustomer?: Customer | null
  preselectedVehicle?: Vehicle | null
}

// Mock data - in production these would come from API
const mockCustomers: Customer[] = [
  { id: '1', name: 'James Wilson', email: 'james@example.com', phone: '+1 555-0123', country: 'USA', type: 'dealer' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', phone: '+86 138-0000', country: 'China', type: 'individual' },
  { id: '3', name: 'Mohammed Al-Rashid', email: 'mohammed@example.com', phone: '+971 50-123', country: 'UAE', type: 'corporate' },
  { id: '4', name: 'Yuki Tanaka', email: 'yuki@example.com', phone: '+81 90-1234', country: 'Japan', type: 'individual' },
  { id: '5', name: 'Carlos Rodriguez', email: 'carlos@example.com', phone: '+52 55-1234', country: 'Mexico', type: 'dealer' },
]

const mockVehicles: Vehicle[] = [
  { id: '1', stockNumber: 'STK-00082', year: 2025, make: 'Toyota', model: 'Raize', price: 2500000, status: 'available', location: 'Japan' },
  { id: '2', stockNumber: 'STK-00083', year: 2024, make: 'Honda', model: 'CR-V', price: 3200000, status: 'available', location: 'Japan' },
  { id: '3', stockNumber: 'STK-00084', year: 2023, make: 'Mazda', model: 'CX-5', price: 2800000, status: 'available', location: 'Japan' },
  { id: '4', stockNumber: 'STK-00085', year: 2024, make: 'Nissan', model: 'X-Trail', price: 3500000, status: 'available', location: 'Japan' },
  { id: '5', stockNumber: 'STK-00086', year: 2023, make: 'Subaru', model: 'Forester', price: 3100000, status: 'available', location: 'Japan' },
]

// Step definitions
const steps = [
  { id: 1, title: 'Customer', icon: MdPeople },
  { id: 2, title: 'Vehicle', icon: MdDirectionsCar },
  { id: 3, title: 'Pricing', icon: MdInventory },
  { id: 4, title: 'Review', icon: MdDescription },
]

// Format price
const formatPrice = (price: number) => `¥${price.toLocaleString()}`

export function CreateInvoiceDrawer({
  open,
  onOpenChange,
  onSuccess,
  preselectedCustomer = null,
  preselectedVehicle = null,
}: CreateInvoiceDrawerProps) {
  // Step state - skip vehicle step if preselected
  const [currentStep, setCurrentStep] = useState(1)

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(preselectedCustomer)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(preselectedVehicle)

  // Determine active steps based on preselection
  const activeSteps = preselectedVehicle
    ? steps.filter(s => s.id !== 2) // Skip vehicle step
    : steps

  const getStepNumber = (stepId: number) => {
    if (preselectedVehicle) {
      if (stepId === 1) return 1
      if (stepId === 3) return 2
      if (stepId === 4) return 3
    }
    return stepId
  }

  const getRealStep = (displayStep: number) => {
    if (preselectedVehicle) {
      if (displayStep === 1) return 1
      if (displayStep === 2) return 3
      if (displayStep === 3) return 4
    }
    return displayStep
  }

  const maxSteps = preselectedVehicle ? 3 : 4
  const [customerSearch, setCustomerSearch] = useState('')
  const [vehicleSearch, setVehicleSearch] = useState('')

  // Pricing state
  const [invoiceType, setInvoiceType] = useState<'full' | 'deposit' | 'balance'>('full')
  const [shippingCost, setShippingCost] = useState<number>(0)
  const [inspectionFee, setInspectionFee] = useState<number>(0)
  const [documentFee, setDocumentFee] = useState<number>(0)
  const [additionalFees, setAdditionalFees] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [destinationPort, setDestinationPort] = useState('')

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filtered lists
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return mockCustomers
    const search = customerSearch.toLowerCase()
    return mockCustomers.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.country.toLowerCase().includes(search)
    )
  }, [customerSearch])

  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch) return mockVehicles
    const search = vehicleSearch.toLowerCase()
    return mockVehicles.filter(v =>
      v.stockNumber.toLowerCase().includes(search) ||
      v.make.toLowerCase().includes(search) ||
      v.model.toLowerCase().includes(search)
    )
  }, [vehicleSearch])

  // Calculate totals
  const vehiclePrice = selectedVehicle?.price || 0
  const serviceFee = Math.round(vehiclePrice * 0.05)
  const subtotal = vehiclePrice + serviceFee + shippingCost + inspectionFee + documentFee + additionalFees
  const total = subtotal - discount

  // Navigation
  const canProceed = () => {
    const realStep = getRealStep(currentStep)
    switch (realStep) {
      case 1: return !!selectedCustomer
      case 2: return !!selectedVehicle
      case 3: return true
      case 4: return true
      default: return false
    }
  }

  const nextStep = () => {
    if (currentStep < maxSteps && canProceed()) {
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
    setSelectedCustomer(preselectedCustomer)
    setSelectedVehicle(preselectedVehicle)
    setCustomerSearch('')
    setVehicleSearch('')
    setInvoiceType('full')
    setShippingCost(0)
    setInspectionFee(0)
    setDocumentFee(0)
    setAdditionalFees(0)
    setDiscount(0)
    setNotes('')
    setDestinationPort('')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.success(`Invoice created for ${selectedCustomer?.name}`)

    setIsSubmitting(false)
    resetForm()
    onOpenChange(false)
    onSuccess?.()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className='flex flex-col gap-0 p-0 sm:max-w-xl'>
        {/* Header */}
        <div className='border-b bg-muted/30'>
          <SheetHeader className='p-4'>
            <SheetTitle className='flex items-center gap-2'>
              <MdDescription className='h-5 w-5' />
              Create Invoice
            </SheetTitle>
            <SheetDescription>
              Create a new invoice in {maxSteps} easy steps
            </SheetDescription>
          </SheetHeader>

          {/* Step Indicator */}
          <div className='px-4 pb-4'>
            <div className='flex items-center justify-between'>
              {activeSteps.map((step, index) => {
                const Icon = step.icon
                const stepNumber = getStepNumber(step.id)
                const isCompleted = currentStep > stepNumber
                const isCurrent = currentStep === stepNumber

                return (
                  <div key={step.id} className='flex items-center'>
                    <div className='flex flex-col items-center'>
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                          isCompleted && 'border-primary bg-primary text-primary-foreground',
                          isCurrent && 'border-primary bg-primary/10 text-primary',
                          !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground'
                        )}
                      >
                        {isCompleted ? (
                          <MdCheck className='h-5 w-5' />
                        ) : (
                          <Icon className='h-5 w-5' />
                        )}
                      </div>
                      <span
                        className={cn(
                          'mt-1.5 text-xs font-medium',
                          isCurrent && 'text-primary',
                          !isCurrent && 'text-muted-foreground'
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < activeSteps.length - 1 && (
                      <div
                        className={cn(
                          'mx-2 h-0.5 w-12 transition-colors',
                          isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          <AnimatePresence mode='wait'>
            {/* Step 1: Customer Selection */}
            {getRealStep(currentStep) === 1 && (
              <motion.div
                key='step1'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='p-4 space-y-4'
              >
                <div>
                  <h3 className='font-semibold mb-1'>Select Customer</h3>
                  <p className='text-sm text-muted-foreground'>Choose the customer for this invoice</p>
                </div>

                {/* Search */}
                <div className='relative'>
                  <MdSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search by name, email, or country...'
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className='pl-10'
                  />
                </div>

                {/* Customer List */}
                <div className='space-y-2 max-h-[400px] overflow-y-auto'>
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all',
                        selectedCustomer?.id === customer.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border/50 hover:border-border hover:bg-muted/30'
                      )}
                    >
                      <Avatar className='h-10 w-10'>
                        <AvatarFallback className='bg-primary/10 text-primary'>
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium truncate'>{customer.name}</p>
                          <Badge variant='outline' className='text-xs capitalize'>
                            {customer.type}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground truncate'>{customer.email}</p>
                        <p className='text-xs text-muted-foreground'>{customer.country}</p>
                      </div>
                      {selectedCustomer?.id === customer.id && (
                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground'>
                          <MdCheck className='h-4 w-4' />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Vehicle Selection */}
            {getRealStep(currentStep) === 2 && (
              <motion.div
                key='step2'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='p-4 space-y-4'
              >
                <div>
                  <h3 className='font-semibold mb-1'>Select Vehicle</h3>
                  <p className='text-sm text-muted-foreground'>Choose the vehicle for this invoice</p>
                </div>

                {/* Selected Customer Summary */}
                {selectedCustomer && (
                  <div className='flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2'>
                    <MdPerson className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>
                      Invoice for: <span className='font-medium'>{selectedCustomer.name}</span>
                    </span>
                  </div>
                )}

                {/* Search */}
                <div className='relative'>
                  <MdSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search by stock #, make, or model...'
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className='pl-10'
                  />
                </div>

                {/* Vehicle List */}
                <div className='space-y-2 max-h-[350px] overflow-y-auto'>
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all',
                        selectedVehicle?.id === vehicle.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border/50 hover:border-border hover:bg-muted/30'
                      )}
                    >
                      <div className='flex h-12 w-16 items-center justify-center rounded-lg bg-muted'>
                        <MdDirectionsCar className='h-6 w-6 text-muted-foreground' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium'>{vehicle.year} {vehicle.make} {vehicle.model}</p>
                        </div>
                        <p className='text-sm text-muted-foreground font-mono'>{vehicle.stockNumber}</p>
                        <p className='text-sm font-semibold text-primary'>{formatPrice(vehicle.price)}</p>
                      </div>
                      {selectedVehicle?.id === vehicle.id && (
                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground'>
                          <MdCheck className='h-4 w-4' />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Pricing */}
            {getRealStep(currentStep) === 3 && (
              <motion.div
                key='step3'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='p-4 space-y-4'
              >
                <div>
                  <h3 className='font-semibold mb-1'>Pricing & Fees</h3>
                  <p className='text-sm text-muted-foreground'>Configure pricing and additional charges</p>
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

                {/* Destination Port */}
                <div className='space-y-2'>
                  <Label>Destination Port</Label>
                  <div className='relative'>
                    <MdDirectionsBoat className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                      placeholder='e.g., Mombasa, Durban, Dar es Salaam'
                      value={destinationPort}
                      onChange={(e) => setDestinationPort(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>

                {/* Fees Grid */}
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-2'>
                    <Label className='text-sm'>Shipping Cost (¥)</Label>
                    <NumericInput
                      placeholder='0'
                      value={shippingCost}
                      onChange={setShippingCost}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-sm'>Inspection Fee (¥)</Label>
                    <NumericInput
                      placeholder='0'
                      value={inspectionFee}
                      onChange={setInspectionFee}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-sm'>Document Fee (¥)</Label>
                    <NumericInput
                      placeholder='0'
                      value={documentFee}
                      onChange={setDocumentFee}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-sm'>Additional Fees (¥)</Label>
                    <NumericInput
                      placeholder='0'
                      value={additionalFees}
                      onChange={setAdditionalFees}
                    />
                  </div>
                </div>

                {/* Discount */}
                <div className='space-y-2'>
                  <Label className='text-sm'>Discount (¥)</Label>
                  <NumericInput
                    placeholder='0'
                    value={discount}
                    onChange={setDiscount}
                  />
                </div>

                {/* Notes */}
                <div className='space-y-2'>
                  <Label className='text-sm'>Notes <span className='text-muted-foreground font-normal'>(Optional)</span></Label>
                  <Textarea
                    placeholder='Add any notes for this invoice...'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Price Summary Card */}
                <Card className='bg-muted/30'>
                  <CardContent className='p-4 space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Vehicle Price</span>
                      <span>{formatPrice(vehiclePrice)}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Service Fee (5%)</span>
                      <span>{formatPrice(serviceFee)}</span>
                    </div>
                    {shippingCost > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Shipping</span>
                        <span>{formatPrice(shippingCost)}</span>
                      </div>
                    )}
                    {inspectionFee > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Inspection</span>
                        <span>{formatPrice(inspectionFee)}</span>
                      </div>
                    )}
                    {documentFee > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Documents</span>
                        <span>{formatPrice(documentFee)}</span>
                      </div>
                    )}
                    {additionalFees > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Additional</span>
                        <span>{formatPrice(additionalFees)}</span>
                      </div>
                    )}
                    <Separator className='my-2' />
                    {discount > 0 && (
                      <div className='flex justify-between text-sm text-green-600'>
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className='flex justify-between font-bold text-lg'>
                      <span>Total</span>
                      <span className='text-primary'>{formatPrice(total)}</span>
                    </div>
                    {invoiceType === 'deposit' && (
                      <div className='flex justify-between rounded-md bg-amber-100 dark:bg-amber-900/30 p-2 text-sm text-amber-800 dark:text-amber-200'>
                        <span>Deposit (30%)</span>
                        <span className='font-semibold'>{formatPrice(Math.round(total * 0.3))}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {getRealStep(currentStep) === 4 && (
              <motion.div
                key='step4'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='p-4 space-y-4'
              >
                <div>
                  <h3 className='font-semibold mb-1'>Review Invoice</h3>
                  <p className='text-sm text-muted-foreground'>Confirm all details before creating the invoice</p>
                </div>

                {/* Customer Card */}
                <div className='rounded-xl border border-border/50 p-4'>
                  <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3'>
                    <MdPerson className='h-3.5 w-3.5' />
                    Customer
                  </div>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarFallback className='bg-primary/10 text-primary'>
                        {selectedCustomer?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-semibold'>{selectedCustomer?.name}</p>
                      <p className='text-sm text-muted-foreground'>{selectedCustomer?.email}</p>
                      <p className='text-xs text-muted-foreground'>{selectedCustomer?.country}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Card */}
                <div className='rounded-xl border border-border/50 p-4'>
                  <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3'>
                    <MdDirectionsCar className='h-3.5 w-3.5' />
                    Vehicle
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-16 items-center justify-center rounded-lg bg-muted'>
                      <MdDirectionsCar className='h-6 w-6 text-muted-foreground' />
                    </div>
                    <div>
                      <p className='font-semibold'>{selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}</p>
                      <p className='text-sm text-muted-foreground font-mono'>{selectedVehicle?.stockNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                {destinationPort && (
                  <div className='rounded-xl border border-border/50 p-4'>
                    <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2'>
                      <MdDirectionsBoat className='h-3.5 w-3.5' />
                      Destination
                    </div>
                    <p className='font-medium'>{destinationPort}</p>
                  </div>
                )}

                {/* Invoice Summary */}
                <div className='rounded-xl border border-primary/20 bg-primary/5 p-4'>
                  <div className='flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider mb-3'>
                    <MdDescription className='h-3.5 w-3.5' />
                    Invoice Summary
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Vehicle Price</span>
                      <span>{formatPrice(vehiclePrice)}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Service Fee</span>
                      <span>{formatPrice(serviceFee)}</span>
                    </div>
                    {shippingCost > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Shipping</span>
                        <span>{formatPrice(shippingCost)}</span>
                      </div>
                    )}
                    {inspectionFee > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Inspection</span>
                        <span>{formatPrice(inspectionFee)}</span>
                      </div>
                    )}
                    {documentFee > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Documents</span>
                        <span>{formatPrice(documentFee)}</span>
                      </div>
                    )}
                    {additionalFees > 0 && (
                      <div className='flex justify-between text-sm'>
                        <span>Additional</span>
                        <span>{formatPrice(additionalFees)}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className='flex justify-between text-sm text-green-600'>
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <Separator className='my-2' />
                    <div className='flex justify-between font-bold text-lg'>
                      <span>Total</span>
                      <span className='text-primary'>{formatPrice(total)}</span>
                    </div>
                    <div className='flex items-center gap-2 mt-2'>
                      <Badge variant='outline'>{invoiceType === 'full' ? 'Full Payment' : invoiceType === 'deposit' ? 'Deposit (30%)' : 'Balance'}</Badge>
                      {invoiceType === 'deposit' && (
                        <span className='text-sm text-muted-foreground'>
                          Due: {formatPrice(Math.round(total * 0.3))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div className='rounded-xl border border-border/50 p-4'>
                    <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2'>
                      Notes
                    </div>
                    <p className='text-sm'>{notes}</p>
                  </div>
                )}

                {/* Email Preview */}
                <div className='flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground'>
                  <MdEmail className='h-4 w-4 shrink-0' />
                  <span>
                    Invoice will be sent to <span className='font-medium text-foreground'>{selectedCustomer?.email}</span>
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
              <Button onClick={nextStep} disabled={!canProceed()}>
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
