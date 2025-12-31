'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MdArrowBack,
  MdSend,
  MdAccessTime,
  MdPerson,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdLocalOffer,
  MdDirectionsCar,
  MdMoreVert,
  MdPersonAdd,
  MdCheckCircle,
  MdCancel,
  MdError,
  MdChat,
  MdAttachFile,
  MdVisibility,
  MdVisibilityOff,
  MdRefresh,
} from 'react-icons/md'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { getTicketById, supportStaff, supportTickets } from '../data/tickets'
import {
  type TicketWithMessages,
  type TicketMessage,
  type TicketStatus,
  type TicketPriority,
  ticketStatuses,
  ticketPriorities,
  ticketCategories,
} from '../data/types'

interface TicketDetailProps {
  ticketId: string
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [ticket, setTicket] = useState<TicketWithMessages | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [showResolveDialog, setShowResolveDialog] = useState(false)

  useEffect(() => {
    const foundTicket = getTicketById(ticketId)
    if (foundTicket) {
      setTicket(foundTicket)
    }
  }, [ticketId])

  useEffect(() => {
    // Scroll to bottom of messages on load
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages])

  if (!ticket) {
    return (
      <>
        <Header fixed>
          <Search />
          <HeaderActions />
        </Header>
        <Main className='flex flex-1 items-center justify-center'>
          <div className='text-center'>
            <MdError className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>Ticket Not Found</h2>
            <p className='text-muted-foreground mb-4'>The ticket you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/support')}>
              <MdArrowBack className='mr-2 h-4 w-4' />
              Back to Tickets
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const getStatusBadge = (status: TicketStatus) => {
    const config = ticketStatuses[status]
    const variants: Record<string, 'blue' | 'amber' | 'purple' | 'emerald' | 'zinc'> = {
      blue: 'blue',
      amber: 'amber',
      purple: 'purple',
      emerald: 'emerald',
      zinc: 'zinc',
    }
    return <Badge variant={variants[config.color] || 'zinc'}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: TicketPriority) => {
    const config = ticketPriorities[priority]
    const variants: Record<string, 'zinc' | 'blue' | 'orange' | 'red'> = {
      zinc: 'zinc',
      blue: 'blue',
      orange: 'orange',
      red: 'red',
    }
    return <Badge variant={variants[config.color] || 'zinc'}>{config.label}</Badge>
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleSendReply = async () => {
    if (!replyContent.trim()) return

    setIsSending(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId: ticket.id,
      content: replyContent,
      senderType: 'staff',
      senderId: 'staff-001',
      senderName: 'Staff Member',
      attachments: [],
      createdAt: new Date(),
      isInternal: isInternalNote,
    }

    setTicket({
      ...ticket,
      messages: [...ticket.messages, newMessage],
      messageCount: ticket.messageCount + 1,
      updatedAt: new Date(),
      lastMessageAt: new Date(),
      lastMessageBy: 'staff',
      status: isInternalNote ? ticket.status : 'awaiting_customer',
    })

    setReplyContent('')
    setIsInternalNote(false)
    setIsSending(false)

    toast.success(isInternalNote ? 'Internal note added' : 'Reply sent to customer')
  }

  const handleStatusChange = (newStatus: TicketStatus) => {
    setTicket({
      ...ticket,
      status: newStatus,
      updatedAt: new Date(),
      resolvedAt: newStatus === 'resolved' ? new Date() : ticket.resolvedAt,
      closedAt: newStatus === 'closed' ? new Date() : ticket.closedAt,
    })
    toast.success(`Ticket status updated to ${ticketStatuses[newStatus].label}`)
  }

  const handlePriorityChange = (newPriority: TicketPriority) => {
    setTicket({
      ...ticket,
      priority: newPriority,
      updatedAt: new Date(),
    })
    toast.success(`Ticket priority updated to ${ticketPriorities[newPriority].label}`)
  }

  const handleAssigneeChange = (staffId: string) => {
    const staff = supportStaff.find(s => s.id === staffId)
    setTicket({
      ...ticket,
      assignedTo: staffId,
      assignedToName: staff?.name,
      assignedAt: new Date(),
      updatedAt: new Date(),
    })
    toast.success(`Ticket assigned to ${staff?.name}`)
  }

  const handleResolveTicket = () => {
    handleStatusChange('resolved')
    setShowResolveDialog(false)
  }

  const handleCloseTicket = () => {
    handleStatusChange('closed')
    setShowCloseDialog(false)
  }

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Breadcrumb & Actions */}
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='sm' onClick={() => router.push('/support')}>
              <MdArrowBack className='mr-2 h-4 w-4' />
              Back
            </Button>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-xl font-bold tracking-tight'>{ticket.ticketNumber}</h1>
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
              </div>
              <p className='text-sm text-muted-foreground mt-1 line-clamp-1'>{ticket.subject}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  <MdMoreVert className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowResolveDialog(true)}>
                  <MdCheckCircle className='mr-2 h-4 w-4' />
                  Mark as Resolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCloseDialog(true)}>
                  <MdCancel className='mr-2 h-4 w-4' />
                  Close Ticket
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange('open')}>
                  <MdRefresh className='mr-2 h-4 w-4' />
                  Reopen Ticket
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Main Content - Messages */}
          <div className='lg:col-span-2 space-y-4'>
            {/* Ticket Description */}
            <Card>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarFallback>{getInitials(ticket.customerName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>{ticket.customerName}</p>
                      <p className='text-xs text-muted-foreground'>
                        {format(ticket.createdAt, 'MMM dd, yyyy \'at\' HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Badge variant='outline'>{ticketCategories[ticket.category].label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className='font-semibold mb-2'>{ticket.subject}</h3>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>{ticket.description}</p>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <MdChat className='h-4 w-4' />
                  Conversation ({ticket.messages.length} messages)
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 max-h-[500px] overflow-y-auto'>
                {ticket.messages.slice(1).map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.senderType === 'staff' && !message.isInternal && 'flex-row-reverse',
                      message.isInternal && 'opacity-75'
                    )}
                  >
                    {message.senderType !== 'system' && (
                      <Avatar className='h-8 w-8 shrink-0'>
                        <AvatarFallback className={cn(
                          'text-xs',
                          message.senderType === 'staff' && 'bg-primary text-primary-foreground'
                        )}>
                          {getInitials(message.senderName)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'flex-1 max-w-[80%]',
                        message.senderType === 'staff' && !message.isInternal && 'text-right',
                        message.senderType === 'system' && 'text-center max-w-full'
                      )}
                    >
                      {message.senderType === 'system' ? (
                        <div className='text-xs text-muted-foreground py-2'>
                          <span className='bg-muted px-3 py-1 rounded-full'>{message.content}</span>
                        </div>
                      ) : (
                        <>
                          <div className='flex items-center gap-2 mb-1'>
                            {message.senderType === 'staff' && !message.isInternal && <div className='flex-1' />}
                            <span className='text-sm font-medium'>{message.senderName}</span>
                            {message.isInternal && (
                              <Badge variant='outline' className='text-xs'>
                                <MdVisibilityOff className='h-3 w-3 mr-1' />
                                Internal
                              </Badge>
                            )}
                            <span className='text-xs text-muted-foreground'>
                              {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'rounded-lg px-4 py-2 text-sm inline-block text-left',
                              message.senderType === 'customer' && 'bg-muted',
                              message.senderType === 'staff' && !message.isInternal && 'bg-primary text-primary-foreground',
                              message.isInternal && 'bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800'
                            )}
                          >
                            <p className='whitespace-pre-wrap'>{message.content}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
            </Card>

            {/* Reply Box */}
            {ticket.status !== 'closed' && (
              <Card>
                <CardContent className='pt-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant={isInternalNote ? 'outline' : 'default'}
                        size='sm'
                        onClick={() => setIsInternalNote(false)}
                      >
                        <MdSend className='mr-2 h-4 w-4' />
                        Reply
                      </Button>
                      <Button
                        variant={isInternalNote ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setIsInternalNote(true)}
                      >
                        <MdVisibilityOff className='mr-2 h-4 w-4' />
                        Internal Note
                      </Button>
                    </div>
                    <Textarea
                      placeholder={isInternalNote ? 'Add an internal note (not visible to customer)...' : 'Type your reply...'}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                      className={cn(isInternalNote && 'border-amber-300 dark:border-amber-700')}
                    />
                    <div className='flex items-center justify-between'>
                      <Button variant='outline' size='sm'>
                        <MdAttachFile className='mr-2 h-4 w-4' />
                        Attach File
                      </Button>
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyContent.trim() || isSending}
                      >
                        {isSending ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <MdSend className='mr-2 h-4 w-4' />
                            {isInternalNote ? 'Add Note' : 'Send Reply'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Ticket Info */}
          <div className='space-y-4'>
            {/* Ticket Details */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Status</span>
                    <Select value={ticket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
                      <SelectTrigger className='w-[140px] h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ticketStatuses).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Priority</span>
                    <Select value={ticket.priority} onValueChange={(v) => handlePriorityChange(v as TicketPriority)}>
                      <SelectTrigger className='w-[140px] h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ticketPriorities).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Assigned To</span>
                    <Select
                      value={ticket.assignedTo || 'unassigned'}
                      onValueChange={(v) => v !== 'unassigned' && handleAssigneeChange(v)}
                    >
                      <SelectTrigger className='w-[140px] h-8'>
                        <SelectValue placeholder='Unassigned' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='unassigned' disabled>Unassigned</SelectItem>
                        {supportStaff.map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className='space-y-2 text-sm'>
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <MdCalendarToday className='h-4 w-4' />
                    <span>Created: {format(ticket.createdAt, 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <MdAccessTime className='h-4 w-4' />
                    <span>Updated: {formatDistanceToNow(ticket.updatedAt, { addSuffix: true })}</span>
                  </div>
                  {ticket.firstResponseAt && (
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <MdChat className='h-4 w-4' />
                      <span>First Response: {format(ticket.firstResponseAt, 'MMM dd, HH:mm')}</span>
                    </div>
                  )}
                </div>

                {ticket.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <span className='text-sm text-muted-foreground'>Tags</span>
                      <div className='flex flex-wrap gap-1 mt-2'>
                        {ticket.tags.map(tag => (
                          <Badge key={tag} variant='secondary' className='text-xs'>{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Customer</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-12 w-12'>
                    <AvatarFallback>{getInitials(ticket.customerName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{ticket.customerName}</p>
                    <Button
                      variant='link'
                      className='h-auto p-0 text-sm text-muted-foreground'
                      onClick={() => router.push(`/customers?search=${ticket.customerEmail}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <MdEmail className='h-4 w-4 text-muted-foreground' />
                    <span>{ticket.customerEmail}</span>
                  </div>
                  {ticket.customerPhone && (
                    <div className='flex items-center gap-2'>
                      <MdPhone className='h-4 w-4 text-muted-foreground' />
                      <span>{ticket.customerPhone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Related Vehicle */}
            {ticket.relatedVehicleName && (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base'>Related Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
                      <MdDirectionsCar className='h-5 w-5 text-muted-foreground' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>{ticket.relatedVehicleName}</p>
                      <Button variant='link' className='h-auto p-0 text-xs text-muted-foreground'>
                        View Vehicle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Main>

      {/* Resolve Dialog */}
      <AlertDialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Resolved</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this ticket as resolved? The customer will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResolveTicket} className='bg-emerald-600 hover:bg-emerald-700'>
              <MdCheckCircle className='mr-2 h-4 w-4' />
              Mark Resolved
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this ticket? This action can be undone by reopening the ticket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseTicket}>
              <MdCancel className='mr-2 h-4 w-4' />
              Close Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
