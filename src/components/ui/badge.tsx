import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Catalyst-inspired badge variants (small flat style)
const badgeVariants = cva(
  'inline-flex items-center rounded px-1.5 py-0 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        // Catalyst color palette with improved dark mode visibility
        zinc: 'bg-zinc-600/10 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-300',
        red: 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        orange: 'bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
        amber: 'bg-amber-400/20 text-amber-700 dark:bg-amber-400/20 dark:text-amber-400',
        yellow: 'bg-yellow-400/20 text-yellow-700 dark:bg-yellow-400/20 dark:text-yellow-300',
        lime: 'bg-lime-400/20 text-lime-700 dark:bg-lime-400/20 dark:text-lime-300',
        green: 'bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-400',
        emerald: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        teal: 'bg-teal-500/15 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
        cyan: 'bg-cyan-400/20 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-300',
        sky: 'bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
        blue: 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
        indigo: 'bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
        violet: 'bg-violet-500/15 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
        purple: 'bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
        fuchsia: 'bg-fuchsia-400/15 text-fuchsia-700 dark:bg-fuchsia-400/20 dark:text-fuchsia-400',
        pink: 'bg-pink-400/15 text-pink-700 dark:bg-pink-400/20 dark:text-pink-400',
        rose: 'bg-rose-400/15 text-rose-700 dark:bg-rose-400/20 dark:text-rose-400',

        // Legacy variants for backwards compatibility
        default: 'bg-zinc-600/10 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-300',
        secondary: 'bg-zinc-600/10 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-300',
        destructive: 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        outline: 'border border-zinc-950/10 text-zinc-700 dark:border-white/20 dark:text-zinc-300',

        // Semantic status variants
        success: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        warning: 'bg-amber-400/20 text-amber-700 dark:bg-amber-400/20 dark:text-amber-400',
        error: 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        info: 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
        neutral: 'bg-zinc-600/10 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-300',
      },
      size: {
        sm: 'px-1 py-0 text-[10px] rounded-sm',
        default: 'px-1.5 py-0 text-xs rounded',
        lg: 'px-2 py-0.5 text-xs rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot='badge'
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
