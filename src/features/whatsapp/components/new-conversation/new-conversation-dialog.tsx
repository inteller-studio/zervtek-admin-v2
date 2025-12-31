'use client'

import { useState, useEffect } from 'react'
import { MdAddComment, MdLocalOffer, MdPersonAdd } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ConversationLabel, StaffMember, NewConversationRequest } from '../../types'
import { useWhatsAppUIStore } from '../../stores/whatsapp-ui-store'
import { CountryCodeSelector } from './country-code-selector'
import { PhoneInput } from './phone-input'
import { LabelBadge } from '../labels/label-badge'
import { getLabelColorConfig } from '../../data/label-colors'

interface NewConversationDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  labels: ConversationLabel[]
  staffMembers: StaffMember[]
  onValidatePhone?: (phone: string) => Promise<{ isValid: boolean; message?: string }>
  onCreate: (data: NewConversationRequest) => void
  isLoading?: boolean
}

export function NewConversationDialog({
  open,
  onOpenChange,
  labels,
  staffMembers,
  onValidatePhone,
  onCreate,
  isLoading,
}: NewConversationDialogProps) {
  // Form state
  const [countryCode, setCountryCode] = useState('+94') // Sri Lanka default
  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [initialMessage, setInitialMessage] = useState('')
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [assignToId, setAssignToId] = useState<string>('')

  // Validation state
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid?: boolean
    isValidating: boolean
    message?: string
  }>({ isValidating: false })

  // Validate phone number
  useEffect(() => {
    if (!phoneNumber || phoneNumber.length < 6) {
      setPhoneValidation({ isValidating: false })
      return
    }

    // Debounce validation
    const timeout = setTimeout(async () => {
      if (onValidatePhone) {
        setPhoneValidation({ isValidating: true })
        try {
          const result = await onValidatePhone(`${countryCode}${phoneNumber}`)
          setPhoneValidation({
            isValid: result.isValid,
            isValidating: false,
            message: result.message,
          })
        } catch {
          setPhoneValidation({
            isValid: false,
            isValidating: false,
            message: 'Failed to validate number',
          })
        }
      } else {
        // Basic validation without API
        const isValid = phoneNumber.length >= 8 && phoneNumber.length <= 12
        setPhoneValidation({
          isValid,
          isValidating: false,
          message: isValid ? 'Number format looks valid' : 'Enter a valid phone number',
        })
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [phoneNumber, countryCode, onValidatePhone])

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCountryCode('+94')
      setPhoneNumber('')
      setName('')
      setInitialMessage('')
      setSelectedLabelIds([])
      setAssignToId('')
      setPhoneValidation({ isValidating: false })
    }
    onOpenChange?.(newOpen)
  }

  // Toggle label selection
  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    )
  }

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneNumber || !initialMessage) return

    onCreate({
      phoneNumber,
      countryCode,
      name: name || undefined,
      labels: selectedLabelIds.length > 0 ? selectedLabelIds : undefined,
      assignToId: assignToId || undefined,
      initialMessage,
    })
  }

  const canSubmit =
    phoneNumber &&
    initialMessage &&
    phoneValidation.isValid !== false &&
    !phoneValidation.isValidating &&
    !isLoading

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MdAddComment className='h-5 w-5' />
            New Conversation
          </DialogTitle>
          <DialogDescription>
            Start a new WhatsApp conversation with a customer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Phone number */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Phone number *</label>
            <div className='flex gap-2'>
              <CountryCodeSelector
                value={countryCode}
                onValueChange={setCountryCode}
                disabled={isLoading}
              />
              <div className='flex-1'>
                <PhoneInput
                  value={phoneNumber}
                  onValueChange={setPhoneNumber}
                  countryCode={countryCode}
                  isValid={phoneValidation.isValid}
                  isValidating={phoneValidation.isValidating}
                  validationMessage={phoneValidation.message}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              Contact name <span className='text-muted-foreground'>(optional)</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='John Doe'
              disabled={isLoading}
            />
          </div>

          {/* Initial message */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Initial message *</label>
            <Textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder='Hi! I wanted to reach out about...'
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Labels */}
          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-sm font-medium'>
              <MdLocalOffer className='h-4 w-4' />
              Labels <span className='text-muted-foreground'>(optional)</span>
            </label>
            <div className='flex flex-wrap gap-2'>
              {labels.map((label) => {
                const isSelected = selectedLabelIds.includes(label.id)
                const colorConfig = getLabelColorConfig(label.color)

                return (
                  <button
                    key={label.id}
                    type='button'
                    onClick={() => toggleLabel(label.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                      isSelected
                        ? `${colorConfig.bgClass} ${colorConfig.textClass}`
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                    disabled={isLoading}
                  >
                    <span className={cn('h-2 w-2 rounded-full', colorConfig.dotClass)} />
                    {label.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Assign to */}
          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-sm font-medium'>
              <MdPersonAdd className='h-4 w-4' />
              Assign to <span className='text-muted-foreground'>(optional)</span>
            </label>
            <select
              value={assignToId}
              onChange={(e) => setAssignToId(e.target.value)}
              className='w-full rounded-md border bg-background px-3 py-2 text-sm'
              disabled={isLoading}
            >
              <option value=''>Unassigned</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.firstName} {staff.lastName} ({staff.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={!canSubmit}>
              {isLoading ? 'Creating...' : 'Start Conversation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Convenience wrapper using UI store
interface ManagedNewConversationDialogProps {
  labels: ConversationLabel[]
  staffMembers: StaffMember[]
  onValidatePhone?: (phone: string) => Promise<{ isValid: boolean; message?: string }>
  onCreate: (data: NewConversationRequest) => void
  isLoading?: boolean
}

export function ManagedNewConversationDialog({
  labels,
  staffMembers,
  onValidatePhone,
  onCreate,
  isLoading,
}: ManagedNewConversationDialogProps) {
  const { newConversationOpen, setNewConversationOpen } = useWhatsAppUIStore()

  return (
    <NewConversationDialog
      open={newConversationOpen}
      onOpenChange={setNewConversationOpen}
      labels={labels}
      staffMembers={staffMembers}
      onValidatePhone={onValidatePhone}
      onCreate={(data) => {
        onCreate(data)
        setNewConversationOpen(false)
      }}
      isLoading={isLoading}
    />
  )
}
