import { createClient } from '@supabase/supabase-js'

// Create Supabase client lazily to avoid build-time errors
let supabase: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!url || !key) {
      throw new Error('Supabase environment variables are not set')
    }
    
    supabase = createClient(url, key)
  }
  return supabase
}

export interface ConversationMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  metadata?: Record<string, any>
}

export interface Conversation {
  id: string
  tenant_id: string
  customer_id: string
  channel: 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'web'
  status: 'active' | 'waiting' | 'resolved'
  messages: ConversationMessage[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  tenant_id: string
  phone?: string
  email?: string
  name?: string
  metadata: Record<string, any>
  created_at: string
}

export class ConversationService {
  // Find or create customer
  async findOrCreateCustomer(
    tenantId: string,
    phone?: string,
    email?: string,
    name?: string
  ): Promise<Customer> {
    try {
      // First try to find existing customer
      let query = getSupabaseClient()
        .from('customers')
        .select('*')
        .eq('tenant_id', tenantId)

      if (phone) {
        query = query.eq('phone', phone)
      } else if (email) {
        query = query.eq('email', email)
      }

      const { data: existingCustomer, error: findError } = await query.single()

      if (existingCustomer && !findError) {
        return existingCustomer as unknown as Customer
      }

      // Create new customer
      const { data: newCustomer, error: createError } = await getSupabaseClient()
        .from('customers')
        .insert({
          tenant_id: tenantId,
          phone,
          email,
          name: name || 'Unknown Customer',
          metadata: {}
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      return newCustomer as unknown as Customer
    } catch (error) {
      console.error('Error finding/creating customer:', error)
      throw error
    }
  }

  // Find or create conversation
  async findOrCreateConversation(
    tenantId: string,
    customerId: string,
    channel: string
  ): Promise<Conversation> {
    try {
      // Find active conversation
      const { data: existingConversation, error: findError } = await getSupabaseClient()
        .from('conversations')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('customer_id', customerId)
        .eq('channel', channel)
        .eq('status', 'active')
        .single()

      if (existingConversation && !findError) {
        return existingConversation as unknown as Conversation
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await getSupabaseClient()
        .from('conversations')
        .insert({
          tenant_id: tenantId,
          customer_id: customerId,
          channel,
          status: 'active',
          messages: [],
          metadata: {}
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      return newConversation as unknown as Conversation
    } catch (error) {
      console.error('Error finding/creating conversation:', error)
      throw error
    }
  }

  // Add message to conversation
  async addMessage(
    conversationId: string,
    message: ConversationMessage
  ): Promise<void> {
    try {
      // Get current conversation
      const { data: conversation, error: getError } = await getSupabaseClient()
        .from('conversations')
        .select('messages')
        .eq('id', conversationId)
        .single()

      if (getError) {
        throw getError
      }

      // Add new message to array
      const updatedMessages = [...((conversation as any).messages || []), message]

      // Update conversation
      const { error: updateError } = await getSupabaseClient()
        .from('conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (updateError) {
        throw updateError
      }
    } catch (error) {
      console.error('Error adding message to conversation:', error)
      throw error
    }
  }

  // Get recent conversations for dashboard
  async getRecentConversations(
    tenantId: string,
    limit: number = 10
  ): Promise<Conversation[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('conversations')
        .select(`
          *,
          customers (
            name,
            phone,
            email
          )
        `)
        .eq('tenant_id', tenantId)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return (data || []) as unknown as Conversation[]
    } catch (error) {
      console.error('Error getting recent conversations:', error)
      throw error
    }
  }

  // Get conversation statistics
  async getConversationStats(tenantId: string) {
    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisWeek = new Date(today)
      thisWeek.setDate(thisWeek.getDate() - 7)
      const thisMonth = new Date(today)
      thisMonth.setMonth(thisMonth.getMonth() - 1)

      // Get counts for different periods
      const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
        getSupabaseClient()
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('created_at', today.toISOString()),
        getSupabaseClient()
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('created_at', thisWeek.toISOString()),
        getSupabaseClient()
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('created_at', thisMonth.toISOString()),
        getSupabaseClient()
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
      ])

      return {
        today: todayCount.count || 0,
        thisWeek: weekCount.count || 0,
        thisMonth: monthCount.count || 0,
        total: totalCount.count || 0
      }
    } catch (error) {
      console.error('Error getting conversation stats:', error)
      throw error
    }
  }

  // Update conversation status
  async updateConversationStatus(
    conversationId: string,
    status: 'active' | 'waiting' | 'resolved'
  ): Promise<void> {
    try {
      const { error } = await getSupabaseClient()
        .from('conversations')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error updating conversation status:', error)
      throw error
    }
  }
}

// Export a lazy-initialized service to avoid build-time errors
let _conversationService: ConversationService | null = null

export function getConversationService() {
  if (!_conversationService) {
    _conversationService = new ConversationService()
  }
  return _conversationService
}

// For backward compatibility
export const conversationService = {
  findOrCreateCustomer: (...args: Parameters<ConversationService['findOrCreateCustomer']>) => 
    getConversationService().findOrCreateCustomer(...args),
  findOrCreateConversation: (...args: Parameters<ConversationService['findOrCreateConversation']>) => 
    getConversationService().findOrCreateConversation(...args),
  addMessage: (...args: Parameters<ConversationService['addMessage']>) => 
    getConversationService().addMessage(...args),
  getRecentConversations: (...args: Parameters<ConversationService['getRecentConversations']>) => 
    getConversationService().getRecentConversations(...args),
  getConversationStats: (...args: Parameters<ConversationService['getConversationStats']>) => 
    getConversationService().getConversationStats(...args),
  updateConversationStatus: (...args: Parameters<ConversationService['updateConversationStatus']>) => 
    getConversationService().updateConversationStatus(...args)
}