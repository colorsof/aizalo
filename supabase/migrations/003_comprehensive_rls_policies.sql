-- =============================================
-- COMPREHENSIVE ROW LEVEL SECURITY POLICIES
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration creates a complete set of RLS policies with proper permissions
-- Platform Owner: Full access to everything
-- Sales Team: Can manage their clients and create websites for them
-- Tenants: Isolated to their own data only
-- =============================================

-- First, drop ALL existing policies to start fresh
DO $$ 
DECLARE
    pol record;
BEGIN
    -- Drop all policies on all tables
    FOR pol IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- =============================================
-- HELPER FUNCTIONS FOR CLEANER POLICIES
-- =============================================

-- Check if current user is platform owner
CREATE OR REPLACE FUNCTION auth_is_platform_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE id = auth.uid() AND role = 'owner'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is platform admin
CREATE OR REPLACE FUNCTION auth_is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE id = auth.uid() AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is sales team member
CREATE OR REPLACE FUNCTION auth_is_sales_team()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE id = auth.uid() AND role IN ('owner', 'admin', 'sales')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current user's tenant_id (if they are a tenant user)
CREATE OR REPLACE FUNCTION auth_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT tenant_id FROM tenant_users 
        WHERE id = auth.uid() 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has access to a specific tenant
CREATE OR REPLACE FUNCTION auth_has_tenant_access(check_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        -- Platform owner sees all
        auth_is_platform_owner() OR
        -- Tenant users see their own tenant
        check_tenant_id = auth_tenant_id() OR
        -- Sales team sees their assigned tenants
        EXISTS (
            SELECT 1 FROM sales_leads 
            WHERE assigned_to = auth.uid() 
            AND business_name IN (
                SELECT business_name FROM tenants WHERE id = check_tenant_id
            )
            AND status = 'won'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- PLATFORM TABLES POLICIES
-- =============================================

-- Platform users table
CREATE POLICY "platform_users_select" ON platform_users FOR SELECT
    USING (
        id = auth.uid() OR                    -- Users can see themselves
        auth_is_platform_owner()               -- Owner sees all
    );

CREATE POLICY "platform_users_insert" ON platform_users FOR INSERT
    WITH CHECK (auth_is_platform_owner());    -- Only owner can create users

CREATE POLICY "platform_users_update" ON platform_users FOR UPDATE
    USING (
        id = auth.uid() OR                    -- Users can update themselves
        auth_is_platform_owner()               -- Owner can update anyone
    );

CREATE POLICY "platform_users_delete" ON platform_users FOR DELETE
    USING (auth_is_platform_owner());         -- Only owner can delete users

-- Platform settings table
CREATE POLICY "platform_settings_select" ON platform_settings FOR SELECT
    USING (auth_is_platform_owner());

CREATE POLICY "platform_settings_insert" ON platform_settings FOR INSERT
    WITH CHECK (auth_is_platform_owner());

CREATE POLICY "platform_settings_update" ON platform_settings FOR UPDATE
    USING (auth_is_platform_owner());

CREATE POLICY "platform_settings_delete" ON platform_settings FOR DELETE
    USING (auth_is_platform_owner());

-- Sales territories
CREATE POLICY "sales_territories_select" ON sales_territories FOR SELECT
    USING (
        assigned_to = auth.uid() OR           -- Sales see their territories
        auth_is_platform_admin()              -- Admins see all
    );

CREATE POLICY "sales_territories_insert" ON sales_territories FOR INSERT
    WITH CHECK (auth_is_platform_admin());

CREATE POLICY "sales_territories_update" ON sales_territories FOR UPDATE
    USING (auth_is_platform_admin());

CREATE POLICY "sales_territories_delete" ON sales_territories FOR DELETE
    USING (auth_is_platform_owner());

-- Sales leads
CREATE POLICY "sales_leads_select" ON sales_leads FOR SELECT
    USING (
        assigned_to = auth.uid() OR           -- Sales see their leads
        auth_is_platform_owner()              -- Owner sees all
    );

CREATE POLICY "sales_leads_insert" ON sales_leads FOR INSERT
    WITH CHECK (
        (assigned_to = auth.uid() AND auth_is_sales_team()) OR
        auth_is_platform_admin()
    );

CREATE POLICY "sales_leads_update" ON sales_leads FOR UPDATE
    USING (
        assigned_to = auth.uid() OR
        auth_is_platform_owner()
    );

CREATE POLICY "sales_leads_delete" ON sales_leads FOR DELETE
    USING (auth_is_platform_owner());

-- Platform revenue
CREATE POLICY "platform_revenue_select" ON platform_revenue FOR SELECT
    USING (
        sales_rep_id = auth.uid() OR          -- Sales see their revenue
        auth_is_platform_owner()              -- Owner sees all
    );

CREATE POLICY "platform_revenue_insert" ON platform_revenue FOR INSERT
    WITH CHECK (auth_is_platform_admin());

CREATE POLICY "platform_revenue_update" ON platform_revenue FOR UPDATE
    USING (auth_is_platform_owner());

CREATE POLICY "platform_revenue_delete" ON platform_revenue FOR DELETE
    USING (auth_is_platform_owner());

-- =============================================
-- TENANT TABLES POLICIES
-- =============================================

-- Tenants table
CREATE POLICY "tenants_select" ON tenants FOR SELECT
    USING (auth_has_tenant_access(id));

CREATE POLICY "tenants_insert" ON tenants FOR INSERT
    WITH CHECK (auth_is_sales_team());        -- Sales team can create tenants

CREATE POLICY "tenants_update" ON tenants FOR UPDATE
    USING (
        auth_is_platform_owner() OR
        (id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users 
            WHERE tenant_id = id AND id = auth.uid() AND role = 'owner'
        ))
    );

CREATE POLICY "tenants_delete" ON tenants FOR DELETE
    USING (auth_is_platform_owner());

-- Tenant users
CREATE POLICY "tenant_users_select" ON tenant_users FOR SELECT
    USING (
        tenant_id = auth_tenant_id() OR       -- Same tenant users
        auth_is_platform_owner()              -- Platform owner
    );

CREATE POLICY "tenant_users_insert" ON tenant_users FOR INSERT
    WITH CHECK (
        auth_is_platform_owner() OR
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users 
            WHERE tenant_id = tenant_users.tenant_id AND id = auth.uid() 
            AND role IN ('owner', 'admin')
        ))
    );

CREATE POLICY "tenant_users_update" ON tenant_users FOR UPDATE
    USING (
        auth_is_platform_owner() OR
        id = auth.uid() OR                    -- Users update themselves
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = tenant_users.tenant_id AND tu.id = auth.uid() 
            AND tu.role IN ('owner', 'admin')
        ))
    );

CREATE POLICY "tenant_users_delete" ON tenant_users FOR DELETE
    USING (
        auth_is_platform_owner() OR
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = tenant_users.tenant_id AND tu.id = auth.uid() 
            AND tu.role = 'owner'
        ))
    );

-- Tenant settings
CREATE POLICY "tenant_settings_select" ON tenant_settings FOR SELECT
    USING (
        auth_has_tenant_access(tenant_id)
    );

CREATE POLICY "tenant_settings_insert" ON tenant_settings FOR INSERT
    WITH CHECK (
        auth_is_platform_owner() OR
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users 
            WHERE tenant_id = tenant_settings.tenant_id AND id = auth.uid() 
            AND role IN ('owner', 'admin')
        ))
    );

CREATE POLICY "tenant_settings_update" ON tenant_settings FOR UPDATE
    USING (
        auth_is_platform_owner() OR
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users 
            WHERE tenant_id = tenant_settings.tenant_id AND id = auth.uid() 
            AND role IN ('owner', 'admin')
        ))
    );

CREATE POLICY "tenant_settings_delete" ON tenant_settings FOR DELETE
    USING (
        auth_is_platform_owner() OR
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users 
            WHERE tenant_id = tenant_settings.tenant_id AND id = auth.uid() 
            AND role = 'owner'
        ))
    );

-- =============================================
-- CUSTOMER DATA POLICIES
-- =============================================

-- Customers
CREATE POLICY "customers_select" ON customers FOR SELECT
    USING (auth_has_tenant_access(tenant_id));

CREATE POLICY "customers_insert" ON customers FOR INSERT
    WITH CHECK (
        auth_has_tenant_access(tenant_id) AND (
            auth_is_platform_owner() OR
            tenant_id = auth_tenant_id()
        )
    );

CREATE POLICY "customers_update" ON customers FOR UPDATE
    USING (
        auth_has_tenant_access(tenant_id) AND (
            auth_is_platform_owner() OR
            tenant_id = auth_tenant_id()
        )
    );

CREATE POLICY "customers_delete" ON customers FOR DELETE
    USING (
        auth_is_platform_owner() OR
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users 
            WHERE tenant_id = customers.tenant_id AND id = auth.uid() 
            AND role IN ('owner', 'admin')
        ))
    );

-- =============================================
-- CONVERSATION DATA POLICIES
-- =============================================

-- Conversations
CREATE POLICY "conversations_all" ON conversations FOR ALL
    USING (auth_has_tenant_access(tenant_id));

-- Messages
CREATE POLICY "messages_all" ON messages FOR ALL
    USING (auth_has_tenant_access(tenant_id));

-- =============================================
-- MARKETING & CAMPAIGN POLICIES
-- =============================================

-- Campaigns
CREATE POLICY "campaigns_all" ON campaigns FOR ALL
    USING (auth_has_tenant_access(tenant_id));

-- Leads
CREATE POLICY "leads_all" ON leads FOR ALL
    USING (auth_has_tenant_access(tenant_id));

-- Content library
CREATE POLICY "content_library_all" ON content_library FOR ALL
    USING (auth_has_tenant_access(tenant_id));

-- =============================================
-- WEBSITE BUILDER POLICIES
-- =============================================

-- Website templates (master templates)
CREATE POLICY "website_templates_select" ON website_templates FOR SELECT
    USING (true);                             -- Everyone can view templates

CREATE POLICY "website_templates_insert" ON website_templates FOR INSERT
    WITH CHECK (auth_is_platform_owner());    -- Only owner creates templates

CREATE POLICY "website_templates_update" ON website_templates FOR UPDATE
    USING (auth_is_platform_owner());

CREATE POLICY "website_templates_delete" ON website_templates FOR DELETE
    USING (auth_is_platform_owner());

-- Website sections
CREATE POLICY "website_sections_select" ON website_sections FOR SELECT
    USING (true);                             -- Everyone can view sections

CREATE POLICY "website_sections_insert" ON website_sections FOR INSERT
    WITH CHECK (auth_is_platform_owner());

CREATE POLICY "website_sections_update" ON website_sections FOR UPDATE
    USING (auth_is_platform_owner());

CREATE POLICY "website_sections_delete" ON website_sections FOR DELETE
    USING (auth_is_platform_owner());

-- Tenant websites (actual client websites)
CREATE POLICY "tenant_websites_select" ON tenant_websites FOR SELECT
    USING (auth_has_tenant_access(tenant_id));

CREATE POLICY "tenant_websites_insert" ON tenant_websites FOR INSERT
    WITH CHECK (
        -- Platform owner can create for any tenant
        auth_is_platform_owner() OR
        -- Sales team can create for their assigned clients
        (auth_is_sales_team() AND auth_has_tenant_access(tenant_id)) OR
        -- Tenant admins can create for their own tenant
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users 
            WHERE tenant_id = tenant_websites.tenant_id AND id = auth.uid() 
            AND role IN ('owner', 'admin')
        ))
    );

CREATE POLICY "tenant_websites_update" ON tenant_websites FOR UPDATE
    USING (
        auth_is_platform_owner() OR
        -- Sales can help manage their clients' websites
        (auth_is_sales_team() AND auth_has_tenant_access(tenant_id)) OR
        -- Tenant admins can update their own
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users 
            WHERE tenant_id = tenant_websites.tenant_id AND id = auth.uid() 
            AND role IN ('owner', 'admin')
        ))
    );

CREATE POLICY "tenant_websites_delete" ON tenant_websites FOR DELETE
    USING (
        auth_is_platform_owner() OR
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users 
            WHERE tenant_id = tenant_websites.tenant_id AND id = auth.uid() 
            AND role = 'owner'
        ))
    );

-- Website customizations
CREATE POLICY "website_customizations_select" ON website_customizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tenant_websites 
            WHERE id = website_customizations.website_id 
            AND auth_has_tenant_access(tenant_id)
        )
    );

CREATE POLICY "website_customizations_insert" ON website_customizations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_websites tw
            WHERE tw.id = website_id AND (
                auth_is_platform_owner() OR
                (auth_is_sales_team() AND auth_has_tenant_access(tw.tenant_id)) OR
                (tw.tenant_id = auth_tenant_id() AND EXISTS (
                    SELECT 1 FROM tenant_users 
                    WHERE tenant_id = tw.tenant_id AND id = auth.uid() 
                    AND role IN ('owner', 'admin')
                ))
            )
        )
    );

CREATE POLICY "website_customizations_update" ON website_customizations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tenant_websites tw
            WHERE tw.id = website_customizations.website_id AND (
                auth_is_platform_owner() OR
                (auth_is_sales_team() AND auth_has_tenant_access(tw.tenant_id)) OR
                (tw.tenant_id = auth_tenant_id() AND EXISTS (
                    SELECT 1 FROM tenant_users 
                    WHERE tenant_id = tw.tenant_id AND id = auth.uid() 
                    AND role IN ('owner', 'admin')
                ))
            )
        )
    );

CREATE POLICY "website_customizations_delete" ON website_customizations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM tenant_websites tw
            WHERE tw.id = website_customizations.website_id AND (
                auth_is_platform_owner() OR
                (tw.tenant_id = auth_tenant_id() AND EXISTS (
                    SELECT 1 FROM tenant_users 
                    WHERE tenant_id = tw.tenant_id AND id = auth.uid() 
                    AND role = 'owner'
                ))
            )
        )
    );

-- Website pages
CREATE POLICY "website_pages_select" ON website_pages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tenant_websites 
            WHERE id = website_pages.website_id 
            AND auth_has_tenant_access(tenant_id)
        )
    );

CREATE POLICY "website_pages_insert" ON website_pages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_websites tw
            WHERE tw.id = website_id AND (
                auth_is_platform_owner() OR
                (auth_is_sales_team() AND auth_has_tenant_access(tw.tenant_id)) OR
                (tw.tenant_id = auth_tenant_id() AND EXISTS (
                    SELECT 1 FROM tenant_users 
                    WHERE tenant_id = tw.tenant_id AND id = auth.uid() 
                    AND role IN ('owner', 'admin')
                ))
            )
        )
    );

CREATE POLICY "website_pages_update" ON website_pages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tenant_websites tw
            WHERE tw.id = website_pages.website_id AND (
                auth_is_platform_owner() OR
                (auth_is_sales_team() AND auth_has_tenant_access(tw.tenant_id)) OR
                (tw.tenant_id = auth_tenant_id() AND EXISTS (
                    SELECT 1 FROM tenant_users 
                    WHERE tenant_id = tw.tenant_id AND id = auth.uid() 
                    AND role IN ('owner', 'admin')
                ))
            )
        )
    );

CREATE POLICY "website_pages_delete" ON website_pages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM tenant_websites tw
            WHERE tw.id = website_pages.website_id AND (
                auth_is_platform_owner() OR
                (tw.tenant_id = auth_tenant_id() AND EXISTS (
                    SELECT 1 FROM tenant_users 
                    WHERE tenant_id = tw.tenant_id AND id = auth.uid() 
                    AND role = 'owner'
                ))
            )
        )
    );

-- =============================================
-- SIMPLIFIED POLICIES FOR REMAINING TABLES
-- =============================================

-- Helper tables that follow parent table access
CREATE OR REPLACE FUNCTION create_dependent_policies(
    table_name text,
    parent_table text,
    parent_id_column text,
    parent_tenant_column text DEFAULT 'tenant_id'
)
RETURNS void AS $$
BEGIN
    -- SELECT policy
    EXECUTE format('
        CREATE POLICY "%s_select" ON %I FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM %I parent
                WHERE parent.id = %I.%I
                AND auth_has_tenant_access(parent.%I)
            )
        )', table_name, table_name, parent_table, table_name, parent_id_column, parent_tenant_column);
    
    -- INSERT policy
    EXECUTE format('
        CREATE POLICY "%s_insert" ON %I FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM %I parent
                WHERE parent.id = %I
                AND auth_has_tenant_access(parent.%I)
                AND (auth_is_platform_owner() OR parent.%I = auth_tenant_id())
            )
        )', table_name, table_name, parent_table, parent_id_column, parent_tenant_column, parent_tenant_column);
    
    -- UPDATE policy
    EXECUTE format('
        CREATE POLICY "%s_update" ON %I FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM %I parent
                WHERE parent.id = %I.%I
                AND auth_has_tenant_access(parent.%I)
                AND (auth_is_platform_owner() OR parent.%I = auth_tenant_id())
            )
        )', table_name, table_name, parent_table, table_name, parent_id_column, parent_tenant_column, parent_tenant_column);
    
    -- DELETE policy
    EXECUTE format('
        CREATE POLICY "%s_delete" ON %I FOR DELETE
        USING (
            auth_is_platform_owner() OR
            EXISTS (
                SELECT 1 FROM %I parent
                JOIN tenant_users tu ON tu.tenant_id = parent.%I
                WHERE parent.id = %I.%I
                AND tu.id = auth.uid() 
                AND tu.role IN (''owner'', ''admin'')
            )
        )', table_name, table_name, parent_table, parent_tenant_column, table_name, parent_id_column);
END;
$$ LANGUAGE plpgsql;

-- Apply policies to dependent tables
SELECT create_dependent_policies('customer_addresses', 'customers', 'customer_id');
SELECT create_dependent_policies('customer_tags', 'customers', 'customer_id');
SELECT create_dependent_policies('customer_preferences', 'customers', 'customer_id');
SELECT create_dependent_policies('message_media', 'messages', 'message_id');
SELECT create_dependent_policies('message_metadata', 'messages', 'message_id');
SELECT create_dependent_policies('campaign_channels', 'campaigns', 'campaign_id');
SELECT create_dependent_policies('campaign_audience', 'campaigns', 'campaign_id');
SELECT create_dependent_policies('campaign_content', 'campaigns', 'campaign_id');
SELECT create_dependent_policies('campaign_metrics', 'campaigns', 'campaign_id');
SELECT create_dependent_policies('lead_activities', 'leads', 'lead_id');
SELECT create_dependent_policies('lead_scores', 'leads', 'lead_id');

-- Content templates
CREATE POLICY "content_templates_all" ON content_templates FOR ALL
    USING (auth_has_tenant_access(tenant_id));

-- Scheduled content
CREATE POLICY "scheduled_content_all" ON scheduled_content FOR ALL
    USING (auth_has_tenant_access(tenant_id));

-- Content performance - platform owner only
CREATE POLICY "content_performance_all" ON content_performance FOR ALL
    USING (auth_is_platform_owner());

-- Commission tracking
CREATE POLICY "commissions_select" ON commissions FOR SELECT
    USING (
        sales_rep_id = auth.uid() OR
        auth_is_platform_owner()
    );

CREATE POLICY "commissions_insert" ON commissions FOR INSERT
    WITH CHECK (auth_is_platform_admin());

CREATE POLICY "commissions_update" ON commissions FOR UPDATE
    USING (auth_is_platform_owner());

CREATE POLICY "commissions_delete" ON commissions FOR DELETE
    USING (auth_is_platform_owner());

-- Onboarding sessions
CREATE POLICY "onboarding_sessions_select" ON onboarding_sessions FOR SELECT
    USING (
        sales_rep_id = auth.uid() OR
        auth_is_platform_owner()
    );

CREATE POLICY "onboarding_sessions_insert" ON onboarding_sessions FOR INSERT
    WITH CHECK (
        (sales_rep_id = auth.uid() AND auth_is_sales_team()) OR
        auth_is_platform_admin()
    );

CREATE POLICY "onboarding_sessions_update" ON onboarding_sessions FOR UPDATE
    USING (
        sales_rep_id = auth.uid() OR
        auth_is_platform_owner()
    );

CREATE POLICY "onboarding_sessions_delete" ON onboarding_sessions FOR DELETE
    USING (auth_is_platform_owner());

-- System tables - owner only
CREATE POLICY "system_logs_all" ON system_logs FOR ALL
    USING (auth_is_platform_owner());

CREATE POLICY "api_usage_all" ON api_usage FOR ALL
    USING (auth_is_platform_owner());

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- List all tables with RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- Show policy details for each table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- COMPREHENSIVE RLS POLICIES COMPLETE!
-- =============================================

-- Summary of permissions:
-- 1. Platform Owner: Full access to everything
-- 2. Sales Team: 
--    - Can create and manage tenants for their clients
--    - Can create websites for their assigned clients
--    - Can help configure websites during onboarding
--    - Cannot access tenants they're not assigned to
-- 3. Tenant Users:
--    - Completely isolated to their own tenant data
--    - Tenant owners/admins can manage their websites
--    - Cannot see any other tenant's data
-- 4. Website Templates:
--    - Read-only for everyone (sales and tenants can browse)
--    - Only platform owner can create/modify templates