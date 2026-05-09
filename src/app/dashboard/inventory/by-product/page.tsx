'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  DataTable, 
  Button, 
  Badge, 
  Card, 
  Loader,
  Input
} from '@/components/ui';
import { 
  Package, 
  Warehouse, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  History,
  MapPin,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { useGetInventoryLevelsQuery } from '@/store/api/inventoryApi';
import { InventoryLevel } from '@/models/inventoryLevel';
import { motion } from 'framer-motion';

export default function InventoryByProductPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, refetch } = useGetInventoryLevelsQuery({
    page,
    // Add more filters as needed
  });

  const columns = [
    {
      key: 'product',
      header: 'Product / Variant',
      cell: (row: InventoryLevel) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.inventory_item?.variant?.product?.title}</p>
            <p className="text-xs text-gray-500 font-mono">{row.inventory_item?.variant?.title} • {row.inventory_item?.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      cell: (row: InventoryLevel) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm text-gray-600">{row.location?.name}</span>
        </div>
      ),
    },
    {
      key: 'on_hand',
      header: 'On Hand',
      cell: (row: InventoryLevel) => (
        <span className="text-sm font-medium text-gray-900">{row.on_hand}</span>
      ),
    },
    {
      key: 'committed',
      header: 'Committed',
      cell: (row: InventoryLevel) => (
        <span className="text-sm text-amber-600 font-medium">{row.committed}</span>
      ),
    },
    {
      key: 'available',
      header: 'Available',
      cell: (row: InventoryLevel) => {
        const isLow = row.available <= 10;
        return (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
              {row.available}
            </span>
            {isLow && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
          </div>
        );
      },
    },
    {
      key: 'incoming',
      header: 'Incoming',
      cell: (row: InventoryLevel) => (
        <span className="text-sm text-blue-600 font-medium">{row.incoming}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Levels"
        description="Monitor real-time inventory counts across all your product variants."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/dashboard/inventory' },
          { label: 'By Product' },
        ]}
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
          >
            Sync Stock
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Units</p>
              <h4 className="text-xl font-bold text-gray-900">
                {data?.data?.reduce((acc, curr) => acc + curr.on_hand, 0) || 0}
              </h4>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Committed</p>
              <h4 className="text-xl font-bold text-gray-900">
                {data?.data?.reduce((acc, curr) => acc + curr.committed, 0) || 0}
              </h4>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Incoming</p>
              <h4 className="text-xl font-bold text-gray-900">
                {data?.data?.reduce((acc, curr) => acc + curr.incoming, 0) || 0}
              </h4>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</p>
              <h4 className="text-xl font-bold text-gray-900">
                {data?.data?.filter(i => i.on_hand - i.committed <= 10).length || 0}
              </h4>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-gray-100 overflow-hidden" padding="none">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU or Variant..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>
              Filters
            </Button>
            <Button variant="outline" size="sm" leftIcon={<History className="h-3.5 w-3.5" />}>
              View Logs
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          currentPage={page}
          totalPages={data?.meta?.total_pages || 1}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
