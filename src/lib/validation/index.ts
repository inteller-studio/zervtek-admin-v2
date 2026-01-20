import { z } from 'zod'

// Base API response schema
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
    status: z.number(),
  })

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(1).max(100),
  total: z.number().min(0),
  totalPages: z.number().min(0),
})

export type Pagination = z.infer<typeof paginationSchema>

// Paginated response schema
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: paginationSchema,
  })

// User level enum
export const userLevelSchema = z.enum([
  'admin',
  'manager',
  'sales',
  'accounting',
  'viewer',
])

export type UserLevel = z.infer<typeof userLevelSchema>

// Base user schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  level: userLevelSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export type User = z.infer<typeof userSchema>

// Vehicle schema
export const vehicleSchema = z.object({
  id: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number().min(1900).max(2100),
  vin: z.string().optional(),
  color: z.string().optional(),
  mileage: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  status: z.enum(['available', 'sold', 'pending', 'reserved']).optional(),
})

export type Vehicle = z.infer<typeof vehicleSchema>

// Bid schema
export const bidSchema = z.object({
  id: z.string(),
  amount: z.number().min(0),
  vehicleId: z.string(),
  bidderId: z.string(),
  bidder: z.object({
    id: z.string(),
    name: z.string(),
    level: userLevelSchema,
  }).optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'outbid']).optional(),
  createdAt: z.string().datetime().optional(),
})

export type Bid = z.infer<typeof bidSchema>

// Safe parse helper that returns typed result
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

// Parse with default value on failure
export function parseWithDefault<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  defaultValue: T
): T {
  const result = schema.safeParse(data)
  if (result.success) {
    return result.data
  }
  return defaultValue
}

// Validate and throw with context
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T {
  const result = schema.safeParse(data)
  if (result.success) {
    return result.data
  }
  // Zod 4 uses issues instead of errors
  const issues = result.error.issues || result.error.errors || []
  const errors = issues.map((e: { path?: (string | number)[]; message: string }) =>
    `${e.path?.join('.') || 'root'}: ${e.message}`
  )
  throw new Error(`Validation failed for ${context}: ${errors.join(', ')}`)
}

// Type guard factory
export function createTypeGuard<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): data is T => schema.safeParse(data).success
}

// Create type guards for common types
export const isUser = createTypeGuard(userSchema)
export const isVehicle = createTypeGuard(vehicleSchema)
export const isBid = createTypeGuard(bidSchema)
export const isUserLevel = createTypeGuard(userLevelSchema)
