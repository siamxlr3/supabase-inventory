'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  DataTable, 
  Button, 
  Badge, 
  Card, 
  Input,
  Select,
  Modal
} from '@/components/ui';
import { 
  ClipboardList, 
  Plus, 
  History, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import { useGetAdjustmentsQuery, useCreateAdjustmentMutation, useGetInventoryLevelsQuery } from '@/store/api/inventoryApi';
import { useGetProductsQuery } from '@/store/api/productApi';
import { InventoryAdjustment } from '@/models/inventoryAdjustment';
import { useGetLocationsQuery } from '@/store/api/locationApi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdjustmentsPage() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: adjustments, isLoading } = useGetAdjustmentsQuery({ page });
  const { data: locations } = useGetLocationsQuery({});
  const { data: productData } = useGetProductsQuery({ per_page: 100 });
  
  const [createAdjustment, { isLoading: isCreating }] = useCreateAdjustmentMutation();

  const inventoryItems = productData?.data?.flatMap(p => 
    p.variants?.map(v => v.inventory_item).filter((item): item is NonNullable<typeof item> => item !== null)
  ) || [];

  const handleCreateAdjustment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const body = {
      inventory_item_id: formData.get('inventory_item_id') as string,
      location_id: formData.get('location_id') as string,
      delta: parseInt(formData.get('delta') as string),
      reason: formData.get('reason') as any,
      reference_document_id: formData.get('reference_id') as string,
      reference_document_type: formData.get('reference_document_type') as string,
    };

    try {
      await createAdjustment(body).unwrap();
      toast.success('Inventory adjustment recorded.');
      setIsModalOpen(false);
    } catch (err) {
      // Error handled by baseApi
    }
  };

  const columns = [
    {
      key: 'happened_at',
      header: 'Date & Time',
      cell: (row: InventoryAdjustment) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900 font-medium">
            {format(new Date(row.happened_at), 'MMM dd, yyyy')}
          </span>
          <span className="text-xs text-gray-400">
            {format(new Date(row.happened_at), 'HH:mm:ss')}
          </span>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Product / SKU',
      cell: (row: InventoryAdjustment) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 font-mono">{row.inventory_item?.sku}</span>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      cell: (row: InventoryAdjustment) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{row.location?.name}</span>
        </div>
      ),
    },
    {
      key: 'delta',
      header: 'Change',
      cell: (row: InventoryAdjustment) => {
        const isPositive = row.delta > 0;
        return (
          <div className={`flex items-center gap-1 font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {isPositive ? `+${row.delta}` : row.delta}
          </div>
        );
      },
    },
    {
      key: 'reason',
      header: 'Reason',
      cell: (row: InventoryAdjustment) => (
        <Badge variant="outline" className="capitalize">
          {row.reason.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      cell: (row: InventoryAdjustment) => (
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            {row.reference_document_type || 'Manual'}
          </span>
          <span className="text-xs text-gray-600 font-medium">
            {row.reference_document_id || 'N/A'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustments"
        description="Audit every inventory change and record manual corrections."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/dashboard/inventory' },
          { label: 'Adjustments' },
        ]}
        actions={
          <Button 
            onClick={() => setIsModalOpen(true)} 
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Adjustment
          </Button>
        }
      />

      <Card className="border-gray-100 overflow-hidden" padding="none">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Reason or Reference..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Calendar className="h-3.5 w-3.5" />}>
              Date Range
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>
              Reason
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={adjustments?.data || []}
          isLoading={isLoading}
          currentPage={page}
          totalPages={adjustments?.meta?.total_pages || 1}
          onPageChange={setPage}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Inventory Adjustment"
      >
        <form onSubmit={handleCreateAdjustment} className="space-y-4 pt-4">
          <Select
            name="inventory_item_id"
            label="Select Item (SKU)"
            options={inventoryItems.map(item => ({
              label: `${item.sku} (Cost: $${item.cost})`,
              value: item.id
            }))}
            required
          />
          
          <Select
            name="location_id"
            label="Location"
            options={locations?.data?.map(l => ({
              label: l.name,
              value: l.id
            })) || []}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="delta"
              type="number"
              label="Delta (Quantity Change)"
              placeholder="e.g. -5 or 10"
              required
            />
            <Select
              name="reason"
              label="Reason"
              options={[
                { label: 'Correction', value: 'correction' },
                { label: 'Damaged', value: 'damaged' },
                { label: 'Received', value: 'received' },
                { label: 'Return', value: 'return' },
                { label: 'Cycle Count', value: 'cycle_count' },
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              name="reference_document_type"
              label="Ref. Type"
              options={[
                { label: 'Manual', value: 'manual' },
                { label: 'Purchase Order', value: 'po' },
                { label: 'Sales Order', value: 'so' },
                { label: 'Return', value: 'return' },
                { label: 'Transfer', value: 'transfer' },
              ]}
              required
            />
            <Input
              name="reference_id"
              label="Ref. ID"
              placeholder="e.g. PO-12345"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Save Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
