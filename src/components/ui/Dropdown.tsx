'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  items: DropdownItem[];
  trigger?: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ items, trigger, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: align === 'right' ? rect.right + window.scrollX - 180 : rect.left + window.scrollX
      });
    }
  }, [open, align]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && 
          menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button onClick={() => setOpen(!open)} className="flex items-center">
        {trigger || (
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        )}
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 9999, pointerEvents: 'none' }}>
          <AnimatePresence>
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              style={{ top: coords.top, left: coords.left, pointerEvents: 'auto' }}
              className={cn(
                'absolute min-w-[180px] bg-white rounded-lg border border-gray-200 shadow-xl py-1'
              )}
            >
              {items.map((item, i) =>
                item.divider ? (
                  <div key={i} className="my-1 border-t border-gray-100" />
                ) : (
                  <button
                    key={i}
                    onClick={() => { item.onClick?.(); setOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                      item.danger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>,
        document.body
      )}
    </div>
  );
}
