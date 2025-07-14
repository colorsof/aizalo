'use client'

import { useState } from 'react'
import { AVAILABLE_INTEGRATIONS } from '@/lib/integrations/manager'

export default function IntegrationsPanel() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [webhookUrl, setWebhookUrl] = useState('')

  const groupedIntegrations = AVAILABLE_INTEGRATIONS.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = []
    }
    acc[integration.category].push(integration)
    return acc
  }, {} as Record<string, typeof AVAILABLE_INTEGRATIONS>)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Integrations</h2>
      
      <div className="mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Free Channels Included:</strong> WhatsApp, Facebook, Email, and Webhooks are included in all plans. No extra charges!
          </p>
        </div>
      </div>

      {Object.entries(groupedIntegrations).map(([category, integrations]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold mb-4 capitalize">
            {category.replace('_', ' ')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedIntegration === integration.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${integration.status === 'coming_soon' ? 'opacity-60' : ''}`}
                onClick={() => integration.status === 'active' && setSelectedIntegration(integration.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                      
                      {integration.status === 'active' && integration.isFree && (
                        <span className="inline-flex items-center mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Free
                        </span>
                      )}
                      
                      {integration.status === 'coming_soon' && (
                        <span className="inline-flex items-center mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {integration.status === 'active' && (
                    <div className={`w-4 h-4 rounded-full ${
                      selectedIntegration === integration.id ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedIntegration === 'webhooks' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Configure Webhook</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Events to Send
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">New conversations</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Lead captured</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Appointment scheduled</span>
                </label>
              </div>
            </div>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Save Webhook
            </button>
          </div>
        </div>
      )}

      {selectedIntegration === 'zapier' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Connect with Zapier</h4>
          <p className="text-sm text-gray-600 mb-3">
            Use our Zapier app to connect with 5000+ services. You'll need a free Zapier account.
          </p>
          <ol className="text-sm space-y-2 mb-4">
            <li>1. Sign up for a free Zapier account</li>
            <li>2. Search for "AI Business Platform" in Zapier</li>
            <li>3. Use your API key: <code className="bg-gray-200 px-2 py-1 rounded">abp_live_xxxxx</code></li>
          </ol>
          <a
            href="https://zapier.com/apps/ai-business-platform/integrations"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
          >
            Open in Zapier
          </a>
        </div>
      )}
    </div>
  )
}