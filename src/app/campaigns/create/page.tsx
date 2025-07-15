'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Channel = 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'email' | 'sms'

interface CampaignStep {
  id: number
  name: string
  description: string
  completed: boolean
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Campaign data
  const [campaignName, setCampaignName] = useState('')
  const [campaignType, setCampaignType] = useState<'immediate' | 'scheduled' | 'recurring'>('immediate')
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([])
  const [targetAudience, setTargetAudience] = useState<'all' | 'segment' | 'custom'>('all')
  const [selectedSegments, setSelectedSegments] = useState<string[]>([])
  const [messageContent, setMessageContent] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [budget, setBudget] = useState('')
  const [budgetPerChannel, setBudgetPerChannel] = useState<Record<Channel, string>>({
    whatsapp: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    email: '',
    sms: ''
  })

  const steps: CampaignStep[] = [
    { id: 1, name: 'Campaign Details', description: 'Name and type', completed: campaignName !== '' },
    { id: 2, name: 'Channels', description: 'Select channels', completed: selectedChannels.length > 0 },
    { id: 3, name: 'Audience', description: 'Target audience', completed: true },
    { id: 4, name: 'Content', description: 'Message content', completed: messageContent !== '' },
    { id: 5, name: 'Schedule', description: 'When to send', completed: true },
    { id: 6, name: 'Review', description: 'Review and launch', completed: false }
  ]

  const channels = [
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬', color: 'bg-green-100 text-green-800', cost: 'KSH 2 per message' },
    { value: 'facebook', label: 'Facebook', icon: '👍', color: 'bg-blue-100 text-blue-800', cost: 'KSH 5 per 1000 reach' },
    { value: 'instagram', label: 'Instagram', icon: '📸', color: 'bg-pink-100 text-pink-800', cost: 'KSH 5 per 1000 reach' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵', color: 'bg-gray-100 text-gray-800', cost: 'KSH 8 per 1000 views' },
    { value: 'email', label: 'Email', icon: '📧', color: 'bg-purple-100 text-purple-800', cost: 'KSH 1 per email' },
    { value: 'sms', label: 'SMS', icon: '💬', color: 'bg-indigo-100 text-indigo-800', cost: 'KSH 1.5 per SMS' }
  ]

  const audienceSegments = [
    { id: 'new', label: 'New Customers', count: 245 },
    { id: 'active', label: 'Active Customers (30 days)', count: 892 },
    { id: 'vip', label: 'VIP Customers (5+ purchases)', count: 156 },
    { id: 'dormant', label: 'Dormant (60+ days)', count: 423 },
    { id: 'high-value', label: 'High Value (KSH 10k+)', count: 78 },
    { id: 'referrals', label: 'Referred Customers', count: 134 }
  ]

  const messageTemplates = [
    { 
      name: 'Flash Sale', 
      content: '🎯 FLASH SALE ALERT! 🎯\n\nGet {{discount}}% OFF on {{product}}!\n\n⏰ Today only!\n📍 Visit us at {{location}}\n📞 Call {{phone}}\n\nDon\'t miss out! Limited stock available.\n\n{{business_name}}'
    },
    { 
      name: 'New Arrival', 
      content: '✨ NEW ARRIVAL! ✨\n\n{{product}} is now available!\n\n🎁 Special launch price: KSH {{price}}\n📍 {{location}}\n📞 {{phone}}\n\nBe the first to get yours!\n\n{{business_name}}'
    },
    { 
      name: 'Customer Appreciation', 
      content: '❤️ Thank You {{customer_name}}! ❤️\n\nAs a valued customer, enjoy {{discount}}% OFF your next purchase!\n\nUse code: {{code}}\nValid until: {{expiry}}\n\n📍 {{location}}\n📞 {{phone}}\n\n{{business_name}}'
    }
  ]

  const handleChannelToggle = (channel: Channel) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    )
  }

  const handleSegmentToggle = (segmentId: string) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId) 
        ? prev.filter(s => s !== segmentId)
        : [...prev, segmentId]
    )
  }

  const getTotalAudience = () => {
    if (targetAudience === 'all') return 1892
    if (targetAudience === 'segment') {
      return audienceSegments
        .filter(s => selectedSegments.includes(s.id))
        .reduce((sum, s) => sum + s.count, 0)
    }
    return 0
  }

  const getEstimatedCost = () => {
    const audience = getTotalAudience()
    let totalCost = 0

    selectedChannels.forEach(channel => {
      switch (channel) {
        case 'whatsapp':
        case 'sms':
          totalCost += audience * (channel === 'whatsapp' ? 2 : 1.5)
          break
        case 'email':
          totalCost += audience * 1
          break
        case 'facebook':
        case 'instagram':
          totalCost += (audience / 1000) * 5
          break
        case 'tiktok':
          totalCost += (audience / 1000) * 8
          break
      }
    })

    return Math.round(totalCost)
  }

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleLaunchCampaign = () => {
    // In a real app, this would save to database
    console.log('Launching campaign:', {
      campaignName,
      campaignType,
      selectedChannels,
      targetAudience,
      selectedSegments,
      messageContent,
      scheduleDate,
      scheduleTime,
      budget
    })
    
    // Redirect to campaigns page
    router.push('/campaigns')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/campaigns"
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Create Campaign</h1>
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              Save as Draft
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className={stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20 relative' : 'relative'}>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 w-full h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: currentStep > step.id ? '100%' : '0%' }}
                    />
                  </div>
                )}
                <div className="relative flex items-center group">
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep > step.id
                        ? 'bg-blue-600 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-600'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </span>
                  <span className="ml-3 text-sm font-medium text-gray-900 hidden sm:block">{step.name}</span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">{steps[currentStep - 1].name}</h2>
            <p className="mt-1 text-sm text-gray-500">{steps[currentStep - 1].description}</p>
          </div>

          <div className="px-6 py-6">
            {/* Step 1: Campaign Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Weekend Flash Sale"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Type
                  </label>
                  <div className="space-y-3">
                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                      campaignType === 'immediate' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="campaignType"
                        value="immediate"
                        checked={campaignType === 'immediate'}
                        onChange={(e) => setCampaignType(e.target.value as any)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Send Immediately</p>
                        <p className="text-sm text-gray-500">Campaign will be sent as soon as you launch it</p>
                      </div>
                    </label>

                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                      campaignType === 'scheduled' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="campaignType"
                        value="scheduled"
                        checked={campaignType === 'scheduled'}
                        onChange={(e) => setCampaignType(e.target.value as any)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Schedule for Later</p>
                        <p className="text-sm text-gray-500">Set a specific date and time to send</p>
                      </div>
                    </label>

                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                      campaignType === 'recurring' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="campaignType"
                        value="recurring"
                        checked={campaignType === 'recurring'}
                        onChange={(e) => setCampaignType(e.target.value as any)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Recurring Campaign</p>
                        <p className="text-sm text-gray-500">Send automatically on a regular schedule</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Channels */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select channels to use for this campaign
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {channels.map(channel => (
                      <label
                        key={channel.value}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
                          selectedChannels.includes(channel.value as Channel)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedChannels.includes(channel.value as Channel)}
                            onChange={() => handleChannelToggle(channel.value as Channel)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-2xl mr-3">{channel.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{channel.label}</p>
                            <p className="text-sm text-gray-500">{channel.cost}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedChannels.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Selected channels:</span> {selectedChannels.length}
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      Messages will be customized for each platform automatically
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Audience */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Who should receive this campaign?
                  </label>
                  <div className="space-y-3">
                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                      targetAudience === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="targetAudience"
                        value="all"
                        checked={targetAudience === 'all'}
                        onChange={(e) => setTargetAudience(e.target.value as any)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">All Customers</p>
                        <p className="text-sm text-gray-500">Send to your entire customer base (1,892 contacts)</p>
                      </div>
                    </label>

                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                      targetAudience === 'segment' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="targetAudience"
                        value="segment"
                        checked={targetAudience === 'segment'}
                        onChange={(e) => setTargetAudience(e.target.value as any)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Specific Segments</p>
                        <p className="text-sm text-gray-500">Choose customer segments to target</p>
                      </div>
                    </label>

                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                      targetAudience === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="targetAudience"
                        value="custom"
                        checked={targetAudience === 'custom'}
                        onChange={(e) => setTargetAudience(e.target.value as any)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Custom List</p>
                        <p className="text-sm text-gray-500">Upload a CSV file with specific contacts</p>
                      </div>
                    </label>
                  </div>
                </div>

                {targetAudience === 'segment' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select segments
                    </label>
                    <div className="space-y-2">
                      {audienceSegments.map(segment => (
                        <label
                          key={segment.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                            selectedSegments.includes(segment.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedSegments.includes(segment.id)}
                              onChange={() => handleSegmentToggle(segment.id)}
                              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{segment.label}</p>
                              <p className="text-sm text-gray-500">{segment.count} customers</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">
                    Total audience: {getTotalAudience().toLocaleString()} customers
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Estimated cost: KSH {getEstimatedCost().toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Content */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Templates
                  </label>
                  <div className="space-y-2 mb-4">
                    {messageTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => setMessageContent(template.content)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50"
                      >
                        <p className="font-medium text-gray-900">{template.name}</p>
                        <p className="text-sm text-gray-500 truncate">{template.content.split('\n')[0]}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content
                  </label>
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Character count: {messageContent.length} | SMS segments: {Math.ceil(messageContent.length / 160)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Variables
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['{{customer_name}}', '{{business_name}}', '{{location}}', '{{phone}}', '{{product}}', '{{discount}}', '{{price}}'].map(variable => (
                      <button
                        key={variable}
                        onClick={() => setMessageContent(prev => prev + ' ' + variable)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">💡 Pro Tip</p>
                  <p className="text-sm text-blue-800">
                    Personalized messages with customer names get 35% higher engagement rates
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Schedule */}
            {currentStep === 5 && (
              <div className="space-y-6">
                {campaignType === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      When should this campaign be sent?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Date</label>
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Time</label>
                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {campaignType === 'recurring' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Recurring Schedule
                    </label>
                    <select
                      value={recurringPattern}
                      onChange={(e) => setRecurringPattern(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Campaign Budget (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">KSH</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="0"
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Estimated cost for this campaign: KSH {getEstimatedCost().toLocaleString()}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-900 mb-2">⏰ Best Times to Send</p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Weekdays: 9-11 AM, 2-4 PM, 6-8 PM</li>
                    <li>• Weekends: 10 AM-12 PM, 4-7 PM</li>
                    <li>• Avoid: Late nights and early mornings</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Campaign Name</p>
                    <p className="font-medium text-gray-900">{campaignName || 'Untitled Campaign'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium text-gray-900 capitalize">{campaignType}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Channels</p>
                    <div className="flex gap-2 mt-1">
                      {selectedChannels.map(channel => (
                        <span key={channel} className="text-lg">
                          {channels.find(c => c.value === channel)?.icon}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Target Audience</p>
                    <p className="font-medium text-gray-900">
                      {getTotalAudience().toLocaleString()} customers
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Message Preview</p>
                    <div className="mt-1 p-3 bg-white border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {messageContent || 'No message content'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Estimated Cost</p>
                    <p className="font-medium text-gray-900">KSH {getEstimatedCost().toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900 mb-2">✅ Ready to Launch!</p>
                  <p className="text-sm text-green-800">
                    Your campaign is ready. Click "Launch Campaign" to start sending messages to your customers.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/campaigns')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              
              {currentStep < 6 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleLaunchCampaign}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm"
                >
                  Launch Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}