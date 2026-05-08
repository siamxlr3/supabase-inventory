'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  className,
  label,
  error,
  leftIcon,
  rightIcon,
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          className={cn(
            'w-full h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <Input
      leftIcon={<Search className="h-4 w-4" />}
      placeholder="Search..."
      className={className}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export function Select({ className, label, error, options, id, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'w-full h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ className, label, error, id, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none',
          error && 'border-red-500',
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
