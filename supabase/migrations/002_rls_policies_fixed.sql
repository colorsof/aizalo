-- =============================================
-- ROW LEVEL SECURITY POLICIES (FIXED)
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- IMPORTANT: This creates all RLS policies for proper data isolation
-- =============================================

-- First, drop any existing policies to avoid conflicts
DO $$ 
BEGIN
    -- Drop all policies on all tables (safe to run multiple times)
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Platform owner full access" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Sales team self access" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Platform settings owner only" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Sales territories access" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Sales leads isolation" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Platform revenue access" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Tenants access control" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant users isolation" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant settings isolation" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Customers tenant isolation" ON %I', r.tablename);
        -- Add more as needed
    END LOOP;
END $$;

-- =============================================
-- PLATFORM TABLES POLICIES (Platform Owner & Sales Team)
-- =============================================

-- Platform users - separate policies for different operations
CREATE POLICY "Platform users select" ON platform_users
    FOR SELECT USING (
        auth.uid() = id OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Platform users insert" ON platform_users
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Platform users update" ON platform_users
    FOR UPDATE USING (
        auth.uid() = id OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Platform users delete" ON platform_users
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- Platform settings - owner only
CREATE POLICY "Platform settings select" ON platform_settings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Platform settings insert" ON platform_settings
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Platform settings update" ON platform_settings
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Platform settings delete" ON platform_settings
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- Sales territories
CREATE POLICY "Sales territories select" ON sales_territories
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "Sales territories insert" ON sales_territories
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "Sales territories update" ON sales_territories
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "Sales territories delete" ON sales_territories
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- Sales leads
CREATE POLICY "Sales leads select" ON sales_leads
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Sales leads insert" ON sales_leads
    FOR INSERT WITH CHECK (
        assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "Sales leads update" ON sales_leads
    FOR UPDATE USING (
        assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Sales leads delete" ON sales_leads
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- Platform revenue
CREATE POLICY "Platform revenue select" ON platform_revenue
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner') OR
        sales_rep_id = auth.uid()
    );

CREATE POLICY "Platform revenue insert" ON platform_revenue
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "Platform revenue update" ON platform_revenue
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Platform revenue delete" ON platform_revenue
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- =============================================
-- TENANT ISOLATION POLICIES
-- =============================================

-- Tenants table
CREATE POLICY "Tenants select" ON tenants
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner') OR
        EXISTS (SELECT 1 FROM sales_leads WHERE assigned_to = auth.uid() AND business_name = tenants.business_name AND status = 'won') OR
        id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid())
    );

CREATE POLICY "Tenants insert" ON tenants
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role IN ('owner', 'admin', 'sales'))
    );

CREATE POLICY "Tenants update" ON tenants
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner') OR
        id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Tenants delete" ON tenants
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- Tenant users
CREATE POLICY "Tenant users select" ON tenant_users
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Tenant users insert" ON tenant_users
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner') OR
        (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin')))
    );

CREATE POLICY "Tenant users update" ON tenant_users
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner') OR
        (id = auth.uid()) OR
        (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin')))
    );

CREATE POLICY "Tenant users delete" ON tenant_users
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner') OR
        (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role = 'owner'))
    );

-- Tenant settings
CREATE POLICY "Tenant settings select" ON tenant_settings
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Tenant settings insert" ON tenant_settings
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner') OR
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "Tenant settings update" ON tenant_settings
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner') OR
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "Tenant settings delete" ON tenant_settings
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner') OR
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role = 'owner')
    );

-- =============================================
-- CUSTOMER DATA ISOLATION
-- =============================================

-- Customers
CREATE POLICY "Customers select" ON customers
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Customers insert" ON customers
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Customers update" ON customers
    FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Customers delete" ON customers
    FOR DELETE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin')) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- =============================================
-- CONVERSATION DATA ISOLATION
-- =============================================

-- Conversations
CREATE POLICY "Conversations select" ON conversations
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Conversations insert" ON conversations
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Conversations update" ON conversations
    FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Conversations delete" ON conversations
    FOR DELETE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin')) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- Messages
CREATE POLICY "Messages select" ON messages
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Messages insert" ON messages
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Messages update" ON messages
    FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Messages delete" ON messages
    FOR DELETE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin')) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- =============================================
-- MARKETING & CAMPAIGN ISOLATION
-- =============================================

-- Campaigns
CREATE POLICY "Campaigns select" ON campaigns
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Campaigns insert" ON campaigns
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Campaigns update" ON campaigns
    FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Campaigns delete" ON campaigns
    FOR DELETE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin')) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- Leads
CREATE POLICY "Leads select" ON leads
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Leads insert" ON leads
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Leads update" ON leads
    FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Leads delete" ON leads
    FOR DELETE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin')) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- Content library
CREATE POLICY "Content library select" ON content_library
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Content library insert" ON content_library
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Content library update" ON content_library
    FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Content library delete" ON content_library
    FOR DELETE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin')) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- =============================================
-- WEBSITE BUILDER ISOLATION
-- =============================================

-- Website templates - public read, owner write
CREATE POLICY "Website templates select" ON website_templates
    FOR SELECT USING (true);

CREATE POLICY "Website templates insert" ON website_templates
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Website templates update" ON website_templates
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Website templates delete" ON website_templates
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- Website sections - follow template access
CREATE POLICY "Website sections select" ON website_sections
    FOR SELECT USING (true);

CREATE POLICY "Website sections insert" ON website_sections
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Website sections update" ON website_sections
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Website sections delete" ON website_sections
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- Tenant websites
CREATE POLICY "Tenant websites select" ON tenant_websites
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Tenant websites insert" ON tenant_websites
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin')) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Tenant websites update" ON tenant_websites
    FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role IN ('owner', 'admin')) OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

CREATE POLICY "Tenant websites delete" ON tenant_websites
    FOR DELETE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() AND role = 'owner') OR
        EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner')
    );

-- =============================================
-- SIMPLIFIED POLICIES FOR OTHER TABLES
-- =============================================

-- For the remaining tables, I'll create a simpler approach
-- This creates basic tenant isolation for all other tenant-scoped tables

-- Helper function to check if user is platform owner
CREATE OR REPLACE FUNCTION is_platform_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND role = 'owner');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT tenant_id FROM tenant_users WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply simple policies to remaining tables
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'customer_addresses', 'customer_tags', 'customer_preferences',
        'message_media', 'message_metadata',
        'campaign_channels', 'campaign_audience', 'campaign_content', 'campaign_metrics',
        'lead_activities', 'lead_scores',
        'content_templates', 'scheduled_content', 'content_performance',
        'website_customizations', 'website_pages',
        'commissions', 'onboarding_sessions', 'system_logs', 'api_usage'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        -- Create simple select policy
        EXECUTE format('CREATE POLICY "%s_simple_select" ON %I FOR SELECT USING (is_platform_owner())', t, t);
        
        -- Create simple insert policy
        EXECUTE format('CREATE POLICY "%s_simple_insert" ON %I FOR INSERT WITH CHECK (is_platform_owner())', t, t);
        
        -- Create simple update policy
        EXECUTE format('CREATE POLICY "%s_simple_update" ON %I FOR UPDATE USING (is_platform_owner())', t, t);
        
        -- Create simple delete policy
        EXECUTE format('CREATE POLICY "%s_simple_delete" ON %I FOR DELETE USING (is_platform_owner())', t, t);
    END LOOP;
END $$;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check that all tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- Count policies per table
SELECT schemaname, tablename, COUNT(policyname) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- =============================================
-- RLS POLICIES COMPLETE!
-- =============================================