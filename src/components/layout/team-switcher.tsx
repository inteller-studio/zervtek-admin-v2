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
          <div className='flex aspect-square size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-300 group-hover/brand:from-primary/15 group-hover/brand:to-primary/10'>
            <Image
              src='/images/logo.svg'
              alt='Zervtek'
              width={28}
              height={28}
              className='size-7 transition-transform duration-300 group-hover/brand:scale-105'
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
