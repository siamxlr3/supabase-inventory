'use client';

import React, { useState, useMemo } from 'react';
import { 
  PageHeader, 
  Button, 
  Card, 
  StatsCard, 
  StatusBadge, 
  TableSkeleton,
  SearchInput 
} from '@/components/ui';
import { 
  Plus, 
  RotateCcw, 
  Download, 
  Users, 
  UserCheck, 
  UserPlus,
  Mail,
  Phone,
  MoreVertical,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useGetCustomersQuery, 
  useDeleteCustomerMutation,
  useUpdateCustomerMutation 
} from '@/store/api/customerApi';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  createColumnHelper 
} from '@tanstack/react-table';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Customer } from '@/models/customer';
import { Pagination } from '@/components/ui/Pagination';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/Dropdown';
import { motion, AnimatePresence } from 'framer-motion';

const columnHelper = createColumnHelper<Customer>();

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  
  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, isFetching, refetch } = useGetCustomersQuery({
    page,
    per_page: 10,
    search: debouncedSearch,
    status: status === 'all' ? undefined : (status as any),
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const [deleteCustomer] = useDeleteCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  const customers = response?.data || [];
  const meta = response?.meta || { total: 0, total_pages: 1 };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id).unwrap();
        toast.success('Customer deleted successfully');
      } catch (err) {
        // Error handled by baseApi
      }
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: 'name',
      header: 'Customer',
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
            {info.row.original.first_name[0]}{info.row.original.last_name[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 leading-tight">{info.getValue()}</span>
            <span className="text-[11px] text-gray-500 mt-0.5">{info.row.original.email}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('phone', {
      header: 'Contact',
      cell: (info) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Phone className="h-3 w-3 text-gray-400" />
            <span>{info.getValue() || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Mail className="h-3 w-3 text-gray-400" />
            <span className="truncate max-w-[150px]">{info.row.original.email}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('address', {
      header: 'Location',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-700 truncate max-w-[200px]">{info.getValue() || '—'}</span>
          <span className="text-[10px] text-gray-400 uppercase font-medium">{info.row.original.city}, {info.row.original.country}</span>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <button 
          onClick={async () => {
            try {
              await updateCustomer({ 
                id: info.row.original.id, 
                body: { status: info.getValue() === 'active' ? 'inactive' : 'active' } 
              }).unwrap();
              toast.success(`Customer set to ${info.getValue() === 'active' ? 'inactive' : 'active'}`);
            } catch (err) {}
          }}
          className="transition-opacity hover:opacity-80"
        >
          <StatusBadge status={info.getValue()} />
        </button>
      ),
    }),
    columnHelper.accessor('fulfills_online_orders', {
      header: 'Fulfillment',
      cell: (info) => (
        <button
          onClick={async () => {
            try {
              await updateCustomer({ 
                id: info.row.original.id, 
                body: { fulfills_online_orders: !info.getValue() } 
              }).unwrap();
              toast.success(`Online fulfillment ${!info.getValue() ? 'enabled' : 'disabled'}`);
            } catch (err) {}
          }}
          className={cn(
            "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter transition-all",
            info.getValue() 
              ? "bg-indigo-50 text-indigo-600 border border-indigo-100" 
              : "bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100"
          )}
        >
          {info.getValue() ? 'Online' : 'Standard'}
        </button>
      ),
    }),
    columnHelper.accessor('created_at', {
      header: 'Joined',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-700">{format(new Date(info.getValue()), 'MMM d, yyyy')}</span>
          <span className="text-[10px] text-gray-400">{format(new Date(info.getValue()), 'h:mm a')}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex justify-end">
          <Dropdown align="end">
            <DropdownTrigger>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem onClick={() => {}}>
                <Link href={`/dashboard/customers/${info.row.original.id}/edit`} className="flex items-center gap-2 w-full">
                  <Edit className="h-3.5 w-3.5" />
                  Edit Profile
                </Link>
              </DropdownItem>
              <DropdownItem className="text-red-600" onClick={() => handleDelete(info.row.original.id)}>
                <div className="flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </div>
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your customer relationships and order history"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Customers' },
        ]}
        actions={
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              leftIcon={<RotateCcw className={isFetching ? "animate-spin h-4 w-4" : "h-4 w-4"} />}
            >
              Refresh
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export</Button>
            <Link href="/dashboard/customers/add">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Customer</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Total Customers" 
          value={meta.total} 
          icon={<Users className="h-5 w-5 text-indigo-600" />} 
          iconBg="bg-indigo-50"
        />
        <StatsCard 
          title="Active Members" 
          value={customers.filter(c => c.status === 'active').length} 
          icon={<UserCheck className="h-5 w-5 text-green-600" />} 
          iconBg="bg-green-50"
          change="+12% from last month"
          changeType="positive"
        />
        <StatsCard 
          title="New This Month" 
          value="24" 
          icon={<UserPlus className="h-5 w-5 text-orange-600" />} 
          iconBg="bg-orange-50"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search by name, email or phone..." 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
              <button 
                onClick={() => setStatus('all')}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${status === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setStatus('active')}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${status === 'active' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setStatus('inactive')}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${status === 'inactive' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Inactive
              </button>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-[11px] font-medium text-gray-600 focus:outline-none px-2"
              />
              <span className="text-gray-300">|</span>
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-[11px] font-medium text-gray-600 focus:outline-none px-2"
              />
              {(fromDate || toDate) && (
                <button 
                  onClick={() => { setFromDate(''); setToDate(''); }}
                  className="p-1 hover:bg-gray-200 rounded text-gray-400"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-8">
            <TableSkeleton cols={6} rows={8} />
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
                  {customers.length === 0 ? (
                    <motion.tr 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={columns.length} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-200" />
                          </div>
                          <p className="text-sm font-medium text-gray-400">No customers found</p>
                          <Button variant="outline" size="sm" onClick={() => setSearch('')}>Clear Filters</Button>
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
          <p className="text-xs font-medium text-gray-400 uppercase tracking-tight">
            Showing {customers.length} of {meta.total} results
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
