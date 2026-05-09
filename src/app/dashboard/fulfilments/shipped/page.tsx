'use client';

import React from 'react';
import { PageHeader, DataTable, Badge, Button } from '@/components/ui';
import { MoreVertical, Truck, Eye, MapPin, ExternalLink } from 'lucide-react';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/Dropdown';

const shippedFulfilments = [
  { id: 'FUL-101', orderId: 'ORD-1231', customer: 'Alice Brown', shippedDate: '2025-05-05', carrier: 'FedEx', tracking: '123456789012', status: 'shipped' },
  { id: 'FUL-100', orderId: 'ORD-1230', customer: 'Charlie Wilson', shippedDate: '2025-05-04', carrier: 'UPS', tracking: '1Z999AA10123456784', status: 'delivered' },
  { id: 'FUL-099', orderId: 'ORD-1228', customer: 'Emma Thompson', shippedDate: '2025-05-03', carrier: 'DHL', tracking: 'JD01460000000', status: 'delivered' },
  { id: 'FUL-098', orderId: 'ORD-1225', customer: 'George King', shippedDate: '2025-05-02', carrier: 'FedEx', tracking: '987654321098', status: 'shipped' },
];

export default function ShippedFulfilmentsPage() {
  const columns = [
    { key: 'id', header: 'Fulfilment ID', cell: (row: typeof shippedFulfilments[0]) => <span className="font-mono text-xs text-gray-500">{row.id}</span> },
    { key: 'orderId', header: 'Order ID', cell: (row: typeof shippedFulfilments[0]) => <span className="font-medium text-indigo-600">{row.orderId}</span> },
    { key: 'customer', header: 'Customer', cell: (row: typeof shippedFulfilments[0]) => <span className="text-sm font-medium">{row.customer}</span> },
    { key: 'shippedDate', header: 'Shipped Date', cell: (row: typeof shippedFulfilments[0]) => <span className="text-sm text-gray-500">{row.shippedDate}</span> },
    { key: 'carrier', header: 'Carrier', cell: (row: typeof shippedFulfilments[0]) => <span className="text-sm">{row.carrier}</span> },
    {
      key: 'tracking', header: 'Tracking',
      cell: (row: typeof shippedFulfilments[0]) => (
        <div className="flex items-center gap-1.5 text-indigo-600 hover:underline cursor-pointer">
          <span className="text-xs font-mono">{row.tracking}</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      cell: (row: typeof shippedFulfilments[0]) => (
        <Badge variant={row.status === 'delivered' ? 'success' : 'info'}>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions', header: '', className: 'w-12',
      cell: () => (
        <Dropdown align="end">
          <DropdownTrigger>
            <button className="p-1 hover:bg-gray-100 rounded text-gray-400 transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem><MapPin className="h-4 w-4 mr-2" /> Track Package</DropdownItem>
            <DropdownItem><Eye className="h-4 w-4 mr-2" /> View Order</DropdownItem>
            <DropdownItem><Truck className="h-4 w-4 mr-2" /> Print Packing Slip</DropdownItem>
          </DropdownContent>
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Shipped Fulfilments"
        description="Track and manage orders already in transit"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Fulfilments' }, { label: 'Shipped' }]}
        actions={<Button variant="outline" size="sm">Download Logistics Report</Button>}
      />
      <DataTable columns={columns} data={shippedFulfilments} searchPlaceholder="Search tracking or customer..." />
    </>
  );
}
