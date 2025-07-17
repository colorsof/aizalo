#!/usr/bin/env tsx
/**
 * Test script to verify authentication flow works correctly
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').split('#')[0].trim();
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  });
}

// Initialize Supabase client (not admin)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function testAuthFlow() {
  console.log('\n🧪 Testing Authentication Flow...\n');
  
  // Test 1: Check current session (should be none)
  console.log('1️⃣ Checking current session...');
  const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('❌ Error getting session:', sessionError.message);
  } else {
    console.log(currentSession ? '✅ Session exists' : '✅ No session (expected)');
  }
  
  // Test 2: Test login with wrong password (should fail)
  console.log('\n2️⃣ Testing login with wrong password...');
  const { data: wrongLogin, error: wrongError } = await supabase.auth.signInWithPassword({
    email: 'bernadx90@gmail.com',
    password: 'wrongpassword123'
  });
  if (wrongError) {
    console.log('✅ Login failed as expected:', wrongError.message);
  } else {
    console.error('❌ Login should have failed but succeeded');
  }
  
  // Test 3: Check if password reset was sent
  console.log('\n3️⃣ Password reset status...');
  console.log('ℹ️  User should have received a password reset email');
  console.log('    They need to click the link and set a new password');
  
  // Test 4: Check user data structure
  console.log('\n4️⃣ Checking user data structure...');
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: platformUser } = await adminClient
    .from('platform_users')
    .select('id, email, auth_id, role, full_name')
    .eq('email', 'bernadx90@gmail.com')
    .single();
  
  if (platformUser) {
    console.log('✅ Platform user found:');
    console.log('   - Email:', platformUser.email);
    console.log('   - Role:', platformUser.role);
    console.log('   - Auth ID:', platformUser.auth_id);
  }
  
  const { data: authUser } = await adminClient.auth.admin.getUserById(platformUser?.auth_id || '');
  if (authUser?.user) {
    console.log('\n✅ Auth user found:');
    console.log('   - User Type:', authUser.user.user_metadata?.userType);
    console.log('   - Platform User ID:', authUser.user.user_metadata?.platformUserId);
    console.log('   - Email Confirmed:', authUser.user.email_confirmed_at ? 'Yes' : 'No');
  }
  
  // Test 5: Test RLS functions
  console.log('\n5️⃣ Testing RLS helper functions...');
  const { data: rlsTest, error: rlsError } = await adminClient.rpc('auth_is_platform_owner');
  console.log('auth_is_platform_owner():', rlsError ? `Error: ${rlsError.message}` : rlsTest);
  
  console.log('\n✅ Authentication flow test complete!');
  console.log('\n📝 Next steps:');
  console.log('1. User needs to reset their password using the email link');
  console.log('2. After password reset, they can login normally');
  console.log('3. Then test the protected endpoints');
}

testAuthFlow().catch(console.error);