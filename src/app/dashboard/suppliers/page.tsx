'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  Button, 
  Modal,
  Card
} from '@/components/ui';
import { 
  Plus, 
  Building2, 
  Users, 
  Activity, 
  Globe,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { 
  useGetSuppliersQuery, 
  useDeleteSupplierMutation 
} from '@/store/api/supplierApi';
import { Supplier } from '@/models/supplier';
import { SupplierTable } from '@/components/suppliers/SupplierTable';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { SupplierFilters } from '@/components/suppliers/SupplierFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function SuppliersPage() {
  // State for Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);

  // API Queries
  const { data: response, isLoading, isFetching } = useGetSuppliersQuery({
    page,
    search: debouncedSearch,
    status: status === 'all' ? undefined : status as any,
    from_date: fromDate,
    to_date: toDate
  });

  const [deleteSupplier] = useDeleteSupplierMutation();

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id).unwrap();
        toast.success('Supplier deleted successfully');
      } catch (err) {
        toast.error('Failed to delete supplier');
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSupplier(undefined);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const stats = [
    { label: 'Total Suppliers', value: response?.meta?.total || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active', value: response?.data?.filter(s => s.status === 'active').length || 0, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Currencies', value: new Set(response?.data?.map(s => s.currency_code)).size || 0, icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Supplier Management" 
        description="Monitor and manage your vendor relationships and procurement terms."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Suppliers' }
        ]}
        actions={
          <Link href="/dashboard/suppliers/add">
            <Button 
              className="rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all"
              leftIcon={<PlusCircle className="h-4 w-4" />}
            >
              New Supplier
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

      {/* Filters Section */}
      <SupplierFilters 
        search={search} setSearch={setSearch}
        status={status} setStatus={setStatus}
        fromDate={fromDate} setFromDate={setFromDate}
        toDate={toDate} setToDate={setToDate}
        onClear={handleClearFilters}
      />

      {/* Table Section */}
      <SupplierTable 
        suppliers={response?.data || []}
        isLoading={isLoading || isFetching}
        onDelete={handleDelete}
      />
    </div>
  );
}
