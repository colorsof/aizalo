-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for industries
CREATE TYPE industry_type AS ENUM ('hotel', 'hardware_store', 'law_firm');

-- Create enum for conversation channels
CREATE TYPE conversation_channel AS ENUM ('whatsapp', 'facebook', 'web_chat', 'email');

-- Create enum for conversation status
CREATE TYPE conversation_status AS ENUM ('active', 'resolved', 'escalated');

-- HOW TO ADD NEW VALUES TO ENUMS:
-- To add a new industry (e.g., auto_parts):
-- ALTER TYPE industry_type ADD VALUE 'auto_parts';
-- ALTER TYPE industry_type ADD VALUE 'restaurant';
-- ALTER TYPE industry_type ADD VALUE 'pharmacy';

-- To add new conversation channels (e.g., tiktok, instagram):
-- ALTER TYPE conversation_channel ADD VALUE 'tiktok';
-- ALTER TYPE conversation_channel ADD VALUE 'instagram';
-- ALTER TYPE conversation_channel ADD VALUE 'telegram';
-- ALTER TYPE conversation_channel ADD VALUE 'sms';

-- Tenants table (each client/business)
CREATE TABLE tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry_type industry_type NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Users table (staff members for each tenant)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(tenant_id, email)
);

-- AI Conversations table
CREATE TABLE ai_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    channel conversation_channel NOT NULL,
    messages JSONB DEFAULT '[]',
    status conversation_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Marketing campaigns table
CREATE TABLE marketing_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    target_audience JSONB,
    content JSONB,
    schedule JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Industry-specific tables

-- Hotels: Rooms and bookings
CREATE TABLE hotel_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(50),
    price_per_night DECIMAL(10,2),
    amenities JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'available',
    UNIQUE(tenant_id, room_number)
);

CREATE TABLE hotel_bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    room_id UUID REFERENCES hotel_rooms(id),
    guest_name VARCHAR(255),
    guest_phone VARCHAR(50),
    check_in DATE,
    check_out DATE,
    total_amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Hardware stores: Inventory
CREATE TABLE inventory_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    reorder_level INTEGER,
    supplier_info JSONB,
    UNIQUE(tenant_id, sku)
);

-- Law firms: Cases and clients
CREATE TABLE legal_clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE legal_cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES legal_clients(id),
    case_number VARCHAR(100) UNIQUE,
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    billable_hours DECIMAL(10,2) DEFAULT 0,
    hourly_rate DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Row Level Security (RLS) Policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant isolation
CREATE POLICY "Users can only see their own tenant data" ON users
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM users WHERE tenant_id = users.tenant_id
    ));

CREATE POLICY "Tenant data isolation" ON ai_conversations
    FOR ALL USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- Add similar policies for all tables...