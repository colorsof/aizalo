-- Migration to add new business types and conversation channels
-- Run this when you want to expand to new industries or channels

-- Add new industries
ALTER TYPE industry_type ADD VALUE IF NOT EXISTS 'restaurant';
ALTER TYPE industry_type ADD VALUE IF NOT EXISTS 'real_estate';
ALTER TYPE industry_type ADD VALUE IF NOT EXISTS 'clinic';
ALTER TYPE industry_type ADD VALUE IF NOT EXISTS 'salon';
ALTER TYPE industry_type ADD VALUE IF NOT EXISTS 'tech_shop';
ALTER TYPE industry_type ADD VALUE IF NOT EXISTS 'car_dealership';
ALTER TYPE industry_type ADD VALUE IF NOT EXISTS 'gym';
ALTER TYPE industry_type ADD VALUE IF NOT EXISTS 'auto_parts';
ALTER TYPE industry_type ADD VALUE IF NOT EXISTS 'pharmacy';
ALTER TYPE industry_type ADD VALUE IF NOT EXISTS 'supermarket';

-- Add new conversation channels
ALTER TYPE conversation_channel ADD VALUE IF NOT EXISTS 'tiktok';
ALTER TYPE conversation_channel ADD VALUE IF NOT EXISTS 'instagram';
ALTER TYPE conversation_channel ADD VALUE IF NOT EXISTS 'telegram';
ALTER TYPE conversation_channel ADD VALUE IF NOT EXISTS 'sms';
ALTER TYPE conversation_channel ADD VALUE IF NOT EXISTS 'x_twitter';
ALTER TYPE conversation_channel ADD VALUE IF NOT EXISTS 'linkedin';
ALTER TYPE conversation_channel ADD VALUE IF NOT EXISTS 'youtube';

-- Note: PostgreSQL 9.1+ supports adding enum values
-- You cannot remove values from an enum without recreating it
-- Always add 'IF NOT EXISTS' to make migrations idempotent