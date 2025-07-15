# WhatsApp Business API Setup Guide

## Prerequisites
1. Facebook Business Account
2. WhatsApp Business Account
3. Verified Business
4. Phone number not registered with WhatsApp

## Step 1: Create Meta App
1. Go to [Meta for Developers](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Select "Business" type
4. Choose "Business" → "WhatsApp" product
5. Name your app (e.g., "Aizalo WhatsApp")

## Step 2: Get WhatsApp Credentials
1. In your app dashboard, go to "WhatsApp" → "Getting Started"
2. You'll get:
   - **Phone Number ID**: Copy this
   - **WhatsApp Business Account ID**: Copy this
   - **Temporary Access Token**: Copy this (valid for 24 hours)

## Step 3: Get Permanent Access Token
1. Go to "System Users" in Business Settings
2. Create a system user
3. Generate a permanent token with these permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`

## Step 4: Configure Webhook
1. In your app, go to "WhatsApp" → "Configuration"
2. Set Webhook URL: `https://your-domain.vercel.app/api/whatsapp/webhook`
3. Set Verify Token: `aizalo_webhook_verify_2024`
4. Subscribe to these fields:
   - `messages`
   - `message_status`
   - `message_template_status_update`

## Step 5: Add Environment Variables to Vercel
```env
WHATSAPP_WEBHOOK_VERIFY_TOKEN=aizalo_webhook_verify_2024
WHATSAPP_ACCESS_TOKEN=<your_permanent_token>
WHATSAPP_APP_SECRET=<from_app_settings>
WHATSAPP_PHONE_ID=<from_getting_started>
WHATSAPP_BUSINESS_ACCOUNT_ID=<from_getting_started>
```

## Step 6: Verify Setup
1. Test webhook verification:
   ```bash
   curl https://your-domain.vercel.app/api/whatsapp/test
   ```

2. Send test message:
   ```bash
   curl -X POST https://your-domain.vercel.app/api/whatsapp/test \
     -H "Content-Type: application/json" \
     -d '{
       "action": "send_message",
       "phoneNumber": "254712345678",
       "message": "Hello from Aizalo!",
       "phoneNumberId": "<your_phone_id>"
     }'
   ```

## Step 7: Create Message Templates
1. Go to "WhatsApp Manager" → "Message Templates"
2. Create templates for:
   - Welcome message
   - Order confirmation
   - Appointment reminder
   - Marketing campaigns

## Testing Numbers
Meta provides test numbers for development:
- Use the "Test Numbers" section in your app
- Add your personal number as a test recipient

## Common Issues
1. **Webhook not verifying**: Check verify token matches exactly
2. **Messages not sending**: Ensure recipient has opted in
3. **Access denied**: Check token permissions
4. **Rate limits**: Start with Tier 1 (1,000 messages/day)

## Next Steps
1. Apply for business verification to increase limits
2. Set up payment method for messaging costs
3. Create custom message templates
4. Implement opt-in flow for customers