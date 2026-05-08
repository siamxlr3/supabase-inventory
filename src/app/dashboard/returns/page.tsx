'use client';

import React from 'react';
import { PageHeader, DataTable, Badge, StatusBadge, Button } from '@/components/ui';
import { RotateCcw, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';

const returns = [
  { id: 'RET-001', orderId: 'ORD-1229', customer: 'David Miller', date: '2025-05-06', amount: '$1,200.00', status: 'pending', reason: 'Defective product' },
  { id: 'RET-002', orderId: 'ORD-1220', customer: 'Sarah Lee', date: '2025-05-04', amount: '$45.00', status: 'approved', reason: 'Changed mind' },
  { id: 'RET-003', orderId: 'ORD-1215', customer: 'Michael Chen', date: '2025-05-02', amount: '$210.00', status: 'refunded', reason: 'Wrong item shipped' },
  { id: 'RET-004', orderId: 'ORD-1210', customer: 'Karen White', date: '2025-04-30', amount: '$85.00', status: 'rejected', reason: 'Exceeded return window' },
];

export default function ReturnsPage() {
  const columns = [
    { key: 'id', header: 'Return ID', cell: (row: typeof returns[0]) => <span className="font-mono text-xs text-gray-500">{row.id}</span> },
    { key: 'orderId', header: 'Order ID', cell: (row: typeof returns[0]) => <span className="font-medium text-indigo-600">{row.orderId}</span> },
    { key: 'customer', header: 'Customer', cell: (row: typeof returns[0]) => <span className="text-sm font-medium">{row.customer}</span> },
    { key: 'date', header: 'Request Date', cell: (row: typeof returns[0]) => <span className="text-sm text-gray-500">{row.date}</span> },
    { key: 'amount', header: 'Value', cell: (row: typeof returns[0]) => <span className="text-sm font-semibold">{row.amount}</span> },
    { key: 'reason', header: 'Reason', cell: (row: typeof returns[0]) => <span className="text-sm text-gray-600 italic">"{row.reason}"</span> },
    { key: 'status', header: 'Status', cell: (row: typeof returns[0]) => <StatusBadge status={row.status} /> },
    {
      key: 'actions', header: '', className: 'w-12',
      cell: (row: typeof returns[0]) => (
        <Dropdown items={[
          { label: 'Review Return', icon: <Eye className="h-4 w-4" /> },
          { label: 'Approve', icon: <CheckCircle className="h-4 w-4" /> },
          { label: 'Reject', icon: <XCircle className="h-4 w-4" />, danger: true },
        ]} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Returns & Refunds"
        description="Manage customer returns and refund requests"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Returns' }]}
        actions={<Button size="sm" variant="outline" leftIcon={<RotateCcw className="h-4 w-4" />}>Return Settings</Button>}
      />
      <DataTable columns={columns} data={returns} searchPlaceholder="Search returns..." />
    </>
  );
}
