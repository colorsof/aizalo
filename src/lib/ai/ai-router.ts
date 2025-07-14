import { geminiService } from './gemini-service'
import { groqService } from './groq-service'

export interface AIRequest {
  message: string
  businessType: string
  businessContext: {
    businessName: string
    location?: string
    services?: string[]
    priceList?: Record<string, number>
  }
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface AIResponse {
  response: string
  intent?: string
  urgency?: string
  aiModel: 'gemini' | 'groq'
  processingTime: number
  metadata?: any
}

export class AIRouter {
  /**
   * Routes requests to appropriate AI service based on urgency and type
   * Gemini: 95% of requests (complex, marketing, general)
   * Groq: 5% of requests (urgent, price negotiation, real-time needs)
   */
  async route(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // First, analyze urgency with Groq (fast check)
      const urgencyCheck = await groqService.classifyUrgency(request.message)
      
      // Check if it's a price negotiation
      const isPriceNegotiation = this.isPriceNegotiation(request.message)
      
      // Use Groq for urgent or price-sensitive requests (5% of traffic)
      if (urgencyCheck.isUrgent || isPriceNegotiation) {
        return await this.handleWithGroq(request, startTime, urgencyCheck.reason)
      }
      
      // Use Gemini for everything else (95% of traffic)
      return await this.handleWithGemini(request, startTime)
    } catch (error) {
      console.error('AI routing error:', error)
      
      // Fallback to a simple response
      return {
        response: "I'm here to help! Could you please repeat your question?",
        aiModel: 'gemini',
        processingTime: Date.now() - startTime,
        metadata: { error: true }
      }
    }
  }

  private async handleWithGemini(
    request: AIRequest,
    startTime: number
  ): Promise<AIResponse> {
    // Analyze intent first
    const intentAnalysis = await geminiService.analyzeCustomerIntent(
      request.message,
      request.businessType
    )

    // Generate appropriate response
    const response = await geminiService.generateBusinessResponse(
      request.businessType,
      request.message,
      request.businessContext
    )

    return {
      response,
      intent: intentAnalysis.intent,
      urgency: intentAnalysis.urgency,
      aiModel: 'gemini',
      processingTime: Date.now() - startTime,
      metadata: intentAnalysis
    }
  }

  private async handleWithGroq(
    request: AIRequest,
    startTime: number,
    urgencyReason: string
  ): Promise<AIResponse> {
    let response: string

    // Check if it's price negotiation
    const priceMatch = request.message.match(/\d+/)
    if (priceMatch && this.isPriceNegotiation(request.message)) {
      const customerOffer = parseInt(priceMatch[0])
      const currentPrice = this.getCurrentPrice(request)
      const minimumPrice = Math.floor(currentPrice * 0.8) // 20% margin

      const negotiation = await groqService.handlePriceNegotiation(
        currentPrice,
        customerOffer,
        minimumPrice,
        request.businessType
      )

      response = negotiation.response
    } else {
      // Handle other urgent queries
      response = await groqService.generateUrgentResponse(
        request.businessType,
        request.message
      )
    }

    return {
      response,
      intent: 'urgent_response',
      urgency: 'high',
      aiModel: 'groq',
      processingTime: Date.now() - startTime,
      metadata: { urgencyReason }
    }
  }

  private isPriceNegotiation(message: string): boolean {
    const negotiationKeywords = [
      'how much', 'price', 'cost', 'charge', 'pay', 'discount',
      'cheaper', 'less', 'deal', 'offer', 'ksh', 'shillings',
      'bei', 'punguza', 'rahisi' // Swahili terms
    ]

    const lowerMessage = message.toLowerCase()
    return negotiationKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  private getCurrentPrice(request: AIRequest): number {
    // In real implementation, this would fetch from price list or context
    // For now, return a default based on business type
    const defaultPrices: Record<string, number> = {
      'hardware': 5000,
      'hotel': 8000,
      'restaurant': 1500,
      'beauty': 3000,
      'medical': 2000,
      'tech': 50000,
      'legal': 5000,
      'realestate': 15000
    }

    const businessKey = request.businessType.toLowerCase().replace(/\s+/g, '')
    return defaultPrices[businessKey] || 5000
  }

  /**
   * Generate marketing content using Gemini
   */
  async generateMarketing(
    businessType: string,
    campaign: {
      type: string
      target: string
      offer?: string
      tone?: string
    }
  ): Promise<{
    message: string
    callToAction: string
    hashtags?: string[]
    aiModel: 'gemini'
  }> {
    const content = await geminiService.generateMarketingContent(
      businessType,
      campaign
    )

    return {
      ...content,
      aiModel: 'gemini'
    }
  }
}

// Export singleton instance
export const aiRouter = new AIRouter()

// Helper function for easy use in components
export async function processCustomerMessage(
  message: string,
  businessType: string,
  businessContext: any
): Promise<AIResponse> {
  return aiRouter.route({
    message,
    businessType,
    businessContext
  })
}