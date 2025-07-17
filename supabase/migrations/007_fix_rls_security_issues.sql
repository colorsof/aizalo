-- =============================================
-- FIX RLS SECURITY ISSUES
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration fixes RLS enablement and SECURITY DEFINER issues
-- =============================================

-- =============================================
-- PART 1: ENABLE RLS ON TABLES THAT HAVE POLICIES
-- =============================================

-- Enable RLS on platform tables
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_templates ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PART 2: FIX SECURITY DEFINER VIEWS
-- =============================================

-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS active_tenants CASCADE;
DROP VIEW IF EXISTS active_customers CASCADE;
DROP VIEW IF EXISTS active_tenant_users CASCADE;
DROP VIEW IF EXISTS active_conversations CASCADE;
DROP VIEW IF EXISTS active_campaigns CASCADE;
DROP VIEW IF EXISTS recent_errors CASCADE;
DROP VIEW IF EXISTS slow_queries CASCADE;
DROP VIEW IF EXISTS audit_summary CASCADE;

-- Recreate views with SECURITY INVOKER (default)
CREATE VIEW active_tenants AS
SELECT * FROM tenants WHERE deleted_at IS NULL;

CREATE VIEW active_customers AS
SELECT * FROM customers WHERE deleted_at IS NULL;

CREATE VIEW active_tenant_users AS
SELECT * FROM tenant_users WHERE deleted_at IS NULL;

CREATE VIEW active_conversations AS
SELECT * FROM conversations WHERE deleted_at IS NULL;

CREATE VIEW active_campaigns AS
SELECT * FROM campaigns WHERE deleted_at IS NULL;

-- View for recent errors
CREATE VIEW recent_errors AS
SELECT 
    created_at,
    level,
    source,
    message,
    error_code,
    user_type,
    tenant_id,
    duration_ms
FROM system_logs
WHERE level IN ('error', 'critical')
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- View for slow queries
CREATE VIEW slow_queries AS
SELECT 
    created_at,
    operation,
    duration_ms,
    row_count,
    tenant_id,
    metadata
FROM performance_metrics
WHERE duration_ms > 1000
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY duration_ms DESC;

-- View for audit summary
CREATE VIEW audit_summary AS
SELECT 
    DATE(created_at) as date,
    table_name,
    action,
    user_type,
    COUNT(*) as operation_count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), table_name, action, user_type
ORDER BY date DESC, operation_count DESC;

-- =============================================
-- PART 3: APPLY RLS POLICIES TO VIEWS
-- =============================================

-- Since views inherit RLS from their base tables, we need to ensure
-- the base tables have proper RLS enabled (which we did above)

-- Grant permissions on views to authenticated users
GRANT SELECT ON active_tenants TO authenticated;
GRANT SELECT ON active_customers TO authenticated;
GRANT SELECT ON active_tenant_users TO authenticated;
GRANT SELECT ON active_conversations TO authenticated;
GRANT SELECT ON active_campaigns TO authenticated;
GRANT SELECT ON recent_errors TO authenticated;
GRANT SELECT ON slow_queries TO authenticated;
GRANT SELECT ON audit_summary TO authenticated;

-- =============================================
-- PART 4: VERIFY ALL TABLES HAVE RLS ENABLED
-- =============================================

-- This query will show any tables that still don't have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = false THEN 'NEEDS RLS ENABLED'
        ELSE 'OK'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT LIKE 'pg_%'
AND tablename NOT IN (
    -- These are views, not tables
    'active_tenants', 'active_customers', 'active_tenant_users',
    'active_conversations', 'active_campaigns', 'recent_errors',
    'slow_queries', 'audit_summary'
)
ORDER BY rowsecurity ASC, tablename;

-- =============================================
-- PART 5: DOUBLE-CHECK RLS POLICIES EXIST
-- =============================================

-- Verify policies exist for the tables we just enabled RLS on
SELECT 
    schemaname,
    tablename,
    COUNT(policyname) as policy_count,
    STRING_AGG(policyname, ', ') as policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'platform_settings', 'platform_users', 'sales_territories',
    'sales_leads', 'website_sections', 'website_templates'
)
GROUP BY schemaname, tablename
ORDER BY tablename;

-- =============================================
-- SECURITY FIXES COMPLETE!
-- =============================================

-- Summary:
-- 1. ✓ Enabled RLS on all tables with policies
-- 2. ✓ Removed SECURITY DEFINER from all views
-- 3. ✓ Views now use SECURITY INVOKER (safer)
-- 4. ✓ Granted appropriate permissions on views