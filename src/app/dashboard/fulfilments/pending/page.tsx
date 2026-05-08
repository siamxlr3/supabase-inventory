'use client';

import React from 'react';
import { PageHeader, DataTable, Button, Badge } from '@/components/ui';
import { Package, Truck, Eye, CheckCircle } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';

const pendingFulfilments = [
  { id: 'FUL-001', orderId: 'ORD-1234', customer: 'John Doe', date: '2025-05-06', items: 3, priority: 'high', location: 'Main Warehouse' },
  { id: 'FUL-002', orderId: 'ORD-1233', customer: 'Jane Smith', date: '2025-05-06', items: 2, priority: 'medium', location: 'Main Warehouse' },
  { id: 'FUL-003', orderId: 'ORD-1232', customer: 'Bob Johnson', date: '2025-05-05', items: 5, priority: 'low', location: 'West Coast Hub' },
  { id: 'FUL-004', orderId: 'ORD-1227', customer: 'Frank Harris', date: '2025-05-03', items: 7, priority: 'high', location: 'Downtown Store' },
];

export default function PendingFulfilmentsPage() {
  const columns = [
    { key: 'id', header: 'Fulfilment ID', cell: (row: typeof pendingFulfilments[0]) => <span className="font-mono text-xs text-gray-500">{row.id}</span> },
    { key: 'orderId', header: 'Order ID', cell: (row: typeof pendingFulfilments[0]) => <span className="font-medium text-indigo-600">{row.orderId}</span> },
    { key: 'customer', header: 'Customer', cell: (row: typeof pendingFulfilments[0]) => <span className="text-sm font-medium">{row.customer}</span> },
    { key: 'date', header: 'Requested Date', cell: (row: typeof pendingFulfilments[0]) => <span className="text-sm text-gray-500">{row.date}</span> },
    { key: 'items', header: 'Items', cell: (row: typeof pendingFulfilments[0]) => <span className="text-sm">{row.items} items</span> },
    {
      key: 'priority', header: 'Priority',
      cell: (row: typeof pendingFulfilments[0]) => (
        <Badge variant={row.priority === 'high' ? 'danger' : row.priority === 'medium' ? 'warning' : 'info'}>
          {row.priority.toUpperCase()}
        </Badge>
      ),
    },
    { key: 'location', header: 'Location', cell: (row: typeof pendingFulfilments[0]) => <span className="text-sm text-gray-600">{row.location}</span> },
    {
      key: 'actions', header: '', className: 'w-12',
      cell: () => (
        <Dropdown items={[
          { label: 'Start Picking', icon: <Package className="h-4 w-4" /> },
          { label: 'Print Labels', icon: <CheckCircle className="h-4 w-4" /> },
          { label: 'View Order', icon: <Eye className="h-4 w-4" /> },
          { divider: true, label: '' },
          { label: 'Mark Shipped', icon: <Truck className="h-4 w-4" /> },
        ]} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Pending Fulfilments"
        description="Orders ready for picking and packing"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Fulfilments' }, { label: 'Pending' }]}
        actions={<Button size="sm" leftIcon={<Truck className="h-4 w-4" />}>Batch Ship Selected</Button>}
      />
      <DataTable columns={columns} data={pendingFulfilments} searchPlaceholder="Search fulfilment or order..." />
    </>
  );
}
