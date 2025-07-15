'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import ChatInterface from '@/components/chat/ChatInterface'

interface Conversation {
  id: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  lastMessage: string
  lastMessageTime: string
  channel: 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'web'
  status: 'active' | 'waiting' | 'resolved'
  unreadCount: number
  messages: Array<{
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: string
    status?: 'sending' | 'sent' | 'delivered' | 'read'
  }>
}

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - will be replaced with real data from Supabase
  const conversations: Conversation[] = [
    {
      id: '1',
      customerName: 'John Kamau',
      customerPhone: '+254712345678',
      lastMessage: 'How much for 50 bags of cement?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      channel: 'whatsapp',
      status: 'active',
      unreadCount: 2,
      messages: [
        {
          id: 'm1',
          content: 'Hello, I need some construction materials',
          role: 'user',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          status: 'read'
        },
        {
          id: 'm2',
          content: 'Hello! Welcome to our store. I\'m here to help you with all your construction needs. What materials are you looking for?',
          role: 'assistant',
          timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
          status: 'delivered'
        },
        {
          id: 'm3',
          content: 'How much for 50 bags of cement?',
          role: 'user',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          status: 'read'
        }
      ]
    },
    {
      id: '2',
      customerName: 'Mary Wanjiru',
      customerEmail: 'mary.w@example.com',
      lastMessage: 'Thank you! I\'ll come tomorrow to collect.',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      channel: 'facebook',
      status: 'resolved',
      unreadCount: 0,
      messages: [
        {
          id: 'm4',
          content: 'Hi, do you have paint in stock?',
          role: 'user',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          status: 'read'
        },
        {
          id: 'm5',
          content: 'Yes! We have a wide variety of paints. What type are you looking for? Interior, exterior, or specialty paints?',
          role: 'assistant',
          timestamp: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
          status: 'read'
        },
        {
          id: 'm6',
          content: 'Interior paint, white, 20 liters',
          role: 'user',
          timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
          status: 'read'
        },
        {
          id: 'm7',
          content: 'We have Crown Paint interior white at Ksh 3,500 for 20L. We also have cheaper options starting from Ksh 2,800. Which would you prefer?',
          role: 'assistant',
          timestamp: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
          status: 'read'
        },
        {
          id: 'm8',
          content: 'I\'ll take the Crown Paint. Can I pick it up today?',
          role: 'user',
          timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          status: 'read'
        },
        {
          id: 'm9',
          content: 'Absolutely! We\'re open until 6 PM today. I\'ll reserve one for you. Just ask for order #CR2024-001 at the counter.',
          role: 'assistant',
          timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
          status: 'read'
        },
        {
          id: 'm10',
          content: 'Thank you! I\'ll come tomorrow to collect.',
          role: 'user',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'read'
        }
      ]
    },
    {
      id: '3',
      customerName: 'Grace Njeri',
      customerPhone: '+254720123456',
      lastMessage: 'Do you deliver to Kiambu?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      channel: 'tiktok',
      status: 'waiting',
      unreadCount: 1,
      messages: [
        {
          id: 'm11',
          content: 'Saw your TikTok video! Do you deliver to Kiambu?',
          role: 'user',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          status: 'delivered'
        }
      ]
    }
  ]

  const channels = [
    { value: 'all', label: 'All Channels', icon: '📱' },
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { value: 'facebook', label: 'Facebook', icon: '👍' },
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'web', label: 'Web Chat', icon: '🌐' }
  ]

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'waiting', label: 'Waiting', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'resolved', label: 'Resolved', color: 'bg-gray-100 text-gray-800' }
  ]

  const filteredConversations = conversations.filter(conv => {
    const matchesChannel = filterChannel === 'all' || conv.channel === filterChannel
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus
    const matchesSearch = searchQuery === '' || 
      conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customerPhone?.includes(searchQuery) ||
      conv.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesChannel && matchesStatus && matchesSearch
  })

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  const handleSendMessage = async (message: string) => {
    // In a real app, this would send the message via the appropriate channel
    console.log('Sending message:', message)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Conversations List Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Conversations</h1>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {conversations.filter(c => c.status === 'active').length}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalUnread}</p>
              <p className="text-xs text-gray-500">Unread</p>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />

          {/* Filters */}
          <div className="space-y-2">
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {channels.map(channel => (
                <option key={channel.value} value={channel.value}>
                  {channel.icon} {channel.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 text-left transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-900">{conversation.customerName}</h3>
                  <span className="ml-2 text-xs">
                    {channels.find(c => c.value === conversation.channel)?.icon}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 truncate mb-2">{conversation.lastMessage}</p>
              
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  statuses.find(s => s.value === conversation.status)?.color || ''
                }`}>
                  {statuses.find(s => s.value === conversation.status)?.label}
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}

          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedConversation.customerName}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {selectedConversation.customerPhone && (
                      <span>{selectedConversation.customerPhone}</span>
                    )}
                    {selectedConversation.customerEmail && (
                      <span>{selectedConversation.customerEmail}</span>
                    )}
                    <span className="flex items-center">
                      {channels.find(c => c.value === selectedConversation.channel)?.icon}
                      {' '}
                      {channels.find(c => c.value === selectedConversation.channel)?.label}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={selectedConversation.status}
                    onChange={(e) => {
                      // Update conversation status
                      console.log('Update status to:', e.target.value)
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.slice(1).map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1">
              <ChatInterface
                businessName="Your Business"
                businessType="hardware_store"
                initialMessages={selectedConversation.messages}
                onSendMessage={handleSendMessage}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the list to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}