import { describe, it, expect } from 'vitest'
import {
  safeParse,
  parseWithDefault,
  validateOrThrow,
  createTypeGuard,
  userSchema,
  vehicleSchema,
  userLevelSchema,
  isUser,
  isVehicle,
  isUserLevel,
} from './index'
import { z } from 'zod'

describe('safeParse', () => {
  const testSchema = z.object({ name: z.string() })

  it('returns success true for valid data', () => {
    const result = safeParse(testSchema, { name: 'test' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ name: 'test' })
    }
  })

  it('returns success false for invalid data', () => {
    const result = safeParse(testSchema, { name: 123 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeDefined()
    }
  })
})

describe('parseWithDefault', () => {
  const testSchema = z.object({ count: z.number() })
  const defaultValue = { count: 0 }

  it('returns parsed data for valid input', () => {
    const result = parseWithDefault(testSchema, { count: 5 }, defaultValue)
    expect(result).toEqual({ count: 5 })
  })

  it('returns default value for invalid input', () => {
    const result = parseWithDefault(testSchema, { count: 'invalid' }, defaultValue)
    expect(result).toEqual(defaultValue)
  })

  it('returns default value for null', () => {
    const result = parseWithDefault(testSchema, null, defaultValue)
    expect(result).toEqual(defaultValue)
  })
})

describe('validateOrThrow', () => {
  const testSchema = z.object({ id: z.string() })

  it('returns data for valid input', () => {
    const result = validateOrThrow(testSchema, { id: '123' }, 'test')
    expect(result).toEqual({ id: '123' })
  })

  it('throws error for invalid input', () => {
    expect(() => validateOrThrow(testSchema, { id: 123 }, 'test')).toThrow(
      'Validation failed for test'
    )
  })

  it('includes field path in error message', () => {
    expect(() => validateOrThrow(testSchema, { id: 123 }, 'user')).toThrow('id:')
  })
})

describe('createTypeGuard', () => {
  const numberSchema = z.number()
  const isNumber = createTypeGuard(numberSchema)

  it('returns true for valid data', () => {
    expect(isNumber(42)).toBe(true)
  })

  it('returns false for invalid data', () => {
    expect(isNumber('42')).toBe(false)
  })
})

describe('userLevelSchema', () => {
  it('accepts valid user levels', () => {
    expect(isUserLevel('admin')).toBe(true)
    expect(isUserLevel('manager')).toBe(true)
    expect(isUserLevel('sales')).toBe(true)
    expect(isUserLevel('accounting')).toBe(true)
    expect(isUserLevel('viewer')).toBe(true)
  })

  it('rejects invalid user levels', () => {
    expect(isUserLevel('superadmin')).toBe(false)
    expect(isUserLevel('')).toBe(false)
    expect(isUserLevel(null)).toBe(false)
  })
})

describe('userSchema', () => {
  it('validates a complete user', () => {
    const validUser = {
      id: '123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      level: 'admin',
    }
    expect(isUser(validUser)).toBe(true)
  })

  it('validates a minimal user', () => {
    const minimalUser = {
      id: '123',
      email: 'test@example.com',
      level: 'viewer',
    }
    expect(isUser(minimalUser)).toBe(true)
  })

  it('rejects user with invalid email', () => {
    const invalidUser = {
      id: '123',
      email: 'not-an-email',
      level: 'admin',
    }
    expect(isUser(invalidUser)).toBe(false)
  })

  it('rejects user with invalid level', () => {
    const invalidUser = {
      id: '123',
      email: 'test@example.com',
      level: 'invalid',
    }
    expect(isUser(invalidUser)).toBe(false)
  })
})

describe('vehicleSchema', () => {
  it('validates a complete vehicle', () => {
    const validVehicle = {
      id: '123',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      vin: 'ABC123',
      color: 'Blue',
      mileage: 50000,
      price: 25000,
      status: 'available',
    }
    expect(isVehicle(validVehicle)).toBe(true)
  })

  it('validates a minimal vehicle', () => {
    const minimalVehicle = {
      id: '123',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
    }
    expect(isVehicle(minimalVehicle)).toBe(true)
  })

  it('rejects vehicle with invalid year', () => {
    const invalidVehicle = {
      id: '123',
      make: 'Toyota',
      model: 'Camry',
      year: 1800,
    }
    expect(isVehicle(invalidVehicle)).toBe(false)
  })

  it('rejects vehicle with negative mileage', () => {
    const invalidVehicle = {
      id: '123',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      mileage: -100,
    }
    expect(isVehicle(invalidVehicle)).toBe(false)
  })
})
