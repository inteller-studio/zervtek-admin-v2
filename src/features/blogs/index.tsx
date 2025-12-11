'use client'

import { useState, useRef } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/features/dashboard/components/stats-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Eye,
  ThumbsUp,
  Clock,
  Search as SearchIcon,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Grid3X3,
  List,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Save,
  Image as ImageIcon,
  X,
  ExternalLink,
  Archive,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

// Types
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string | null
  author: string
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  views: number
  likes: number
  comments: number
  publishedAt: Date | null
  scheduledFor: Date | null
  createdAt: Date
  updatedAt: Date
}

// Mock data
const categories = [
  'Vehicle Reviews',
  'Auction Tips',
  'Market Analysis',
  'Industry News',
  'Technology',
  'Classic Cars',
  'Electric Vehicles',
  'Maintenance',
  'Finance & Insurance',
  'Buying Guide',
  'Import/Export',
]

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Classic Cars Worth Investing In',
    slug: 'top-10-classic-cars-worth-investing',
    excerpt:
      'Discover the most valuable classic cars that are appreciating in value and why they make excellent investment opportunities for collectors.',
    content: '<p>Classic cars have always been...</p>',
    featuredImage:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop',
    author: 'John Doe',
    category: 'Classic Cars',
    tags: ['classic cars', 'investment', 'vintage'],
    status: 'published',
    views: 1234,
    likes: 89,
    comments: 23,
    publishedAt: new Date('2024-01-15'),
    scheduledFor: null,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Electric Vehicle Maintenance Guide',
    slug: 'electric-vehicle-maintenance-guide',
    excerpt:
      'Everything you need to know about maintaining your electric vehicle to ensure optimal performance and longevity.',
    content: '<p>Electric vehicles require different...</p>',
    featuredImage:
      'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=250&fit=crop',
    author: 'Jane Smith',
    category: 'Electric Vehicles',
    tags: ['electric', 'maintenance', 'EV'],
    status: 'published',
    views: 892,
    likes: 67,
    comments: 15,
    publishedAt: new Date('2024-01-20'),
    scheduledFor: null,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    title: 'Auction Bidding Strategies',
    slug: 'auction-bidding-strategies',
    excerpt:
      'Master the art of bidding at vehicle auctions with these proven strategies that will help you secure the best deals.',
    content: '<p>Bidding at auctions can be...</p>',
    featuredImage:
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=250&fit=crop',
    author: 'Mike Johnson',
    category: 'Auction Tips',
    tags: ['auctions', 'bidding', 'strategy'],
    status: 'draft',
    views: 0,
    likes: 0,
    comments: 0,
    publishedAt: null,
    scheduledFor: null,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '4',
    title: 'Luxury Car Market Trends 2024',
    slug: 'luxury-car-market-trends-2024',
    excerpt:
      'Analyzing the current luxury car market trends and what to expect in the upcoming year for high-end vehicle investments.',
    content: '<p>The luxury car market...</p>',
    featuredImage:
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=250&fit=crop',
    author: 'Sarah Wilson',
    category: 'Market Analysis',
    tags: ['luxury cars', 'market trends', '2024'],
    status: 'published',
    views: 567,
    likes: 45,
    comments: 8,
    publishedAt: new Date('2024-01-25'),
    scheduledFor: null,
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '5',
    title: 'Vintage Motorcycle Restoration Tips',
    slug: 'vintage-motorcycle-restoration-tips',
    excerpt:
      'Complete guide to restoring vintage motorcycles including tools, techniques, and common pitfalls to avoid.',
    content: '<p>Restoring a vintage motorcycle...</p>',
    featuredImage:
      'https://images.unsplash.com/photo-1558618047-3d6c4c8d8d0c?w=400&h=250&fit=crop',
    author: 'Tom Garcia',
    category: 'Maintenance',
    tags: ['motorcycles', 'restoration', 'vintage'],
    status: 'published',
    views: 423,
    likes: 34,
    comments: 12,
    publishedAt: new Date('2024-01-28'),
    scheduledFor: null,
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-28'),
  },
  {
    id: '6',
    title: 'Understanding Vehicle Insurance for Collectors',
    slug: 'understanding-vehicle-insurance-for-collectors',
    excerpt:
      'Navigate the complex world of collector vehicle insurance and protect your investment with the right coverage.',
    content: '<p>Insurance for collector vehicles...</p>',
    featuredImage:
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop',
    author: 'Lisa Chen',
    category: 'Finance & Insurance',
    tags: ['insurance', 'collectors', 'protection'],
    status: 'draft',
    views: 0,
    likes: 0,
    comments: 0,
    publishedAt: null,
    scheduledFor: null,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30'),
  },
  {
    id: '7',
    title: 'JDM Imports: Complete Buyer Guide',
    slug: 'jdm-imports-complete-buyer-guide',
    excerpt:
      'Everything you need to know about importing Japanese Domestic Market vehicles including regulations, costs, and tips.',
    content: '<p>JDM vehicles have become...</p>',
    featuredImage:
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=250&fit=crop',
    author: 'David Lee',
    category: 'Import/Export',
    tags: ['JDM', 'import', 'guide'],
    status: 'scheduled',
    views: 0,
    likes: 0,
    comments: 0,
    publishedAt: null,
    scheduledFor: new Date('2024-02-15'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '8',
    title: 'How to Spot a Lemon at Auctions',
    slug: 'how-to-spot-a-lemon-at-auctions',
    excerpt:
      'Learn the warning signs of problematic vehicles and how to avoid buying a lemon at car auctions.',
    content: '<p>Buying at auctions can be risky...</p>',
    featuredImage:
      'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=250&fit=crop',
    author: 'Robert Taylor',
    category: 'Buying Guide',
    tags: ['buying guide', 'auctions', 'tips'],
    status: 'archived',
    views: 2345,
    likes: 156,
    comments: 45,
    publishedAt: new Date('2023-06-15'),
    scheduledFor: null,
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-12-01'),
  },
]

const emptyPost: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImage: null,
  author: 'Admin User',
  category: '',
  tags: [],
  status: 'draft',
  views: 0,
  likes: 0,
  comments: 0,
  publishedAt: null,
  scheduledFor: null,
}

export function Blogs() {
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogPosts)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [editorDialogOpen, setEditorDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [newPost, setNewPost] = useState(emptyPost)
  const [tagInput, setTagInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Stats
  const totalPosts = posts.length
  const publishedPosts = posts.filter((p) => p.status === 'published').length
  const draftPosts = posts.filter((p) => p.status === 'draft').length
  const totalViews = posts.reduce((acc, p) => acc + p.views, 0)

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'all' || post.status === activeTab
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter
    return matchesSearch && matchesTab && matchesCategory
  })

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (status: BlogPost['status']) => {
    const config = {
      draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-700' },
      published: { label: 'Published', className: 'bg-green-100 text-green-700' },
      scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
      archived: { label: 'Archived', className: 'bg-gray-100 text-gray-700' },
    }
    return <Badge className={config[status].className}>{config[status].label}</Badge>
  }

  const handleViewPost = (post: BlogPost) => {
    setSelectedPost(post)
    setViewDialogOpen(true)
  }

  const handleEditPost = (post: BlogPost) => {
    setNewPost({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      author: post.author,
      category: post.category,
      tags: post.tags,
      status: post.status,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
      publishedAt: post.publishedAt,
      scheduledFor: post.scheduledFor,
    })
    setSelectedPost(post)
    setEditorDialogOpen(true)
  }

  const handleNewPost = () => {
    setNewPost(emptyPost)
    setSelectedPost(null)
    setEditorDialogOpen(true)
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId))
    toast.success('Post deleted successfully')
  }

  const handleArchivePost = (post: BlogPost) => {
    setPosts(posts.map((p) => (p.id === post.id ? { ...p, status: 'archived' as const } : p)))
    toast.success('Post archived successfully')
  }

  const handlePublishPost = (post: BlogPost) => {
    setPosts(
      posts.map((p) =>
        p.id === post.id ? { ...p, status: 'published' as const, publishedAt: new Date() } : p
      )
    )
    toast.success('Post published successfully')
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!newPost.tags.includes(tagInput.trim())) {
        setNewPost({ ...newPost, tags: [...newPost.tags, tagInput.trim()] })
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setNewPost({ ...newPost, tags: newPost.tags.filter((t) => t !== tag) })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setNewPost({ ...newPost, featuredImage: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setNewPost({ ...newPost, featuredImage: null })
  }

  const handleSavePost = (status: 'draft' | 'published' = 'draft') => {
    if (!newPost.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!newPost.category) {
      toast.error('Please select a category')
      return
    }

    const now = new Date()
    if (selectedPost) {
      // Update existing post
      setPosts(
        posts.map((p) =>
          p.id === selectedPost.id
            ? {
                ...p,
                ...newPost,
                status,
                publishedAt: status === 'published' ? now : p.publishedAt,
                updatedAt: now,
              }
            : p
        )
      )
      toast.success(status === 'published' ? 'Post updated and published' : 'Post saved as draft')
    } else {
      // Create new post
      const newBlogPost: BlogPost = {
        id: String(Date.now()),
        ...newPost,
        slug: newPost.title.toLowerCase().replace(/\s+/g, '-'),
        status,
        publishedAt: status === 'published' ? now : null,
        createdAt: now,
        updatedAt: now,
      }
      setPosts([newBlogPost, ...posts])
      toast.success(status === 'published' ? 'Post published successfully' : 'Post saved as draft')
    }

    setEditorDialogOpen(false)
    setNewPost(emptyPost)
    setSelectedPost(null)
  }

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
        {/* Page Header */}
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Blog Management</h1>
            <p className='text-muted-foreground'>Create and manage blog posts</p>
          </div>
          <Button onClick={handleNewPost}>
            <Plus className='mr-2 h-4 w-4' />
            New Post
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <StatsCard
            title='Total Posts'
            value={totalPosts}
            change={15}
            description='all blog posts'
          />
          <StatsCard
            title='Published'
            value={publishedPosts}
            change={8}
            description='live posts'
          />
          <StatsCard
            title='Drafts'
            value={draftPosts}
            change={-2}
            description='unpublished'
          />
          <StatsCard
            title='Total Views'
            value={totalViews}
            change={24}
            description='all time'
          />
        </div>

        {/* Filters and View Mode */}
        <div className='flex flex-wrap items-center gap-4'>
          <div className='relative flex-1 min-w-[200px]'>
            <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search posts...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='pl-10'
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Category' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='flex items-center gap-2'>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size='icon'
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size='icon'
              onClick={() => setViewMode('list')}
            >
              <List className='h-4 w-4' />
            </Button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value)
              setCurrentPage(1)
            }}
          >
            <TabsList>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='published'>Published</TabsTrigger>
              <TabsTrigger value='draft'>Drafts</TabsTrigger>
              <TabsTrigger value='scheduled'>Scheduled</TabsTrigger>
              <TabsTrigger value='archived'>Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Blog Posts Grid/List */}
        {viewMode === 'grid' ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {paginatedPosts.map((post) => (
              <Card
                key={post.id}
                className='group overflow-hidden transition-all duration-300 hover:shadow-lg'
              >
                {post.featuredImage && (
                  <div className='relative h-48 w-full overflow-hidden'>
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                    <div className='absolute right-3 top-3'>{getStatusBadge(post.status)}</div>
                  </div>
                )}
                <CardContent className='p-4'>
                  <div className='space-y-3'>
                    <div>
                      <h3 className='group-hover:text-primary line-clamp-2 text-lg font-semibold transition-colors'>
                        {post.title}
                      </h3>
                      <p className='text-muted-foreground mt-2 line-clamp-3 text-sm'>
                        {post.excerpt}
                      </p>
                    </div>
                    <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                      <span className='flex items-center gap-1'>
                        <FileText className='h-3 w-3' />
                        {post.category}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Eye className='h-3 w-3' />
                        {post.views}
                      </span>
                      <span className='flex items-center gap-1'>
                        <MessageSquare className='h-3 w-3' />
                        {post.comments}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex flex-wrap gap-1'>
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant='outline' className='text-xs'>
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 2 && (
                          <Badge variant='outline' className='text-xs'>
                            +{post.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          onClick={() => handleViewPost(post)}
                        >
                          <Eye className='h-3 w-3' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          onClick={() => handleEditPost(post)}
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className='text-destructive h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                    <div className='text-muted-foreground flex items-center justify-between border-t pt-3 text-xs'>
                      <span>By {post.author}</span>
                      <span>
                        {post.publishedAt
                          ? format(post.publishedAt, 'MMM dd, yyyy')
                          : post.scheduledFor
                            ? `Scheduled: ${format(post.scheduledFor, 'MMM dd, yyyy')}`
                            : 'Not published'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className='space-y-4'>
            {paginatedPosts.map((post) => (
              <Card key={post.id} className='transition-shadow hover:shadow-lg'>
                <CardContent className='p-6'>
                  <div className='flex items-start gap-4'>
                    {post.featuredImage && (
                      <div className='relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg'>
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className='h-full w-full object-cover'
                        />
                      </div>
                    )}
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center gap-2'>
                        <h3 className='text-lg font-semibold'>{post.title}</h3>
                        {getStatusBadge(post.status)}
                      </div>
                      <p className='text-muted-foreground text-sm'>{post.excerpt}</p>
                      <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                        <span className='flex items-center gap-1'>
                          <FileText className='h-3 w-3' />
                          {post.category}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Calendar className='h-3 w-3' />
                          {post.publishedAt
                            ? format(post.publishedAt, 'MMM dd, yyyy')
                            : 'Not published'}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Eye className='h-3 w-3' />
                          {post.views} views
                        </span>
                        <span className='flex items-center gap-1'>
                          <MessageSquare className='h-3 w-3' />
                          {post.comments} comments
                        </span>
                      </div>
                      <div className='flex gap-1'>
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant='outline' className='text-xs'>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button variant='ghost' size='sm' onClick={() => handleViewPost(post)}>
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='sm' onClick={() => handleEditPost(post)}>
                        <Edit className='h-4 w-4' />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {post.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handlePublishPost(post)}>
                              <CheckCircle className='mr-2 h-4 w-4' />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {post.status !== 'archived' && (
                            <DropdownMenuItem onClick={() => handleArchivePost(post)}>
                              <Archive className='mr-2 h-4 w-4' />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeletePost(post.id)}
                            className='text-destructive'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {paginatedPosts.length === 0 && (
          <Card>
            <CardContent className='py-12 text-center'>
              <FileText className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
              <h3 className='text-lg font-semibold'>No posts found</h3>
              <p className='text-muted-foreground'>Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {filteredPosts.length > itemsPerPage && (
          <div className='flex items-center justify-between'>
            <div className='text-muted-foreground text-sm'>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredPosts.length)} of {filteredPosts.length}{' '}
              posts
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
              <div className='text-sm'>
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </Main>

      {/* View Post Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
          {selectedPost && (
            <>
              <DialogHeader>
                <div className='flex items-center gap-2'>
                  <DialogTitle>{selectedPost.title}</DialogTitle>
                  {getStatusBadge(selectedPost.status)}
                </div>
              </DialogHeader>

              <div className='space-y-6'>
                {selectedPost.featuredImage && (
                  <div className='overflow-hidden rounded-lg'>
                    <img
                      src={selectedPost.featuredImage}
                      alt={selectedPost.title}
                      className='h-[300px] w-full object-cover'
                    />
                  </div>
                )}

                <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                  <span className='flex items-center gap-1'>
                    <User className='h-4 w-4' />
                    {selectedPost.author}
                  </span>
                  <span className='flex items-center gap-1'>
                    <Calendar className='h-4 w-4' />
                    {selectedPost.publishedAt
                      ? format(selectedPost.publishedAt, 'MMMM dd, yyyy')
                      : 'Not published'}
                  </span>
                  <span className='flex items-center gap-1'>
                    <Eye className='h-4 w-4' />
                    {selectedPost.views} views
                  </span>
                  <span className='flex items-center gap-1'>
                    <ThumbsUp className='h-4 w-4' />
                    {selectedPost.likes} likes
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <Badge>{selectedPost.category}</Badge>
                  {selectedPost.tags.map((tag) => (
                    <Badge key={tag} variant='outline'>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Separator />

                <div className='space-y-4'>
                  <p className='text-muted-foreground italic'>{selectedPost.excerpt}</p>
                  <div
                    className='prose prose-sm max-w-none'
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />
                </div>

                <Separator />

                <div className='text-muted-foreground flex items-center justify-between text-sm'>
                  <span>Created: {format(selectedPost.createdAt, 'MMMM dd, yyyy')}</span>
                  <span>Updated: {format(selectedPost.updatedAt, 'MMMM dd, yyyy')}</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant='outline' onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setViewDialogOpen(false)
                    handleEditPost(selectedPost)
                  }}
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit Post
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={editorDialogOpen} onOpenChange={setEditorDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-5xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{selectedPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            <DialogDescription>
              {selectedPost ? 'Update your blog post details' : 'Fill in the details for your new blog post'}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-6 lg:grid-cols-3'>
            {/* Main Content */}
            <div className='space-y-6 lg:col-span-2'>
              <div className='space-y-2'>
                <Label htmlFor='title'>Title *</Label>
                <Input
                  id='title'
                  placeholder='Enter post title...'
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className='text-lg'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='excerpt'>Excerpt</Label>
                <Textarea
                  id='excerpt'
                  placeholder='Brief description of the post...'
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='content'>Content</Label>
                <Textarea
                  id='content'
                  placeholder='Write your blog post content here...'
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={10}
                />
                <p className='text-muted-foreground text-xs'>
                  HTML formatting is supported
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Cover Image */}
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm'>Cover Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {newPost.featuredImage ? (
                    <div className='group relative'>
                      <img
                        src={newPost.featuredImage}
                        alt='Cover'
                        className='h-32 w-full rounded-lg object-cover'
                      />
                      <Button
                        variant='destructive'
                        size='sm'
                        className='absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100'
                        onClick={handleRemoveImage}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className='hover:bg-accent/50 cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors'
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
                      <p className='text-muted-foreground text-sm'>Click to upload</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='hidden'
                  />
                </CardContent>
              </Card>

              {/* Category */}
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm'>Category *</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={newPost.category}
                    onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm'>Tags</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <Input
                    placeholder='Add a tag and press Enter'
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  {newPost.tags.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {newPost.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant='secondary'
                          className='cursor-pointer'
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag}
                          <X className='ml-1 h-3 w-3' />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Author */}
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm'>Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={newPost.author}
                    onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className='mt-6'>
            <Button variant='outline' onClick={() => setEditorDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant='outline' onClick={() => handleSavePost('draft')}>
              <Save className='mr-2 h-4 w-4' />
              Save Draft
            </Button>
            <Button onClick={() => handleSavePost('published')}>
              <CheckCircle className='mr-2 h-4 w-4' />
              {selectedPost?.status === 'published' ? 'Update' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
