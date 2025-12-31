'use client'

import { useMemo } from 'react'
import { MdArchive, MdFilterList, MdMessage, MdMoreVert, MdAdd, MdSearch, MdClose } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { EnhancedChat, ConversationLabel, StaffMember } from '../../types'
import { useWhatsAppUIStore } from '../../stores/whatsapp-ui-store'
import { ActiveArchivedTabs } from './active-archived-tabs'
import { ConversationRow } from './conversation-row'
import { FilterBar } from './filter-bar'

interface ConversationListProps {
  chats: EnhancedChat[]
  labels: ConversationLabel[]
  staffMembers: StaffMember[]
  isLoading?: boolean
  onChatSelect: (chatId: string) => void
  onArchive: (chatId: string) => void
  onUnarchive: (chatId: string) => void
  onSnooze: (chatId: string) => void
  onOpenLabels: (chatId: string) => void
  onOpenAssign: (chatId: string) => void
  onMarkUnread: (chatId: string) => void
  onNewConversation: () => void
}

export function ConversationList({
  chats,
  labels,
  staffMembers,
  isLoading,
  onChatSelect,
  onArchive,
  onUnarchive,
  onSnooze,
  onOpenLabels,
  onOpenAssign,
  onMarkUnread,
  onNewConversation,
}: ConversationListProps) {
  const {
    activeTab,
    selectedChatId,
    searchTerm,
    setSearchTerm,
    labelFilter,
    assignmentFilter,
  } = useWhatsAppUIStore()

  // Filter chats based on tab, search, labels, and assignment
  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      // Filter by status
      const statusMatch =
        activeTab === 'active'
          ? chat.status === 'active' || chat.status === 'snoozed'
          : chat.status === 'archived'

      if (!statusMatch) return false

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const nameMatch = chat.contact.pushName?.toLowerCase().includes(searchLower)
        const numberMatch = chat.contact.number.includes(searchTerm)
        const messageMatch = chat.lastMessage?.message.conversation
          ?.toLowerCase()
          .includes(searchLower)
        if (!nameMatch && !numberMatch && !messageMatch) return false
      }

      // Filter by labels
      if (labelFilter.length > 0) {
        const hasMatchingLabel = chat.labels.some((label) => labelFilter.includes(label.id))
        if (!hasMatchingLabel) return false
      }

      // Filter by assignment
      if (assignmentFilter) {
        if (assignmentFilter === 'unassigned') {
          if (chat.assignment) return false
        } else {
          if (!chat.assignment || chat.assignment.assignedTo.id !== assignmentFilter) return false
        }
      }

      return true
    })
  }, [chats, activeTab, searchTerm, labelFilter, assignmentFilter])

  // Count for tabs
  const activeCount = chats.filter(
    (c) => c.status === 'active' || c.status === 'snoozed'
  ).length
  const archivedCount = chats.filter((c) => c.status === 'archived').length

  // Check if any filters are active
  const hasActiveFilters = labelFilter.length > 0 || assignmentFilter !== null

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      {/* Header */}
      <div className='flex h-14 flex-shrink-0 items-center justify-between border-b bg-card px-4'>
        <Avatar className='size-10 cursor-pointer'>
          <AvatarImage src='' />
          <AvatarFallback className='bg-muted text-sm text-muted-foreground'>ME</AvatarFallback>
        </Avatar>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onNewConversation}
            className='size-10 text-muted-foreground hover:text-foreground'
          >
            <MdAdd className='h-5 w-5' />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='size-10 text-muted-foreground hover:text-foreground'
              >
                <MdMoreVert className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem>New group</DropdownMenuItem>
              <DropdownMenuItem>Starred messages</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <div className='flex-shrink-0 bg-muted/50 px-3 py-2'>
        <div className='relative'>
          <MdSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search or start new chat'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='h-9 rounded-lg border-0 bg-background pl-10 pr-10 text-sm shadow-none'
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground'
            >
              <MdClose className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className='flex-shrink-0 border-b bg-card px-2'>
        <ActiveArchivedTabs activeCount={activeCount} archivedCount={archivedCount} />
      </div>

      {/* Filter bar */}
      <FilterBar labels={labels} staffMembers={staffMembers} />

      {/* Chat list */}
      <ScrollArea className='flex-1 overflow-x-hidden bg-card'>
        {isLoading ? (
          <div className='px-2 py-1'>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className='mb-1 flex animate-pulse items-center gap-3 rounded-xl bg-muted/50 px-3 py-3'
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className='size-12 shrink-0 rounded-full bg-muted' />
                <div className='min-w-0 flex-1 space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='h-4 w-28 rounded bg-muted' />
                    <div className='h-3 w-12 rounded bg-muted' />
                  </div>
                  <div className='h-4 w-4/5 rounded bg-muted' />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className='flex flex-col items-center justify-center px-4 py-16 text-center'>
            <div className='mb-4 flex size-20 items-center justify-center rounded-full bg-muted'>
              {activeTab === 'active' ? (
                <MdMessage className='size-10 text-muted-foreground' />
              ) : (
                <MdArchive className='size-10 text-muted-foreground' />
              )}
            </div>
            <h3 className='font-medium text-foreground'>
              {hasActiveFilters
                ? 'No matches found'
                : activeTab === 'active'
                  ? 'No conversations'
                  : 'No archived chats'}
            </h3>
            <p className='mt-1 text-sm text-[#667781] dark:text-[#8696A0]'>
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Start a new conversation'}
            </p>
            {hasActiveFilters && (
              <Button
                variant='outline'
                size='sm'
                className='mt-4'
                onClick={() => {
                  useWhatsAppUIStore.getState().clearLabelFilter()
                  useWhatsAppUIStore.getState().setAssignmentFilter(null)
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className='w-full py-1'>
            {filteredChats.map((chat) => (
              <ConversationRow
                key={chat.id}
                chat={chat}
                isSelected={selectedChatId === chat.id}
                onClick={() => onChatSelect(chat.id)}
                onArchive={chat.status !== 'archived' ? () => onArchive(chat.id) : undefined}
                onUnarchive={chat.status === 'archived' ? () => onUnarchive(chat.id) : undefined}
                onSnooze={() => onSnooze(chat.id)}
                onLabel={() => onOpenLabels(chat.id)}
                onAssign={() => onOpenAssign(chat.id)}
                onMarkUnread={() => onMarkUnread(chat.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
