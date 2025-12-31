'use client'

import { useState } from 'react'
import { MdContentCopy, MdCheck } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface VinCopyButtonProps {
  vin: string
  showFull?: boolean
}

export function VinCopyButton({ vin, showFull = false }: VinCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(vin)
      setCopied(true)
      toast.success('VIN copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy VIN')
    }
  }

  const displayVin = showFull ? vin : `${vin.slice(0, 8)}...${vin.slice(-4)}`

  return (
    <div className='flex items-center gap-1'>
      <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
        {displayVin}
      </code>
      <Button
        variant='ghost'
        size='sm'
        className='h-6 w-6 p-0'
        onClick={(e) => {
          e.stopPropagation()
          handleCopy()
        }}
      >
        {copied ? (
          <MdCheck className='h-3 w-3 text-green-600' />
        ) : (
          <MdContentCopy className='h-3 w-3' />
        )}
      </Button>
    </div>
  )
}
