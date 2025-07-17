# FINAL IMPLEMENTATION ROADMAP - Multi-Tenant Platform Data Flow

## COMPREHENSIVE PLATFORM ARCHITECTURE

This roadmap combines all elements from:
- COMPREHENSIVE DATA ARCHITECTURE .ini
- COMPREHENSIVE-DATA-ARCHITECTURE.ini 
- COMPREHENSIVE-DATA-ARCHITECTURE-V2.ini
- FINAL-IMPLEMENTATION-ROADMAP.md
- ROADMAP.md
- IMPLEMENTATION-GUIDE.md

## 🎯 CURRENT STATUS: DATABASE COMPLETE ✅

### Completed Phase 1: Database & Security (DONE)
- ✅ Complete database schema with 40+ tables
- ✅ Row Level Security (RLS) on all tables
- ✅ Performance optimization (40+ indexes)
- ✅ Audit logging and monitoring
- ✅ Soft delete support
- ✅ Data validation constraints
- ✅ **Database Score: 9/10** 🎉

### Next Phase: Application Development
Focus areas in priority order:
1. **Authentication System** - Platform vs Tenant login
2. **Platform Admin Dashboard** - MRR tracking, tenant management
3. **Sales Team Portal** - Lead tracking, onboarding wizard
4. **Tenant Dashboards** - Industry-specific features
5. **AI Integration** - WhatsApp, content generation
6. **Website Builder** - Template-based site generation

## Platform User Hierarchy & Dashboard Access

```
PLATFORM OWNER (Bernard)
    ├── Platform Admin Dashboard (/admin)
    │   └── Access: ALL platform data, ALL tenants, ALL sales team
    │
    ├── SALES TEAM (Your employees)
    │   ├── Sales Dashboard (/sales)
    │   └── Access: Their assigned clients, leads, commissions
    │
    └── TENANT OWNERS (Business owners who buy from you)
        ├── Business Dashboard (/[subdomain]/dashboard)
        └── Access: ONLY their business data, customers, campaigns
```

---

## 1. Multi-Tenant Data Flow Architecture

### A. PLATFORM OWNER DASHBOARD (/admin)

```
┌─────────────────────────────────────────────────────────────────┐
│                   PLATFORM ADMIN DASHBOARD                      │
├─────────────────────────────────────────────────────────────────┤
│  Total MRR  │  Active Tenants  │  Platform Health  │  Revenue  │
├─────────────────────────────────────────────────────────────────┤
│                         Data Sources:                           │
│  • platform_revenue (all tenants)                              │
│  • tenants (subscription_status, monthly_fee)                  │
│  • platform_users (sales team management)                      │
│  • system_health (API usage, uptime)                          │
│  • sales_territories (assignments)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
            Can drill down into ANY tenant's dashboard
```

**Platform Owner Specific Features:**
```typescript
// Platform Admin Routes
/admin                        // Platform overview
/admin/tenants               // All client businesses
/admin/sales-team            // Manage salespeople
/admin/revenue               // Platform financials
/admin/system                // System health & logs
/admin/tenants/[id]          // View any tenant's dashboard
```

### B. SALES TEAM DASHBOARD (/sales)

```
┌─────────────────────────────────────────────────────────────────┐
│                     SALES TEAM DASHBOARD                        │
├─────────────────────────────────────────────────────────────────┤
│  My Clients  │  My Pipeline  │  My Commission  │  Team Rank    │
├─────────────────────────────────────────────────────────────────┤
│                         Data Sources:                           │
│  • sales_leads (WHERE assigned_to = current_user)              │
│  • sales_territories (my territories)                          │
│  • platform_revenue (WHERE sales_rep_id = current_user)        │
│  • tenants (WHERE onboarded_by = current_user)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
            Can access ONLY their assigned clients
```

**Sales Team Specific Features:**
```typescript
// Sales Team Routes
/sales                       // Sales dashboard
/sales/leads                 // My leads pipeline
/sales/onboarding           // Client onboarding wizard
/sales/demo                 // Demo account creation
/sales/clients              // My assigned clients only
/sales/commissions          // My earnings
```

### C. TENANT DASHBOARD (/[subdomain]/dashboard)

Each industry gets a customized dashboard with industry-specific features:

#### C1. HOTELS & RESTAURANTS Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOTEL/RESTAURANT DASHBOARD                   │
├─────────────────────────────────────────────────────────────────┤
│ Occupancy Rate │ Table Turnover │ Today's Bookings │ Reviews   │
├─────────────────────────────────────────────────────────────────┤
│ Room/Table Status Grid │ Upcoming Reservations │ Menu Performance│
├─────────────────────────────────────────────────────────────────┤
│                   Industry-Specific Data:                       │
│  • hotel_rooms / restaurant_tables (availability)              │
│  • hotel_bookings / restaurant_reservations                    │
│  • menu_items (popularity, stock levels)                       │
│  • special_events (weddings, conferences)                      │
└─────────────────────────────────────────────────────────────────┘
```

#### C2. REAL ESTATE Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                      REAL ESTATE DASHBOARD                      │
├─────────────────────────────────────────────────────────────────┤
│ Active Listings │ Property Views │ Scheduled Viewings │ Offers  │
├─────────────────────────────────────────────────────────────────┤
│ Property Map View │ Lead Pipeline │ Commission Tracker │ Docs   │
├─────────────────────────────────────────────────────────────────┤
│                   Industry-Specific Data:                       │
│  • property_listings (status, price, location)                 │
│  • property_viewings (schedule, feedback)                      │
│  • property_offers (negotiation status)                        │
│  • agent_commissions (pending, earned)                         │
└─────────────────────────────────────────────────────────────────┘
```

#### C3. CAR DEALERSHIP Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAR DEALERSHIP DASHBOARD                     │
├─────────────────────────────────────────────────────────────────┤
│ Inventory Value │ Test Drives │ Finance Apps │ Trade-Ins       │
├─────────────────────────────────────────────────────────────────┤
│ Vehicle Grid View │ Sales Pipeline │ Service Schedule │ Parts  │
├─────────────────────────────────────────────────────────────────┤
│                   Industry-Specific Data:                       │
│  • vehicle_inventory (make, model, status)                     │
│  • test_drives (scheduled, completed)                          │
│  • finance_applications (approval status)                      │
│  • service_appointments (upcoming, revenue)                    │
└─────────────────────────────────────────────────────────────────┘
```

#### C4. BEAUTY SALON & SPA Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    BEAUTY SALON DASHBOARD                       │
├─────────────────────────────────────────────────────────────────┤
│ Today's Appointments │ Staff Utilization │ Product Sales │ Tips│
├─────────────────────────────────────────────────────────────────┤
│ Appointment Calendar │ Staff Schedule │ Client Gallery │ Stock │
├─────────────────────────────────────────────────────────────────┤
│                   Industry-Specific Data:                       │
│  • beauty_appointments (service, stylist, time)                │
│  • beauty_staff (availability, specializations)                │
│  • beauty_services (popular services, pricing)                 │
│  • product_inventory (retail products)                         │
└─────────────────────────────────────────────────────────────────┘
```

#### C5. MEDICAL CLINIC Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEDICAL CLINIC DASHBOARD                     │
├─────────────────────────────────────────────────────────────────┤
│ Patient Queue │ Doctor Schedule │ No-Shows │ Insurance Claims  │
├─────────────────────────────────────────────────────────────────┤
│ Appointment Slots │ Patient Records │ Prescription │ Lab Results│
├─────────────────────────────────────────────────────────────────┤
│                   Industry-Specific Data:                       │
│  • medical_appointments (doctor, patient, type)                │
│  • medical_practitioners (schedule, patients)                  │
│  • insurance_claims (status, amounts)                          │
│  • prescription_tracking (refills due)                         │
└─────────────────────────────────────────────────────────────────┘
```

#### C6. TECH SHOP Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECH SHOP DASHBOARD                        │
├─────────────────────────────────────────────────────────────────┤
│ Repair Queue │ Parts Stock │ Warranty Claims │ Tech Benchmarks │
├─────────────────────────────────────────────────────────────────┤
│ Repair Tracking │ Inventory Levels │ Price Compare │ RMA Status│
├─────────────────────────────────────────────────────────────────┤
│                   Industry-Specific Data:                       │
│  • repair_orders (device, status, technician)                  │
│  • parts_inventory (stock levels, reorder points)              │
│  • price_comparisons (competitor pricing)                      │
│  • warranty_claims (vendor, status)                            │
└─────────────────────────────────────────────────────────────────┘
```

#### C7. LAW FIRM Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                      LAW FIRM DASHBOARD                         │
├─────────────────────────────────────────────────────────────────┤
│ Active Cases │ Billable Hours │ Court Dates │ Document Deadlines│
├─────────────────────────────────────────────────────────────────┤
│ Case Pipeline │ Time Tracking │ Invoice Status │ Court Calendar│
├─────────────────────────────────────────────────────────────────┤
│                   Industry-Specific Data:                       │
│  • legal_cases (type, status, next_action)                     │
│  • billable_hours (lawyer, client, rate)                       │
│  • court_appearances (date, case, location)                    │
│  • document_deadlines (filing requirements)                    │
└─────────────────────────────────────────────────────────────────┘
```

#### C8. HARDWARE STORE Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    HARDWARE STORE DASHBOARD                     │
├─────────────────────────────────────────────────────────────────┤
│ Stock Alerts │ Bulk Orders │ Contractor Credit │ Delivery Queue│
├─────────────────────────────────────────────────────────────────┤
│ Inventory Grid │ Price Calculator │ Credit Accounts │ Suppliers│
├─────────────────────────────────────────────────────────────────┤
│                   Industry-Specific Data:                       │
│  • hardware_products (stock, reorder levels)                   │
│  • bulk_orders (contractor quotes)                             │
│  • credit_accounts (limits, outstanding)                       │
│  • delivery_schedule (zones, trucks)                           │
└─────────────────────────────────────────────────────────────────┘
```

**Common Tenant Features Across All Industries:**
```typescript
// Base routes available to all tenants
[subdomain].aizalo.com/dashboard     // Industry-specific dashboard
[subdomain].aizalo.com/conversations // AI chat management
[subdomain].aizalo.com/campaigns     // Marketing automation
[subdomain].aizalo.com/customers     // CRM features
[subdomain].aizalo.com/analytics     // Performance metrics
[subdomain].aizalo.com/settings      // Business configuration
```

---

## 2. Website Builder Data Flow

### Website Generation Process

```
TENANT REQUESTS WEBSITE GENERATION
         │
         ▼
┌─────────────────────────────┐
│  1. SELECT TEMPLATE         │
│  Based on tenant.industry   │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  2. CREATE WEBSITE RECORD   │
│  tenant_websites table      │
│  Assigns unique subdomain   │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  3. APPLY CUSTOMIZATIONS    │
│  website_customizations     │
│  Colors, fonts, logo, etc.  │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  4. GENERATE PAGES          │
│  website_pages table        │
│  Home, About, Services, etc.│
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  5. PUBLISH TO SUBDOMAIN    │
│  tenant.aizalo.com          │
│  CDN deployment             │
└─────────────────────────────┘
```

### Data Separation in Website Builder

1. **Template Level** (Shared Resource)
   - All tenants can view all templates
   - Templates filtered by industry for better UX
   - No tenant data in templates

2. **Website Level** (Tenant-Specific)
   ```sql
   -- Each tenant can have only ONE website
   UNIQUE CONSTRAINT ON tenant_websites(tenant_id)
   
   -- Subdomain must be globally unique
   UNIQUE CONSTRAINT ON tenant_websites(subdomain)
   ```

3. **Customization Level** (Tenant-Specific)
   - All customizations linked to website_id
   - RLS ensures tenant can only modify their own
   - Cascading delete when website removed

4. **Page Level** (Tenant-Specific)
   - Pages belong to specific website
   - SEO metadata per page
   - Content can include dynamic tenant data

### Website Builder API Flow

```typescript
// 1. Get available templates for industry
GET /api/tenant/website/templates
Response: [
  {
    id: "uuid",
    name: "Modern Hotel",
    industry: "hotels",
    preview_url: "https://preview.aizalo.com/modern-hotel"
  }
]

// 2. Generate website from template
POST /api/tenant/website/generate
Body: {
  template_id: "uuid",
  subdomain: "besthotel" // Will create besthotel.aizalo.com
}

// 3. Customize website
PATCH /api/tenant/website/customize
Body: {
  customizations: {
    color: { primary: "#007bff", secondary: "#6c757d" },
    font: { heading: "Montserrat", body: "Open Sans" },
    logo: { url: "https://..." }
  }
}

// 4. Update page content
PATCH /api/tenant/website/pages/:slug
Body: {
  content: "New content with {{business_name}} variables",
  meta_description: "SEO description"
}

// 5. Publish website
POST /api/tenant/website/publish
Response: {
  url: "https://besthotel.aizalo.com",
  status: "published"
}
```

---

## 3. Data Access Control & API Endpoints

### Platform Admin APIs
```typescript
GET    /api/admin/platform-metrics
├── Auth: platform_users.role = 'owner'
├── Returns: SUM(all tenants revenue), COUNT(active tenants)
└── Source: platform_revenue, tenants tables

GET    /api/admin/tenants
├── Auth: platform_users.role IN ('owner', 'admin')
├── Returns: ALL tenants with subscription status
└── Can filter by: status, tier, sales_rep

POST   /api/admin/tenant/[id]/access
├── Auth: platform_users.role = 'owner'
├── Action: Generate admin access token for tenant
└── Allows: Viewing tenant dashboard for support

GET    /api/admin/sales-performance
├── Returns: Sales team leaderboard, commissions
└── Source: platform_revenue GROUP BY sales_rep_id
```

### Sales Team APIs
```typescript
GET    /api/sales/my-clients
├── Auth: platform_users.role IN ('sales', 'support')
├── Filter: WHERE assigned_to = current_user_id
├── Returns: Only assigned tenants
└── Cannot access other salespeople's clients

POST   /api/sales/onboard-client
├── Creates: New tenant account
├── Assigns: Template based on industry
├── Sets: onboarded_by = current_user_id
└── Triggers: Commission tracking

GET    /api/sales/my-commissions
├── Filter: WHERE sales_rep_id = current_user_id
├── Returns: Commission breakdown by client
└── Source: platform_revenue calculations
```

### Tenant APIs (with RLS)
```typescript
GET    /api/tenant/dashboard
├── Auth: tenant_users + RLS policy
├── Filter: AUTOMATICALLY by tenant_id in JWT
├── Returns: ONLY current tenant's data
└── Source: All tables WHERE tenant_id = auth.tenant_id

POST   /api/tenant/conversations
├── Auto-inject: tenant_id from auth context
├── Creates: Conversation linked to tenant
└── RLS: Ensures cross-tenant data leak impossible

// Website Builder APIs
GET    /api/tenant/website/template
├── Returns: Available templates for tenant's industry
└── No tenant filtering needed (shared resource)

POST   /api/tenant/website/generate
├── Creates: New website for authenticated tenant
├── Auto-inject: tenant_id from auth context
└── Ensures: One website per tenant

PATCH  /api/tenant/website/customize
├── Updates: Only tenant's own website
├── RLS: Blocks cross-tenant modifications
└── Validates: Customization keys allowed

GET    /api/tenant/website/pages
├── Returns: All pages for tenant's website
├── Filter: WHERE website.tenant_id = auth.tenant_id
└── Includes: Published and draft pages

POST   /api/tenant/website/publish
├── Publishes: Tenant's website to subdomain
├── Validates: Subdomain uniqueness
└── Updates: CDN and routing configuration
```

---

## 3. Implementation Checklist by User Type

### A. Platform Admin Dashboard (/admin)
- [ ] **Authentication**
  - [ ] Separate platform_users table
  - [ ] Role-based access (owner, admin)
  - [ ] Different JWT claims than tenants
  
- [ ] **Overview Page Components**
  - [ ] MRR Widget: `SUM(tenants.monthly_fee WHERE active)`
  - [ ] Tenant Count: By status (trial, active, churned)
  - [ ] Platform Health: API usage, error rates
  - [ ] Revenue Chart: Monthly platform revenue
  
- [ ] **Tenant Management**
  - [ ] Tenant list with filters
  - [ ] Quick stats per tenant
  - [ ] "Login as Tenant" feature
  - [ ] Suspend/reactivate tenant
  
- [ ] **Sales Team Management**
  - [ ] Add/remove salespeople
  - [ ] Assign territories
  - [ ] Set commission rates
  - [ ] View individual performance

### B. Sales Dashboard (/sales)
- [ ] **Authentication**
  - [ ] Login via platform_users table
  - [ ] Role check: 'sales' or 'support'
  - [ ] Territory-based data filtering
  
- [ ] **My Pipeline View**
  - [ ] Lead stages (new → demo → negotiating → won)
  - [ ] Next actions required
  - [ ] Follow-up reminders
  - [ ] Win/loss tracking
  
- [ ] **Client Onboarding Wizard**
  - [ ] Business info collection
  - [ ] Industry selection (dropdown)
  - [ ] Template selection (1 of 10)
  - [ ] Subdomain setup
  - [ ] Initial customization
  
- [ ] **Commission Tracker**
  - [ ] This month's earnings
  - [ ] Breakdown by client
  - [ ] Recurring vs one-time
  - [ ] Leaderboard position

### C. Tenant Dashboard (/[subdomain]/dashboard)
- [ ] **Subdomain Routing**
  - [ ] Middleware to extract tenant
  - [ ] Load tenant context
  - [ ] Apply RLS policies
  - [ ] Detect industry type for dashboard
  
- [ ] **Common Features (All Industries)**
  - [ ] AI Conversations management
  - [ ] Campaign builder
  - [ ] Customer database
  - [ ] Analytics dashboard
  - [ ] Settings & integrations
  
- [ ] **Industry-Specific Components**
  
  **Hotels & Restaurants:**
  - [ ] Room/Table grid view component
  - [ ] Booking calendar widget
  - [ ] Menu management interface
  - [ ] Event booking system
  - [ ] Occupancy rate calculator
  
  **Real Estate:**
  - [ ] Property listing manager
  - [ ] Map view integration
  - [ ] Viewing scheduler
  - [ ] Offer negotiation tracker
  - [ ] Commission calculator
  
  **Car Dealerships:**
  - [ ] Vehicle inventory grid
  - [ ] Test drive calendar
  - [ ] Finance calculator widget
  - [ ] Trade-in valuation tool
  - [ ] Service appointment system
  
  **Beauty Salons:**
  - [ ] Appointment booking grid
  - [ ] Staff schedule manager
  - [ ] Service menu editor
  - [ ] Client gallery uploader
  - [ ] Inventory tracker
  
  **Medical Clinics:**
  - [ ] Patient queue display
  - [ ] Doctor schedule grid
  - [ ] Insurance claim tracker
  - [ ] Prescription manager
  - [ ] Lab results interface
  
  **Tech Shops:**
  - [ ] Repair ticket system
  - [ ] Parts inventory search
  - [ ] Warranty claim forms
  - [ ] Price comparison tool
  - [ ] Technician assignment
  
  **Law Firms:**
  - [ ] Case management system
  - [ ] Time tracking widget
  - [ ] Court calendar sync
  - [ ] Document deadline alerts
  - [ ] Billing dashboard
  
  **Hardware Stores:**
  - [ ] Stock level monitor
  - [ ] Bulk quote calculator
  - [ ] Credit account manager
  - [ ] Delivery route planner
  - [ ] Supplier order system

---

## 4. Critical Data Isolation Implementation

### Row Level Security (RLS) Setup
```sql
-- Enable RLS on all tenant tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Tenants see only their data
CREATE POLICY tenant_isolation ON customers
  FOR ALL 
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Policy: Platform owner sees all
CREATE POLICY platform_owner_access ON customers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE id = auth.uid() 
      AND role = 'owner'
    )
  );

-- Policy: Sales team sees assigned clients only
CREATE POLICY sales_team_access ON customers
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE assigned_to = auth.uid()
    )
  );
```

### Authentication Flow
```typescript
// Platform Owner/Sales Login
async function platformLogin(email: string, password: string) {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      data: { 
        user_type: 'platform',
        // No tenant_id for platform users
      }
    }
  });
  
  // Redirect to appropriate dashboard
  if (user.role === 'owner') return '/admin';
  if (user.role === 'sales') return '/sales';
}

// Tenant Login (different flow)
async function tenantLogin(email: string, password: string, subdomain: string) {
  // First get tenant_id from subdomain
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('subdomain', subdomain)
    .single();
    
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      data: { 
        user_type: 'tenant',
        tenant_id: tenant.id  // Critical for RLS
      }
    }
  });
  
  return `/${subdomain}/dashboard`;
}
```

---

## 5. Data Flow Troubleshooting by User Type

### Platform Admin Issues
```typescript
// Issue: Can't see all tenants
// Check: platform_users.role
const { data: user } = await supabase
  .from('platform_users')
  .select('role')
  .eq('id', userId)
  .single();
console.log('User role:', user.role); // Should be 'owner' or 'admin'

// Issue: Revenue calculations wrong
// Check: Include all revenue types
SELECT 
  SUM(amount) as total_revenue,
  type,
  COUNT(DISTINCT tenant_id) as paying_tenants
FROM platform_revenue
WHERE paid_at IS NOT NULL
GROUP BY type;
```

### Sales Team Issues
```typescript
// Issue: Can't see assigned clients
// Check: sales_territories and assignments
SELECT 
  t.id, t.business_name, st.assigned_to
FROM tenants t
JOIN sales_territories st ON t.territory_id = st.id
WHERE st.assigned_to = 'sales_user_id';

// Issue: Commission not calculating
// Check: platform_revenue entries
SELECT * FROM platform_revenue
WHERE sales_rep_id = 'user_id'
AND created_at >= date_trunc('month', current_date);
```

### Tenant Issues
```typescript
// Issue: Seeing other tenant's data
// CRITICAL: Check JWT claims
const token = await supabase.auth.getSession();
console.log('Token claims:', token.session?.user);
// MUST include tenant_id claim

// Issue: Conversations not isolated
// Check: RLS policy active
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'conversations';
// rowsecurity must be TRUE
```

---

## Quick Architecture Summary

```
app.aizalo.com/admin         → Platform Owner Dashboard
app.aizalo.com/sales         → Sales Team Dashboard  
hotel.aizalo.com/dashboard   → Tenant Dashboard (Hotel)
hardware.aizalo.com/dashboard → Tenant Dashboard (Hardware Store)

Each has COMPLETELY different:
- Authentication method
- Data access rights  
- UI components
- Features available
```

This is a TRUE multi-tenant SaaS platform with proper data isolation and role-based access control!

---

## 6. Complete Database Schema with RLS Policies

### A. Platform Tables (Platform Owner Access Only)

```sql
-- Platform settings table
CREATE TABLE platform_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    data_type VARCHAR(20) CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Platform users (Owner and Sales Team)
CREATE TABLE platform_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('owner', 'sales', 'support', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- Sales territories
CREATE TABLE sales_territories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    assigned_to UUID REFERENCES platform_users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sales leads tracking
CREATE TABLE sales_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    industry VARCHAR(50),
    territory_id INTEGER REFERENCES sales_territories(id),
    assigned_to UUID REFERENCES platform_users(id),
    status VARCHAR(20) CHECK (status IN ('new', 'contacted', 'demo', 'negotiating', 'won', 'lost')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_contact_at TIMESTAMP
);

-- Platform revenue tracking
CREATE TABLE platform_revenue (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('subscription', 'setup', 'addon', 'overage')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('mpesa', 'bank', 'card', 'cash')),
    payment_reference VARCHAR(100),
    sales_rep_id UUID REFERENCES platform_users(id),
    commission_percentage DECIMAL(5,2),
    commission_amount DECIMAL(10,2),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding sessions tracking
CREATE TABLE onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_rep_id UUID REFERENCES platform_users(id),
    lead_id UUID REFERENCES sales_leads(id),
    tenant_id UUID REFERENCES tenants(id),
    status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Commission tracking
CREATE TABLE commissions (
    id SERIAL PRIMARY KEY,
    sales_rep_id UUID REFERENCES platform_users(id),
    tenant_id UUID REFERENCES tenants(id),
    revenue_id INTEGER REFERENCES platform_revenue(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'paid')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System logs and audit trail
CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(20) CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
    source VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE api_usage (
    id BIGSERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    user_id UUID,
    user_type VARCHAR(20),
    response_status INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### B. Tenant Tables with Complete RLS

```sql
-- Main tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL,
    industry VARCHAR(50) NOT NULL CHECK (industry IN 
        ('hotels', 'restaurants', 'real_estate', 'car_dealers', 'beauty', 'medical', 'tech', 'law', 'hardware')),
    tier INTEGER CHECK (tier IN (1, 2, 3)),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    postal_code VARCHAR(10),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    currency VARCHAR(3) DEFAULT 'KES',
    subscription_status VARCHAR(20) CHECK (subscription_status IN 
        ('trial', 'active', 'past_due', 'canceled', 'suspended')),
    subscription_plan VARCHAR(20) CHECK (subscription_plan IN ('starter', 'professional', 'growth')),
    monthly_fee DECIMAL(10,2),
    trial_ends_at DATE,
    next_billing_date DATE,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES platform_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    activated_at TIMESTAMP,
    churned_at TIMESTAMP
);

-- Tenant users with permissions
CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('owner', 'admin', 'staff', 'viewer')),
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- Tenant settings (normalized)
CREATE TABLE tenant_settings (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, category, key)
);
```

### C. Customer & Conversation Tables

```sql
-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    phone_verified BOOLEAN DEFAULT false,
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    language_preference VARCHAR(5) DEFAULT 'en' CHECK (language_preference IN ('en', 'sw', 'sheng')),
    location TEXT,
    tags JSONB DEFAULT '[]',
    lifetime_value DECIMAL(12,2) DEFAULT 0,
    acquisition_channel VARCHAR(50),
    acquisition_campaign UUID REFERENCES campaigns(id),
    created_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    UNIQUE(tenant_id, phone)
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    channel VARCHAR(20) NOT NULL CHECK (channel IN 
        ('whatsapp', 'facebook', 'instagram', 'tiktok', 'email', 'web', 'sms')),
    status VARCHAR(20) CHECK (status IN ('active', 'waiting', 'resolved', 'abandoned')),
    ai_model_used VARCHAR(20) CHECK (ai_model_used IN ('gemini', 'groq', 'openai')),
    response_times JSONB DEFAULT '[]',
    sentiment_score DECIMAL(3,2),
    converted BOOLEAN DEFAULT false,
    conversion_value DECIMAL(12,2),
    messages JSONB DEFAULT '[]',
    assigned_to UUID REFERENCES tenant_users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    ai_confidence DECIMAL(3,2),
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### D. Marketing & Campaign Tables

```sql
-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(30) CHECK (type IN 
        ('acquisition', 'nurture', 'retention', 'reactivation', 'email', 'sms', 'whatsapp', 'social', 'multi_channel')),
    channels JSONB DEFAULT '[]',
    target_audience JSONB DEFAULT '{}',
    content JSONB DEFAULT '{}',
    ai_generated BOOLEAN DEFAULT false,
    status VARCHAR(20) CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
    budget DECIMAL(10,2),
    schedule JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    starts_at TIMESTAMP,
    ends_at TIMESTAMP
);

-- Leads tracking
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    source_campaign_id UUID REFERENCES campaigns(id),
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    stage VARCHAR(20) CHECK (stage IN 
        ('new', 'contacted', 'qualified', 'negotiating', 'won', 'lost')),
    value DECIMAL(12,2),
    probability DECIMAL(3,2),
    assigned_to UUID REFERENCES tenant_users(id),
    follow_up_at TIMESTAMP,
    notes JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    converted_at TIMESTAMP
);

-- Content library
CREATE TABLE content_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(30) CHECK (type IN 
        ('gmb_post', 'social_post', 'email', 'sms', 'ad_copy')),
    platform VARCHAR(30),
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    performance_score DECIMAL(3,2),
    ai_model VARCHAR(20),
    approved BOOLEAN DEFAULT false,
    used_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    scheduled_for TIMESTAMP,
    published_at TIMESTAMP
);

-- Website Builder Tables
CREATE TABLE website_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    industry VARCHAR(50) NOT NULL,
    description TEXT,
    preview_url TEXT,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE website_sections (
    id SERIAL PRIMARY KEY,
    template_id UUID REFERENCES website_templates(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN 
        ('hero', 'features', 'testimonials', 'pricing', 'contact', 'about', 'services', 'gallery')),
    section_name VARCHAR(100) NOT NULL,
    default_content TEXT,
    is_required BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tenant_websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES website_templates(id),
    subdomain VARCHAR(50) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE website_customizations (
    id SERIAL PRIMARY KEY,
    website_id UUID REFERENCES tenant_websites(id) ON DELETE CASCADE,
    customization_type VARCHAR(50) NOT NULL CHECK (customization_type IN 
        ('color', 'font', 'logo', 'content', 'layout', 'seo')),
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(website_id, customization_type, key)
);

CREATE TABLE website_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID REFERENCES tenant_websites(id) ON DELETE CASCADE,
    slug VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    meta_description TEXT,
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(website_id, slug)
);
```

### E. Complete RLS Policies Implementation

```sql
-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_pages ENABLE ROW LEVEL SECURITY;

-- Platform owner sees everything
CREATE POLICY platform_owner_all ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Sales team sees assigned tenants
CREATE POLICY sales_team_assigned ON tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sales_leads sl
            JOIN platform_users pu ON sl.assigned_to = pu.id
            WHERE pu.id = auth.uid() 
            AND pu.role IN ('sales', 'support')
            AND sl.business_name = tenants.business_name
            AND sl.status = 'won'
        )
    );

-- Tenant isolation for all tenant data
CREATE POLICY tenant_isolation_customers ON customers
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Similar policies for all tenant tables
CREATE POLICY tenant_isolation_conversations ON conversations
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Tenant staff restrictions
CREATE POLICY tenant_staff_read_only ON tenant_settings
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND role IN ('staff', 'viewer')
        )
    );

-- Website Builder RLS Policies
CREATE POLICY tenant_websites_isolation ON tenant_websites
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY website_customizations_isolation ON website_customizations
    FOR ALL USING (
        website_id IN (
            SELECT id FROM tenant_websites 
            WHERE tenant_id IN (
                SELECT tenant_id FROM tenant_users 
                WHERE user_id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY website_pages_isolation ON website_pages
    FOR ALL USING (
        website_id IN (
            SELECT id FROM tenant_websites 
            WHERE tenant_id IN (
                SELECT tenant_id FROM tenant_users 
                WHERE user_id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Website templates are shared (no RLS needed)
-- But track usage per tenant
CREATE POLICY website_template_read_all ON website_templates
    FOR SELECT USING (true);

-- Audit logging policy
CREATE POLICY audit_write_only ON audit_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY audit_read_platform ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM platform_users 
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
```

---

## 7. API Structure & Security Boundaries

### A. Platform API Endpoints (Platform Owner & Sales Team)

```typescript
// Platform Admin APIs - Require platform_owner role
GET    /api/platform/metrics                    // Platform-wide metrics
GET    /api/platform/tenants                    // All tenants list
GET    /api/platform/tenants/:id                // Specific tenant details
POST   /api/platform/tenants/:id/access         // Generate admin access token
GET    /api/platform/revenue                    // Revenue analytics
GET    /api/platform/system-health              // System status
POST   /api/platform/feature-flags              // Toggle features
GET    /api/platform/audit-logs                 // System audit trail

// Sales Team APIs - Require sales or support role  
GET    /api/sales/dashboard                     // Sales metrics
GET    /api/sales/my-clients                    // Assigned clients only
POST   /api/sales/onboard                       // Create new tenant
GET    /api/sales/leads                         // Sales pipeline
POST   /api/sales/demo                          // Schedule demo
GET    /api/sales/commissions                   // Commission tracking
POST   /api/sales/client/:id/notes              // Add client notes
```

### B. Tenant API Endpoints (Tenant Users)

```typescript
// Tenant APIs - Automatically filtered by tenant_id from JWT
GET    /api/tenant/dashboard                    // Tenant dashboard data
GET    /api/tenant/conversations                // All conversations
POST   /api/tenant/conversations                // Create conversation
GET    /api/tenant/conversations/:id            // Single conversation
PATCH  /api/tenant/conversations/:id            // Update conversation

GET    /api/tenant/customers                    // Customer list
POST   /api/tenant/customers                    // Create customer
GET    /api/tenant/customers/:id                // Customer details
PATCH  /api/tenant/customers/:id                // Update customer

GET    /api/tenant/campaigns                    // Campaign list
POST   /api/tenant/campaigns                    // Create campaign
GET    /api/tenant/campaigns/:id                // Campaign details
PATCH  /api/tenant/campaigns/:id                // Update campaign

GET    /api/tenant/analytics                    // Analytics data
GET    /api/tenant/settings                     // Tenant settings
PATCH  /api/tenant/settings                     // Update settings
```

### C. Public API Endpoints (No Auth)

```typescript
// Public APIs - No authentication required
GET    /api/public/:subdomain/content           // Public website content
GET    /api/public/:subdomain/availability      // Business availability
POST   /api/public/:subdomain/lead              // Lead capture form
GET    /api/public/:subdomain/reviews           // Public reviews

// Webhook endpoints
POST   /api/webhooks/whatsapp                   // WhatsApp webhook
POST   /api/webhooks/facebook                   // Facebook webhook
POST   /api/webhooks/payment                    // Payment webhooks
```

### D. AI & Integration APIs

```typescript
// AI Service APIs - Internal use
POST   /api/ai/chat                             // Process conversation
POST   /api/ai/content                          // Generate content
POST   /api/ai/analyze                          // Analyze data
POST   /api/ai/negotiate                        // Price negotiation

// Integration APIs
POST   /api/integrations/whatsapp/send          // Send WhatsApp
POST   /api/integrations/email/send             // Send email
POST   /api/integrations/sms/send               // Send SMS
GET    /api/integrations/google/reviews         // Get GMB reviews
POST   /api/integrations/google/post            // Post to GMB
```

---

## 8. Security Boundaries & Implementation

### A. Authentication & Authorization Flow

```typescript
// Multi-layered auth system
interface AuthContext {
  userType: 'platform' | 'tenant' | 'public';
  userId: string;
  role: string;
  tenantId?: string;
  permissions: string[];
}

// Middleware stack
export const authMiddleware = [
  validateJWT,           // Verify token
  extractUserContext,    // Get user type and role
  checkPermissions,      // Verify permissions
  injectTenantContext,   // Add tenant isolation
  auditLog              // Log all actions
];

// Platform auth
async function platformAuth(req: Request) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.PLATFORM_SECRET);
  
  if (!['owner', 'admin', 'sales', 'support'].includes(decoded.role)) {
    throw new UnauthorizedError();
  }
  
  req.user = {
    userType: 'platform',
    userId: decoded.sub,
    role: decoded.role,
    permissions: getPlatformPermissions(decoded.role)
  };
}

// Tenant auth with automatic filtering
async function tenantAuth(req: Request) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.TENANT_SECRET);
  
  req.user = {
    userType: 'tenant',
    userId: decoded.sub,
    tenantId: decoded.tenant_id, // Critical for RLS
    role: decoded.role,
    permissions: getTenantPermissions(decoded.role)
  };
  
  // Inject tenant context for all queries
  req.supabase = supabase.auth.setAuth(token);
}
```

### B. Data Isolation Patterns

```typescript
// Tenant data isolation
class TenantRepository {
  constructor(private tenantId: string) {}
  
  async getCustomers() {
    // RLS automatically filters by tenant_id
    return await supabase
      .from('customers')
      .select('*')
      // No need for .eq('tenant_id', this.tenantId)
      // RLS handles it!
  }
  
  async createCustomer(data: Customer) {
    // Tenant ID automatically injected
    return await supabase
      .from('customers')
      .insert({
        ...data,
        tenant_id: this.tenantId // Enforced by RLS
      });
  }
}

// Platform data access
class PlatformRepository {
  async getAllTenants() {
    // Only platform owner can access
    return await supabase
      .from('tenants')
      .select('*');
  }
  
  async getTenantMetrics(tenantId?: string) {
    const query = supabase
      .from('tenant_metrics')
      .select('*');
      
    if (tenantId) {
      query.eq('tenant_id', tenantId);
    }
    
    return await query;
  }
}
```

### C. Storage Isolation

```typescript
// Tenant-specific storage buckets
const storage = {
  upload: async (file: File, tenantId: string) => {
    const bucket = `tenant-${tenantId}`;
    const path = `${Date.now()}-${file.name}`;
    
    return await supabase.storage
      .from(bucket)
      .upload(path, file);
  },
  
  getUrl: (path: string, tenantId: string) => {
    const bucket = `tenant-${tenantId}`;
    return supabase.storage
      .from(bucket)
      .getPublicUrl(path);
  }
};
```

### D. Cache Isolation

```typescript
// Redis namespace isolation
class TenantCache {
  constructor(private tenantId: string) {
    this.prefix = `tenant:${tenantId}:`;
  }
  
  async get(key: string) {
    return await redis.get(this.prefix + key);
  }
  
  async set(key: string, value: any, ttl?: number) {
    return await redis.setex(
      this.prefix + key,
      ttl || 3600,
      JSON.stringify(value)
    );
  }
}
```

---

## 9. Implementation Phases with Checkpoints

### Phase 1: Core Infrastructure (Week 1-2)

#### Checkpoint 1.1: Authentication System
- [ ] Platform user login working
- [ ] Sales team login with restrictions
- [ ] Tenant user login with isolation
- [ ] JWT tokens with proper claims
- [ ] Role-based middleware active

#### Checkpoint 1.2: Database with RLS ✅ COMPLETED
- [x] All tables created with proper schema
- [x] RLS policies active and tested
- [x] Platform owner can see all data
- [x] Sales team sees only assigned clients
- [x] Tenants completely isolated
- [x] Performance optimized (40+ indexes)
- [x] Soft delete support added
- [x] Audit logging implemented
- [x] Monitoring views created
- [x] Data validation constraints added

#### Checkpoint 1.3: API Structure
- [ ] Platform APIs secured
- [ ] Tenant APIs auto-filtered
- [ ] Public APIs working
- [ ] Webhook endpoints active

### Phase 2: User Dashboards (Week 3-4)

#### Checkpoint 2.1: Platform Owner Dashboard
- [ ] Total MRR calculation working
- [ ] Tenant overview with drill-down
- [ ] Sales team performance metrics
- [ ] System health monitoring
- [ ] Revenue analytics with charts

#### Checkpoint 2.2: Sales Portal
- [ ] Sales pipeline management
- [ ] Client onboarding wizard
- [ ] Commission tracking
- [ ] Demo scheduling system
- [ ] Territory management

#### Checkpoint 2.3: Tenant Dashboard
- [ ] Industry-specific layouts
- [ ] Real-time metrics
- [ ] Conversation management
- [ ] Campaign builder
- [ ] Settings management

### Phase 3: Marketing & AI Integration (Week 5-6)

#### Checkpoint 3.1: AI Services
- [ ] Gemini integration (95% traffic)
- [ ] Groq for real-time (5% traffic)
- [ ] AI routing logic working
- [ ] Price negotiation active
- [ ] Content generation live

#### Checkpoint 3.2: Marketing Automation
- [ ] WhatsApp sending/receiving
- [ ] Social media posting
- [ ] Email campaigns
- [ ] Google My Business integration
- [ ] Campaign analytics

#### Checkpoint 3.3: Customer Flows
- [ ] Lead capture forms
- [ ] Automated nurturing
- [ ] Conversion tracking
- [ ] Retention campaigns
- [ ] Referral system

### Phase 4: Industry Features (Week 7-8)

#### Checkpoint 4.1: Industry Templates
- [ ] Hotel/Restaurant features
- [ ] Real Estate features
- [ ] Car Dealership features
- [ ] Beauty Salon features
- [ ] Medical Clinic features

#### Checkpoint 4.2: Industry Workflows
- [ ] Booking systems
- [ ] Inventory management
- [ ] Appointment scheduling
- [ ] Property listings
- [ ] Service catalogs

### Phase 5: Scale & Optimize (Week 9-10)

#### Checkpoint 5.1: Performance
- [ ] <500ms response times
- [ ] 1000+ concurrent users
- [ ] Real-time updates working
- [ ] CDN configured
- [ ] Database optimized

#### Checkpoint 5.2: Security
- [ ] Penetration testing done
- [ ] GDPR compliance
- [ ] Audit logging complete
- [ ] Backup systems active
- [ ] Monitoring configured

#### Checkpoint 5.3: Business Ready
- [ ] Billing automation
- [ ] Support system
- [ ] Documentation complete
- [ ] Training materials
- [ ] Go-to-market ready

---

## 10. Monitoring & Observability

### A. Platform Metrics

```typescript
// Real-time platform metrics
interface PlatformMetrics {
  // Business metrics
  totalMRR: number;
  activeTenantsCount: number;
  churnRate: number;
  averageRevenuePerTenant: number;
  
  // Technical metrics
  apiResponseTime: number;
  errorRate: number;
  activeConversations: number;
  aiTokensUsed: number;
  
  // Sales metrics
  newLeadsThisMonth: number;
  conversionRate: number;
  averageDealSize: number;
}

// Metric collection
const metrics = {
  async collect(): Promise<PlatformMetrics> {
    const [revenue, tenants, technical, sales] = await Promise.all([
      this.getRevenueMetrics(),
      this.getTenantMetrics(),
      this.getTechnicalMetrics(),
      this.getSalesMetrics()
    ]);
    
    return { ...revenue, ...tenants, ...technical, ...sales };
  }
};
```

### B. Tenant Metrics

```typescript
// Per-tenant analytics
interface TenantMetrics {
  // Engagement
  totalConversations: number;
  averageResponseTime: number;
  conversionRate: number;
  customerSatisfaction: number;
  
  // Marketing
  leadsGenerated: number;
  campaignROI: number;
  contentEngagement: number;
  
  // Revenue
  monthlyRevenue: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
}
```

### C. Alerting Rules

```yaml
# Platform alerts
alerts:
  - name: high_error_rate
    condition: error_rate > 5%
    severity: critical
    notify: [ops_team, platform_owner]
    
  - name: low_tenant_activity
    condition: active_conversations < 10 for 1 hour
    severity: warning
    notify: [success_team]
    
  - name: api_rate_limit_approaching
    condition: api_usage > 80% of limit
    severity: warning
    notify: [dev_team]
    
  - name: payment_failure
    condition: payment_status = 'failed'
    severity: high
    notify: [finance_team, sales_rep]
```

---

## 11. Deployment Architecture

### A. Infrastructure Stack

```yaml
# Production infrastructure
production:
  frontend:
    provider: Vercel
    regions: [us-east-1, eu-west-1]
    features:
      - Edge functions
      - Image optimization
      - Analytics
      
  backend:
    provider: Supabase
    features:
      - PostgreSQL with RLS
      - Realtime subscriptions
      - Edge functions
      - Vector embeddings
      
  cdn:
    provider: Cloudflare
    features:
      - DDoS protection
      - WAF rules
      - Cache optimization
      
  monitoring:
    - Vercel Analytics
    - Supabase Dashboard
    - Custom metrics dashboard
    - Sentry for errors
```

### B. Environment Configuration

```typescript
// Environment variables structure
interface EnvironmentConfig {
  // Platform secrets
  PLATFORM_JWT_SECRET: string;
  PLATFORM_ADMIN_URL: string;
  
  // Database
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  
  // AI Services
  GEMINI_API_KEY: string;
  GROQ_API_KEY: string;
  OPENAI_API_KEY: string;
  
  // Integrations
  WHATSAPP_TOKEN: string;
  FACEBOOK_APP_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  
  // Email
  RESEND_API_KEY: string;
  
  // Payments
  MPESA_CONSUMER_KEY: string;
  MPESA_CONSUMER_SECRET: string;
}
```

---

## 12. Success Metrics & KPIs

### A. Platform Success Metrics

```typescript
const platformKPIs = {
  technical: {
    uptime: '99.9%',
    responseTime: '<500ms average',
    aiAccuracy: '95%+ satisfaction',
    conversationSuccess: '80%+ resolution'
  },
  
  business: {
    mrrGrowth: '30%+ monthly',
    churnRate: '<5% monthly', 
    customerAcquisitionCost: '<10,000 KSH',
    ltvCacRatio: '3:1+'
  },
  
  customer: {
    leadsPerCustomer: '50+ monthly',
    conversionImprovement: '2x+ baseline',
    customerROI: '10x+ platform cost',
    npsScore: '50+'
  }
};
```

### B. Monitoring Dashboard

```typescript
// Real-time KPI tracking
class KPIDashboard {
  async getSnapshot() {
    return {
      timestamp: new Date(),
      platform: await this.getPlatformMetrics(),
      tenants: await this.getTopTenantMetrics(),
      alerts: await this.getActiveAlerts(),
      trends: await this.calculate7DayTrends()
    };
  }
  
  async getPlatformMetrics() {
    const [mrr, tenants, conversations] = await Promise.all([
      this.calculateMRR(),
      this.getActiveTenantCount(),
      this.getConversationMetrics()
    ]);
    
    return {
      mrr: {
        current: mrr.total,
        growth: mrr.growthRate,
        newMRR: mrr.new,
        churnedMRR: mrr.churned
      },
      tenants: {
        total: tenants.total,
        active: tenants.active,
        trial: tenants.trial,
        paying: tenants.paying
      },
      usage: {
        totalConversations: conversations.total,
        aiTokensUsed: conversations.tokens,
        averageResponseTime: conversations.avgTime
      }
    };
  }
}
```

---

## 13. Troubleshooting Guide

### A. Common Platform Issues

```typescript
// Platform admin can't see all tenants
DEBUG: Check platform_users.role = 'owner'
SQL: SELECT * FROM platform_users WHERE id = 'user_id';
FIX: UPDATE platform_users SET role = 'owner' WHERE id = 'user_id';

// Sales team seeing wrong clients
DEBUG: Check sales_territories and assignments
SQL: SELECT * FROM sales_leads WHERE assigned_to = 'sales_user_id';
FIX: Verify territory assignments match client locations

// Revenue calculations incorrect
DEBUG: Check all revenue streams included
SQL: SELECT type, SUM(amount) FROM platform_revenue GROUP BY type;
FIX: Ensure all payment types are captured
```

### B. Tenant Isolation Issues

```typescript
// Tenant seeing other tenant's data
CRITICAL: Check JWT tenant_id claim
DEBUG: 
  const session = await supabase.auth.getSession();
  console.log('Tenant ID in token:', session.user.tenant_id);
  
VERIFY: RLS policies are enabled
SQL: 
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public';
  
FIX: Ensure all queries use authenticated client
```

### C. Performance Issues

```typescript
// Slow dashboard loading
DEBUG: Check query performance
SQL: 
  EXPLAIN ANALYZE 
  SELECT * FROM conversations 
  WHERE tenant_id = 'id' 
  ORDER BY created_at DESC 
  LIMIT 50;
  
FIX: Add appropriate indexes
SQL:
  CREATE INDEX idx_conversations_tenant_created 
  ON conversations(tenant_id, created_at DESC);
  
// High API response times
DEBUG: Check AI service latency
LOG: Track which AI service is slow
FIX: Adjust routing rules to favor faster services
```

---

## 14. Go-Live Checklist

### Pre-Launch Technical
- [ ] All RLS policies tested and verified
- [ ] API rate limiting configured
- [ ] Backup systems tested
- [ ] SSL certificates valid
- [ ] Environment variables secured
- [ ] Error tracking enabled
- [ ] Monitoring dashboards ready
- [ ] Load testing completed

### Pre-Launch Business
- [ ] Pricing plans finalized
- [ ] Terms of service ready
- [ ] Privacy policy compliant
- [ ] Support documentation complete
- [ ] Training videos recorded
- [ ] Launch email templates ready
- [ ] Payment processing tested
- [ ] Refund policy defined

### Launch Day
- [ ] Announce on social media
- [ ] Enable new user signups
- [ ] Monitor system health
- [ ] Support team on standby
- [ ] Track initial metrics
- [ ] Gather user feedback
- [ ] Celebrate! 🎉

---

## CRITICAL REMINDERS

1. **Data Isolation is Paramount**: Every query must respect tenant boundaries
2. **Platform vs Tenant Auth**: Never mix authentication systems
3. **RLS is Your Friend**: Let the database handle security
4. **Monitor Everything**: You can't improve what you don't measure
5. **Customer Success First**: Platform success follows customer success

This comprehensive roadmap ensures you can build a secure, scalable, multi-tenant SaaS platform with complete data isolation and proper user hierarchy. Each section can be worked on independently by different AI assistants using Claude Worktrees.