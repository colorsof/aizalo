'use client'

import { formatDistanceToNow } from 'date-fns'

interface ChatMessageProps {
  message: {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: string
    status?: 'sending' | 'sent' | 'delivered' | 'read'
  }
  businessName?: string
}

export default function ChatMessage({ message, businessName = 'Business' }: ChatMessageProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <p className="text-xs text-gray-500 mb-1 px-1">{businessName} AI</p>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-green-500 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
          
          {isUser && message.status && (
            <span className="text-xs text-gray-400">
              {message.status === 'sending' && '⏱'}
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && (
                <span className="text-blue-500">✓✓</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}