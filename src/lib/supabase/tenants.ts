import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Tenant {
  id: string;
  business_name: string;
  subdomain: string;
  industry_type: string;
  subscription_status: string;
  created_at: string;
  settings?: any;
}

export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('subscription_status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    return data as Tenant;
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
}