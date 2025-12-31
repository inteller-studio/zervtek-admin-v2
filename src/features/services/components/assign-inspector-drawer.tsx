'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  MdCheck,
  MdFactCheck,
  MdEmail,
  MdPhone,
  MdSearch,
  MdPerson,
  MdClose,
  MdSync,
} from 'react-icons/md'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { users, type User as StaffUser } from '@/features/users/data/users'
import { type ServiceRequest } from '@/features/requests/data/requests'

interface AssignInspectorDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: ServiceRequest | null
  onAssign: (staffId: string, staffName: string) => void
}

// Filter to only active staff (not customers)
const activeStaff = users.filter((u) => u.status === 'active')

const getRoleBadge = (role: StaffUser['role']) => {
  const styles = {
    superadmin: 'bg-purple-500/15 text-purple-500 border-purple-500/20',
    admin: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
    manager: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
    cashier: 'bg-slate-500/15 text-slate-500 border-slate-500/20',
  }
  return styles[role]
}

export function AssignInspectorDrawer({
  open,
  onOpenChange,
  request,
  onAssign,
}: AssignInspectorDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<(typeof users)[0] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<typeof users>([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setIsSearching(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const query = searchQuery.toLowerCase()
    const results = activeStaff.filter(
      (s) =>
        s.firstName.toLowerCase().includes(query) ||
        s.lastName.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.username.toLowerCase().includes(query)
    )

    setIsSearching(false)

    if (results.length === 0) {
      toast.error('No staff members found')
      setSearchResults([])
      return
    }

    setSearchResults(results.slice(0, 5))
  }

  const handleSelectStaff = (staff: (typeof users)[0]) => {
    setSelectedStaff(staff)
    setSearchResults([])
    setSearchQuery('')
  }

  const handleAssign = async () => {
    if (!selectedStaff || !request) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const staffName = `${selectedStaff.firstName} ${selectedStaff.lastName}`
    onAssign(selectedStaff.id, staffName)

    toast.success(`Inspection assigned to ${staffName}`)

    setIsSubmitting(false)
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setSearchQuery('')
    setSelectedStaff(null)
    setSearchResults([])
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  if (!request) return null

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className='flex flex-col gap-0 p-0 sm:max-w-lg'>
        {/* Header */}
        <div className='border-b bg-muted/30'>
          <SheetHeader className='p-4 pb-0'>
            <SheetTitle className='flex items-center gap-2'>
              <MdFactCheck className='h-5 w-5' />
              Assign Inspector
            </SheetTitle>
            <SheetDescription>
              Assign a staff member to handle this inspection request
            </SheetDescription>
          </SheetHeader>

          {/* Request Preview Card */}
          <div className='p-4'>
            <div className='flex gap-3 rounded-lg border bg-background p-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-muted'>
                <MdFactCheck className='h-6 w-6 text-muted-foreground' />
              </div>
              <div className='flex-1'>
                <p className='font-semibold'>{request.title}</p>
                <p className='text-sm text-muted-foreground'>
                  {request.requestId} • {request.customerName}
                </p>
                <Badge variant='outline' className='mt-1 text-xs capitalize'>
                  {request.priority} priority
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-4'>
            {/* Search Section */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Find Staff Member</Label>
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <MdSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search by name or email...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className='pl-9'
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <MdSync className='h-4 w-4 animate-spin' />
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className='space-y-2'>
                <Label className='text-xs text-muted-foreground'>
                  {searchResults.length} staff member{searchResults.length > 1 ? 's' : ''} found
                </Label>
                <div className='space-y-2'>
                  {searchResults.map((staff) => (
                    <Card
                      key={staff.id}
                      className='cursor-pointer transition-all hover:border-primary hover:shadow-sm'
                      onClick={() => handleSelectStaff(staff)}
                    >
                      <CardContent className='p-3'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                            <MdPerson className='h-5 w-5 text-muted-foreground' />
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <p className='font-medium'>
                                {staff.firstName} {staff.lastName}
                              </p>
                              <Badge className={`text-xs capitalize ${getRoleBadge(staff.role)}`}>
                                {staff.role}
                              </Badge>
                            </div>
                            <p className='text-sm text-muted-foreground'>
                              {staff.email}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Staff */}
            {selectedStaff && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>Selected Staff</Label>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-auto p-1 text-xs text-muted-foreground hover:text-foreground'
                    onClick={() => setSelectedStaff(null)}
                  >
                    <MdClose className='mr-1 h-3 w-3' />
                    Change
                  </Button>
                </div>
                <Card className='border-primary bg-primary/5'>
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                        <MdPerson className='h-6 w-6 text-primary' />
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <p className='font-semibold'>
                            {selectedStaff.firstName} {selectedStaff.lastName}
                          </p>
                          <Badge className={`text-xs capitalize ${getRoleBadge(selectedStaff.role)}`}>
                            {selectedStaff.role}
                          </Badge>
                        </div>
                        <div className='mt-1 space-y-1 text-sm text-muted-foreground'>
                          <div className='flex items-center gap-2'>
                            <MdEmail className='h-3 w-3' />
                            {selectedStaff.email}
                          </div>
                          <div className='flex items-center gap-2'>
                            <MdPhone className='h-3 w-3' />
                            {selectedStaff.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empty State */}
            {!selectedStaff && searchResults.length === 0 && (
              <div className='flex flex-col items-center justify-center py-8 text-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                  <MdSearch className='h-8 w-8 text-muted-foreground' />
                </div>
                <p className='mt-4 font-medium'>Search for a staff member</p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Enter a name or email to find the inspector
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className='flex-row gap-2 border-t bg-muted/30 p-4'>
          <Button
            variant='outline'
            className='flex-1'
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className='flex-1'
            onClick={handleAssign}
            disabled={!selectedStaff || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <MdSync className='mr-2 h-4 w-4 animate-spin' />
                Assigning...
              </>
            ) : (
              <>
                <MdCheck className='mr-2 h-4 w-4' />
                Assign
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
