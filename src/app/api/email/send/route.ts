import { NextRequest, NextResponse } from 'next/server'
import { createEmailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, recipients, subject, content, data } = body

    // Initialize email service with configuration
    // In production, these would come from environment variables or database
    const emailService = createEmailService({
      provider: 'resend',
      apiKey: process.env.RESEND_API_KEY || '',
      defaultFrom: 'noreply@aizalo.com',
      defaultReplyTo: 'support@aizalo.com'
    })

    let result

    switch (type) {
      case 'welcome':
        if (!recipients[0]?.email || !data?.name || !data?.businessName) {
          return NextResponse.json(
            { error: 'Missing required fields for welcome email' },
            { status: 400 }
          )
        }
        result = await emailService.sendWelcomeEmail({
          email: recipients[0].email,
          name: data.name,
          businessName: data.businessName
        })
        break

      case 'campaign':
        if (!recipients || recipients.length === 0 || !subject || !content) {
          return NextResponse.json(
            { error: 'Missing required fields for campaign email' },
            { status: 400 }
          )
        }
        result = await emailService.sendCampaignEmail({
          recipients,
          subject,
          content,
          businessName: data?.businessName || 'Aizalo'
        })
        break

      case 'transactional':
        if (!recipients[0]?.email || !data?.transactionType) {
          return NextResponse.json(
            { error: 'Missing required fields for transactional email' },
            { status: 400 }
          )
        }
        result = await emailService.sendTransactionalEmail({
          to: recipients[0].email,
          type: data.transactionType,
          data
        })
        break

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json(result)
    } else {
      // Handle different error types
      let errorMessage = 'Failed to send email'
      if ('error' in result && result.error) {
        errorMessage = result.error
      } else if ('errors' in result && result.errors && result.errors.length > 0) {
        errorMessage = result.errors.map(e => e.error).join(', ')
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Validate email endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { emails } = body

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Please provide an array of emails to validate' },
        { status: 400 }
      )
    }

    const emailService = createEmailService({
      provider: 'resend',
      apiKey: process.env.RESEND_API_KEY || ''
    })

    const result = await emailService.validateEmailList(emails)

    return NextResponse.json({
      success: true,
      ...result,
      stats: {
        total: emails.length,
        valid: result.valid.length,
        invalid: result.invalid.length,
        validationRate: ((result.valid.length / emails.length) * 100).toFixed(2) + '%'
      }
    })
  } catch (error) {
    console.error('Email validation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to validate emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}