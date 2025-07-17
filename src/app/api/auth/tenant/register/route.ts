import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  ),
  
  // Plan selection
  subscriptionPlan: z.enum(['trial', 'starter', 'growth', 'enterprise']).default('trial'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = tenantRegisterSchema.parse(body);
    
    // Check if subdomain is already taken
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', validatedData.subdomain)
      .single();
    
    if (existingTenant) {
      return NextResponse.json(
        { error: 'This subdomain is already taken. Please choose another.' },
        { status: 400 }
      );
    }
    
    // Check if email is already registered as a tenant owner
    const { data: existingOwner } = await supabase
      .from('tenants')
      .select('id')
      .eq('owner_email', validatedData.ownerEmail)
      .single();
    
    if (existingOwner) {
      return NextResponse.json(
        { error: 'This email is already registered as a business owner.' },
        { status: 400 }
      );
    }
    
    // Start a transaction by creating tenant first
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        business_name: validatedData.businessName,
        subdomain: validatedData.subdomain,
        owner_email: validatedData.ownerEmail,
        owner_phone: validatedData.ownerPhone,
        industry: validatedData.industry,
        subscription_plan: validatedData.subscriptionPlan,
        subscription_status: validatedData.subscriptionPlan === 'trial' ? 'trial' : 'pending_payment',
        trial_ends_at: validatedData.subscriptionPlan === 'trial' 
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days trial
          : null,
      })
      .select()
      .single();
    
    if (tenantError || !tenant) {
      console.error('Error creating tenant:', tenantError);
      return NextResponse.json(
        { error: 'Failed to create business account' },
        { status: 500 }
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(validatedData.password);
    
    // Create tenant owner user
    const { data: tenantUser, error: userError } = await supabase
      .from('tenant_users')
      .insert({
        tenant_id: tenant.id,
        email: validatedData.ownerEmail,
        full_name: validatedData.ownerName,
        password_hash: passwordHash,
        role: 'owner',
        is_active: true,
      })
      .select()
      .single();
    
    if (userError || !tenantUser) {
      console.error('Error creating tenant user:', userError);
      // Rollback tenant creation
      await supabase.from('tenants').delete().eq('id', tenant.id);
      
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }
    
    // Create default settings for the tenant
    const defaultSettings = [
      { category: 'auth', key: 'allow_self_registration', value: 'false' },
      { category: 'auth', key: 'require_email_verification', value: 'true' },
      { category: 'whatsapp', key: 'session_timeout_minutes', value: '30' },
      { category: 'notifications', key: 'email_notifications', value: 'true' },
    ];
    
    await supabase.from('tenant_settings').insert(
      defaultSettings.map(setting => ({
        tenant_id: tenant.id,
        ...setting,
      }))
    );
    
    // Log the registration
    await supabase.from('system_logs').insert({
      level: 'info',
      source: 'auth',
      message: `New tenant registered: ${validatedData.businessName}`,
      metadata: {
        tenant_id: tenant.id,
        subdomain: validatedData.subdomain,
        plan: validatedData.subscriptionPlan,
        owner_email: validatedData.ownerEmail,
      },
    });
    
    // Auto-login the user after registration
    const token = await createToken({
      sub: tenantUser.id,
      email: tenantUser.email,
      role: tenantUser.role,
      tenantId: tenant.id,
      userType: 'tenant',
    });
    
    // Set cookie
    setAuthCookie(token, 'tenant');
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      tenant: {
        id: tenant.id,
        businessName: tenant.business_name,
        subdomain: tenant.subdomain,
        subscriptionPlan: tenant.subscription_plan,
        trialEndsAt: tenant.trial_ends_at,
      },
      user: {
        id: tenantUser.id,
        email: tenantUser.email,
        fullName: tenantUser.full_name,
        role: tenantUser.role,
      },
      redirectUrl: `/${tenant.subdomain}/dashboard`,
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