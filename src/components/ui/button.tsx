import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px] shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // MD3 Primary Variants
        filled:
          'bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90 active:shadow-sm',
        'filled-tonal':
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        elevated:
          'bg-card text-primary shadow-md hover:shadow-lg hover:bg-accent active:shadow-md',
        outlined:
          'border border-border bg-transparent text-foreground hover:bg-accent active:bg-accent/80',
        text:
          'bg-transparent text-primary hover:bg-accent active:bg-accent/80',

        // Keep backward compatibility aliases
        default:
          'bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90 active:shadow-sm',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-accent active:bg-accent/80',
        ghost:
          'bg-transparent text-foreground hover:bg-accent active:bg-accent/80',

        // Special variants
        destructive:
          'bg-destructive text-white shadow-sm hover:shadow-md hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline rounded-md',
      },
      size: {
        default: 'h-10 px-6 py-2.5 has-[>svg]:px-4',
        sm: 'h-9 gap-1.5 px-4 has-[>svg]:px-3',
        xs: 'h-[30px] gap-1.5 px-3 text-xs has-[>svg]:px-2.5 [&_svg]:size-3.5',
        lg: 'h-12 px-8 text-base has-[>svg]:px-6',
        icon: 'size-10',
        'icon-sm': 'size-9',
        'icon-xs': 'size-7',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
