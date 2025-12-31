'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MdAdd, MdLocationOn, MdBusiness, MdWarehouse, MdSearch } from 'react-icons/md'
import { toast } from 'sonner'

import { type Yard, type YardFormData, YARD_STATUSES } from './types'
import { mockYards } from './data/yards'
import { YardsTable } from './components/yards-table'
import { YardFormDialog } from './components/dialogs/yard-form-dialog'
import { DeleteYardDialog } from './components/dialogs/delete-yard-dialog'

export default function YardsPage() {
  const [yards, setYards] = useState<Yard[]>(mockYards)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedYard, setSelectedYard] = useState<Yard | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filtered yards
  const filteredYards = useMemo(() => {
    return yards.filter((yard) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        yard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        yard.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        yard.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || yard.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [yards, searchQuery, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const active = yards.filter((y) => y.status === 'active')
    const totalCapacity = yards.reduce((sum, y) => sum + y.capacity, 0)
    const totalVehicles = yards.reduce((sum, y) => sum + y.currentVehicles, 0)
    const avgUtilization = totalCapacity > 0 ? Math.round((totalVehicles / totalCapacity) * 100) : 0

    return {
      total: yards.length,
      active: active.length,
      inactive: yards.length - active.length,
      totalCapacity,
      totalVehicles,
      avgUtilization,
    }
  }, [yards])

  // Handlers
  const handleAdd = () => {
    setSelectedYard(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (yard: Yard) => {
    setSelectedYard(yard)
    setFormDialogOpen(true)
  }

  const handleDelete = (yard: Yard) => {
    setSelectedYard(yard)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: YardFormData) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (selectedYard) {
      // Update existing yard
      setYards((prev) =>
        prev.map((y) =>
          y.id === selectedYard.id
            ? {
                ...y,
                ...data,
                updatedAt: new Date(),
              }
            : y
        )
      )
      toast.success(`Yard "${data.name}" updated successfully`)
    } else {
      // Add new yard
      const newYard: Yard = {
        id: crypto.randomUUID(),
        ...data,
        currentVehicles: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setYards((prev) => [...prev, newYard])
      toast.success(`Yard "${data.name}" added successfully`)
    }

    setIsLoading(false)
    setFormDialogOpen(false)
    setSelectedYard(null)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedYard) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setYards((prev) => prev.filter((y) => y.id !== selectedYard.id))
    toast.success(`Yard "${selectedYard.name}" deleted successfully`)

    setIsLoading(false)
    setDeleteDialogOpen(false)
    setSelectedYard(null)
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-2'>
          <MdWarehouse className='h-5 w-5' />
          <span className='font-semibold'>Yards</span>
        </div>
        <HeaderActions />
      </Header>

      <Main>
        {/* Stats Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='rounded-lg border bg-card p-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
              <MdBusiness className='h-4 w-4' />
              Total Yards
            </div>
            <p className='text-2xl font-bold'>{stats.total}</p>
            <p className='text-xs text-muted-foreground'>
              {stats.active} active, {stats.inactive} inactive
            </p>
          </div>

          <div className='rounded-lg border bg-card p-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
              <MdWarehouse className='h-4 w-4' />
              Total Capacity
            </div>
            <p className='text-2xl font-bold'>{stats.totalCapacity}</p>
            <p className='text-xs text-muted-foreground'>vehicles</p>
          </div>

          <div className='rounded-lg border bg-card p-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
              <MdLocationOn className='h-4 w-4' />
              Vehicles Stored
            </div>
            <p className='text-2xl font-bold'>{stats.totalVehicles}</p>
            <p className='text-xs text-muted-foreground'>across all yards</p>
          </div>

          <div className='rounded-lg border bg-card p-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
              <MdBusiness className='h-4 w-4' />
              Avg Utilization
            </div>
            <p className='text-2xl font-bold'>{stats.avgUtilization}%</p>
            <p className='text-xs text-muted-foreground'>capacity used</p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className='flex items-center justify-between gap-4 mb-4'>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <MdSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search yards...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-64 pl-9'
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                {YARD_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAdd}>
            <MdAdd className='h-4 w-4 mr-2' />
            Add Yard
          </Button>
        </div>

        {/* Table */}
        <YardsTable yards={filteredYards} onEdit={handleEdit} onDelete={handleDelete} />

        {/* Dialogs */}
        <YardFormDialog
          open={formDialogOpen}
          onClose={() => {
            setFormDialogOpen(false)
            setSelectedYard(null)
          }}
          onSubmit={handleFormSubmit}
          yard={selectedYard}
          isLoading={isLoading}
        />

        <DeleteYardDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedYard(null)
          }}
          onConfirm={handleDeleteConfirm}
          yard={selectedYard}
          isLoading={isLoading}
        />
      </Main>
    </>
  )
}
