'use client';

import React from 'react';
import { 
  Badge, 
  Button, 
  Dropdown,
  Loader
} from '@/components/ui';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Building2, 
  Mail, 
  Phone,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Supplier } from '@/models/supplier';
import { motion, AnimatePresence } from 'framer-motion';

interface SupplierTableProps {
  suppliers: Supplier[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export const SupplierTable: React.FC<SupplierTableProps> = ({ 
  suppliers, 
  isLoading, 
  onDelete 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center space-y-4">
        <Loader size="lg" className="text-indigo-600" />
        <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Loading Suppliers...</p>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <Building2 className="h-8 w-8 text-gray-200" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No Suppliers Found</h3>
        <p className="text-sm text-gray-400 max-w-xs mt-1">Try adjusting your filters or add a new supplier to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supplier Details</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Info</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Currency</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence>
              {suppliers.map((supplier, index) => (
                <motion.tr 
                  key={supplier.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold group-hover:scale-110 transition-transform">
                        {supplier.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{supplier.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Joined {new Date(supplier.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {supplier.email}
                      </div>
                      {supplier.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Phone className="h-3 w-3" />
                          {supplier.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className="font-mono text-xs">{supplier.currency_code}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge 
                      variant={supplier.status === 'active' ? 'success' : 'default'}
                      className="capitalize"
                    >
                      {supplier.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/dashboard/suppliers/${supplier.id}/edit`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:shadow-sm"
                        >
                          <Edit className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:text-red-500 hover:shadow-sm"
                        onClick={() => onDelete(supplier.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};
