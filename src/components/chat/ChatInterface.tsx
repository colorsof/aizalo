'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import PriceHaggler from './PriceHaggler'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

interface ChatInterfaceProps {
  businessName?: string
  businessType?: string
  initialMessages?: Message[]
  onSendMessage?: (message: string) => Promise<void>
}

export default function ChatInterface({
  businessName = 'AI Business Assistant',
  businessType = 'general',
  initialMessages = [],
  onSendMessage
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages.length > 0 ? initialMessages : [
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! Welcome to our AI assistant. I\'m here to help you 24/7. How may I assist you today?',
      timestamp: new Date().toISOString()
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [showPriceHaggler, setShowPriceHaggler] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const detectPriceInquiry = (message: string): number | null => {
    const pricePatterns = [
      /how much/i,
      /what.*price/i,
      /cost/i,
      /charge/i,
      /pay/i,
      /ksh\s*(\d+)/i,
      /(\d+)\s*ksh/i
    ]
    
    for (const pattern of pricePatterns) {
      if (pattern.test(message)) {
        const match = message.match(/\d+/)
        return match ? parseInt(match[0]) : null
      }
    }
    return null
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending'
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    // Check if this is a price-related message
    const priceInquiry = detectPriceInquiry(content)
    if (priceInquiry || content.toLowerCase().includes('price')) {
      setShowPriceHaggler(true)
      setCurrentPrice(priceInquiry || 1000)
    }

    // Update message status
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      )
    }, 1000)

    try {
      // Call real AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          businessType: businessType,
          businessContext: {
            businessName: businessName,
            location: 'Nairobi, Kenya',
            services: ['General services']
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        const aiResponse: Message = {
          id: `msg-${Date.now()}-ai`,
          content: data.response,
          role: 'assistant',
          timestamp: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, aiResponse])
      } else {
        // Fallback to mock response if API fails
        const aiResponse: Message = {
          id: `msg-${Date.now()}-ai`,
          content: generateAIResponse(content, businessType),
          role: 'assistant',
          timestamp: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, aiResponse])
      }
    } catch (error) {
      console.error('AI API error:', error)
      // Fallback to mock response
      const aiResponse: Message = {
        id: `msg-${Date.now()}-ai`,
        content: generateAIResponse(content, businessType),
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, aiResponse])
    } finally {
      setIsTyping(false)
    }

    if (onSendMessage) {
      await onSendMessage(content)
    }
  }

  const generateAIResponse = (userMessage: string, businessType: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('price') || lowerMessage.includes('how much')) {
      switch (businessType) {
        case 'hardware_store':
          return "I can help you with pricing! What items are you looking for? For example:\n\n• Cement - Ksh 750 per bag\n• Iron sheets - Ksh 850 each\n• Tiles - From Ksh 1,200 per box\n\nFor bulk orders, I can offer better prices. How many do you need?"
        case 'restaurant':
          return "Our prices are very reasonable! Here are today's specials:\n\n• Ugali & Nyama Choma - Ksh 850\n• Fish & Chips - Ksh 750\n• Chicken Biryani - Ksh 900\n\nWould you like to make a reservation?"
        default:
          return "I'd be happy to discuss pricing with you. What specific service or product are you interested in?"
      }
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Welcome to ${businessName}! 👋 I'm here to help you 24/7. What can I assist you with today?`
    }
    
    return "I understand you're interested in our services. Let me help you with that. Could you tell me more about what you're looking for?"
  }

  const handlePriceAccepted = (finalPrice: number) => {
    const confirmMessage: Message = {
      id: `msg-${Date.now()}-confirm`,
      content: `Great! I've confirmed your order at Ksh ${finalPrice.toLocaleString()}. When would you like to collect/receive it?`,
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, confirmMessage])
    setShowPriceHaggler(false)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">
            {businessName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{businessName}</h3>
          <p className="text-xs text-green-600">● Online - Typically replies instantly</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Start a conversation with {businessName}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleSendMessage("Hi, I need help")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                👋 Say hello
              </button>
              <button
                onClick={() => handleSendMessage("What are your prices?")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                💰 Check prices
              </button>
              <button
                onClick={() => handleSendMessage("Do you have this in stock?")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                📦 Check availability
              </button>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            businessName={businessName}
          />
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 rounded-bl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Price Haggler Modal */}
      {showPriceHaggler && currentPrice && (
        <PriceHaggler
          initialPrice={currentPrice}
          minPrice={currentPrice * 0.8}
          businessType={businessType}
          onAccept={handlePriceAccepted}
          onReject={() => setShowPriceHaggler(false)}
        />
      )}

      {/* Input Area */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isTyping}
        placeholder="Type a message..."
      />
    </div>
  )
}