'use client'

import { MdLock, MdMessage } from 'react-icons/md'

export function EmptyState() {
  return (
    <div className='flex h-full flex-col items-center justify-center bg-[#F0F2F5] dark:bg-[#222E35]'>
      <div className='flex flex-col items-center text-center'>
        {/* WhatsApp Web illustration */}
        <div className='mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#00A884]/10'>
          <MdMessage className='h-12 w-12 text-[#00A884]' />
        </div>

        <h2 className='mb-2 text-3xl font-light text-[#41525D] dark:text-[#E9EDEF]'>
          WhatsApp Web
        </h2>

        <p className='mb-8 max-w-md text-sm text-[#667781] dark:text-[#8696A0]'>
          Send and receive messages without keeping your phone online.
          <br />
          Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
        </p>

        {/* End-to-end encryption notice */}
        <div className='flex items-center gap-2 text-xs text-[#8696A0]'>
          <MdLock className='h-3 w-3' />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  )
}
