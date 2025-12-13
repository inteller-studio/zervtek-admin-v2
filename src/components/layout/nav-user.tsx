'use client'

import Link from 'next/link'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { SignOutDialog } from '@/components/sign-out-dialog'

type NavUserProps = {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()

  // Get initials from user name
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className={cn(
                  'group/user transition-all duration-200',
                  'hover:bg-accent/50',
                  'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground'
                )}
              >
                <Avatar className='h-8 w-8 rounded-lg ring-2 ring-border/50 transition-all duration-200 group-hover/user:ring-primary/30'>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className='rounded-lg bg-primary/10 text-xs font-semibold text-primary'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start leading-tight'>
                  <span className='truncate text-sm font-semibold text-foreground'>
                    {user.name}
                  </span>
                  <span className='truncate text-[11px] text-muted-foreground'>
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className='ms-auto size-4 text-muted-foreground/50 transition-colors group-hover/user:text-muted-foreground' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border-border/50 shadow-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={8}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-3 px-2 py-2.5'>
                  <Avatar className='h-10 w-10 rounded-lg ring-2 ring-border/50'>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className='rounded-lg bg-primary/10 text-sm font-semibold text-primary'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-start leading-tight'>
                    <span className='truncate font-semibold text-foreground'>
                      {user.name}
                    </span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className='bg-border/50' />
              <DropdownMenuGroup className='p-1'>
                <DropdownMenuItem asChild className='rounded-lg transition-colors'>
                  <Link href='/settings/account' className='flex items-center gap-2'>
                    <BadgeCheck className='h-4 w-4 text-muted-foreground' />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className='rounded-lg transition-colors'>
                  <Link href='/settings' className='flex items-center gap-2'>
                    <CreditCard className='h-4 w-4 text-muted-foreground' />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className='rounded-lg transition-colors'>
                  <Link href='/settings/notifications' className='flex items-center gap-2'>
                    <Bell className='h-4 w-4 text-muted-foreground' />
                    <span>Notifications</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className='bg-border/50' />
              <div className='p-1'>
                <DropdownMenuItem
                  variant='destructive'
                  onClick={() => setOpen(true)}
                  className='rounded-lg transition-colors'
                >
                  <LogOut className='h-4 w-4' />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
