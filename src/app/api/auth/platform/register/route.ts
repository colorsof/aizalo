import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient, UserMetadata } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  ),
  fullName: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { email, password, fullName } = registerSchema.parse(body);
    
    // Create Supabase client
    const { supabase, response } = createRouteHandlerClient(request);
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Default role for open registration
    const role = 'sales';
    
    // Create user metadata
    const metadata: UserMetadata = {
      userType: 'platform',
      role,
      fullName,
    };
    
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
    
    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }
    
    // The user will be created in our platform_users table by the trigger
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the created platform user
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, email, full_name, role')
      .eq('auth_id', authData.user.id)
      .single();
    
    if (platformUser) {
      // Log the registration
      await supabase.from('system_logs').insert({
        level: 'info',
        source: 'auth',
        message: `New platform user registered: ${email}`,
        metadata: {
          user_id: platformUser.id,
          role,
          registration_method: 'open',
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to confirm your account.',
      user: {
        email,
        fullName,
        role,
      },
    }, {
      headers: response.headers,
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
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