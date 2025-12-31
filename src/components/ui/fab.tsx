'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const fabVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-lg hover:shadow-xl active:shadow-md",
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        tertiary:
          'bg-card text-foreground border border-border hover:bg-accent',
        surface:
          'bg-card text-primary hover:bg-accent',
      },
      size: {
        sm: 'size-10 rounded-xl [&_svg]:size-5',
        default: 'size-14 rounded-2xl [&_svg]:size-6',
        lg: 'size-24 rounded-[28px] [&_svg]:size-9',
      },
      extended: {
        true: 'px-4',
        false: '',
      },
    },
    compoundVariants: [
      {
        extended: true,
        size: 'sm',
        className: 'w-auto h-10 px-4 text-sm',
      },
      {
        extended: true,
        size: 'default',
        className: 'w-auto h-14 px-5 text-base',
      },
      {
        extended: true,
        size: 'lg',
        className: 'w-auto h-24 px-7 text-lg',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      extended: false,
    },
  }
)

export interface FABProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  asChild?: boolean
}

function FAB({
  className,
  variant,
  size,
  extended,
  asChild = false,
  ...props
}: FABProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot='fab'
      className={cn(fabVariants({ variant, size, extended, className }))}
      {...props}
    />
  )
}

export { FAB, fabVariants }
