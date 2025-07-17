import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  subdomain: z.string().min(3), // Required to identify the tenant
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { email, password, subdomain } = loginSchema.parse(body);
    
    // Create Supabase client
    const { supabase, response } = createRouteHandlerClient(request);
    
    // First, get the tenant by subdomain
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, business_name, subscription_status')
      .eq('subdomain', subdomain)
      .single();
    
    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Invalid tenant' },
        { status: 404 }
      );
    }
    
    // Check if tenant is active
    if (!['active', 'trial'].includes(tenant.subscription_status)) {
      return NextResponse.json(
        { error: 'Tenant subscription is not active' },
        { status: 403 }
      );
    }
    
    // Get tenant user
    const { data: tenantUser, error: userError } = await supabase
      .from('tenant_users')
      .select('id, email, full_name, role, is_active, tenant_id, auth_id')
      .eq('email', email)
      .eq('tenant_id', tenant.id)
      .single();
    
    if (userError || !tenantUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if user is active
    if (!tenantUser.is_active) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError || !authData.user) {
      // If auth fails but user exists in our table, they might need migration
      if (!tenantUser.auth_id) {
        return NextResponse.json(
          { error: 'Account needs migration. Please contact support.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Update last login
    await supabase
      .from('tenant_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', tenantUser.id);
    
    // Log the login event
    await supabase.from('system_logs').insert({
      level: 'info',
      source: 'auth',
      message: `Tenant user logged in: ${tenantUser.email}`,
      metadata: {
        user_id: tenantUser.id,
        user_type: 'tenant',
        tenant_id: tenant.id,
        tenant_name: tenant.business_name,
        role: tenantUser.role,
      },
    });
    
    // Return success with user data
    response.headers.set('Location', `/${subdomain}/dashboard`);
    
    return NextResponse.json({
      success: true,
      user: {
        id: tenantUser.id,
        email: tenantUser.email,
        fullName: tenantUser.full_name,
        role: tenantUser.role,
        tenantId: tenant.id,
        tenantName: tenant.business_name,
      },
      redirectUrl: `/${subdomain}/dashboard`,
    }, {
      headers: response.headers,
    });
    
  } catch (error) {
    console.error('Tenant login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}