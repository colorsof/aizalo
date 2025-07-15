'use client'

import { useState } from 'react'
// Remove direct import as we'll use API endpoint

type Platform = 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'google' | 'email'
type ContentType = 'product_launch' | 'special_offer' | 'event' | 'educational' | 'testimonial' | 'holiday'

interface GeneratedContent {
  platform: Platform
  content: string
  hashtags?: string[]
  callToAction: string
  tips: string[]
}

export default function ContentGeneratorPage() {
  const [businessType, setBusinessType] = useState('restaurant')
  const [contentType, setContentType] = useState<ContentType>('special_offer')
  const [productDetails, setProductDetails] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [tone, setTone] = useState('friendly')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['whatsapp'])
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant/Hotel' },
    { value: 'hardware', label: 'Hardware Store' },
    { value: 'realestate', label: 'Real Estate' },
    { value: 'beauty', label: 'Beauty Salon' },
    { value: 'medical', label: 'Medical/Dental' },
    { value: 'tech', label: 'Tech Shop' },
    { value: 'legal', label: 'Law Firm' },
    { value: 'car', label: 'Car Dealership' }
  ]

  const contentTypes = [
    { value: 'product_launch', label: '🚀 Product Launch', description: 'Announce new products/services' },
    { value: 'special_offer', label: '🎯 Special Offer', description: 'Promotions and discounts' },
    { value: 'event', label: '🎉 Event Announcement', description: 'Upcoming events or activities' },
    { value: 'educational', label: '📚 Educational', description: 'Tips and helpful information' },
    { value: 'testimonial', label: '⭐ Customer Story', description: 'Share success stories' },
    { value: 'holiday', label: '🎄 Holiday Special', description: 'Seasonal campaigns' }
  ]

  const platforms = [
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { value: 'facebook', label: 'Facebook', icon: '👍' },
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'google', label: 'Google My Business', icon: '🔍' },
    { value: 'email', label: 'Email', icon: '📧' }
  ]

  const tones = [
    { value: 'friendly', label: 'Friendly & Casual' },
    { value: 'professional', label: 'Professional' },
    { value: 'urgent', label: 'Urgent/Limited Time' },
    { value: 'funny', label: 'Humorous' },
    { value: 'inspirational', label: 'Inspirational' }
  ]

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const generateContent = async () => {
    if (!productDetails || selectedPlatforms.length === 0) {
      alert('Please fill in product details and select at least one platform')
      return
    }

    setIsGenerating(true)
    setGeneratedContent([])

    try {
      const results: GeneratedContent[] = []

      for (const platform of selectedPlatforms) {
        const apiResponse = await fetch('/api/content/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessType,
            campaign: {
              type: `${platform}_${contentType}`,
              target: targetAudience || 'general customers in Kenya',
              offer: productDetails,
              tone: tone
            }
          })
        })

        if (!apiResponse.ok) {
          throw new Error('Failed to generate content')
        }

        const response = await apiResponse.json()

        // Platform-specific content formatting
        let formattedContent = response.message
        const tips: string[] = []

        switch (platform) {
          case 'whatsapp':
            tips.push('Keep it under 1000 characters')
            tips.push('Use emojis sparingly')
            tips.push('Include your business hours')
            break
          case 'facebook':
            tips.push('Add a compelling image or video')
            tips.push('Best posting time: 6-9 PM')
            tips.push('Engage with comments quickly')
            break
          case 'instagram':
            tips.push('Use 5-10 relevant hashtags')
            tips.push('Create a visually appealing image')
            tips.push('Add location tag')
            break
          case 'tiktok':
            tips.push('Keep video under 30 seconds')
            tips.push('Use trending sounds')
            tips.push('Start with a hook in first 3 seconds')
            tips.push('Film vertically')
            break
          case 'google':
            tips.push('Include your address and hours')
            tips.push('Add a clear call-to-action')
            tips.push('Use local keywords')
            break
          case 'email':
            tips.push('Subject line under 50 characters')
            tips.push('Personalize the greeting')
            tips.push('One clear CTA button')
            break
        }

        results.push({
          platform,
          content: formattedContent,
          hashtags: response.hashtags,
          callToAction: response.callToAction,
          tips
        })
      }

      setGeneratedContent(results)
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add a toast notification here
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Content Generator</h1>
          <p className="mt-2 text-gray-600">Create engaging marketing content for all your channels</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {businessTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <div className="space-y-2">
                  {contentTypes.map(type => (
                    <label
                      key={type.value}
                      className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                        contentType === type.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="contentType"
                        value={type.value}
                        checked={contentType === type.value}
                        onChange={(e) => setContentType(e.target.value as ContentType)}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{type.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Product/Offer Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Offer Details
                </label>
                <textarea
                  value={productDetails}
                  onChange={(e) => setProductDetails(e.target.value)}
                  placeholder="E.g., 20% off all meals this weekend, New iPhone 15 in stock, 3-bedroom apartment in Kilimani..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience (Optional)
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="E.g., Young professionals in Westlands"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tones.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Platforms
                </label>
                <div className="space-y-2">
                  {platforms.map(platform => (
                    <label
                      key={platform.value}
                      className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform.value as Platform)}
                        onChange={() => handlePlatformToggle(platform.value as Platform)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-lg mr-2">{platform.icon}</span>
                      <span className="text-sm font-medium">{platform.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateContent}
                disabled={isGenerating || !productDetails || selectedPlatforms.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isGenerating ? 'Generating...' : 'Generate Content'}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2">
            {generatedContent.length === 0 && !isGenerating && (
              <div className="bg-white shadow rounded-lg p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content generated yet</h3>
                <p className="text-gray-500">Fill in the details and click generate to create your marketing content</p>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white shadow rounded-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Creating amazing content for your business...</p>
              </div>
            )}

            {generatedContent.length > 0 && (
              <div className="space-y-6">
                {generatedContent.map((content, index) => (
                  <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        {platforms.find(p => p.value === content.platform)?.icon} {' '}
                        {platforms.find(p => p.value === content.platform)?.label}
                      </h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <label className="text-sm font-medium text-gray-700">Content</label>
                          <button
                            onClick={() => copyToClipboard(content.content)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-gray-800 whitespace-pre-wrap">{content.content}</p>
                        </div>
                      </div>

                      {content.hashtags && content.hashtags.length > 0 && (
                        <div className="mb-4">
                          <label className="text-sm font-medium text-gray-700 block mb-2">Hashtags</label>
                          <div className="flex flex-wrap gap-2">
                            {content.hashtags.map((tag, i) => (
                              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Call to Action</label>
                        <p className="text-gray-800 font-medium">{content.callToAction}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Pro Tips</label>
                        <ul className="space-y-1">
                          {content.tips.map((tip, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span className="text-sm text-gray-600">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Schedule Options */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-medium text-blue-900 mb-2">📅 Ready to Schedule?</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    You can now schedule these posts to go live automatically at the best times for engagement.
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                    Schedule Posts →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}