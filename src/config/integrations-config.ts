/**
 * Integration configuration focusing on FREE and built-in services
 * SMS removed due to cost - available as paid add-on only
 */

export const IntegrationConfig = {
  // Free communication channels included in all plans
  included: {
    whatsapp: {
      name: 'WhatsApp Business',
      description: 'Included in all plans',
      limits: {
        starter: '500 messages/month',
        professional: '2,000 messages/month',
        business: '5,000 messages/month'
      }
    },
    facebook: {
      name: 'Facebook Messenger',
      description: 'Included in all plans',
      limits: 'Unlimited messages'
    },
    email: {
      name: 'Email Notifications',
      description: 'Basic email included',
      limits: {
        starter: '100 emails/month',
        professional: '500 emails/month',
        business: '2,000 emails/month'
      }
    },
    webhooks: {
      name: 'Custom Webhooks',
      description: 'Send data to your systems',
      limits: 'Unlimited webhook calls'
    }
  },

  // Optional add-ons (customer pays separately)
  addons: {
    sms: {
      name: 'SMS Notifications',
      description: 'Via AfricasTalking',
      pricing: 'Ksh 2 per SMS (billed separately)',
      setup: 'Requires AfricasTalking account'
    },
    mpesa: {
      name: 'M-Pesa Payments',
      description: 'Accept payments directly',
      pricing: 'Coming soon',
      setup: 'Requires Safaricom approval'
    },
    zapier: {
      name: 'Zapier Integration',
      description: 'Connect 5000+ apps',
      pricing: 'Free Zapier tier available',
      setup: 'Requires Zapier account'
    }
  },

  // What we handle vs what Zapier handles
  comparison: {
    ourPlatform: [
      'AI conversations (WhatsApp, FB)',
      'Lead qualification',
      'Basic email sending',
      'Webhook notifications',
      'Customer data storage'
    ],
    zapier: [
      'CRM integration (Salesforce, HubSpot)',
      'Accounting software (QuickBooks)',
      'Email marketing (Mailchimp)',
      'Project management (Trello, Asana)',
      'Google Workspace automation'
    ]
  }
}