'use client'

import { useState, useEffect } from 'react'

interface PriceHagglerProps {
  initialPrice: number
  minPrice: number
  businessType: string
  onAccept: (price: number) => void
  onReject: () => void
}

export default function PriceHaggler({
  initialPrice,
  minPrice,
  businessType,
  onAccept,
  onReject
}: PriceHagglerProps) {
  const [currentOffer, setCurrentOffer] = useState(initialPrice)
  const [userOffer, setUserOffer] = useState('')
  const [negotiationHistory, setNegotiationHistory] = useState<Array<{
    price: number
    type: 'business' | 'customer'
  }>>([{ price: initialPrice, type: 'business' }])
  const [isThinking, setIsThinking] = useState(false)

  const calculateCounterOffer = (customerOffer: number): number => {
    const percentageOfInitial = (customerOffer / initialPrice) * 100
    
    // Negotiation logic based on Kenyan market behavior
    if (customerOffer < minPrice * 0.9) {
      // Too low - stick closer to minimum
      return minPrice * 1.05
    } else if (customerOffer < minPrice) {
      // Below minimum but close - meet at minimum
      return minPrice
    } else if (percentageOfInitial < 70) {
      // Low offer - counter with middle ground
      return (customerOffer + currentOffer) / 2
    } else if (percentageOfInitial < 85) {
      // Reasonable offer - show flexibility
      return customerOffer * 1.1
    } else {
      // Good offer - accept or minor adjustment
      return customerOffer * 1.02
    }
  }

  const handleNegotiate = () => {
    const offer = parseFloat(userOffer)
    if (isNaN(offer) || offer <= 0) return

    setNegotiationHistory(prev => [...prev, { price: offer, type: 'customer' }])
    setIsThinking(true)

    setTimeout(() => {
      const counterOffer = calculateCounterOffer(offer)
      
      if (offer >= currentOffer * 0.95 || offer >= minPrice) {
        // Accept the offer
        onAccept(offer)
      } else {
        // Make counter offer
        setCurrentOffer(counterOffer)
        setNegotiationHistory(prev => [...prev, { price: counterOffer, type: 'business' }])
      }
      
      setIsThinking(false)
      setUserOffer('')
    }, 1500)
  }

  const getHagglingMessage = (offer: number): string => {
    const percentage = (offer / initialPrice) * 100
    
    if (percentage < 60) {
      return "😅 Boss, that's too low! I have to make a living too..."
    } else if (percentage < 75) {
      return "🤔 Hmm, let me see what I can do for you..."
    } else if (percentage < 90) {
      return "👍 You're getting closer! This is my best price..."
    } else {
      return "🤝 You drive a hard bargain! Deal!"
    }
  }

  return (
    <div className="absolute bottom-20 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md mx-auto">
      <h3 className="font-semibold text-lg mb-3">💰 Price Negotiation</h3>
      
      {/* Negotiation History */}
      <div className="mb-4 max-h-40 overflow-y-auto">
        {negotiationHistory.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 mb-2 ${
              item.type === 'business' ? 'justify-start' : 'justify-end'
            }`}
          >
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.type === 'business'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              Ksh {item.price.toLocaleString()}
            </span>
            {item.type === 'business' && index === negotiationHistory.length - 1 && (
              <span className="text-xs text-gray-500">
                {getHagglingMessage(negotiationHistory[index - 1]?.price || initialPrice)}
              </span>
            )}
          </div>
        ))}
      </div>

      {isThinking ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <span className="animate-pulse">Thinking about your offer...</span>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-600 mb-1">Current price:</p>
            <p className="text-2xl font-bold text-gray-900">
              Ksh {currentOffer.toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={userOffer}
              onChange={(e) => setUserOffer(e.target.value)}
              placeholder="Your offer..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => e.key === 'Enter' && handleNegotiate()}
            />
            <button
              onClick={handleNegotiate}
              disabled={!userOffer}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Offer
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onAccept(currentOffer)}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Accept Ksh {currentOffer.toLocaleString()}
            </button>
            <button
              onClick={onReject}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Tip: In Kenya, always negotiate! Try offering {Math.round(currentOffer * 0.85).toLocaleString()}
          </p>
        </>
      )}
    </div>
  )
}