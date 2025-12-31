import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MdMoreHoriz, MdVisibility, MdEdit, MdDelete, MdOpenInNew, MdContentCopy } from 'react-icons/md'
import { type Blog } from '../data/blogs'
import { format } from 'date-fns'

interface BlogsTableProps {
  data: Blog[]
}

const getStatusBadge = (status: Blog['status']) => {
  const variants: Record<Blog['status'], string> = {
    draft: 'text-gray-600 bg-gray-100',
    published: 'text-green-600 bg-green-100',
    scheduled: 'text-blue-600 bg-blue-100',
    archived: 'text-slate-600 bg-slate-100',
  }

  return (
    <Badge className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function BlogsTable({ data }: BlogsTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 20).map((blog) => (
            <TableRow key={blog.id}>
              <TableCell>
                <div className='max-w-[300px]'>
                  <p className='font-medium truncate'>{blog.title}</p>
                  <p className='text-sm text-muted-foreground truncate'>{blog.excerpt}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <img
                    src={blog.author.avatar}
                    alt={blog.author.name}
                    className='h-6 w-6 rounded-full'
                  />
                  <span className='text-sm'>{blog.author.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant='outline'>{blog.category}</Badge>
              </TableCell>
              <TableCell>{getStatusBadge(blog.status)}</TableCell>
              <TableCell>{blog.views.toLocaleString()}</TableCell>
              <TableCell>{format(blog.createdAt, 'MMM dd, yyyy')}</TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm'>
                      <MdMoreHoriz className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <MdVisibility className='mr-2 h-4 w-4' />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MdEdit className='mr-2 h-4 w-4' />
                      Edit Post
                    </DropdownMenuItem>
                    {blog.status === 'published' && (
                      <DropdownMenuItem>
                        <MdOpenInNew className='mr-2 h-4 w-4' />
                        View Live
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <MdContentCopy className='mr-2 h-4 w-4' />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-destructive'>
                      <MdDelete className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
