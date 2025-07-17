import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createToken, setAuthCookie } from '@/lib/auth';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tenant/google/callback`
);

// Validation schema
const googleTokenSchema = z.object({
  credential: z.string(), // The Google ID token
  subdomain: z.string().min(3), // Required to identify the tenant
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { credential, subdomain } = googleTokenSchema.parse(body);
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Invalid Google token' },
        { status: 401 }
      );
    }
    
    // Get the tenant by subdomain
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
    
    // Check if user exists in tenant_users
    const { data: existingUser, error: fetchError } = await supabase
      .from('tenant_users')
      .select('id, email, full_name, role, is_active, google_id, tenant_id')
      .eq('email', payload.email)
      .eq('tenant_id', tenant.id)
      .single();
    
    let user;
    
    if (existingUser) {
      // User exists, check if active
      if (!existingUser.is_active) {
        return NextResponse.json(
          { error: 'Account is deactivated' },
          { status: 403 }
        );
      }
      
      // Update Google ID if not set
      if (!existingUser.google_id) {
        await supabase
          .from('tenant_users')
          .update({ 
            google_id: payload.sub,
            last_login_at: new Date().toISOString()
          })
          .eq('id', existingUser.id);
      } else {
        // Just update last login
        await supabase
          .from('tenant_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', existingUser.id);
      }
      
      user = existingUser;
    } else {
      // New user - check if self-registration is allowed for this tenant
      const { data: tenantSettings } = await supabase
        .from('tenant_settings')
        .select('value')
        .eq('tenant_id', tenant.id)
        .eq('category', 'auth')
        .eq('key', 'allow_self_registration')
        .single();
      
      const allowSelfRegistration = tenantSettings?.value === 'true';
      
      if (!allowSelfRegistration) {
        return NextResponse.json(
          { error: 'Self-registration is not allowed. Please contact your administrator.' },
          { status: 403 }
        );
      }
      
      // Create new tenant user
      const { data: newUser, error: createError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: tenant.id,
          email: payload.email,
          full_name: payload.name || payload.email.split('@')[0],
          google_id: payload.sub,
          password_hash: 'GOOGLE_AUTH', // Placeholder for Google auth users
          role: 'staff', // Default role for new users
          is_active: true,
          last_login_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (createError || !newUser) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }
      
      user = newUser;
    }
    
    // Create JWT token with tenant context
    const token = await createToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: tenant.id,
      userType: 'tenant',
    });
    
    // Set cookie
    setAuthCookie(token, 'tenant');
    
    // Log the login event
    await supabase.from('system_logs').insert({
      level: 'info',
      source: 'auth',
      message: `Tenant user logged in via Google: ${user.email}`,
      metadata: {
        user_id: user.id,
        user_type: 'tenant',
        tenant_id: tenant.id,
        tenant_name: tenant.business_name,
        role: user.role,
        auth_method: 'google',
      },
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: tenant.id,
        tenantName: tenant.business_name,
      },
      redirectUrl: `/${subdomain}/dashboard`,
    });
    
  } catch (error) {
    console.error('Google login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Google authentication failed' },
      { status: 500 }
    );
  }
}