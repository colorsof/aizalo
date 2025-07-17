#!/usr/bin/env tsx
/**
 * Simplified migration script that works without triggers
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

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function migrateSinglePlatformUser(user: any) {
  try {
    console.log(`\n📝 Processing ${user.email}...`);
    
    // First, create the auth user without the trigger metadata
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: Math.random().toString(36).slice(-12) + 'Aa1!', // Stronger temporary password
      email_confirm: true,
      user_metadata: {
        userType: 'platform',
        role: user.role,
        fullName: user.full_name
      },
    });
    
    if (authError) {
      console.error(`❌ Error creating auth user:`, authError.message);
      return false;
    }
    
    console.log(`✅ Created auth user with ID: ${authUser.user.id}`);
    
    // Then update the platform user with the auth_id
    const { error: updateError } = await supabase
      .from('platform_users')
      .update({ auth_id: authUser.user.id })
      .eq('id', user.id);
    
    if (updateError) {
      console.error(`❌ Error updating platform user:`, updateError.message);
      // Try to delete the auth user to rollback
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return false;
    }
    
    console.log(`✅ Linked auth user to platform user`);
    
    // Finally, update the auth user metadata with the platform user ID
    const { error: metadataError } = await supabase.auth.admin.updateUserById(
      authUser.user.id,
      {
        user_metadata: {
          ...authUser.user.user_metadata,
          platformUserId: user.id
        }
      }
    );
    
    if (metadataError) {
      console.warn(`⚠️  Warning: Could not update metadata:`, metadataError.message);
    }
    
    // Send password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    });
    
    if (resetError) {
      console.warn(`⚠️  Warning: Could not send reset email:`, resetError.message);
    } else {
      console.log(`📧 Sent password reset email`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Unexpected error:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting simplified user migration...\n');
  
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }
  
  // Get platform users without auth_id
  const { data: users, error } = await supabase
    .from('platform_users')
    .select('*')
    .is('auth_id', null)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching platform users:', error);
    process.exit(1);
  }
  
  if (!users || users.length === 0) {
    console.log('✅ No platform users to migrate');
    return;
  }
  
  console.log(`Found ${users.length} platform users to migrate`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const user of users) {
    const success = await migrateSinglePlatformUser(user);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`  ✅ Successfully migrated: ${successCount}`);
  console.log(`  ❌ Failed to migrate: ${failCount}`);
  
  if (failCount > 0) {
    console.log('\n⚠️  Some users failed to migrate. Please check the errors above.');
  } else {
    console.log('\n✨ All users migrated successfully!');
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});