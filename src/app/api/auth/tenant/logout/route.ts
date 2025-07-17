import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const { supabase, response } = createRouteHandlerClient(request);
    
    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Log the logout event
      await supabase.rpc('log_auth_event', {
        p_event_type: 'logout',
        p_user_id: session.user.user_metadata?.tenantUserId,
        p_user_email: session.user.email,
        p_user_type: 'tenant',
        p_metadata: { 
          role: session.user.user_metadata?.role,
          tenantId: session.user.user_metadata?.tenantId
        }
      });
    }
    
    // Sign out
    await supabase.auth.signOut();
    
    // Extract subdomain from request headers
    const host = request.headers.get('host') || '';
    const subdomain = host.split('.')[0];
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      redirectUrl: subdomain && subdomain !== 'localhost' && subdomain !== 'www' 
        ? `/${subdomain}/login` 
        : '/login',
    }, {
      headers: response.headers,
    });
    
  } catch (error) {
    console.error('Tenant logout error:', error);
    
    return NextResponse.json(
      { success: true, message: 'Logged out', redirectUrl: '/login' },
      { status: 200 }
    );
  }
}