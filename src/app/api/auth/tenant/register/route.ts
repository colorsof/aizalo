import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient, UserMetadata } from '@/lib/auth';
import { z } from 'zod';
import { validatePassword } from '@/lib/password-validator';
import { authRateLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limiter';

// Validation schema for tenant registration
const tenantRegisterSchema = z.object({
  // Business information
  businessName: z.string().min(2),
  subdomain: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  industry: z.string().optional(),
  
  // Owner information
  ownerEmail: z.string().email(),
  ownerName: z.string().min(2),
  ownerPhone: z.string().optional(),
  password: z.string().min(8),
  
  // Plan selection
  subscriptionPlan: z.enum(['trial', 'starter', 'growth', 'enterprise']).default('trial'),
});

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIp = getClientIp(request);
    const rateLimitKey = `tenant_register:${clientIp}`;
    
    if (authRateLimiter.isRateLimited(rateLimitKey)) {
      return rateLimitResponse(rateLimitKey, authRateLimiter);
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = tenantRegisterSchema.parse(body);
    
    // Validate password strength
    const passwordValidation = validatePassword(validatedData.password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
          strength: passwordValidation.strength,
        },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const { supabase, response } = createRouteHandlerClient(request);
    
    // Check if subdomain is already taken
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', validatedData.subdomain)
      .single();
    
    if (existingTenant) {
      return NextResponse.json(
        { error: 'This subdomain is already taken' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('tenant_users')
      .select('id')
      .eq('email', validatedData.ownerEmail)
      .single();
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Start a transaction by creating tenant first
    const { data: newTenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        business_name: validatedData.businessName,
        subdomain: validatedData.subdomain,
        industry_type: validatedData.industry || 'general',
        subscription_plan: validatedData.subscriptionPlan,
        subscription_status: validatedData.subscriptionPlan === 'trial' ? 'trial' : 'active',
        trial_ends_at: validatedData.subscriptionPlan === 'trial' 
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days trial
          : null,
      })
      .select()
      .single();
    
    if (tenantError || !newTenant) {
      console.error('Error creating tenant:', tenantError);
      return NextResponse.json(
        { error: 'Failed to create tenant account' },
        { status: 500 }
      );
    }
    
    // Create user metadata
    const metadata: UserMetadata = {
      userType: 'tenant',
      role: 'owner',
      fullName: validatedData.ownerName,
      tenantId: newTenant.id,
    };
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.ownerEmail,
      password: validatedData.password,
      options: {
        data: metadata,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${validatedData.subdomain}/auth/callback`,
      },
    });
    
    if (authError || !authData.user) {
      // Rollback tenant creation
      await supabase
        .from('tenants')
        .delete()
        .eq('id', newTenant.id);
      
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }
    
    // The tenant_user will be created by the auth trigger
    
    // Log the registration
    await supabase.rpc('log_auth_event', {
      p_event_type: 'register',
      p_user_email: validatedData.ownerEmail,
      p_user_type: 'tenant',
      p_ip_address: clientIp,
      p_metadata: {
        tenant_id: newTenant.id,
        business_name: validatedData.businessName,
        subdomain: validatedData.subdomain,
        plan: validatedData.subscriptionPlan,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to confirm your account.',
      tenant: {
        id: newTenant.id,
        subdomain: newTenant.subdomain,
        businessName: newTenant.business_name,
      },
      redirectUrl: `/${validatedData.subdomain}/auth/confirm`,
    }, {
      headers: response.headers,
    });
    
  } catch (error) {
    console.error('Tenant registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}