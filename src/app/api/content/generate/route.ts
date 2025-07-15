import { NextRequest, NextResponse } from 'next/server'
import { aiRouter } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessType, campaign } = body

    if (!businessType || !campaign) {
      return NextResponse.json(
        { error: 'Business type and campaign details are required' },
        { status: 400 }
      )
    }

    // Generate marketing content using AI
    const result = await aiRouter.generateMarketing(businessType, campaign)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}