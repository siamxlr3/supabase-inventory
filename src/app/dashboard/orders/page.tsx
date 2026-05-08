'use client';

import React, { useState } from 'react';
import { PageHeader, DataTable, Button, StatusBadge, StatsCard } from '@/components/ui';
import { Plus, Download, Filter, Eye, Edit, MoreHorizontal, ShoppingBag, Clock, CheckCircle, Truck } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import Link from 'next/link';

const orders = [
  { id: 'ORD-1234', customer: 'John Doe', date: '2025-05-06', amount: '$245.00', items: 3, status: 'completed', payment: 'paid' },
  { id: 'ORD-1233', customer: 'Jane Smith', date: '2025-05-06', amount: '$189.50', items: 2, status: 'processing', payment: 'paid' },
  { id: 'ORD-1232', customer: 'Bob Johnson', date: '2025-05-05', amount: '$520.00', items: 5, status: 'pending', payment: 'unpaid' },
  { id: 'ORD-1231', customer: 'Alice Brown', date: '2025-05-05', amount: '$78.25', items: 1, status: 'shipped', payment: 'paid' },
  { id: 'ORD-1230', customer: 'Charlie Wilson', date: '2025-05-04', amount: '$340.00', items: 4, status: 'completed', payment: 'paid' },
  { id: 'ORD-1229', customer: 'David Miller', date: '2025-05-04', amount: '$1,200.00', items: 12, status: 'cancelled', payment: 'refunded' },
  { id: 'ORD-1228', customer: 'Emma Thompson', date: '2025-05-03', amount: '$45.00', items: 1, status: 'completed', payment: 'paid' },
  { id: 'ORD-1227', customer: 'Frank Harris', date: '2025-05-03', amount: '$990.00', items: 7, status: 'partial', payment: 'paid' },
];

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const columns = [
    { key: 'id', header: 'Order ID', cell: (row: typeof orders[0]) => <span className="font-mono font-medium text-indigo-600">{row.id}</span> },
    { key: 'customer', header: 'Customer', cell: (row: typeof orders[0]) => <span className="font-medium">{row.customer}</span> },
    { key: 'date', header: 'Date', cell: (row: typeof orders[0]) => <span className="text-gray-500">{row.date}</span> },
    { key: 'items', header: 'Items', cell: (row: typeof orders[0]) => <span className="text-gray-600">{row.items} items</span> },
    { key: 'amount', header: 'Total', cell: (row: typeof orders[0]) => <span className="font-bold text-gray-900">{row.amount}</span> },
    { key: 'status', header: 'Status', cell: (row: typeof orders[0]) => <StatusBadge status={row.status} /> },
    { key: 'payment', header: 'Payment', cell: (row: typeof orders[0]) => <StatusBadge status={row.payment} /> },
    {
      key: 'actions', header: '', className: 'w-12',
      cell: () => (
        <Dropdown items={[
          { label: 'View Details', icon: <Eye className="h-4 w-4" /> },
          { label: 'Edit Order', icon: <Edit className="h-4 w-4" /> },
          { label: 'Download Invoice', icon: <Download className="h-4 w-4" /> },
          { divider: true, label: '' },
          { label: 'Cancel Order', icon: <MoreHorizontal className="h-4 w-4" />, danger: true },
        ]} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Orders"
        description="View and manage all customer orders"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Orders' }]}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export</Button>
            <Link href="/dashboard/orders/create">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Create Order</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Orders" value="1,248" change="+12%" changeType="positive" icon={<ShoppingBag className="h-5 w-5 text-indigo-600" />} iconBg="bg-indigo-50" />
        <StatsCard title="Pending" value="42" change="Needs attention" changeType="neutral" icon={<Clock className="h-5 w-5 text-amber-600" />} iconBg="bg-amber-50" />
        <StatsCard title="Processing" value="18" change="In fulfillment" changeType="neutral" icon={<Truck className="h-5 w-5 text-blue-600" />} iconBg="bg-blue-50" />
        <StatsCard title="Completed" value="1,180" change="+85 today" changeType="positive" icon={<CheckCircle className="h-5 w-5 text-emerald-600" />} iconBg="bg-emerald-50" />
      </div>

      <DataTable
        columns={columns}
        data={orders}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order ID or customer..."
        currentPage={page}
        totalPages={12}
        onPageChange={setPage}
        filters={<Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>Filters</Button>}
      />
    </>
  );
}
