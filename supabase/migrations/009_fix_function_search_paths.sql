-- =============================================
-- FIX FUNCTION SEARCH PATHS
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration sets explicit search_path for all functions to prevent attacks
-- =============================================

-- Fix helper functions
ALTER FUNCTION auth_is_platform_owner() SET search_path = public, pg_catalog;
ALTER FUNCTION auth_is_platform_admin() SET search_path = public, pg_catalog;
ALTER FUNCTION auth_is_sales_team() SET search_path = public, pg_catalog;
ALTER FUNCTION auth_tenant_id() SET search_path = public, pg_catalog;
ALTER FUNCTION auth_has_tenant_access(UUID) SET search_path = public, pg_catalog;

-- Fix trigger functions
ALTER FUNCTION update_updated_at_column() SET search_path = public, pg_catalog;
ALTER FUNCTION update_conversation_last_message_time() SET search_path = public, pg_catalog;
ALTER FUNCTION ensure_one_default_address() SET search_path = public, pg_catalog;
ALTER FUNCTION check_single_platform_owner() SET search_path = public, pg_catalog;
ALTER FUNCTION validate_commission() SET search_path = public, pg_catalog;
ALTER FUNCTION audit_trigger_function() SET search_path = public, pg_catalog;

-- Fix utility functions
ALTER FUNCTION create_dependent_policies(text, text, text, text) SET search_path = public, pg_catalog;
ALTER FUNCTION update_subscription_status() SET search_path = public, pg_catalog;
ALTER FUNCTION soft_delete(text, uuid) SET search_path = public, pg_catalog;
ALTER FUNCTION restore_deleted(text, uuid) SET search_path = public, pg_catalog;

-- Fix logging functions
ALTER FUNCTION log_error(varchar, varchar, text, varchar, text, jsonb) SET search_path = public, pg_catalog;
ALTER FUNCTION log_performance(varchar, varchar, timestamp, integer, jsonb) SET search_path = public, pg_catalog;
ALTER FUNCTION system_health_check() SET search_path = public, pg_catalog;

-- =============================================
-- VERIFY ALL FUNCTIONS HAVE SEARCH_PATH SET
-- =============================================

-- List all functions and their search_path settings
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_userbyid(p.proowner) AS owner,
    CASE 
        WHEN p.prosecdef THEN 'SECURITY DEFINER' 
        ELSE 'SECURITY INVOKER' 
    END AS security,
    COALESCE(
        (SELECT array_to_string(proconfig, ', ') 
         FROM pg_proc 
         WHERE oid = p.oid 
         AND proconfig::text LIKE '%search_path%'),
        'NOT SET'
    ) AS search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'  -- Only functions, not procedures
ORDER BY n.nspname, p.proname;

-- =============================================
-- ADDITIONAL SECURITY HARDENING
-- =============================================

-- Ensure auth schema functions also have proper search paths
-- These are Supabase internal functions but good to check
SELECT 
    'auth.' || proname AS function_name,
    CASE 
        WHEN prosecdef THEN 'SECURITY DEFINER' 
        ELSE 'SECURITY INVOKER' 
    END AS security
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'auth'
AND p.prokind = 'f'
LIMIT 10;

-- =============================================
-- SEARCH PATH FIXES COMPLETE!
-- =============================================

-- Summary:
-- 1. ✓ Set explicit search_path for all custom functions
-- 2. ✓ Prevents search_path injection attacks
-- 3. ✓ Functions will only look in public and pg_catalog schemas
-- 4. ✓ More secure function execution