import Image from 'next/image'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='min-h-svh flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20'>
      {/* Decorative gradient blobs */}
      <div className='absolute top-[-10%] -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse' />
      <div className='absolute bottom-[-10%] -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl' />

      {/* Content */}
      <div className='relative z-10 w-full max-w-[420px] flex flex-col items-center p-4'>
        <div className='mb-8 flex items-center justify-center'>
          <Image
            src='/images/logo.svg'
            alt='Zervtek'
            width={160}
            height={48}
            priority
            className='drop-shadow-md'
          />
        </div>
        {children}
      </div>
    </div>
  )
}
