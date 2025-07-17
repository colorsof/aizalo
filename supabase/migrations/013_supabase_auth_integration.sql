-- =============================================
-- SUPABASE AUTH INTEGRATION
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration integrates our user tables with Supabase Auth
-- =============================================

-- Add auth_id columns to link to Supabase Auth users
ALTER TABLE platform_users 
ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE tenant_users 
ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for auth_id lookups
CREATE INDEX IF NOT EXISTS idx_platform_users_auth_id ON platform_users(auth_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_auth_id ON tenant_users(auth_id);

-- =============================================
-- UPDATE RLS HELPER FUNCTIONS TO USE SUPABASE AUTH
-- =============================================

-- Get platform user ID from auth user
CREATE OR REPLACE FUNCTION auth_platform_user_id()
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM platform_users
    WHERE auth_id = auth.uid()
    AND is_active = true
    AND deleted_at IS NULL
    LIMIT 1;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- Get tenant user ID from auth user
CREATE OR REPLACE FUNCTION auth_tenant_user_id()
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM tenant_users
    WHERE auth_id = auth.uid()
    AND is_active = true
    AND deleted_at IS NULL
    LIMIT 1;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- Update auth_is_platform_owner to use Supabase Auth
CREATE OR REPLACE FUNCTION auth_is_platform_owner()
RETURNS BOOLEAN AS $$
DECLARE
    v_auth_id UUID;
BEGIN
    v_auth_id := auth.uid();
    IF v_auth_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE auth_id = v_auth_id 
        AND role = 'owner'
        AND is_active = true
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- Update auth_is_platform_admin to use Supabase Auth
CREATE OR REPLACE FUNCTION auth_is_platform_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_auth_id UUID;
BEGIN
    v_auth_id := auth.uid();
    IF v_auth_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE auth_id = v_auth_id 
        AND role IN ('owner', 'admin')
        AND is_active = true
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- Update auth_is_sales_team to use Supabase Auth
CREATE OR REPLACE FUNCTION auth_is_sales_team()
RETURNS BOOLEAN AS $$
DECLARE
    v_auth_id UUID;
BEGIN
    v_auth_id := auth.uid();
    IF v_auth_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE auth_id = v_auth_id 
        AND role IN ('owner', 'admin', 'sales')
        AND is_active = true
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- Update auth_tenant_id to use Supabase Auth
CREATE OR REPLACE FUNCTION auth_tenant_id()
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
    v_auth_id UUID;
BEGIN
    v_auth_id := auth.uid();
    IF v_auth_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- First check if user has tenant metadata in JWT
    IF auth.jwt() -> 'user_metadata' ->> 'tenantId' IS NOT NULL THEN
        RETURN (auth.jwt() -> 'user_metadata' ->> 'tenantId')::UUID;
    END IF;
    
    -- Otherwise look up from tenant_users table
    SELECT tu.tenant_id INTO v_tenant_id
    FROM tenant_users tu
    JOIN tenants t ON t.id = tu.tenant_id
    WHERE tu.auth_id = v_auth_id 
    AND tu.is_active = true
    AND tu.deleted_at IS NULL
    AND t.deleted_at IS NULL
    LIMIT 1;
    
    RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- Update auth_has_tenant_access to use Supabase Auth
CREATE OR REPLACE FUNCTION auth_has_tenant_access(check_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_auth_id UUID;
    v_platform_user_id UUID;
BEGIN
    v_auth_id := auth.uid();
    IF v_auth_id IS NULL OR check_tenant_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if tenant is soft-deleted
    IF EXISTS (SELECT 1 FROM tenants WHERE id = check_tenant_id AND deleted_at IS NOT NULL) THEN
        RETURN FALSE;
    END IF;
    
    -- Get platform user ID if exists
    SELECT id INTO v_platform_user_id
    FROM platform_users
    WHERE auth_id = v_auth_id
    LIMIT 1;
    
    RETURN (
        -- Platform owner sees all
        auth_is_platform_owner() OR
        -- Tenant users see their own tenant
        check_tenant_id = auth_tenant_id() OR
        -- Sales team sees their assigned tenants
        (v_platform_user_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM sales_leads sl
            JOIN tenants t ON t.business_name = sl.business_name
            WHERE sl.assigned_to = v_platform_user_id 
            AND t.id = check_tenant_id
            AND sl.status = 'won'
            AND sl.deleted_at IS NULL
        ))
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- =============================================
-- CREATE AUTH TRIGGER FUNCTIONS
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_user_type TEXT;
    v_user_role TEXT;
    v_tenant_id UUID;
    v_platform_user_id UUID;
    v_tenant_user_id UUID;
BEGIN
    -- Extract metadata from the auth user
    v_user_type := NEW.raw_user_meta_data ->> 'userType';
    v_user_role := NEW.raw_user_meta_data ->> 'role';
    
    IF v_user_type = 'platform' THEN
        -- Create platform user
        INSERT INTO platform_users (
            auth_id,
            email,
            full_name,
            role,
            is_active
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data ->> 'fullName', split_part(NEW.email, '@', 1)),
            COALESCE(v_user_role, 'sales'),
            true
        )
        RETURNING id INTO v_platform_user_id;
        
        -- Update auth metadata with platform user ID
        UPDATE auth.users
        SET raw_user_meta_data = raw_user_meta_data || 
            jsonb_build_object('platformUserId', v_platform_user_id)
        WHERE id = NEW.id;
        
    ELSIF v_user_type = 'tenant' THEN
        -- Extract tenant ID
        v_tenant_id := (NEW.raw_user_meta_data ->> 'tenantId')::UUID;
        
        IF v_tenant_id IS NULL THEN
            RAISE EXCEPTION 'Tenant ID is required for tenant users';
        END IF;
        
        -- Create tenant user
        INSERT INTO tenant_users (
            auth_id,
            tenant_id,
            email,
            full_name,
            role,
            is_active
        ) VALUES (
            NEW.id,
            v_tenant_id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data ->> 'fullName', split_part(NEW.email, '@', 1)),
            COALESCE(v_user_role, 'staff'),
            true
        )
        RETURNING id INTO v_tenant_user_id;
        
        -- Update auth metadata with tenant user ID
        UPDATE auth.users
        SET raw_user_meta_data = raw_user_meta_data || 
            jsonb_build_object('tenantUserId', v_tenant_user_id)
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Soft delete platform user
    UPDATE platform_users 
    SET deleted_at = NOW() 
    WHERE auth_id = OLD.id;
    
    -- Soft delete tenant user
    UPDATE tenant_users 
    SET deleted_at = NOW() 
    WHERE auth_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion
CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_deletion();

-- =============================================
-- UPDATE EXISTING RLS POLICIES
-- =============================================

-- We need to update policies that directly use auth.uid() to compare with user IDs
-- Most of our policies already use our helper functions, so they'll work automatically

-- Example: Update platform_users policies
DROP POLICY IF EXISTS "platform_users_select" ON platform_users;
CREATE POLICY "platform_users_select" ON platform_users FOR SELECT
    USING (
        auth_id = auth.uid() OR 
        auth_is_platform_owner()
    );

DROP POLICY IF EXISTS "platform_users_update" ON platform_users;
CREATE POLICY "platform_users_update" ON platform_users FOR UPDATE
    USING (
        auth_id = auth.uid() OR
        auth_is_platform_owner()
    );

-- Update tenant_users policies
DROP POLICY IF EXISTS "tenant_users_select" ON tenant_users;
CREATE POLICY "tenant_users_select" ON tenant_users FOR SELECT
    USING (
        auth_id = auth.uid() OR
        auth_is_platform_owner() OR
        tenant_id = auth_tenant_id()
    );

DROP POLICY IF EXISTS "tenant_users_update" ON tenant_users;
CREATE POLICY "tenant_users_update" ON tenant_users FOR UPDATE
    USING (
        auth_is_platform_owner() OR
        auth_id = auth.uid() OR
        (tenant_id = auth_tenant_id() AND EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = tenant_users.tenant_id 
            AND tu.auth_id = auth.uid()
            AND tu.role IN ('owner', 'admin')
        ))
    );

-- =============================================
-- GRANT NECESSARY PERMISSIONS
-- =============================================

GRANT EXECUTE ON FUNCTION auth_platform_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth_tenant_user_id() TO anon, authenticated;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify that functions exist and have correct return types
SELECT 
    p.proname as function_name,
    pg_catalog.format_type(p.prorettype, NULL) as return_type,
    p.prosrc LIKE '%auth.uid()%' as uses_auth_uid
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'auth_platform_user_id',
    'auth_tenant_user_id', 
    'auth_is_platform_owner',
    'auth_is_platform_admin',
    'auth_is_sales_team',
    'auth_tenant_id',
    'auth_has_tenant_access'
)
ORDER BY p.proname;

-- Verify that auth_id columns were added
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('platform_users', 'tenant_users')
AND column_name = 'auth_id';

-- Verify indexes were created
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN ('idx_platform_users_auth_id', 'idx_tenant_users_auth_id');

-- Verify triggers were created
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('on_auth_user_created', 'on_auth_user_deleted');

-- =============================================
-- SUPABASE AUTH INTEGRATION COMPLETE!
-- =============================================