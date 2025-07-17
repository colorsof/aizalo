/**
 * Rate limiter for API endpoints
 * Uses in-memory storage (consider Redis for production)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  
  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  /**
   * Check if request should be rate limited
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @returns true if request should be blocked
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);
    
    // No previous requests
    if (!entry) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }
    
    // Window has expired
    if (now > entry.resetTime) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }
    
    // Within window
    entry.count++;
    
    if (entry.count > this.maxRequests) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get remaining requests for identifier
   */
  getRemainingRequests(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }
  
  /**
   * Get reset time for identifier
   */
  getResetTime(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.windowMs;
    }
    return entry.resetTime;
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    this.limits.forEach((entry, key) => {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    });
  }
}

// Rate limiter instances for different endpoint types
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes
export const apiRateLimiter = new RateLimiter(60 * 1000, 100); // 100 requests per minute
export const strictRateLimiter = new RateLimiter(60 * 60 * 1000, 3); // 3 requests per hour (password reset)

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string {
  // Check various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default
  return 'unknown';
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(identifier: string, limiter: RateLimiter) {
  const resetTime = limiter.getResetTime(identifier);
  const remaining = limiter.getRemainingRequests(identifier);
  
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': limiter['maxRequests'].toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
      },
    }
  );
}