'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Conversation {
  id: string
  customer_name: string
  customer_phone: string
  channel: string
  last_message: string
  last_message_time: string
  status: 'active' | 'waiting' | 'resolved'
  unread_count: number
  sentiment?: 'positive' | 'neutral' | 'negative'
}

interface RealtimeUpdate {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Conversation | null
  old: Conversation | null
}

export function useRealtimeConversations(tenantId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel | null = null

    const setupRealtime = async () => {
      try {
        // Initial data fetch
        const { data, error: fetchError } = await supabase
          .from('conversations')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('last_message_time', { ascending: false })

        if (fetchError) throw fetchError

        setConversations(data || [])
        setLoading(false)

        // Set up realtime subscription
        channel = supabase
          .channel(`conversations:${tenantId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'conversations',
              filter: `tenant_id=eq.${tenantId}`
            },
            (payload: RealtimeUpdate) => {
              handleRealtimeUpdate(payload)
            }
          )
          .subscribe()

      } catch (err) {
        console.error('Realtime setup error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load conversations')
        setLoading(false)
      }
    }

    const handleRealtimeUpdate = (payload: RealtimeUpdate) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        setConversations(prev => [payload.new!, ...prev])
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setConversations(prev => 
          prev.map(conv => conv.id === payload.new!.id ? payload.new! : conv)
            .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime())
        )
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setConversations(prev => prev.filter(conv => conv.id !== payload.old!.id))
      }
    }

    setupRealtime()

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [tenantId])

  return { conversations, loading, error }
}