import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { email, password } = loginSchema.parse(body);
    
    // Create Supabase client
    const { supabase, response } = createRouteHandlerClient(request);
    
    // First check if this is a platform user
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, email, full_name, role, is_active, auth_id')
      .eq('email', email)
      .single();
    
    if (!platformUser) {
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
      // If auth fails but user exists in our table, they might need migration
      if (!platformUser.auth_id) {
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
      .from('platform_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', platformUser.id);
    
    // Log the login event
    await supabase.from('system_logs').insert({
      level: 'info',
      source: 'auth',
      message: `Platform user logged in: ${platformUser.email}`,
      metadata: {
        user_id: platformUser.id,
        user_type: 'platform',
        role: platformUser.role,
      },
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