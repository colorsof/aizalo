import crypto from 'crypto'
import { aiRouter } from '@/lib/ai'

// Verify webhook signature from Meta
export function verifyWebhook(payload: string, signature: string | null): boolean {
  if (!signature || !process.env.WHATSAPP_APP_SECRET) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
    .update(payload)
    .digest('hex')

  return signature === `sha256=${expectedSignature}`
}

// Process incoming WhatsApp message
export async function processWhatsAppMessage(message: {
  from: string
  messageId: string
  timestamp: string
  text?: string
  type: string
  businessPhoneId: string
}) {
  try {
    // Only process text messages for now
    if (message.type !== 'text' || !message.text) {
      return
    }

    console.log(`Processing WhatsApp message from ${message.from}: ${message.text}`)

    // TODO: Look up business context from database based on businessPhoneId
    // For now, use demo context
    const businessContext = {
      businessName: 'Demo Business',
      businessType: 'hardware_store',
      location: 'Nairobi, Kenya',
      services: ['Construction materials', 'Tools', 'Paint', 'Plumbing supplies']
    }

    // Get AI response
    const aiResponse = await aiRouter.route({
      message: message.text,
      businessType: businessContext.businessType,
      businessContext
    })

    // Send response back via WhatsApp
    await sendWhatsAppMessage(message.from, aiResponse.response, message.businessPhoneId)

    // TODO: Store conversation in database
    console.log(`AI Response (${aiResponse.aiModel}): ${aiResponse.response}`)
  } catch (error) {
    console.error('Error processing WhatsApp message:', error)
    // Send fallback message
    await sendWhatsAppMessage(
      message.from,
      "I apologize, but I'm having trouble processing your message. Please try again in a moment.",
      message.businessPhoneId
    )
  }
}

// Send WhatsApp message
export async function sendWhatsAppMessage(
  to: string,
  text: string,
  phoneNumberId: string
) {
  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: text
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${JSON.stringify(data)}`)
    }

    console.log(`Message sent to ${to}: ${data.messages?.[0]?.id}`)
    return data
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    throw error
  }
}

// Send WhatsApp template message (for initial contact)
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  phoneNumberId: string,
  components?: any[]
) {
  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components || []
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${JSON.stringify(data)}`)
    }

    return data
  } catch (error) {
    console.error('Error sending WhatsApp template:', error)
    throw error
  }
}

// Mark message as read
export async function markMessageAsRead(
  messageId: string,
  phoneNumberId: string
) {
  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to mark message as read:', data)
    }

    return data
  } catch (error) {
    console.error('Error marking message as read:', error)
  }
}

// Get WhatsApp Business Profile
export async function getBusinessProfile(phoneNumberId: string) {
  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/whatsapp_business_profile`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${JSON.stringify(data)}`)
    }

    return data.data?.[0]
  } catch (error) {
    console.error('Error getting business profile:', error)
    throw error
  }
}