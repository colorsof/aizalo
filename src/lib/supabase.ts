import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { getCurrentUser } from './auth';

/**
 * Creates a Supabase client for server-side use with proper auth context
 * This should be used instead of service role key for most operations
 */
export async function createServerClient(request?: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key must be provided');
  }
  
  // Get current user from JWT if available
  const user = await getCurrentUser();
  
  // If we have a user and request, extract the auth token
  let authToken: string | undefined;
  
  if (request) {
    // Try to get token from cookie based on user type
    if (user?.userType === 'platform') {
      authToken = request.cookies.get('platform-auth')?.value;
    } else if (user?.userType === 'tenant') {
      authToken = request.cookies.get('tenant-auth')?.value;
    }
  }
  
  // Create client with auth context if available
  const options: any = {};
  if (authToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, options);
}

/**
 * Creates a Supabase admin client for operations that require elevated privileges
 * Use this sparingly and only when absolutely necessary
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and service role key must be provided');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Creates a Supabase client for browser use
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key must be provided');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}