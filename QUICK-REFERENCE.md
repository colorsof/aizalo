# Quick Reference Guide

## 🚀 For New AI Sessions

**Start with this message:**
```
I'm continuing the AI Business Platform project. I've read:
- ROADMAP.md (project overview)
- IMPLEMENTATION-GUIDE.md (checked progress tracker)
- Current focus: Building customer acquisition platform for Kenyan SMEs
- Key feature: Price haggling AI for local market
What should I work on today?
```

## 📂 Project Structure
```
ai-business-platform/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── lib/          # Utilities and helpers
│   ├── config/       # Configuration files
│   └── types/        # TypeScript types
├── supabase/
│   ├── migrations/   # Database migrations
│   └── schema.sql    # Database schema
├── public/           # Static assets
└── docs/            # Documentation

Key Files:
- /src/app/page.tsx - Landing page
- /src/types/database.ts - Database types
- /supabase/schema.sql - Multitenant schema
```

## 🛠️ Common Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter

# Database
npx supabase db reset     # Reset database
npx supabase db push      # Push migrations
npx supabase gen types    # Generate TypeScript types

# Git
git add .
git commit -m "feat: add price haggling to AI"
git push origin main
```

## 🔑 Key Technical Decisions

### Architecture
- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v3
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **AI**: Gemini Free (primary), GPT-3.5 (backup)

### Business Model
- **Tier 1** (Hotels, Real Estate): Ksh 5,000/month
- **Tier 2** (Salons, Clinics): Ksh 3,500/month  
- **Tier 3** (Law, Hardware): Ksh 2,500/month

### Core Features
1. **Price Haggling AI** (Must Have!)
2. **Multi-channel** (WhatsApp, FB, TikTok)
3. **Marketing Automation** (Posts, SEO, Ads)
4. **Industry Templates** (8 industries)
5. **Local Focus** (Kenyan market)

## 🎯 Current Priorities

### Technical
1. Complete WhatsApp integration
2. Build content generation system
3. Implement price haggling logic
4. Create industry demos

### Business
1. Get 3 pilot customers (Hotel, Restaurant, Real Estate)
2. Document success stories
3. Build referral program
4. Target Westlands/CBD first

## ⚠️ Important Context

### What This IS
- **Customer Acquisition Platform** (finds, engages, converts)
- **Marketing Automation** (not just chat)
- **Revenue Generator** (ROI focused)
- **Local Solution** (Kenyan culture aware)

### What This IS NOT
- Just another chatbot
- Generic global solution
- Expensive enterprise software
- Complex to use

## 🐛 Common Issues & Solutions

### Supabase Connection
```
Error: Failed to construct 'URL': Invalid URL
Solution: Check .env.local has valid Supabase credentials
```

### TypeScript Errors
```
Error: Type 'industry_type' does not exist
Solution: Run: npx supabase gen types typescript --local
```

### Tailwind Not Working
```
Solution: Make sure tailwind.config.ts includes all src paths
```

## 📝 Coding Standards

### File Naming
- Components: PascalCase (ChatInterface.tsx)
- Utilities: camelCase (formatCurrency.ts)
- Config: kebab-case (industries-config.ts)

### Git Commits
```
feat: add WhatsApp integration
fix: resolve price calculation bug
docs: update implementation guide
refactor: simplify content generation
```

### Comments
- No comments unless specifically requested
- Code should be self-documenting
- Use TypeScript types for clarity

## 🔗 External Resources

### APIs We Use
- WhatsApp Business: https://developers.facebook.com/docs/whatsapp
- Google My Business: https://developers.google.com/my-business
- Gemini AI: https://ai.google.dev/
- TikTok: https://developers.tiktok.com/

### Kenya Specific
- M-Pesa API: https://developer.safaricom.co.ke/
- AfricasTalking: https://africastalking.com/

## 💡 Remember

**The Mission**: Empower Kenyan SMEs to compete in the digital age through automated customer acquisition.

**The Method**: Start simple (templates), add AI gradually, always measure ROI.

**The Market**: Price-sensitive, relationship-focused, expects haggling.

**The Goal**: 100+ paying customers in 6 months, Ksh 750,000 MRR.