'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function Loader({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600', sizes[size])} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader size="lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-100 rounded-t-lg mb-1" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 px-4 border-b border-gray-100">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
