'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MdAdd,
  MdSearch,
  MdEdit,
  MdDelete,
  MdContentCopy,
  MdMoreHoriz,
  MdDescription,
  MdLocalOffer,
  MdBarChart,
  MdAccessTime,
  MdCode,
} from 'react-icons/md'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMessageTemplates, useCreateTemplate, useDeleteTemplate } from '@/hooks/use-whatsapp'
import type { MessageTemplate } from '../types'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const categoryConfig = {
  marketing: { label: 'Marketing', color: 'bg-purple-100 text-purple-700' },
  utility: { label: 'Utility', color: 'bg-blue-100 text-blue-700' },
  authentication: { label: 'Auth', color: 'bg-orange-100 text-orange-700' },
  service: { label: 'Service', color: 'bg-green-100 text-green-700' },
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', color: 'bg-yellow-100 text-yellow-700' },
}

export function TemplatesPanel() {
  const { data: templates, isLoading } = useMessageTemplates()
  const createTemplate = useCreateTemplate()
  const deleteTemplate = useDeleteTemplate()

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: 'utility' as MessageTemplate['category'],
    content: '',
    status: 'draft' as MessageTemplate['status'],
  })

  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g) || []
    return matches.map((m) => m.replace(/\{\{|\}\}/g, ''))
  }

  const handleOpenDialog = (template?: MessageTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        name: template.name,
        category: template.category,
        content: template.content,
        status: template.status,
      })
    } else {
      setEditingTemplate(null)
      setFormData({
        name: '',
        category: 'utility',
        content: '',
        status: 'draft',
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const variables = extractVariables(formData.content)
      await createTemplate.mutateAsync({
        ...formData,
        variables,
      })
      toast.success(editingTemplate ? 'Template updated' : 'Template created')
      setDialogOpen(false)
    } catch {
      toast.error('Failed to save template')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate.mutateAsync(id)
      toast.success('Template deleted')
    } catch {
      toast.error('Failed to delete template')
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Template copied to clipboard')
  }

  return (
    <div className='flex h-full flex-col'>
      {/* Header - WhatsApp style */}
      <div className='flex h-14 flex-shrink-0 items-center justify-between border-b border-[var(--wa-border)] bg-[#F0F2F5] px-4 dark:bg-[#202C33]'>
        <h2 className='text-lg font-medium text-[#111B21] dark:text-[#E9EDEF]'>
          Message Templates
        </h2>
        <Button
          onClick={() => handleOpenDialog()}
          className='bg-[#00A884] text-white hover:bg-[#00A884]/90'
        >
          <MdAdd className='mr-2 h-4 w-4' />
          New Template
        </Button>
      </div>

      {/* Search & Filters */}
      <div className='flex flex-shrink-0 items-center gap-3 border-b border-[var(--wa-border)] bg-white px-4 py-3 dark:bg-[#111B21]'>
        <div className='relative flex-1 max-w-md'>
          <MdSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#54656F] dark:text-[#AEBAC1]' />
          <Input
            placeholder='Search templates...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='h-9 rounded-lg border-0 bg-[#F0F2F5] pl-10 text-sm dark:bg-[#202C33] dark:text-[#E9EDEF]'
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className='h-9 w-[150px] border-0 bg-[#F0F2F5] dark:bg-[#202C33]'>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            <SelectItem value='marketing'>Marketing</SelectItem>
            <SelectItem value='utility'>Utility</SelectItem>
            <SelectItem value='authentication'>Authentication</SelectItem>
            <SelectItem value='service'>Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-auto bg-white p-4 dark:bg-[#111B21]'>
        {/* Templates Table */}
        <Card className='border-[var(--wa-border)]'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Variables</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <div className='h-12 animate-pulse rounded bg-muted' />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredTemplates?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='py-10 text-center'>
                  <MdDescription className='mx-auto mb-2 h-10 w-10 text-muted-foreground' />
                  <p className='text-muted-foreground'>No templates found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates?.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className='space-y-1'>
                      <p className='font-medium'>{template.name}</p>
                      <p className='line-clamp-1 text-xs text-muted-foreground'>
                        {template.content.slice(0, 60)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(categoryConfig[template.category].color)}>
                      {categoryConfig[template.category].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {template.variables.slice(0, 3).map((v) => (
                        <Badge key={v} variant='outline' className='text-xs'>
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant='outline' className='text-xs'>
                          +{template.variables.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <MdBarChart className='h-4 w-4 text-muted-foreground' />
                      <span>{template.usageCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(statusConfig[template.status].color)}>
                      {statusConfig[template.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {format(template.updatedAt, 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MdMoreHoriz className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleOpenDialog(template)}>
                          <MdEdit className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopy(template.content)}>
                          <MdContentCopy className='mr-2 h-4 w-4' />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(template.id)}
                          className='text-destructive'
                        >
                          <MdDelete className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              Create reusable message templates with dynamic variables
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Template Name *</Label>
                <Input
                  id='name'
                  placeholder='e.g., Welcome Message'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      category: value as MessageTemplate['category'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='marketing'>Marketing</SelectItem>
                    <SelectItem value='utility'>Utility</SelectItem>
                    <SelectItem value='authentication'>Authentication</SelectItem>
                    <SelectItem value='service'>Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='content'>Message Content *</Label>
              <Textarea
                id='content'
                placeholder='Hi {{name}}, your order {{orderId}} has been shipped!'
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={5}
              />
              <p className='text-xs text-muted-foreground'>
                Use {`{{variable}}`} syntax for dynamic content
              </p>
            </div>

            {formData.content && extractVariables(formData.content).length > 0 && (
              <div className='space-y-2'>
                <Label>Detected Variables</Label>
                <div className='flex flex-wrap gap-2'>
                  {extractVariables(formData.content).map((v) => (
                    <Badge key={v} variant='secondary' className='gap-1'>
                      <MdCode className='h-3 w-3' />
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as MessageTemplate['status'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='draft'>Draft</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='archived'>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={createTemplate.isPending}>
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
