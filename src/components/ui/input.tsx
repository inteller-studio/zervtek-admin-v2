import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-border flex w-full min-w-0 border bg-transparent text-base transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent/30',
  {
    variants: {
      inputSize: {
        default: 'h-10 px-4 py-2 rounded-full',
        sm: 'h-9 px-3 py-1.5 rounded-full',
        xs: 'h-8 px-3 py-1 text-xs rounded-full',
        lg: 'h-12 px-5 py-2.5 rounded-full',
      },
    },
    defaultVariants: {
      inputSize: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {
  size?: number | undefined
}

function Input({ className, type, inputSize, size, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot='input'
      size={size}
      className={cn(inputVariants({ inputSize, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
