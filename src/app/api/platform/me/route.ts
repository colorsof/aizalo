import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/auth';

/**
 * Protected endpoint to get current platform user details
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const { supabase, response } = createRouteHandlerClient(request);
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify this is a platform user
    if (session.user.user_metadata?.userType !== 'platform') {
      return NextResponse.json(
        { error: 'Unauthorized - Not a platform user' },
        { status: 403 }
      );
    }
    
    // Get platform user ID from metadata
    const platformUserId = session.user.user_metadata?.platformUserId;
    
    if (!platformUserId) {
      return NextResponse.json(
        { error: 'Platform user ID not found' },
        { status: 500 }
      );
    }
    
    // Get full user details from database
    // RLS will ensure user can only see their own data or what they have access to
    const { data: user, error } = await supabase
      .from('platform_users')
      .select('id, email, full_name, role, is_active, created_at, last_login_at')
      .eq('id', platformUserId)
      .single();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get additional statistics based on role
    let stats = {};
    
    if (['owner', 'admin'].includes(user.role)) {
      // Get platform statistics
      const [tenantCount, userCount, revenueData] = await Promise.all([
        supabase.from('tenants').select('id', { count: 'exact' }),
        supabase.from('platform_users').select('id', { count: 'exact' }),
        supabase.from('tenants')
          .select('subscription_status')
          .eq('subscription_status', 'active')
      ]);
      
      stats = {
        totalTenants: tenantCount.count || 0,
        totalUsers: userCount.count || 0,
        activeTenants: revenueData.data?.length || 0,
      };
    } else if (user.role === 'sales') {
      // Get sales statistics
      const { data: leads, count } = await supabase
        .from('sales_leads')
        .select('id', { count: 'exact' })
        .eq('assigned_to', platformUserId);
      
      stats = {
        assignedLeads: count || 0,
      };
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
      stats,
    }, {
      headers: response.headers,
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}