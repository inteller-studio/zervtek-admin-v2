'use client'

import Image from 'next/image'
import { Car } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VehicleImageProps {
  images?: string[]
  alt: string
  className?: string
  fallbackClassName?: string
}

export function VehicleImage({
  images,
  alt,
  className,
  fallbackClassName,
}: VehicleImageProps) {
  const hasValidImage = images && images.length > 0 && images[0] !== '#' && images[0] !== ''

  if (hasValidImage) {
    return (
      <Image
        src={images[0]}
        alt={alt}
        fill
        sizes='(max-width: 768px) 100vw, 200px'
        className={cn('object-cover', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-muted',
        fallbackClassName
      )}
    >
      <Car className='h-8 w-8 text-muted-foreground' />
    </div>
  )
}
