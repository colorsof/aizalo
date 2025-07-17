-- =============================================
-- AUTH SECURITY ENHANCEMENTS
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration adds failed login tracking and account lockout
-- =============================================

-- Add columns for tracking failed login attempts
ALTER TABLE platform_users
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP;

ALTER TABLE tenant_users
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP;

-- Create indexes for lockout queries
CREATE INDEX IF NOT EXISTS idx_platform_users_locked_until ON platform_users(locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenant_users_locked_until ON tenant_users(locked_until) WHERE locked_until IS NOT NULL;

-- =============================================
-- FUNCTION TO CHECK IF ACCOUNT IS LOCKED
-- =============================================

CREATE OR REPLACE FUNCTION check_account_locked(
    p_email TEXT,
    p_user_type TEXT DEFAULT 'platform'
)
RETURNS TABLE (
    is_locked BOOLEAN,
    locked_until TIMESTAMP,
    failed_attempts INTEGER
) AS $$
BEGIN
    IF p_user_type = 'platform' THEN
        RETURN QUERY
        SELECT 
            CASE 
                WHEN pu.locked_until IS NOT NULL AND pu.locked_until > NOW() THEN true
                ELSE false
            END as is_locked,
            pu.locked_until,
            pu.failed_login_attempts
        FROM platform_users pu
        WHERE pu.email = p_email;
    ELSE
        RETURN QUERY
        SELECT 
            CASE 
                WHEN tu.locked_until IS NOT NULL AND tu.locked_until > NOW() THEN true
                ELSE false
            END as is_locked,
            tu.locked_until,
            tu.failed_login_attempts
        FROM tenant_users tu
        WHERE tu.email = p_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION TO RECORD FAILED LOGIN ATTEMPT
-- =============================================

CREATE OR REPLACE FUNCTION record_failed_login(
    p_email TEXT,
    p_user_type TEXT DEFAULT 'platform',
    p_max_attempts INTEGER DEFAULT 5,
    p_lockout_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
    attempts INTEGER,
    is_locked BOOLEAN,
    locked_until TIMESTAMP
) AS $$
DECLARE
    v_current_attempts INTEGER;
    v_locked_until TIMESTAMP;
BEGIN
    IF p_user_type = 'platform' THEN
        -- Update platform user
        UPDATE platform_users
        SET 
            failed_login_attempts = CASE 
                WHEN last_failed_login < NOW() - INTERVAL '1 hour' THEN 1
                ELSE failed_login_attempts + 1
            END,
            last_failed_login = NOW(),
            locked_until = CASE 
                WHEN failed_login_attempts + 1 >= p_max_attempts 
                THEN NOW() + (p_lockout_duration_minutes || ' minutes')::INTERVAL
                ELSE locked_until
            END
        WHERE email = p_email
        RETURNING failed_login_attempts, locked_until 
        INTO v_current_attempts, v_locked_until;
    ELSE
        -- Update tenant user
        UPDATE tenant_users
        SET 
            failed_login_attempts = CASE 
                WHEN last_failed_login < NOW() - INTERVAL '1 hour' THEN 1
                ELSE failed_login_attempts + 1
            END,
            last_failed_login = NOW(),
            locked_until = CASE 
                WHEN failed_login_attempts + 1 >= p_max_attempts 
                THEN NOW() + (p_lockout_duration_minutes || ' minutes')::INTERVAL
                ELSE locked_until
            END
        WHERE email = p_email
        RETURNING failed_login_attempts, locked_until 
        INTO v_current_attempts, v_locked_until;
    END IF;
    
    -- Log the failed attempt
    INSERT INTO system_logs (level, source, message, metadata)
    VALUES (
        'warning',
        'auth',
        'Failed login attempt',
        jsonb_build_object(
            'email', p_email,
            'user_type', p_user_type,
            'attempts', v_current_attempts,
            'is_locked', v_locked_until IS NOT NULL AND v_locked_until > NOW()
        )
    );
    
    RETURN QUERY
    SELECT 
        v_current_attempts,
        v_locked_until IS NOT NULL AND v_locked_until > NOW(),
        v_locked_until;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION TO RESET FAILED LOGIN ATTEMPTS
-- =============================================

CREATE OR REPLACE FUNCTION reset_failed_login_attempts(
    p_email TEXT,
    p_user_type TEXT DEFAULT 'platform'
)
RETURNS VOID AS $$
BEGIN
    IF p_user_type = 'platform' THEN
        UPDATE platform_users
        SET 
            failed_login_attempts = 0,
            locked_until = NULL,
            last_failed_login = NULL
        WHERE email = p_email;
    ELSE
        UPDATE tenant_users
        SET 
            failed_login_attempts = 0,
            locked_until = NULL,
            last_failed_login = NULL
        WHERE email = p_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CREATE AUTH EVENT LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS auth_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'login_success',
        'login_failed',
        'logout',
        'register',
        'password_reset_request',
        'password_reset_complete',
        'email_verification',
        'account_locked',
        'account_unlocked',
        'oauth_login'
    )),
    user_id UUID,
    user_email TEXT,
    user_type TEXT CHECK (user_type IN ('platform', 'tenant')),
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for auth events
CREATE INDEX IF NOT EXISTS idx_auth_events_user_email ON auth_events(user_email);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON auth_events(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_events_event_type ON auth_events(event_type);

-- Enable RLS on auth_events
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for auth_events
CREATE POLICY "auth_events_platform_owner_all" ON auth_events
    FOR ALL
    TO authenticated
    USING (auth_is_platform_owner());

CREATE POLICY "auth_events_platform_admin_read" ON auth_events
    FOR SELECT
    TO authenticated
    USING (auth_is_platform_admin());

CREATE POLICY "auth_events_own_events" ON auth_events
    FOR SELECT
    TO authenticated
    USING (
        (user_type = 'platform' AND user_id = auth_platform_user_id()) OR
        (user_type = 'tenant' AND user_id = auth_tenant_user_id())
    );

-- =============================================
-- FUNCTION TO LOG AUTH EVENTS
-- =============================================

CREATE OR REPLACE FUNCTION log_auth_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_user_email TEXT DEFAULT NULL,
    p_user_type TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO auth_events (
        event_type,
        user_id,
        user_email,
        user_type,
        ip_address,
        user_agent,
        metadata
    ) VALUES (
        p_event_type,
        p_user_id,
        p_user_email,
        p_user_type,
        p_ip_address,
        p_user_agent,
        p_metadata
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_account_locked TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_failed_login TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reset_failed_login_attempts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION log_auth_event TO anon, authenticated;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check that columns were added
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('platform_users', 'tenant_users')
AND column_name IN ('failed_login_attempts', 'locked_until', 'last_failed_login')
ORDER BY table_name, column_name;

-- Check that auth_events table was created
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'auth_events';

-- Check that functions were created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'check_account_locked',
    'record_failed_login',
    'reset_failed_login_attempts',
    'log_auth_event'
)
ORDER BY routine_name;

-- =============================================
-- AUTH SECURITY ENHANCEMENTS COMPLETE!
-- =============================================