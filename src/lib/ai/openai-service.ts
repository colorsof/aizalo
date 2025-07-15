import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface OpenAIServiceConfig {
  model?: string
  temperature?: number
  maxTokens?: number
}

export class OpenAIService {
  private model: string
  private temperature: number
  private maxTokens: number

  constructor(config: OpenAIServiceConfig = {}) {
    this.model = config.model || 'gpt-3.5-turbo'
    this.temperature = config.temperature || 0.7
    this.maxTokens = config.maxTokens || 150
  }

  async generateBackupResponse(
    systemPrompt: string,
    userMessage: string,
    context?: any
  ): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
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
      })

      return completion.choices[0]?.message?.content || 'I understand. Let me help you with that.'
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate backup response with OpenAI')
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

    return this.generateBackupResponse(systemPrompt, customerMessage, businessContext)
  }

  async handleEmergencyResponse(
    message: string,
    businessType: string,
    error: string
  ): Promise<string> {
    const systemPrompt = `You are a backup AI assistant for a ${businessType} in Kenya.
The primary AI services are temporarily unavailable.
Provide a helpful, professional response that acknowledges the situation gracefully.`

    const contextMessage = `Original message: ${message}\nError context: ${error}`

    try {
      return await this.generateBackupResponse(systemPrompt, contextMessage)
    } catch (backupError) {
      // Ultimate fallback
      return "I'm here to help! Our system is experiencing high demand, but I'm still available to assist you. Please tell me what you need, and I'll do my best to help."
    }
  }
}

export const openaiService = new OpenAIService()