#!/usr/bin/env tsx
/**
 * Script to test authentication endpoints
 * Run with: npx tsx scripts/test-auth.ts
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testEndpoint(
  name: string,
  method: string,
  url: string,
  body?: any,
  headers?: any
) {
  log(`\nTesting ${name}...`, colors.cyan);
  
  try {
    const response = await fetch(`${API_URL}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log(`✓ ${name} - Status: ${response.status}`, colors.green);
      console.log('Response:', data);
      return { success: true, data, headers: response.headers };
    } else {
      log(`✗ ${name} - Status: ${response.status}`, colors.red);
      console.log('Error:', data);
      return { success: false, data, headers: response.headers };
    }
  } catch (error) {
    log(`✗ ${name} - Network error`, colors.red);
    console.error(error);
    return { success: false, error };
  }
}

async function setupTestData() {
  log('\nSetting up test data...', colors.yellow);
  
  // Create a test platform user (owner)
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const { data: platformUser, error: platformError } = await supabase
    .from('platform_users')
    .insert({
      email: 'owner@platform.com',
      full_name: 'Platform Owner',
      password_hash: passwordHash,
      role: 'owner',
      is_active: true,
    })
    .select()
    .single();
  
  if (platformError) {
    log('Platform user might already exist', colors.yellow);
  } else {
    log('✓ Created platform owner user', colors.green);
  }
  
  // Create a test tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      business_name: 'Test Company',
      subdomain: 'testcompany',
      owner_email: 'owner@testcompany.com',
      owner_phone: '+254700000000',
      subscription_plan: 'growth',
      subscription_status: 'active',
    })
    .select()
    .single();
  
  if (tenantError) {
    log('Tenant might already exist', colors.yellow);
    // Get existing tenant
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select()
      .eq('subdomain', 'testcompany')
      .single();
    
    if (existingTenant) {
      // Create tenant user
      const { data: tenantUser, error: userError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: existingTenant.id,
          email: 'admin@testcompany.com',
          full_name: 'Tenant Admin',
          password_hash: passwordHash,
          role: 'admin',
          is_active: true,
        })
        .select()
        .single();
      
      if (!userError) {
        log('✓ Created tenant admin user', colors.green);
      }
    }
  } else {
    log('✓ Created test tenant', colors.green);
    
    // Create tenant user
    const { data: tenantUser, error: userError } = await supabase
      .from('tenant_users')
      .insert({
        tenant_id: tenant.id,
        email: 'admin@testcompany.com',
        full_name: 'Tenant Admin',
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
      })
      .select()
      .single();
    
    if (!userError) {
      log('✓ Created tenant admin user', colors.green);
    }
  }
}

async function runTests() {
  log('Starting Authentication Tests', colors.cyan);
  log('=' .repeat(50), colors.cyan);
  
  // Setup test data
  await setupTestData();
  
  // Test 1: Platform Login
  log('\n\n1. PLATFORM USER LOGIN', colors.yellow);
  const platformLogin = await testEndpoint(
    'Platform Login',
    'POST',
    '/api/auth/platform/login',
    {
      email: 'owner@platform.com',
      password: 'password123',
    }
  );
  
  // Test 2: Access protected platform endpoint
  if (platformLogin.success && platformLogin.headers) {
    const setCookie = platformLogin.headers.get('set-cookie');
    const cookies = setCookie ? { Cookie: setCookie } : {};
    
    await testEndpoint(
      'Platform Me Endpoint',
      'GET',
      '/api/platform/me',
      undefined,
      cookies
    );
    
    await testEndpoint(
      'Platform Tenants Endpoint',
      'GET',
      '/api/platform/tenants',
      undefined,
      cookies
    );
  }
  
  // Test 3: Platform Logout
  await testEndpoint(
    'Platform Logout',
    'POST',
    '/api/auth/platform/logout'
  );
  
  // Test 4: Tenant Login
  log('\n\n2. TENANT USER LOGIN', colors.yellow);
  const tenantLogin = await testEndpoint(
    'Tenant Login',
    'POST',
    '/api/auth/tenant/login',
    {
      email: 'admin@testcompany.com',
      password: 'password123',
      subdomain: 'testcompany',
    }
  );
  
  // Test 5: Access protected tenant endpoint
  if (tenantLogin.success && tenantLogin.headers) {
    const setCookie = tenantLogin.headers.get('set-cookie');
    const cookies = setCookie ? { Cookie: setCookie } : {};
    
    await testEndpoint(
      'Tenant Me Endpoint',
      'GET',
      '/api/tenant/me',
      undefined,
      cookies
    );
  }
  
  // Test 6: Tenant Logout
  await testEndpoint(
    'Tenant Logout',
    'POST',
    '/api/auth/tenant/logout'
  );
  
  // Test 7: Invalid login attempts
  log('\n\n3. INVALID LOGIN ATTEMPTS', colors.yellow);
  await testEndpoint(
    'Invalid Platform Login',
    'POST',
    '/api/auth/platform/login',
    {
      email: 'invalid@platform.com',
      password: 'wrongpassword',
    }
  );
  
  await testEndpoint(
    'Invalid Tenant Login',
    'POST',
    '/api/auth/tenant/login',
    {
      email: 'admin@testcompany.com',
      password: 'wrongpassword',
      subdomain: 'testcompany',
    }
  );
  
  // Test 8: Cross-tenant access attempt
  log('\n\n4. TENANT ISOLATION TEST', colors.yellow);
  log('This test would require multiple tenant users and checking RLS policies', colors.cyan);
  
  log('\n\nTests completed!', colors.green);
  log('=' .repeat(50), colors.cyan);
}

// Run tests
runTests().catch(console.error);