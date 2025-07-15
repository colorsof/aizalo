'use client'

import { useState } from 'react'

interface BusinessSettings {
  general: {
    businessName: string
    businessType: string
    email: string
    phone: string
    website: string
    address: string
    city: string
    country: string
    timezone: string
    currency: string
    language: string
  }
  whatsapp: {
    phoneNumber: string
    businessPhoneId: string
    accessToken: string
    webhookVerifyToken: string
    greetingMessage: string
    awayMessage: string
    quickReplies: Array<{ text: string; response: string }>
  }
  ai: {
    personalityTone: 'professional' | 'friendly' | 'casual' | 'formal'
    responseSpeed: 'instant' | 'natural' | 'careful'
    priceNegotiation: {
      enabled: boolean
      minDiscount: number
      maxDiscount: number
      autoApproveBelow: number
    }
    knowledgeBase: {
      businessInfo: string
      products: string
      policies: string
      faqs: Array<{ question: string; answer: string }>
    }
  }
  integrations: {
    facebook: {
      connected: boolean
      pageId: string
      pageName: string
    }
    instagram: {
      connected: boolean
      accountId: string
      username: string
    }
    tiktok: {
      connected: boolean
      accountId: string
      username: string
    }
    google: {
      connected: boolean
      businessId: string
      businessName: string
    }
    email: {
      provider: 'resend' | 'sendgrid' | 'mailgun' | ''
      apiKey: string
      fromEmail: string
      fromName: string
    }
  }
  notifications: {
    email: {
      newLead: boolean
      newMessage: boolean
      campaignComplete: boolean
      weeklyReport: boolean
    }
    whatsapp: {
      urgentMessages: boolean
      dailySummary: boolean
    }
  }
  billing: {
    plan: 'starter' | 'growth' | 'scale'
    billingCycle: 'monthly' | 'annual'
    paymentMethod: string
    nextBillingDate: string
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'whatsapp' | 'ai' | 'integrations' | 'notifications' | 'billing'>('general')
  const [settings, setSettings] = useState<BusinessSettings>({
    general: {
      businessName: 'Mama Njeri Hardware',
      businessType: 'hardware_store',
      email: 'info@mamanjeri.co.ke',
      phone: '+254712345678',
      website: 'www.mamanjeri.co.ke',
      address: 'Kenyatta Avenue, Shop 12',
      city: 'Nairobi',
      country: 'Kenya',
      timezone: 'Africa/Nairobi',
      currency: 'KES',
      language: 'en'
    },
    whatsapp: {
      phoneNumber: '+254712345678',
      businessPhoneId: '',
      accessToken: '',
      webhookVerifyToken: '',
      greetingMessage: 'Karibu Mama Njeri Hardware! 🛠️ How can we help you today?',
      awayMessage: 'Thank you for contacting us. We are currently offline but will respond as soon as we\'re back. Our business hours are Mon-Sat 8AM-6PM.',
      quickReplies: [
        { text: 'Check prices', response: 'What items would you like to check prices for?' },
        { text: 'Store location', response: 'We are located at Kenyatta Avenue, Shop 12, Nairobi. Open Mon-Sat 8AM-6PM.' },
        { text: 'Delivery options', response: 'We offer free delivery within Nairobi for orders above KSH 5,000. Same-day delivery available!' }
      ]
    },
    ai: {
      personalityTone: 'friendly',
      responseSpeed: 'natural',
      priceNegotiation: {
        enabled: true,
        minDiscount: 5,
        maxDiscount: 15,
        autoApproveBelow: 10
      },
      knowledgeBase: {
        businessInfo: 'Mama Njeri Hardware is a leading hardware store in Nairobi, serving customers for over 20 years. We stock construction materials, tools, paints, plumbing supplies, and electrical items.',
        products: 'Cement (multiple brands), Iron sheets, Paints (Crown, Sadolin, Dura Coat), Plumbing materials, Electrical supplies, Hand tools, Power tools',
        policies: 'Return policy: 7 days with receipt. Warranty: As per manufacturer. Delivery: Free within Nairobi for orders above KSH 5,000.',
        faqs: [
          { question: 'Do you offer credit?', answer: 'Yes, we offer 30-day credit terms for established customers with orders above KSH 50,000.' },
          { question: 'Can I get a contractor?', answer: 'Yes, we can recommend trusted contractors for your project. Ask our staff for details.' }
        ]
      }
    },
    integrations: {
      facebook: {
        connected: true,
        pageId: '123456789',
        pageName: 'Mama Njeri Hardware'
      },
      instagram: {
        connected: false,
        accountId: '',
        username: ''
      },
      tiktok: {
        connected: false,
        accountId: '',
        username: ''
      },
      google: {
        connected: true,
        businessId: '987654321',
        businessName: 'Mama Njeri Hardware Store'
      },
      email: {
        provider: 'resend',
        apiKey: '',
        fromEmail: 'sales@mamanjeri.co.ke',
        fromName: 'Mama Njeri Hardware'
      }
    },
    notifications: {
      email: {
        newLead: true,
        newMessage: true,
        campaignComplete: true,
        weeklyReport: true
      },
      whatsapp: {
        urgentMessages: true,
        dailySummary: true
      }
    },
    billing: {
      plan: 'growth',
      billingCycle: 'monthly',
      paymentMethod: 'M-Pesa',
      nextBillingDate: '2025-08-15'
    }
  })

  const tabs = [
    { id: 'general', label: 'General', icon: '🏪' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'billing', label: 'Billing', icon: '💳' }
  ]

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant/Hotel' },
    { value: 'hardware_store', label: 'Hardware Store' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'beauty_salon', label: 'Beauty Salon' },
    { value: 'medical', label: 'Medical/Dental' },
    { value: 'tech_shop', label: 'Tech Shop' },
    { value: 'law_firm', label: 'Law Firm' },
    { value: 'car_dealership', label: 'Car Dealership' }
  ]

  const handleSave = () => {
    // In a real app, this would save to the database
    console.log('Saving settings:', settings)
    alert('Settings saved successfully!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your business settings and preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3 text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white shadow rounded-lg">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">General Information</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={settings.general.businessName}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, businessName: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Type
                        </label>
                        <select
                          value={settings.general.businessType}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, businessType: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {businessTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={settings.general.email}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, email: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={settings.general.phone}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, phone: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website
                        </label>
                        <input
                          type="url"
                          value={settings.general.website}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, website: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={settings.general.city}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, city: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Address
                      </label>
                      <textarea
                        value={settings.general.address}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, address: e.target.value }
                        })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Settings */}
              {activeTab === 'whatsapp' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">WhatsApp Configuration</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          WhatsApp Business Number
                        </label>
                        <input
                          type="tel"
                          value={settings.whatsapp.phoneNumber}
                          onChange={(e) => setSettings({
                            ...settings,
                            whatsapp: { ...settings.whatsapp, phoneNumber: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+254712345678"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Greeting Message
                        </label>
                        <textarea
                          value={settings.whatsapp.greetingMessage}
                          onChange={(e) => setSettings({
                            ...settings,
                            whatsapp: { ...settings.whatsapp, greetingMessage: e.target.value }
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">Sent when customers first message you</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Away Message
                        </label>
                        <textarea
                          value={settings.whatsapp.awayMessage}
                          onChange={(e) => setSettings({
                            ...settings,
                            whatsapp: { ...settings.whatsapp, awayMessage: e.target.value }
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">Sent outside business hours</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Replies</h4>
                        <div className="space-y-3">
                          {settings.whatsapp.quickReplies.map((reply, index) => (
                            <div key={index} className="flex gap-3">
                              <input
                                type="text"
                                value={reply.text}
                                onChange={(e) => {
                                  const newReplies = [...settings.whatsapp.quickReplies]
                                  newReplies[index].text = e.target.value
                                  setSettings({
                                    ...settings,
                                    whatsapp: { ...settings.whatsapp, quickReplies: newReplies }
                                  })
                                }}
                                className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Button text"
                              />
                              <input
                                type="text"
                                value={reply.response}
                                onChange={(e) => {
                                  const newReplies = [...settings.whatsapp.quickReplies]
                                  newReplies[index].response = e.target.value
                                  setSettings({
                                    ...settings,
                                    whatsapp: { ...settings.whatsapp, quickReplies: newReplies }
                                  })
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Response message"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">Note:</span> Advanced WhatsApp API settings require verification from Meta. Contact support for assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Settings */}
              {activeTab === 'ai' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">AI Assistant Configuration</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Personality Tone
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {(['professional', 'friendly', 'casual', 'formal'] as const).map(tone => (
                            <label
                              key={tone}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                                settings.ai.personalityTone === tone
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name="tone"
                                value={tone}
                                checked={settings.ai.personalityTone === tone}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  ai: { ...settings.ai, personalityTone: e.target.value as any }
                                })}
                                className="sr-only"
                              />
                              <span className="capitalize">{tone}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Response Speed
                        </label>
                        <select
                          value={settings.ai.responseSpeed}
                          onChange={(e) => setSettings({
                            ...settings,
                            ai: { ...settings.ai, responseSpeed: e.target.value as any }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="instant">Instant (Immediate responses)</option>
                          <option value="natural">Natural (1-3 second delay)</option>
                          <option value="careful">Careful (3-5 second delay, more thoughtful)</option>
                        </select>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Price Negotiation</h4>
                        <label className="flex items-center mb-3">
                          <input
                            type="checkbox"
                            checked={settings.ai.priceNegotiation.enabled}
                            onChange={(e) => setSettings({
                              ...settings,
                              ai: {
                                ...settings.ai,
                                priceNegotiation: {
                                  ...settings.ai.priceNegotiation,
                                  enabled: e.target.checked
                                }
                              }
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Enable AI price negotiation</span>
                        </label>
                        
                        {settings.ai.priceNegotiation.enabled && (
                          <div className="space-y-3 ml-6">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Minimum Discount (%)
                              </label>
                              <input
                                type="number"
                                value={settings.ai.priceNegotiation.minDiscount}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  ai: {
                                    ...settings.ai,
                                    priceNegotiation: {
                                      ...settings.ai.priceNegotiation,
                                      minDiscount: parseInt(e.target.value)
                                    }
                                  }
                                })}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Maximum Discount (%)
                              </label>
                              <input
                                type="number"
                                value={settings.ai.priceNegotiation.maxDiscount}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  ai: {
                                    ...settings.ai,
                                    priceNegotiation: {
                                      ...settings.ai.priceNegotiation,
                                      maxDiscount: parseInt(e.target.value)
                                    }
                                  }
                                })}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Auto-approve below (%)
                              </label>
                              <input
                                type="number"
                                value={settings.ai.priceNegotiation.autoApproveBelow}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  ai: {
                                    ...settings.ai,
                                    priceNegotiation: {
                                      ...settings.ai.priceNegotiation,
                                      autoApproveBelow: parseInt(e.target.value)
                                    }
                                  }
                                })}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                max="100"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Knowledge Base</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Business Information
                            </label>
                            <textarea
                              value={settings.ai.knowledgeBase.businessInfo}
                              onChange={(e) => setSettings({
                                ...settings,
                                ai: {
                                  ...settings.ai,
                                  knowledgeBase: {
                                    ...settings.ai.knowledgeBase,
                                    businessInfo: e.target.value
                                  }
                                }
                              })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Tell the AI about your business..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Products & Services
                            </label>
                            <textarea
                              value={settings.ai.knowledgeBase.products}
                              onChange={(e) => setSettings({
                                ...settings,
                                ai: {
                                  ...settings.ai,
                                  knowledgeBase: {
                                    ...settings.ai.knowledgeBase,
                                    products: e.target.value
                                  }
                                }
                              })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="List your main products and services..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations */}
              {activeTab === 'integrations' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Connected Channels</h3>
                    
                    <div className="space-y-4">
                      {/* Facebook */}
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-full mr-3">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Facebook</p>
                            {settings.integrations.facebook.connected ? (
                              <p className="text-sm text-gray-500">Connected to {settings.integrations.facebook.pageName}</p>
                            ) : (
                              <p className="text-sm text-gray-500">Not connected</p>
                            )}
                          </div>
                        </div>
                        <button className={`px-4 py-2 rounded-md text-sm font-medium ${
                          settings.integrations.facebook.connected
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}>
                          {settings.integrations.facebook.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                      
                      {/* Instagram */}
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-pink-100 rounded-full mr-3">
                            <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Instagram</p>
                            <p className="text-sm text-gray-500">Not connected</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                          Connect
                        </button>
                      </div>
                      
                      {/* TikTok */}
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-full mr-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">TikTok</p>
                            <p className="text-sm text-gray-500">Not connected</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                          Connect
                        </button>
                      </div>
                      
                      {/* Google My Business */}
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-full mr-3">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Google My Business</p>
                            {settings.integrations.google.connected ? (
                              <p className="text-sm text-gray-500">Connected to {settings.integrations.google.businessName}</p>
                            ) : (
                              <p className="text-sm text-gray-500">Not connected</p>
                            )}
                          </div>
                        </div>
                        <button className={`px-4 py-2 rounded-md text-sm font-medium ${
                          settings.integrations.google.connected
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}>
                          {settings.integrations.google.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Provider
                        </label>
                        <select
                          value={settings.integrations.email.provider}
                          onChange={(e) => setSettings({
                            ...settings,
                            integrations: {
                              ...settings.integrations,
                              email: {
                                ...settings.integrations.email,
                                provider: e.target.value as any
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a provider</option>
                          <option value="resend">Resend</option>
                          <option value="sendgrid">SendGrid</option>
                          <option value="mailgun">Mailgun</option>
                        </select>
                      </div>
                      
                      {settings.integrations.email.provider && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              API Key
                            </label>
                            <input
                              type="password"
                              value={settings.integrations.email.apiKey}
                              onChange={(e) => setSettings({
                                ...settings,
                                integrations: {
                                  ...settings.integrations,
                                  email: {
                                    ...settings.integrations.email,
                                    apiKey: e.target.value
                                  }
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter your API key"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                From Email
                              </label>
                              <input
                                type="email"
                                value={settings.integrations.email.fromEmail}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  integrations: {
                                    ...settings.integrations,
                                    email: {
                                      ...settings.integrations.email,
                                      fromEmail: e.target.value
                                    }
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                From Name
                              </label>
                              <input
                                type="text"
                                value={settings.integrations.email.fromName}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  integrations: {
                                    ...settings.integrations,
                                    email: {
                                      ...settings.integrations.email,
                                      fromName: e.target.value
                                    }
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email.newLead}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              email: {
                                ...settings.notifications.email,
                                newLead: e.target.checked
                              }
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">New lead notifications</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email.newMessage}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              email: {
                                ...settings.notifications.email,
                                newMessage: e.target.checked
                              }
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">New message alerts</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email.campaignComplete}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              email: {
                                ...settings.notifications.email,
                                campaignComplete: e.target.checked
                              }
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">Campaign completion reports</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email.weeklyReport}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              email: {
                                ...settings.notifications.email,
                                weeklyReport: e.target.checked
                              }
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">Weekly performance reports</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">WhatsApp Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.whatsapp.urgentMessages}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              whatsapp: {
                                ...settings.notifications.whatsapp,
                                urgentMessages: e.target.checked
                              }
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">Urgent customer messages</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.whatsapp.dailySummary}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              whatsapp: {
                                ...settings.notifications.whatsapp,
                                dailySummary: e.target.checked
                              }
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">Daily business summary</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing */}
              {activeTab === 'billing' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {(['starter', 'growth', 'scale'] as const).map(plan => (
                        <div
                          key={plan}
                          className={`p-4 border-2 rounded-lg ${
                            settings.billing.plan === plan
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <h4 className="font-medium text-gray-900 capitalize mb-1">{plan}</h4>
                          <p className="text-2xl font-bold text-gray-900 mb-2">
                            KSH {plan === 'starter' ? '9,999' : plan === 'growth' ? '19,999' : '49,999'}
                            <span className="text-sm font-normal text-gray-500">/mo</span>
                          </p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• {plan === 'starter' ? '1,000' : plan === 'growth' ? '5,000' : 'Unlimited'} messages</li>
                            <li>• {plan === 'starter' ? '2' : plan === 'growth' ? '5' : 'Unlimited'} channels</li>
                            <li>• {plan === 'starter' ? 'Basic' : plan === 'growth' ? 'Advanced' : 'Premium'} AI</li>
                          </ul>
                          {settings.billing.plan === plan && (
                            <div className="mt-3 text-sm text-blue-600 font-medium">Current Plan</div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Billing Cycle</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{settings.billing.billingCycle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Method</span>
                        <span className="text-sm font-medium text-gray-900">{settings.billing.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Billing Date</span>
                        <span className="text-sm font-medium text-gray-900">
                          {format(new Date(settings.billing.nextBillingDate), 'MMMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm">
                        Upgrade Plan
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm">
                        Update Payment Method
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm">
                        View Invoices
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}