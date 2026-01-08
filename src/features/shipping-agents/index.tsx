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
import { MdAdd, MdLocalShipping, MdBusiness, MdSearch } from 'react-icons/md'
import { toast } from 'sonner'

import { type ShippingAgent, type ShippingAgentFormData, SHIPPING_AGENT_STATUSES } from './types'
import { mockShippingAgents } from './data/shipping-agents'
import { ShippingAgentsTable } from './components/shipping-agents-table'
import { ShippingAgentFormDialog } from './components/dialogs/shipping-agent-form-dialog'
import { DeleteShippingAgentDialog } from './components/dialogs/delete-shipping-agent-dialog'

export default function ShippingAgentsPage() {
  const [agents, setAgents] = useState<ShippingAgent[]>(mockShippingAgents)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<ShippingAgent | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [agents, searchQuery, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const active = agents.filter((a) => a.status === 'active')

    return {
      total: agents.length,
      active: active.length,
      inactive: agents.length - active.length,
    }
  }, [agents])

  // Handlers
  const handleAdd = () => {
    setSelectedAgent(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (agent: ShippingAgent) => {
    setSelectedAgent(agent)
    setFormDialogOpen(true)
  }

  const handleDelete = (agent: ShippingAgent) => {
    setSelectedAgent(agent)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: ShippingAgentFormData) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (selectedAgent) {
      // Update existing agent
      setAgents((prev) =>
        prev.map((a) =>
          a.id === selectedAgent.id
            ? {
                ...a,
                ...data,
                updatedAt: new Date(),
              }
            : a
        )
      )
      toast.success(`Agent "${data.name}" updated successfully`)
    } else {
      // Add new agent
      const newAgent: ShippingAgent = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setAgents((prev) => [...prev, newAgent])
      toast.success(`Agent "${data.name}" added successfully`)
    }

    setIsLoading(false)
    setFormDialogOpen(false)
    setSelectedAgent(null)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedAgent) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setAgents((prev) => prev.filter((a) => a.id !== selectedAgent.id))
    toast.success(`Agent "${selectedAgent.name}" deleted successfully`)

    setIsLoading(false)
    setDeleteDialogOpen(false)
    setSelectedAgent(null)
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-2'>
          <MdLocalShipping className='h-5 w-5' />
          <span className='font-semibold'>Shipping Agents</span>
        </div>
        <HeaderActions />
      </Header>

      <Main>
        {/* Stats Cards */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          <div className='rounded-lg border bg-card p-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
              <MdBusiness className='h-4 w-4' />
              Total Agents
            </div>
            <p className='text-2xl font-bold'>{stats.total}</p>
            <p className='text-xs text-muted-foreground'>
              {stats.active} active, {stats.inactive} inactive
            </p>
          </div>

          <div className='rounded-lg border bg-card p-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
              <MdLocalShipping className='h-4 w-4 text-emerald-500' />
              Active Agents
            </div>
            <p className='text-2xl font-bold text-emerald-600'>{stats.active}</p>
            <p className='text-xs text-muted-foreground'>available for booking</p>
          </div>

          <div className='rounded-lg border bg-card p-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
              <MdLocalShipping className='h-4 w-4 text-muted-foreground' />
              Inactive Agents
            </div>
            <p className='text-2xl font-bold text-muted-foreground'>{stats.inactive}</p>
            <p className='text-xs text-muted-foreground'>not accepting bookings</p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className='flex items-center justify-between gap-4 mb-4'>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <MdSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search agents...'
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
                {SHIPPING_AGENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAdd}>
            <MdAdd className='h-4 w-4 mr-2' />
            Add Agent
          </Button>
        </div>

        {/* Table */}
        <ShippingAgentsTable agents={filteredAgents} onEdit={handleEdit} onDelete={handleDelete} />

        {/* Dialogs */}
        <ShippingAgentFormDialog
          open={formDialogOpen}
          onClose={() => {
            setFormDialogOpen(false)
            setSelectedAgent(null)
          }}
          onSubmit={handleFormSubmit}
          agent={selectedAgent}
          isLoading={isLoading}
        />

        <DeleteShippingAgentDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedAgent(null)
          }}
          onConfirm={handleDeleteConfirm}
          agent={selectedAgent}
          isLoading={isLoading}
        />
      </Main>
    </>
  )
}
