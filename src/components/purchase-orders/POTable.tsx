'use client';

import React from 'react';
import { Badge, Button, Loader } from '@/components/ui';
import { 
  ArrowRight,
  Trash2,
  Package,
  CheckCircle2,
  Clock,
  Building2,
  MapPin
} from 'lucide-react';
import { PurchaseOrder, PurchaseOrderStatus } from '@/models/purchaseOrder';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface POTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

const statusConfig: Record<PurchaseOrderStatus, { label: string; variant: any }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  sent: { label: 'Sent', variant: 'info' },
  partial: { label: 'Partial', variant: 'warning' },
  received: { label: 'Received', variant: 'success' },
  closed: { label: 'Closed', variant: 'outline' },
};

export const POTable: React.FC<POTableProps> = ({ orders, isLoading, onDelete }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center space-y-4">
        <Loader size="lg" className="text-indigo-600" />
        <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-gray-200" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No Purchase Orders</h3>
        <p className="text-sm text-gray-400 max-w-xs mt-1">Create your first purchase order to start tracking incoming stock.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reference / Supplier</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Amount</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence>
              {orders.map((order, index) => {
                const status = statusConfig[order.status] || statusConfig.draft;
                return (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">{order.name}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium mt-1">
                          <Building2 className="h-3 w-3" />
                          {order.supplier?.name || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                        {order.destination?.name || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-gray-900">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code || 'USD' }).format(order.total_cost)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge 
                        variant={status.variant}
                        className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      >
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/purchase-orders/${order.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        {order.status !== 'received' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:text-red-500 hover:shadow-sm"
                            onClick={() => onDelete(order.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};
