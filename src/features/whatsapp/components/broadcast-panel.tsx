'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Send,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Radio,
  Eye,
  Trash2,
  Calendar,
  MessageSquare,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useBroadcastLists,
  useBroadcasts,
  useMessageTemplates,
  useSendBroadcast,
} from '@/hooks/use-whatsapp'
import type { BroadcastMessage } from '../types'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: MessageSquare },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Clock },
  sending: { label: 'Sending', color: 'bg-yellow-100 text-yellow-700', icon: Loader2 },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

export function BroadcastPanel() {
  const { data: broadcasts, isLoading: broadcastsLoading } = useBroadcasts()
  const { data: broadcastLists } = useBroadcastLists()
  const { data: templates } = useMessageTemplates()
  const sendBroadcast = useSendBroadcast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    listId: '',
    templateId: '',
    content: '',
    scheduledAt: '',
  })

  const selectedList = broadcastLists?.find((l) => l.id === formData.listId)
  const selectedTemplate = templates?.find((t) => t.id === formData.templateId)

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find((t) => t.id === templateId)
    setFormData({
      ...formData,
      templateId,
      content: template?.content || '',
    })
  }

  const handleSend = async (scheduled = false) => {
    if (!formData.listId || !formData.content.trim()) {
      toast.error('Please select a list and enter message content')
      return
    }

    try {
      await sendBroadcast.mutateAsync({
        listId: formData.listId,
        listName: selectedList?.name || '',
        template: selectedTemplate,
        content: formData.content,
        totalRecipients: selectedList?.contacts.length || 0,
        scheduledAt: scheduled && formData.scheduledAt ? new Date(formData.scheduledAt) : undefined,
      })
      toast.success(scheduled ? 'Broadcast scheduled' : 'Broadcast sent')
      setDialogOpen(false)
      setFormData({ listId: '', templateId: '', content: '', scheduledAt: '' })
    } catch {
      toast.error('Failed to send broadcast')
    }
  }

  const getDeliveryRate = (broadcast: BroadcastMessage) => {
    if (broadcast.totalRecipients === 0) return 0
    return Math.round((broadcast.delivered / broadcast.totalRecipients) * 100)
  }

  const getReadRate = (broadcast: BroadcastMessage) => {
    if (broadcast.delivered === 0) return 0
    return Math.round((broadcast.read / broadcast.delivered) * 100)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h3 className='text-lg font-semibold'>Broadcast Messages</h3>
          <p className='text-sm text-muted-foreground'>
            Send bulk messages to your contact lists
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Radio className='mr-2 h-4 w-4' />
          New Broadcast
        </Button>
      </div>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='rounded-full bg-blue-100 p-3 dark:bg-blue-950'>
                <Radio className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{broadcasts?.length || 0}</p>
                <p className='text-xs text-muted-foreground'>Total Broadcasts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='rounded-full bg-green-100 p-3 dark:bg-green-950'>
                <CheckCircle className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-2xl font-bold'>
                  {broadcasts?.filter((b) => b.status === 'completed').length || 0}
                </p>
                <p className='text-xs text-muted-foreground'>Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='rounded-full bg-yellow-100 p-3 dark:bg-yellow-950'>
                <Clock className='h-5 w-5 text-yellow-600' />
              </div>
              <div>
                <p className='text-2xl font-bold'>
                  {broadcasts?.filter((b) => b.status === 'scheduled').length || 0}
                </p>
                <p className='text-xs text-muted-foreground'>Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='rounded-full bg-purple-100 p-3 dark:bg-purple-950'>
                <Users className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{broadcastLists?.length || 0}</p>
                <p className='text-xs text-muted-foreground'>Contact Lists</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broadcasts List */}
      <Tabs defaultValue='all'>
        <TabsList>
          <TabsTrigger value='all'>All</TabsTrigger>
          <TabsTrigger value='completed'>Completed</TabsTrigger>
          <TabsTrigger value='scheduled'>Scheduled</TabsTrigger>
          <TabsTrigger value='sending'>In Progress</TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='mt-4'>
          <div className='space-y-4'>
            {broadcastsLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className='py-6'>
                    <div className='h-20 animate-pulse rounded bg-muted' />
                  </CardContent>
                </Card>
              ))
            ) : broadcasts?.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-10'>
                  <Radio className='mb-2 h-10 w-10 text-muted-foreground' />
                  <p className='text-muted-foreground'>No broadcasts yet</p>
                  <Button
                    variant='outline'
                    className='mt-4'
                    onClick={() => setDialogOpen(true)}
                  >
                    Create your first broadcast
                  </Button>
                </CardContent>
              </Card>
            ) : (
              broadcasts?.map((broadcast) => {
                const StatusIcon = statusConfig[broadcast.status].icon
                return (
                  <motion.div
                    key={broadcast.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className='py-4'>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex-1 space-y-3'>
                            <div className='flex items-center gap-3'>
                              <Badge
                                className={cn(
                                  'gap-1',
                                  statusConfig[broadcast.status].color
                                )}
                              >
                                <StatusIcon
                                  className={cn(
                                    'h-3 w-3',
                                    broadcast.status === 'sending' && 'animate-spin'
                                  )}
                                />
                                {statusConfig[broadcast.status].label}
                              </Badge>
                              <span className='text-sm text-muted-foreground'>
                                {broadcast.listName}
                              </span>
                              <span className='text-sm text-muted-foreground'>
                                • {broadcast.totalRecipients} recipients
                              </span>
                            </div>

                            <p className='line-clamp-2 text-sm'>
                              {broadcast.content}
                            </p>

                            {broadcast.status === 'completed' && (
                              <div className='flex items-center gap-6'>
                                <div className='space-y-1'>
                                  <div className='flex items-center justify-between text-xs'>
                                    <span className='text-muted-foreground'>
                                      Delivered
                                    </span>
                                    <span className='font-medium'>
                                      {getDeliveryRate(broadcast)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={getDeliveryRate(broadcast)}
                                    className='h-1.5 w-32'
                                  />
                                </div>
                                <div className='space-y-1'>
                                  <div className='flex items-center justify-between text-xs'>
                                    <span className='text-muted-foreground'>
                                      Read
                                    </span>
                                    <span className='font-medium'>
                                      {getReadRate(broadcast)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={getReadRate(broadcast)}
                                    className='h-1.5 w-32'
                                  />
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  <span className='text-green-600'>
                                    {broadcast.delivered} delivered
                                  </span>
                                  {' • '}
                                  <span className='text-blue-600'>
                                    {broadcast.read} read
                                  </span>
                                  {broadcast.failed > 0 && (
                                    <>
                                      {' • '}
                                      <span className='text-red-600'>
                                        {broadcast.failed} failed
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}

                            {broadcast.status === 'scheduled' &&
                              broadcast.scheduledAt && (
                                <p className='flex items-center gap-1 text-sm text-muted-foreground'>
                                  <Calendar className='h-4 w-4' />
                                  Scheduled for{' '}
                                  {format(broadcast.scheduledAt, 'PPp')}
                                </p>
                              )}

                            {broadcast.sentAt && (
                              <p className='text-xs text-muted-foreground'>
                                Sent {format(broadcast.sentAt, 'PPp')}
                              </p>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem>
                                <Eye className='mr-2 h-4 w-4' />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className='mr-2 h-4 w-4' />
                                Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem className='text-destructive'>
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value='completed' className='mt-4'>
          <div className='space-y-4'>
            {broadcasts
              ?.filter((b) => b.status === 'completed')
              .map((broadcast) => (
                <Card key={broadcast.id}>
                  <CardContent className='py-4'>
                    <p className='text-sm'>{broadcast.content}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value='scheduled' className='mt-4'>
          <div className='space-y-4'>
            {broadcasts
              ?.filter((b) => b.status === 'scheduled')
              .map((broadcast) => (
                <Card key={broadcast.id}>
                  <CardContent className='py-4'>
                    <p className='text-sm'>{broadcast.content}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value='sending' className='mt-4'>
          <div className='space-y-4'>
            {broadcasts
              ?.filter((b) => b.status === 'sending')
              .map((broadcast) => (
                <Card key={broadcast.id}>
                  <CardContent className='py-4'>
                    <p className='text-sm'>{broadcast.content}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Broadcast Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Create Broadcast</DialogTitle>
            <DialogDescription>
              Send a message to multiple contacts at once
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>Select Contact List *</Label>
              <Select
                value={formData.listId}
                onValueChange={(value) =>
                  setFormData({ ...formData, listId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choose a list' />
                </SelectTrigger>
                <SelectContent>
                  {broadcastLists?.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name} ({list.contacts.length} contacts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Use Template (Optional)</Label>
              <Select
                value={formData.templateId}
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a template' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>No template</SelectItem>
                  {templates
                    ?.filter((t) => t.status === 'active')
                    .map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Message Content *</Label>
              <Textarea
                placeholder='Enter your message...'
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={5}
              />
              <p className='text-xs text-muted-foreground'>
                {formData.content.length} characters
              </p>
            </div>

            <div className='space-y-2'>
              <Label>Schedule (Optional)</Label>
              <Input
                type='datetime-local'
                value={formData.scheduledAt}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledAt: e.target.value })
                }
              />
            </div>

            {selectedList && (
              <div className='rounded-lg bg-muted p-3'>
                <p className='text-sm'>
                  <strong>Recipients:</strong> {selectedList.contacts.length}{' '}
                  contacts
                </p>
                <p className='text-xs text-muted-foreground'>
                  {selectedList.description}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {formData.scheduledAt ? (
              <Button onClick={() => handleSend(true)}>
                <Clock className='mr-2 h-4 w-4' />
                Schedule
              </Button>
            ) : (
              <Button
                onClick={() => handleSend(false)}
                disabled={sendBroadcast.isPending}
              >
                <Send className='mr-2 h-4 w-4' />
                Send Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
