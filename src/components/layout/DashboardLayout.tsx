'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Navbar onMenuClick={() => setMobileOpen(true)} collapsed={collapsed} />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-200',
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        )}
      >
        <div className="p-4 lg:p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
