import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/auth';

/**
 * Google OAuth for platform users using Supabase Auth
 * Supabase handles the OAuth flow, we just need to redirect
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
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
    
    // Get the session to check user metadata
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Check if this is a platform user
      const { data: platformUser } = await supabase
        .from('platform_users')
        .select('id, role')
        .eq('email', session.user.email)
        .single();
      
      if (platformUser) {
        // Update auth metadata to mark as platform user
        await supabase.auth.updateUser({
          data: {
            userType: 'platform',
            role: platformUser.role,
            platformUserId: platformUser.id,
          }
        });
        
        // Redirect based on role
        const redirectUrl = platformUser.role === 'owner' || platformUser.role === 'admin' 
          ? '/admin' 
          : '/sales';
        
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}`);
      } else {
        // Check if we should auto-create platform user
        const allowedDomains = process.env.ALLOWED_PLATFORM_DOMAINS?.split(',') || [];
        const emailDomain = session.user.email?.split('@')[1];
        
        if (allowedDomains.length === 0 || (emailDomain && allowedDomains.includes(emailDomain))) {
          // Create new platform user
          const { data: newUser, error: createError } = await supabase
            .from('platform_users')
            .insert({
              auth_id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
              role: 'sales', // Default role
              is_active: true,
            })
            .select()
            .single();
          
          if (!createError && newUser) {
            // Update auth metadata
            await supabase.auth.updateUser({
              data: {
                userType: 'platform',
                role: newUser.role,
                platformUserId: newUser.id,
              }
            });
            
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/sales`);
          }
        }
        
        // Not allowed or creation failed
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?message=Not authorized for platform access`
        );
      }
    }
  }
  
  // Initiate Google OAuth flow
  const { supabase, response } = createRouteHandlerClient(request);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/platform/google`,
      scopes: 'email profile',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
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

