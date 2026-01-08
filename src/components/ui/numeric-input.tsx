'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input, type InputProps } from './input'

export interface NumericInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value: number | string | undefined
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  thousandSeparator?: string
  allowDecimals?: boolean
  allowNegative?: boolean
}

function formatNumber(
  value: number | string | undefined,
  thousandSeparator: string = ',',
  allowDecimals: boolean = false
): string {
  if (value === undefined || value === '' || value === null) return ''

  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return ''

  if (allowDecimals) {
    const parts = numValue.toString().split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)
    return parts.join('.')
  }

  return Math.floor(numValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)
}

function parseNumber(
  value: string,
  thousandSeparator: string = ',',
  allowNegative: boolean = false
): number {
  if (!value) return 0

  // Remove thousand separators and parse
  let cleaned = value.replace(new RegExp(`\\${thousandSeparator}`, 'g'), '')

  // Handle negative numbers
  const isNegative = allowNegative && cleaned.startsWith('-')
  cleaned = cleaned.replace(/[^0-9.]/g, '')

  const num = parseFloat(cleaned) || 0
  return isNegative ? -num : num
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      className,
      value,
      onChange,
      prefix,
      suffix,
      thousandSeparator = ',',
      allowDecimals = false,
      allowNegative = false,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      formatNumber(value, thousandSeparator, allowDecimals)
    )
    const [isFocused, setIsFocused] = React.useState(false)

    // Update display value when external value changes (and not focused)
    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatNumber(value, thousandSeparator, allowDecimals))
      }
    }, [value, thousandSeparator, allowDecimals, isFocused])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value

      // Allow empty input
      if (inputValue === '' || inputValue === prefix) {
        setDisplayValue('')
        onChange(0)
        return
      }

      // Remove prefix/suffix for processing
      let cleanedInput = inputValue
      if (prefix) cleanedInput = cleanedInput.replace(prefix, '')
      if (suffix) cleanedInput = cleanedInput.replace(suffix, '')
      cleanedInput = cleanedInput.trim()

      // Only allow numbers, commas, decimals (if allowed), and minus (if allowed)
      const allowedChars = allowDecimals
        ? allowNegative
          ? /[^0-9,.-]/g
          : /[^0-9,.]/g
        : allowNegative
          ? /[^0-9,-]/g
          : /[^0-9,]/g

      cleanedInput = cleanedInput.replace(allowedChars, '')

      // Parse and format
      const numericValue = parseNumber(cleanedInput, thousandSeparator, allowNegative)
      const formatted = formatNumber(numericValue, thousandSeparator, allowDecimals)

      setDisplayValue(formatted)
      onChange(numericValue)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      // Reformat on blur to ensure consistent formatting
      setDisplayValue(formatNumber(value, thousandSeparator, allowDecimals))
      props.onBlur?.(e)
    }

    // Build display string with prefix/suffix
    const getDisplayString = () => {
      if (!displayValue && displayValue !== '0') return ''
      let result = displayValue
      if (prefix && displayValue) result = `${prefix}${result}`
      if (suffix && displayValue) result = `${result}${suffix}`
      return result
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        className={cn(className)}
        value={prefix || suffix ? getDisplayString() : displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        {...props}
      />
    )
  }
)
NumericInput.displayName = 'NumericInput'

export { NumericInput, formatNumber, parseNumber }
