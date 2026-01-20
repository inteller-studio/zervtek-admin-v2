'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  ChevronRight,
  Laptop,
  Moon,
  Sun,
  Plus,
  RefreshCw,
  Settings,
  User,
  Home,
  Search,
} from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { sidebarData } from './layout/data/sidebar-data'
import { ScrollArea } from './ui/scroll-area'

export function CommandMenu() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <ScrollArea type='hover' className='h-[400px] pe-1'>
          <CommandEmpty>
            <div className='flex flex-col items-center justify-center py-6 text-center'>
              <Search className='h-10 w-10 text-muted-foreground/50 mb-2' />
              <p className='text-sm text-muted-foreground'>No results found</p>
              <p className='text-xs text-muted-foreground/70'>
                Try searching for pages, settings, or actions
              </p>
            </div>
          </CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading='Quick Actions'>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/dashboard'))}
            >
              <Home className='mr-2 h-4 w-4' />
              <span>Go to Dashboard</span>
              <CommandShortcut>G D</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/won-auctions/new'))}
            >
              <Plus className='mr-2 h-4 w-4' />
              <span>New Purchase</span>
              <CommandShortcut>N P</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => window.location.reload())}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              <span>Refresh Page</span>
              <CommandShortcut>R</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Navigation */}
          {sidebarData.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem, i) => {
                if (navItem.url)
                  return (
                    <CommandItem
                      key={`${navItem.url}-${i}`}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => router.push(navItem.url as string))
                      }}
                    >
                      <ArrowRight className='mr-2 h-4 w-4 text-muted-foreground/80' />
                      {navItem.title}
                    </CommandItem>
                  )

                return navItem.items?.map((subItem, j) => (
                  <CommandItem
                    key={`${navItem.title}-${subItem.url}-${j}`}
                    value={`${navItem.title} ${subItem.title}`}
                    onSelect={() => {
                      runCommand(() => router.push(subItem.url))
                    }}
                  >
                    <ArrowRight className='mr-2 h-4 w-4 text-muted-foreground/80' />
                    <span className='text-muted-foreground'>{navItem.title}</span>
                    <ChevronRight className='h-3 w-3 mx-1 text-muted-foreground/50' />
                    {subItem.title}
                  </CommandItem>
                ))
              })}
            </CommandGroup>
          ))}

          <CommandSeparator />

          {/* Settings */}
          <CommandGroup heading='Settings'>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/settings'))}
            >
              <Settings className='mr-2 h-4 w-4' />
              <span>Settings</span>
              <CommandShortcut>S</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/settings/profile'))}
            >
              <User className='mr-2 h-4 w-4' />
              <span>Profile</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Theme */}
          <CommandGroup heading='Theme'>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <Sun className='mr-2 h-4 w-4' />
              <span>Light Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className='mr-2 h-4 w-4' />
              <span>Dark Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <Laptop className='mr-2 h-4 w-4' />
              <span>System Theme</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
