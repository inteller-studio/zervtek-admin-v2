'use client'

import { useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import {
  Plus,
  Search as SearchIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  FileQuestion,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  faqs as initialFaqs,
  faqCategories,
  faqCategoryLabels,
  type FAQ,
  type FAQCategory,
} from './data/faqs'

export function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all')

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [deletingFaq, setDeletingFaq] = useState<FAQ | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general' as FAQCategory,
    isPublished: true,
  })

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch =
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [faqs, searchQuery, selectedCategory])

  // Group FAQs by category
  const groupedFaqs = useMemo(() => {
    const groups: Record<FAQCategory, FAQ[]> = {
      general: [],
      bidding: [],
      shipping: [],
      payment: [],
      inspection: [],
      account: [],
    }
    filteredFaqs.forEach((faq) => {
      groups[faq.category].push(faq)
    })
    return groups
  }, [filteredFaqs])

  const handleToggleStatus = (faq: FAQ) => {
    setFaqs((prev) =>
      prev.map((f) =>
        f.id === faq.id
          ? { ...f, status: f.status === 'published' ? 'draft' : 'published', updatedAt: new Date() }
          : f
      )
    )
    toast.success(faq.status === 'published' ? 'FAQ unpublished' : 'FAQ published')
  }

  const handleAdd = () => {
    const newFaq: FAQ = {
      id: crypto.randomUUID(),
      question: formData.question,
      answer: formData.answer,
      category: formData.category,
      status: formData.isPublished ? 'published' : 'draft',
      order: faqs.length,
      views: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setFaqs((prev) => [...prev, newFaq])
    setFormData({ question: '', answer: '', category: 'general', isPublished: true })
    setIsAddDialogOpen(false)
    toast.success('FAQ added successfully')
  }

  const handleEdit = () => {
    if (!editingFaq) return
    setFaqs((prev) =>
      prev.map((f) =>
        f.id === editingFaq.id
          ? {
              ...f,
              question: formData.question,
              answer: formData.answer,
              category: formData.category,
              status: formData.isPublished ? 'published' : 'draft',
              updatedAt: new Date(),
            }
          : f
      )
    )
    setEditingFaq(null)
    setFormData({ question: '', answer: '', category: 'general', isPublished: true })
    toast.success('FAQ updated successfully')
  }

  const handleDelete = () => {
    if (!deletingFaq) return
    setFaqs((prev) => prev.filter((f) => f.id !== deletingFaq.id))
    setDeletingFaq(null)
    toast.success('FAQ deleted')
  }

  const openEditDialog = (faq: FAQ) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isPublished: faq.status === 'published',
    })
    setEditingFaq(faq)
  }

  const handleAddClick = () => {
    setFormData({ question: '', answer: '', category: 'general', isPublished: true })
    setIsAddDialogOpen(true)
  }

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderActions />
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">FAQ</h1>
            <p className="text-muted-foreground">
              Manage frequently asked questions for the customer portal
            </p>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add FAQ
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search FAQs..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={(v) => setSelectedCategory(v as FAQCategory | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {faqCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* FAQ List by Category */}
        <div className="space-y-4">
          {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => {
            if (categoryFaqs.length === 0) return null
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{faqCategoryLabels[category as FAQCategory]}</CardTitle>
                  <CardDescription>
                    {categoryFaqs.length} question{categoryFaqs.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className={cn(
                        'rounded-lg border p-4 transition-colors',
                        faq.status === 'draft' && 'bg-muted/50 opacity-60'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{faq.question}</p>
                            {faq.status === 'draft' && (
                              <Badge variant="outline" className="text-xs">
                                Draft
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {faq.answer}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Updated {formatDistanceToNow(faq.updatedAt, { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={faq.status === 'published'}
                            onCheckedChange={() => handleToggleStatus(faq)}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(faq)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(faq)}>
                                {faq.status === 'published' ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeletingFaq(faq)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}

          {filteredFaqs.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileQuestion className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No FAQs found</p>
                <Button variant="outline" className="mt-4" onClick={handleAddClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first FAQ
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog
          open={isAddDialogOpen || !!editingFaq}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false)
              setEditingFaq(null)
              setFormData({ question: '', answer: '', category: 'general', isPublished: true })
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
              <DialogDescription>
                {editingFaq
                  ? 'Update the FAQ details below'
                  : 'Add a new frequently asked question'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v as FAQCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {faqCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  placeholder="Enter the question..."
                  value={formData.question}
                  onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  placeholder="Enter the answer..."
                  value={formData.answer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
                  rows={5}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublished: checked }))}
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setEditingFaq(null)
                  setFormData({ question: '', answer: '', category: 'general', isPublished: true })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingFaq ? handleEdit : handleAdd}
                disabled={!formData.question.trim() || !formData.answer.trim()}
              >
                {editingFaq ? 'Save Changes' : 'Add FAQ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingFaq} onOpenChange={(open) => !open && setDeletingFaq(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete FAQ</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this FAQ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {deletingFaq && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="font-medium">{deletingFaq.question}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingFaq(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
