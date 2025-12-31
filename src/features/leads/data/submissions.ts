import { faker } from '@faker-js/faker'

faker.seed(98765)

// Submission Types (only 3 types: inquiry, signup, onboarding)
export type SubmissionType = 'inquiry' | 'signup' | 'onboarding'

// Type-specific statuses
export type InquiryStatus = 'new' | 'in_progress' | 'responded' | 'closed'
export type SignupStatus = 'pending' | 'verified' | 'rejected'
export type OnboardingStatus = 'new' | 'scheduled' | 'completed' | 'cancelled'

// Generic status for backwards compatibility
export type SubmissionStatus = 'new' | 'in_progress' | 'assigned' | 'responded' | 'closed'

// Type-specific metadata interfaces
export interface InquiryMetadata {
  vehicleId: string
  vehicleTitle: string
  vehiclePrice?: number
  vehicleMileage?: number
  inquiryType: 'price' | 'availability' | 'shipping' | 'inspection' | 'general'
}

export interface SignupMetadata {
  firstName: string
  lastName: string
  company?: string
  country: string
  city?: string
  hearAboutUs: string
  verificationStatus: 'pending' | 'verified' | 'rejected'
}

export interface OnboardingMetadata {
  vehicles: Array<{ make: string; model: string; yearRange: string }>
  destinationCountry: string
  wantsCall: boolean
  preferredDate?: string
  preferredTime?: string
  timezone?: string
  scheduledDate?: string
  scheduledTime?: string
}

export type SubmissionMetadata =
  | InquiryMetadata
  | SignupMetadata
  | OnboardingMetadata

// Main Submission interface
export interface Submission {
  id: string
  submissionNumber: string
  type: SubmissionType
  status: SubmissionStatus
  customerName: string
  customerEmail: string
  customerPhone?: string
  country?: string
  subject: string
  message: string
  metadata: SubmissionMetadata
  assignedTo?: string
  assignedToName?: string
  createdAt: Date
  updatedAt: Date
  respondedAt?: Date
}

// Typed submission interfaces for each tab
export interface InquirySubmission extends Submission {
  type: 'inquiry'
  metadata: InquiryMetadata
}

export interface SignupSubmission extends Submission {
  type: 'signup'
  metadata: SignupMetadata
}

export interface OnboardingSubmission extends Submission {
  type: 'onboarding'
  metadata: OnboardingMetadata
}

// Staff members for assignment
export const staffMembers = [
  { id: 'staff-001', name: 'Mike Johnson', role: 'Sales Manager' },
  { id: 'staff-002', name: 'Sarah Williams', role: 'Sales Rep' },
  { id: 'staff-003', name: 'Tom Anderson', role: 'Sales Rep' },
  { id: 'staff-004', name: 'Jessica Chen', role: 'Account Manager' },
  { id: 'staff-005', name: 'Kevin Miller', role: 'Sales Rep' },
  { id: 'staff-006', name: 'Emily Davis', role: 'Account Manager' },
  { id: 'staff-007', name: 'David Wilson', role: 'Sales Rep' },
  { id: 'staff-008', name: 'Rachel Brown', role: 'Sales Manager' },
]

// Mock data generators
const vehicles = [
  { title: '2023 Toyota Supra GR', price: 52000, mileage: 5000 },
  { title: '2022 Nissan GT-R Nismo', price: 85000, mileage: 12000 },
  { title: '2021 Honda NSX', price: 145000, mileage: 8000 },
  { title: '2023 Lexus LC 500', price: 78000, mileage: 3000 },
  { title: '2022 Mazda RX-7 FD', price: 45000, mileage: 65000 },
  { title: '2023 Subaru WRX STI', price: 38000, mileage: 2000 },
  { title: '2022 Mitsubishi Lancer Evo X', price: 42000, mileage: 28000 },
  { title: '2021 Toyota GR Yaris', price: 35000, mileage: 15000 },
  { title: '2023 Honda Civic Type R', price: 48000, mileage: 1000 },
  { title: '2022 Nissan Fairlady Z', price: 55000, mileage: 6000 },
]

const makes = ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Lexus']
const models: Record<string, string[]> = {
  Toyota: ['Supra', 'GR86', 'Land Cruiser', 'Crown'],
  Honda: ['NSX', 'Civic Type R', 'S2000', 'Accord'],
  Nissan: ['GT-R', 'Fairlady Z', 'Skyline', 'Silvia'],
  Mazda: ['RX-7', 'MX-5', 'RX-8', 'CX-5'],
  Subaru: ['WRX STI', 'BRZ', 'Forester', 'Outback'],
  Mitsubishi: ['Lancer Evo', 'Eclipse', 'Pajero', 'Outlander'],
  Lexus: ['LC 500', 'IS 500', 'RC F', 'LX 600'],
}

const countries = [
  'United States', 'United Kingdom', 'Germany', 'Australia',
  'Canada', 'New Zealand', 'UAE', 'Singapore', 'South Korea', 'Russia'
]

const hearAboutOptions = [
  'Google Search', 'Social Media', 'YouTube', 'Friend Referral',
  'Online Ad', 'Trade Show', 'Existing Customer', 'Other'
]

const yearRanges = ['Pre-2000', '2000-2009', '2010-2020', '2020-2024', '2025+']

// Generate inquiry submissions
function generateInquiries(count: number): InquirySubmission[] {
  return Array.from({ length: count }, (_, i) => {
    const inquiryType = faker.helpers.arrayElement(['price', 'availability', 'shipping', 'inspection', 'general'] as const)
    const status = faker.helpers.weightedArrayElement([
      { value: 'new' as const, weight: 4 },
      { value: 'in_progress' as const, weight: 3 },
      { value: 'responded' as const, weight: 2 },
      { value: 'closed' as const, weight: 1 },
    ])
    const createdAt = faker.date.recent({ days: 30 })
    const shouldAssign = status !== 'new' || faker.datatype.boolean({ probability: 0.3 })
    const assignedStaff = shouldAssign ? faker.helpers.arrayElement(staffMembers) : null
    const vehicle = faker.helpers.arrayElement(vehicles)

    const subjects: Record<string, string[]> = {
      price: ['Price inquiry', 'Best price request', 'Discount inquiry'],
      availability: ['Stock availability', 'Expected arrival date', 'Vehicle check'],
      shipping: ['Shipping cost estimate', 'Delivery time inquiry', 'Port options'],
      inspection: ['Pre-purchase inspection', 'Condition report request'],
      general: ['General inquiry', 'Information request', 'Question about vehicle'],
    }

    return {
      id: faker.string.uuid(),
      submissionNumber: `INQ-${String(1000 + i).padStart(5, '0')}`,
      type: 'inquiry' as const,
      status,
      customerName: faker.person.fullName(),
      customerEmail: faker.internet.email().toLowerCase(),
      customerPhone: faker.phone.number({ style: 'international' }),
      country: faker.helpers.arrayElement(countries),
      subject: faker.helpers.arrayElement(subjects[inquiryType]),
      message: faker.lorem.paragraph(),
      metadata: {
        vehicleId: faker.string.uuid(),
        vehicleTitle: vehicle.title,
        vehiclePrice: vehicle.price,
        vehicleMileage: vehicle.mileage,
        inquiryType,
      },
      assignedTo: assignedStaff?.id,
      assignedToName: assignedStaff?.name,
      createdAt,
      updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
      respondedAt: status === 'responded' || status === 'closed' ? faker.date.between({ from: createdAt, to: new Date() }) : undefined,
    }
  })
}

// Generate signup submissions
function generateSignups(count: number): SignupSubmission[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const verificationStatus = faker.helpers.weightedArrayElement([
      { value: 'pending' as const, weight: 5 },
      { value: 'verified' as const, weight: 3 },
      { value: 'rejected' as const, weight: 1 },
    ])
    // Map verification status to submission status
    const status = verificationStatus === 'pending' ? 'new' as const :
                   verificationStatus === 'verified' ? 'responded' as const : 'closed' as const
    const createdAt = faker.date.recent({ days: 14 })
    const shouldAssign = verificationStatus !== 'pending'
    const assignedStaff = shouldAssign ? faker.helpers.arrayElement(staffMembers) : null
    const country = faker.helpers.arrayElement(countries)

    return {
      id: faker.string.uuid(),
      submissionNumber: `SIG-${String(1000 + i).padStart(5, '0')}`,
      type: 'signup' as const,
      status,
      customerName: `${firstName} ${lastName}`,
      customerEmail: faker.internet.email({ firstName, lastName }).toLowerCase(),
      customerPhone: faker.phone.number({ style: 'international' }),
      country,
      subject: 'New Customer Registration',
      message: `New customer registration from ${country}. Interested in importing Japanese vehicles.`,
      metadata: {
        firstName,
        lastName,
        company: faker.datatype.boolean({ probability: 0.4 }) ? faker.company.name() : undefined,
        country,
        city: faker.location.city(),
        hearAboutUs: faker.helpers.arrayElement(hearAboutOptions),
        verificationStatus,
      },
      assignedTo: assignedStaff?.id,
      assignedToName: assignedStaff?.name,
      createdAt,
      updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
      respondedAt: verificationStatus !== 'pending' ? faker.date.between({ from: createdAt, to: new Date() }) : undefined,
    }
  })
}

// Generate onboarding submissions
function generateOnboarding(count: number): OnboardingSubmission[] {
  return Array.from({ length: count }, (_, i) => {
    const hasScheduled = faker.datatype.boolean({ probability: 0.5 })
    const isCompleted = hasScheduled && faker.datatype.boolean({ probability: 0.3 })
    const status = isCompleted ? 'closed' as const :
                   hasScheduled ? 'in_progress' as const : 'new' as const
    const createdAt = faker.date.recent({ days: 21 })
    const shouldAssign = status !== 'new'
    const assignedStaff = shouldAssign ? faker.helpers.arrayElement(staffMembers) : null
    const destinationCountry = faker.helpers.arrayElement(countries)
    const wantsCall = faker.datatype.boolean({ probability: 0.8 })

    // Generate 1-3 vehicles
    const vehicleCount = faker.number.int({ min: 1, max: 3 })
    const vehiclesList = Array.from({ length: vehicleCount }, () => {
      const make = faker.helpers.arrayElement(makes)
      return {
        make,
        model: faker.helpers.arrayElement(models[make]),
        yearRange: faker.helpers.arrayElement(yearRanges),
      }
    })

    // Generate scheduled date/time if applicable
    const scheduledDate = hasScheduled ? faker.date.soon({ days: 7 }).toISOString().split('T')[0] : undefined
    const scheduledTime = hasScheduled ? faker.helpers.arrayElement(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']) : undefined

    return {
      id: faker.string.uuid(),
      submissionNumber: `ONB-${String(1000 + i).padStart(5, '0')}`,
      type: 'onboarding' as const,
      status,
      customerName: faker.person.fullName(),
      customerEmail: faker.internet.email().toLowerCase(),
      customerPhone: faker.phone.number({ style: 'international' }),
      country: destinationCountry,
      subject: 'Vehicle Consultation Request',
      message: `Looking for ${vehiclesList.map(v => `${v.make} ${v.model}`).join(', ')} for export to ${destinationCountry}.`,
      metadata: {
        vehicles: vehiclesList,
        destinationCountry,
        wantsCall,
        preferredDate: wantsCall ? faker.date.soon({ days: 14 }).toISOString().split('T')[0] : undefined,
        preferredTime: wantsCall ? faker.helpers.arrayElement(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']) : undefined,
        timezone: wantsCall ? faker.helpers.arrayElement(['Asia/Tokyo', 'America/New_York', 'Europe/London', 'Australia/Sydney']) : undefined,
        scheduledDate,
        scheduledTime,
      },
      assignedTo: assignedStaff?.id,
      assignedToName: assignedStaff?.name,
      createdAt,
      updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
      respondedAt: status === 'closed' ? faker.date.between({ from: createdAt, to: new Date() }) : undefined,
    }
  })
}

// Generate all submissions
export const submissions: Submission[] = [
  ...generateInquiries(25),
  ...generateSignups(20),
  ...generateOnboarding(18),
].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

// Filtered arrays by type
export const inquiries = submissions.filter((s): s is InquirySubmission => s.type === 'inquiry')
export const signups = submissions.filter((s): s is SignupSubmission => s.type === 'signup')
export const onboardingRequests = submissions.filter((s): s is OnboardingSubmission => s.type === 'onboarding')

// Labels
export const submissionTypeLabels: Record<SubmissionType, string> = {
  inquiry: 'Inquiry',
  signup: 'Signup',
  onboarding: 'Onboarding',
}

export const submissionStatusLabels: Record<SubmissionStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  assigned: 'Assigned',
  responded: 'Responded',
  closed: 'Closed',
}

// Stats helper
export function getSubmissionStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return {
    total: submissions.length,
    newToday: submissions.filter(s => s.createdAt >= today).length,
    pendingAssignment: submissions.filter(s => !s.assignedTo && s.status !== 'closed').length,
    awaitingResponse: submissions.filter(s => s.status === 'new' || s.status === 'in_progress').length,
    byType: {
      inquiry: inquiries.length,
      signup: signups.length,
      onboarding: onboardingRequests.length,
    },
    byStatus: {
      new: submissions.filter(s => s.status === 'new').length,
      in_progress: submissions.filter(s => s.status === 'in_progress').length,
      assigned: submissions.filter(s => s.status === 'assigned').length,
      responded: submissions.filter(s => s.status === 'responded').length,
      closed: submissions.filter(s => s.status === 'closed').length,
    },
  }
}

// Type guards
export function isInquiryMetadata(metadata: SubmissionMetadata): metadata is InquiryMetadata {
  return 'vehicleId' in metadata
}

export function isSignupMetadata(metadata: SubmissionMetadata): metadata is SignupMetadata {
  return 'hearAboutUs' in metadata
}

export function isOnboardingMetadata(metadata: SubmissionMetadata): metadata is OnboardingMetadata {
  return 'vehicles' in metadata && Array.isArray((metadata as OnboardingMetadata).vehicles)
}

// Helper to check if submission is of specific type
export function isInquiry(submission: Submission): submission is InquirySubmission {
  return submission.type === 'inquiry'
}

export function isSignup(submission: Submission): submission is SignupSubmission {
  return submission.type === 'signup'
}

export function isOnboarding(submission: Submission): submission is OnboardingSubmission {
  return submission.type === 'onboarding'
}
