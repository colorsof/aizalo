#!/usr/bin/env tsx
/**
 * Script to migrate existing users to Supabase Auth
 * Run with: npx tsx scripts/migrate-users-to-auth.ts
 * 
 * IMPORTANT: This is a one-time migration script
 * Make sure to test in a development environment first!
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
      const value = valueParts.join('=').split('#')[0].trim(); // Remove inline comments
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  });
}

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migratePlatformUsers() {
  console.log('\n🔄 Migrating platform users...');
  
  // Get all platform users without auth_id
  const { data: users, error } = await supabase
    .from('platform_users')
    .select('*')
    .is('auth_id', null);
  
  if (error) {
    console.error('Error fetching platform users:', error);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log('✅ No platform users to migrate');
    return;
  }
  
  console.log(`Found ${users.length} platform users to migrate`);
  
  for (const user of users) {
    try {
      // Create auth user
      console.log(`\n📝 Creating auth user for ${user.email}...`);
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: Math.random().toString(36).slice(-12), // Temporary password
        email_confirm: true,
        user_metadata: {
          userType: 'platform',
          role: user.role,
          fullName: user.full_name,
          platformUserId: user.id,
        },
      });
      
      if (authError) {
        // Check if error is due to existing user
        if (authError.message?.includes('already been registered')) {
          console.log(`ℹ️  User ${user.email} already exists in auth, attempting to link...`);
          
          // Try to get the existing auth user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          
          const existingUser = existingUsers?.users?.find(u => u.email === user.email);
          if (existingUser) {
            
            // Update platform user with existing auth_id
            const { error: updateError } = await supabase
              .from('platform_users')
              .update({ auth_id: existingUser.id })
              .eq('id', user.id);
            
            if (!updateError) {
              console.log(`✅ Linked existing auth user to platform user: ${user.email}`);
              continue;
            }
          }
        }
        
        // Log the full error for debugging
        console.error(`❌ Full error:`, authError);
        throw authError;
      }
      
      // Update platform user with auth_id
      const { error: updateError } = await supabase
        .from('platform_users')
        .update({ auth_id: authUser.user.id })
        .eq('id', user.id);
      
      if (updateError) {
        console.error(`❌ Failed to update platform user ${user.email}:`, updateError);
        continue;
      }
      
      console.log(`✅ Migrated platform user: ${user.email}`);
      
      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });
      
      if (resetError) {
        console.error(`⚠️  Failed to send reset email to ${user.email}:`, resetError);
      } else {
        console.log(`📧 Sent password reset email to ${user.email}`);
      }
      
    } catch (error) {
      console.error(`❌ Error migrating ${user.email}:`, error);
    }
  }
}

async function migrateTenantUsers() {
  console.log('\n🔄 Migrating tenant users...');
  
  // Get all tenant users without auth_id
  const { data: users, error } = await supabase
    .from('tenant_users')
    .select('*, tenants!inner(id, subdomain, business_name)')
    .is('auth_id', null);
  
  if (error) {
    console.error('Error fetching tenant users:', error);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log('✅ No tenant users to migrate');
    return;
  }
  
  console.log(`Found ${users.length} tenant users to migrate`);
  
  for (const user of users) {
    try {
      // Create auth user
      console.log(`\n📝 Creating auth user for ${user.email}...`);
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: Math.random().toString(36).slice(-12), // Temporary password
        email_confirm: true,
        user_metadata: {
          userType: 'tenant',
          role: user.role,
          fullName: user.full_name,
          tenantId: user.tenant_id,
          tenantUserId: user.id,
        },
      });
      
      if (authError) {
        // Check if error is due to existing user
        if (authError.message?.includes('already been registered')) {
          console.log(`ℹ️  User ${user.email} already exists in auth, attempting to link...`);
          
          // Try to get the existing auth user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          
          const existingUser = existingUsers?.users?.find(u => u.email === user.email);
          if (existingUser) {
            
            // Update tenant user with existing auth_id
            const { error: updateError } = await supabase
              .from('tenant_users')
              .update({ auth_id: existingUser.id })
              .eq('id', user.id);
            
            if (!updateError) {
              console.log(`✅ Linked existing auth user to tenant user: ${user.email}`);
              continue;
            }
          }
        }
        
        // Log the full error for debugging
        console.error(`❌ Full error:`, authError);
        throw authError;
      }
      
      // Update tenant user with auth_id
      const { error: updateError } = await supabase
        .from('tenant_users')
        .update({ auth_id: authUser.user.id })
        .eq('id', user.id);
      
      if (updateError) {
        console.error(`❌ Failed to update tenant user ${user.email}:`, updateError);
        continue;
      }
      
      console.log(`✅ Migrated tenant user: ${user.email} (${user.tenants.business_name})`);
      
      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${user.tenants.subdomain}/auth/reset-password`,
      });
      
      if (resetError) {
        console.error(`⚠️  Failed to send reset email to ${user.email}:`, resetError);
      } else {
        console.log(`📧 Sent password reset email to ${user.email}`);
      }
      
    } catch (error) {
      console.error(`❌ Error migrating ${user.email}:`, error);
    }
  }
}

async function main() {
  console.log('🚀 Starting user migration to Supabase Auth...\n');
  
  // Check if we have the required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  try {
    await migratePlatformUsers();
    await migrateTenantUsers();
    
    console.log('\n✅ Migration completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Users will receive password reset emails');
    console.log('2. They must reset their passwords to complete migration');
    console.log('3. After password reset, they can login normally');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main();