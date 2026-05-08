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
  Truck, 
  Package, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useGetFulfillmentsQuery, useUpdateFulfillmentMutation } from '@/store/api/fulfillmentApi';
import { toast } from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable 
} from '@tanstack/react-table';
import { Fulfillment, FulfillmentStatus } from '@/models/fulfillment';

const columnHelper = createColumnHelper<Fulfillment>();

export default function FulfillmentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FulfillmentStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  const [updateFulfillment, { isLoading: isUpdating }] = useUpdateFulfillmentMutation();

  const { data: response, isLoading, isFetching } = useGetFulfillmentsQuery({
    page,
    per_page: 10,
    search: debouncedSearch,
    status: status === 'all' ? undefined : status,
  });

  const fulfillments = response?.data || [];
  const meta = response?.meta || { total: 0, total_pages: 1 };

  const getStatusBadge = (status: FulfillmentStatus) => {
    const variants: Record<FulfillmentStatus, any> = {
      shipped: { variant: 'default', className: 'bg-blue-50 text-blue-700 border-blue-100' },
      delivered: { variant: 'default', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      pending: { variant: 'outline', className: 'bg-amber-50 text-amber-700 border-amber-100' },
      cancelled: { variant: 'secondary', className: 'bg-red-50 text-red-700 border-red-100' },
    };
    const style = variants[status] || variants.pending;
    return <Badge variant={style.variant} className={cn("capitalize text-[10px] px-2 py-0", style.className)}>{status}</Badge>;
  };

  const columns = [
    columnHelper.accessor('tracking_number', {
      header: 'Tracking',
      cell: info => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{info.getValue() || 'No tracking'}</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{info.row.original.tracking_company || 'Standard Shipping'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => getStatusBadge(info.getValue()),
    }),
    columnHelper.accessor('created_at', {
      header: 'Shipped Date',
      cell: info => (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-3 w-3" />
          <span className="text-xs font-medium">{format(new Date(info.getValue()), 'MMM d, yyyy')}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'items',
      header: 'Items',
      cell: info => (
        <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
          {info.row.original.line_items?.length || 0} Products
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: info => (
        <div className="flex items-center justify-end gap-2">
          {info.row.original.status !== 'delivered' && (
            <button 
              onClick={async () => {
                try {
                  await updateFulfillment({ 
                    id: info.row.original.id, 
                    body: { status: 'delivered' } 
                  }).unwrap();
                  toast.success('Shipment marked as delivered');
                } catch (err) {
                  toast.error('Failed to update status');
                }
              }}
              className="px-2 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md hover:bg-emerald-100 transition-all"
              title="Mark as Delivered"
            >
              Deliver
            </button>
          )}
          {info.row.original.tracking_url && (
            <a 
              href={info.row.original.tracking_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: fulfillments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <PageHeader
        title="Fulfillments"
        description="Track shipments and manage delivery status"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fulfillments' },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export Report</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-5 border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Transit</p>
              <h3 className="text-2xl font-bold text-gray-900">{fulfillments.filter(f => f.status === 'shipped').length}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivered</p>
              <h3 className="text-2xl font-bold text-gray-900">{fulfillments.filter(f => f.status === 'delivered').length}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p>
              <h3 className="text-2xl font-bold text-gray-900">{fulfillments.filter(f => f.status === 'pending').length}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-gray-100 shadow-sm bg-indigo-600 border-none">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Total Shipments</p>
              <h3 className="text-2xl font-bold text-white">{meta.total}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center gap-4 justify-between bg-gray-50/30">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-full max-w-sm">
              <SearchInput 
                placeholder="Search by tracking number or carrier..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 focus:border-indigo-500 focus:outline-none transition-all"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>Advanced Filters</Button>
        </div>

        {isLoading ? (
          <div className="p-8">
            <TableSkeleton columns={5} rows={8} />
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
                  {fulfillments.length === 0 ? (
                    <motion.tr 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td colSpan={columns.length} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Truck className="h-8 w-8 text-gray-200" />
                          <p className="text-sm font-bold text-gray-900">No shipments found</p>
                          <p className="text-xs text-gray-400">Try adjusting your filters or search terms</p>
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

        <div className="px-6 py-4 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs font-medium text-gray-400">
            Showing {fulfillments.length} of {meta.total} shipments
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
