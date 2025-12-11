'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { IconGoogle, IconApple } from '@/assets/brand-icons'
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
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                href='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>

        {/* Quick Login for Development/Testing */}
        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Quick Login (Demo)
            </span>
          </div>
        </div>

        <Select onValueChange={handleQuickLogin}>
          <SelectTrigger>
            <SelectValue placeholder='Select a role to login' />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MOCK_USERS).map(([key, user]) => (
              <SelectItem key={key} value={key}>
                {user.firstName} {user.lastName} ({user.role.join(', ')})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconGoogle className='h-4 w-4' /> Google
          </Button>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconApple className='h-4 w-4' /> Apple
          </Button>
        </div>
      </form>
    </Form>
  )
}
