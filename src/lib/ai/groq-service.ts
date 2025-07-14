import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface GroqServiceConfig {
  model?: string
  temperature?: number
  maxTokens?: number
}

export class GroqService {
  private model: string
  private temperature: number
  private maxTokens: number

  constructor(config: GroqServiceConfig = {}) {
    this.model = config.model || 'llama3-8b-8192'
    this.temperature = config.temperature || 0.7
    this.maxTokens = config.maxTokens || 150
  }

  async generateQuickResponse(
    systemPrompt: string,
    userMessage: string,
    context?: any
  ): Promise<string> {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Context: ${JSON.stringify(context || {})}\n\nUser: ${userMessage}`,
          },
        ],
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      })

      return completion.choices[0]?.message?.content || 'I understand. Let me help you with that.'
    } catch (error) {
      console.error('Groq API error:', error)
      throw new Error('Failed to generate quick response with Groq')
    }
  }

  async handlePriceNegotiation(
    currentPrice: number,
    customerOffer: number,
    minimumPrice: number,
    businessType: string
  ): Promise<{
    response: string
    acceptOffer: boolean
    counterOffer?: number
  }> {
    const prompt = `You're negotiating for a ${businessType} in Kenya.
Current price: KSh ${currentPrice}
Customer offer: KSh ${customerOffer}
Minimum acceptable: KSh ${minimumPrice}

Rules:
1. If offer < minimum, politely decline but counter
2. If offer is close to minimum, try to meet halfway
3. Always be respectful of haggling culture
4. Keep response under 2 sentences
5. Include a counter-offer if not accepting

Respond with:
- Natural conversational response
- Whether to accept (true/false)
- Counter offer amount if applicable`

    const systemPrompt = `You are a skilled price negotiator for Kenyan businesses. 
You understand that haggling is cultural and expected. Be friendly but protect profit margins.
Always respond in a JSON format with fields: response, acceptOffer, counterOffer`

    const result = await this.generateQuickResponse(systemPrompt, prompt)

    try {
      return JSON.parse(result)
    } catch {
      // Fallback response
      const margin = currentPrice - minimumPrice
      const acceptOffer = customerOffer >= minimumPrice

      if (acceptOffer) {
        return {
          response: `Deal! I'll accept KSh ${customerOffer}. Thank you for your business!`,
          acceptOffer: true,
        }
      } else {
        const counterOffer = Math.max(
          minimumPrice,
          Math.floor((customerOffer + minimumPrice) / 2)
        )
        return {
          response: `I appreciate your offer, but the best I can do is KSh ${counterOffer}. This is a great deal!`,
          acceptOffer: false,
          counterOffer,
        }
      }
    }
  }

  async generateUrgentResponse(
    businessType: string,
    query: string,
    availableSlots?: string[]
  ): Promise<string> {
    const systemPrompt = `You are a quick-response AI for a ${businessType} in Kenya.
Respond to urgent queries in 1-2 sentences. Be helpful and action-oriented.
If slots are provided, mention the earliest available one.`

    const context = {
      businessType,
      availableSlots: availableSlots || ['tomorrow at 10 AM', 'tomorrow at 2 PM'],
      urgency: 'high',
    }

    return this.generateQuickResponse(systemPrompt, query, context)
  }

  async classifyUrgency(message: string): Promise<{
    isUrgent: boolean
    reason: string
  }> {
    const prompt = `Classify if this customer message requires immediate response:
"${message}"

Consider urgent if:
- Price negotiation in progress
- Immediate booking request
- Complaint or problem
- Time-sensitive inquiry

Respond with JSON: { isUrgent: boolean, reason: string }`

    const result = await this.generateQuickResponse(
      'You are an urgency classifier. Always respond with valid JSON.',
      prompt
    )

    try {
      return JSON.parse(result)
    } catch {
      // Simple keyword-based fallback
      const urgentKeywords = ['now', 'urgent', 'immediately', 'today', 'emergency', 'price', 'how much']
      const isUrgent = urgentKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      )

      return {
        isUrgent,
        reason: isUrgent ? 'Contains urgent keywords' : 'Standard inquiry',
      }
    }
  }
}

export const groqService = new GroqService()