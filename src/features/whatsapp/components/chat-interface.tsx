'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  MdArrowBack,
  MdMoreVert,
  MdSearch,
  MdLocalOffer,
  MdPersonAdd,
} from 'react-icons/md'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import {
  useWhatsAppChats,
  useMessages,
  useSendTextMessage,
  useWhatsAppInstance,
  useConversationLabels,
  useStaffMembers,
  useArchiveChat,
  useUnarchiveChat,
  useSnoozeChat,
  useCancelSnooze,
  useAddLabelToChat,
  useRemoveLabelFromChat,
  useCreateLabel,
  useAssignChat,
  useUnassignChat,
  useCreateInternalNote,
  useEnhancedChats,
  useCreateConversation,
  useValidatePhoneNumber,
} from '@/hooks/use-whatsapp'
import type { Message, SnoozePreset, LabelColor, NewConversationRequest } from '../types'
import { useWhatsAppUIStore } from '../stores/whatsapp-ui-store'

// Import components
import { ConversationList } from './inbox'
import { ChatLabelPopover, ManagedCreateLabelDialog } from './labels'
import { ChatSnoozePopover, SnoozeIndicator } from './snooze'
import { ChatAssignPopover, AssignmentBadge, InternalNotesList } from './collaboration'
import { EnhancedMessageInput } from './message-input'
import { ManagedNewConversationDialog } from './new-conversation'
import { MessageBubble } from './chat/message-bubble'
import { EmptyState } from './chat/empty-state'

export function ChatInterface() {
  const { data: instance } = useWhatsAppInstance()
  const { data: enhancedChatsData, isLoading: chatsLoading } = useEnhancedChats()
  const { data: labels = [] } = useConversationLabels()
  const { data: staffMembers = [] } = useStaffMembers()

  const chats = enhancedChatsData?.chats || []

  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    selectedChatId,
    setSelectedChatId,
    setNewConversationOpen,
    setLabelPopoverChatId,
    setSnoozePopoverChatId,
    setAssignPopoverChatId,
    replyMode,
  } = useWhatsAppUIStore()

  const selectedChat = chats?.find((c) => c.id === selectedChatId) || null
  const { data: messages } = useMessages(selectedChatId || '', !!selectedChatId)

  // Mutations
  const sendMessage = useSendTextMessage(instance?.instanceName || '')
  const archiveMutation = useArchiveChat()
  const unarchiveMutation = useUnarchiveChat()
  const snoozeMutation = useSnoozeChat()
  const cancelSnoozeMutation = useCancelSnooze()
  const addLabelMutation = useAddLabelToChat()
  const removeLabelMutation = useRemoveLabelFromChat()
  const createLabelMutation = useCreateLabel()
  const assignMutation = useAssignChat()
  const unassignMutation = useUnassignChat()
  const createNoteMutation = useCreateInternalNote()
  const createConversationMutation = useCreateConversation()
  const validatePhoneMutation = useValidatePhoneNumber()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handlers
  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
    setShowMobileChat(true)
  }

  const handleSendMessage = async (message: string, shouldArchive: boolean) => {
    if (!selectedChat) return

    try {
      await sendMessage.mutateAsync({
        number: selectedChat.contact.number,
        text: message,
      })

      if (shouldArchive) {
        await archiveMutation.mutateAsync(selectedChat.id)
        toast.success('Message sent and archived')
      } else {
        toast.success('Message sent')
      }
    } catch {
      toast.error('Failed to send message')
    }
  }

  const handleSendInternalNote = async (content: string, mentions: string[]) => {
    if (!selectedChatId) return

    try {
      const currentUserId = 'staff_1'
      await createNoteMutation.mutateAsync({
        chatId: selectedChatId,
        authorId: currentUserId,
        content,
        mentions,
      })
      toast.success('Note added')
    } catch {
      toast.error('Failed to add note')
    }
  }

  const handleArchive = async (chatId: string) => {
    try {
      await archiveMutation.mutateAsync(chatId)
      toast.success('Conversation archived')
    } catch {
      toast.error('Failed to archive')
    }
  }

  const handleUnarchive = async (chatId: string) => {
    try {
      await unarchiveMutation.mutateAsync(chatId)
      toast.success('Conversation unarchived')
    } catch {
      toast.error('Failed to unarchive')
    }
  }

  const handleSnooze = async (chatId: string, preset: SnoozePreset, returnAt: Date) => {
    try {
      await snoozeMutation.mutateAsync({ chatId, preset, returnAt })
      toast.success('Conversation snoozed')
    } catch {
      toast.error('Failed to snooze')
    }
  }

  const handleCancelSnooze = async (chatId: string) => {
    try {
      await cancelSnoozeMutation.mutateAsync(chatId)
      toast.success('Snooze cancelled')
    } catch {
      toast.error('Failed to cancel snooze')
    }
  }

  const handleAddLabel = async (chatId: string, labelId: string) => {
    try {
      await addLabelMutation.mutateAsync({ chatId, labelId })
    } catch {
      toast.error('Failed to add label')
    }
  }

  const handleRemoveLabel = async (chatId: string, labelId: string) => {
    try {
      await removeLabelMutation.mutateAsync({ chatId, labelId })
    } catch {
      toast.error('Failed to remove label')
    }
  }

  const handleCreateLabel = async (name: string, color: LabelColor) => {
    try {
      await createLabelMutation.mutateAsync({ name, color })
      toast.success('Label created')
    } catch {
      toast.error('Failed to create label')
    }
  }

  const handleAssign = async (chatId: string, staffId: string | null) => {
    try {
      if (staffId) {
        await assignMutation.mutateAsync({ chatId, staffId })
        toast.success('Conversation assigned')
      } else {
        await unassignMutation.mutateAsync(chatId)
        toast.success('Assignment removed')
      }
    } catch {
      toast.error('Failed to update assignment')
    }
  }

  const handleMarkUnread = async (chatId: string) => {
    toast.info('Mark as unread coming soon')
  }

  const handleCreateConversation = async (data: NewConversationRequest) => {
    try {
      await createConversationMutation.mutateAsync(data)
      toast.success('Conversation started')
      setNewConversationOpen(false)
    } catch {
      toast.error('Failed to start conversation')
    }
  }

  const handleValidatePhone = async (phone: string) => {
    try {
      const countryCode = phone.match(/^\+\d{1,3}/)?.[0] || '+1'
      const phoneNumber = phone.replace(countryCode, '')

      const result = await validatePhoneMutation.mutateAsync({ phoneNumber, countryCode })
      return {
        isValid: result.valid,
        message: result.error || (result.whatsappRegistered ? 'Valid WhatsApp number' : 'Number may not be on WhatsApp')
      }
    } catch {
      return { isValid: false, message: 'Validation failed' }
    }
  }

  return (
    <>
      <div className='relative flex h-full w-full overflow-hidden'>
        {/* Conversation List Panel */}
        <div
          className={cn(
            'relative z-10 flex h-full w-[580px] min-w-[580px] flex-shrink-0 flex-col overflow-hidden bg-card shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[2px_0_8px_-2px_rgba(0,0,0,0.3)]',
            showMobileChat ? 'hidden md:flex' : 'flex'
          )}
        >
          <ConversationList
            chats={chats || []}
            labels={labels}
            staffMembers={staffMembers}
            isLoading={chatsLoading}
            onChatSelect={handleSelectChat}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            onSnooze={(chatId) => setSnoozePopoverChatId(chatId)}
            onOpenLabels={(chatId) => setLabelPopoverChatId(chatId)}
            onOpenAssign={(chatId) => setAssignPopoverChatId(chatId)}
            onMarkUnread={handleMarkUnread}
            onNewConversation={() => setNewConversationOpen(true)}
          />
        </div>

        {/* Chat Window */}
        <div
          className={cn(
            'flex min-w-0 flex-1 flex-col',
            showMobileChat ? 'flex' : 'hidden md:flex'
          )}
        >
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className='flex h-14 flex-shrink-0 items-center justify-between border-b bg-card px-4'>
                <div className='flex items-center gap-3'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-9 md:hidden'
                    onClick={() => setShowMobileChat(false)}
                  >
                    <MdArrowBack className='h-5 w-5' />
                  </Button>
                  <Avatar className='size-10'>
                    <AvatarImage src={selectedChat.contact.profilePicUrl} />
                    <AvatarFallback className='bg-muted text-muted-foreground'>
                      {selectedChat.contact.pushName?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2'>
                      <h2 className='truncate font-medium text-foreground'>
                        {selectedChat.contact.pushName || selectedChat.contact.number}
                      </h2>
                      {selectedChat.assignment && (
                        <AssignmentBadge
                          assignment={selectedChat.assignment}
                          variant='compact'
                        />
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {selectedChat.contact.isMyContact ? 'Online' : selectedChat.contact.number}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Button variant='ghost' size='icon' className='size-10 text-muted-foreground hover:text-foreground'>
                    <MdSearch className='h-5 w-5' />
                  </Button>

                  <ChatLabelPopover
                    chatId={selectedChat.id}
                    labels={labels}
                    chatLabels={selectedChat.labels}
                    onAddLabel={handleAddLabel}
                    onRemoveLabel={handleRemoveLabel}
                  >
                    <Button variant='ghost' size='icon' className='size-10 text-muted-foreground hover:text-foreground'>
                      <MdLocalOffer className='h-5 w-5' />
                    </Button>
                  </ChatLabelPopover>

                  <ChatAssignPopover
                    chatId={selectedChat.id}
                    staffMembers={staffMembers}
                    currentAssigneeId={selectedChat.assignment?.assignedTo.id}
                    onAssign={handleAssign}
                  >
                    <Button variant='ghost' size='icon' className='size-10 text-muted-foreground hover:text-foreground'>
                      <MdPersonAdd className='h-5 w-5' />
                    </Button>
                  </ChatAssignPopover>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='size-10 text-muted-foreground hover:text-foreground'>
                        <MdMoreVert className='h-5 w-5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>View contact</DropdownMenuItem>
                      <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {selectedChat.status === 'archived' ? (
                        <DropdownMenuItem onClick={() => handleUnarchive(selectedChat.id)}>
                          Unarchive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleArchive(selectedChat.id)}>
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className='text-destructive'>
                        Delete chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Snooze indicator */}
              {selectedChat.snooze && (
                <div className='flex-shrink-0 border-b bg-amber-50 px-4 py-2 dark:bg-amber-500/10'>
                  <SnoozeIndicator
                    snooze={selectedChat.snooze}
                    variant='full'
                    onCancel={() => handleCancelSnooze(selectedChat.id)}
                  />
                </div>
              )}

              {/* Messages Area */}
              <ScrollArea className='flex-1 overflow-hidden bg-muted/30'>
                <div className='space-y-3 py-4'>
                  {/* Internal notes */}
                  {selectedChat.internalNotes.length > 0 && (
                    <div className='mb-4 px-4'>
                      <InternalNotesList notes={selectedChat.internalNotes} />
                    </div>
                  )}

                  <AnimatePresence mode='popLayout'>
                    {messages?.map((message, index) => {
                      const prevMessage = messages[index - 1]
                      const showTail = !prevMessage || prevMessage.key.fromMe !== message.key.fromMe

                      return (
                        <motion.div
                          key={message.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: message.key.fromMe ? 30 : -30 }}
                          transition={{
                            duration: 0.2,
                            delay: Math.min(index * 0.02, 0.15),
                            ease: [0.4, 0, 0.2, 1]
                          }}
                        >
                          <MessageBubble message={message} showTail={showTail} />
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className='flex-shrink-0 border-t bg-card'>
                <EnhancedMessageInput
                  onSendMessage={handleSendMessage}
                  onSendInternalNote={handleSendInternalNote}
                  staffMembers={staffMembers}
                  isLoading={sendMessage.isPending}
                  disabled={!selectedChat}
                />
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ManagedNewConversationDialog
        labels={labels}
        staffMembers={staffMembers}
        onValidatePhone={handleValidatePhone}
        onCreate={handleCreateConversation}
        isLoading={createConversationMutation.isPending}
      />

      <ManagedCreateLabelDialog
        onCreateLabel={handleCreateLabel}
        isLoading={createLabelMutation.isPending}
      />

      {chats.map((chat) => (
        <ChatSnoozePopover
          key={`snooze-${chat.id}`}
          chatId={chat.id}
          onSnooze={handleSnooze}
        >
          <span className='hidden' />
        </ChatSnoozePopover>
      ))}
    </>
  )
}
