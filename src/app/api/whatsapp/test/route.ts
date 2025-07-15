import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppMessage, sendWhatsAppTemplate, getBusinessProfile } from '@/lib/whatsapp'

// Test endpoint to verify WhatsApp integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, phoneNumber, message, phoneNumberId } = body

    // Validate required fields
    if (!action || !phoneNumberId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, phoneNumberId' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'send_message':
        if (!phoneNumber || !message) {
          return NextResponse.json(
            { error: 'Missing phoneNumber or message' },
            { status: 400 }
          )
        }
        result = await sendWhatsAppMessage(phoneNumber, message, phoneNumberId)
        break

      case 'send_template':
        if (!phoneNumber) {
          return NextResponse.json(
            { error: 'Missing phoneNumber' },
            { status: 400 }
          )
        }
        // Send a hello_world template (you need to create this in Meta Business)
        result = await sendWhatsAppTemplate(
          phoneNumber,
          'hello_world',
          'en',
          phoneNumberId
        )
        break

      case 'get_profile':
        result = await getBusinessProfile(phoneNumberId)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: send_message, send_template, or get_profile' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      result
    })
  } catch (error) {
    console.error('WhatsApp test error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check configuration
export async function GET() {
  const config = {
    webhook_verify_token: !!process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    access_token: !!process.env.WHATSAPP_ACCESS_TOKEN,
    app_secret: !!process.env.WHATSAPP_APP_SECRET,
    phone_number_id: !!process.env.WHATSAPP_PHONE_ID,
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app'}/api/whatsapp/webhook`
  }

  return NextResponse.json({
    status: 'WhatsApp integration status',
    configured: Object.values(config).every(v => v === true),
    config,
    instructions: {
      1: 'Add these environment variables to Vercel',
      2: 'Set up webhook URL in Meta Business Manager',
      3: 'Verify the webhook with GET request',
      4: 'Test sending messages with POST to this endpoint'
    }
  })
}