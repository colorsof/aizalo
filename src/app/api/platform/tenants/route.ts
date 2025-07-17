import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase';

/**
 * Protected endpoint to manage tenants (platform admins only)
 */
export async function GET(request: NextRequest) {
  try {
    // Get user info from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userType = request.headers.get('x-user-type');
    
    if (!userId || userType !== 'platform') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only owner and admin can view all tenants
    if (!['owner', 'admin'].includes(userRole!)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Get auth token for RLS
    const token = request.cookies.get('platform-auth')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'No auth token found' },
        { status: 401 }
      );
    }
    
    // Create authenticated Supabase client with RLS
    // Our auth_is_platform_owner() and auth_is_platform_admin() functions will handle access
    const supabase = await getAuthenticatedSupabase(
      { sub: userId, email: '', role: userRole as any, userType: 'platform' } as any,
      token
    );
    
    // Build query
    let query = supabase
      .from('tenants')
      .select(`
        id,
        business_name,
        subdomain,
        owner_email,
        owner_phone,
        subscription_status,
        subscription_plan,
        created_at,
        deleted_at
      `, { count: 'exact' });
    
    // Apply filters
    if (status) {
      query = query.eq('subscription_status', status);
    }
    
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,owner_email.ilike.%${search}%,subdomain.ilike.%${search}%`);
    }
    
    // Only show non-deleted tenants by default
    query = query.is('deleted_at', null);
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    // Execute query
    const { data: tenants, error, count } = await query;
    
    if (error) {
      console.error('Error fetching tenants:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tenants' },
        { status: 500 }
      );
    }
    
    // Get additional stats for each tenant
    const tenantsWithStats = await Promise.all(
      (tenants || []).map(async (tenant) => {
        const [userCount, sessionCount] = await Promise.all([
          supabase
            .from('tenant_users')
            .select('id', { count: 'exact' })
            .eq('tenant_id', tenant.id),
          supabase
            .from('whatsapp_sessions')
            .select('id', { count: 'exact' })
            .eq('tenant_id', tenant.id),
        ]);
        
        return {
          ...tenant,
          stats: {
            totalUsers: userCount.count || 0,
            totalSessions: sessionCount.count || 0,
          },
        };
      })
    );
    
    return NextResponse.json({
      tenants: tenantsWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
    
  } catch (error) {
    console.error('Error in tenants endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create a new tenant (platform admins only)
 */
export async function POST(request: NextRequest) {
  try {
    // Get user info from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userType = request.headers.get('x-user-type');
    
    if (!userId || userType !== 'platform') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only owner and admin can create tenants
    if (!['owner', 'admin'].includes(userRole!)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      businessName,
      subdomain,
      ownerEmail,
      ownerPhone,
      ownerName,
      subscriptionPlan = 'trial',
    } = body;
    
    // Validate required fields
    if (!businessName || !subdomain || !ownerEmail || !ownerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // For creating new tenants, we need admin privileges
    const adminClient = createAdminClient();
    
    // Check if subdomain is already taken
    const { data: existingTenant } = await adminClient
      .from('tenants')
      .select('id')
      .eq('subdomain', subdomain)
      .single();
    
    if (existingTenant) {
      return NextResponse.json(
        { error: 'Subdomain already taken' },
        { status: 400 }
      );
    }
    
    // Create tenant
    const { data: tenant, error: tenantError } = await adminClient
      .from('tenants')
      .insert({
        business_name: businessName,
        subdomain,
        owner_email: ownerEmail,
        owner_phone: ownerPhone,
        subscription_plan: subscriptionPlan,
        subscription_status: subscriptionPlan === 'trial' ? 'trial' : 'active',
        trial_ends_at: subscriptionPlan === 'trial' 
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days trial
          : null,
        created_by: userId,
      })
      .select()
      .single();
    
    if (tenantError || !tenant) {
      console.error('Error creating tenant:', tenantError);
      return NextResponse.json(
        { error: 'Failed to create tenant' },
        { status: 500 }
      );
    }
    
    // Create tenant owner user
    const tempPassword = Math.random().toString(36).slice(-8);
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    const { data: tenantUser, error: userError } = await adminClient
      .from('tenant_users')
      .insert({
        tenant_id: tenant.id,
        email: ownerEmail,
        full_name: ownerName,
        password_hash: passwordHash,
        role: 'owner',
        is_active: true,
      })
      .select()
      .single();
    
    if (userError) {
      console.error('Error creating tenant user:', userError);
      // Rollback tenant creation
      await adminClient.from('tenants').delete().eq('id', tenant.id);
      
      return NextResponse.json(
        { error: 'Failed to create tenant user' },
        { status: 500 }
      );
    }
    
    // Log the creation
    await adminClient.from('system_logs').insert({
      level: 'info',
      source: 'platform',
      message: `New tenant created: ${businessName}`,
      metadata: {
        tenant_id: tenant.id,
        created_by: userId,
        subdomain,
      },
    });
    
    return NextResponse.json({
      tenant,
      message: `Tenant created successfully. Temporary password: ${tempPassword}`,
    });
    
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}