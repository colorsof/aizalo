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
    
    if (user && user.userType === 'platform') {
      // Log the logout event
      await supabase.from('system_logs').insert({
        level: 'info',
        source: 'auth',
        message: `Platform user logged out: ${user.email}`,
        metadata: {
          user_id: user.sub,
          user_type: 'platform',
          role: user.role,
        },
      });
    }
    
    // Clear auth cookies
    clearAuthCookies();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      redirectUrl: '/login',
    });
    
  } catch (error) {
    console.error('Platform logout error:', error);
    
    // Even if error occurs, clear cookies
    clearAuthCookies();
    
    return NextResponse.json(
      { success: true, message: 'Logged out', redirectUrl: '/login' },
      { status: 200 }
    );
  }
}