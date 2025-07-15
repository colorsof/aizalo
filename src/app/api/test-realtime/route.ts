import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { type, tenantId = 'test-tenant-id', userId = 'test-user-id' } = body
    
    const timestamp = new Date().toISOString()
    
    switch (type) {
      case 'conversation':
        // Create a test conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            tenant_id: tenantId,
            customer_id: 'test-customer-id',
            channel: 'whatsapp',
            status: 'active',
            customer_name: `Test Customer ${Math.floor(Math.random() * 1000)}`,
            customer_phone: `+254${Math.floor(Math.random() * 900000000 + 100000000)}`,
            last_message: 'Hello, I need help with your products',
            last_message_time: timestamp,
            unread_count: 1
          })
          .select()
          .single()
          
        if (convError) throw convError
        
        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'conversation',
            title: 'New Conversation',
            message: `New conversation from ${conversation.customer_name}`,
            data: { conversation_id: conversation.id }
          })
          
        return NextResponse.json({ success: true, conversation })
        
      case 'lead':
        // Create a test lead
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .insert({
            tenant_id: tenantId,
            name: `Test Lead ${Math.floor(Math.random() * 1000)}`,
            email: `lead${Math.floor(Math.random() * 1000)}@example.com`,
            phone: `+254${Math.floor(Math.random() * 900000000 + 100000000)}`,
            source: 'whatsapp',
            status: 'new'
          })
          .select()
          .single()
          
        if (leadError) throw leadError
        
        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'lead',
            title: 'New Lead',
            message: `New lead: ${lead.name}`,
            data: { lead_id: lead.id }
          })
          
        return NextResponse.json({ success: true, lead })
        
      case 'sale':
        // Create a test order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            tenant_id: tenantId,
            customer_id: 'test-customer-id',
            amount: Math.floor(Math.random() * 50000 + 10000),
            status: 'completed'
          })
          .select()
          .single()
          
        if (orderError) throw orderError
        
        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'sale',
            title: 'New Sale!',
            message: `Sale completed: KSH ${order.amount.toLocaleString()}`,
            data: { order_id: order.id }
          })
          
        return NextResponse.json({ success: true, order })
        
      case 'activity':
        // Create test activity
        const activities = [
          { type: 'conversation', message: 'Customer started a new chat' },
          { type: 'lead', message: 'New lead from Facebook' },
          { type: 'sale', message: 'Payment received from customer' },
          { type: 'campaign', message: 'WhatsApp campaign sent to 100 customers' }
        ]
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)]
        
        const { data: activity, error: activityError } = await supabase
          .from('activity_log')
          .insert({
            tenant_id: tenantId,
            type: randomActivity.type as any,
            message: randomActivity.message,
            data: {}
          })
          .select()
          .single()
          
        if (activityError) throw activityError
        
        return NextResponse.json({ success: true, activity })
        
      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: conversation, lead, sale, or activity' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Test realtime error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create test data' },
      { status: 500 }
    )
  }
}

// GET endpoint to test if the API is working
export async function GET() {
  return NextResponse.json({
    message: 'Test Realtime API',
    endpoints: {
      POST: {
        description: 'Create test data for real-time updates',
        body: {
          type: 'conversation | lead | sale | activity',
          tenantId: 'optional, defaults to test-tenant-id',
          userId: 'optional, defaults to test-user-id'
        }
      }
    }
  })
}