import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/auth';

/**
 * Protected endpoint to get current tenant user details
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
    
    // Verify this is a tenant user
    if (session.user.user_metadata?.userType !== 'tenant') {
      return NextResponse.json(
        { error: 'Unauthorized - Not a tenant user' },
        { status: 403 }
      );
    }
    
    // Get tenant user ID and tenant ID from metadata
    const tenantUserId = session.user.user_metadata?.tenantUserId;
    const tenantId = session.user.user_metadata?.tenantId;
    
    if (!tenantUserId || !tenantId) {
      return NextResponse.json(
        { error: 'User metadata not found' },
        { status: 500 }
      );
    }
    
    // Get full user details from database
    // RLS with auth_tenant_id() will ensure proper tenant isolation
    const { data: user, error: userError } = await supabase
      .from('tenant_users')
      .select('id, email, full_name, role, is_active, created_at, last_login_at, tenant_id')
      .eq('id', tenantUserId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get tenant details
    // RLS with auth_has_tenant_access() ensures proper access control
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, business_name, subdomain, subscription_status, created_at')
      .eq('id', tenantId)
      .single();
    
    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    // Get additional statistics based on role
    let stats = {};
    
    if (['owner', 'admin'].includes(user.role)) {
      // Get tenant statistics
      const [userCount, whatsappCount, campaignCount] = await Promise.all([
        supabase
          .from('tenant_users')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId),
        supabase
          .from('whatsapp_sessions')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId),
        supabase
          .from('campaigns')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId),
      ]);
      
      stats = {
        totalUsers: userCount.count || 0,
        totalWhatsAppSessions: whatsappCount.count || 0,
        totalCampaigns: campaignCount.count || 0,
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
      tenant: {
        id: tenant.id,
        name: tenant.business_name,
        subdomain: tenant.subdomain,
        subscriptionStatus: tenant.subscription_status,
        createdAt: tenant.created_at,
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