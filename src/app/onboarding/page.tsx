'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: string
}

interface BusinessData {
  // Step 1: Business Info
  businessName: string
  businessType: string
  industry: string
  yearsInBusiness: string
  teamSize: string
  
  // Step 2: Contact Info
  ownerName: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  
  // Step 3: Goals
  primaryGoal: string
  monthlyBudget: string
  targetAudience: string
  currentChallenges: string[]
  
  // Step 4: Channels
  currentChannels: string[]
  preferredChannels: string[]
  whatsappNumber: string
  facebookPage: string
  instagramHandle: string
  
  // Step 5: AI Setup
  aiPersonality: string
  responseSpeed: string
  priceNegotiation: boolean
  businessHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [businessData, setBusinessData] = useState<BusinessData>({
    businessName: '',
    businessType: '',
    industry: '',
    yearsInBusiness: '',
    teamSize: '',
    ownerName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    primaryGoal: '',
    monthlyBudget: '',
    targetAudience: '',
    currentChallenges: [],
    currentChannels: [],
    preferredChannels: [],
    whatsappNumber: '',
    facebookPage: '',
    instagramHandle: '',
    aiPersonality: 'friendly',
    responseSpeed: 'natural',
    priceNegotiation: true,
    businessHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '08:00', close: '18:00', closed: true }
    }
  })

  const steps: OnboardingStep[] = [
    { id: 1, title: 'Business Info', description: 'Tell us about your business', icon: '🏪' },
    { id: 2, title: 'Contact Details', description: 'How can we reach you', icon: '📞' },
    { id: 3, title: 'Goals & Budget', description: 'What do you want to achieve', icon: '🎯' },
    { id: 4, title: 'Channels', description: 'Connect your channels', icon: '🔗' },
    { id: 5, title: 'AI Assistant', description: 'Customize your AI', icon: '🤖' },
    { id: 6, title: 'Review', description: 'Confirm everything', icon: '✅' }
  ]

  const industries = [
    'Restaurant/Hotel',
    'Hardware Store',
    'Real Estate',
    'Beauty Salon',
    'Medical/Dental',
    'Tech Shop',
    'Law Firm',
    'Car Dealership',
    'Retail Store',
    'Education',
    'Other'
  ]

  const challenges = [
    'Low customer engagement',
    'Difficulty reaching new customers',
    'Time-consuming manual tasks',
    'Inconsistent messaging',
    'Poor response times',
    'Low conversion rates',
    'Limited marketing budget',
    'Lack of analytics'
  ]

  const channels = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
    { id: 'facebook', name: 'Facebook', icon: '👍' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'google', name: 'Google My Business', icon: '🔍' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'sms', name: 'SMS', icon: '💬' }
  ]

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // In a real app, this would save to database
    console.log('Submitting onboarding data:', businessData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Redirect to dashboard
    router.push('/dashboard')
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return businessData.businessName && businessData.businessType && businessData.industry
      case 2:
        return businessData.ownerName && businessData.email && businessData.phone && businessData.city
      case 3:
        return businessData.primaryGoal && businessData.monthlyBudget && businessData.currentChallenges.length > 0
      case 4:
        return businessData.preferredChannels.length > 0
      case 5:
        return true // AI setup is optional
      case 6:
        return true // Review step
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Aizalo</h1>
            <span className="text-sm text-gray-500">Step {currentStep} of 6</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep > step.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : currentStep === step.id
                  ? 'bg-white border-blue-600 text-blue-600'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-lg">{step.icon}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-full h-1 mx-2 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} style={{ width: '100px' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{steps[currentStep - 1].title}</h2>
          <p className="text-gray-600 mb-6">{steps[currentStep - 1].description}</p>

          {/* Step 1: Business Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={businessData.businessName}
                  onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mama Njeri Hardware"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <input
                  type="text"
                  value={businessData.businessType}
                  onChange={(e) => setBusinessData({ ...businessData, businessType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Hardware Store, Restaurant, Salon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={businessData.industry}
                  onChange={(e) => setBusinessData({ ...businessData, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years in Business
                  </label>
                  <select
                    value={businessData.yearsInBusiness}
                    onChange={(e) => setBusinessData({ ...businessData, yearsInBusiness: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="0-1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">More than 10 years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
                  <select
                    value={businessData.teamSize}
                    onChange={(e) => setBusinessData({ ...businessData, teamSize: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="1">Just me</option>
                    <option value="2-5">2-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="11-20">11-20 people</option>
                    <option value="20+">More than 20</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={businessData.ownerName}
                  onChange={(e) => setBusinessData({ ...businessData, ownerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={businessData.email}
                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={businessData.phone}
                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+254712345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={businessData.website}
                  onChange={(e) => setBusinessData({ ...businessData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="www.yourbusiness.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <input
                  type="text"
                  value={businessData.address}
                  onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={businessData.city}
                  onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Nairobi, Mombasa, Kisumu"
                />
              </div>
            </div>
          )}

          {/* Step 3: Goals & Budget */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Goal *
                </label>
                <select
                  value={businessData.primaryGoal}
                  onChange={(e) => setBusinessData({ ...businessData, primaryGoal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your main goal</option>
                  <option value="increase_sales">Increase Sales</option>
                  <option value="generate_leads">Generate More Leads</option>
                  <option value="improve_service">Improve Customer Service</option>
                  <option value="build_awareness">Build Brand Awareness</option>
                  <option value="automate_tasks">Automate Manual Tasks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Marketing Budget *
                </label>
                <select
                  value={businessData.monthlyBudget}
                  onChange={(e) => setBusinessData({ ...businessData, monthlyBudget: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select budget range</option>
                  <option value="0-10k">Less than KSH 10,000</option>
                  <option value="10k-25k">KSH 10,000 - 25,000</option>
                  <option value="25k-50k">KSH 25,000 - 50,000</option>
                  <option value="50k-100k">KSH 50,000 - 100,000</option>
                  <option value="100k+">More than KSH 100,000</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <textarea
                  value={businessData.targetAudience}
                  onChange={(e) => setBusinessData({ ...businessData, targetAudience: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your ideal customers (e.g., young professionals in Westlands, families in Kiambu)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Challenges * (Select all that apply)
                </label>
                <div className="space-y-2">
                  {challenges.map(challenge => (
                    <label key={challenge} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={businessData.currentChallenges.includes(challenge)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBusinessData({
                              ...businessData,
                              currentChallenges: [...businessData.currentChallenges, challenge]
                            })
                          } else {
                            setBusinessData({
                              ...businessData,
                              currentChallenges: businessData.currentChallenges.filter(c => c !== challenge)
                            })
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{challenge}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Channels */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Channels (What you're already using)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {channels.map(channel => (
                    <label
                      key={channel.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        businessData.currentChannels.includes(channel.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={businessData.currentChannels.includes(channel.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBusinessData({
                              ...businessData,
                              currentChannels: [...businessData.currentChannels, channel.id]
                            })
                          } else {
                            setBusinessData({
                              ...businessData,
                              currentChannels: businessData.currentChannels.filter(c => c !== channel.id)
                            })
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-2">{channel.icon}</span>
                      <span className="text-sm font-medium">{channel.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Channels * (What you want to use)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {channels.map(channel => (
                    <label
                      key={channel.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        businessData.preferredChannels.includes(channel.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={businessData.preferredChannels.includes(channel.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBusinessData({
                              ...businessData,
                              preferredChannels: [...businessData.preferredChannels, channel.id]
                            })
                          } else {
                            setBusinessData({
                              ...businessData,
                              preferredChannels: businessData.preferredChannels.filter(c => c !== channel.id)
                            })
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-2">{channel.icon}</span>
                      <span className="text-sm font-medium">{channel.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {businessData.preferredChannels.includes('whatsapp') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Business Number
                  </label>
                  <input
                    type="tel"
                    value={businessData.whatsappNumber}
                    onChange={(e) => setBusinessData({ ...businessData, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+254712345678"
                  />
                </div>
              )}

              {businessData.preferredChannels.includes('facebook') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Page URL
                  </label>
                  <input
                    type="url"
                    value={businessData.facebookPage}
                    onChange={(e) => setBusinessData({ ...businessData, facebookPage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://facebook.com/yourbusiness"
                  />
                </div>
              )}

              {businessData.preferredChannels.includes('instagram') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={businessData.instagramHandle}
                    onChange={(e) => setBusinessData({ ...businessData, instagramHandle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@yourbusiness"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 5: AI Setup */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Personality
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
                    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
                    { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
                    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic and upbeat' }
                  ].map(personality => (
                    <label
                      key={personality.value}
                      className={`p-4 border rounded-lg cursor-pointer ${
                        businessData.aiPersonality === personality.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="personality"
                        value={personality.value}
                        checked={businessData.aiPersonality === personality.value}
                        onChange={(e) => setBusinessData({ ...businessData, aiPersonality: e.target.value })}
                        className="sr-only"
                      />
                      <p className="font-medium text-gray-900">{personality.label}</p>
                      <p className="text-sm text-gray-500">{personality.description}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Speed
                </label>
                <select
                  value={businessData.responseSpeed}
                  onChange={(e) => setBusinessData({ ...businessData, responseSpeed: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="instant">Instant (Immediate responses)</option>
                  <option value="natural">Natural (1-3 second delay)</option>
                  <option value="careful">Careful (3-5 second delay)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={businessData.priceNegotiation}
                    onChange={(e) => setBusinessData({ ...businessData, priceNegotiation: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable AI price negotiation (recommended for Kenyan market)
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Hours
                </label>
                <div className="space-y-2">
                  {Object.entries(businessData.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <span className="w-24 text-sm capitalize">{day}</span>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={(e) => setBusinessData({
                            ...businessData,
                            businessHours: {
                              ...businessData.businessHours,
                              [day]: { ...hours, closed: !e.target.checked }
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm">Open</span>
                      </label>
                      {!hours.closed && (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => setBusinessData({
                              ...businessData,
                              businessHours: {
                                ...businessData.businessHours,
                                [day]: { ...hours, open: e.target.value }
                              }
                            })}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                          <span className="text-sm">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => setBusinessData({
                              ...businessData,
                              businessHours: {
                                ...businessData.businessHours,
                                [day]: { ...hours, close: e.target.value }
                              }
                            })}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">Almost done! Review your information below.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Business Information</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Business Name:</dt>
                      <dd className="font-medium">{businessData.businessName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Industry:</dt>
                      <dd className="font-medium">{businessData.industry}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Owner:</dt>
                      <dd className="font-medium">{businessData.ownerName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Email:</dt>
                      <dd className="font-medium">{businessData.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Phone:</dt>
                      <dd className="font-medium">{businessData.phone}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Goals & Budget</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Primary Goal:</dt>
                      <dd className="font-medium capitalize">{businessData.primaryGoal.replace('_', ' ')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Monthly Budget:</dt>
                      <dd className="font-medium">KSH {businessData.monthlyBudget}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Channels</h3>
                  <div className="flex flex-wrap gap-2">
                    {businessData.preferredChannels.map(channelId => {
                      const channel = channels.find(c => c.id === channelId)
                      return channel ? (
                        <span key={channelId} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <span className="mr-1">{channel.icon}</span>
                          {channel.name}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">AI Configuration</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Personality:</dt>
                      <dd className="font-medium capitalize">{businessData.aiPersonality}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Response Speed:</dt>
                      <dd className="font-medium capitalize">{businessData.responseSpeed}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Price Negotiation:</dt>
                      <dd className="font-medium">{businessData.priceNegotiation ? 'Enabled' : 'Disabled'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">🚀 What happens next?</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• We'll set up your AI assistant with your preferences</li>
                  <li>• You'll get access to your dashboard immediately</li>
                  <li>• Our team will help you connect your channels</li>
                  <li>• You can start engaging with customers right away!</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-md font-medium ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Back
          </button>

          {currentStep < 6 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`px-6 py-2 rounded-md font-medium ${
                isStepValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Setting up...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}