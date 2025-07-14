/**
 * Simple integration manager for basic webhooks and free services
 * No SMS (too expensive), focus on free/included channels
 */

export interface Integration {
  id: string
  name: string
  description: string
  icon: string
  category: 'communication' | 'storage' | 'payment' | 'automation'
  status: 'active' | 'inactive' | 'coming_soon'
  requiresSetup: boolean
  isFree: boolean
}

export const AVAILABLE_INTEGRATIONS: Integration[] = [
  // Free Communication Channels
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Send and receive WhatsApp messages',
    icon: '💬',
    category: 'communication',
    status: 'active',
    requiresSetup: true,
    isFree: true
  },
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    description: 'Connect your Facebook page',
    icon: '👥',
    category: 'communication',
    status: 'active',
    requiresSetup: true,
    isFree: true
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Send automated emails',
    icon: '📧',
    category: 'communication',
    status: 'active',
    requiresSetup: false,
    isFree: true
  },
  
  // Free Storage/Export
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    description: 'Export leads and conversations',
    icon: '📊',
    category: 'storage',
    status: 'active',
    requiresSetup: true,
    isFree: true
  },
  {
    id: 'webhooks',
    name: 'Custom Webhooks',
    description: 'Send data to your own systems',
    icon: '🔗',
    category: 'automation',
    status: 'active',
    requiresSetup: true,
    isFree: true
  },
  
  // Payment (Kenya specific)
  {
    id: 'mpesa',
    name: 'M-Pesa',
    description: 'Accept payments via M-Pesa',
    icon: '📱',
    category: 'payment',
    status: 'coming_soon',
    requiresSetup: true,
    isFree: false
  },
  
  // Optional Premium
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect 5000+ apps (requires Zapier account)',
    icon: '⚡',
    category: 'automation',
    status: 'active',
    requiresSetup: true,
    isFree: false
  }
]

export class IntegrationManager {
  /**
   * Send data to a webhook URL
   */
  static async sendWebhook(url: string, data: any) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Business-Platform/1.0'
        },
        body: JSON.stringify(data)
      })
      
      return {
        success: response.ok,
        status: response.status
      }
    } catch (error) {
      console.error('Webhook send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Send email using free email service
   */
  static async sendEmail(to: string, subject: string, body: string) {
    // In production, use a service like SendGrid free tier
    // or Resend.com (free tier includes 3000 emails/month)
    console.log('Email would be sent:', { to, subject, body })
    
    // For now, just return success
    return { success: true }
  }

  /**
   * Export to Google Sheets (using their free API)
   */
  static async exportToSheets(spreadsheetId: string, data: any[]) {
    // This would use Google Sheets API
    // Free when using customer's own Google account
    console.log('Would export to sheets:', { spreadsheetId, rows: data.length })
    
    return { success: true }
  }

  /**
   * Post to Facebook (free API)
   */
  static async postToFacebook(pageId: string, message: string) {
    // Uses Facebook Graph API (free for page posts)
    console.log('Would post to Facebook:', { pageId, message })
    
    return { success: true }
  }
}

/**
 * Webhook templates for common scenarios
 */
export const WEBHOOK_TEMPLATES = {
  // When a new lead is captured
  newLead: {
    event: 'lead.captured',
    customer: {
      name: '{{customer_name}}',
      phone: '{{customer_phone}}',
      email: '{{customer_email}}'
    },
    source: '{{channel}}',
    inquiry: '{{message}}',
    timestamp: '{{timestamp}}'
  },
  
  // When a conversation ends
  conversationSummary: {
    event: 'conversation.completed',
    conversation_id: '{{conversation_id}}',
    duration_seconds: '{{duration}}',
    messages_count: '{{message_count}}',
    outcome: '{{outcome}}',
    next_action: '{{next_action}}'
  },
  
  // When an appointment is booked
  appointmentBooked: {
    event: 'appointment.scheduled',
    customer: '{{customer_name}}',
    date: '{{appointment_date}}',
    time: '{{appointment_time}}',
    service: '{{service_type}}',
    notes: '{{notes}}'
  }
}