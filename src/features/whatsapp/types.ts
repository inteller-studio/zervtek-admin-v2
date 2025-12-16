// Evolution API Types

export interface WhatsAppInstance {
  instanceName: string
  instanceId: string
  status: 'open' | 'close' | 'connecting'
  owner?: string
  profileName?: string
  profilePicUrl?: string
  number?: string
  integration: 'WHATSAPP-BAILEYS' | 'WHATSAPP-CLOUD'
  token?: string
  webhookUrl?: string
  webhookEvents?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface QRCodeData {
  code: string
  base64: string
  pairingCode?: string
}

export interface Contact {
  id: string
  pushName: string
  profilePicUrl?: string
  number: string
  isGroup: boolean
  isMyContact: boolean
  isBusiness: boolean
  lastMessageAt?: Date
  unreadCount: number
}

export interface Message {
  id: string
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  pushName?: string
  message: {
    conversation?: string
    extendedTextMessage?: {
      text: string
    }
    imageMessage?: {
      url: string
      caption?: string
      mimetype: string
    }
    videoMessage?: {
      url: string
      caption?: string
      mimetype: string
    }
    audioMessage?: {
      url: string
      mimetype: string
      ptt: boolean
    }
    documentMessage?: {
      url: string
      fileName: string
      mimetype: string
    }
    locationMessage?: {
      degreesLatitude: number
      degreesLongitude: number
      name?: string
      address?: string
    }
  }
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'sticker' | 'contact'
  messageTimestamp: number
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
}

export interface Chat {
  id: string
  contact: Contact
  lastMessage?: Message
  messages: Message[]
  unreadCount: number
  pinned: boolean
  muted: boolean
  archived: boolean
}

export interface MessageTemplate {
  id: string
  name: string
  category: 'marketing' | 'utility' | 'authentication' | 'service'
  content: string
  variables: string[]
  status: 'draft' | 'active' | 'archived'
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface BroadcastList {
  id: string
  name: string
  contacts: Contact[]
  description?: string
  createdAt: Date
}

export interface BroadcastMessage {
  id: string
  listId: string
  listName: string
  template?: MessageTemplate
  content: string
  mediaUrl?: string
  totalRecipients: number
  sent: number
  delivered: number
  read: number
  failed: number
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed'
  scheduledAt?: Date
  sentAt?: Date
  completedAt?: Date
}

export interface WhatsAppStats {
  totalContacts: number
  totalChats: number
  messagesSent: number
  messagesReceived: number
  messagesDelivered: number
  messagesRead: number
  activeChats: number
  broadcastsSent: number
  templatesUsed: number
  avgResponseTime: number // in minutes
}

export interface WebhookEvent {
  id: string
  event: string
  data: Record<string, unknown>
  timestamp: Date
  processed: boolean
}

// API Request/Response types
export interface SendTextRequest {
  number: string
  text: string
  delay?: number
}

export interface SendMediaRequest {
  number: string
  mediatype: 'image' | 'video' | 'audio' | 'document'
  media: string // URL or base64
  caption?: string
  fileName?: string
}

export interface SendLocationRequest {
  number: string
  name: string
  address: string
  latitude: number
  longitude: number
}

export interface CreateInstanceRequest {
  instanceName: string
  token?: string
  number?: string
  qrcode?: boolean
  integration?: 'WHATSAPP-BAILEYS' | 'WHATSAPP-CLOUD'
}

export interface WebhookConfig {
  url: string
  webhookByEvents: boolean
  webhookBase64: boolean
  events: WebhookEventType[]
}

export type WebhookEventType =
  | 'MESSAGES_SET'
  | 'MESSAGES_UPSERT'
  | 'MESSAGES_UPDATE'
  | 'MESSAGES_DELETE'
  | 'SEND_MESSAGE'
  | 'CONTACTS_SET'
  | 'CONTACTS_UPSERT'
  | 'CONTACTS_UPDATE'
  | 'PRESENCE_UPDATE'
  | 'CHATS_SET'
  | 'CHATS_UPSERT'
  | 'CHATS_UPDATE'
  | 'CHATS_DELETE'
  | 'CONNECTION_UPDATE'
  | 'CALL'
  | 'GROUPS_UPSERT'
  | 'GROUPS_UPDATE'
  | 'GROUP_PARTICIPANTS_UPDATE'
  | 'QRCODE_UPDATED'
