'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  outline: 'border border-gray-300 text-gray-600 bg-white',
};

const sizeStyles = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
};

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    draft: { variant: 'outline', label: 'Draft' },
    pending: { variant: 'warning', label: 'Pending' },
    completed: { variant: 'success', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    shipped: { variant: 'info', label: 'Shipped' },
    delivered: { variant: 'success', label: 'Delivered' },
    processing: { variant: 'info', label: 'Processing' },
    low: { variant: 'danger', label: 'Low Stock' },
    'in-stock': { variant: 'success', label: 'In Stock' },
    'out-of-stock': { variant: 'danger', label: 'Out of Stock' },
    approved: { variant: 'success', label: 'Approved' },
    rejected: { variant: 'danger', label: 'Rejected' },
    refunded: { variant: 'warning', label: 'Refunded' },
    fulfilled: { variant: 'success', label: 'Fulfilled' },
    unfulfilled: { variant: 'warning', label: 'Unfulfilled' },
    partial: { variant: 'info', label: 'Partial' },
    received: { variant: 'success', label: 'Received' },
    ordered: { variant: 'info', label: 'Ordered' },
  };
  const c = config[status] || { variant: 'default' as const, label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
