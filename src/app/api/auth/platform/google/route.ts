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
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/platform/google/callback`
);

// Validation schema for Google token
const googleTokenSchema = z.object({
  credential: z.string(), // The Google ID token
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { credential } = googleTokenSchema.parse(body);
    
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
    
    // Check if user exists in platform_users
    const { data: existingUser, error: fetchError } = await supabase
      .from('platform_users')
      .select('id, email, full_name, role, is_active, google_id')
      .eq('email', payload.email)
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
          .from('platform_users')
          .update({ 
            google_id: payload.sub,
            last_login_at: new Date().toISOString()
          })
          .eq('id', existingUser.id);
      } else {
        // Just update last login
        await supabase
          .from('platform_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', existingUser.id);
      }
      
      user = existingUser;
    } else {
      // New user - check if they're allowed to register
      // For platform users, we might want to restrict registration
      const allowedDomains = process.env.ALLOWED_PLATFORM_DOMAINS?.split(',') || [];
      const emailDomain = payload.email.split('@')[1];
      
      if (allowedDomains.length > 0 && !allowedDomains.includes(emailDomain)) {
        return NextResponse.json(
          { error: 'Registration not allowed for this email domain' },
          { status: 403 }
        );
      }
      
      // Create new platform user
      const { data: newUser, error: createError } = await supabase
        .from('platform_users')
        .insert({
          email: payload.email,
          full_name: payload.name || payload.email.split('@')[0],
          google_id: payload.sub,
          password_hash: 'GOOGLE_AUTH', // Placeholder for Google auth users
          role: 'sales', // Default role for new users
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
    
    // Create JWT token
    const token = await createToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      userType: 'platform',
    });
    
    // Set cookie
    setAuthCookie(token, 'platform');
    
    // Log the login event
    await supabase.from('system_logs').insert({
      level: 'info',
      source: 'auth',
      message: `Platform user logged in via Google: ${user.email}`,
      metadata: {
        user_id: user.id,
        user_type: 'platform',
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
      },
      redirectUrl: user.role === 'owner' || user.role === 'admin' ? '/admin' : '/sales',
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

// GET endpoint to initiate Google OAuth flow
export async function GET(request: NextRequest) {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile'],
    prompt: 'consent',
  });
  
  return NextResponse.redirect(authUrl);
}