'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { UserAuthForm } from './components/user-auth-form'

function SignInContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || undefined

  return (
    <div className='min-h-svh grid lg:grid-cols-2'>
      {/* Left Side - Form */}
      <div className='flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20 relative bg-background'>
        {/* Subtle gradient overlay for depth */}
        <div className='absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-muted/20 dark:from-muted/10 dark:to-muted/5' />

        {/* Decorative gradient blob - theme aware */}
        <div className='absolute top-0 left-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2' />

        {/* Border separator */}
        <div className='absolute right-0 top-0 bottom-0 w-px bg-border/40 hidden lg:block' />

        <div className='relative z-10 mx-auto w-full max-w-[400px]'>
          {/* Logo */}
          <motion.div
            className='mb-10'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src='/images/logo.svg'
              alt='Zervtek'
              width={140}
              height={42}
              priority
              className='drop-shadow-sm dark:brightness-0 dark:invert'
            />
          </motion.div>

          {/* Header */}
          <motion.div
            className='mb-8'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>
              Welcome back
            </h1>
            <p className='text-muted-foreground mt-2 text-base'>
              Sign in to your account to continue
            </p>
          </motion.div>

          {/* Form */}
          <UserAuthForm redirectTo={redirect} />

          {/* Footer */}
          <motion.p
            className='text-muted-foreground/60 text-xs mt-8 text-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            By signing in, you agree to our{' '}
            <a href='/terms' className='text-primary hover:underline underline-offset-4 font-medium'>
              Terms
            </a>{' '}
            and{' '}
            <a href='/privacy' className='text-primary hover:underline underline-offset-4 font-medium'>
              Privacy Policy
            </a>
          </motion.p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className='hidden lg:block relative overflow-hidden'>
        <Image
          src='https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'
          alt='Modern office workspace'
          fill
          className='object-cover'
          priority
        />
        {/* Subtle overlay for polish */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10' />
      </div>
    </div>
  )
}

export function SignIn() {
  return (
    <Suspense fallback={
      <div className='min-h-svh flex items-center justify-center bg-background'>
        <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary' />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
