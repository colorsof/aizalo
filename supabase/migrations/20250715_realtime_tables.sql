-- Enable realtime for conversations table
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Enable realtime for leads table
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- Enable realtime for orders table (for revenue tracking)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Create activity_log table for recent activity tracking
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('conversation', 'lead', 'sale', 'campaign')),
  message TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_activity_log_tenant_created ON activity_log(tenant_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Can be UUID or any user identifier
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Update conversations table to include necessary fields
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS last_message TEXT,
ADD COLUMN IF NOT EXISTS last_message_time TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sentiment TEXT;

-- Update leads table status field
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'negotiating', 'won', 'lost'));

-- Create trigger to update last_message_time
CREATE OR REPLACE FUNCTION update_conversation_last_message_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_message_time = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_time_trigger
BEFORE UPDATE ON conversations
FOR EACH ROW
WHEN (OLD.last_message IS DISTINCT FROM NEW.last_message)
EXECUTE FUNCTION update_conversation_last_message_time();

-- Create trigger to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'conversations' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (tenant_id, type, message, data)
    VALUES (NEW.tenant_id, 'conversation', 'New conversation started', 
            jsonb_build_object('conversation_id', NEW.id, 'channel', NEW.channel));
  ELSIF TG_TABLE_NAME = 'leads' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (tenant_id, type, message, data)
    VALUES (NEW.tenant_id, 'lead', 'New lead captured', 
            jsonb_build_object('lead_id', NEW.id, 'name', NEW.name));
  ELSIF TG_TABLE_NAME = 'orders' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (tenant_id, type, message, data)
    VALUES (NEW.tenant_id, 'sale', 'New sale completed', 
            jsonb_build_object('order_id', NEW.id, 'amount', NEW.amount));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for activity logging
CREATE TRIGGER log_conversation_activity
AFTER INSERT ON conversations
FOR EACH ROW
EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_lead_activity
AFTER INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_order_activity
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION log_activity();

-- RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Orders belong to tenant" ON orders
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Activity log policies
CREATE POLICY "Activity log belongs to tenant" ON activity_log
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Notifications policies (user-based, not tenant-based)
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = current_setting('app.current_user_id')::text);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = current_setting('app.current_user_id')::text);