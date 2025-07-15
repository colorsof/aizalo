'use client'

import { useState } from 'react'

export default function TestRealtimePage() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testRealtime = async (type: string) => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/test-realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create test data')
      }

      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Real-time Updates</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Open the dashboard in another tab/window</li>
            <li>Click one of the buttons below to create test data</li>
            <li>Watch the dashboard update in real-time!</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => testRealtime('conversation')}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
          >
            Create Test Conversation
          </button>
          
          <button
            onClick={() => testRealtime('lead')}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
          >
            Create Test Lead
          </button>
          
          <button
            onClick={() => testRealtime('sale')}
            disabled={loading}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition"
          >
            Create Test Sale
          </button>
          
          <button
            onClick={() => testRealtime('activity')}
            disabled={loading}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition"
          >
            Create Test Activity
          </button>
        </div>

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-700">Creating test data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {response && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Success!</h3>
            <pre className="text-sm text-green-700 overflow-x-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Dashboard in New Tab →
          </a>
        </div>
      </div>
    </div>
  )
}