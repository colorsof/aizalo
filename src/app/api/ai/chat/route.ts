import { NextRequest, NextResponse } from 'next/server'
import { aiRouter } from '@/lib/ai/ai-router'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, businessType, businessContext } = body

    if (!message || !businessType) {
      return NextResponse.json(
        { error: 'Message and businessType are required' },
        { status: 400 }
      )
    }

    // Process the message through AI router
    const aiResponse = await aiRouter.route({
      message,
      businessType,
      businessContext: businessContext || {
        businessName: 'Demo Business',
        location: 'Nairobi, Kenya'
      }
    })

    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    models: {
      gemini: !!process.env.GEMINI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      openai: !!process.env.OPENAI_API_KEY
    }
  })
}