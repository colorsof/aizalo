import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface GeminiServiceConfig {
  model?: string
  temperature?: number
  maxTokens?: number
}

export class GeminiService {
  private model: any

  constructor(config: GeminiServiceConfig = {}) {
    this.model = genAI.getGenerativeModel({
      model: config.model || 'gemini-pro',
    })
  }

  async generateContent(
    systemPrompt: string,
    userMessage: string,
    context?: any
  ): Promise<string> {
    try {
      const prompt = `${systemPrompt}

Context: ${JSON.stringify(context || {})}

User Message: ${userMessage}

Response:`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Failed to generate content with Gemini')
    }
  }

  async generateBusinessResponse(
    businessType: string,
    customerMessage: string,
    businessContext: any
  ): Promise<string> {
    const systemPrompt = `You are an AI assistant for a ${businessType} in Kenya. 
You help with customer inquiries, bookings, and sales in a friendly, professional manner.
You understand Kenyan culture and can respond in English or Swahili as appropriate.
Always be helpful and try to convert inquiries into sales when appropriate.

Business Details:
- Name: ${businessContext.businessName}
- Type: ${businessType}
- Location: ${businessContext.location || 'Kenya'}
- Services: ${businessContext.services?.join(', ') || 'Various services'}

Guidelines:
- Be conversational and warm
- Understand price negotiation is cultural
- Offer payment plans when sensing price resistance
- Use local references when appropriate
- Keep responses concise but helpful
- Always try to book appointments or close sales`

    return this.generateContent(systemPrompt, customerMessage, businessContext)
  }

  async analyzeCustomerIntent(
    message: string,
    businessType: string
  ): Promise<{
    intent: string
    urgency: 'high' | 'medium' | 'low'
    requiresRealtime: boolean
    suggestedResponse?: string
  }> {
    const prompt = `Analyze this customer message for a ${businessType}:
"${message}"

Determine:
1. Primary intent (inquiry, booking, complaint, price_negotiation, etc.)
2. Urgency level (high, medium, low)
3. If it requires real-time response (true/false)
4. A suggested response approach

Format as JSON.`

    const result = await this.generateContent(
      'You are a customer intent analyzer. Always respond with valid JSON.',
      prompt,
      { businessType }
    )

    try {
      return JSON.parse(result)
    } catch {
      return {
        intent: 'general_inquiry',
        urgency: 'medium',
        requiresRealtime: false,
      }
    }
  }

  async generateMarketingContent(
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
  }> {
    const prompt = `Create marketing content for a ${businessType} in Kenya.

Campaign Details:
- Type: ${campaign.type}
- Target: ${campaign.target}
- Offer: ${campaign.offer || 'General promotion'}
- Tone: ${campaign.tone || 'Professional but friendly'}

Create:
1. A compelling message (2-3 sentences)
2. Clear call-to-action
3. Relevant hashtags if appropriate

Consider Kenyan market preferences and cultural nuances.
Format as JSON.`

    const result = await this.generateContent(
      'You are a marketing content creator for Kenyan businesses. Always respond with valid JSON.',
      prompt,
      campaign
    )

    try {
      return JSON.parse(result)
    } catch {
      return {
        message: 'Check out our amazing offers!',
        callToAction: 'Contact us today!',
        hashtags: ['#KenyaBusiness', '#GreatDeals'],
      }
    }
  }
}

export const geminiService = new GeminiService()