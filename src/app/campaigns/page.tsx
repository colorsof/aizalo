'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused'
  channels: Array<'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'email' | 'sms'>
  startDate: string
  endDate?: string
  targetAudience: string
  budget?: number
  spent?: number
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
  }
  createdAt: string
}

export default function CampaignsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock data - will be replaced with real data from Supabase
  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Weekend Flash Sale',
      status: 'active',
      channels: ['whatsapp', 'facebook', 'instagram'],
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      targetAudience: 'All customers',
      budget: 50000,
      spent: 23500,
      metrics: {
        sent: 1234,
        delivered: 1180,
        opened: 892,
        clicked: 234,
        converted: 45
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
    },
    {
      id: '2',
      name: 'New Product Launch - Smart TVs',
      status: 'scheduled',
      channels: ['whatsapp', 'email', 'tiktok'],
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      targetAudience: 'Tech enthusiasts, Previous electronics buyers',
      budget: 75000,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: '3',
      name: 'Customer Appreciation Month',
      status: 'completed',
      channels: ['whatsapp', 'facebook'],
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      targetAudience: 'Loyal customers (3+ purchases)',
      budget: 30000,
      spent: 28750,
      metrics: {
        sent: 567,
        delivered: 545,
        opened: 423,
        clicked: 178,
        converted: 67
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString()
    }
  ]

  const statuses = [
    { value: 'all', label: 'All Campaigns', count: campaigns.length },
    { value: 'draft', label: 'Draft', count: campaigns.filter(c => c.status === 'draft').length, color: 'bg-gray-100 text-gray-800' },
    { value: 'scheduled', label: 'Scheduled', count: campaigns.filter(c => c.status === 'scheduled').length, color: 'bg-blue-100 text-blue-800' },
    { value: 'active', label: 'Active', count: campaigns.filter(c => c.status === 'active').length, color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', count: campaigns.filter(c => c.status === 'completed').length, color: 'bg-gray-100 text-gray-800' },
    { value: 'paused', label: 'Paused', count: campaigns.filter(c => c.status === 'paused').length, color: 'bg-yellow-100 text-yellow-800' }
  ]

  const channelIcons: Record<string, { icon: string, color: string }> = {
    whatsapp: { icon: '💬', color: 'text-green-600' },
    facebook: { icon: '👍', color: 'text-blue-600' },
    instagram: { icon: '📸', color: 'text-pink-600' },
    tiktok: { icon: '🎵', color: 'text-black' },
    email: { icon: '📧', color: 'text-gray-600' },
    sms: { icon: '💬', color: 'text-purple-600' }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus
    const matchesSearch = searchQuery === '' || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.targetAudience.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const calculateROI = (campaign: Campaign) => {
    if (!campaign.spent || campaign.spent === 0) return 0
    const revenue = campaign.metrics.converted * 5000 // Assuming average order value
    return Math.round(((revenue - campaign.spent) / campaign.spent) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
              <p className="mt-1 text-sm text-gray-600">Create and manage marketing campaigns across all channels</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Campaigns</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {campaigns.filter(c => c.status === 'active').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Reach</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {campaigns.reduce((sum, c) => sum + c.metrics.sent, 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Open Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Math.round(
                        campaigns.reduce((sum, c) => sum + (c.metrics.opened / c.metrics.delivered || 0), 0) / 
                        campaigns.filter(c => c.metrics.delivered > 0).length * 100
                      )}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      KSH {campaigns.reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {statuses.map(status => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === status.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {status.label} ({status.count})
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => (
              <li key={campaign.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                            <span>{campaign.targetAudience}</span>
                            <span>•</span>
                            <span>Created {format(new Date(campaign.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statuses.find(s => s.value === campaign.status)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {statuses.find(s => s.value === campaign.status)?.label}
                        </span>
                      </div>

                      {/* Channels */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-500">Channels:</span>
                        {campaign.channels.map((channel, index) => (
                          <span key={index} className="text-lg" title={channel}>
                            {channelIcons[channel]?.icon}
                          </span>
                        ))}
                      </div>

                      {/* Metrics */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Sent</p>
                          <p className="font-medium text-gray-900">{campaign.metrics.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Delivered</p>
                          <p className="font-medium text-gray-900">{campaign.metrics.delivered.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Opened</p>
                          <p className="font-medium text-gray-900">
                            {campaign.metrics.opened.toLocaleString()}
                            {campaign.metrics.delivered > 0 && (
                              <span className="text-gray-500 ml-1">
                                ({Math.round((campaign.metrics.opened / campaign.metrics.delivered) * 100)}%)
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Clicked</p>
                          <p className="font-medium text-gray-900">
                            {campaign.metrics.clicked.toLocaleString()}
                            {campaign.metrics.opened > 0 && (
                              <span className="text-gray-500 ml-1">
                                ({Math.round((campaign.metrics.clicked / campaign.metrics.opened) * 100)}%)
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Converted</p>
                          <p className="font-medium text-gray-900">
                            {campaign.metrics.converted.toLocaleString()}
                            {campaign.metrics.clicked > 0 && (
                              <span className="text-gray-500 ml-1">
                                ({Math.round((campaign.metrics.converted / campaign.metrics.clicked) * 100)}%)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Budget and Schedule */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm">
                          {campaign.budget && (
                            <div>
                              <span className="text-gray-500">Budget:</span>
                              <span className="font-medium text-gray-900 ml-1">
                                KSH {campaign.budget.toLocaleString()}
                              </span>
                              {campaign.spent !== undefined && (
                                <span className="text-gray-500 ml-1">
                                  ({Math.round((campaign.spent / campaign.budget) * 100)}% spent)
                                </span>
                              )}
                            </div>
                          )}
                          {campaign.spent !== undefined && campaign.spent > 0 && (
                            <div>
                              <span className="text-gray-500">ROI:</span>
                              <span className={`font-medium ml-1 ${
                                calculateROI(campaign) > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {calculateROI(campaign) > 0 ? '+' : ''}{calculateROI(campaign)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Details
                          </button>
                          <span className="text-gray-300">|</span>
                          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                            Edit
                          </button>
                          {campaign.status === 'active' && (
                            <>
                              <span className="text-gray-300">|</span>
                              <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                                Pause
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {filteredCampaigns.length === 0 && (
            <div className="px-4 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No campaigns found</h3>
              <p className="text-gray-500">Get started by creating your first campaign</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Create Campaign
              </button>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Campaign Best Practices</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Schedule campaigns during peak engagement hours (6-9 PM for Kenya)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Use A/B testing to optimize your message content and timing</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Segment your audience for better targeting and higher conversion rates</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Always include a clear call-to-action in your messages</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Create New Campaign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Ready to create your campaign?</p>
                  <Link
                    href="/campaigns/create"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Campaign Builder
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}