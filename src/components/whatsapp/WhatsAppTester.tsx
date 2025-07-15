'use client'

import { useState } from 'react'

export default function WhatsAppTester() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/whatsapp/test')
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Failed to check WhatsApp configuration')
    } finally {
      setLoading(false)
    }
  }

  const sendTestMessage = async () => {
    if (!phoneNumber || !message || !phoneNumberId) {
      setError('Please fill all fields')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          phoneNumber,
          message,
          phoneNumberId,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
        setMessage('')
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch (err) {
      setError('Failed to send test message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">WhatsApp Integration Tester</h2>

      {/* Configuration Check */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">1. Check Configuration</h3>
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check WhatsApp Config'}
        </button>
      </div>

      {/* Send Test Message */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">2. Send Test Message</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number ID</label>
            <input
              type="text"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="From Meta Dashboard"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Recipient Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="254712345678 (with country code)"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hello from Aizalo!"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={sendTestMessage}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Test Message'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold mb-2">Result:</h4>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold mb-2">Quick Setup:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Get credentials from Meta Business Dashboard</li>
          <li>Add environment variables to Vercel</li>
          <li>Configure webhook URL in Meta</li>
          <li>Test with this interface</li>
        </ol>
      </div>
    </div>
  )
}