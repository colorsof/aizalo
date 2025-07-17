import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/auth';
import { z } from 'zod';
import { authRateLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limiter';

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIp = getClientIp(request);
    const rateLimitKey = `login:${clientIp}`;
    
    if (authRateLimiter.isRateLimited(rateLimitKey)) {
      return rateLimitResponse(rateLimitKey, authRateLimiter);
    }
    
    const body = await request.json();
    
    // Validate input
    const { email, password } = loginSchema.parse(body);
    
    // Create Supabase client
    const { supabase, response } = createRouteHandlerClient(request);
    
    // Check if account is locked
    const { data: lockStatus } = await supabase.rpc('check_account_locked', {
      p_email: email,
      p_user_type: 'platform'
    });
    
    if (lockStatus && lockStatus[0]?.is_locked) {
      const lockedUntil = new Date(lockStatus[0].locked_until);
      const minutesRemaining = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
      
      await supabase.rpc('log_auth_event', {
        p_event_type: 'login_failed',
        p_user_email: email,
        p_user_type: 'platform',
        p_ip_address: clientIp,
        p_metadata: { reason: 'account_locked' }
      });
      
      return NextResponse.json(
        { 
          error: 'Account is temporarily locked',
          message: `Too many failed login attempts. Please try again in ${minutesRemaining} minutes.`,
          lockedUntil: lockedUntil.toISOString(),
        },
        { status: 423 } // 423 Locked
      );
    }
    
    // First check if this is a platform user
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, email, full_name, role, is_active, auth_id')
      .eq('email', email)
      .single();
    
    if (!platformUser) {
      // Record failed attempt
      await supabase.rpc('record_failed_login', {
        p_email: email,
        p_user_type: 'platform'
      });
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if user is active
    if (!platformUser.is_active) {
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
      // Record failed attempt
      const { data: failedAttempt } = await supabase.rpc('record_failed_login', {
        p_email: email,
        p_user_type: 'platform'
      });
      
      // If auth fails but user exists in our table, they might need migration
      if (!platformUser.auth_id) {
        return NextResponse.json(
          { error: 'Account needs migration. Please contact support.' },
          { status: 401 }
        );
      }
      
      // Check if account is now locked
      if (failedAttempt && failedAttempt[0]?.is_locked) {
        return NextResponse.json(
          { 
            error: 'Account is now locked',
            message: 'Too many failed login attempts. Account has been locked for 30 minutes.',
            attempts: failedAttempt[0].attempts,
          },
          { status: 423 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          remainingAttempts: failedAttempt ? 5 - failedAttempt[0].attempts : null,
        },
        { status: 401 }
      );
    }
    
    // Reset failed attempts on successful login
    await supabase.rpc('reset_failed_login_attempts', {
      p_email: email,
      p_user_type: 'platform'
    });
    
    // Update last login
    await supabase
      .from('platform_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', platformUser.id);
    
    // Log the successful login event
    await supabase.rpc('log_auth_event', {
      p_event_type: 'login_success',
      p_user_id: platformUser.id,
      p_user_email: platformUser.email,
      p_user_type: 'platform',
      p_ip_address: clientIp,
      p_user_agent: request.headers.get('user-agent'),
      p_metadata: { role: platformUser.role }
    });
    
    // Return success with user data
    response.headers.set('Location', platformUser.role === 'owner' || platformUser.role === 'admin' ? '/admin' : '/sales');
    
    return NextResponse.json({
      success: true,
      user: {
        id: platformUser.id,
        email: platformUser.email,
        fullName: platformUser.full_name,
        role: platformUser.role,
      },
      redirectUrl: platformUser.role === 'owner' || platformUser.role === 'admin' ? '/admin' : '/sales',
    }, {
      headers: response.headers,
    });
    
  } catch (error) {
    console.error('Platform login error:', error);
    
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