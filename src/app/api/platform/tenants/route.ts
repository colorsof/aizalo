import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * Protected endpoint to manage tenants (platform admins only)
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
    
    // Only owner and admin can view all tenants
    if (!['owner', 'admin'].includes(session.user.user_metadata?.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('tenants')
      .select('*, tenant_users(count)', { count: 'exact' });
    
    // Apply filters
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,subdomain.ilike.%${search}%`);
    }
    
    if (status) {
      query = query.eq('subscription_status', status);
    }
    
    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data: tenants, error, count } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch tenants' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      tenants,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }, {
      headers: response.headers,
    });
    
  } catch (error) {
    console.error('Error fetching tenants:', error);
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
    
    // Verify this is a platform owner
    if (session.user.user_metadata?.userType !== 'platform' || 
        session.user.user_metadata?.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden - Only platform owners can create tenants' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      businessName,
      subdomain,
      ownerEmail,
      ownerName,
      ownerPassword,
      subscriptionPlan = 'trial',
      industryType = 'general',
    } = body;
    
    // Validate required fields
    if (!businessName || !subdomain || !ownerEmail || !ownerName || !ownerPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if subdomain is available
    const { data: existing } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', subdomain)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: 'Subdomain already taken' },
        { status: 400 }
      );
    }
    
    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        business_name: businessName,
        subdomain,
        industry_type: industryType,
        subscription_plan: subscriptionPlan,
        subscription_status: subscriptionPlan === 'trial' ? 'trial' : 'active',
        trial_ends_at: subscriptionPlan === 'trial' 
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      })
      .select()
      .single();
    
    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Failed to create tenant' },
        { status: 500 }
      );
    }
    
    // Create tenant owner auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: {
        userType: 'tenant',
        role: 'owner',
        fullName: ownerName,
        tenantId: tenant.id,
      },
    });
    
    if (authError || !authUser.user) {
      // Rollback tenant creation
      await supabase
        .from('tenants')
        .delete()
        .eq('id', tenant.id);
      
      return NextResponse.json(
        { error: 'Failed to create tenant owner' },
        { status: 500 }
      );
    }
    
    // Log the creation
    await supabase.from('system_logs').insert({
      level: 'info',
      source: 'platform',
      message: `Tenant created: ${businessName}`,
      metadata: {
        tenant_id: tenant.id,
        created_by: session.user.user_metadata?.platformUserId,
        subdomain,
      },
    });
    
    return NextResponse.json({
      success: true,
      tenant,
      owner: {
        email: ownerEmail,
        name: ownerName,
      },
    }, {
      headers: response.headers,
    });
    
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}