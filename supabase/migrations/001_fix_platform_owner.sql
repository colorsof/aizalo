-- =============================================
-- FIX PLATFORM OWNER ACCOUNT
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- =============================================

-- First, check what platform users exist
SELECT id, email, full_name, role, created_at 
FROM platform_users;

-- Update the existing owner account to use your preferred email
UPDATE platform_users 
SET email = 'bernadx90@gmail.com',
    password_hash = crypt('EveretteJeniffer+', gen_salt('bf'))
WHERE role = 'owner';

-- Or if no owner exists, create one
INSERT INTO platform_users (email, password_hash, full_name, role) 
VALUES ('bernadx90@gmail.com', crypt('EveretteJeniffer+', gen_salt('bf')), 'Bernard', 'owner')
ON CONFLICT (email) 
DO UPDATE SET 
    password_hash = crypt('EveretteJeniffer+', gen_salt('bf')),
    role = 'owner';

-- Verify the result
SELECT id, email, full_name, role, created_at 
FROM platform_users 
WHERE role = 'owner';