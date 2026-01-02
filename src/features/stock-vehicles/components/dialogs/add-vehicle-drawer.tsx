'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import {
  MdArrowBack,
  MdArrowForward,
  MdDirectionsCar,
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
import { type Vehicle, type VehicleSource, vendorPartners } from '../../data/vehicles'
import { customers, type Customer } from '@/features/customers/data/customers'

interface AddVehicleDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void
  defaultSource?: VehicleSource
}

const makes = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Lexus', 'Porsche', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Other']
const colors = ['Black', 'White', 'Silver', 'Red', 'Blue', 'Gray', 'Pearl White', 'Navy', 'Green', 'Brown', 'Other']
const ports = ['Los Angeles, USA', 'Hamburg, Germany', 'Dubai, UAE', 'Sydney, Australia', 'Singapore', 'London, UK', 'Tokyo, Japan']
const transmissions = ['Automatic', 'Manual', 'CVT']
const fuelTypes = ['Gasoline', 'Diesel', 'Hybrid', 'Electric']

// Format price
const formatPrice = (price: number) => `¥${price.toLocaleString()}`

export function AddVehicleDrawer({
  open,
  onOpenChange,
  onAddVehicle,
  defaultSource,
}: AddVehicleDrawerProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Source Selection (default to 'vendor' for stock vehicles)
  const [source, setSource] = useState<VehicleSource>(defaultSource || 'vendor')
  const [selectedVendor, setSelectedVendor] = useState('')

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
  const [transmission, setTransmission] = useState('')
  const [fuelType, setFuelType] = useState('')
  const [engineSize, setEngineSize] = useState('')
  const [grade, setGrade] = useState('')
  const [location, setLocation] = useState('')

  // Customer Search (optional - for creating invoice)
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
  const [createInvoice, setCreateInvoice] = useState(false)
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
    // Reset source
    setSource(defaultSource || 'vendor')
    setSelectedVendor('')
    // Clean up image previews
    vehicleImages.forEach(img => URL.revokeObjectURL(img.preview))
    setVehicleImages([])
    setMake('')
    setModel('')
    setYear('')
    setVin('')
    setMileage('')
    setColor('')
    setTransmission('')
    setFuelType('')
    setEngineSize('')
    setGrade('')
    setLocation('')
    setSelectedCustomer(null)
    setCustomerSearchQuery('')
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setCustomerAddress('')
    setDestinationPort('')
    setNotes('')
    setCreateInvoice(false)
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
    setCreateInvoice(true) // Enable invoice creation when customer is selected
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setCustomerAddress('')
    setCreateInvoice(false)
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
    setCreateInvoice(true)

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

  const createVehicleData = (): Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'> => {
    // Use uploaded images or empty array
    const imageUrls = vehicleImages.length > 0
      ? vehicleImages.map(img => img.preview)
      : []

    // Get vendor info if source is vendor
    const vendor = source === 'vendor' ? vendorPartners.find(v => v.name === selectedVendor) : null
    const stockPrefix = source === 'vendor' ? 'VND' : 'STK'

    return {
      stockNumber: `${stockPrefix}-${Date.now().toString().slice(-6)}`,
      make,
      model,
      year: Number(year) || new Date().getFullYear(),
      grade: grade || '',
      modelCode: '',
      mileage: Number(mileage) || 0,
      mileageDisplay: `${(Number(mileage) || 0).toLocaleString()} km`,
      price: price,
      priceDisplay: formatPrice(price),
      status: selectedCustomer ? 'reserved' : 'available',
      transmission: transmission.toLowerCase() || 'automatic',
      displacement: engineSize || '',
      fuelType: fuelType.toLowerCase() || 'gasoline',
      exteriorColor: color || 'Unknown',
      exteriorGrade: '',
      interiorGrade: '',
      score: '',
      location: location || 'Tokyo',
      auctionHouse: source === 'auction' ? 'Direct' : '',
      images: imageUrls,
      history: notes || '',
      dateAvailable: new Date().toISOString().split('T')[0],
      source: source,
      vendorName: vendor?.name,
      vendorContact: vendor?.contact,
    }
  }

  const handleNext = () => {
    if (!make || !model) {
      toast.error('Please fill in required fields: Make and Model')
      return
    }
    if (!vehiclePrice) {
      toast.error('Please enter the vehicle price')
      return
    }
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSaveOnly = () => {
    if (!vehiclePrice) {
      toast.error('Please enter the vehicle price')
      return
    }

    setIsSubmitting(true)
    const vehicleData = createVehicleData()
    onAddVehicle(vehicleData)
    toast.success('Vehicle added to stock')
    setIsSubmitting(false)
    handleOpenChange(false)
  }

  const handleCreateInvoice = async () => {
    if (!vehiclePrice) {
      toast.error('Please enter the vehicle price')
      return
    }

    if (!selectedCustomer) {
      toast.error('Please select a customer to create an invoice')
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
                Add Stock Vehicle
              </SheetTitle>
              <Badge variant='outline'>Step {step} of 2</Badge>
            </div>
            <SheetDescription>
              {step === 1 ? 'Enter vehicle details and pricing' : 'Review and optionally create invoice'}
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
                      placeholder='e.g., Supra'
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
                    <Label htmlFor='color'>Exterior Color</Label>
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
                    <Label htmlFor='transmission'>Transmission</Label>
                    <Select value={transmission} onValueChange={setTransmission}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='fuelType'>Fuel Type</Label>
                    <Select value={fuelType} onValueChange={setFuelType}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='mileage'>Mileage (km)</Label>
                    <Input
                      id='mileage'
                      type='number'
                      placeholder='e.g., 50000'
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='engineSize'>Engine Size</Label>
                    <Input
                      id='engineSize'
                      placeholder='e.g., 3.0L'
                      value={engineSize}
                      onChange={(e) => setEngineSize(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='grade'>Grade</Label>
                    <Input
                      id='grade'
                      placeholder='e.g., RZ'
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='location'>Location</Label>
                    <Input
                      id='location'
                      placeholder='e.g., Tokyo'
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className='col-span-2 space-y-2'>
                    <Label htmlFor='vin'>VIN</Label>
                    <Input
                      id='vin'
                      placeholder='Vehicle Identification Number'
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      maxLength={17}
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

              {/* Pricing */}
              <div className='space-y-4'>
                <Label className='text-sm font-semibold'>Pricing</Label>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='col-span-2 space-y-2'>
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
                </div>
              </div>

              <Separator />

              {/* Customer Selection (Optional) */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <MdPerson className='h-4 w-4 text-muted-foreground' />
                    <Label className='text-sm font-semibold'>Customer (Optional)</Label>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setIsCreateCustomerOpen(true)}
                  >
                    <MdAdd className='mr-1 h-3 w-3' />
                    New
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Select a customer to reserve this vehicle and create an invoice
                </p>

                {/* Customer Search */}
                <div className='space-y-2'>
                  {selectedCustomer ? (
                    <div className='flex items-center justify-between rounded-lg border bg-muted/30 p-3'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
                          <MdPerson className='h-4 w-4 text-primary' />
                        </div>
                        <div>
                          <p className='font-medium'>{selectedCustomer.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {selectedCustomer.email}
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
                            Search customer...
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

                {/* Destination Port */}
                {selectedCustomer && (
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
                )}
              </div>

              <Separator />

              {/* Notes */}
              <div className='space-y-2'>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  placeholder='Vehicle condition, features, history...'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ) : (
            /* Step 2: Review & Invoice */
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-1'>Review Vehicle</h3>
                <p className='text-sm text-muted-foreground'>Confirm details before adding to stock</p>
              </div>

              {/* Vehicle Card */}
              <div className='rounded-xl border border-border/50 p-4'>
                <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3'>
                  <MdDirectionsCar className='h-3.5 w-3.5' />
                  Vehicle
                </div>
                <div className='flex items-center gap-3'>
                  {vehicleImages.length > 0 ? (
                    <img
                      src={vehicleImages[0].preview}
                      alt='Vehicle'
                      className='h-16 w-24 rounded-lg object-cover'
                    />
                  ) : (
                    <div className='flex h-16 w-24 items-center justify-center rounded-lg bg-muted'>
                      <MdDirectionsCar className='h-8 w-8 text-muted-foreground/30' />
                    </div>
                  )}
                  <div>
                    <p className='font-semibold'>{year} {make} {model}</p>
                    {grade && <p className='text-sm text-muted-foreground'>Grade: {grade}</p>}
                    <div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
                      {mileage && <span>{Number(mileage).toLocaleString()} km</span>}
                      {transmission && <span>• {transmission}</span>}
                      {color && <span>• {color}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Card (if selected) */}
              {selectedCustomer && (
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
                    </div>
                  </div>
                </div>
              )}

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

              {/* Invoice Type (if customer selected) */}
              {selectedCustomer && (
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
              )}

              {/* Price Summary */}
              <div className='rounded-xl border border-primary/20 bg-primary/5 p-4'>
                <div className='flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider mb-3'>
                  <MdDescription className='h-3.5 w-3.5' />
                  {selectedCustomer ? 'Invoice Summary' : 'Price Summary'}
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Vehicle Price</span>
                    <span>{formatPrice(price)}</span>
                  </div>
                  {selectedCustomer && (
                    <div className='flex justify-between text-sm'>
                      <span>Service Fee (5%)</span>
                      <span>{formatPrice(serviceFee)}</span>
                    </div>
                  )}
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
                  <Separator className='my-2' />
                  <div className='flex justify-between font-bold text-lg'>
                    <span>Total</span>
                    <span className='text-primary'>
                      {formatPrice(selectedCustomer ? total : price)}
                    </span>
                  </div>
                  {selectedCustomer && (
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
                  )}
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

              {/* Email Preview (if customer selected) */}
              {selectedCustomer && (
                <div className='flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground'>
                  <MdDescription className='h-4 w-4 shrink-0' />
                  <span>
                    Invoice will be sent to <span className='font-medium text-foreground'>{customerEmail}</span>
                  </span>
                </div>
              )}
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
                  onClick={handleSaveOnly}
                  disabled={isSubmitting}
                >
                  {selectedCustomer ? 'Save Only' : 'Add to Stock'}
                </Button>
                {selectedCustomer && (
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
                )}
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
