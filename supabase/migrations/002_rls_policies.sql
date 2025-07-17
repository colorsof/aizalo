-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- 
-- IMPORTANT: This creates all RLS policies for proper data isolation
-- =============================================

-- =============================================
-- PLATFORM TABLES POLICIES (Platform Owner & Sales Team)
-- =============================================

-- Platform owner sees everything
CREATE POLICY "Platform owner full access" ON platform_users
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM platform_users WHERE role = 'owner'
    ));

-- Sales team can only see themselves
CREATE POLICY "Sales team self access" ON platform_users
    FOR SELECT USING (
        auth.uid() = id AND role IN ('sales', 'support')
    );

-- Platform settings - only owner can access
CREATE POLICY "Platform settings owner only" ON platform_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Sales territories - sales can see their own
CREATE POLICY "Sales territories access" ON sales_territories
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Sales leads - sales see only their assigned leads
CREATE POLICY "Sales leads isolation" ON sales_leads
    FOR ALL USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Platform revenue - owner sees all, sales see their commissions
CREATE POLICY "Platform revenue access" ON platform_revenue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        ) OR
        sales_rep_id = auth.uid()
    );

-- =============================================
-- TENANT ISOLATION POLICIES
-- =============================================

-- Tenants table - complex access rules
CREATE POLICY "Tenants access control" ON tenants
    FOR SELECT USING (
        -- Platform owner sees all
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        ) OR
        -- Sales see assigned tenants
        EXISTS (
            SELECT 1 FROM sales_leads 
            WHERE assigned_to = auth.uid() 
            AND business_name = tenants.business_name
            AND status = 'won'
        ) OR
        -- Tenant users see their own tenant
        id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        )
    );

-- Tenant users isolation
CREATE POLICY "Tenant users isolation" ON tenant_users
    FOR ALL USING (
        -- Same tenant only
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        ) OR
        -- Platform owner
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Tenant settings isolation
CREATE POLICY "Tenant settings isolation" ON tenant_settings
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- =============================================
-- CUSTOMER DATA ISOLATION
-- =============================================

-- Customers - strict tenant isolation
CREATE POLICY "Customers tenant isolation" ON customers
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Customer addresses
CREATE POLICY "Customer addresses isolation" ON customer_addresses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers 
            WHERE customers.id = customer_addresses.customer_id
            AND customers.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Customer tags
CREATE POLICY "Customer tags isolation" ON customer_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers 
            WHERE customers.id = customer_tags.customer_id
            AND customers.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Customer preferences
CREATE POLICY "Customer preferences isolation" ON customer_preferences
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers 
            WHERE customers.id = customer_preferences.customer_id
            AND customers.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- =============================================
-- CONVERSATION DATA ISOLATION
-- =============================================

-- Conversations
CREATE POLICY "Conversations tenant isolation" ON conversations
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Messages
CREATE POLICY "Messages tenant isolation" ON messages
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Message media
CREATE POLICY "Message media isolation" ON message_media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM messages 
            WHERE messages.id = message_media.message_id
            AND messages.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Message metadata
CREATE POLICY "Message metadata isolation" ON message_metadata
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM messages 
            WHERE messages.id = message_metadata.message_id
            AND messages.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- =============================================
-- MARKETING & CAMPAIGN ISOLATION
-- =============================================

-- Campaigns
CREATE POLICY "Campaigns tenant isolation" ON campaigns
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Campaign channels
CREATE POLICY "Campaign channels isolation" ON campaign_channels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_channels.campaign_id
            AND campaigns.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Campaign audience
CREATE POLICY "Campaign audience isolation" ON campaign_audience
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_audience.campaign_id
            AND campaigns.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Campaign content
CREATE POLICY "Campaign content isolation" ON campaign_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_content.campaign_id
            AND campaigns.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Campaign metrics
CREATE POLICY "Campaign metrics isolation" ON campaign_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_metrics.campaign_id
            AND campaigns.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Leads
CREATE POLICY "Leads tenant isolation" ON leads
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Lead activities
CREATE POLICY "Lead activities isolation" ON lead_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = lead_activities.lead_id
            AND leads.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Lead scores
CREATE POLICY "Lead scores isolation" ON lead_scores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = lead_scores.lead_id
            AND leads.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Content library
CREATE POLICY "Content library tenant isolation" ON content_library
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Content templates
CREATE POLICY "Content templates tenant isolation" ON content_templates
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Scheduled content
CREATE POLICY "Scheduled content tenant isolation" ON scheduled_content
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Content performance
CREATE POLICY "Content performance isolation" ON content_performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- =============================================
-- WEBSITE BUILDER ISOLATION
-- =============================================

-- Website templates are public to read
CREATE POLICY "Website templates public read" ON website_templates
    FOR SELECT USING (true);

-- Only platform owner can modify templates
CREATE POLICY "Website templates owner write" ON website_templates
    FOR INSERT USING (
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Website templates owner update" ON website_templates
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Website templates owner delete" ON website_templates
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Website sections follow template access
CREATE POLICY "Website sections read" ON website_sections
    FOR SELECT USING (true);

-- Tenant websites
CREATE POLICY "Tenant websites isolation" ON tenant_websites
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Website customizations
CREATE POLICY "Website customizations isolation" ON website_customizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_websites 
            WHERE tenant_websites.id = website_customizations.website_id
            AND tenant_websites.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Website pages
CREATE POLICY "Website pages isolation" ON website_pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_websites 
            WHERE tenant_websites.id = website_pages.website_id
            AND tenant_websites.tenant_id IN (
                SELECT tenant_id FROM tenant_users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- =============================================
-- AUDIT & SYSTEM TABLES
-- =============================================

-- Commissions - sales see their own, owner sees all
CREATE POLICY "Commissions access" ON commissions
    FOR SELECT USING (
        sales_rep_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Onboarding sessions - sales see their own
CREATE POLICY "Onboarding sessions access" ON onboarding_sessions
    FOR ALL USING (
        sales_rep_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- System logs - owner only
CREATE POLICY "System logs owner only" ON system_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- API usage - owner only
CREATE POLICY "API usage owner only" ON api_usage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check that all tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- Count policies per table
SELECT schemaname, tablename, COUNT(policyname) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- =============================================
-- RLS POLICIES COMPLETE!
-- =============================================