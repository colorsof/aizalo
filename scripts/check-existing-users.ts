#!/usr/bin/env tsx
/**
 * Script to check existing users before migration
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
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkUsers() {
  console.log('\n🔍 Checking existing users...\n');
  
  // Check platform users
  const { data: platformUsers, error: platformError } = await supabase
    .from('platform_users')
    .select('id, email, auth_id, created_at')
    .order('created_at', { ascending: false });
  
  if (platformError) {
    console.error('Error fetching platform users:', platformError);
  } else {
    console.log(`Platform users (${platformUsers?.length || 0}):`);
    platformUsers?.forEach(user => {
      console.log(`  - ${user.email} (auth_id: ${user.auth_id || 'null'})`);
    });
  }
  
  console.log('\n');
  
  // Check tenant users
  const { data: tenantUsers, error: tenantError } = await supabase
    .from('tenant_users')
    .select('id, email, auth_id, tenant_id, created_at')
    .order('created_at', { ascending: false });
  
  if (tenantError) {
    console.error('Error fetching tenant users:', tenantError);
  } else {
    console.log(`Tenant users (${tenantUsers?.length || 0}):`);
    tenantUsers?.forEach(user => {
      console.log(`  - ${user.email} (auth_id: ${user.auth_id || 'null'}, tenant: ${user.tenant_id})`);
    });
  }
  
  console.log('\n');
  
  // Check auth.users table
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
  } else {
    console.log(`Auth users (${authUsers?.users?.length || 0}):`);
    authUsers?.users?.forEach(user => {
      console.log(`  - ${user.email} (id: ${user.id}, userType: ${user.user_metadata?.userType || 'none'})`);
    });
  }
  
  // Check for duplicate emails
  if (platformUsers && tenantUsers && authUsers) {
    const allEmails = [
      ...platformUsers.map(u => u.email),
      ...tenantUsers.map(u => u.email)
    ];
    
    const emailCounts = allEmails.reduce((acc, email) => {
      acc[email] = (acc[email] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const duplicates = Object.entries(emailCounts).filter(([_, count]) => (count as number) > 1);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  Duplicate emails found:');
      duplicates.forEach(([email, count]) => {
        console.log(`  - ${email} (${count} occurrences)`);
      });
    }
    
    // Check if any emails already exist in auth.users
    const authEmails = new Set(authUsers.users.map(u => u.email));
    const existingInAuth = allEmails.filter(email => authEmails.has(email));
    
    if (existingInAuth.length > 0) {
      console.log('\n⚠️  Emails already in auth.users:');
      existingInAuth.forEach(email => {
        console.log(`  - ${email}`);
      });
    }
  }
}

checkUsers().catch(console.error);