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
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MdMoreHoriz, MdVisibility, MdEdit, MdDelete, MdOpenInNew, MdLink } from 'react-icons/md'
import { type ModelSEO } from '../data/models'
import { format } from 'date-fns'

interface ModelsTableProps {
  data: ModelSEO[]
}

const getStatusBadge = (status: ModelSEO['status']) => {
  const variants: Record<ModelSEO['status'], string> = {
    draft: 'text-gray-600 bg-gray-100',
    published: 'text-green-600 bg-green-100',
  }

  return (
    <Badge className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const getCategoryBadge = (category: string) => {
  const variants: Record<string, string> = {
    sedan: 'text-blue-600 border-blue-600',
    suv: 'text-green-600 border-green-600',
    coupe: 'text-purple-600 border-purple-600',
    truck: 'text-orange-600 border-orange-600',
    electric: 'text-emerald-600 border-emerald-600',
    hatchback: 'text-pink-600 border-pink-600',
  }

  return (
    <Badge variant='outline' className={variants[category] || ''}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  )
}

const getSeoScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function ModelsTable({ data }: ModelsTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Make / Model</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SEO Score</TableHead>
            <TableHead>Vehicles</TableHead>
            <TableHead>Linked Blogs</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 20).map((model) => (
            <TableRow key={model.id}>
              <TableCell>
                <div>
                  <p className='font-medium'>{model.make} {model.model}</p>
                  <p className='text-xs text-muted-foreground'>/{model.slug}</p>
                </div>
              </TableCell>
              <TableCell>{getCategoryBadge(model.category)}</TableCell>
              <TableCell>
                <div className='w-20'>
                  <div className='flex items-center justify-between'>
                    <span className={`text-sm font-medium ${getSeoScoreColor(model.seoScore)}`}>
                      {model.seoScore}%
                    </span>
                  </div>
                  <Progress value={model.seoScore} className='h-1.5 mt-1' />
                </div>
              </TableCell>
              <TableCell>{model.vehicleCount}</TableCell>
              <TableCell>
                {model.linkedBlogs.length > 0 ? (
                  <Badge variant='secondary' className='text-xs'>
                    <MdLink className='mr-1 h-3 w-3' />
                    {model.linkedBlogs.length} blogs
                  </Badge>
                ) : (
                  <span className='text-muted-foreground text-sm'>None</span>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(model.status)}</TableCell>
              <TableCell>{format(model.updatedAt, 'MMM dd, yyyy')}</TableCell>
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
                      <MdEdit className='mr-2 h-4 w-4' />
                      Edit SEO
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MdLink className='mr-2 h-4 w-4' />
                      Link Blogs
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MdVisibility className='mr-2 h-4 w-4' />
                      Preview
                    </DropdownMenuItem>
                    {model.status === 'published' && (
                      <DropdownMenuItem>
                        <MdOpenInNew className='mr-2 h-4 w-4' />
                        View Live
                      </DropdownMenuItem>
                    )}
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
