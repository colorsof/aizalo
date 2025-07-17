-- =============================================
-- UPDATE RLS POLICIES FOR SOFT DELETE SUPPORT
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration updates all RLS policies to exclude soft-deleted records
-- =============================================

-- First, update our helper functions to exclude soft-deleted records

CREATE OR REPLACE FUNCTION auth_is_platform_owner()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE id = auth.uid() 
        AND role = 'owner'
        AND is_active = true
        AND deleted_at IS NULL  -- Exclude soft-deleted
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

CREATE OR REPLACE FUNCTION auth_is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE id = auth.uid() 
        AND role IN ('owner', 'admin')
        AND is_active = true
        AND deleted_at IS NULL  -- Exclude soft-deleted
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

CREATE OR REPLACE FUNCTION auth_is_sales_team()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE id = auth.uid() 
        AND role IN ('owner', 'admin', 'sales')
        AND is_active = true
        AND deleted_at IS NULL  -- Exclude soft-deleted
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

CREATE OR REPLACE FUNCTION auth_tenant_id()
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;
    
    SELECT tu.tenant_id INTO v_tenant_id
    FROM tenant_users tu
    JOIN tenants t ON t.id = tu.tenant_id
    WHERE tu.id = auth.uid() 
    AND tu.is_active = true
    AND tu.deleted_at IS NULL  -- Exclude soft-deleted users
    AND t.deleted_at IS NULL    -- Exclude users from deleted tenants
    LIMIT 1;
    
    RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

CREATE OR REPLACE FUNCTION auth_has_tenant_access(check_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL OR check_tenant_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if tenant is soft-deleted
    IF EXISTS (SELECT 1 FROM tenants WHERE id = check_tenant_id AND deleted_at IS NOT NULL) THEN
        RETURN FALSE;
    END IF;
    
    RETURN (
        -- Platform owner sees all (including soft-deleted for recovery purposes)
        auth_is_platform_owner() OR
        -- Tenant users see their own tenant
        check_tenant_id = auth_tenant_id() OR
        -- Sales team sees their assigned tenants
        EXISTS (
            SELECT 1 FROM sales_leads sl
            JOIN tenants t ON t.business_name = sl.business_name
            WHERE sl.assigned_to = auth.uid() 
            AND t.id = check_tenant_id
            AND sl.status = 'won'
            AND sl.deleted_at IS NULL
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- =============================================
-- UPDATE KEY TABLE POLICIES FOR SOFT DELETE
-- =============================================

-- Platform users - exclude soft-deleted except for platform owner
DROP POLICY IF EXISTS "platform_users_select" ON platform_users;
CREATE POLICY "platform_users_select" ON platform_users FOR SELECT
    USING (
        (deleted_at IS NULL AND (id = auth.uid() OR auth_is_platform_owner())) OR
        (auth_is_platform_owner())  -- Owner can see soft-deleted for recovery
    );

-- Tenants - exclude soft-deleted except for platform owner
DROP POLICY IF EXISTS "tenants_select" ON tenants;
CREATE POLICY "tenants_select" ON tenants FOR SELECT
    USING (
        (deleted_at IS NULL AND auth_has_tenant_access(id)) OR
        (auth_is_platform_owner())  -- Owner can see soft-deleted for recovery
    );

-- Tenant users - exclude soft-deleted
DROP POLICY IF EXISTS "tenant_users_select" ON tenant_users;
CREATE POLICY "tenant_users_select" ON tenant_users FOR SELECT
    USING (
        deleted_at IS NULL AND (
            tenant_id = auth_tenant_id() OR
            auth_is_platform_owner()
        )
    );

-- Customers - exclude soft-deleted
DROP POLICY IF EXISTS "customers_select" ON customers;
CREATE POLICY "customers_select" ON customers FOR SELECT
    USING (
        deleted_at IS NULL AND auth_has_tenant_access(tenant_id)
    );

-- Conversations - exclude soft-deleted
DROP POLICY IF EXISTS "conversations_all" ON conversations;
CREATE POLICY "conversations_select" ON conversations FOR SELECT
    USING (
        deleted_at IS NULL AND auth_has_tenant_access(tenant_id)
    );

CREATE POLICY "conversations_insert" ON conversations FOR INSERT
    WITH CHECK (
        auth_has_tenant_access(tenant_id)
    );

CREATE POLICY "conversations_update" ON conversations FOR UPDATE
    USING (
        deleted_at IS NULL AND auth_has_tenant_access(tenant_id)
    );

CREATE POLICY "conversations_delete" ON conversations FOR DELETE
    USING (
        deleted_at IS NULL AND auth_has_tenant_access(tenant_id)
    );

-- Messages - exclude soft-deleted
DROP POLICY IF EXISTS "messages_all" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT
    USING (
        deleted_at IS NULL AND auth_has_tenant_access(tenant_id)
    );

CREATE POLICY "messages_insert" ON messages FOR INSERT
    WITH CHECK (
        auth_has_tenant_access(tenant_id)
    );

CREATE POLICY "messages_update" ON messages FOR UPDATE
    USING (
        deleted_at IS NULL AND auth_has_tenant_access(tenant_id)
    );

CREATE POLICY "messages_delete" ON messages FOR DELETE
    USING (
        deleted_at IS NULL AND auth_has_tenant_access(tenant_id)
    );

-- Campaigns - exclude soft-deleted
DROP POLICY IF EXISTS "campaigns_all" ON campaigns;
CREATE POLICY "campaigns_select" ON campaigns FOR SELECT
    USING (
        deleted_at IS NULL AND auth_has_tenant_access(tenant_id)
    );

CREATE POLICY "campaigns_insert" ON campaigns FOR INSERT
    WITH CHECK (
        auth_has_tenant_access(tenant_id)
    );

CREATE POLICY "campaigns_update" ON campaigns FOR UPDATE
    USING (
        deleted_at IS NULL AND auth_has_tenant_access(tenant_id)
    );

CREATE POLICY "campaigns_delete" ON campaigns FOR DELETE
    USING (
        deleted_at IS NULL AND auth_has_tenant_access(tenant_id)
    );

-- Website templates - exclude soft-deleted from public view
DROP POLICY IF EXISTS "website_templates_select" ON website_templates;
CREATE POLICY "website_templates_select" ON website_templates FOR SELECT
    USING (
        deleted_at IS NULL OR auth_is_platform_owner()
    );

-- Tenant websites - exclude soft-deleted
DROP POLICY IF EXISTS "tenant_websites_select" ON tenant_websites;
CREATE POLICY "tenant_websites_select" ON tenant_websites FOR SELECT
    USING (
        deleted_at IS NULL AND auth_has_tenant_access(tenant_id)
    );

-- =============================================
-- CREATE SOFT DELETE HELPER FUNCTIONS
-- =============================================

-- Function to soft delete a record
CREATE OR REPLACE FUNCTION soft_delete(table_name text, record_id uuid)
RETURNS void AS $$
BEGIN
    EXECUTE format('UPDATE %I SET deleted_at = NOW() WHERE id = $1', table_name) USING record_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to restore a soft-deleted record (platform owner only)
CREATE OR REPLACE FUNCTION restore_deleted(table_name text, record_id uuid)
RETURNS void AS $$
BEGIN
    IF NOT auth_is_platform_owner() THEN
        RAISE EXCEPTION 'Only platform owner can restore deleted records';
    END IF;
    
    EXECUTE format('UPDATE %I SET deleted_at = NULL WHERE id = $1', table_name) USING record_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- =============================================
-- CREATE VIEWS FOR ACTIVE RECORDS
-- =============================================

-- Create views that automatically exclude soft-deleted records
CREATE OR REPLACE VIEW active_tenants AS
SELECT * FROM tenants WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_customers AS
SELECT * FROM customers WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_tenant_users AS
SELECT * FROM tenant_users WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_conversations AS
SELECT * FROM conversations WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_campaigns AS
SELECT * FROM campaigns WHERE deleted_at IS NULL;

-- Grant appropriate permissions on views
GRANT SELECT ON active_tenants TO authenticated;
GRANT SELECT ON active_customers TO authenticated;
GRANT SELECT ON active_tenant_users TO authenticated;
GRANT SELECT ON active_conversations TO authenticated;
GRANT SELECT ON active_campaigns TO authenticated;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Test soft delete functionality
SELECT 
    'Platform Users' as table_name,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_records,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_records
FROM platform_users
UNION ALL
SELECT 
    'Tenants',
    COUNT(*) FILTER (WHERE deleted_at IS NULL),
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)
FROM tenants
UNION ALL
SELECT 
    'Customers',
    COUNT(*) FILTER (WHERE deleted_at IS NULL),
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)
FROM customers;

-- =============================================
-- SOFT DELETE SUPPORT COMPLETE!
-- =============================================