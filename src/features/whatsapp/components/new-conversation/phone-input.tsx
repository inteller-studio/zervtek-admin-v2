'use client'

import { useState, useEffect } from 'react'
import { MdCheck, MdClose, MdLoop } from 'react-icons/md'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getCountryByCode } from '../../data/country-codes'

interface PhoneInputProps {
  value: string
  onValueChange: (value: string) => void
  countryCode: string
  isValid?: boolean
  isValidating?: boolean
  validationMessage?: string
  disabled?: boolean
  className?: string
}

export function PhoneInput({
  value,
  onValueChange,
  countryCode,
  isValid,
  isValidating,
  validationMessage,
  disabled,
  className,
}: PhoneInputProps) {
  const country = getCountryByCode(countryCode)

  // Format the phone number as user types
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters
    return input.replace(/\D/g, '')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    // Limit to reasonable length (15 digits per E.164)
    if (formatted.length <= 15) {
      onValueChange(formatted)
    }
  }

  // Display formatted number
  const getDisplayNumber = () => {
    if (!value) return ''

    // Basic formatting based on length
    if (value.length <= 3) return value
    if (value.length <= 6) return `${value.slice(0, 3)} ${value.slice(3)}`
    if (value.length <= 10) return `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`
    return `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 10)} ${value.slice(10)}`
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className='relative'>
        <Input
          type='tel'
          value={getDisplayNumber()}
          onChange={handleChange}
          placeholder={country?.format?.replace(/[+\d]/g, 'X').slice(countryCode.length) || 'Phone number'}
          disabled={disabled}
          className={cn(
            'pr-10',
            isValid === true && 'border-green-500 focus-visible:ring-green-500',
            isValid === false && 'border-red-500 focus-visible:ring-red-500'
          )}
        />
        {/* Validation indicator */}
        <div className='absolute right-3 top-1/2 -translate-y-1/2'>
          {isValidating && (
            <MdLoop className='h-4 w-4 animate-spin text-muted-foreground' />
          )}
          {!isValidating && isValid === true && (
            <MdCheck className='h-4 w-4 text-green-500' />
          )}
          {!isValidating && isValid === false && (
            <MdClose className='h-4 w-4 text-red-500' />
          )}
        </div>
      </div>

      {/* Validation message */}
      {validationMessage && (
        <p
          className={cn(
            'text-xs',
            isValid ? 'text-green-600' : 'text-red-500'
          )}
        >
          {validationMessage}
        </p>
      )}

      {/* Full number preview */}
      {value && (
        <p className='text-xs text-muted-foreground'>
          Full number: {countryCode} {getDisplayNumber()}
        </p>
      )}
    </div>
  )
}
