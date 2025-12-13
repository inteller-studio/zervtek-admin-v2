'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  ChevronsUpDown,
  Download,
  Loader2,
  Plus,
  Printer,
  Save,
  Search,
  Send,
  User,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type WonAuction } from '../../data/won-auctions'
import { customers, type Customer } from '@/features/customers/data/customers'

interface AddVehicleDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddVehicle: (vehicle: Omit<WonAuction, 'id' | 'createdAt' | 'updatedAt'>) => void
}

const makes = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Lexus', 'Porsche', 'Other']
const colors = ['Black', 'White', 'Silver', 'Red', 'Blue', 'Gray', 'Pearl White', 'Other']
const ports = ['Los Angeles, USA', 'Hamburg, Germany', 'Dubai, UAE', 'Sydney, Australia', 'Singapore', 'London, UK', 'Tokyo, Japan']

export function AddVehicleDrawer({
  open,
  onOpenChange,
  onAddVehicle,
}: AddVehicleDrawerProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Vehicle Info
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [vin, setVin] = useState('')
  const [mileage, setMileage] = useState('')
  const [color, setColor] = useState('')

  // Customer Search
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')

  // Create Customer Dialog
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerAddress, setNewCustomerAddress] = useState('')
  const [newCustomerCountry, setNewCustomerCountry] = useState('')

  // Customer Info (can be from selected customer or manual entry)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery) return customers.slice(0, 10)
    const query = customerSearchQuery.toLowerCase()
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.includes(query)
      )
      .slice(0, 10)
  }, [customerSearchQuery])

  // Pricing
  const [vehiclePrice, setVehiclePrice] = useState('')
  const [shippingCost, setShippingCost] = useState('')
  const [customsFee, setCustomsFee] = useState('')

  // Other
  const [destinationPort, setDestinationPort] = useState('')
  const [notes, setNotes] = useState('')

  // Invoice Options (Step 2)
  const [includeShipping, setIncludeShipping] = useState(true)
  const [includeCustoms, setIncludeCustoms] = useState(true)

  const resetForm = () => {
    setStep(1)
    setMake('')
    setModel('')
    setYear('')
    setVin('')
    setMileage('')
    setColor('')
    setSelectedCustomer(null)
    setCustomerSearchQuery('')
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setCustomerAddress('')
    setVehiclePrice('')
    setShippingCost('')
    setCustomsFee('')
    setDestinationPort('')
    setNotes('')
    setIncludeShipping(true)
    setIncludeCustoms(true)
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerName(customer.name)
    setCustomerEmail(customer.email)
    setCustomerPhone(customer.phone)
    setCustomerAddress(customer.address)
    setCustomerSearchOpen(false)
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setCustomerAddress('')
  }

  const handleCreateCustomer = () => {
    if (!newCustomerName || !newCustomerEmail) {
      toast.error('Please fill in customer name and email')
      return
    }

    // Create a new customer object (in real app, this would be an API call)
    const newCustomer: Customer = {
      id: `new-${Date.now()}`,
      name: newCustomerName,
      email: newCustomerEmail,
      phone: newCustomerPhone,
      country: newCustomerCountry || 'Japan',
      city: '',
      address: newCustomerAddress,
      status: 'active',
      totalPurchases: 0,
      totalSpent: 0,
      totalBids: 0,
      wonAuctions: 0,
      lostAuctions: 0,
      activeBids: 0,
      verificationStatus: 'pending',
      depositAmount: 0,
      outstandingBalance: 0,
      userLevel: 'unverified',
      preferredLanguage: 'en',
      tags: [],
      createdAt: new Date(),
      lastActivity: new Date(),
    }

    // Set as selected customer
    setSelectedCustomer(newCustomer)
    setCustomerName(newCustomer.name)
    setCustomerEmail(newCustomer.email)
    setCustomerPhone(newCustomer.phone)
    setCustomerAddress(newCustomer.address)

    // Reset create customer form
    setNewCustomerName('')
    setNewCustomerEmail('')
    setNewCustomerPhone('')
    setNewCustomerAddress('')
    setNewCustomerCountry('')
    setIsCreateCustomerOpen(false)

    toast.success('Customer created successfully')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  const createVehicleData = (): Omit<WonAuction, 'id' | 'createdAt' | 'updatedAt'> => {
    const price = Number(vehiclePrice) || 0
    const shipping = Number(shippingCost) || 0
    const customs = Number(customsFee) || 0
    const total = price + shipping + customs

    return {
      auctionId: `MAN-${Date.now()}`,
      vehicleInfo: {
        make,
        model,
        year: Number(year) || new Date().getFullYear(),
        vin: vin || 'N/A',
        mileage: Number(mileage) || 0,
        color: color || 'N/A',
        images: ['#'],
      },
      winnerId: selectedCustomer?.id || `CUST-${Date.now()}`,
      winnerName: customerName,
      winnerEmail: customerEmail,
      winnerPhone: customerPhone,
      winnerAddress: customerAddress,
      winningBid: price,
      totalAmount: total,
      shippingCost: shipping,
      customsFee: customs,
      currency: 'JPY',
      status: 'payment_pending',
      paymentStatus: 'pending',
      paidAmount: 0,
      payments: [],
      documents: [],
      shipment: undefined,
      destinationPort: destinationPort || undefined,
      estimatedShippingCost: shipping,
      notes: notes || undefined,
      timeline: {},
      auctionEndDate: new Date(),
    }
  }

  const handleSaveChanges = () => {
    if (!make || !model || !customerName || !vehiclePrice) {
      toast.error('Please fill in required fields: Make, Model, Customer Name, and Vehicle Price')
      return
    }

    setIsSubmitting(true)
    const vehicleData = createVehicleData()
    onAddVehicle(vehicleData)
    toast.success('Vehicle added successfully')
    setIsSubmitting(false)
    handleOpenChange(false)
  }

  const handleNext = () => {
    if (!make || !model || !customerName || !vehiclePrice) {
      toast.error('Please fill in required fields: Make, Model, Customer Name, and Vehicle Price')
      return
    }
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleInvoiceAction = async (action: 'download' | 'email' | 'print') => {
    setIsSubmitting(true)

    // Save the vehicle first
    const vehicleData = createVehicleData()
    onAddVehicle(vehicleData)

    // Simulate invoice generation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const messages = {
      download: { title: 'Invoice downloaded', desc: 'PDF saved to downloads' },
      email: { title: 'Invoice sent', desc: `Sent to ${customerEmail}` },
      print: { title: 'Print dialog opened', desc: 'Prepare your printer' },
    }

    toast.success(messages[action].title, { description: messages[action].desc })
    setIsSubmitting(false)
    handleOpenChange(false)
  }

  const handleDone = () => {
    const vehicleData = createVehicleData()
    onAddVehicle(vehicleData)
    toast.success('Vehicle added successfully')
    handleOpenChange(false)
  }

  // Calculate totals for invoice preview
  const price = Number(vehiclePrice) || 0
  const shipping = includeShipping ? (Number(shippingCost) || 0) : 0
  const customs = includeCustoms ? (Number(customsFee) || 0) : 0
  const total = price + shipping + customs

  const invoiceNumber = `INV-MAN-${Date.now().toString().slice(-6)}`
  const invoiceDate = format(new Date(), 'MMM dd, yyyy')
  const dueDate = format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className='flex flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg'>
        {/* Header */}
        <div className='border-b bg-muted/30'>
          <SheetHeader className='p-4'>
            <div className='flex items-center justify-between'>
              <SheetTitle className='flex items-center gap-2'>
                <Car className='h-5 w-5' />
                Add Vehicle
              </SheetTitle>
              <Badge variant='outline'>Step {step} of 2</Badge>
            </div>
            <SheetDescription>
              {step === 1 ? 'Enter vehicle and customer details' : 'Review and create invoice'}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-4'>
          {step === 1 ? (
            <div className='space-y-6'>
              {/* Vehicle Information */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <Car className='h-4 w-4 text-muted-foreground' />
                  <Label className='text-sm font-semibold'>Vehicle Information</Label>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='make'>
                      Make <span className='text-red-500'>*</span>
                    </Label>
                    <Select value={make} onValueChange={setMake}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select make' />
                      </SelectTrigger>
                      <SelectContent>
                        {makes.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='model'>
                      Model <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='model'
                      placeholder='e.g., Camry'
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='year'>Year</Label>
                    <Input
                      id='year'
                      type='number'
                      placeholder='e.g., 2024'
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='color'>Color</Label>
                    <Select value={color} onValueChange={setColor}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select color' />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='vin'>VIN</Label>
                    <Input
                      id='vin'
                      placeholder='Vehicle Identification Number'
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      maxLength={17}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='mileage'>Mileage</Label>
                    <Input
                      id='mileage'
                      type='number'
                      placeholder='e.g., 50000'
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <Label className='text-sm font-semibold'>Customer Information</Label>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setIsCreateCustomerOpen(true)}
                  >
                    <Plus className='mr-1 h-3 w-3' />
                    New Customer
                  </Button>
                </div>

                {/* Customer Search */}
                <div className='space-y-2'>
                  <Label>
                    Search Customer <span className='text-red-500'>*</span>
                  </Label>
                  {selectedCustomer ? (
                    <div className='flex items-center justify-between rounded-lg border bg-muted/30 p-3'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
                          <User className='h-4 w-4 text-primary' />
                        </div>
                        <div>
                          <p className='font-medium'>{selectedCustomer.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {selectedCustomer.email} • {selectedCustomer.phone}
                          </p>
                        </div>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={handleClearCustomer}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ) : (
                    <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          role='combobox'
                          aria-expanded={customerSearchOpen}
                          className='w-full justify-between'
                        >
                          <span className='flex items-center gap-2 text-muted-foreground'>
                            <Search className='h-4 w-4' />
                            Search by name, email, or phone...
                          </span>
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-[400px] p-0' align='start'>
                        <Command>
                          <CommandInput
                            placeholder='Search customers...'
                            value={customerSearchQuery}
                            onValueChange={setCustomerSearchQuery}
                          />
                          <CommandList>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup>
                              {filteredCustomers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={customer.name}
                                  onSelect={() => handleSelectCustomer(customer)}
                                  className='cursor-pointer'
                                >
                                  <div className='flex items-center gap-3'>
                                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
                                      <User className='h-4 w-4 text-primary' />
                                    </div>
                                    <div className='flex-1'>
                                      <p className='font-medium'>{customer.name}</p>
                                      <p className='text-xs text-muted-foreground'>
                                        {customer.email} • {customer.country}
                                      </p>
                                    </div>
                                    <Badge
                                      variant='outline'
                                      className={
                                        customer.status === 'active'
                                          ? 'text-green-600'
                                          : 'text-gray-600'
                                      }
                                    >
                                      {customer.status}
                                    </Badge>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                {/* Customer Details (editable if needed) */}
                {selectedCustomer && (
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-2'>
                      <Label htmlFor='customerEmail'>Email</Label>
                      <Input
                        id='customerEmail'
                        type='email'
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className='bg-muted/30'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='customerPhone'>Phone</Label>
                      <Input
                        id='customerPhone'
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className='bg-muted/30'
                      />
                    </div>
                    <div className='col-span-2 space-y-2'>
                      <Label htmlFor='customerAddress'>Address</Label>
                      <Textarea
                        id='customerAddress'
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        rows={2}
                        className='bg-muted/30'
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Pricing */}
              <div className='space-y-4'>
                <Label className='text-sm font-semibold'>Pricing (JPY)</Label>
                <div className='grid grid-cols-3 gap-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='vehiclePrice'>
                      Vehicle Price <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='vehiclePrice'
                      type='number'
                      placeholder='0'
                      value={vehiclePrice}
                      onChange={(e) => setVehiclePrice(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='shippingCost'>Shipping</Label>
                    <Input
                      id='shippingCost'
                      type='number'
                      placeholder='0'
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='customsFee'>Customs</Label>
                    <Input
                      id='customsFee'
                      type='number'
                      placeholder='0'
                      value={customsFee}
                      onChange={(e) => setCustomsFee(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Other */}
              <div className='space-y-4'>
                <Label className='text-sm font-semibold'>Additional Details</Label>
                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='destinationPort'>Destination Port</Label>
                    <Select value={destinationPort} onValueChange={setDestinationPort}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select port' />
                      </SelectTrigger>
                      <SelectContent>
                        {ports.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='notes'>Notes</Label>
                    <Textarea
                      id='notes'
                      placeholder='Any additional notes...'
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: Invoice Preview */
            <div className='space-y-4'>
              {/* Invoice Header */}
              <div className='rounded-lg border bg-muted/30 p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Invoice</p>
                    <p className='font-mono font-semibold'>{invoiceNumber}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-muted-foreground'>Date</p>
                    <p className='font-semibold'>{invoiceDate}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>Bill To</p>
                  <p className='font-medium'>{customerName}</p>
                  {customerEmail && <p className='text-sm text-muted-foreground'>{customerEmail}</p>}
                  {customerPhone && <p className='text-sm text-muted-foreground'>{customerPhone}</p>}
                </div>
                <div className='text-right'>
                  <p className='text-xs font-medium text-muted-foreground'>Due Date</p>
                  <p className='font-medium'>{dueDate}</p>
                </div>
              </div>

              <Separator />

              {/* Vehicle Info */}
              <div>
                <p className='text-xs font-medium text-muted-foreground'>Vehicle</p>
                <p className='font-medium'>
                  {year} {make} {model}
                </p>
                {vin && (
                  <p className='font-mono text-xs text-muted-foreground'>VIN: {vin}</p>
                )}
                {color && (
                  <p className='text-sm text-muted-foreground'>Color: {color}</p>
                )}
              </div>

              <Separator />

              {/* Line Items */}
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Vehicle Price</span>
                  <span className='font-medium'>¥{price.toLocaleString()}</span>
                </div>

                {shipping > 0 && (
                  <div className='flex justify-between text-sm text-muted-foreground'>
                    <span>Shipping ({destinationPort || 'TBD'})</span>
                    <span>¥{shipping.toLocaleString()}</span>
                  </div>
                )}

                {customs > 0 && (
                  <div className='flex justify-between text-sm text-muted-foreground'>
                    <span>Customs & Duties</span>
                    <span>¥{customs.toLocaleString()}</span>
                  </div>
                )}

                <Separator />

                <div className='flex justify-between text-lg font-bold'>
                  <span>Total</span>
                  <span>¥{total.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              {/* Options */}
              <div className='flex items-center gap-6'>
                <div className='flex items-center gap-2'>
                  <Switch
                    id='inc-shipping'
                    checked={includeShipping}
                    onCheckedChange={setIncludeShipping}
                  />
                  <Label htmlFor='inc-shipping' className='cursor-pointer text-sm'>
                    Include Shipping
                  </Label>
                </div>
                <div className='flex items-center gap-2'>
                  <Switch
                    id='inc-customs'
                    checked={includeCustoms}
                    onCheckedChange={setIncludeCustoms}
                  />
                  <Label htmlFor='inc-customs' className='cursor-pointer text-sm'>
                    Include Customs
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className='flex-row gap-2 border-t bg-muted/30 p-4'>
          {step === 1 ? (
            <>
              <Button
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant='secondary'
                onClick={handleSaveChanges}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Save className='mr-2 h-4 w-4' />
                )}
                Save Changes
              </Button>
              <Button onClick={handleNext} disabled={isSubmitting}>
                Next
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </>
          ) : (
            <>
              <Button variant='outline' onClick={handleBack} disabled={isSubmitting}>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back
              </Button>
              <div className='flex flex-1 justify-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleInvoiceAction('print')}
                  disabled={isSubmitting}
                >
                  <Printer className='mr-2 h-4 w-4' />
                  Print
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleInvoiceAction('email')}
                  disabled={isSubmitting}
                >
                  <Send className='mr-2 h-4 w-4' />
                  Email
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleInvoiceAction('download')}
                  disabled={isSubmitting}
                >
                  <Download className='mr-2 h-4 w-4' />
                  PDF
                </Button>
                <Button onClick={handleDone} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Done
                </Button>
              </div>
            </>
          )}
        </SheetFooter>
      </SheetContent>

      {/* Create Customer Dialog */}
      <Dialog open={isCreateCustomerOpen} onOpenChange={setIsCreateCustomerOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Plus className='h-5 w-5' />
              Create New Customer
            </DialogTitle>
            <DialogDescription>
              Add a new customer to the system
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='col-span-2 space-y-2'>
                <Label htmlFor='newCustomerName'>
                  Full Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='newCustomerName'
                  placeholder='John Smith'
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                />
              </div>
              <div className='col-span-2 space-y-2'>
                <Label htmlFor='newCustomerEmail'>
                  Email <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='newCustomerEmail'
                  type='email'
                  placeholder='john@example.com'
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='newCustomerPhone'>Phone</Label>
                <Input
                  id='newCustomerPhone'
                  placeholder='+81 90 1234 5678'
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='newCustomerCountry'>Country</Label>
                <Input
                  id='newCustomerCountry'
                  placeholder='Japan'
                  value={newCustomerCountry}
                  onChange={(e) => setNewCustomerCountry(e.target.value)}
                />
              </div>
              <div className='col-span-2 space-y-2'>
                <Label htmlFor='newCustomerAddress'>Address</Label>
                <Textarea
                  id='newCustomerAddress'
                  placeholder='Full address'
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateCustomerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer}>
              <Plus className='mr-2 h-4 w-4' />
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
