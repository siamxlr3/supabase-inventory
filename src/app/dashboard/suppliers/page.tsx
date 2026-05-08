'use client';

import React from 'react';
import { PageHeader, DataTable, Button, Badge } from '@/components/ui';
import { Plus, Eye, Edit, Trash2, Phone, Mail } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';

const suppliers = [
  { id: 1, name: 'Logitech', contact: 'Alice Wong', email: 'alice@logitech.com', phone: '+1 555-1234', category: 'Electronics', status: 'active' },
  { id: 2, name: 'Anker', contact: 'Bob Chen', email: 'bob@anker.com', phone: '+1 555-5678', category: 'Accessories', status: 'active' },
  { id: 3, name: 'Satechi', contact: 'Cathy Smith', email: 'cathy@satechi.com', phone: '+1 555-9012', category: 'Accessories', status: 'active' },
  { id: 4, name: 'Keychron', contact: 'David Jones', email: 'david@keychron.com', phone: '+1 555-3456', category: 'Electronics', status: 'inactive' },
  { id: 5, name: 'BenQ', contact: 'Eve Miller', email: 'eve@benq.com', phone: '+1 555-7890', category: 'Lighting', status: 'active' },
];

export default function SuppliersPage() {
  const columns = [
    { key: 'name', header: 'Supplier', cell: (row: typeof suppliers[0]) => <span className="font-medium text-gray-900">{row.name}</span> },
    { key: 'contact', header: 'Primary Contact', cell: (row: typeof suppliers[0]) => <span className="text-sm">{row.contact}</span> },
    {
      key: 'contact_info', header: 'Contact Info',
      cell: (row: typeof suppliers[0]) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><Mail className="h-3 w-3" /> {row.email}</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><Phone className="h-3 w-3" /> {row.phone}</div>
        </div>
      ),
    },
    { key: 'category', header: 'Category', cell: (row: typeof suppliers[0]) => <Badge variant="outline">{row.category}</Badge> },
    { key: 'status', header: 'Status', cell: (row: typeof suppliers[0]) => <Badge variant={row.status === 'active' ? 'success' : 'default'}>{row.status.toUpperCase()}</Badge> },
    {
      key: 'actions', header: '', className: 'w-12',
      cell: () => (
        <Dropdown items={[
          { label: 'View Profile', icon: <Eye className="h-4 w-4" /> },
          { label: 'Edit Supplier', icon: <Edit className="h-4 w-4" /> },
          { divider: true, label: '' },
          { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, danger: true },
        ]} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Manage your vendor and supplier relationships"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Procurement' }, { label: 'Suppliers' }]}
        actions={<Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Supplier</Button>}
      />
      <DataTable columns={columns} data={suppliers} searchPlaceholder="Search suppliers..." />
    </>
  );
}
