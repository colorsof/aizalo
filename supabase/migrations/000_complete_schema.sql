-- =============================================
-- COMPLETE MIGRATION FILE FOR SUPABASE DASHBOARD
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- IMPORTANT: Run this entire file at once in the SQL editor
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PART 1: PLATFORM TABLES (Platform Owner Only)
-- =============================================

-- Create platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    data_type VARCHAR(20) CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Platform users (Owner and Sales Team)
CREATE TABLE IF NOT EXISTS platform_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('owner', 'sales', 'support', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- Sales territories
CREATE TABLE IF NOT EXISTS sales_territories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    assigned_to UUID REFERENCES platform_users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sales leads tracking
CREATE TABLE IF NOT EXISTS sales_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    industry VARCHAR(50),
    territory_id INTEGER REFERENCES sales_territories(id),
    assigned_to UUID REFERENCES platform_users(id),
    status VARCHAR(20) CHECK (status IN ('new', 'contacted', 'demo', 'negotiating', 'won', 'lost')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_contact_at TIMESTAMP
);

-- =============================================
-- PART 2: TENANT TABLES
-- =============================================

-- Drop existing tables that don't match our schema
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS hotel_rooms CASCADE;
DROP TABLE IF EXISTS hotel_bookings CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS legal_clients CASCADE;
DROP TABLE IF EXISTS legal_cases CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Main tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL,
    industry VARCHAR(50) NOT NULL CHECK (industry IN 
        ('hotels', 'restaurants', 'real_estate', 'car_dealers', 'beauty', 'medical', 'tech', 'law', 'hardware', 'other')),
    tier INTEGER CHECK (tier IN (1, 2, 3)),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    postal_code VARCHAR(10),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    currency VARCHAR(3) DEFAULT 'KES',
    subscription_status VARCHAR(20) CHECK (subscription_status IN 
        ('trial', 'active', 'past_due', 'canceled', 'suspended')),
    subscription_plan VARCHAR(20) CHECK (subscription_plan IN ('starter', 'professional', 'growth')),
    monthly_fee DECIMAL(10,2),
    trial_ends_at DATE,
    next_billing_date DATE,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES platform_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    activated_at TIMESTAMP,
    churned_at TIMESTAMP
);

-- Platform revenue tracking
CREATE TABLE IF NOT EXISTS platform_revenue (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('subscription', 'setup', 'addon', 'overage')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('mpesa', 'bank', 'card', 'cash')),
    payment_reference VARCHAR(100),
    sales_rep_id UUID REFERENCES platform_users(id),
    commission_percentage DECIMAL(5,2),
    commission_amount DECIMAL(10,2),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding sessions tracking
CREATE TABLE IF NOT EXISTS onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_rep_id UUID REFERENCES platform_users(id),
    lead_id UUID REFERENCES sales_leads(id),
    tenant_id UUID REFERENCES tenants(id),
    status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Commission tracking
CREATE TABLE IF NOT EXISTS commissions (
    id SERIAL PRIMARY KEY,
    sales_rep_id UUID REFERENCES platform_users(id),
    tenant_id UUID REFERENCES tenants(id),
    revenue_id INTEGER REFERENCES platform_revenue(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'paid')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System logs and audit trail
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(20) CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
    source VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
    id BIGSERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    user_id UUID,
    user_type VARCHAR(20),
    response_status INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tenant users with permissions
CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('owner', 'admin', 'staff', 'viewer')),
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- Tenant settings (normalized)
CREATE TABLE IF NOT EXISTS tenant_settings (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, category, key)
);

-- =============================================
-- PART 3: CUSTOMER & CONVERSATION TABLES
-- =============================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    phone_verified BOOLEAN DEFAULT false,
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other', NULL)),
    language_preference VARCHAR(5) DEFAULT 'en' CHECK (language_preference IN ('en', 'sw', 'sheng')),
    location TEXT,
    tags JSONB DEFAULT '[]',
    lifetime_value DECIMAL(12,2) DEFAULT 0,
    acquisition_channel VARCHAR(50),
    acquisition_campaign UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    UNIQUE(tenant_id, phone)
);

-- Customer addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
    id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('home', 'work', 'delivery', 'other')),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    area VARCHAR(100),
    landmark VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customer tags for flexible segmentation
CREATE TABLE IF NOT EXISTS customer_tags (
    id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    tag_value VARCHAR(255),
    created_by UUID REFERENCES tenant_users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customer preferences
CREATE TABLE IF NOT EXISTS customer_preferences (
    id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    preference_type VARCHAR(50) NOT NULL,
    preference_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(customer_id, preference_type)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    channel VARCHAR(20) NOT NULL CHECK (channel IN 
        ('whatsapp', 'facebook', 'instagram', 'tiktok', 'email', 'web', 'sms')),
    status VARCHAR(20) CHECK (status IN ('active', 'waiting', 'resolved', 'abandoned')),
    ai_model_used VARCHAR(20) CHECK (ai_model_used IN ('gemini', 'groq', 'openai')),
    response_times JSONB DEFAULT '[]',
    sentiment_score DECIMAL(3,2),
    converted BOOLEAN DEFAULT false,
    conversion_value DECIMAL(12,2),
    assigned_to UUID REFERENCES tenant_users(id),
    metadata JSONB DEFAULT '{}',
    
    -- Fields for real-time dashboard
    customer_name TEXT,
    customer_phone TEXT,
    last_message TEXT,
    last_message_time TIMESTAMP DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    sentiment TEXT,
    priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 5),
    first_response_at TIMESTAMP,
    resolved_at TIMESTAMP,
    resolution_time_seconds INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (resolved_at - created_at))) STORED,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
    sender_type VARCHAR(20) CHECK (sender_type IN ('customer', 'ai', 'staff', 'system')),
    sender_id UUID,
    content TEXT NOT NULL,
    message_type VARCHAR(20) CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'location')),
    media_urls JSONB DEFAULT '[]',
    ai_confidence DECIMAL(3,2),
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP
);

-- Message media attachments
CREATE TABLE IF NOT EXISTS message_media (
    id SERIAL PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size_bytes INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Message metadata for AI processing
CREATE TABLE IF NOT EXISTS message_metadata (
    id SERIAL PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    ai_model_used VARCHAR(20) CHECK (ai_model_used IN ('gemini', 'groq', 'openai')),
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
    intent_detected VARCHAR(50),
    entities_extracted TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- PART 4: MARKETING & CAMPAIGN TABLES
-- =============================================

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(30) CHECK (type IN 
        ('acquisition', 'nurture', 'retention', 'reactivation', 'email', 'sms', 'whatsapp', 'social', 'multi_channel')),
    objective VARCHAR(30) CHECK (objective IN 
        ('awareness', 'acquisition', 'engagement', 'retention', 'reactivation')),
    channels JSONB DEFAULT '[]',
    target_audience JSONB DEFAULT '{}',
    content JSONB DEFAULT '{}',
    ai_generated BOOLEAN DEFAULT false,
    status VARCHAR(20) CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'archived')),
    budget DECIMAL(10,2),
    spent DECIMAL(10,2) DEFAULT 0,
    schedule JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    created_by UUID REFERENCES tenant_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    starts_at TIMESTAMP,
    ends_at TIMESTAMP
);

-- Now update the customers table to link acquisition campaign
ALTER TABLE customers 
    ADD CONSTRAINT customers_acquisition_campaign_fk 
    FOREIGN KEY (acquisition_campaign) REFERENCES campaigns(id);

-- Campaign channels
CREATE TABLE IF NOT EXISTS campaign_channels (
    id SERIAL PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    budget_allocation DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, channel)
);

-- Campaign audience definition
CREATE TABLE IF NOT EXISTS campaign_audience (
    id SERIAL PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    filter_type VARCHAR(50) NOT NULL,
    filter_operator VARCHAR(20) NOT NULL CHECK (filter_operator IN 
        ('equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in')),
    filter_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Campaign content variants for A/B testing
CREATE TABLE IF NOT EXISTS campaign_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    variant_name VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    subject VARCHAR(255),
    preview_text VARCHAR(255),
    content TEXT NOT NULL,
    media_url TEXT,
    cta_text VARCHAR(100),
    cta_url TEXT,
    is_control BOOLEAN DEFAULT false,
    traffic_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Campaign metrics
CREATE TABLE IF NOT EXISTS campaign_metrics (
    id SERIAL PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES campaign_content(id),
    date DATE NOT NULL,
    sent INTEGER DEFAULT 0,
    delivered INTEGER DEFAULT 0,
    opened INTEGER DEFAULT 0,
    clicked INTEGER DEFAULT 0,
    converted INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, variant_id, date)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    source VARCHAR(50) NOT NULL,
    source_campaign_id UUID REFERENCES campaigns(id),
    stage VARCHAR(20) CHECK (stage IN 
        ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    value DECIMAL(12,2),
    probability DECIMAL(3,2) CHECK (probability >= 0 AND probability <= 1),
    assigned_to UUID REFERENCES tenant_users(id),
    lost_reason VARCHAR(100),
    won_date DATE,
    next_action VARCHAR(255),
    next_action_date DATE,
    follow_up_at TIMESTAMP,
    notes JSONB DEFAULT '{}',
    
    -- Compatibility with existing schema
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'negotiating', 'won', 'lost')),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    converted_at TIMESTAMP
);

-- Lead activities
CREATE TABLE IF NOT EXISTS lead_activities (
    id SERIAL PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    outcome VARCHAR(100),
    performed_by UUID REFERENCES tenant_users(id),
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lead scoring criteria
CREATE TABLE IF NOT EXISTS lead_scores (
    id SERIAL PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    criterion VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    reason TEXT,
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- Content library
CREATE TABLE IF NOT EXISTS content_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(30) CHECK (type IN 
        ('gmb_post', 'social_post', 'email', 'sms', 'ad_copy')),
    platform VARCHAR(30),
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    performance_score DECIMAL(3,2),
    ai_model VARCHAR(20),
    approved BOOLEAN DEFAULT false,
    used_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    scheduled_for TIMESTAMP,
    published_at TIMESTAMP
);

-- Content templates
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(30) CHECK (type IN ('email', 'sms', 'social_post', 'blog', 'landing_page')),
    category VARCHAR(50),
    content TEXT NOT NULL,
    variables TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES tenant_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled content
CREATE TABLE IF NOT EXISTS scheduled_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    content_type VARCHAR(30) NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT[],
    scheduled_for TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'published', 'failed', 'canceled')),
    published_at TIMESTAMP,
    error_message TEXT,
    created_by UUID REFERENCES tenant_users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Content performance tracking
CREATE TABLE IF NOT EXISTS content_performance (
    id SERIAL PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type VARCHAR(30) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    impressions INTEGER DEFAULT 0,
    engagements INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue_attributed DECIMAL(10,2) DEFAULT 0,
    measured_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- PART 5: WEBSITE BUILDER TABLES
-- =============================================

-- Website templates
CREATE TABLE IF NOT EXISTS website_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    industry VARCHAR(50) NOT NULL,
    description TEXT,
    preview_url TEXT,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Website sections
CREATE TABLE IF NOT EXISTS website_sections (
    id SERIAL PRIMARY KEY,
    template_id UUID REFERENCES website_templates(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN 
        ('hero', 'features', 'testimonials', 'pricing', 'contact', 'about', 'services', 'gallery')),
    section_name VARCHAR(100) NOT NULL,
    default_content TEXT,
    is_required BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tenant websites
CREATE TABLE IF NOT EXISTS tenant_websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES website_templates(id),
    subdomain VARCHAR(50) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Website customizations
CREATE TABLE IF NOT EXISTS website_customizations (
    id SERIAL PRIMARY KEY,
    website_id UUID REFERENCES tenant_websites(id) ON DELETE CASCADE,
    customization_type VARCHAR(50) NOT NULL CHECK (customization_type IN 
        ('color', 'font', 'logo', 'content', 'layout', 'seo')),
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(website_id, customization_type, key)
);

-- Website pages
CREATE TABLE IF NOT EXISTS website_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID REFERENCES tenant_websites(id) ON DELETE CASCADE,
    slug VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    meta_description TEXT,
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(website_id, slug)
);

-- =============================================
-- PART 6: HELPER FUNCTIONS
-- =============================================

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to update conversation last_message_time
CREATE OR REPLACE FUNCTION update_conversation_last_message_time()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_time = NEW.created_at,
        last_message = NEW.content,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure one default address per customer
CREATE OR REPLACE FUNCTION ensure_one_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE customer_addresses 
        SET is_default = false 
        WHERE customer_id = NEW.customer_id 
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PART 7: CREATE ALL INDEXES
-- =============================================

-- Platform tables indexes
CREATE INDEX IF NOT EXISTS idx_sales_leads_assigned ON sales_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_sales_leads_status ON sales_leads(status);
CREATE INDEX IF NOT EXISTS idx_sales_territories_assigned ON sales_territories(assigned_to);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_sales_rep ON platform_revenue(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint, created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level, created_at);

-- Tenant tables indexes
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_industry ON tenants(industry);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_created_by ON tenants(created_by);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_lookup ON tenant_settings(tenant_id, category, key);

-- Customer tables indexes
CREATE INDEX IF NOT EXISTS idx_customers_tenant_phone ON customers(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_acquisition ON customers(tenant_id, acquisition_channel);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tags_search ON customer_tags(customer_id, tag_name);

-- Conversation tables indexes
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status ON conversations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_recent ON conversations(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id) WHERE read_at IS NULL;

-- Campaign tables indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status ON campaigns(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(tenant_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_campaign_content_campaign ON campaign_content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_lookup ON campaign_metrics(campaign_id, date);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_status ON leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_stage ON leads(tenant_id, stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_content_library_tenant ON content_library(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_content_templates_tenant ON content_templates(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_date ON scheduled_content(tenant_id, scheduled_for);

-- =============================================
-- PART 8: CREATE ALL TRIGGERS
-- =============================================

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON tenant_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update conversation on new message
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message_time();

-- Create trigger for default address
CREATE TRIGGER ensure_one_default_address_trigger
AFTER INSERT OR UPDATE ON customer_addresses
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION ensure_one_default_address();

-- =============================================
-- PART 9: ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_audience ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PART 10: INSERT DEFAULT DATA
-- =============================================

-- Insert default platform settings
INSERT INTO platform_settings (key, value, data_type, description) VALUES
    ('platform_name', 'AI Business Platform', 'string', 'The name of the platform'),
    ('default_currency', 'KES', 'string', 'Default currency for the platform'),
    ('trial_days', '14', 'number', 'Number of days for free trial'),
    ('commission_rate_tier1', '20', 'number', 'Commission rate for tier 1 (%)'),
    ('commission_rate_tier2', '15', 'number', 'Commission rate for tier 2 (%)'),
    ('commission_rate_tier3', '10', 'number', 'Commission rate for tier 3 (%)'),
    ('tenant_setting_categories', '["branding", "notifications", "integrations", "ai", "billing", "features"]', 'json', 'Valid categories for tenant settings')
ON CONFLICT (key) DO NOTHING;

-- Create default platform owner (password: 'changeme123')
-- IMPORTANT: Change this password immediately after setup!
INSERT INTO platform_users (email, password_hash, full_name, role) VALUES
    ('bernard@aizalo.com', crypt('changeme123', gen_salt('bf')), 'Bernard', 'owner')
ON CONFLICT (email) DO NOTHING;

-- Insert sample website templates for each industry
INSERT INTO website_templates (name, industry, description) VALUES
    ('Modern Hotel', 'hotels', 'Clean, modern template for hotels with booking integration'),
    ('Restaurant Delight', 'restaurants', 'Beautiful template for restaurants with menu showcase'),
    ('Real Estate Pro', 'real_estate', 'Professional template for real estate agencies'),
    ('Auto Showroom', 'car_dealers', 'Sleek template for car dealerships'),
    ('Beauty Bliss', 'beauty', 'Elegant template for beauty salons and spas'),
    ('Medical Care', 'medical', 'Professional template for medical clinics'),
    ('Tech Solutions', 'tech', 'Modern template for tech shops and repair services'),
    ('Legal Professional', 'law', 'Sophisticated template for law firms'),
    ('Hardware Hub', 'hardware', 'Practical template for hardware stores')
ON CONFLICT DO NOTHING;

-- =============================================
-- MIGRATION COMPLETE!
-- =============================================

-- To verify the migration:
-- 1. Check all tables: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- 2. Check RLS is enabled: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- 3. Check indexes: SELECT indexname FROM pg_indexes WHERE schemaname = 'public';