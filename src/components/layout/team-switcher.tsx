import * as React from 'react'
import Image from 'next/image'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type TeamSwitcherProps = {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  const activeTeam = teams[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='cursor-default hover:bg-transparent group/brand'
        >
          <div className='flex aspect-square size-9 items-center justify-center rounded-lg bg-muted/50 border border-border/50'>
            <Image
              src='/images/logo.svg'
              alt='Zervtek'
              width={28}
              height={28}
              className='size-7'
            />
          </div>
          <div className='grid flex-1 text-start leading-tight'>
            <span className='truncate text-sm font-bold tracking-tight text-foreground'>
              {activeTeam.name}
            </span>
            <span className='truncate text-[11px] text-muted-foreground/70'>
              {activeTeam.plan}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
