'use client'

import { useState } from 'react'

export default function WebhookTestPage() {
  const [verifyToken, setVerifyToken] = useState('aizalo_webhook_verify_2024')
  const [verifyResult, setVerifyResult] = useState<string>('')
  const [messageResult, setMessageResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testWebhookVerification = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test_challenge_123`)
      const text = await response.text()
      
      if (response.ok) {
        setVerifyResult(`✅ Verification successful! Challenge: ${text}`)
      } else {
        setVerifyResult(`❌ Verification failed: ${text}`)
      }
    } catch (error) {
      setVerifyResult(`❌ Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testIncomingMessage = async () => {
    setIsLoading(true)
    try {
      const webhookPayload = {
        object: "whatsapp_business_account",
        entry: [{
          id: "123456789",
          changes: [{
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "254700000000",
                phone_number_id: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_ID || "739798009211958"
              },
              messages: [{
                from: "254712345678",
                id: "wamid.TEST123456789",
                timestamp: Math.floor(Date.now() / 1000).toString(),
                text: {
                  body: "How much for 50 bags of cement?"
                },
                type: "text"
              }]
            },
            field: "messages"
          }]
        }]
      }

      const response = await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, Meta will send x-hub-signature-256 header
        },
        body: JSON.stringify(webhookPayload)
      })

      const result = await response.json()
      
      if (response.ok) {
        setMessageResult(`✅ Message processed successfully: ${JSON.stringify(result, null, 2)}`)
      } else {
        setMessageResult(`❌ Processing failed: ${JSON.stringify(result, null, 2)}`)
      }
    } catch (error) {
      setMessageResult(`❌ Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">WhatsApp Webhook Test</h1>
        
        {/* Webhook URL Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">📌 Webhook URL for Meta Configuration:</h3>
          <code className="bg-blue-100 px-2 py-1 rounded text-sm">
            https://your-vercel-domain.vercel.app/api/whatsapp/webhook
          </code>
          <p className="text-sm text-blue-700 mt-2">
            Use this URL in your WhatsApp Business App webhook configuration
          </p>
        </div>

        {/* Verification Test */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Test Webhook Verification</h2>
          <p className="text-gray-600 mb-4">
            This simulates Meta's webhook verification process
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verify Token
            </label>
            <input
              type="text"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={testWebhookVerification}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Verification'}
          </button>

          {verifyResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <pre className="text-sm">{verifyResult}</pre>
            </div>
          )}
        </div>

        {/* Message Test */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Test Incoming Message</h2>
          <p className="text-gray-600 mb-4">
            This simulates receiving a WhatsApp message
          </p>

          <button
            onClick={testIncomingMessage}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Test Message'}
          </button>

          {messageResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <pre className="text-sm whitespace-pre-wrap">{messageResult}</pre>
            </div>
          )}
        </div>

        {/* Configuration Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">3. Configuration Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
              <span className="text-sm">Webhook endpoint configured</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
              <span className="text-sm">AI integration ready</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
              <span className="text-sm">Database connection (needs Supabase service key)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
              <span className="text-sm">WhatsApp API credentials in .env</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <h3 className="font-semibold mb-3">🚀 Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Deploy to Vercel to get your public webhook URL</li>
            <li>Configure webhook URL in Meta Business Manager</li>
            <li>Subscribe to "messages" webhook field</li>
            <li>Add WHATSAPP_APP_SECRET to enable signature verification</li>
            <li>Send a real WhatsApp message to test end-to-end</li>
          </ol>
        </div>
      </div>
    </div>
  )
}