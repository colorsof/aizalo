'use client'

import { useState } from 'react'
import ChatInterface from '@/components/chat/ChatInterface'

const industries = [
  { id: 'hardware_store', name: 'Jua Kali Hardware', type: 'hardware_store', icon: '🔨' },
  { id: 'restaurant', name: 'Mama Oliech Restaurant', type: 'restaurant', icon: '🍽️' },
  { id: 'hotel', name: 'Safari Park Hotel', type: 'hotel', icon: '🏨' },
  { id: 'clinic', name: 'Nairobi West Hospital', type: 'clinic', icon: '🏥' },
  { id: 'salon', name: 'Beauty Plus Salon', type: 'salon', icon: '💇' },
  { id: 'real_estate', name: 'Kenya Homes Ltd', type: 'real_estate', icon: '🏘️' },
]

export default function DemoPage() {
  const [selectedBusiness, setSelectedBusiness] = useState(industries[0])
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Business Platform Demo</h1>
              <p className="text-gray-600">Experience the power of AI-driven customer engagement</p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Industry Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Choose a Business Type to Demo:</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map((industry) => (
              <button
                key={industry.id}
                onClick={() => {
                  setSelectedBusiness(industry)
                  setShowChat(false)
                  setTimeout(() => setShowChat(true), 100)
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedBusiness.id === industry.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{industry.icon}</div>
                <div className="text-sm font-medium">{industry.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Features */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🎯 Try These Features:</h3>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-blue-800">
            <li>• Ask about prices to see the haggling feature</li>
            <li>• Say "I need 50 bags of cement" for bulk quotes</li>
            <li>• Check availability of products/services</li>
            <li>• Try negotiating - offer 70% of the quoted price!</li>
            <li>• Ask about delivery or pickup options</li>
            <li>• Request business hours or location</li>
          </ul>
        </div>

        {/* Chat Interface Container */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chat Window */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
            {showChat ? (
              <ChatInterface
                businessName={selectedBusiness.name}
                businessType={selectedBusiness.type}
                key={selectedBusiness.id}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <button
                  onClick={() => setShowChat(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Start Chat with {selectedBusiness.name}
                </button>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Business Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">About This Demo</h3>
              <div className="space-y-3 text-gray-600">
                <p>
                  This demo shows how your AI assistant will handle customer inquiries 24/7.
                  The AI understands context, handles price negotiations, and converts visitors into customers.
                </p>
                <p>
                  <strong>Key Features:</strong>
                </p>
                <ul className="space-y-1 ml-4">
                  <li>✓ Instant responses in perfect English</li>
                  <li>✓ Price haggling (unique to Kenya!)</li>
                  <li>✓ Multi-channel support (WhatsApp, FB, Web)</li>
                  <li>✓ Industry-specific knowledge</li>
                  <li>✓ Lead qualification & follow-up</li>
                </ul>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Expected Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">3 sec</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">45%</div>
                  <div className="text-sm text-gray-600">Lead Conversion</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">24/7</div>
                  <div className="text-sm text-gray-600">Availability</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Ready to Transform Your Business?</h3>
              <p className="mb-4 opacity-90">
                Get your own AI assistant starting at just Ksh 2,500/month.
                Setup in 24 hours, see results immediately.
              </p>
              <button className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}