'use client';

import React from 'react';
import { PageHeader, DataTable, Button, StatusBadge, StatsCard } from '@/components/ui';
import { Plus, Download, FileText, Clock, CheckSquare, Truck } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import Link from 'next/link';

const purchaseOrders = [
  { id: 'PO-2024-001', supplier: 'Logitech', date: '2025-05-06', amount: '$4,250.00', status: 'pending', expectedDate: '2025-05-15' },
  { id: 'PO-2024-002', supplier: 'Anker', date: '2025-05-04', amount: '$1,890.00', status: 'approved', expectedDate: '2025-05-12' },
  { id: 'PO-2024-003', supplier: 'Satechi', date: '2025-05-02', amount: '$3,400.00', status: 'ordered', expectedDate: '2025-05-10' },
  { id: 'PO-2024-004', supplier: 'Keychron', date: '2025-04-28', amount: '$2,100.00', status: 'received', expectedDate: '2025-05-02' },
  { id: 'PO-2024-005', supplier: 'BenQ', date: '2025-04-25', amount: '$12,500.00', status: 'partial', expectedDate: '2025-05-05' },
];

export default function PurchaseOrdersPage() {
  const columns = [
    { key: 'id', header: 'PO Number', cell: (row: typeof purchaseOrders[0]) => <span className="font-mono font-medium text-indigo-600">{row.id}</span> },
    { key: 'supplier', header: 'Supplier', cell: (row: typeof purchaseOrders[0]) => <span className="font-medium">{row.supplier}</span> },
    { key: 'date', header: 'Created Date', cell: (row: typeof purchaseOrders[0]) => <span className="text-sm text-gray-500">{row.date}</span> },
    { key: 'expectedDate', header: 'Expected Date', cell: (row: typeof purchaseOrders[0]) => <span className="text-sm text-gray-500">{row.expectedDate}</span> },
    { key: 'amount', header: 'Total Value', cell: (row: typeof purchaseOrders[0]) => <span className="font-bold text-gray-900">{row.amount}</span> },
    { key: 'status', header: 'Status', cell: (row: typeof purchaseOrders[0]) => <StatusBadge status={row.status} /> },
    {
      key: 'actions', header: '', className: 'w-12',
      cell: () => (
        <Dropdown items={[
          { label: 'View Details', icon: <FileText className="h-4 w-4" /> },
          { label: 'Receive Items', icon: <CheckSquare className="h-4 w-4" /> },
          { divider: true, label: '' },
          { label: 'Cancel PO', icon: <Plus className="h-4 w-4" />, danger: true },
        ]} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Purchase Orders"
        description="Manage stock procurement and supplier orders"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Procurement' }, { label: 'Purchase Orders' }]}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export</Button>
            <Link href="/dashboard/purchase-orders/create">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Create PO</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Spent (MTD)" value="$28,450" change="+15%" changeType="negative" icon={<FileText className="h-5 w-5 text-indigo-600" />} iconBg="bg-indigo-50" />
        <StatsCard title="Pending Approval" value="3" change="Value: $5,200" changeType="neutral" icon={<Clock className="h-5 w-5 text-amber-600" />} iconBg="bg-amber-50" />
        <StatsCard title="In Transit" value="2" change="Expected: Today" changeType="positive" icon={<Truck className="h-5 w-5 text-blue-600" />} iconBg="bg-blue-50" />
        <StatsCard title="Received (MTD)" value="12" change="Value: $42,100" changeType="positive" icon={<CheckSquare className="h-5 w-5 text-emerald-600" />} iconBg="bg-emerald-50" />
      </div>

      <DataTable columns={columns} data={purchaseOrders} searchPlaceholder="Search PO or supplier..." />
    </>
  );
}
