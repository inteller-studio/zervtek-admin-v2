'use client'

import Link from 'next/link'
import {
  MdPerson,
  MdAccountCircle,
  MdPalette,
  MdNotifications,
  MdSecurity,
  MdLogout,
} from 'react-icons/md'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/avatars/01.svg' alt='@zervtek' />
              <AvatarFallback>SN</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56 rounded-xl border-border/50 shadow-lg' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex items-center gap-3 px-1 py-1.5'>
              <Avatar className='h-10 w-10 rounded-lg'>
                <AvatarImage src='/avatars/01.svg' alt='@zervtek' />
                <AvatarFallback className='rounded-lg bg-primary/10 text-sm font-semibold text-primary'>SN</AvatarFallback>
              </Avatar>
              <div className='flex flex-col gap-0.5'>
                <p className='text-sm leading-none font-semibold'>satnaing</p>
                <p className='text-muted-foreground text-xs leading-none'>
                  satnaingdev@gmail.com
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className='bg-border/50' />
          <DropdownMenuGroup className='p-1'>
            <DropdownMenuItem asChild className='rounded-lg gap-3 px-3 py-2.5'>
              <Link href='/settings'>
                <MdPerson className='h-5 w-5 text-muted-foreground' />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className='rounded-lg gap-3 px-3 py-2.5'>
              <Link href='/settings/account'>
                <MdAccountCircle className='h-5 w-5 text-muted-foreground' />
                <span>Account</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className='rounded-lg gap-3 px-3 py-2.5'>
              <Link href='/settings/appearance'>
                <MdPalette className='h-5 w-5 text-muted-foreground' />
                <span>Appearance</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className='rounded-lg gap-3 px-3 py-2.5'>
              <Link href='/settings/notifications'>
                <MdNotifications className='h-5 w-5 text-muted-foreground' />
                <span>Notifications</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className='rounded-lg gap-3 px-3 py-2.5'>
              <Link href='/settings/security'>
                <MdSecurity className='h-5 w-5 text-muted-foreground' />
                <span>Security</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className='bg-border/50' />
          <div className='p-1'>
            <DropdownMenuItem
              variant='destructive'
              onClick={() => setOpen(true)}
              className='rounded-lg gap-3 px-3 py-2.5'
            >
              <MdLogout className='h-5 w-5' />
              <span>Sign out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
