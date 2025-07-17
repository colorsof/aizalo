import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser, clearAuthCookies } from '@/lib/auth';

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    if (user && user.userType === 'tenant') {
      // Log the logout event
      await supabase.from('system_logs').insert({
        level: 'info',
        source: 'auth',
        message: `Tenant user logged out: ${user.email}`,
        metadata: {
          user_id: user.sub,
          user_type: 'tenant',
          tenant_id: user.tenantId,
          role: user.role,
        },
      });
    }
    
    // Clear auth cookies
    clearAuthCookies();
    
    // Extract subdomain from request headers
    const host = request.headers.get('host') || '';
    const subdomain = host.split('.')[0];
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      redirectUrl: subdomain && subdomain !== 'localhost' && subdomain !== 'www' 
        ? `/${subdomain}/login` 
        : '/login',
    });
    
  } catch (error) {
    console.error('Tenant logout error:', error);
    
    // Even if error occurs, clear cookies
    clearAuthCookies();
    
    return NextResponse.json(
      { success: true, message: 'Logged out', redirectUrl: '/login' },
      { status: 200 }
    );
  }
}