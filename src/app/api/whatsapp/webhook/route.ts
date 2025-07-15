import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhook, processWhatsAppMessage } from '@/lib/whatsapp'

// WhatsApp webhook verification (GET request from Meta)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    console.log('Webhook verification attempt:', { mode, token, challenge })

    // Check if this is a valid verification request
    // For initial setup, we'll hardcode the token. Update this after adding env vars to Vercel
    const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'aizalo_webhook_verify_2024'
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified successfully')
      // Return only the challenge value as plain text
      return new Response(challenge, { 
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        }
      })
    }

    console.log('Webhook verification failed:', { 
      expectedToken: VERIFY_TOKEN, 
      receivedToken: token,
      mode 
    })

    return NextResponse.json(
      { error: 'Invalid verification token' },
      { status: 403 }
    )
  } catch (error) {
    console.error('Webhook verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}

// Handle incoming WhatsApp messages (POST request from Meta)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify the webhook signature
    const signature = request.headers.get('x-hub-signature-256')
    if (!verifyWebhook(JSON.stringify(body), signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Process the WhatsApp message
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    if (value?.messages) {
      // Handle incoming messages
      for (const message of value.messages) {
        await processWhatsAppMessage({
          from: message.from,
          messageId: message.id,
          timestamp: message.timestamp,
          text: message.text?.body,
          type: message.type,
          businessPhoneId: value.metadata.phone_number_id
        })
      }
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  }
}