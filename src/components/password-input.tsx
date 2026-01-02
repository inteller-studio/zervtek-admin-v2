import * as React from 'react'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  ref?: React.Ref<HTMLInputElement>
}

export function PasswordInput({
  className,
  disabled,
  ref,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className='relative w-full'>
      <input
        type={showPassword ? 'text' : 'password'}
        className={cn(
          'flex h-14 w-full rounded-xl border-2 border-border/60 bg-transparent px-4 pr-12 text-base',
          'placeholder:text-muted-foreground/50',
          'transition-all duration-200',
          'hover:border-border',
          'focus:border-primary focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
      <Button
        type='button'
        size='icon'
        variant='ghost'
        disabled={disabled}
        className='absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-muted/50'
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <MdVisibility size={20} /> : <MdVisibilityOff size={20} />}
      </Button>
    </div>
  )
}
