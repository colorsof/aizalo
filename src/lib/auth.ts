import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// User types
export type UserType = 'platform' | 'tenant';
export type PlatformRole = 'owner' | 'admin' | 'sales' | 'support';
export type TenantRole = 'owner' | 'admin' | 'staff' | 'viewer';

// User metadata that will be stored in Supabase Auth
export interface UserMetadata {
  userType: UserType;
  role: PlatformRole | TenantRole;
  tenantId?: string; // Only for tenant users
  tenantUserId?: string; // Tenant user ID from our table
  platformUserId?: string; // Platform user ID from our table
  fullName?: string;
}

// Create Supabase client for server components
export async function createServerClient() {
  const cookieStore = await cookies();
  
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.delete(name);
        },
      },
    }
  );
}

// Create Supabase client for route handlers
export function createRouteHandlerClient(request: NextRequest) {
  const response = NextResponse.next();
  
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          response.cookies.delete(name);
        },
      },
    }
  );
  
  return { supabase, response };
}

// Get current user from Supabase Auth
export async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Get user metadata
export async function getUserMetadata(user: any): Promise<UserMetadata | null> {
  if (!user?.user_metadata) {
    return null;
  }
  
  return user.user_metadata as UserMetadata;
}