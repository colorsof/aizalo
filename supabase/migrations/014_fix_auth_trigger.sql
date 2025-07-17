-- =============================================
-- FIX AUTH TRIGGER ISSUES
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration temporarily disables the auth trigger to allow migration
-- =============================================

-- Drop the trigger that might be causing issues during migration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Also drop the deletion trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_user_type TEXT;
    v_user_role TEXT;
    v_tenant_id UUID;
    v_platform_user_id UUID;
    v_tenant_user_id UUID;
    v_existing_platform_id UUID;
    v_existing_tenant_id UUID;
BEGIN
    -- Extract metadata from the auth user
    v_user_type := NEW.raw_user_meta_data ->> 'userType';
    v_user_role := NEW.raw_user_meta_data ->> 'role';
    
    -- Check if this is a migration (has platformUserId or tenantUserId in metadata)
    v_existing_platform_id := (NEW.raw_user_meta_data ->> 'platformUserId')::UUID;
    v_existing_tenant_id := (NEW.raw_user_meta_data ->> 'tenantUserId')::UUID;
    
    -- If this is a migration, just update the existing record
    IF v_existing_platform_id IS NOT NULL THEN
        UPDATE platform_users 
        SET auth_id = NEW.id 
        WHERE id = v_existing_platform_id;
        RETURN NEW;
    END IF;
    
    IF v_existing_tenant_id IS NOT NULL THEN
        UPDATE tenant_users 
        SET auth_id = NEW.id 
        WHERE id = v_existing_tenant_id;
        RETURN NEW;
    END IF;
    
    -- Otherwise, create new user records as before
    IF v_user_type = 'platform' THEN
        -- Check if platform user already exists with this email
        SELECT id INTO v_platform_user_id
        FROM platform_users
        WHERE email = NEW.email
        AND auth_id IS NULL;
        
        IF v_platform_user_id IS NOT NULL THEN
            -- Update existing platform user
            UPDATE platform_users
            SET auth_id = NEW.id
            WHERE id = v_platform_user_id;
        ELSE
            -- Create new platform user
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
            ON CONFLICT (email) DO UPDATE
            SET auth_id = NEW.id
            RETURNING id INTO v_platform_user_id;
        END IF;
        
        -- Update auth metadata with platform user ID if not already set
        IF v_existing_platform_id IS NULL AND v_platform_user_id IS NOT NULL THEN
            UPDATE auth.users
            SET raw_user_meta_data = raw_user_meta_data || 
                jsonb_build_object('platformUserId', v_platform_user_id)
            WHERE id = NEW.id;
        END IF;
        
    ELSIF v_user_type = 'tenant' THEN
        -- Extract tenant ID
        v_tenant_id := (NEW.raw_user_meta_data ->> 'tenantId')::UUID;
        
        IF v_tenant_id IS NULL THEN
            RAISE EXCEPTION 'Tenant ID is required for tenant users';
        END IF;
        
        -- Check if tenant user already exists with this email
        SELECT id INTO v_tenant_user_id
        FROM tenant_users
        WHERE email = NEW.email
        AND tenant_id = v_tenant_id
        AND auth_id IS NULL;
        
        IF v_tenant_user_id IS NOT NULL THEN
            -- Update existing tenant user
            UPDATE tenant_users
            SET auth_id = NEW.id
            WHERE id = v_tenant_user_id;
        ELSE
            -- Create new tenant user
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
            ON CONFLICT (tenant_id, email) DO UPDATE
            SET auth_id = NEW.id
            RETURNING id INTO v_tenant_user_id;
        END IF;
        
        -- Update auth metadata with tenant user ID if not already set
        IF v_existing_tenant_id IS NULL AND v_tenant_user_id IS NOT NULL THEN
            UPDATE auth.users
            SET raw_user_meta_data = raw_user_meta_data || 
                jsonb_build_object('tenantUserId', v_tenant_user_id)
            WHERE id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth user creation
        RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RECREATE TRIGGERS WITH BETTER ERROR HANDLING
-- =============================================

-- Recreate the trigger for new user signups
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Recreate the deletion trigger
CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_deletion();

-- =============================================
-- VERIFICATION
-- =============================================

-- Check that triggers exist
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('on_auth_user_created', 'on_auth_user_deleted');