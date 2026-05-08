'use client';

import React from 'react';
import { 
  PageHeader, 
  Button, 
  Card, 
  Input,
  Select,
} from '@/components/ui';
import { 
  Plus, 
  ArrowLeft,
  Package,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { useCreateAdjustmentMutation, useGetInventoryLevelsQuery } from '@/store/api/inventoryApi';
import { useGetLocationsQuery } from '@/store/api/locationApi';
import { useGetProductsQuery } from '@/store/api/productApi';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function NewAdjustmentPage() {
  const router = useRouter();
  const { data: locations } = useGetLocationsQuery({});
  const { data: productData } = useGetProductsQuery({ per_page: 100 });
  const [createAdjustment, { isLoading: isCreating }] = useCreateAdjustmentMutation();

  const inventoryItems = productData?.data?.flatMap(p => 
    p.variants?.flatMap(v => v.inventory || [])
  ) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      router.push('/dashboard/inventory/adjustments');
    } catch (err) {
      // Error handled by baseApi
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="New Stock Adjustment"
        description="Record manual corrections, damages, or stock receptions."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/dashboard/inventory' },
          { label: 'Adjustments', href: '/dashboard/inventory/adjustments' },
          { label: 'New' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        }
      />

      <Card className="border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              name="inventory_item_id"
              label="Select Product Variant (SKU)"
              options={inventoryItems.map(item => ({
                label: `${item.sku} (Cost: $${item.cost})`,
                value: item.id
              }))}
              required
            />
            
            <Select
              name="location_id"
              label="Storage Location"
              options={locations?.data?.map(l => ({
                label: l.name,
                value: l.id
              })) || []}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
            <div className="space-y-1">
              <Input
                name="delta"
                type="number"
                label="Delta (Quantity Change)"
                placeholder="e.g. -10 for loss, 50 for restock"
                required
              />
              <p className="text-[10px] text-gray-400">Use negative values for stock removal.</p>
            </div>
            
            <Select
              name="reason"
              label="Adjustment Reason"
              options={[
                { label: 'Sale Correction', value: 'sale' },
                { label: 'Customer Return', value: 'return' },
                { label: 'Stock Received', value: 'received' },
                { label: 'Damaged Goods', value: 'damaged' },
                { label: 'Manual Correction', value: 'correction' },
                { label: 'Cycle Count', value: 'cycle_count' },
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
            <Select
              name="reference_document_type"
              label="Reference Document Type"
              options={[
                { label: 'Manual Correction', value: 'manual' },
                { label: 'Purchase Order', value: 'po' },
                { label: 'Sales Order', value: 'so' },
                { label: 'Customer Return', value: 'return' },
                { label: 'Warehouse Transfer', value: 'transfer' },
              ]}
              required
            />
            <Input
              name="reference_id"
              label="Reference Document ID"
              placeholder="e.g. PO-882, TICKET-99, or RETURN-5"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} leftIcon={<ClipboardList className="h-4 w-4" />}>
              Commit Adjustment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
