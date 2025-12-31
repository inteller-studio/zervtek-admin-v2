'use client'

import { useState } from 'react'
import { MdCheck } from 'react-icons/md'
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
import { cn } from '@/lib/utils'
import type { LabelColor } from '../../types'
import { LABEL_COLORS, getLabelColorConfig } from '../../data/label-colors'
import { useWhatsAppUIStore } from '../../stores/whatsapp-ui-store'

interface CreateLabelDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCreateLabel: (name: string, color: LabelColor) => void
  isLoading?: boolean
}

export function CreateLabelDialog({
  open,
  onOpenChange,
  onCreateLabel,
  isLoading,
}: CreateLabelDialogProps) {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState<LabelColor>('blue')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (!name.trim()) {
      setError('Please enter a label name')
      return
    }

    if (name.length > 30) {
      setError('Label name must be 30 characters or less')
      return
    }

    onCreateLabel(name.trim(), selectedColor)
    // Reset form
    setName('')
    setSelectedColor('blue')
    setError('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName('')
      setSelectedColor('blue')
      setError('')
    }
    onOpenChange?.(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create new label</DialogTitle>
          <DialogDescription>
            Add a new label to organize your conversations
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4 py-4'>
            {/* Name input */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Label name</label>
              <Input
                placeholder='e.g., Lead, VIP, Follow-up'
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                maxLength={30}
                autoFocus
              />
              {error && <p className='text-xs text-destructive'>{error}</p>}
              <p className='text-xs text-muted-foreground'>{name.length}/30 characters</p>
            </div>

            {/* Color picker */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Color</label>
              <div className='grid grid-cols-6 gap-2'>
                {LABEL_COLORS.map((color) => {
                  const colorConfig = getLabelColorConfig(color)
                  const isSelected = selectedColor === color

                  return (
                    <button
                      key={color}
                      type='button'
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'relative flex h-8 w-8 items-center justify-center rounded-full transition-all focus-visible:outline-none',
                        colorConfig.bgClass,
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-primary'
                          : 'hover:ring-2 hover:ring-offset-2 hover:ring-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50'
                      )}
                      title={color}
                    >
                      {isSelected && (
                        <MdCheck className={cn('h-4 w-4', colorConfig.textClass)} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Preview */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Preview</label>
              <div className='flex items-center gap-2 rounded-md border bg-muted/50 p-3'>
                {name ? (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                      getLabelColorConfig(selectedColor).bgClass,
                      getLabelColorConfig(selectedColor).textClass
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        getLabelColorConfig(selectedColor).dotClass
                      )}
                    />
                    {name}
                  </span>
                ) : (
                  <span className='text-sm text-muted-foreground'>
                    Enter a name to see preview
                  </span>
                )}
              </div>
            </div>
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
            <Button type='submit' disabled={!name.trim() || isLoading}>
              {isLoading ? 'Creating...' : 'Create label'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Convenience wrapper that uses the UI store for state
interface ManagedCreateLabelDialogProps {
  onCreateLabel: (name: string, color: LabelColor) => void
  isLoading?: boolean
}

export function ManagedCreateLabelDialog({
  onCreateLabel,
  isLoading,
}: ManagedCreateLabelDialogProps) {
  const { createLabelOpen, setCreateLabelOpen } = useWhatsAppUIStore()

  return (
    <CreateLabelDialog
      open={createLabelOpen}
      onOpenChange={setCreateLabelOpen}
      onCreateLabel={(name, color) => {
        onCreateLabel(name, color)
        setCreateLabelOpen(false)
      }}
      isLoading={isLoading}
    />
  )
}
