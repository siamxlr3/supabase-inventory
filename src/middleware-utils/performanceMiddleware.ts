import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function performanceMiddleware(req: Request, next: () => Promise<NextResponse>) {
  const start = Date.now();
  const response = await next();
  const duration = Date.now() - start;
  
  logger.performance(req.method, req.url, duration);
  
  return response;
}
