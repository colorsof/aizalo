-- =============================================
-- OPTIMIZE RLS PERFORMANCE
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration optimizes RLS policies by preventing auth.uid() re-evaluation
-- =============================================

-- First, let's optimize our helper functions to use subqueries
CREATE OR REPLACE FUNCTION auth_is_platform_owner()
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := (SELECT auth.uid());
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE id = v_user_id 
        AND role = 'owner'
        AND is_active = true
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE SET search_path = public, pg_catalog;

CREATE OR REPLACE FUNCTION auth_is_platform_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := (SELECT auth.uid());
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE id = v_user_id 
        AND role IN ('owner', 'admin')
        AND is_active = true
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE SET search_path = public, pg_catalog;

CREATE OR REPLACE FUNCTION auth_is_sales_team()
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := (SELECT auth.uid());
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE id = v_user_id 
        AND role IN ('owner', 'admin', 'sales')
        AND is_active = true
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE SET search_path = public, pg_catalog;

CREATE OR REPLACE FUNCTION auth_tenant_id()
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
BEGIN
    v_user_id := (SELECT auth.uid());
    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    SELECT tu.tenant_id INTO v_tenant_id
    FROM tenant_users tu
    JOIN tenants t ON t.id = tu.tenant_id
    WHERE tu.id = v_user_id 
    AND tu.is_active = true
    AND tu.deleted_at IS NULL
    AND t.deleted_at IS NULL
    LIMIT 1;
    
    RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE SET search_path = public, pg_catalog;

CREATE OR REPLACE FUNCTION auth_has_tenant_access(check_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := (SELECT auth.uid());
    IF v_user_id IS NULL OR check_tenant_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if tenant is soft-deleted
    IF EXISTS (SELECT 1 FROM tenants WHERE id = check_tenant_id AND deleted_at IS NOT NULL) THEN
        RETURN FALSE;
    END IF;
    
    RETURN (
        -- Platform owner sees all
        auth_is_platform_owner() OR
        -- Tenant users see their own tenant
        check_tenant_id = auth_tenant_id() OR
        -- Sales team sees their assigned tenants
        EXISTS (
            SELECT 1 FROM sales_leads sl
            JOIN tenants t ON t.business_name = sl.business_name
            WHERE sl.assigned_to = v_user_id 
            AND t.id = check_tenant_id
            AND sl.status = 'won'
            AND sl.deleted_at IS NULL
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE SET search_path = public, pg_catalog;

-- =============================================
-- FIX KEY RLS POLICIES WITH PERFORMANCE ISSUES
-- =============================================

-- Platform users policies
DROP POLICY IF EXISTS "platform_users_select" ON platform_users;
CREATE POLICY "platform_users_select" ON platform_users FOR SELECT
    USING (
        (deleted_at IS NULL AND (id = (SELECT auth.uid()) OR auth_is_platform_owner())) OR
        (auth_is_platform_owner())
    );

DROP POLICY IF EXISTS "platform_users_update" ON platform_users;
CREATE POLICY "platform_users_update" ON platform_users FOR UPDATE
    USING (
        id = (SELECT auth.uid()) OR
        auth_is_platform_owner()
    );

-- Sales territories
DROP POLICY IF EXISTS "sales_territories_select" ON sales_territories;
CREATE POLICY "sales_territories_select" ON sales_territories FOR SELECT
    USING (
        assigned_to = (SELECT auth.uid()) OR
        auth_is_platform_admin()
    );

-- Sales leads
DROP POLICY IF EXISTS "sales_leads_select" ON sales_leads;
CREATE POLICY "sales_leads_select" ON sales_leads FOR SELECT
    USING (
        assigned_to = (SELECT auth.uid()) OR
        auth_is_platform_owner()
    );

DROP POLICY IF EXISTS "sales_leads_insert" ON sales_leads;
CREATE POLICY "sales_leads_insert" ON sales_leads FOR INSERT
    WITH CHECK (
        (assigned_to = (SELECT auth.uid()) AND auth_is_sales_team()) OR
        auth_is_platform_admin()
    );

DROP POLICY IF EXISTS "sales_leads_update" ON sales_leads;
CREATE POLICY "sales_leads_update" ON sales_leads FOR UPDATE
    USING (
        assigned_to = (SELECT auth.uid()) OR
        auth_is_platform_owner()
    );

-- Platform revenue
DROP POLICY IF EXISTS "platform_revenue_select" ON platform_revenue;
CREATE POLICY "platform_revenue_select" ON platform_revenue FOR SELECT
    USING (
        sales_rep_id = (SELECT auth.uid()) OR
        auth_is_platform_owner()
    );

-- Tenant users
DROP POLICY IF EXISTS "tenant_users_update" ON tenant_users;
CREATE POLICY "tenant_users_update" ON tenant_users FOR UPDATE
    USING (
        auth_is_platform_owner() OR
        id = (SELECT auth.uid()) OR
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = tenant_users.tenant_id 
            AND tu.id = (SELECT auth.uid())
            AND tu.role IN ('owner', 'admin')
        ))
    );

-- Commissions
DROP POLICY IF EXISTS "commissions_select" ON commissions;
CREATE POLICY "commissions_select" ON commissions FOR SELECT
    USING (
        sales_rep_id = (SELECT auth.uid()) OR
        auth_is_platform_owner()
    );

-- Onboarding sessions
DROP POLICY IF EXISTS "onboarding_sessions_select" ON onboarding_sessions;
CREATE POLICY "onboarding_sessions_select" ON onboarding_sessions FOR SELECT
    USING (
        sales_rep_id = (SELECT auth.uid()) OR
        auth_is_platform_owner()
    );

DROP POLICY IF EXISTS "onboarding_sessions_insert" ON onboarding_sessions;
CREATE POLICY "onboarding_sessions_insert" ON onboarding_sessions FOR INSERT
    WITH CHECK (
        (sales_rep_id = (SELECT auth.uid()) AND auth_is_sales_team()) OR
        auth_is_platform_admin()
    );

DROP POLICY IF EXISTS "onboarding_sessions_update" ON onboarding_sessions;
CREATE POLICY "onboarding_sessions_update" ON onboarding_sessions FOR UPDATE
    USING (
        sales_rep_id = (SELECT auth.uid()) OR
        auth_is_platform_owner()
    );

-- System logs - fix duplicate policies
DROP POLICY IF EXISTS "system_logs_all" ON system_logs;
DROP POLICY IF EXISTS "system_logs_access" ON system_logs;

CREATE POLICY "system_logs_access" ON system_logs FOR SELECT
    USING (
        auth_is_platform_owner() OR
        user_id = (SELECT auth.uid()) OR
        (tenant_id = auth_tenant_id() AND user_type = 'tenant')
    );

-- Performance metrics
DROP POLICY IF EXISTS "performance_metrics_access" ON performance_metrics;
CREATE POLICY "performance_metrics_access" ON performance_metrics FOR SELECT
    USING (
        auth_is_platform_owner() OR
        user_id = (SELECT auth.uid()) OR
        tenant_id = auth_tenant_id()
    );

-- Tenants update policy
DROP POLICY IF EXISTS "tenants_update" ON tenants;
CREATE POLICY "tenants_update" ON tenants FOR UPDATE
    USING (
        auth_is_platform_owner() OR
        (id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users
            WHERE tenant_users.tenant_id = tenants.id
            AND tenant_users.id = (SELECT auth.uid())
            AND tenant_users.role = 'owner'
        ))
    );

-- =============================================
-- CREATE OPTIMIZED VIEWS FOR COMMON QUERIES
-- =============================================

-- Create a materialized view for user access checks (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_access_cache AS
SELECT 
    pu.id as user_id,
    pu.role as platform_role,
    tu.tenant_id,
    tu.role as tenant_role,
    t.business_name,
    t.subscription_status
FROM platform_users pu
LEFT JOIN tenant_users tu ON tu.id = pu.id
LEFT JOIN tenants t ON t.id = tu.tenant_id
WHERE pu.deleted_at IS NULL
AND (tu.deleted_at IS NULL OR tu.deleted_at IS NOT NULL)
AND (t.deleted_at IS NULL OR t.deleted_at IS NOT NULL);

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_user_access_cache_user_id ON user_access_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_cache_tenant_id ON user_access_cache(tenant_id);

-- Grant access to the materialized view
GRANT SELECT ON user_access_cache TO authenticated;

-- =============================================
-- PERFORMANCE VERIFICATION
-- =============================================

-- Check for any remaining auth.uid() calls without SELECT
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(SELECT auth.uid())%') 
          OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(SELECT auth.uid())%')
        THEN 'NEEDS OPTIMIZATION'
        ELSE 'OPTIMIZED'
    END as optimization_status
FROM pg_policies
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
ORDER BY optimization_status DESC, tablename, policyname;

-- =============================================
-- RLS PERFORMANCE OPTIMIZATION COMPLETE!
-- =============================================

-- Summary:
-- 1. ✓ Optimized helper functions to cache auth.uid()
-- 2. ✓ Updated RLS policies to use (SELECT auth.uid())
-- 3. ✓ Fixed duplicate system_logs policies
-- 4. ✓ Created materialized view for faster access checks