'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { users } from './data/users'

export function Users() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const search = Object.fromEntries(searchParams.entries())

  const navigate: NavigateFn = (opts) => {
    const newSearch = typeof opts.search === 'function'
      ? opts.search(search)
      : opts.search === true
        ? search
        : opts.search
    const params = new URLSearchParams()
    Object.entries(newSearch).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value))
      }
    })
    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : '', { scroll: false })
  }

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable data={users} search={search} navigate={navigate} />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
