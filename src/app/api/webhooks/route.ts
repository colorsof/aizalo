import { NextResponse } from 'next/server'

/**
 * Simple webhook endpoint for integrations
 * Customers can send events here or receive events from us
 */

// Webhook event types
export type WebhookEvent = 
  | 'conversation.started'
  | 'conversation.completed'
  | 'lead.captured'
  | 'appointment.scheduled'
  | 'order.received'
  | 'payment.requested'

interface WebhookPayload {
  event: WebhookEvent
  tenant_id: string
  timestamp: string
  data: {
    conversation_id?: string
    customer?: {
      name?: string
      phone?: string
      email?: string
    }
    message?: string
    metadata?: Record<string, any>
  }
}

// POST /api/webhooks - Receive webhooks from external services
export async function POST(request: Request) {
  try {
    const payload: WebhookPayload = await request.json()
    
    // Verify webhook signature if needed
    const signature = request.headers.get('x-webhook-signature')
    if (signature) {
      // TODO: Implement signature verification
    }

    // Log the webhook
    console.log('Webhook received:', {
      event: payload.event,
      tenant: payload.tenant_id,
      timestamp: payload.timestamp
    })

    // Process based on event type
    switch (payload.event) {
      case 'conversation.completed':
        // Could trigger follow-up actions here
        await handleConversationCompleted(payload)
        break
        
      case 'lead.captured':
        // Save to database or trigger notifications
        await handleLeadCaptured(payload)
        break
        
      case 'appointment.scheduled':
        // Add to calendar, send confirmations
        await handleAppointmentScheduled(payload)
        break
        
      default:
        console.log('Unhandled webhook event:', payload.event)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed' 
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid webhook payload' },
      { status: 400 }
    )
  }
}

// Handler functions
async function handleConversationCompleted(payload: WebhookPayload) {
  // Example: Send conversation summary to customer's webhook
  const { customer, conversation_id } = payload.data
  
  // In production, fetch tenant's webhook URL from database
  const tenantWebhookUrl = process.env.TENANT_WEBHOOK_URL
  
  if (tenantWebhookUrl) {
    await fetch(tenantWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ai_conversation_completed',
        conversation_id,
        customer,
        timestamp: new Date().toISOString()
      })
    })
  }
}

async function handleLeadCaptured(payload: WebhookPayload) {
  // Example: Could send to Google Sheets or CRM
  console.log('New lead captured:', payload.data.customer)
}

async function handleAppointmentScheduled(payload: WebhookPayload) {
  // Example: Could add to Google Calendar
  console.log('Appointment scheduled:', payload.data.metadata)
}