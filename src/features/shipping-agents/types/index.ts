// Shipping Agent Types for freight forwarders and shipping companies

export interface ShippingAgent {
  id: string
  name: string
  address: string
  city: string
  country: string
  postalCode?: string
  contactPerson: string
  contactEmail?: string
  contactPhone: string
  website?: string
  status: 'active' | 'inactive'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type ShippingAgentStatus = ShippingAgent['status']

export interface ShippingAgentFormData {
  name: string
  address: string
  city: string
  country: string
  postalCode?: string
  contactPerson: string
  contactEmail?: string
  contactPhone: string
  website?: string
  status: ShippingAgentStatus
  notes?: string
}

export const SHIPPING_AGENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const
