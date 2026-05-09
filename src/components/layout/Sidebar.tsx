'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Warehouse,
  ClipboardList,
  AlertTriangle,
  ShoppingCart,
  Truck,
  RotateCcw,
  FileText,
  Users,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  Box,
  Plus,
  Layers,
  ListOrdered,
  Clock,
  Send,
  PackageCheck,
  UserCheck,
  Activity,
  ShieldCheck,
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  X,
} from 'lucide-react';

interface SubItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: SubItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { label: 'Products', href: '/dashboard/products', icon: <Package className="h-[18px] w-[18px]" /> },
      { label: 'Locations', href: '/dashboard/locations', icon: <MapPin className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Overview', href: '/dashboard/inventory', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
      { label: 'Stock Levels', href: '/dashboard/inventory/by-product', icon: <Warehouse className="h-[18px] w-[18px]" /> },
      { label: 'Adjustments', href: '/dashboard/inventory/adjustments', icon: <ClipboardList className="h-[18px] w-[18px]" /> },
      { label: 'Low Stock Alerts', href: '/dashboard/inventory/low-stock', icon: <AlertTriangle className="h-[18px] w-[18px]" />, badge: '5' },
    ],
  },
  {
    title: 'Orders',
    items: [
      { label: 'Orders', href: '/dashboard/orders', icon: <ShoppingCart className="h-[18px] w-[18px]" /> },
      { label: 'Fulfillments', href: '/dashboard/fulfillments', icon: <Truck className="h-[18px] w-[18px]" /> },
      { label: 'Returns & Refunds', href: '/dashboard/returns', icon: <RotateCcw className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    title: 'Procurement',
    items: [
      { label: 'Purchase Orders', href: '/dashboard/purchase-orders', icon: <FileText className="h-[18px] w-[18px]" /> },
      { label: 'Suppliers', href: '/dashboard/suppliers', icon: <PackageCheck className="h-[18px] w-[18px]" /> },
      { label: 'Customers', href: '/dashboard/customers', icon: <Users className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Inventory Report', href: '/dashboard/reports/inventory', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
      { label: 'Order Report', href: '/dashboard/reports/orders', icon: <Activity className="h-[18px] w-[18px]" /> },
      { label: 'Audit Log', href: '/dashboard/reports/audit', icon: <ShieldCheck className="h-[18px] w-[18px]" /> },
    ],
  },
];

function SidebarItem({ item, collapsed }: { item: MenuItem; collapsed: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => {
    if (item.children) {
      return item.children.some((child) => pathname === child.href);
    }
    return false;
  });

  const isActive = item.href ? pathname === item.href : item.children?.some((c) => pathname === c.href);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
            isActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          )}
        >
          <span className={cn(isActive ? 'text-indigo-600' : 'text-gray-400')}>{item.icon}</span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{item.badge}</span>
              )}
              <ChevronDown className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', open && 'rotate-180')} />
            </>
          )}
        </button>
        <AnimatePresence initial={false}>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="ml-4 pl-3 border-l border-gray-200 mt-1 space-y-0.5">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors',
                      pathname === child.href
                        ? 'text-indigo-700 font-medium bg-indigo-50/50'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    )}
                  >
                    {child.icon && <span className={cn(pathname === child.href ? 'text-indigo-500' : 'text-gray-400')}>{child.icon}</span>}
                    {child.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
        isActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      <span className={cn(isActive ? 'text-indigo-600' : 'text-gray-400')}>{item.icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{item.badge}</span>
          )}
        </>
      )}
    </Link>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Box className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">Versity</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Box className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {menuSections.map((section, i) => (
          <div key={i}>
            {section.title && !collapsed && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
                {section.title}
              </p>
            )}
            {collapsed && section.title && <div className="border-t border-gray-100 my-2" />}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItem key={item.label} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="hidden lg:flex items-center justify-center border-t border-gray-100 p-3">
        <button
          onClick={onToggle}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-30 transition-all duration-200',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-gray-200 z-50 lg:hidden"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-3 h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
