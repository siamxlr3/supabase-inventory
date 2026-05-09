'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  Button, 
  Badge, 
  TableSkeleton,
  Card 
} from '@/components/ui';
import { SearchInput } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { 
  Plus, 
  Download, 
  Filter, 
  Eye, 
  Trash2, 
  ShoppingCart, 
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CreditCard,
  Truck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetOrdersQuery, useDeleteOrderMutation } from '@/store/api/orderApi';
import { toast } from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable 
} from '@tanstack/react-table';
import { Order, FinancialStatus, FulfillmentStatus } from '@/models/order';
import { cn } from '@/lib/utils';
import { useRealtime } from '@/hooks/useRealtime';

const columnHelper = createColumnHelper<Order>();

export default function OrdersPage() {
  // Real-time subscription
  useRealtime('orders', ['Order']);

  const router = useRouter();
  const [search, setSearch] = useState('');
  const [financialStatus, setFinancialStatus] = useState<FinancialStatus | 'all'>('all');
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, isFetching, refetch } = useGetOrdersQuery({
    page,
    search: debouncedSearch,
    financial_status: financialStatus === 'all' ? undefined : financialStatus,
    fulfillment_status: fulfillmentStatus === 'all' ? undefined : fulfillmentStatus,
    from_date: fromDate,
    to_date: toDate
  });

  const [deleteOrder] = useDeleteOrderMutation();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id).unwrap();
        toast.success('Order deleted successfully');
      } catch (err) {
        toast.error('Failed to delete order');
      }
    }
  };

  const orders = response?.data || [];
  const meta = response?.meta || { total: 0, total_pages: 1 };

  const getFinancialBadge = (status: FinancialStatus) => {
    const variants: Record<FinancialStatus, any> = {
      paid: { variant: 'default', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      pending: { variant: 'outline', className: 'bg-amber-50 text-amber-700 border-amber-100' },
      authorized: { variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-100' },
      partially_paid: { variant: 'outline', className: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
      refunded: { variant: 'secondary', className: 'bg-gray-100 text-gray-700 border-gray-200' },
      voided: { variant: 'secondary', className: 'bg-red-50 text-red-700 border-red-100' },
      partially_refunded: { variant: 'outline', className: 'bg-orange-50 text-orange-700 border-orange-100' },
    };
    const style = variants[status] || variants.pending;
    return <Badge variant={style.variant} className={cn("capitalize text-[10px] px-2 py-0", style.className)}>{status.replace('_', ' ')}</Badge>;
  };

  const getFulfillmentBadge = (status: FulfillmentStatus) => {
    const variants: Record<FulfillmentStatus, any> = {
      fulfilled: { className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      unfulfilled: { className: 'bg-rose-50 text-rose-700 border-rose-100' },
      partially_fulfilled: { className: 'bg-amber-50 text-amber-700 border-amber-100' },
      restocked: { className: 'bg-gray-100 text-gray-700 border-gray-200' },
      voided: { className: 'bg-red-50 text-red-700 border-red-100' },
    };
    const style = variants[status] || variants.unfulfilled;
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider", style.className)}>
        <span className={cn("h-1 w-1 rounded-full", status === 'fulfilled' ? 'bg-emerald-500' : 'bg-current')} />
        {status.replace('_', ' ')}
      </div>
    );
  };

  const columns = [
    columnHelper.accessor('name', {
      header: 'Order',
      cell: info => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{info.getValue()}</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">
            {format(new Date(info.row.original.created_at), 'MMM d, h:mm a')}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Customer',
      cell: info => {
        const order = info.row.original as any;
        return (
          <div className="flex flex-col max-w-[180px]">
            <span className="text-sm font-medium text-gray-900 truncate">
              {order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Guest'}
            </span>
            <span className="text-xs text-gray-500 truncate">{info.getValue()}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('financial_status', {
      header: 'Payment',
      cell: info => getFinancialBadge(info.getValue()),
    }),
    columnHelper.accessor('fulfillment_status', {
      header: 'Fulfillment',
      cell: info => getFulfillmentBadge(info.getValue()),
    }),
    columnHelper.accessor('total_price', {
      header: 'Total',
      cell: info => (
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-gray-900">${parseFloat(info.getValue().toString()).toFixed(2)}</span>
          <span className="text-[10px] text-gray-400">{info.row.original.line_items?.length || 0} items</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: info => (
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={() => router.push(`/dashboard/orders/${info.row.original.id}`)}
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleDelete(info.row.original.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <PageHeader
        title="Orders"
        description="Manage customer orders and fulfillment"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders' },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RotateCcw className={isFetching ? "animate-spin h-4 w-4" : "h-4 w-4"} />}>Refresh</Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export</Button>
            <Link href="/dashboard/orders/add">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Create Order</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{meta.total}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Payment</p>
              <h3 className="text-2xl font-bold text-gray-900">{orders.filter(o => o.financial_status === 'pending').length}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unfulfilled</p>
              <h3 className="text-2xl font-bold text-gray-900">{orders.filter(o => o.fulfillment_status === 'unfulfilled').length}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-gray-100 shadow-sm bg-white text-white bg-indigo-600 border-none">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Revenue</p>
              <h3 className="text-2xl font-bold text-white">
                ${orders.reduce((sum, o) => sum + (o.financial_status === 'paid' ? parseFloat(o.total_price.toString()) : 0), 0).toFixed(2)}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center gap-4 justify-between bg-gray-50/30">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-full max-w-sm">
              <SearchInput 
                placeholder="Search orders by name or email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <select 
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 focus:border-indigo-500 focus:outline-none transition-all"
                value={financialStatus}
                onChange={(e) => setFinancialStatus(e.target.value as any)}
              >
                <option value="all">Payment Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="authorized">Authorized</option>
                <option value="refunded">Refunded</option>
              </select>
              <select 
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 focus:border-indigo-500 focus:outline-none transition-all"
                value={fulfillmentStatus}
                onChange={(e) => setFulfillmentStatus(e.target.value as any)}
              >
                <option value="all">Fulfillment</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="unfulfilled">Unfulfilled</option>
                <option value="partially_fulfilled">Partial</option>
              </select>
              <div className="flex items-center gap-2 ml-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
                  <input 
                      type="date" 
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-medium focus:border-indigo-500 focus:outline-none"
                  />
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
                  <input 
                      type="date" 
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-medium focus:border-indigo-500 focus:outline-none"
                  />
              </div>
              <Button variant="outline" size="sm" onClick={() => { setFromDate(''); setToDate(''); }} className="text-gray-400">Clear</Button>
            </div>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>Advanced</Button>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-8">
            <TableSkeleton columns={6} rows={8} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b border-gray-50 bg-gray-50/30">
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {orders.length === 0 ? (
                    <motion.tr 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={columns.length} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-gray-200" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-900">No orders found</p>
                            <p className="text-xs text-gray-400">Try adjusting your filters or search terms</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => { setSearch(''); setFinancialStatus('all'); setFulfillmentStatus('all'); }}>Clear All Filters</Button>
                        </div>
                      </td>
                    </motion.tr>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <motion.tr 
                        key={row.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-6 py-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs font-medium text-gray-400">
            Showing {orders.length} of {meta.total} orders
          </p>
          <Pagination 
            currentPage={page} 
            totalPages={meta.total_pages} 
            onPageChange={setPage} 
          />
        </div>
      </div>
    </>
  );
}
