'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface DashboardMetrics {
  totalRevenue: number
  activeConversations: number
  newLeads: number
  conversionRate: number
  revenueGrowth: number
  conversationGrowth: number
  leadGrowth: number
  conversionGrowth: number
  topChannels: Array<{
    channel: string
    count: number
    percentage: number
  }>
  recentActivity: Array<{
    id: string
    type: 'conversation' | 'lead' | 'sale' | 'campaign'
    message: string
    timestamp: string
  }>
}

export function useRealtimeMetrics(tenantId: string) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    activeConversations: 0,
    newLeads: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    conversationGrowth: 0,
    leadGrowth: 0,
    conversionGrowth: 0,
    topChannels: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let metricsChannel: RealtimeChannel | null = null
    let activityChannel: RealtimeChannel | null = null

    const fetchMetrics = async () => {
      try {
        // Fetch aggregated metrics
        const [revenueData, conversationsData, leadsData] = await Promise.all([
          // Revenue metrics
          supabase
            .from('orders')
            .select('amount')
            .eq('tenant_id', tenantId)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

          // Active conversations
          supabase
            .from('conversations')
            .select('id, channel')
            .eq('tenant_id', tenantId)
            .eq('status', 'active'),

          // New leads
          supabase
            .from('leads')
            .select('id')
            .eq('tenant_id', tenantId)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        ])

        // Calculate metrics
        const totalRevenue = revenueData.data?.reduce((sum, order) => sum + order.amount, 0) || 0
        const activeConversations = conversationsData.data?.length || 0
        const newLeads = leadsData.data?.length || 0

        // Calculate channel distribution
        const channelCounts = conversationsData.data?.reduce((acc, conv) => {
          acc[conv.channel] = (acc[conv.channel] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        const totalChannelCount = Object.values(channelCounts).reduce((sum, count) => sum + count, 0)
        const topChannels = Object.entries(channelCounts)
          .map(([channel, count]) => ({
            channel,
            count,
            percentage: (count / totalChannelCount) * 100
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4)

        // Fetch recent activity
        const { data: activityData } = await supabase
          .from('activity_log')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(10)

        const recentActivity = activityData?.map(activity => ({
          id: activity.id,
          type: activity.type,
          message: activity.message,
          timestamp: activity.created_at
        })) || []

        // Calculate conversion rate (simplified - leads to customers)
        const { count: totalLeadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)

        const { count: convertedLeadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'won')

        const conversionRate = totalLeadsCount ? (convertedLeadsCount || 0) / totalLeadsCount * 100 : 0

        // TODO: Calculate growth percentages (would require historical data)
        setMetrics({
          totalRevenue,
          activeConversations,
          newLeads,
          conversionRate,
          revenueGrowth: 12.5, // Placeholder
          conversationGrowth: 8.3, // Placeholder
          leadGrowth: 15.7, // Placeholder
          conversionGrowth: 3.2, // Placeholder
          topChannels,
          recentActivity
        })

        setLoading(false)
      } catch (err) {
        console.error('Metrics fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load metrics')
        setLoading(false)
      }
    }

    const setupRealtime = async () => {
      await fetchMetrics()

      // Subscribe to conversation updates
      metricsChannel = supabase
        .channel(`metrics:${tenantId}`)
        .on(
          'postgres_changes' as any,
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `tenant_id=eq.${tenantId}`
          },
          () => {
            // Refetch metrics when conversations change
            fetchMetrics()
          }
        )
        .on(
          'postgres_changes' as any,
          {
            event: '*',
            schema: 'public',
            table: 'leads',
            filter: `tenant_id=eq.${tenantId}`
          },
          () => {
            // Refetch metrics when leads change
            fetchMetrics()
          }
        )
        .on(
          'postgres_changes' as any,
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `tenant_id=eq.${tenantId}`
          },
          () => {
            // Refetch metrics when orders change
            fetchMetrics()
          }
        )
        .subscribe()

      // Subscribe to activity log updates
      activityChannel = supabase
        .channel(`activity:${tenantId}`)
        .on(
          'postgres_changes' as any,
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_log',
            filter: `tenant_id=eq.${tenantId}`
          },
          (payload: any) => {
            // Add new activity to the front of the list
            setMetrics(prev => ({
              ...prev,
              recentActivity: [
                {
                  id: payload.new.id,
                  type: payload.new.type,
                  message: payload.new.message,
                  timestamp: payload.new.created_at
                },
                ...prev.recentActivity.slice(0, 9) // Keep only 10 items
              ]
            }))
          }
        )
        .subscribe()
    }

    setupRealtime()

    // Cleanup
    return () => {
      if (metricsChannel) supabase.removeChannel(metricsChannel)
      if (activityChannel) supabase.removeChannel(activityChannel)
    }
  }, [tenantId])

  return { metrics, loading, error }
}