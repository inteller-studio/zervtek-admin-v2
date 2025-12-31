'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { format } from 'date-fns'
import {
  MdArrowBack,
  MdArrowForward,
  MdDirectionsCar,
  MdCheck,
  MdUnfoldMore,
  MdDescription,
  MdAddPhotoAlternate,
  MdSync,
  MdAdd,
  MdSearch,
  MdDirectionsBoat,
  MdDelete,
  MdUpload,
  MdPerson,
  MdClose,
} from 'react-icons/md'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { type Purchase } from '../../data/won-auctions'
import { customers, type Customer } from '@/features/customers/data/customers'

interface AddVehicleDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddVehicle: (vehicle: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => void
}

const makes = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Lexus', 'Porsche', 'Other']
const colors = ['Black', 'White', 'Silver', 'Red', 'Blue', 'Gray', 'Pearl White', 'Other']
const ports = ['Los Angeles, USA', 'Hamburg, Germany', 'Dubai, UAE', 'Sydney, Australia', 'Singapore', 'London, UK', 'Tokyo, Japan']

// Format price
const formatPrice = (price: number) => `¥${price.toLocaleString()}`

export function AddVehicleDrawer({
  open,
  onOpenChange,
  onAddVehicle,
}: AddVehicleDrawerProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Photo Upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [vehicleImages, setVehicleImages] = useState<{ id: string; file: File; preview: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)

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

  // Other
  const [destinationPort, setDestinationPort] = useState('')
  const [notes, setNotes] = useState('')

  // Invoice Options (Step 2)
  const [invoiceType, setInvoiceType] = useState<'full' | 'deposit' | 'balance'>('full')
  const [vehiclePrice, setVehiclePrice] = useState('')
  const [shippingCost, setShippingCost] = useState('')
  const [inspectionFee, setInspectionFee] = useState('')
  const [documentFee, setDocumentFee] = useState('')
  const [additionalFees, setAdditionalFees] = useState('')
  const [discount, setDiscount] = useState('')

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

  // Photo upload handlers
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const newImages = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, 10 - vehicleImages.length) // Max 10 images
      .map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
      }))

    if (newImages.length > 0) {
      setVehicleImages(prev => [...prev, ...newImages])
    }

    if (files.length > newImages.length) {
      toast.info('Some files were skipped', {
        description: 'Only image files are allowed, max 10 images',
      })
    }
  }, [vehicleImages.length])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleRemoveImage = useCallback((id: string) => {
    setVehicleImages(prev => {
      const image = prev.find(img => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter(img => img.id !== id)
    })
  }, [])

  const resetForm = () => {
    setStep(1)
    // Clean up image previews
    vehicleImages.forEach(img => URL.revokeObjectURL(img.preview))
    setVehicleImages([])
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
    setDestinationPort('')
    setNotes('')
    setInvoiceType('full')
    setVehiclePrice('')
    setShippingCost('')
    setInspectionFee('')
    setDocumentFee('')
    setAdditionalFees('')
    setDiscount('')
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
      loginCount: 0,
      failedLoginAttempts: 0,
      riskLevel: 'low',
      savedAddresses: [],
      paymentMethods: [],
      twoFactorEnabled: false,
      activeSessions: [],
      verificationDocuments: [],
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

  // Calculate totals for invoice
  const price = Number(vehiclePrice) || 0
  const serviceFee = Math.round(price * 0.05)
  const shippingAmount = Number(shippingCost) || 0
  const inspectionAmount = Number(inspectionFee) || 0
  const documentAmount = Number(documentFee) || 0
  const additionalAmount = Number(additionalFees) || 0
  const discountAmount = Number(discount) || 0
  const subtotal = price + serviceFee + shippingAmount + inspectionAmount + documentAmount + additionalAmount
  const total = subtotal - discountAmount

  const createVehicleData = (): Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'> => {
    // Use uploaded images or placeholder
    const imageUrls = vehicleImages.length > 0
      ? vehicleImages.map(img => img.preview)
      : ['#']

    return {
      auctionId: `MAN-${Date.now()}`,
      source: 'stock',
      vehicleInfo: {
        make,
        model,
        year: Number(year) || new Date().getFullYear(),
        vin: vin || 'N/A',
        mileage: Number(mileage) || 0,
        color: color || 'N/A',
        images: imageUrls,
      },
      winnerId: selectedCustomer?.id || `CUST-${Date.now()}`,
      winnerName: customerName,
      winnerEmail: customerEmail,
      winnerPhone: customerPhone,
      winnerAddress: customerAddress,
      winningBid: price,
      totalAmount: total,
      shippingCost: shippingAmount,
      insuranceFee: inspectionAmount + documentAmount + additionalAmount,
      currency: 'JPY',
      status: 'payment_pending',
      paymentStatus: 'pending',
      paidAmount: 0,
      payments: [],
      documents: [],
      shipment: undefined,
      destinationPort: destinationPort || undefined,
      estimatedShippingCost: shippingAmount,
      notes: notes || undefined,
      timeline: {},
      auctionEndDate: new Date(),
    }
  }

  const handleNext = () => {
    if (!make || !model || !customerName) {
      toast.error('Please fill in required fields: Make, Model, and Customer')
      return
    }
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSaveWithoutInvoice = () => {
    if (!vehiclePrice) {
      toast.error('Please enter the vehicle price')
      return
    }

    setIsSubmitting(true)
    const vehicleData = createVehicleData()
    onAddVehicle(vehicleData)
    toast.success('Vehicle added successfully')
    setIsSubmitting(false)
    handleOpenChange(false)
  }

  const handleCreateInvoice = async () => {
    if (!vehiclePrice) {
      toast.error('Please enter the vehicle price')
      return
    }

    setIsSubmitting(true)

    // Save the vehicle first
    const vehicleData = createVehicleData()
    onAddVehicle(vehicleData)

    // Simulate invoice creation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success('Vehicle added and invoice created', {
      description: `Invoice sent to ${customerEmail}`,
    })
    setIsSubmitting(false)
    handleOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className='flex flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg'>
        {/* Header */}
        <div className='border-b bg-muted/30'>
          <SheetHeader className='p-4'>
            <div className='flex items-center justify-between'>
              <SheetTitle className='flex items-center gap-2'>
                <MdDirectionsCar className='h-5 w-5' />
                Add Vehicle
              </SheetTitle>
              <Badge variant='outline'>Step {step} of 2</Badge>
            </div>
            <SheetDescription>
              {step === 1 ? 'Enter vehicle and customer details' : 'Create invoice for this vehicle'}
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
                  <MdDirectionsCar className='h-4 w-4 text-muted-foreground' />
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

                {/* Photo Upload Section */}
                <div className='space-y-3 pt-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <MdAddPhotoAlternate className='h-4 w-4 text-muted-foreground' />
                      <Label className='text-sm font-medium'>Vehicle Photos</Label>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      {vehicleImages.length}/10 photos
                    </span>
                  </div>

                  {/* Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all
                      ${isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      multiple
                      className='hidden'
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                    <MdUpload className='mx-auto h-8 w-8 text-muted-foreground' />
                    <p className='mt-2 text-sm font-medium'>
                      Drop photos here or click to upload
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      PNG, JPG, WEBP up to 10MB each
                    </p>
                  </div>

                  {/* Image Previews */}
                  {vehicleImages.length > 0 && (
                    <div className='grid grid-cols-4 gap-2'>
                      {vehicleImages.map((image, index) => (
                        <div
                          key={image.id}
                          className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'
                        >
                          <img
                            src={image.preview}
                            alt={`Vehicle photo ${index + 1}`}
                            className='h-full w-full object-cover'
                          />
                          {index === 0 && (
                            <span className='absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground'>
                              Main
                            </span>
                          )}
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveImage(image.id)
                            }}
                            className='absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100'
                          >
                            <MdDelete className='h-3 w-3' />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <MdPerson className='h-4 w-4 text-muted-foreground' />
                    <Label className='text-sm font-semibold'>Customer Information</Label>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setIsCreateCustomerOpen(true)}
                  >
                    <MdAdd className='mr-1 h-3 w-3' />
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
                          <MdPerson className='h-4 w-4 text-primary' />
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
                        <MdClose className='h-4 w-4' />
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
                            <MdSearch className='h-4 w-4' />
                            Search by name, email, or phone...
                          </span>
                          <MdUnfoldMore className='ml-2 h-4 w-4 shrink-0 opacity-50' />
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
                                      <MdPerson className='h-4 w-4 text-primary' />
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

              {/* Additional Details */}
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
            /* Step 2: Create Invoice */
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-1'>Create Invoice</h3>
                <p className='text-sm text-muted-foreground'>Configure pricing and review invoice details</p>
              </div>

              {/* Customer Card */}
              <div className='rounded-xl border border-border/50 p-4'>
                <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3'>
                  <MdPerson className='h-3.5 w-3.5' />
                  Customer
                </div>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                    <span className='text-sm font-medium text-primary'>
                      {customerName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className='font-semibold'>{customerName}</p>
                    <p className='text-sm text-muted-foreground'>{customerEmail}</p>
                    {customerPhone && <p className='text-xs text-muted-foreground'>{customerPhone}</p>}
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
                    <p className='font-semibold'>{year} {make} {model}</p>
                    {vin && <p className='text-sm text-muted-foreground font-mono'>VIN: {vin}</p>}
                    {color && <p className='text-xs text-muted-foreground'>Color: {color}</p>}
                  </div>
                </div>
              </div>

              {/* Destination Card */}
              {destinationPort && (
                <div className='rounded-xl border border-border/50 p-4'>
                  <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2'>
                    <MdDirectionsBoat className='h-3.5 w-3.5' />
                    Destination
                  </div>
                  <p className='font-medium'>{destinationPort}</p>
                </div>
              )}

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

              {/* Pricing Fields */}
              <div className='space-y-3'>
                <div className='space-y-2'>
                  <Label>
                    Vehicle Price (¥) <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    type='number'
                    placeholder='e.g., 2500000'
                    value={vehiclePrice}
                    onChange={(e) => setVehiclePrice(e.target.value)}
                  />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-2'>
                    <Label className='text-sm'>Shipping Cost (¥)</Label>
                    <Input
                      type='number'
                      placeholder='0'
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-sm'>Inspection Fee (¥)</Label>
                    <Input
                      type='number'
                      placeholder='0'
                      value={inspectionFee}
                      onChange={(e) => setInspectionFee(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-sm'>Document Fee (¥)</Label>
                    <Input
                      type='number'
                      placeholder='0'
                      value={documentFee}
                      onChange={(e) => setDocumentFee(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-sm'>Additional Fees (¥)</Label>
                    <Input
                      type='number'
                      placeholder='0'
                      value={additionalFees}
                      onChange={(e) => setAdditionalFees(e.target.value)}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm'>Discount (¥)</Label>
                  <Input
                    type='number'
                    placeholder='0'
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>

              {/* Invoice Summary */}
              <div className='rounded-xl border border-primary/20 bg-primary/5 p-4'>
                <div className='flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider mb-3'>
                  <MdDescription className='h-3.5 w-3.5' />
                  Invoice Summary
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Vehicle Price</span>
                    <span>{formatPrice(price)}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Service Fee (5%)</span>
                    <span>{formatPrice(serviceFee)}</span>
                  </div>
                  {shippingAmount > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span>Shipping</span>
                      <span>{formatPrice(shippingAmount)}</span>
                    </div>
                  )}
                  {inspectionAmount > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span>Inspection</span>
                      <span>{formatPrice(inspectionAmount)}</span>
                    </div>
                  )}
                  {documentAmount > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span>Documents</span>
                      <span>{formatPrice(documentAmount)}</span>
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
                    <span>Total</span>
                    <span className='text-primary'>{formatPrice(total)}</span>
                  </div>
                  <div className='flex items-center gap-2 mt-2'>
                    <Badge variant='outline'>
                      {invoiceType === 'full' ? 'Full Payment' : invoiceType === 'deposit' ? 'Deposit (30%)' : 'Balance'}
                    </Badge>
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
                <MdDescription className='h-4 w-4 shrink-0' />
                <span>
                  Invoice will be sent to <span className='font-medium text-foreground'>{customerEmail}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t bg-muted/30 p-4'>
          {step === 1 ? (
            <>
              <Button
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={isSubmitting}>
                Next
                <MdArrowForward className='ml-2 h-4 w-4' />
              </Button>
            </>
          ) : (
            <>
              <Button variant='outline' onClick={handleBack} disabled={isSubmitting}>
                <MdArrowBack className='mr-2 h-4 w-4' />
                Back
              </Button>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={handleSaveWithoutInvoice}
                  disabled={isSubmitting}
                >
                  Save Only
                </Button>
                <Button onClick={handleCreateInvoice} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <MdSync className='mr-2 h-4 w-4 animate-spin' />
                      Creating...
                    </>
                  ) : (
                    <>
                      <MdDescription className='mr-2 h-4 w-4' />
                      Create Invoice
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>

      {/* Create Customer Dialog */}
      <Dialog open={isCreateCustomerOpen} onOpenChange={setIsCreateCustomerOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MdAdd className='h-5 w-5' />
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
              <MdAdd className='mr-2 h-4 w-4' />
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
