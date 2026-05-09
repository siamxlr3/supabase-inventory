'use client';

import React, { useState } from 'react';
import { PageHeader, Button, Badge, StatusBadge, TableSkeleton } from '@/components/ui';
import { SearchInput } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Plus, Download, Filter, RotateCcw, Package } from 'lucide-react';
import Link from 'next/link';
import { useGetRefundsQuery } from '@/store/api/refundApi';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';

export default function ReturnsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isFetching, refetch } = useGetRefundsQuery({
    page,
    search: debouncedSearch,
    status: status === 'all' ? undefined : status,
  });

  const refunds = data?.data || [];
  const totalPages = data?.meta?.total_pages || 1;


  return (
    <>
      <PageHeader
        title="Returns & Refunds"
        description="Manage customer returns, restocks, and refunds"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Returns' },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RotateCcw className={isFetching ? "animate-spin h-4 w-4" : "h-4 w-4"} />}>Refresh</Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export</Button>
            <Link href="/dashboard/returns/add">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Initiate Return</Button>
            </Link>
          </>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-full sm:w-72">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name or email..."
              />
            </div>
            <div className="flex items-center gap-2">
              <select 
                className="h-9 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                value={status || 'all'}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>More Filters</Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-5">
              <TableSkeleton columns={6} rows={5} />
            </div>
          ) : refunds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No returns found</h3>
              <p className="text-sm text-gray-500 max-w-[250px] mb-4">
                {search || status ? "No returns match your current filters." : "You haven't processed any returns yet."}
              </p>
              {(search || status) ? (
                <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatus('all'); }}>
                  Clear Filters
                </Button>
              ) : (
                <Link href="/dashboard/returns/add">
                  <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Initiate Return</Button>
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 font-medium text-gray-500 w-[120px]">Date</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Order</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Customer</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Restock</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-right">Amount</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-center w-[120px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {refunds.map((refund) => (
                  <tr 
                    key={refund.id} 
                    className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                    onClick={() => {}}
                  >
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {format(new Date(refund.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-indigo-600 hover:underline">
                        {refund.order?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {refund.customer ? `${refund.customer.first_name} ${refund.customer.last_name}` : 'Guest'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {refund.customer?.email || refund.order?.email || 'No email provided'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {refund.restock ? (
                        <Badge variant="success" className="text-[10px]">Restocked</Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px] bg-gray-100 text-gray-600 border-gray-200">No Restock</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-medium text-gray-900">${Number(refund.total_amount).toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge status={refund.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {refunds.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </>
  );
}
