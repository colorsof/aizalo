# Google OAuth Setup Guide

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Access to your Supabase project dashboard
3. Your application's production URL

## Step 1: Set up Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "Aizalo"
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `email` and `profile`
   - Add test users if in development
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "Aizalo Web Client"
   - Authorized JavaScript origins:
     ```
     https://furycwybjowxkkzjjdln.supabase.co
     http://localhost:3000 (for development)
     https://your-production-domain.com
     ```
   - Authorized redirect URIs:
     ```
     https://furycwybjowxkkzjjdln.supabase.co/auth/v1/callback
     http://localhost:54321/auth/v1/callback (for local development)
     ```
7. Save and copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/furycwybjowxkkzjjdln)
2. Navigate to **Authentication** > **Providers**
3. Find **Google** in the list and enable it
4. Enter your Google OAuth credentials:
   - Client ID: `[Your Google Client ID]`
   - Client Secret: `[Your Google Client Secret]`
5. Click **Save**

## Step 3: Update Environment Variables

Update your `.env.local` file:

```env
# Google OAuth (Optional - only needed if using custom flows)
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
```

## Step 4: Test the Integration

### Platform User Login
```bash
# Navigate to:
http://localhost:3000/api/auth/platform/google
```

### Tenant User Login
```bash
# Navigate to (replace 'demo' with actual subdomain):
http://localhost:3000/api/auth/tenant/google?subdomain=demo
```

## Step 5: Create Login Components

Create login buttons for your UI:

### Platform Login Button
```tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function GoogleLoginButton() {
  const supabase = createClientComponentClient();
  
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/platform/google`,
      }
    });
    
    if (error) {
      console.error('Error:', error.message);
    }
  };
  
  return (
    <button onClick={handleGoogleLogin}>
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        {/* Google icon SVG */}
      </svg>
      Continue with Google
    </button>
  );
}
```

### Tenant Login Button
```tsx
function TenantGoogleLoginButton({ subdomain }: { subdomain: string }) {
  const supabase = createClientComponentClient();
  
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/tenant/google?subdomain=${subdomain}`,
      }
    });
    
    if (error) {
      console.error('Error:', error.message);
    }
  };
  
  return (
    <button onClick={handleGoogleLogin}>
      Continue with Google
    </button>
  );
}
```

## Troubleshooting

1. **"Redirect URI mismatch" error**
   - Ensure the redirect URI in Google Console matches exactly
   - Check for trailing slashes
   - Verify the protocol (http vs https)

2. **"Invalid client" error**
   - Double-check Client ID and Secret in Supabase
   - Ensure the OAuth client is not in a disabled state

3. **User not created after login**
   - Check the auth trigger is working (migration 014)
   - Verify RLS policies allow insertion
   - Check browser console for errors

## Security Considerations

1. **Domain Restrictions**: For platform users, consider restricting to specific email domains
2. **Self-Registration**: For tenants, control via `tenant_settings` table
3. **Rate Limiting**: Implement rate limiting on auth endpoints
4. **Audit Logging**: All OAuth logins are logged in `system_logs` table

## Next Steps

1. Add more OAuth providers (GitHub, Microsoft, etc.)
2. Implement Single Sign-On (SSO) for enterprise tenants
3. Add two-factor authentication (2FA)
4. Set up email verification for password-based signups