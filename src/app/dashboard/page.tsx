'use client'

import { useState, useEffect } from 'react'
import MetricCard from '@/components/dashboard/MetricCard'
import ConversationList from '@/components/dashboard/ConversationList'
import QuickActions from '@/components/dashboard/QuickActions'
import RevenueChart from '@/components/dashboard/RevenueChart'
import NotificationsDropdown from '@/components/dashboard/NotificationsDropdown'
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics'
import { useRealtimeConversations } from '@/hooks/useRealtimeConversations'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [tenantId] = useState('test-tenant-id') // In production, get from auth context
  const [userId] = useState('test-user-id') // In production, get from auth context
  
  // Real-time data hooks
  const { metrics, loading: metricsLoading } = useRealtimeMetrics(tenantId)
  const { conversations, loading: conversationsLoading } = useRealtimeConversations(tenantId)
  const { notifications, unreadCount, markAsRead, markAllAsRead, requestPermission } = useRealtimeNotifications(userId)
  
  // Request notification permission on mount
  useEffect(() => {
    requestPermission()
  }, [requestPermission])
  
  // Transform metrics for display
  const displayMetrics = {
    conversations: {
      total: metrics.activeConversations,
      change: { value: metrics.conversationGrowth, trend: metrics.conversationGrowth > 0 ? 'up' as const : 'down' as const }
    },
    leads: {
      total: metrics.newLeads,
      change: { value: metrics.leadGrowth, trend: metrics.leadGrowth > 0 ? 'up' as const : 'down' as const }
    },
    revenue: {
      total: `KSH ${metrics.totalRevenue.toLocaleString()}`,
      change: { value: metrics.revenueGrowth, trend: metrics.revenueGrowth > 0 ? 'up' as const : 'down' as const }
    },
    conversionRate: {
      total: `${metrics.conversionRate.toFixed(1)}%`,
      change: { value: metrics.conversionGrowth, trend: metrics.conversionGrowth > 0 ? 'up' as const : 'down' as const }
    }
  }
  
  // Transform conversations for display
  const displayConversations = conversations.slice(0, 5).map(conv => ({
    id: conv.id,
    customerName: conv.customer_name,
    lastMessage: conv.last_message,
    timestamp: conv.last_message_time,
    channel: conv.channel as 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'web',
    unread: conv.unread_count > 0,
    status: conv.status
  }))
  
  // Mock revenue data for now - will be replaced with real data
  const revenueData = [
    { month: 'Jan', revenue: 85000, leads: 120 },
    { month: 'Feb', revenue: 92000, leads: 135 },
    { month: 'Mar', revenue: 78000, leads: 110 },
    { month: 'Apr', revenue: 105000, leads: 165 },
    { month: 'May', revenue: 118000, leads: 180 },
    { month: 'Jun', revenue: metrics.totalRevenue || 125000, leads: 195 }
  ]

  const quickActions = [
    {
      label: 'Send Campaign',
      description: 'Create and send a marketing campaign',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      onClick: () => window.location.href = '/content',
      color: 'bg-blue-500'
    },
    {
      label: 'Add Integration',
      description: 'Connect a new channel',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => console.log('Add integration'),
      color: 'bg-green-500'
    },
    {
      label: 'View Reports',
      description: 'Detailed analytics and insights',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: () => console.log('View reports'),
      color: 'bg-purple-500'
    },
    {
      label: 'Invite Team',
      description: 'Add team members to your account',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      onClick: () => console.log('Invite team'),
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Aizalo Dashboard</h1>
            </div>
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-4">
                <a href="/dashboard" className="text-gray-900 font-medium">Dashboard</a>
                <a href="/leads" className="text-gray-600 hover:text-gray-900">Leads</a>
                <a href="/content" className="text-gray-600 hover:text-gray-900">Content</a>
                <a href="/conversations" className="text-gray-600 hover:text-gray-900">Conversations</a>
              </nav>
              <div className="flex items-center space-x-4">
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Time period selector"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <NotificationsDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />
                <button type="button" className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                  <div className="h-8 w-8 rounded-full bg-gray-300 mr-2"></div>
                  <span>Bernard K.</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 sm:px-0 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, Bernard!</h2>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Loading State */}
        {(metricsLoading || conversationsLoading) && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading real-time data...</span>
          </div>
        )}
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            title="Active Conversations"
            value={displayMetrics.conversations.total}
            change={displayMetrics.conversations.change}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            color="blue"
            action={{ label: 'View all', href: '/conversations' }}
          />
          <MetricCard
            title="New Leads"
            value={displayMetrics.leads.total}
            change={displayMetrics.leads.change}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="green"
            action={{ label: 'Manage leads', href: '/leads' }}
          />
          <MetricCard
            title="Revenue Generated"
            value={displayMetrics.revenue.total}
            change={displayMetrics.revenue.change}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="yellow"
            action={{ label: 'View reports', href: '/reports' }}
          />
          <MetricCard
            title="Conversion Rate"
            value={displayMetrics.conversionRate.total}
            change={displayMetrics.conversionRate.change}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            color="red"
            action={{ label: 'Optimize', href: '/optimize' }}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Conversations List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ConversationList 
              conversations={displayConversations}
              onConversationClick={(id) => window.location.href = `/conversations?id=${id}`}
            />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div className="space-y-6">
            <QuickActions actions={quickActions} />
          </div>
        </div>

        {/* Revenue Chart - Full width */}
        <div className="mt-8">
          <RevenueChart data={revenueData} />
        </div>

        {/* Active Campaigns Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Active Campaigns</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Weekend Special Offer</p>
                    <p className="text-sm text-gray-500">WhatsApp broadcast • 1,234 recipients</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                  <button type="button" className="text-gray-400 hover:text-gray-600" aria-label="Campaign options">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New Product Launch</p>
                    <p className="text-sm text-gray-500">Email campaign • 567 recipients</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Scheduled
                  </span>
                  <button type="button" className="text-gray-400 hover:text-gray-600" aria-label="Campaign options">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity Feed */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {metrics.recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent activity</p>
                ) : (
                  metrics.recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'conversation' && (
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </div>
                        )}
                        {activity.type === 'lead' && (
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        {activity.type === 'sale' && (
                          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                        {activity.type === 'campaign' && (
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}