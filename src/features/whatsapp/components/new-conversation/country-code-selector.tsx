'use client'

import { useState } from 'react'
import { MdCheck, MdUnfoldMore } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { countryCodes, searchCountries, type CountryCodeInfo } from '../../data/country-codes'

interface CountryCodeSelectorProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  className?: string
}

// Popular countries to show at the top
const popularCountryCodes = ['+94', '+1', '+44', '+91', '+61', '+81', '+86']

export function CountryCodeSelector({
  value,
  onValueChange,
  disabled,
  className,
}: CountryCodeSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Get current country info
  const currentCountry = countryCodes.find((c) => c.code === value)

  // Filter and group countries
  const filteredCountries = search ? searchCountries(search) : countryCodes
  const popularCountries = filteredCountries.filter((c) => popularCountryCodes.includes(c.code))
  const otherCountries = filteredCountries.filter((c) => !popularCountryCodes.includes(c.code))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-[140px] justify-between', className)}
        >
          {currentCountry ? (
            <span className='flex items-center gap-2'>
              <span>{currentCountry.flag}</span>
              <span>{currentCountry.code}</span>
            </span>
          ) : (
            <span className='text-muted-foreground'>Select</span>
          )}
          <MdUnfoldMore className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[280px] p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Search country...'
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>

            {/* Popular countries */}
            {popularCountries.length > 0 && !search && (
              <CommandGroup heading='Popular'>
                {popularCountries.map((country) => (
                  <CountryItem
                    key={country.code}
                    country={country}
                    isSelected={value === country.code}
                    onSelect={() => {
                      onValueChange(country.code)
                      setOpen(false)
                    }}
                  />
                ))}
              </CommandGroup>
            )}

            {/* All/Search results */}
            <CommandGroup heading={search ? 'Search results' : 'All countries'}>
              {(search ? filteredCountries : otherCountries).map((country) => (
                <CountryItem
                  key={country.code + country.country}
                  country={country}
                  isSelected={value === country.code}
                  onSelect={() => {
                    onValueChange(country.code)
                    setOpen(false)
                  }}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface CountryItemProps {
  country: CountryCodeInfo
  isSelected: boolean
  onSelect: () => void
}

function CountryItem({ country, isSelected, onSelect }: CountryItemProps) {
  return (
    <CommandItem
      value={`${country.country} ${country.code}`}
      onSelect={onSelect}
      className='flex items-center gap-2'
    >
      <span className='text-base'>{country.flag}</span>
      <span className='flex-1 truncate'>{country.country}</span>
      <span className='text-muted-foreground'>{country.code}</span>
      {isSelected && <MdCheck className='h-4 w-4 text-primary' />}
    </CommandItem>
  )
}
