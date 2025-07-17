-- =============================================
-- ADD MISSING FOREIGN KEY INDEXES
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- This migration adds indexes for all unindexed foreign keys to improve query performance
-- =============================================

-- =============================================
-- CAMPAIGN RELATED INDEXES
-- =============================================

-- Campaign audience
CREATE INDEX IF NOT EXISTS idx_campaign_audience_campaign_id 
ON campaign_audience(campaign_id);

-- Campaign metrics
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_variant_id 
ON campaign_metrics(variant_id);

-- Campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by 
ON campaigns(created_by);

CREATE INDEX IF NOT EXISTS idx_campaigns_updated_by 
ON campaigns(updated_by);

-- =============================================
-- COMMISSION RELATED INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_commissions_revenue_id 
ON commissions(revenue_id);

CREATE INDEX IF NOT EXISTS idx_commissions_sales_rep_id 
ON commissions(sales_rep_id);

CREATE INDEX IF NOT EXISTS idx_commissions_tenant_id 
ON commissions(tenant_id);

-- =============================================
-- CONTENT RELATED INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_content_templates_created_by 
ON content_templates(created_by);

CREATE INDEX IF NOT EXISTS idx_scheduled_content_created_by 
ON scheduled_content(created_by);

-- =============================================
-- CONVERSATION RELATED INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to 
ON conversations(assigned_to);

CREATE INDEX IF NOT EXISTS idx_conversations_created_by 
ON conversations(created_by);

-- =============================================
-- CUSTOMER RELATED INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_customer_tags_created_by 
ON customer_tags(created_by);

CREATE INDEX IF NOT EXISTS idx_customers_acquisition_campaign 
ON customers(acquisition_campaign);

CREATE INDEX IF NOT EXISTS idx_customers_created_by 
ON customers(created_by);

CREATE INDEX IF NOT EXISTS idx_customers_updated_by 
ON customers(updated_by);

-- =============================================
-- LEAD RELATED INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_lead_activities_performed_by 
ON lead_activities(performed_by);

CREATE INDEX IF NOT EXISTS idx_lead_scores_lead_id 
ON lead_scores(lead_id);

CREATE INDEX IF NOT EXISTS idx_leads_customer_id 
ON leads(customer_id);

CREATE INDEX IF NOT EXISTS idx_leads_source_campaign_id 
ON leads(source_campaign_id);

-- =============================================
-- MESSAGE RELATED INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_message_media_message_id 
ON message_media(message_id);

CREATE INDEX IF NOT EXISTS idx_message_metadata_message_id 
ON message_metadata(message_id);

CREATE INDEX IF NOT EXISTS idx_messages_tenant_id 
ON messages(tenant_id);

-- =============================================
-- ONBOARDING RELATED INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_lead_id 
ON onboarding_sessions(lead_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_sales_rep_id 
ON onboarding_sessions(sales_rep_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_tenant_id 
ON onboarding_sessions(tenant_id);

-- =============================================
-- PLATFORM RELATED INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_platform_revenue_tenant_id 
ON platform_revenue(tenant_id);

-- =============================================
-- SALES RELATED INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_sales_leads_territory_id 
ON sales_leads(territory_id);

-- =============================================
-- WEBSITE RELATED INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_tenant_websites_created_by 
ON tenant_websites(created_by);

CREATE INDEX IF NOT EXISTS idx_tenant_websites_template_id 
ON tenant_websites(template_id);

CREATE INDEX IF NOT EXISTS idx_tenant_websites_updated_by 
ON tenant_websites(updated_by);

CREATE INDEX IF NOT EXISTS idx_website_sections_template_id 
ON website_sections(template_id);

-- =============================================
-- VERIFICATION
-- =============================================

-- Count all indexes created
SELECT COUNT(*) as new_indexes_created
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_campaign_audience_campaign_id',
    'idx_campaign_metrics_variant_id',
    'idx_campaigns_created_by',
    'idx_campaigns_updated_by',
    'idx_commissions_revenue_id',
    'idx_commissions_sales_rep_id',
    'idx_commissions_tenant_id',
    'idx_content_templates_created_by',
    'idx_scheduled_content_created_by',
    'idx_conversations_assigned_to',
    'idx_conversations_created_by',
    'idx_customer_tags_created_by',
    'idx_customers_acquisition_campaign',
    'idx_customers_created_by',
    'idx_customers_updated_by',
    'idx_lead_activities_performed_by',
    'idx_lead_scores_lead_id',
    'idx_leads_customer_id',
    'idx_leads_source_campaign_id',
    'idx_message_media_message_id',
    'idx_message_metadata_message_id',
    'idx_messages_tenant_id',
    'idx_onboarding_sessions_lead_id',
    'idx_onboarding_sessions_sales_rep_id',
    'idx_onboarding_sessions_tenant_id',
    'idx_platform_revenue_tenant_id',
    'idx_sales_leads_territory_id',
    'idx_tenant_websites_created_by',
    'idx_tenant_websites_template_id',
    'idx_tenant_websites_updated_by',
    'idx_website_sections_template_id'
);

-- =============================================
-- FOREIGN KEY INDEXES COMPLETE!
-- =============================================

-- Summary:
-- 1. ✓ Added 31 missing foreign key indexes
-- 2. ✓ Improves JOIN performance significantly
-- 3. ✓ Reduces query execution time for related data
-- 4. ✓ Essential for CASCADE operations performance