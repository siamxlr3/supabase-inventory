'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ children, className, padding = 'md', hover = false }: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        paddingStyles[padding],
        hover && 'transition-shadow hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  iconBg?: string;
}

export function StatsCard({ title, value, change, changeType = 'neutral', icon, iconBg = 'bg-indigo-50' }: StatsCardProps) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-100',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full', changeColors[changeType])}>
              {change}
            </span>
          )}
        </div>
        {icon && (
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
