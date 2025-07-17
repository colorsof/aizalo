import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/auth';

/**
 * Google OAuth for tenant users using Supabase Auth
 * Requires tenant context (subdomain or tenantId)
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  
  // Parse state to get subdomain
  let subdomain: string | null = null;
  try {
    if (state) {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      subdomain = stateData.subdomain;
    }
  } catch (e) {
    console.error('Error parsing state:', e);
  }
  
  if (code) {
    // This is the callback from Google
    const { supabase, response } = createRouteHandlerClient(request);
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?message=${encodeURIComponent(error.message)}`
      );
    }
    
    // Get the session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user && subdomain) {
      // Get tenant by subdomain
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, subdomain, subscription_status')
        .eq('subdomain', subdomain)
        .single();
      
      if (!tenant || (tenant.subscription_status !== 'active' && tenant.subscription_status !== 'trial')) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?message=Invalid or inactive tenant`
        );
      }
      
      // Check if tenant user exists
      const { data: tenantUser } = await supabase
        .from('tenant_users')
        .select('id, role')
        .eq('email', session.user.email)
        .eq('tenant_id', tenant.id)
        .single();
      
      if (tenantUser) {
        // Update auth metadata
        await supabase.auth.updateUser({
          data: {
            userType: 'tenant',
            role: tenantUser.role,
            tenantId: tenant.id,
            tenantUserId: tenantUser.id,
          }
        });
        
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/${subdomain}/dashboard`);
      } else {
        // Check if self-registration is allowed
        const { data: tenantSettings } = await supabase
          .from('tenant_settings')
          .select('value')
          .eq('tenant_id', tenant.id)
          .eq('category', 'auth')
          .eq('key', 'allow_self_registration')
          .single();
        
        const allowSelfRegistration = tenantSettings?.value === 'true';
        
        if (!allowSelfRegistration) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?message=Self-registration is not allowed`
          );
        }
        
        // Create new tenant user
        const { data: newUser, error: createError } = await supabase
          .from('tenant_users')
          .insert({
            auth_id: session.user.id,
            tenant_id: tenant.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
            role: 'staff', // Default role
            is_active: true,
          })
          .select()
          .single();
        
        if (!createError && newUser) {
          // Update auth metadata
          await supabase.auth.updateUser({
            data: {
              userType: 'tenant',
              role: newUser.role,
              tenantId: tenant.id,
              tenantUserId: newUser.id,
            }
          });
          
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/${subdomain}/dashboard`);
        }
        
        // Creation failed
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?message=Failed to create user`
        );
      }
    }
  }
  
  // Get subdomain from query params for initial request
  const querySubdomain = requestUrl.searchParams.get('subdomain');
  
  if (!querySubdomain) {
    return NextResponse.json(
      { error: 'Subdomain is required' },
      { status: 400 }
    );
  }
  
  // Create state with subdomain
  const stateParam = Buffer.from(JSON.stringify({ subdomain: querySubdomain })).toString('base64');
  
  // Initiate Google OAuth flow
  const { supabase, response } = createRouteHandlerClient(request);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tenant/google`,
      scopes: 'email profile',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        state: stateParam,
      }
    }
  });
  
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?message=${encodeURIComponent(error.message)}`
    );
  }
  
  if (data.url) {
    return NextResponse.redirect(data.url);
  }
  
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error`);
}