-- =============================================
-- FORCE FIX SECURITY DEFINER VIEWS
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration explicitly removes SECURITY DEFINER from all views
-- =============================================

-- First, check current security settings
SELECT 
    schemaname,
    viewname,
    viewowner,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'HAS SECURITY DEFINER'
        ELSE 'OK'
    END as security_status
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN (
    'active_tenants', 'active_customers', 'active_tenant_users',
    'active_conversations', 'active_campaigns', 'recent_errors',
    'slow_queries', 'audit_summary'
);

-- Drop all problematic views completely
DROP VIEW IF EXISTS active_tenants CASCADE;
DROP VIEW IF EXISTS active_customers CASCADE;
DROP VIEW IF EXISTS active_tenant_users CASCADE;
DROP VIEW IF EXISTS active_conversations CASCADE;
DROP VIEW IF EXISTS active_campaigns CASCADE;
DROP VIEW IF EXISTS recent_errors CASCADE;
DROP VIEW IF EXISTS slow_queries CASCADE;
DROP VIEW IF EXISTS audit_summary CASCADE;

-- Recreate views with explicit SECURITY INVOKER
CREATE OR REPLACE VIEW active_tenants 
WITH (security_invoker = true) AS
SELECT * FROM tenants WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_customers 
WITH (security_invoker = true) AS
SELECT * FROM customers WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_tenant_users 
WITH (security_invoker = true) AS
SELECT * FROM tenant_users WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_conversations 
WITH (security_invoker = true) AS
SELECT * FROM conversations WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_campaigns 
WITH (security_invoker = true) AS
SELECT * FROM campaigns WHERE deleted_at IS NULL;

-- View for recent errors with explicit security invoker
CREATE OR REPLACE VIEW recent_errors 
WITH (security_invoker = true) AS
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

-- View for slow queries with explicit security invoker
CREATE OR REPLACE VIEW slow_queries 
WITH (security_invoker = true) AS
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

-- View for audit summary with explicit security invoker
CREATE OR REPLACE VIEW audit_summary 
WITH (security_invoker = true) AS
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

-- Grant permissions
GRANT SELECT ON active_tenants TO authenticated;
GRANT SELECT ON active_customers TO authenticated;
GRANT SELECT ON active_tenant_users TO authenticated;
GRANT SELECT ON active_conversations TO authenticated;
GRANT SELECT ON active_campaigns TO authenticated;
GRANT SELECT ON recent_errors TO authenticated;
GRANT SELECT ON slow_queries TO authenticated;
GRANT SELECT ON audit_summary TO authenticated;

-- Alternative approach: If the above doesn't work, we can use ALTER VIEW
ALTER VIEW active_tenants SET (security_invoker = true);
ALTER VIEW active_customers SET (security_invoker = true);
ALTER VIEW active_tenant_users SET (security_invoker = true);
ALTER VIEW active_conversations SET (security_invoker = true);
ALTER VIEW active_campaigns SET (security_invoker = true);
ALTER VIEW recent_errors SET (security_invoker = true);
ALTER VIEW slow_queries SET (security_invoker = true);
ALTER VIEW audit_summary SET (security_invoker = true);

-- Verify the fix worked
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN (
    'active_tenants', 'active_customers', 'active_tenant_users',
    'active_conversations', 'active_campaigns', 'recent_errors',
    'slow_queries', 'audit_summary'
)
ORDER BY viewname;

-- =============================================
-- ALTERNATIVE: MOVE VIEWS TO DIFFERENT SCHEMA
-- =============================================
-- If views still have issues, we can move them to a private schema

-- Create a private schema for views
CREATE SCHEMA IF NOT EXISTS private;

-- Drop public views
DROP VIEW IF EXISTS public.active_tenants CASCADE;
DROP VIEW IF EXISTS public.active_customers CASCADE;
DROP VIEW IF EXISTS public.active_tenant_users CASCADE;
DROP VIEW IF EXISTS public.active_conversations CASCADE;
DROP VIEW IF EXISTS public.active_campaigns CASCADE;
DROP VIEW IF EXISTS public.recent_errors CASCADE;
DROP VIEW IF EXISTS public.slow_queries CASCADE;
DROP VIEW IF EXISTS public.audit_summary CASCADE;

-- Create views in private schema
CREATE VIEW private.active_tenants AS
SELECT * FROM public.tenants WHERE deleted_at IS NULL;

CREATE VIEW private.active_customers AS
SELECT * FROM public.customers WHERE deleted_at IS NULL;

CREATE VIEW private.active_tenant_users AS
SELECT * FROM public.tenant_users WHERE deleted_at IS NULL;

CREATE VIEW private.active_conversations AS
SELECT * FROM public.conversations WHERE deleted_at IS NULL;

CREATE VIEW private.active_campaigns AS
SELECT * FROM public.campaigns WHERE deleted_at IS NULL;

CREATE VIEW private.recent_errors AS
SELECT 
    created_at,
    level,
    source,
    message,
    error_code,
    user_type,
    tenant_id,
    duration_ms
FROM public.system_logs
WHERE level IN ('error', 'critical')
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

CREATE VIEW private.slow_queries AS
SELECT 
    created_at,
    operation,
    duration_ms,
    row_count,
    tenant_id,
    metadata
FROM public.performance_metrics
WHERE duration_ms > 1000
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY duration_ms DESC;

CREATE VIEW private.audit_summary AS
SELECT 
    DATE(created_at) as date,
    table_name,
    action,
    user_type,
    COUNT(*) as operation_count
FROM public.audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), table_name, action, user_type
ORDER BY date DESC, operation_count DESC;

-- Grant usage on private schema
GRANT USAGE ON SCHEMA private TO authenticated;

-- Grant select on private views
GRANT SELECT ON ALL TABLES IN SCHEMA private TO authenticated;

-- =============================================
-- VERIFICATION
-- =============================================

-- Check if views exist in public schema
SELECT 
    'Public Views' as location,
    COUNT(*) as view_count
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN (
    'active_tenants', 'active_customers', 'active_tenant_users',
    'active_conversations', 'active_campaigns', 'recent_errors',
    'slow_queries', 'audit_summary'
)
UNION ALL
SELECT 
    'Private Views' as location,
    COUNT(*) as view_count
FROM pg_views
WHERE schemaname = 'private'
AND viewname IN (
    'active_tenants', 'active_customers', 'active_tenant_users',
    'active_conversations', 'active_campaigns', 'recent_errors',
    'slow_queries', 'audit_summary'
);

-- =============================================
-- SECURITY DEFINER VIEWS FIXED!
-- =============================================