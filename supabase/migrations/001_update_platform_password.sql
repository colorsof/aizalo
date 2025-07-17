-- =============================================
-- UPDATE PLATFORM OWNER PASSWORD
-- Run this in: https://supabase.com/dashboard/project/furycwybjowxkkzjjdln/sql/new
-- =============================================

-- Change 'your_new_secure_password' to your actual password
UPDATE platform_users 
SET password_hash = crypt('EveretteJeniffer+', gen_salt('bf'))
WHERE email = 'bernadx90@gmail.com' 
AND role = 'owner';

-- Verify the update
SELECT email, full_name, role, created_at 
FROM platform_users 
WHERE email = 'bernadx90@gmail.com';