import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchInstance,
  createInstance,
  getQRCode,
  getConnectionState,
  disconnectInstance,
  fetchContacts,
  searchContacts,
  fetchChats,
  fetchMessages,
  sendTextMessage,
  sendMediaMessage,
  markAsRead,
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  fetchBroadcastLists,
  createBroadcastList,
  fetchBroadcasts,
  sendBroadcast,
  fetchWhatsAppStats,
  getWebhookConfig,
  setWebhookConfig,
} from '@/lib/api/whatsapp'
import type {
  CreateInstanceRequest,
  SendTextRequest,
  SendMediaRequest,
  MessageTemplate,
  BroadcastList,
  BroadcastMessage,
  WebhookConfig,
} from '@/features/whatsapp/types'

// ============ Instance Hooks ============

export function useWhatsAppInstance() {
  return useQuery({
    queryKey: ['whatsapp', 'instance'],
    queryFn: fetchInstance,
    staleTime: 30000,
  })
}

export function useCreateInstance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInstanceRequest) => createInstance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'instance'] })
    },
  })
}

export function useQRCode(instanceName: string, enabled = true) {
  return useQuery({
    queryKey: ['whatsapp', 'qrcode', instanceName],
    queryFn: () => getQRCode(instanceName),
    enabled,
    refetchInterval: 20000, // Refresh QR code every 20 seconds
  })
}

export function useConnectionState(instanceName: string) {
  return useQuery({
    queryKey: ['whatsapp', 'connection', instanceName],
    queryFn: () => getConnectionState(instanceName),
    refetchInterval: 5000,
  })
}

export function useDisconnectInstance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (instanceName: string) => disconnectInstance(instanceName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] })
    },
  })
}

// ============ Contact Hooks ============

export function useWhatsAppContacts() {
  return useQuery({
    queryKey: ['whatsapp', 'contacts'],
    queryFn: fetchContacts,
    staleTime: 60000,
  })
}

export function useSearchContacts(query: string) {
  return useQuery({
    queryKey: ['whatsapp', 'contacts', 'search', query],
    queryFn: () => searchContacts(query),
    enabled: query.length > 2,
  })
}

// ============ Chat Hooks ============

export function useWhatsAppChats() {
  return useQuery({
    queryKey: ['whatsapp', 'chats'],
    queryFn: fetchChats,
    refetchInterval: 10000,
  })
}

export function useMessages(chatId: string, enabled = true) {
  return useQuery({
    queryKey: ['whatsapp', 'messages', chatId],
    queryFn: () => fetchMessages(chatId),
    enabled,
    refetchInterval: 5000,
  })
}

export function useSendTextMessage(instanceName: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendTextRequest) => sendTextMessage(instanceName, data),
    onSuccess: (_, variables) => {
      const chatId = `${variables.number.replace(/\D/g, '')}@s.whatsapp.net`
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'chats'] })
    },
  })
}

export function useSendMediaMessage(instanceName: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendMediaRequest) => sendMediaMessage(instanceName, data),
    onSuccess: (_, variables) => {
      const chatId = `${variables.number.replace(/\D/g, '')}@s.whatsapp.net`
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'chats'] })
    },
  })
}

export function useMarkAsRead(instanceName: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chatId: string) => markAsRead(instanceName, chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'chats'] })
    },
  })
}

// ============ Template Hooks ============

export function useMessageTemplates() {
  return useQuery({
    queryKey: ['whatsapp', 'templates'],
    queryFn: fetchTemplates,
    staleTime: 60000,
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<MessageTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) =>
      createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'templates'] })
    },
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MessageTemplate> }) =>
      updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'templates'] })
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'templates'] })
    },
  })
}

// ============ Broadcast Hooks ============

export function useBroadcastLists() {
  return useQuery({
    queryKey: ['whatsapp', 'broadcast-lists'],
    queryFn: fetchBroadcastLists,
    staleTime: 60000,
  })
}

export function useCreateBroadcastList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<BroadcastList, 'id' | 'createdAt'>) => createBroadcastList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'broadcast-lists'] })
    },
  })
}

export function useBroadcasts() {
  return useQuery({
    queryKey: ['whatsapp', 'broadcasts'],
    queryFn: fetchBroadcasts,
    refetchInterval: 30000,
  })
}

export function useSendBroadcast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      data: Omit<
        BroadcastMessage,
        'id' | 'sent' | 'delivered' | 'read' | 'failed' | 'status' | 'sentAt' | 'completedAt'
      >
    ) => sendBroadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'broadcasts'] })
    },
  })
}

// ============ Stats Hooks ============

export function useWhatsAppStats() {
  return useQuery({
    queryKey: ['whatsapp', 'stats'],
    queryFn: fetchWhatsAppStats,
    refetchInterval: 30000,
  })
}

// ============ Webhook Hooks ============

export function useWebhookConfig(instanceName: string) {
  return useQuery({
    queryKey: ['whatsapp', 'webhook', instanceName],
    queryFn: () => getWebhookConfig(instanceName),
  })
}

export function useSetWebhookConfig(instanceName: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: WebhookConfig) => setWebhookConfig(instanceName, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'webhook', instanceName] })
    },
  })
}
