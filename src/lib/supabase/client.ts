import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in client-side components
 * This client will automatically handle authentication cookies
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}