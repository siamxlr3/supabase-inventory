'use client';

import React from 'react';
import { PageHeader, DataTable, Button, Badge } from '@/components/ui';
import { Plus, Eye, Mail, MapPin, ShoppingBag } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';

const customers = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', location: 'New York, USA', orders: 12, totalSpent: '$2,450.00', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', location: 'London, UK', orders: 8, totalSpent: '$1,280.50', status: 'active' },
  { id: 3, name: 'Michael Chen', email: 'm.chen@example.com', location: 'Singapore', orders: 25, totalSpent: '$12,400.00', status: 'vip' },
  { id: 4, name: 'Sarah Lee', email: 'sarah.lee@example.com', location: 'Sydney, Australia', orders: 3, totalSpent: '$450.00', status: 'active' },
  { id: 5, name: 'David Miller', email: 'd.miller@example.com', location: 'Berlin, Germany', orders: 1, totalSpent: '$1,200.00', status: 'inactive' },
];

export default function CustomersPage() {
  const columns = [
    {
      key: 'name', header: 'Customer',
      cell: (row: typeof customers[0]) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div><p className="text-sm font-medium text-gray-900">{row.name}</p><p className="text-xs text-gray-500">{row.email}</p></div>
        </div>
      ),
    },
    { key: 'location', header: 'Location', cell: (row: typeof customers[0]) => <div className="flex items-center gap-1.5 text-sm text-gray-600"><MapPin className="h-3 w-3 text-gray-400" /> {row.location}</div> },
    { key: 'orders', header: 'Orders', cell: (row: typeof customers[0]) => <div className="flex items-center gap-1.5 text-sm font-medium"><ShoppingBag className="h-3 w-3 text-gray-400" /> {row.orders}</div> },
    { key: 'totalSpent', header: 'Total Spent', cell: (row: typeof customers[0]) => <span className="text-sm font-bold text-gray-900">{row.totalSpent}</span> },
    {
      key: 'status', header: 'Segment',
      cell: (row: typeof customers[0]) => (
        <Badge variant={row.status === 'vip' ? 'success' : row.status === 'inactive' ? 'default' : 'info'}>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions', header: '', className: 'w-12',
      cell: () => (
        <Dropdown items={[
          { label: 'View Profile', icon: <Eye className="h-4 w-4" /> },
          { label: 'Send Email', icon: <Mail className="h-4 w-4" /> },
          { divider: true, label: '' },
          { label: 'Edit', icon: <Plus className="h-4 w-4" /> },
        ]} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        description="View and manage your customer database"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Customers' }]}
        actions={<Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>New Customer</Button>}
      />
      <DataTable columns={columns} data={customers} searchPlaceholder="Search customers by name or email..." />
    </>
  );
}
