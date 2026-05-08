'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, Search, Bell, ChevronDown, Settings, LogOut, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface NavbarProps {
  onMenuClick: () => void;
  collapsed: boolean;
}

export function Navbar({ onMenuClick, collapsed }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = [
    { id: 1, title: 'Low stock alert', desc: 'Widget A is below threshold', time: '2m ago', unread: true },
    { id: 2, title: 'New order received', desc: 'Order #1234 from John Doe', time: '15m ago', unread: true },
    { id: 3, title: 'Purchase order approved', desc: 'PO-2024-089 has been approved', time: '1h ago', unread: false },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-20 flex items-center justify-between px-4 lg:px-6 transition-all duration-200',
        collapsed ? 'lg:left-[72px]' : 'lg:left-[260px]',
        'left-0'
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-64 h-9 pl-9 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:bg-white focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 focus:outline-none transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {/* Mobile search */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="sm:hidden h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">2 new</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0',
                        n.unread && 'bg-indigo-50/30'
                      )}
                    >
                      <div className={cn('h-2 w-2 mt-1.5 rounded-full flex-shrink-0', n.unread ? 'bg-indigo-500' : 'bg-transparent')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500 truncate">{n.desc}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative ml-1">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 h-9 px-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-600">AD</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-tight">Admin</p>
              <p className="text-[10px] text-gray-400 leading-tight">admin@versity.com</p>
            </div>
            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-gray-400" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-50"
              >
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User className="h-4 w-4 text-gray-400" /> Profile
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Settings className="h-4 w-4 text-gray-400" /> Settings
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
