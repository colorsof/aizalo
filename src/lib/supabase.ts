import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for server-side use with proper auth context
 * This should be used instead of service role key for most operations
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key must be provided');
  }
  
  // Note: We're using Supabase Auth now, so we don't need to manually handle tokens
  // The Supabase client will automatically use the session from cookies
  
  return createClient(supabaseUrl, supabaseAnonKey);
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