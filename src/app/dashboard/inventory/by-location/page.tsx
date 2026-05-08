'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  DataTable, 
  Button, 
  Badge, 
  Card, 
} from '@/components/ui';
import { 
  MapPin, 
  Warehouse, 
  Package, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Building2,
  Truck,
  RefreshCw
} from 'lucide-react';
import { useGetLocationsQuery } from '@/store/api/locationApi';
import { useGetInventoryLevelsQuery } from '@/store/api/inventoryApi';

export default function InventoryByLocationPage() {
  const [search, setSearch] = useState('');
  const { data: locationsData, isLoading: isLoadingLocs, refetch: refetchLocs } = useGetLocationsQuery({ search });
  const { data: inventoryData, isLoading: isLoadingInv, isFetching: isFetchingInv } = useGetInventoryLevelsQuery({ per_page: 1000 });

  const locations = locationsData?.data || [];
  const inventory = inventoryData?.data || [];

  // Group inventory by location
  const locationStats = locations.map(loc => {
    const itemsAtLocation = inventory.filter(inv => inv.location_id === loc.id);
    const totalItems = itemsAtLocation.reduce((acc, curr) => acc + curr.on_hand, 0);
    const totalValue = 0; // Price logic needed for real value
    
    return {
      ...loc,
      total_items: totalItems,
      total_value: `$${totalValue}`,
      utilization: totalItems > 1000 ? '95%' : totalItems > 500 ? '75%' : '30%', // Mock utilization logic
    };
  });

  const columns = [
    {
      key: 'name',
      header: 'Location Name',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">{row.city}, {row.country_code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Address',
      cell: (row: any) => (
        <span className="text-sm text-gray-600">{row.address1}</span>
      ),
    },
    {
      key: 'inventory',
      header: 'Total Items',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">{row.total_items}</span>
        </div>
      ),
    },
    {
      key: 'utilization',
      header: 'Storage Used',
      cell: (row: any) => {
        const val = parseInt(row.utilization);
        return (
          <div className="w-32">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500 font-medium">{row.utilization}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${val > 90 ? 'bg-red-500' : val > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: row.utilization }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'fulfillment',
      header: 'Online Orders',
      cell: (row: any) => (
        row.fulfills_online_orders ? (
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Truck className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Supported</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Offline Only</span>
        )
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (row: any) => (
        <Button variant="outline" size="sm" className="h-8 group">
          View Detail
          <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock by Location"
        description="Track physical inventory distribution and storage utilization across facilities."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/dashboard/inventory' },
          { label: 'By Location' },
        ]}
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<RefreshCw className={`h-4 w-4 ${isLoadingLocs || isFetchingInv ? 'animate-spin' : ''}`} />}
            onClick={() => {
              refetchLocs();
            }}
          >
            Refresh Data
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Items</p>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {locationStats.reduce((acc, curr) => acc + curr.total_items, 0)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Across all facilities</p>
        </Card>
        
        <Card className="bg-white border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Locations</p>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{locations.filter(l => l.active).length}</h3>
          <p className="text-xs text-gray-500 mt-1">Ready for fulfillment</p>
        </Card>

        <Card className="bg-white border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Online Nodes</p>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {locations.filter(l => l.fulfills_online_orders).length}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Fulfilling e-commerce</p>
        </Card>
      </div>

      <Card className="border-gray-100 overflow-hidden" padding="none">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search locations..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>
              Filter
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={locationStats}
          isLoading={isLoadingLocs || isLoadingInv}
        />
      </Card>
    </div>
  );
}
