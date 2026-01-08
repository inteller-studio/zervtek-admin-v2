'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MdInbox } from 'react-icons/md'
import { cn } from '@/lib/utils'
import { type Submission, getDisplayStatus } from '../data/unified-leads'
import {
  TypeBadge,
  StatusBadge,
  CustomerCell,
  SubjectCell,
  AssigneeCell,
  TimeCell,
  ActionCell,
  getRowBorderClass,
} from './leads-table-columns'

interface UnifiedLeadsTableProps {
  data: Submission[]
  selectedId?: string | null
  onRowClick: (submission: Submission) => void
}

export function UnifiedLeadsTable({
  data,
  selectedId,
  onRowClick,
}: UnifiedLeadsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className='border-border/50 overflow-hidden'>
        <ScrollArea className='h-[calc(100vh-380px)]'>
          <Table>
            <TableHeader>
              <TableRow className='hover:bg-transparent'>
                <TableHead className='w-[120px]'>ID</TableHead>
                <TableHead className='w-[110px]'>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject / Interest</TableHead>
                <TableHead className='w-[110px]'>Status</TableHead>
                <TableHead className='w-[140px]'>Assigned To</TableHead>
                <TableHead className='w-[90px]'>Time</TableHead>
                <TableHead className='w-[40px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-32 text-center'>
                    <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                      <MdInbox className='h-8 w-8' />
                      <p>No leads found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((submission, index) => {
                  const status = getDisplayStatus(submission)
                  const isSelected = selectedId === submission.id
                  const isClosed =
                    status === 'closed' ||
                    status === 'completed' ||
                    status === 'rejected' ||
                    status === 'cancelled'

                  return (
                    <motion.tr
                      key={submission.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      onClick={() => onRowClick(submission)}
                      className={cn(
                        'group cursor-pointer border-b border-l-4 transition-colors',
                        'hover:bg-muted/50',
                        getRowBorderClass(submission),
                        isSelected && 'bg-muted/70',
                        isClosed && 'opacity-60'
                      )}
                    >
                      <TableCell className='font-mono text-xs text-muted-foreground'>
                        {submission.submissionNumber}
                      </TableCell>
                      <TableCell>
                        <TypeBadge type={submission.type} />
                      </TableCell>
                      <TableCell>
                        <CustomerCell submission={submission} />
                      </TableCell>
                      <TableCell>
                        <SubjectCell submission={submission} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge submission={submission} />
                      </TableCell>
                      <TableCell>
                        <AssigneeCell assigneeName={submission.assignedToName} />
                      </TableCell>
                      <TableCell>
                        <TimeCell date={submission.createdAt} />
                      </TableCell>
                      <TableCell>
                        <ActionCell />
                      </TableCell>
                    </motion.tr>
                  )
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </motion.div>
  )
}
