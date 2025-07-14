import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to identify tenant from subdomain or path
 * Examples:
 * - hilton.yourdomain.com → tenant: hilton
 * - yourdomain.com/acme-hardware → tenant: acme-hardware
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  
  // Skip middleware for static files and api routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Extract tenant from subdomain
  const subdomain = hostname.split('.')[0]
  const isLocalhost = hostname.includes('localhost')
  
  // For localhost development, use path-based tenant identification
  if (isLocalhost) {
    // Check if we're already on a tenant path
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const possibleTenant = pathSegments[0]
    
    // If on main domain without tenant, show landing page
    if (!possibleTenant || possibleTenant === 'auth') {
      return NextResponse.next()
    }
    
    // Store tenant in header for use in components
    const response = NextResponse.next()
    response.headers.set('x-tenant-id', possibleTenant)
    return response
  }
  
  // For production, use subdomain
  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    const response = NextResponse.next()
    response.headers.set('x-tenant-id', subdomain)
    return response
  }
  
  return NextResponse.next()
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