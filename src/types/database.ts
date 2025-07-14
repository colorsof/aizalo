/**
 * Database type definitions for our multitenant platform
 * These types help TypeScript understand our database structure
 */

export type TenantIndustry = 
  | 'hotel' 
  | 'hardware_store' 
  | 'law_firm'
  | 'auto_parts'
  | 'restaurant'
  | 'pharmacy'
  | 'supermarket'
  | 'clinic'
  | 'gym'
  | 'salon'
  | 'real_estate'

export interface Tenant {
  id: string
  name: string
  industry_type: TenantIndustry
  subdomain: string
  settings: {
    branding?: {
      logo?: string
      primary_color?: string
      secondary_color?: string
    }
    features?: {
      whatsapp_enabled: boolean
      facebook_enabled: boolean
      google_enabled: boolean
      ai_assistant_enabled: boolean
    }
    ai_config?: {
      personality?: string
      language?: string[]
      custom_responses?: Record<string, string>
    }
  }
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  tenant_id: string
  email: string
  full_name: string
  role: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AIConversation {
  id: string
  tenant_id: string
  customer_phone?: string
  customer_email?: string
  channel: 
    | 'whatsapp' 
    | 'facebook' 
    | 'web_chat' 
    | 'email'
    | 'tiktok'
    | 'instagram'
    | 'telegram'
    | 'sms'
    | 'x_twitter'
    | 'linkedin'
    | 'youtube'
  messages: {
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }[]
  status: 'active' | 'resolved' | 'escalated'
  created_at: string
  updated_at: string
}