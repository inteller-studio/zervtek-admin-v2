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
import { MdMoreHoriz, MdVisibility, MdEdit, MdDelete, MdOpenInNew } from 'react-icons/md'
import { type MakeSEO } from '../data/makes'
import { format } from 'date-fns'

interface MakesTableProps {
  data: MakeSEO[]
}

const getStatusBadge = (status: MakeSEO['status']) => {
  const variants: Record<MakeSEO['status'], string> = {
    draft: 'text-gray-600 bg-gray-100',
    published: 'text-green-600 bg-green-100',
  }

  return (
    <Badge className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const getSeoScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function MakesTable({ data }: MakesTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Make</TableHead>
            <TableHead>Meta Title</TableHead>
            <TableHead>SEO Score</TableHead>
            <TableHead>Vehicles</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((make) => (
            <TableRow key={make.id}>
              <TableCell>
                <div className='flex items-center gap-2'>
                  {make.logo && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={make.logo}
                      alt={make.name}
                      className='h-8 w-8 rounded object-contain'
                    />
                  )}
                  <div>
                    <p className='font-medium'>{make.name}</p>
                    <p className='text-xs text-muted-foreground'>/{make.slug}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className='max-w-[200px] truncate text-sm'>{make.metaTitle}</p>
              </TableCell>
              <TableCell>
                <div className='w-20'>
                  <div className='flex items-center justify-between'>
                    <span className={`text-sm font-medium ${getSeoScoreColor(make.seoScore)}`}>
                      {make.seoScore}%
                    </span>
                  </div>
                  <Progress value={make.seoScore} className='h-1.5 mt-1' />
                </div>
              </TableCell>
              <TableCell>{make.vehicleCount}</TableCell>
              <TableCell>{make.pageViews.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(make.status)}</TableCell>
              <TableCell>{format(make.updatedAt, 'MMM dd, yyyy')}</TableCell>
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
                      <MdVisibility className='mr-2 h-4 w-4' />
                      Preview
                    </DropdownMenuItem>
                    {make.status === 'published' && (
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
