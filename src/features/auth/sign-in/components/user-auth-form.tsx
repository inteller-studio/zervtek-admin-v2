'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MdSync, MdLogin } from 'react-icons/md'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { sleep, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOCK_USERS, getMockUser } from '@/lib/rbac/mock-users'
import { setCookie } from '@/lib/cookies'

const inputStyles = 'h-14 w-full rounded-xl border-2 border-border/60 bg-transparent px-4 text-base placeholder:text-muted-foreground/50 transition-all duration-200 hover:border-border focus:border-primary focus:outline-none focus:ring-0'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    toast.promise(sleep(2000), {
      loading: 'Signing in...',
      success: () => {
        setIsLoading(false)

        // Check if email matches a mock user
        const mockUserKey = Object.keys(MOCK_USERS).find(
          (key) => MOCK_USERS[key].email === data.email
        )

        let user
        if (mockUserKey) {
          user = getMockUser(mockUserKey as keyof typeof MOCK_USERS)
        } else {
          // Default to admin for demo purposes
          user = getMockUser('admin')
          user.email = data.email
        }

        // Set user and access token
        auth.setUser(user)
        auth.setAccessToken('mock-access-token')

        // Redirect to the stored location or default to dashboard
        const targetPath = redirectTo || '/'
        router.push(targetPath)

        return `Welcome back, ${user.firstName}!`
      },
      error: 'Error',
    })
  }

  // Quick login handler for development
  function handleQuickLogin(userType: string) {
    const user = getMockUser(userType as keyof typeof MOCK_USERS)
    if (user) {
      auth.setUser(user)
      auth.setAccessToken('mock-access-token')
      setCookie('user_data', JSON.stringify(user))
      toast.success(`Logged in as ${user.firstName} ${user.lastName}`)
      router.push(redirectTo || '/')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='space-y-2'>
                <FormLabel className='text-sm font-medium text-foreground/80'>
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='name@example.com'
                    className={inputStyles}
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-sm' />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <FormLabel className='text-sm font-medium text-foreground/80'>
                    Password
                  </FormLabel>
                  <Link
                    href='/forgot-password'
                    className='text-sm text-primary font-medium hover:underline underline-offset-4'
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder='Enter your password'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-sm' />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className='pt-2'
        >
          <Button
            className='w-full h-14 rounded-xl text-base font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.99]'
            disabled={isLoading}
          >
            {isLoading ? (
              <MdSync className='animate-spin h-5 w-5' />
            ) : (
              <MdLogin className='h-5 w-5' />
            )}
            Sign in
          </Button>
        </motion.div>

        {/* Quick Login for Development/Testing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className='pt-2'
        >
          <div className='relative my-4'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border/50' />
            </div>
            <div className='relative flex justify-center'>
              <span className='bg-background px-4 text-xs text-muted-foreground/70 uppercase tracking-wide font-medium'>
                Quick Login
              </span>
            </div>
          </div>

          <Select onValueChange={handleQuickLogin}>
            <SelectTrigger className='h-14 w-full rounded-xl border-2 border-border/60 bg-transparent px-4 text-base text-muted-foreground transition-all duration-200 hover:border-border focus:border-primary focus:outline-none focus:ring-0'>
              <SelectValue placeholder='Select a role to login' />
            </SelectTrigger>
            <SelectContent className='rounded-xl border border-border/60 shadow-lg'>
              {Object.entries(MOCK_USERS).map(([key, user]) => (
                <SelectItem key={key} value={key} className='rounded-lg py-3 px-4 cursor-pointer'>
                  <span className='font-medium'>{user.firstName} {user.lastName}</span>
                  <span className='text-muted-foreground ml-2'>({user.role.join(', ')})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </form>
    </Form>
  )
}
