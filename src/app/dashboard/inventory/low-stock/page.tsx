'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  DataTable, 
  Button, 
  Badge, 
  Card, 
  Loader
} from '@/components/ui';
import { 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Bell,
  RefreshCw,
  Package,
  MapPin,
  Trash2
} from 'lucide-react';
import { useGetAlertsQuery, useResolveAlertMutation } from '@/store/api/inventoryApi';
import { Alert } from '@/models/alert';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function LowStockAlertsPage() {
  const [page, setPage] = useState(1);
  const [resolved, setResolved] = useState<boolean>(false);
  
  const { data, isLoading, isFetching, refetch } = useGetAlertsQuery({ 
    page, 
    resolved: resolved ? true : false 
  });
  
  const [resolveAlert, { isLoading: isResolving }] = useResolveAlertMutation();

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert(id).unwrap();
      toast.success('Alert resolved.');
    } catch (err) {
      // Error handled by baseApi
    }
  };

  const columns = [
    {
      key: 'item',
      header: 'Product / SKU',
      cell: (row: Alert) => (
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${row.resolved ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-600'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.item?.variant?.title}</p>
            <p className="text-xs text-gray-500 font-mono">{row.item?.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      cell: (row: Alert) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{row.location?.name}</span>
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      cell: (row: Alert) => (
        <span className="text-sm text-gray-600 line-clamp-1">{row.message}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Triggered',
      cell: (row: Alert) => (
        <span className="text-xs text-gray-500 italic">
          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: Alert) => (
        <Badge variant={row.resolved ? 'default' : 'destructive'} className={row.resolved ? 'bg-green-100 text-green-700 border-green-200' : ''}>
          {row.resolved ? 'Resolved' : 'Active'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (row: Alert) => (
        <div className="flex justify-end">
          {!row.resolved && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleResolve(row.id)}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Resolve
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Low Stock Alerts"
        description="Monitor critical inventory shortages and coordinate restock efforts."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/dashboard/inventory' },
          { label: 'Low Stock' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant={!resolved ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setResolved(false)}
            >
              Active
            </Button>
            <Button 
              variant={resolved ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setResolved(true)}
            >
              Resolved
            </Button>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
            >
              Check Alerts
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-red-100 bg-red-50/30">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Critical Shortages</p>
              <h3 className="text-2xl font-bold text-red-900">
                {data?.data?.filter(a => !a.resolved).length || 0}
              </h3>
            </div>
          </div>
          <Bell className="absolute -right-4 -bottom-4 h-24 w-24 text-red-100/50 -rotate-12" />
        </Card>
      </div>

      <Card className="border-gray-100 overflow-hidden" padding="none">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pagination={{
            currentPage: page,
            totalPages: data?.meta?.total_pages || 1,
            onPageChange: setPage,
          }}
          emptyState={
            <div className="py-20 text-center">
              <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No active alerts</h3>
              <p className="text-sm text-gray-500 mt-1">All your stock levels are within the safe reorder threshold.</p>
            </div>
          }
        />
      </Card>
    </div>
  );
}
