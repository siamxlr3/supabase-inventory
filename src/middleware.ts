import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiter } from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const { pathname } = request.nextUrl;

  // 1. Rate Limiting for API routes
  if (pathname.startsWith('/api')) {
    const ip = request.ip || 'anonymous';
    const isAllowed = rateLimiter(ip);
    
    if (!isAllowed) {
      logger.warn(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429 }
      );
    }
  }

  const response = NextResponse.next();

  // 2. Security Headers (Simulating Helmet)
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // 3. Performance Logging
  const duration = Date.now() - start;
  logger.performance(request.method, request.url, duration);

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
