'use client'

import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag, Eye, TrendingUp, CheckCircle } from 'lucide-react'
import { ModelsTable } from './components/models-table'
import { ModelsPrimaryButtons } from './components/models-primary-buttons'
import { modelsData } from './data/models'

export function ModelsSEO() {
  const totalModels = modelsData.length
  const publishedModels = modelsData.filter((m) => m.status === 'published').length
  const avgSeoScore = Math.round(modelsData.reduce((acc, m) => acc + m.seoScore, 0) / totalModels)
  const totalViews = modelsData.reduce((acc, m) => acc + m.pageViews, 0)

  return (
    <>
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
            <h2 className='text-2xl font-bold tracking-tight'>Models SEO</h2>
            <p className='text-muted-foreground'>
              Manage SEO content for vehicle models with linked blog content.
            </p>
          </div>
          <ModelsPrimaryButtons />
        </div>

        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Models</CardTitle>
              <Tag className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalModels}</div>
              <p className='text-xs text-muted-foreground'>Vehicle models</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Published</CardTitle>
              <CheckCircle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{publishedModels}</div>
              <p className='text-xs text-muted-foreground'>Live pages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Avg SEO Score</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{avgSeoScore}%</div>
              <p className='text-xs text-muted-foreground'>Optimization level</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Views</CardTitle>
              <Eye className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalViews.toLocaleString()}</div>
              <p className='text-xs text-muted-foreground'>Page views</p>
            </CardContent>
          </Card>
        </div>

        <ModelsTable data={modelsData} />
      </Main>
    </>
  )
}
