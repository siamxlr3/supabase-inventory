'use client';

import React, { useState } from 'react';
import { PageHeader, Button, Card } from '@/components/ui';
import { 
  PlusCircle, 
  ShoppingCart, 
  TrendingUp, 
  Truck,
  PackageCheck,
  Package
} from 'lucide-react';
import Link from 'next/link';
import { useGetPurchaseOrdersQuery, useDeletePurchaseOrderMutation } from '@/store/api/purchaseOrderApi';
import { POTable } from '@/components/purchase-orders/POTable';
import { POFilters } from '@/components/purchase-orders/POFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, isFetching } = useGetPurchaseOrdersQuery({
    page,
    search: debouncedSearch,
    status: status === 'all' ? undefined : status as any,
    from_date: fromDate,
    to_date: toDate
  });

  const [deleteOrder] = useDeletePurchaseOrderMutation();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this draft PO?')) {
      try {
        await deleteOrder(id).unwrap();
        toast.success('Purchase order deleted');
      } catch (err) {
        toast.error('Failed to delete order');
      }
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const stats = [
    { label: 'Total POs', value: response?.meta?.total || 0, icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Draft', value: response?.data?.filter(o => o.status === 'draft').length || 0, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Received', value: response?.data?.filter(o => o.status === 'received').length || 0, icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Purchase Orders" 
        description="Manage procurement, track incoming shipments, and receive warehouse stock."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase Orders' }
        ]}
        actions={
          <Link href="/dashboard/purchase-orders/add">
            <Button 
              className="rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all"
              leftIcon={<PlusCircle className="h-4 w-4" />}
            >
              New Purchase Order
            </Button>
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 border-none shadow-sm hover:shadow-md transition-all flex items-center gap-4">
              <div className={`h-12 w-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <POFilters 
        search={search} setSearch={setSearch}
        status={status} setStatus={setStatus}
        fromDate={fromDate} setFromDate={setFromDate}
        toDate={toDate} setToDate={setToDate}
        onClear={handleClearFilters}
      />

      <POTable 
        orders={response?.data || []}
        isLoading={isLoading || isFetching}
        onDelete={handleDelete}
      />
    </div>
  );
}
