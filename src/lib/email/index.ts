interface EmailProvider {
  sendEmail(params: EmailParams): Promise<EmailResult>
  sendBulkEmails(params: BulkEmailParams): Promise<BulkEmailResult>
  validateEmail(email: string): boolean
}

interface EmailParams {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
  }>
}

interface BulkEmailParams {
  recipients: Array<{
    email: string
    name?: string
    data?: Record<string, any>
  }>
  subject: string
  template: string
  from?: string
  replyTo?: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

interface BulkEmailResult {
  success: boolean
  sent: number
  failed: number
  errors?: Array<{ email: string; error: string }>
}

// Resend Provider Implementation
class ResendProvider implements EmailProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendEmail(params: EmailParams): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: params.from || 'noreply@aizalo.com',
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
          reply_to: params.replyTo
        })
      })

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          error: `Resend error: ${error}`
        }
      }

      const data = await response.json()
      return {
        success: true,
        messageId: data.id
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async sendBulkEmails(params: BulkEmailParams): Promise<BulkEmailResult> {
    let sent = 0
    let failed = 0
    const errors: Array<{ email: string; error: string }> = []

    // Process in batches of 10
    const batchSize = 10
    for (let i = 0; i < params.recipients.length; i += batchSize) {
      const batch = params.recipients.slice(i, i + batchSize)
      
      await Promise.all(batch.map(async (recipient) => {
        const html = this.renderTemplate(params.template, recipient.data || {})
        const result = await this.sendEmail({
          to: recipient.email,
          subject: params.subject,
          html,
          from: params.from,
          replyTo: params.replyTo
        })

        if (result.success) {
          sent++
        } else {
          failed++
          errors.push({ email: recipient.email, error: result.error || 'Unknown error' })
        }
      }))

      // Rate limiting - wait 1 second between batches
      if (i + batchSize < params.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return {
      success: failed === 0,
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match
    })
  }
}

// Email Service Orchestrator
export class EmailService {
  private provider: EmailProvider
  private defaultFrom: string
  private defaultReplyTo: string

  constructor(config: {
    provider: 'resend' | 'sendgrid' | 'mailgun'
    apiKey: string
    defaultFrom?: string
    defaultReplyTo?: string
  }) {
    this.defaultFrom = config.defaultFrom || 'noreply@aizalo.com'
    this.defaultReplyTo = config.defaultReplyTo || 'support@aizalo.com'

    switch (config.provider) {
      case 'resend':
        this.provider = new ResendProvider(config.apiKey)
        break
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`)
    }
  }

  async sendWelcomeEmail(customer: {
    email: string
    name: string
    businessName: string
  }): Promise<EmailResult> {
    const template = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to {{businessName}}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background-color: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to {{businessName}}!</h1>
            </div>
            <div class="content">
              <p>Hi {{name}},</p>
              <p>Thank you for connecting with us! We're excited to have you as our customer.</p>
              <p>Here's what you can expect from us:</p>
              <ul>
                <li>Quick responses to your inquiries</li>
                <li>Exclusive offers and promotions</li>
                <li>Updates on new products and services</li>
                <li>Personalized recommendations</li>
              </ul>
              <p>If you have any questions, feel free to reply to this email or message us on WhatsApp.</p>
              <a href="https://wa.me/{{whatsappNumber}}" class="button">Message us on WhatsApp</a>
            </div>
            <div class="footer">
              <p>&copy; 2025 {{businessName}}. All rights reserved.</p>
              <p>You're receiving this email because you connected with us.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const html = template
      .replace(/\{\{businessName\}\}/g, customer.businessName)
      .replace(/\{\{name\}\}/g, customer.name)
      .replace(/\{\{whatsappNumber\}\}/g, '254712345678')

    return this.provider.sendEmail({
      to: customer.email,
      subject: `Welcome to ${customer.businessName}!`,
      html,
      from: this.defaultFrom,
      replyTo: this.defaultReplyTo
    })
  }

  async sendCampaignEmail(campaign: {
    recipients: Array<{ email: string; name?: string }>
    subject: string
    content: string
    businessName: string
  }): Promise<BulkEmailResult> {
    const template = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>{{subject}}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #ffffff; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; background-color: #f9fafb; }
            .unsubscribe { color: #6b7280; text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>{{businessName}}</h2>
            </div>
            <div class="content">
              {{content}}
            </div>
            <div class="footer">
              <p>&copy; 2025 {{businessName}}. All rights reserved.</p>
              <p>
                You're receiving this because you're a valued customer.
                <br>
                <a href="#" class="unsubscribe">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.provider.sendBulkEmails({
      recipients: campaign.recipients,
      subject: campaign.subject,
      template,
      from: this.defaultFrom,
      replyTo: this.defaultReplyTo
    })
  }

  async sendTransactionalEmail(params: {
    to: string
    type: 'order_confirmation' | 'appointment_reminder' | 'payment_receipt' | 'password_reset'
    data: Record<string, any>
  }): Promise<EmailResult> {
    const templates: Record<string, { subject: string; html: string }> = {
      order_confirmation: {
        subject: 'Order Confirmation - #{{orderId}}',
        html: `
          <h2>Thank you for your order!</h2>
          <p>Hi {{customerName}},</p>
          <p>We've received your order #{{orderId}} and it's being processed.</p>
          <h3>Order Details:</h3>
          <p>{{orderDetails}}</p>
          <p><strong>Total: KSH {{totalAmount}}</strong></p>
          <p>We'll notify you once your order is ready.</p>
        `
      },
      appointment_reminder: {
        subject: 'Appointment Reminder - {{date}}',
        html: `
          <h2>Appointment Reminder</h2>
          <p>Hi {{customerName}},</p>
          <p>This is a reminder about your appointment:</p>
          <p><strong>Date:</strong> {{date}}<br>
          <strong>Time:</strong> {{time}}<br>
          <strong>Service:</strong> {{service}}</p>
          <p>Please arrive 10 minutes early. If you need to reschedule, please contact us.</p>
        `
      },
      payment_receipt: {
        subject: 'Payment Receipt - KSH {{amount}}',
        html: `
          <h2>Payment Received</h2>
          <p>Hi {{customerName}},</p>
          <p>We've received your payment of <strong>KSH {{amount}}</strong>.</p>
          <p><strong>Transaction ID:</strong> {{transactionId}}<br>
          <strong>Date:</strong> {{date}}</p>
          <p>Thank you for your payment!</p>
        `
      },
      password_reset: {
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset</h2>
          <p>Hi {{customerName}},</p>
          <p>We received a request to reset your password. Click the link below to reset it:</p>
          <p><a href="{{resetLink}}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
          <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        `
      }
    }

    const template = templates[params.type]
    if (!template) {
      return {
        success: false,
        error: `Unknown email type: ${params.type}`
      }
    }

    // Render template with data
    let html = template.html
    let subject = template.subject
    
    Object.entries(params.data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      html = html.replace(regex, String(value))
      subject = subject.replace(regex, String(value))
    })

    return this.provider.sendEmail({
      to: params.to,
      subject,
      html: this.wrapInBaseTemplate(html, params.data.businessName || 'Aizalo'),
      from: this.defaultFrom,
      replyTo: this.defaultReplyTo
    })
  }

  async validateEmailList(emails: string[]): Promise<{
    valid: string[]
    invalid: string[]
  }> {
    const valid: string[] = []
    const invalid: string[] = []

    emails.forEach(email => {
      if (this.provider.validateEmail(email.trim())) {
        valid.push(email.trim())
      } else {
        invalid.push(email.trim())
      }
    })

    return { valid, invalid }
  }

  private wrapInBaseTemplate(content: string, businessName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .content { 
              padding: 30px;
            }
            .footer { 
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 12px;
              background-color: #f9fafb;
              border-top: 1px solid #e5e7eb;
            }
            a { color: #2563eb; }
            h1, h2, h3 { color: #1f2937; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>&copy; 2025 ${businessName}. All rights reserved.</p>
              <p>Powered by Aizalo - AI Marketing & Sales Platform</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

// Export factory function
export const createEmailService = (config: {
  provider: 'resend' | 'sendgrid' | 'mailgun'
  apiKey: string
  defaultFrom?: string
  defaultReplyTo?: string
}) => {
  return new EmailService(config)
}