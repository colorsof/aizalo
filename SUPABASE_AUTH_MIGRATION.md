# Supabase Auth Migration Plan

## Current Custom JWT System Components to Remove/Replace:

### 1. **Auth Library (`src/lib/auth.ts`)**
- ✅ Removed: Custom JWT creation (`createToken`)
- ✅ Removed: JWT verification (`verifyToken`) 
- ✅ Removed: JWT payload types
- ✅ Removed: Cookie management functions
- ❌ Keep: Password hashing functions (still needed)
- ❌ Keep: User type definitions

### 2. **Middleware (`src/middleware.ts`)**
- ✅ Removed: JWT verification logic
- ❌ TODO: Add Supabase Auth session checking
- ❌ TODO: Extract user metadata from Supabase session

### 3. **Login Endpoints**
- `/api/auth/platform/login` - Uses custom JWT
- `/api/auth/tenant/login` - Uses custom JWT
- `/api/auth/platform/google` - Uses custom JWT
- `/api/auth/tenant/google` - Uses custom JWT

### 4. **Registration Endpoints**
- `/api/auth/platform/register` - Creates user in our tables
- `/api/auth/tenant/register` - Creates tenant and user

### 5. **Logout Endpoints**
- `/api/auth/platform/logout` - Clears custom cookies
- `/api/auth/tenant/logout` - Clears custom cookies

### 6. **Protected Endpoints**
- `/api/platform/me` - Reads from request headers
- `/api/tenant/me` - Reads from request headers
- `/api/platform/tenants` - Reads from request headers

## What We Need to Implement with Supabase Auth:

### 1. **Database Schema Changes**
```sql
-- Current Tables:
-- platform_users: id, email, password_hash, full_name, role, is_active
-- tenant_users: id, tenant_id, email, password_hash, full_name, role, is_active

-- Need to:
-- 1. Add auth_id column to link to Supabase Auth users
-- 2. Remove password_hash columns (Supabase Auth handles this)
-- 3. Store metadata in auth.users.raw_user_meta_data
```

### 2. **Supabase Auth Strategy**
We'll use a **single user pool** with metadata to distinguish users:
```json
// Platform user metadata
{
  "userType": "platform",
  "role": "owner|admin|sales|support",
  "platformUserId": "uuid"
}

// Tenant user metadata  
{
  "userType": "tenant",
  "role": "owner|admin|staff|viewer",
  "tenantId": "uuid",
  "tenantUserId": "uuid"
}
```

### 3. **RLS Integration**
Our existing RLS functions already use `auth.uid()` - they expect it to return the user ID from our tables. We need to:
1. Make `auth.uid()` return the Supabase Auth user ID
2. Update our functions to look up the platform/tenant user ID from the auth_id

### 4. **Implementation Steps**
1. Create migration to add auth_id columns
2. Update RLS functions to work with Supabase Auth
3. Create auth hook functions to sync users
4. Update login/register endpoints
5. Update middleware to use Supabase sessions
6. Migrate existing users