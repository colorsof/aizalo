-- =============================================
-- MONITORING AND LOGGING IMPLEMENTATION
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration implements comprehensive logging and monitoring
-- =============================================

-- =============================================
-- PART 1: ENHANCE SYSTEM LOGS TABLE
-- =============================================

-- Add more fields to system_logs for better tracking
ALTER TABLE system_logs 
    ADD COLUMN IF NOT EXISTS user_id UUID,
    ADD COLUMN IF NOT EXISTS user_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS request_id UUID DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS ip_address INET,
    ADD COLUMN IF NOT EXISTS user_agent TEXT,
    ADD COLUMN IF NOT EXISTS duration_ms INTEGER,
    ADD COLUMN IF NOT EXISTS error_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS stack_trace TEXT;

-- Create indexes for efficient log querying
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level_created ON system_logs(level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_tenant_id ON system_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_request_id ON system_logs(request_id);

-- =============================================
-- PART 2: CREATE AUDIT LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE')),
    user_id UUID,
    user_type VARCHAR(20),
    tenant_id UUID,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- =============================================
-- PART 3: CREATE GENERIC AUDIT TRIGGER FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_type VARCHAR(20);
    v_tenant_id UUID;
    v_old_values JSONB;
    v_new_values JSONB;
    v_changed_fields TEXT[];
BEGIN
    -- Get user information
    v_user_id := auth.uid();
    
    -- Determine user type
    IF EXISTS (SELECT 1 FROM platform_users WHERE id = v_user_id) THEN
        v_user_type := 'platform';
    ELSIF EXISTS (SELECT 1 FROM tenant_users WHERE id = v_user_id) THEN
        v_user_type := 'tenant';
    ELSE
        v_user_type := 'anonymous';
    END IF;
    
    -- Get tenant_id if applicable
    IF TG_TABLE_NAME IN ('tenants', 'tenant_users', 'customers', 'conversations', 'campaigns') THEN
        IF TG_OP = 'DELETE' THEN
            v_tenant_id := OLD.tenant_id;
        ELSE
            v_tenant_id := NEW.tenant_id;
        END IF;
    END IF;
    
    -- Prepare values based on operation
    IF TG_OP = 'INSERT' THEN
        v_new_values := to_jsonb(NEW);
        INSERT INTO audit_logs (
            table_name, record_id, action, user_id, user_type, 
            tenant_id, new_values, ip_address, user_agent
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, v_user_id, v_user_type,
            v_tenant_id, v_new_values, inet_client_addr(), current_setting('request.headers', true)::json->>'user-agent'
        );
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
        
        -- Calculate changed fields
        SELECT array_agg(key) INTO v_changed_fields
        FROM jsonb_each(v_old_values)
        WHERE v_old_values->key IS DISTINCT FROM v_new_values->key;
        
        -- Special handling for soft delete
        IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
            INSERT INTO audit_logs (
                table_name, record_id, action, user_id, user_type,
                tenant_id, old_values, new_values, changed_fields,
                ip_address, user_agent
            ) VALUES (
                TG_TABLE_NAME, NEW.id, 'SOFT_DELETE', v_user_id, v_user_type,
                v_tenant_id, v_old_values, v_new_values, v_changed_fields,
                inet_client_addr(), current_setting('request.headers', true)::json->>'user-agent'
            );
        ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
            INSERT INTO audit_logs (
                table_name, record_id, action, user_id, user_type,
                tenant_id, old_values, new_values, changed_fields,
                ip_address, user_agent
            ) VALUES (
                TG_TABLE_NAME, NEW.id, 'RESTORE', v_user_id, v_user_type,
                v_tenant_id, v_old_values, v_new_values, v_changed_fields,
                inet_client_addr(), current_setting('request.headers', true)::json->>'user-agent'
            );
        ELSE
            INSERT INTO audit_logs (
                table_name, record_id, action, user_id, user_type,
                tenant_id, old_values, new_values, changed_fields,
                ip_address, user_agent
            ) VALUES (
                TG_TABLE_NAME, NEW.id, TG_OP, v_user_id, v_user_type,
                v_tenant_id, v_old_values, v_new_values, v_changed_fields,
                inet_client_addr(), current_setting('request.headers', true)::json->>'user-agent'
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_old_values := to_jsonb(OLD);
        INSERT INTO audit_logs (
            table_name, record_id, action, user_id, user_type,
            tenant_id, old_values, ip_address, user_agent
        ) VALUES (
            TG_TABLE_NAME, OLD.id, TG_OP, v_user_id, v_user_type,
            v_tenant_id, v_old_values, inet_client_addr(), 
            current_setting('request.headers', true)::json->>'user-agent'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 4: APPLY AUDIT TRIGGERS TO KEY TABLES
-- =============================================

-- Apply to critical tables
CREATE TRIGGER audit_trigger_tenants
    AFTER INSERT OR UPDATE OR DELETE ON tenants
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_trigger_tenant_users
    AFTER INSERT OR UPDATE OR DELETE ON tenant_users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_trigger_customers
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_trigger_campaigns
    AFTER INSERT OR UPDATE OR DELETE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_trigger_platform_revenue
    AFTER INSERT OR UPDATE OR DELETE ON platform_revenue
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_trigger_tenant_websites
    AFTER INSERT OR UPDATE OR DELETE ON tenant_websites
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =============================================
-- PART 5: CREATE ERROR LOGGING FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION log_error(
    p_level VARCHAR(20),
    p_source VARCHAR(100),
    p_message TEXT,
    p_error_code VARCHAR(50) DEFAULT NULL,
    p_stack_trace TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_user_id UUID;
    v_user_type VARCHAR(20);
    v_tenant_id UUID;
BEGIN
    -- Get current user info
    v_user_id := auth.uid();
    v_tenant_id := auth_tenant_id();
    
    -- Determine user type
    IF EXISTS (SELECT 1 FROM platform_users WHERE id = v_user_id) THEN
        v_user_type := 'platform';
    ELSIF EXISTS (SELECT 1 FROM tenant_users WHERE id = v_user_id) THEN
        v_user_type := 'tenant';
    ELSE
        v_user_type := 'anonymous';
    END IF;
    
    -- Insert error log
    INSERT INTO system_logs (
        level, source, message, error_code, stack_trace,
        user_id, user_type, tenant_id, metadata,
        ip_address, user_agent
    ) VALUES (
        p_level, p_source, p_message, p_error_code, p_stack_trace,
        v_user_id, v_user_type, v_tenant_id, p_metadata,
        inet_client_addr(), current_setting('request.headers', true)::json->>'user-agent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 6: CREATE PERFORMANCE MONITORING
-- =============================================

CREATE TABLE IF NOT EXISTS performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    operation VARCHAR(100) NOT NULL,
    duration_ms INTEGER NOT NULL,
    row_count INTEGER,
    user_id UUID,
    tenant_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_operation ON performance_metrics(operation);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_tenant ON performance_metrics(tenant_id);

-- Function to log performance metrics
CREATE OR REPLACE FUNCTION log_performance(
    p_metric_type VARCHAR(50),
    p_operation VARCHAR(100),
    p_start_time TIMESTAMP,
    p_row_count INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_duration_ms INTEGER;
BEGIN
    v_duration_ms := EXTRACT(MILLISECONDS FROM (NOW() - p_start_time));
    
    INSERT INTO performance_metrics (
        metric_type, operation, duration_ms, row_count,
        user_id, tenant_id, metadata
    ) VALUES (
        p_metric_type, p_operation, v_duration_ms, p_row_count,
        auth.uid(), auth_tenant_id(), p_metadata
    );
    
    -- Log slow queries
    IF v_duration_ms > 1000 THEN
        PERFORM log_error(
            'warning',
            'performance',
            format('Slow operation: %s took %s ms', p_operation, v_duration_ms),
            'SLOW_QUERY',
            NULL,
            jsonb_build_object(
                'operation', p_operation,
                'duration_ms', v_duration_ms,
                'row_count', p_row_count
            )
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 7: CREATE MONITORING VIEWS
-- =============================================

-- View for recent errors
CREATE OR REPLACE VIEW recent_errors AS
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
CREATE OR REPLACE VIEW slow_queries AS
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
CREATE OR REPLACE VIEW audit_summary AS
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
-- PART 8: CREATE HEALTH CHECK FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION system_health_check()
RETURNS TABLE (
    check_name VARCHAR(100),
    status VARCHAR(20),
    details TEXT
) AS $$
BEGIN
    -- Check database size
    RETURN QUERY
    SELECT 
        'Database Size'::VARCHAR(100),
        CASE 
            WHEN pg_database_size(current_database()) > 10737418240 THEN 'warning'
            ELSE 'healthy'
        END::VARCHAR(20),
        pg_size_pretty(pg_database_size(current_database()))::TEXT;
    
    -- Check error rate
    RETURN QUERY
    SELECT 
        'Error Rate (24h)'::VARCHAR(100),
        CASE 
            WHEN COUNT(*) > 100 THEN 'critical'
            WHEN COUNT(*) > 50 THEN 'warning'
            ELSE 'healthy'
        END::VARCHAR(20),
        COUNT(*)::TEXT || ' errors'
    FROM system_logs
    WHERE level IN ('error', 'critical')
    AND created_at > NOW() - INTERVAL '24 hours';
    
    -- Check slow query count
    RETURN QUERY
    SELECT 
        'Slow Queries (24h)'::VARCHAR(100),
        CASE 
            WHEN COUNT(*) > 50 THEN 'warning'
            ELSE 'healthy'
        END::VARCHAR(20),
        COUNT(*)::TEXT || ' slow queries'
    FROM performance_metrics
    WHERE duration_ms > 1000
    AND created_at > NOW() - INTERVAL '24 hours';
    
    -- Check active tenants
    RETURN QUERY
    SELECT 
        'Active Tenants'::VARCHAR(100),
        'info'::VARCHAR(20),
        COUNT(*)::TEXT || ' active tenants'
    FROM tenants
    WHERE deleted_at IS NULL
    AND subscription_status IN ('trial', 'active');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 9: RLS POLICIES FOR MONITORING TABLES
-- =============================================

-- Audit logs - platform owner only
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_platform_owner" ON audit_logs
    FOR ALL USING (auth_is_platform_owner());

-- System logs - platform owner sees all, others see their own
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "system_logs_access" ON system_logs
    FOR SELECT USING (
        auth_is_platform_owner() OR
        user_id = auth.uid() OR
        (tenant_id = auth_tenant_id() AND user_type = 'tenant')
    );

-- Performance metrics - similar to system logs
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "performance_metrics_access" ON performance_metrics
    FOR SELECT USING (
        auth_is_platform_owner() OR
        user_id = auth.uid() OR
        tenant_id = auth_tenant_id()
    );

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Test health check
SELECT * FROM system_health_check();

-- Check audit triggers
SELECT 
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE 'audit_trigger_%'
ORDER BY event_object_table;

-- =============================================
-- MONITORING AND LOGGING COMPLETE!
-- =============================================