-- =============================================
-- CRITICAL DATABASE FIXES
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration fixes critical issues identified in the risk assessment
-- =============================================

-- =============================================
-- PART 1: FIX TENANT UPDATE POLICY BUG
-- =============================================

-- Drop the incorrect policy
DROP POLICY IF EXISTS "tenants_update" ON tenants;

-- Create the corrected policy
CREATE POLICY "tenants_update" ON tenants FOR UPDATE
    USING (
        auth_is_platform_owner() OR
        ((id = auth_tenant_id()) AND (EXISTS (
            SELECT 1 FROM tenant_users
            WHERE tenant_users.tenant_id = tenants.id  -- Fixed: was tenant_users.id
            AND tenant_users.id = auth.uid() 
            AND tenant_users.role = 'owner'
        )))
    );

-- =============================================
-- PART 2: ADD CRITICAL PERFORMANCE INDEXES
-- =============================================

-- Indexes for auth.uid() lookups
CREATE INDEX IF NOT EXISTS idx_platform_users_id ON platform_users(id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_id ON tenant_users(id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id_id ON tenant_users(tenant_id, id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id_role ON tenant_users(tenant_id, role);

-- Indexes for sales_leads/tenants relationship
CREATE INDEX IF NOT EXISTS idx_sales_leads_business_name ON sales_leads(business_name);
CREATE INDEX IF NOT EXISTS idx_tenants_business_name ON tenants(business_name);

-- Additional RLS performance indexes
CREATE INDEX IF NOT EXISTS idx_tenant_users_id_role ON tenant_users(id, role);
CREATE INDEX IF NOT EXISTS idx_platform_users_id_role ON platform_users(id, role);
CREATE INDEX IF NOT EXISTS idx_sales_leads_assigned_to_status ON sales_leads(assigned_to, status);

-- Indexes for website tables
CREATE INDEX IF NOT EXISTS idx_tenant_websites_tenant_id ON tenant_websites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_website_customizations_website_id ON website_customizations(website_id);
CREATE INDEX IF NOT EXISTS idx_website_pages_website_id ON website_pages(website_id);

-- =============================================
-- PART 3: ENSURE SINGLE PLATFORM OWNER
-- =============================================

-- Create a function to check platform owner count
CREATE OR REPLACE FUNCTION check_single_platform_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'owner' THEN
        IF EXISTS (
            SELECT 1 FROM platform_users 
            WHERE role = 'owner' 
            AND id != COALESCE(NEW.id, gen_random_uuid())
        ) THEN
            RAISE EXCEPTION 'Only one platform owner is allowed';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single owner
DROP TRIGGER IF EXISTS enforce_single_platform_owner ON platform_users;
CREATE TRIGGER enforce_single_platform_owner
    BEFORE INSERT OR UPDATE ON platform_users
    FOR EACH ROW
    EXECUTE FUNCTION check_single_platform_owner();

-- =============================================
-- PART 4: SECURE HELPER FUNCTIONS
-- =============================================

-- Replace SECURITY DEFINER with SECURITY INVOKER for safer execution
-- These functions will run with the permissions of the calling user

CREATE OR REPLACE FUNCTION auth_is_platform_owner()
RETURNS BOOLEAN AS $$
BEGIN
    -- Add additional validation
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM platform_users 
        WHERE id = auth.uid() 
        AND role = 'owner'
        AND is_active = true  -- Only active owners
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
    
    SELECT tenant_id INTO v_tenant_id
    FROM tenant_users 
    WHERE id = auth.uid() 
    AND is_active = true
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
    
    RETURN (
        -- Platform owner sees all
        auth_is_platform_owner() OR
        -- Tenant users see their own tenant
        check_tenant_id = auth_tenant_id() OR
        -- Sales team sees their assigned tenants (with active status check)
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
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- =============================================
-- PART 5: ADD SOFT DELETE SUPPORT
-- =============================================

-- Add deleted_at to all main tables
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE sales_territories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE sales_leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE tenant_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE content_library ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE website_templates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE tenant_websites ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_platform_users_deleted_at ON platform_users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_deleted_at ON tenants(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenant_users_deleted_at ON tenant_users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at) WHERE deleted_at IS NULL;

-- =============================================
-- PART 6: FIX SALES LEADS REFERENTIAL INTEGRITY
-- =============================================

-- Add tenant_id to sales_leads for better referential integrity
ALTER TABLE sales_leads ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Create an index for the new column
CREATE INDEX IF NOT EXISTS idx_sales_leads_tenant_id ON sales_leads(tenant_id);

-- Update existing records to set tenant_id based on business_name
UPDATE sales_leads sl
SET tenant_id = t.id
FROM tenants t
WHERE sl.business_name = t.business_name
AND sl.tenant_id IS NULL
AND sl.status = 'won';

-- =============================================
-- PART 7: ADD DATA VALIDATION CONSTRAINTS
-- =============================================

-- Email validation
ALTER TABLE platform_users ADD CONSTRAINT valid_platform_email 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

ALTER TABLE tenant_users ADD CONSTRAINT valid_tenant_email 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

ALTER TABLE customers ADD CONSTRAINT valid_customer_email 
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- Phone validation (basic format)
ALTER TABLE tenants ADD CONSTRAINT valid_tenant_phone 
    CHECK (phone ~ '^\+?[0-9]{10,15}$');

ALTER TABLE customers ADD CONSTRAINT valid_customer_phone 
    CHECK (phone ~ '^\+?[0-9]{10,15}$');

-- Subdomain validation (alphanumeric and hyphens only)
ALTER TABLE tenants ADD CONSTRAINT valid_subdomain 
    CHECK (subdomain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$');

ALTER TABLE tenant_websites ADD CONSTRAINT valid_website_subdomain 
    CHECK (subdomain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$');

-- =============================================
-- PART 8: ADD AUDIT COLUMNS
-- =============================================

-- Add created_by and updated_by to key tables
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES tenant_users(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES tenant_users(id);

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES tenant_users(id);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES tenant_users(id);

ALTER TABLE tenant_websites ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES tenant_users(id);
ALTER TABLE tenant_websites ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES tenant_users(id);

-- =============================================
-- PART 9: COMMISSION VALIDATION
-- =============================================

-- Create a function to validate commission calculations
CREATE OR REPLACE FUNCTION validate_commission()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure commission amount matches percentage * revenue amount
    IF NEW.commission_percentage IS NOT NULL AND NEW.amount IS NOT NULL THEN
        DECLARE
            expected_commission DECIMAL(10,2);
        BEGIN
            SELECT (pr.amount * NEW.commission_percentage / 100)
            INTO expected_commission
            FROM platform_revenue pr
            WHERE pr.id = NEW.revenue_id;
            
            IF ABS(NEW.amount - expected_commission) > 0.01 THEN
                RAISE EXCEPTION 'Commission amount does not match percentage calculation';
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for commission validation
DROP TRIGGER IF EXISTS validate_commission_trigger ON commissions;
CREATE TRIGGER validate_commission_trigger
    BEFORE INSERT OR UPDATE ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION validate_commission();

-- =============================================
-- PART 10: SUBSCRIPTION STATUS MANAGEMENT
-- =============================================

-- Create a function to update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS void AS $$
BEGIN
    -- Mark trials as expired
    UPDATE tenants
    SET subscription_status = 'trial_expired'
    WHERE subscription_status = 'trial'
    AND trial_ends_at < CURRENT_DATE
    AND deleted_at IS NULL;
    
    -- Mark subscriptions as past due
    UPDATE tenants
    SET subscription_status = 'past_due'
    WHERE subscription_status = 'active'
    AND next_billing_date < CURRENT_DATE - INTERVAL '3 days'
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job (requires pg_cron extension)
-- Note: This needs to be enabled in Supabase dashboard
-- SELECT cron.schedule('update-subscription-status', '0 0 * * *', 'SELECT update_subscription_status();');

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check all indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verify single owner constraint
SELECT COUNT(*) as owner_count 
FROM platform_users 
WHERE role = 'owner' AND deleted_at IS NULL;

-- Check soft delete columns
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name = 'deleted_at'
ORDER BY table_name;

-- =============================================
-- CRITICAL FIXES COMPLETE!
-- =============================================

-- Summary of fixes:
-- 1. ✓ Fixed tenant update policy bug
-- 2. ✓ Added critical performance indexes
-- 3. ✓ Enforced single platform owner constraint
-- 4. ✓ Secured helper functions (SECURITY INVOKER)
-- 5. ✓ Added soft delete support
-- 6. ✓ Fixed sales_leads referential integrity
-- 7. ✓ Added data validation constraints
-- 8. ✓ Added audit columns
-- 9. ✓ Added commission validation
-- 10. ✓ Added subscription management function