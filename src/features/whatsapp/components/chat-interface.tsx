'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Send,
  Paperclip,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Clock,
  ArrowLeft,
  Users,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWhatsAppChats, useMessages, useSendTextMessage, useWhatsAppInstance } from '@/hooks/use-whatsapp'
import type { Chat, Message } from '../types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'

export function ChatInterface() {
  const { data: instance } = useWhatsAppInstance()
  const { data: chats, isLoading: chatsLoading } = useWhatsAppChats()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageText, setMessageText] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messages } = useMessages(selectedChat?.id || '', !!selectedChat)
  const sendMessage = useSendTextMessage(instance?.instanceName || '')

  const filteredChats = chats?.filter(
    (chat) =>
      chat.contact.pushName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.contact.number.includes(searchTerm)
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return

    try {
      await sendMessage.mutateAsync({
        number: selectedChat.contact.number,
        text: messageText,
      })
      setMessageText('')
      toast.success('Message sent')
    } catch {
      toast.error('Failed to send message')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getMessageStatus = (status: Message['status']) => {
    switch (status) {
      case 'read':
        return <CheckCheck className='h-3 w-3 text-blue-500' />
      case 'delivered':
        return <CheckCheck className='h-3 w-3 text-muted-foreground' />
      case 'sent':
        return <Check className='h-3 w-3 text-muted-foreground' />
      case 'pending':
        return <Clock className='h-3 w-3 text-muted-foreground' />
      default:
        return null
    }
  }

  const getMessageContent = (message: Message) => {
    if (message.message.conversation) {
      return message.message.conversation
    }
    if (message.message.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text
    }
    if (message.message.imageMessage) {
      return (
        <div className='space-y-1'>
          <img
            src={message.message.imageMessage.url}
            alt='Image'
            className='max-w-[200px] rounded-lg'
          />
          {message.message.imageMessage.caption && (
            <p className='text-sm'>{message.message.imageMessage.caption}</p>
          )}
        </div>
      )
    }
    if (message.message.locationMessage) {
      return `📍 ${message.message.locationMessage.name || 'Location'}`
    }
    return '[Unsupported message type]'
  }

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat)
    setShowMobileChat(true)
  }

  return (
    <Card className='h-[600px] overflow-hidden'>
      <div className='flex h-full'>
        {/* Chat List */}
        <div
          className={cn(
            'w-full border-r md:w-80 lg:w-96',
            showMobileChat && 'hidden md:block'
          )}
        >
          {/* Search */}
          <div className='border-b p-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search conversations...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-9'
              />
            </div>
          </div>

          {/* Chats List */}
          <ScrollArea className='h-[calc(600px-57px)]'>
            {chatsLoading ? (
              <div className='space-y-2 p-3'>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-3 rounded-lg p-3'
                  >
                    <div className='h-12 w-12 animate-pulse rounded-full bg-muted' />
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 w-24 animate-pulse rounded bg-muted' />
                      <div className='h-3 w-32 animate-pulse rounded bg-muted' />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats?.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-10 text-muted-foreground'>
                <MessageSquare className='mb-2 h-10 w-10' />
                <p>No conversations found</p>
              </div>
            ) : (
              <div className='p-2'>
                {filteredChats?.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted',
                      selectedChat?.id === chat.id && 'bg-muted'
                    )}
                    onClick={() => handleSelectChat(chat)}
                  >
                    <div className='relative'>
                      <Avatar>
                        <AvatarImage src={chat.contact.profilePicUrl} />
                        <AvatarFallback>
                          {chat.contact.isGroup ? (
                            <Users className='h-5 w-5' />
                          ) : (
                            chat.contact.pushName.charAt(0)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {chat.contact.isBusiness && (
                        <span className='absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[8px] text-white'>
                          ✓
                        </span>
                      )}
                    </div>
                    <div className='flex-1 overflow-hidden'>
                      <div className='flex items-center justify-between'>
                        <p className='truncate font-medium'>
                          {chat.contact.pushName}
                        </p>
                        <span className='text-xs text-muted-foreground'>
                          {chat.lastMessage &&
                            format(
                              new Date(chat.lastMessage.messageTimestamp),
                              'HH:mm'
                            )}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <p className='truncate text-sm text-muted-foreground'>
                          {chat.lastMessage?.key.fromMe && (
                            <span className='mr-1'>
                              {getMessageStatus(chat.lastMessage.status)}
                            </span>
                          )}
                          {chat.lastMessage?.message.conversation?.slice(0, 30) ||
                            'No messages yet'}
                        </p>
                        {chat.unreadCount > 0 && (
                          <Badge className='ml-2 h-5 min-w-[20px] rounded-full px-1.5'>
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div
          className={cn(
            'flex flex-1 flex-col',
            !showMobileChat && 'hidden md:flex'
          )}
        >
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className='flex items-center justify-between border-b p-3'>
                <div className='flex items-center gap-3'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='md:hidden'
                    onClick={() => setShowMobileChat(false)}
                  >
                    <ArrowLeft className='h-5 w-5' />
                  </Button>
                  <Avatar>
                    <AvatarImage src={selectedChat.contact.profilePicUrl} />
                    <AvatarFallback>
                      {selectedChat.contact.pushName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{selectedChat.contact.pushName}</p>
                    <p className='text-xs text-muted-foreground'>
                      {selectedChat.contact.number}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Button variant='ghost' size='icon'>
                    <Phone className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='icon'>
                    <Video className='h-4 w-4' />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>View contact</DropdownMenuItem>
                      <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                      <DropdownMenuItem>Block contact</DropdownMenuItem>
                      <DropdownMenuItem className='text-destructive'>
                        Delete chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className='flex-1 p-4'>
                <div className='space-y-4'>
                  <AnimatePresence>
                    {messages?.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex',
                          message.key.fromMe ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-lg px-3 py-2',
                            message.key.fromMe
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <div className='text-sm'>
                            {getMessageContent(message)}
                          </div>
                          <div
                            className={cn(
                              'mt-1 flex items-center justify-end gap-1 text-[10px]',
                              message.key.fromMe
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {format(
                              new Date(message.messageTimestamp),
                              'HH:mm'
                            )}
                            {message.key.fromMe && getMessageStatus(message.status)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className='border-t p-3'>
                <div className='flex items-end gap-2'>
                  <Button variant='ghost' size='icon'>
                    <Smile className='h-5 w-5' />
                  </Button>
                  <Button variant='ghost' size='icon'>
                    <Paperclip className='h-5 w-5' />
                  </Button>
                  <Textarea
                    placeholder='Type a message...'
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className='min-h-[40px] max-h-[120px] flex-1 resize-none'
                    rows={1}
                  />
                  <Button
                    size='icon'
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessage.isPending}
                  >
                    <Send className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className='flex flex-1 flex-col items-center justify-center text-muted-foreground'>
              <MessageSquare className='mb-4 h-16 w-16' />
              <h3 className='text-lg font-medium'>Select a conversation</h3>
              <p className='text-sm'>Choose from your existing chats or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
