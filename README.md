# Aizalo - AI Marketing & Sales Platform

AI-powered marketing and sales automation platform for Kenyan SMEs.

## Features

- 🤖 AI-powered customer conversations
- 💬 Multi-channel support (WhatsApp, Facebook, Instagram, TikTok)
- 📊 Real-time analytics dashboard
- 🎯 Lead management system
- 📧 Email marketing campaigns
- 💰 Price haggling engine
- 🔄 Real-time updates with Supabase

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini, Groq, OpenAI
- **Real-time**: Supabase Realtime
- **Email**: Resend
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.local`)
4. Run development server: `npm run dev`

## Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

# WhatsApp
WHATSAPP_WEBHOOK_TOKEN=your_webhook_token
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# Email
RESEND_API_KEY=your_resend_api_key
```

## License

MIT