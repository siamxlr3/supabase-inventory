'use client';

import React, { useState } from 'react';
import { PageHeader, DataTable, Badge, Button } from '@/components/ui';
import { ShieldCheck, Download, Filter, User, Clock, Monitor } from 'lucide-react';

const auditLogs = [
  { id: 1, user: 'Admin User', action: 'Update Product', target: 'Wireless Mouse Pro', timestamp: '2025-05-07 10:24:12', ip: '192.168.1.1', status: 'success' },
  { id: 2, user: 'John Staff', action: 'Create Order', target: 'ORD-1234', timestamp: '2025-05-07 09:15:33', ip: '192.168.1.45', status: 'success' },
  { id: 3, user: 'Jane Manager', action: 'Delete Supplier', target: 'Tech Corp', timestamp: '2025-05-07 08:45:01', ip: '192.168.1.22', status: 'success' },
  { id: 4, user: 'System', action: 'Auto-Replenish', target: 'Low Stock Items', timestamp: '2025-05-07 00:00:05', ip: 'internal', status: 'success' },
  { id: 5, user: 'Admin User', action: 'Login Failed', target: 'admin@versity.com', timestamp: '2025-05-06 23:12:44', ip: '203.0.113.10', status: 'failed' },
  { id: 6, user: 'John Staff', action: 'Export Data', target: 'Products CSV', timestamp: '2025-05-06 17:30:12', ip: '192.168.1.45', status: 'success' },
];

export default function AuditLogPage() {
  const [search, setSearch] = useState('');

  const columns = [
    {
      key: 'user', header: 'User',
      cell: (row: typeof auditLogs[0]) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center"><User className="h-3.5 w-3.5 text-gray-400" /></div>
          <span className="text-sm font-medium text-gray-900">{row.user}</span>
        </div>
      ),
    },
    { key: 'action', header: 'Action', cell: (row: typeof auditLogs[0]) => <span className="text-sm font-semibold">{row.action}</span> },
    { key: 'target', header: 'Target', cell: (row: typeof auditLogs[0]) => <span className="text-sm text-gray-600 font-mono">{row.target}</span> },
    {
      key: 'timestamp', header: 'Timestamp',
      cell: (row: typeof auditLogs[0]) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="h-3 w-3" /> {row.timestamp}
        </div>
      ),
    },
    {
      key: 'ip', header: 'Source',
      cell: (row: typeof auditLogs[0]) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
          <Monitor className="h-3 w-3" /> {row.ip}
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      cell: (row: typeof auditLogs[0]) => (
        <Badge variant={row.status === 'success' ? 'success' : 'danger'}>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Monitor all administrative activities and system changes"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }, { label: 'Audit Log' }]}
        actions={<><Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>Filter Activity</Button><Button size="sm" leftIcon={<Download className="h-4 w-4" />}>Export Logs</Button></>}
      />
      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-4">
        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900">Security Monitoring Active</h4>
          <p className="text-xs text-indigo-700">Tracking all changes for compliance and accountability. Retention period: 365 days.</p>
        </div>
      </div>
      <DataTable columns={columns} data={auditLogs} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search actions or users..." />
    </>
  );
}
