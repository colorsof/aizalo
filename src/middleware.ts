import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware for authentication and tenant identification
 * Handles both platform and tenant authentication
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''
  
  // Extract subdomain
  const subdomain = host.split('.')[0]
  const isSubdomain = subdomain && subdomain !== 'localhost' && subdomain !== 'www' && subdomain !== 'app'
  
  // Platform routes (no subdomain)
  const isPlatformRoute = pathname.startsWith('/admin') || 
                         pathname.startsWith('/sales') || 
                         pathname.startsWith('/api/platform')
  
  // Tenant routes (with subdomain or /[tenant] paths)
  const isTenantRoute = isSubdomain || 
                       pathname.startsWith('/api/tenant') || 
                       (pathname.match(/^\/[^\/]+\/(dashboard|settings|api)/) && !isPlatformRoute)
  
  // Auth API routes (public)
  const isAuthRoute = pathname.startsWith('/api/auth')
  
  // Public routes
  const isPublicRoute = pathname === '/' || 
                       pathname.startsWith('/login') || 
                       pathname.startsWith('/register') ||
                       pathname.startsWith('/pricing') ||
                       pathname.startsWith('/about') ||
                       isAuthRoute
  
  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Skip middleware for public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Create Supabase client
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          response.cookies.delete(name)
        },
      },
    }
  )
  
  // Get session
  const { data: { session }, error } = await supabase.auth.getSession()
  
  // Platform route protection
  if (isPlatformRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check if user is a platform user
    const userType = session.user.user_metadata?.userType
    if (userType !== 'platform') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check role-based access
    const role = session.user.user_metadata?.role
    if (pathname.startsWith('/admin') && !['owner', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/sales', request.url))
    }
    
    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', session.user.id)
    requestHeaders.set('x-user-email', session.user.email || '')
    requestHeaders.set('x-user-role', role || '')
    requestHeaders.set('x-user-type', 'platform')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
      headers: response.headers,
    })
  }
  
  // Tenant route protection
  if (isTenantRoute) {
    if (!session) {
      const loginUrl = isSubdomain ? `https://${host}/login` : '/login'
      return NextResponse.redirect(new URL(loginUrl, request.url))
    }
    
    // Check if user is a tenant user
    const userType = session.user.user_metadata?.userType
    if (userType !== 'tenant') {
      const loginUrl = isSubdomain ? `https://${host}/login` : '/login'
      return NextResponse.redirect(new URL(loginUrl, request.url))
    }
    
    // Get tenant ID from metadata
    const tenantId = session.user.user_metadata?.tenantId
    
    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', session.user.id)
    requestHeaders.set('x-user-email', session.user.email || '')
    requestHeaders.set('x-user-role', session.user.user_metadata?.role || '')
    requestHeaders.set('x-user-type', 'tenant')
    requestHeaders.set('x-tenant-id', tenantId || '')
    if (isSubdomain) {
      requestHeaders.set('x-subdomain', subdomain)
    }
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
      headers: response.headers,
    })
  }
  
  // For other routes, just pass through with tenant info if available
  if (isSubdomain) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant-id', subdomain)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
      headers: response.headers,
    })
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}