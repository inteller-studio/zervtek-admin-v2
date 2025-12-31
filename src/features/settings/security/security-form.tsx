'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  MdVisibility,
  MdVisibilityOff,
  MdVpnKey,
  MdLock,
  MdSecurity,
  MdPhoneAndroid,
} from 'react-icons/md'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function SecurityForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [sessionAlerts, setSessionAlerts] = useState(true)
  const [loading, setLoading] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: PasswordFormValues) {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Password updated successfully')
      form.reset()
    } catch {
      toast.error('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleMfaToggle = async (enabled: boolean) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setMfaEnabled(enabled)
      toast.success(enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled')
    } catch {
      toast.error('Failed to update MFA settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSessionAlertsToggle = async (enabled: boolean) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setSessionAlerts(enabled)
      toast.success(enabled ? 'Session alerts enabled' : 'Session alerts disabled')
    } catch {
      toast.error('Failed to update session alerts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-8'>
      {/* Two-Factor Authentication */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <MdPhoneAndroid className='h-5 w-5' />
          <h4 className='text-sm font-medium'>Two-Factor Authentication</h4>
        </div>
        <div className='flex items-center justify-between rounded-lg border p-4'>
          <div className='space-y-0.5'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Enable 2FA</span>
              {mfaEnabled ? (
                <Badge variant='green' className='text-xs'>Active</Badge>
              ) : (
                <Badge variant='secondary' className='text-xs'>Inactive</Badge>
              )}
            </div>
            <p className='text-xs text-muted-foreground'>
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            checked={mfaEnabled}
            onCheckedChange={handleMfaToggle}
            disabled={loading}
          />
        </div>
      </div>

      <Separator />

      {/* Change Password */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <MdVpnKey className='h-5 w-5' />
          <h4 className='text-sm font-medium'>Change Password</h4>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder='Enter current password'
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <MdVisibilityOff className='h-4 w-4' />
                        ) : (
                          <MdVisibility className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder='Enter new password'
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <MdVisibilityOff className='h-4 w-4' />
                        ) : (
                          <MdVisibility className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Confirm new password'
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <MdVisibilityOff className='h-4 w-4' />
                        ) : (
                          <MdVisibility className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={loading}>
              <MdLock className='mr-2 h-4 w-4' />
              Update Password
            </Button>
          </form>
        </Form>
      </div>

      <Separator />

      {/* Session Security */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <MdSecurity className='h-5 w-5' />
          <h4 className='text-sm font-medium'>Session Security</h4>
        </div>
        <div className='flex items-center justify-between rounded-lg border p-4'>
          <div className='space-y-0.5'>
            <span className='text-sm font-medium'>Login Alerts</span>
            <p className='text-xs text-muted-foreground'>
              Get notified when someone logs into your account
            </p>
          </div>
          <Switch
            checked={sessionAlerts}
            onCheckedChange={handleSessionAlertsToggle}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  )
}
