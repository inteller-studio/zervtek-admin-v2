import type {
  WhatsAppInstance,
  Contact,
  Chat,
  Message,
  MessageTemplate,
  BroadcastList,
  BroadcastMessage,
  WhatsAppStats,
  SendTextRequest,
  SendMediaRequest,
  CreateInstanceRequest,
  WebhookConfig,
  QRCodeData,
} from '@/features/whatsapp/types'
import {
  mockInstance,
  mockContacts,
  mockChats,
  mockTemplates,
  mockBroadcastLists,
  mockBroadcasts,
  generateMockStats,
} from '@/features/whatsapp/data/mock-data'

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In production, this would be the Evolution API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'http://localhost:8080'
const API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || ''

// For now, using mock data - in production, replace with actual API calls

// ============ Instance Management ============

export async function fetchInstance(): Promise<WhatsAppInstance> {
  await delay(500)
  return mockInstance
}

export async function createInstance(data: CreateInstanceRequest): Promise<WhatsAppInstance> {
  await delay(1000)
  return {
    ...mockInstance,
    instanceName: data.instanceName,
    status: 'connecting',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function getQRCode(instanceName: string): Promise<QRCodeData> {
  await delay(500)
  // In production, this would return actual QR code from Evolution API
  return {
    code: 'mock-qr-code-data',
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAABeklEQVR42uyYMQ6AIBAE/+L/f4mVFRYWxkQTCwsjFiYWJhYmFsYWJhbGFsYWxhYmFsYWJhbGFiYWxhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFqYWxhYmFsYWJhbGFiYWxhYmFsYWJhbGFiYWxhYmFv8WZgAAAABJRU5ErkJggg==',
    pairingCode: '1234-5678',
  }
}

export async function getConnectionState(instanceName: string): Promise<{ state: string }> {
  await delay(300)
  return { state: mockInstance.status }
}

export async function disconnectInstance(instanceName: string): Promise<void> {
  await delay(500)
}

export async function deleteInstance(instanceName: string): Promise<void> {
  await delay(500)
}

// ============ Contacts ============

export async function fetchContacts(): Promise<Contact[]> {
  await delay(600)
  return mockContacts
}

export async function searchContacts(query: string): Promise<Contact[]> {
  await delay(300)
  const lowerQuery = query.toLowerCase()
  return mockContacts.filter(
    (c) =>
      c.pushName.toLowerCase().includes(lowerQuery) ||
      c.number.includes(query)
  )
}

export async function checkWhatsAppNumber(number: string): Promise<{ exists: boolean; jid: string }> {
  await delay(400)
  return { exists: true, jid: `${number.replace(/\D/g, '')}@s.whatsapp.net` }
}

// ============ Chats & Messages ============

export async function fetchChats(): Promise<Chat[]> {
  await delay(700)
  return mockChats.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    const aTime = a.lastMessage?.messageTimestamp || 0
    const bTime = b.lastMessage?.messageTimestamp || 0
    return bTime - aTime
  })
}

export async function fetchMessages(chatId: string, limit = 50): Promise<Message[]> {
  await delay(400)
  const chat = mockChats.find((c) => c.id === chatId)
  return chat?.messages || []
}

export async function sendTextMessage(
  instanceName: string,
  data: SendTextRequest
): Promise<Message> {
  await delay(500)
  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    key: {
      remoteJid: `${data.number.replace(/\D/g, '')}@s.whatsapp.net`,
      fromMe: true,
      id: `sent_${Date.now()}`,
    },
    message: { conversation: data.text },
    messageType: 'text',
    messageTimestamp: Date.now(),
    status: 'sent',
  }
  return newMessage
}

export async function sendMediaMessage(
  instanceName: string,
  data: SendMediaRequest
): Promise<Message> {
  await delay(800)
  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    key: {
      remoteJid: `${data.number.replace(/\D/g, '')}@s.whatsapp.net`,
      fromMe: true,
      id: `sent_${Date.now()}`,
    },
    message: {
      imageMessage: data.mediatype === 'image' ? {
        url: data.media,
        caption: data.caption,
        mimetype: 'image/jpeg',
      } : undefined,
    },
    messageType: data.mediatype,
    messageTimestamp: Date.now(),
    status: 'sent',
  }
  return newMessage
}

export async function markAsRead(instanceName: string, chatId: string): Promise<void> {
  await delay(200)
}

// ============ Templates ============

export async function fetchTemplates(): Promise<MessageTemplate[]> {
  await delay(500)
  return mockTemplates
}

export async function createTemplate(
  template: Omit<MessageTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>
): Promise<MessageTemplate> {
  await delay(600)
  return {
    ...template,
    id: `tmpl_${Date.now()}`,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function updateTemplate(
  id: string,
  template: Partial<MessageTemplate>
): Promise<MessageTemplate> {
  await delay(500)
  const existing = mockTemplates.find((t) => t.id === id)
  if (!existing) throw new Error('Template not found')
  return { ...existing, ...template, updatedAt: new Date() }
}

export async function deleteTemplate(id: string): Promise<void> {
  await delay(400)
}

// ============ Broadcast ============

export async function fetchBroadcastLists(): Promise<BroadcastList[]> {
  await delay(500)
  return mockBroadcastLists
}

export async function createBroadcastList(
  data: Omit<BroadcastList, 'id' | 'createdAt'>
): Promise<BroadcastList> {
  await delay(600)
  return {
    ...data,
    id: `blist_${Date.now()}`,
    createdAt: new Date(),
  }
}

export async function fetchBroadcasts(): Promise<BroadcastMessage[]> {
  await delay(500)
  return mockBroadcasts
}

export async function sendBroadcast(
  data: Omit<BroadcastMessage, 'id' | 'sent' | 'delivered' | 'read' | 'failed' | 'status' | 'sentAt' | 'completedAt'>
): Promise<BroadcastMessage> {
  await delay(1000)
  return {
    ...data,
    id: `bc_${Date.now()}`,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    status: data.scheduledAt ? 'scheduled' : 'sending',
    sentAt: data.scheduledAt ? undefined : new Date(),
  }
}

// ============ Stats ============

export async function fetchWhatsAppStats(): Promise<WhatsAppStats> {
  await delay(400)
  return generateMockStats()
}

// ============ Webhook ============

export async function getWebhookConfig(instanceName: string): Promise<WebhookConfig | null> {
  await delay(300)
  return {
    url: mockInstance.webhookUrl || '',
    webhookByEvents: true,
    webhookBase64: false,
    events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
  }
}

export async function setWebhookConfig(
  instanceName: string,
  config: WebhookConfig
): Promise<WebhookConfig> {
  await delay(500)
  return config
}
