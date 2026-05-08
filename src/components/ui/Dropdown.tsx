'use client';

import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  align: 'start' | 'end';
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export function Dropdown({ children, align = 'end' }: { children: React.ReactNode; align?: 'start' | 'end' }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef, align }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({ children }: { children: React.ReactNode }) {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownTrigger must be used within Dropdown');

  return (
    <div 
      ref={context.triggerRef} 
      onClick={() => context.setOpen(!context.open)}
      className="cursor-pointer"
    >
      {children}
    </div>
  );
}

export function DropdownContent({ children }: { children: React.ReactNode }) {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownContent must be used within Dropdown');
  
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (context.open && context.triggerRef.current) {
      const rect = context.triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      setCoords({
        top: rect.bottom + scrollY + 4,
        left: context.align === 'end' 
          ? rect.right + scrollX - (contentRef.current?.offsetWidth || 180)
          : rect.left + scrollX
      });
    }
  }, [context.open, context.align]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (context.triggerRef.current && !context.triggerRef.current.contains(e.target as Node) &&
          contentRef.current && !contentRef.current.contains(e.target as Node)) {
        context.setOpen(false);
      }
    };
    if (context.open) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [context.open]);

  return (
    typeof document !== 'undefined' && createPortal(
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 9999, pointerEvents: 'none' }}>
        <AnimatePresence>
          {context.open && (
            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              style={{ top: coords.top, left: coords.left, pointerEvents: 'auto' }}
              className="absolute min-w-[180px] bg-white rounded-xl border border-gray-100 shadow-xl py-1.5 focus:outline-none"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>,
      document.body
    )
  );
}

export function DropdownItem({ 
  children, 
  onClick, 
  className,
  danger 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  danger?: boolean;
}) {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownItem must be used within Dropdown');

  return (
    <button
      onClick={() => {
        onClick?.();
        context.setOpen(false);
      }}
      className={cn(
        'w-full flex items-center px-4 py-2 text-sm transition-colors text-left',
        danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50',
        className
      )}
    >
      {children}
    </button>
  );
}
