'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  Select, 
  Loader
} from '@/components/ui';
import { 
  Save, 
  Plus, 
  Trash2, 
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetSuppliersQuery } from '@/store/api/supplierApi';
import { useGetLocationsQuery } from '@/store/api/locationApi';
import { useGetProductsQuery } from '@/store/api/productApi';
import { useCreateAndReceivePOMutation } from '@/store/api/purchaseOrderApi';
import { toast } from 'react-hot-toast';

export default function AddPurchaseOrderPage() {
  const router = useRouter();
  const [createAndReceive, { isLoading: isCreating }] = useCreateAndReceivePOMutation();

  const { data: suppliersRes } = useGetSuppliersQuery({ per_page: 100 });
  const { data: locationsRes } = useGetLocationsQuery();
  const { data: productsRes } = useGetProductsQuery({ per_page: 100 });

  const [formData, setFormData] = useState({
    supplier_id: '',
    destination_location_id: '',
    name: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
    note: '',
    currency_code: 'USD',
    estimated_arrival_date: '',
  });

  const [lineItems, setLineItems] = useState<any[]>([]);

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      id: Date.now(), 
      product_variant_id: '', 
      inventory_item_id: '', 
      quantity: 1, 
      unit_cost: 0 
    }]);
  };

  const removeLineItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: number, field: string, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        if (field === 'product_variant_id') {
          const product = productsRes?.data.find(p => 
            p.variants?.some(v => v.id === value)
          );
          const variant = product?.variants?.find(v => v.id === value);
          const invItem = variant?.inventory?.[0];

          return { 
            ...item, 
            product_variant_id: value, 
            inventory_item_id: invItem?.id || '',
            unit_cost: invItem?.cost || 0
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier_id || !formData.destination_location_id || lineItems.length === 0) {
      toast.error('Please fill all required fields and add at least one item');
      return;
    }

    try {
      const payload = {
        ...formData,
        line_items: lineItems.map(item => ({
          inventory_item_id: item.inventory_item_id,
          product_variant_id: item.product_variant_id,
          quantity: parseInt(item.quantity),
          unit_cost: parseFloat(item.unit_cost)
        }))
      };

      await createAndReceive(payload).unwrap();
      toast.success('Items received — inventory updated!');
      router.push('/dashboard/purchase-orders');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create PO');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="Create Purchase Order"
        description="Configure supplier, destination, line items and notes in one place."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase Orders', href: '/dashboard/purchase-orders' },
          { label: 'New PO' },
        ]}
        actions={
          <>
            <Link href="/dashboard/purchase-orders">
              <Button variant="outline" size="sm">Cancel</Button>
            </Link>
            <Button 
              size="sm" 
              onClick={handleSubmit} 
              disabled={isCreating}
              leftIcon={isCreating ? <Loader size="sm" /> : <Save className="h-4 w-4" />}
            >
              {isCreating ? 'Processing...' : 'Receive Items'}
            </Button>
          </>
        }
      />

      <div className="max-w-5xl mx-auto">
        <Card className="overflow-hidden border-gray-100 shadow-sm">
          {/* Section: Order Configuration */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Configuration</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="PO Reference Number" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Select 
              label="Supplier"
              value={formData.supplier_id}
              onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
              options={[
                { label: 'Select Supplier', value: '' },
                ...(suppliersRes?.data || []).map(s => ({ label: s.name, value: s.id }))
              ]}
              required
            />
            <Select 
              label="Destination Location"
              value={formData.destination_location_id}
              onChange={(e) => setFormData({...formData, destination_location_id: e.target.value})}
              options={[
                { label: 'Select Destination', value: '' },
                ...(locationsRes?.data || []).map(l => ({ label: l.name, value: l.id }))
              ]}
              required
            />
            <Input 
              label="Estimated Arrival"
              type="date"
              value={formData.estimated_arrival_date}
              onChange={(e) => setFormData({...formData, estimated_arrival_date: e.target.value})}
              leftIcon={<Calendar className="h-4 w-4" />}
            />
            <Select 
              label="Currency"
              value={formData.currency_code}
              onChange={(e) => setFormData({...formData, currency_code: e.target.value})}
              options={[
                { label: 'USD - US Dollar', value: 'USD' },
                { label: 'EUR - Euro', value: 'EUR' },
                { label: 'GBP - British Pound', value: 'GBP' },
                { label: 'CAD - Canadian Dollar', value: 'CAD' },
              ]}
            />
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Note</label>
              <textarea 
                className="w-full h-24 rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm focus:border-indigo-500 focus:outline-none transition-all resize-none"
                placeholder="Add special instructions or internal notes..."
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
              />
            </div>
          </div>

          {/* Section: Line Items */}
          <div className="px-6 py-4 border-t border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Line Items</h3>
            <Button variant="outline" size="sm" onClick={addLineItem} leftIcon={<Plus className="h-3.5 w-3.5" />}>Add Item</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/10">
                  <th className="px-6 py-3">Product Variant</th>
                  <th className="px-6 py-3 w-28">Quantity</th>
                  <th className="px-6 py-3 w-36">Unit Cost</th>
                  <th className="px-6 py-3 w-32 text-right">Total</th>
                  <th className="px-6 py-3 w-14"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lineItems.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="px-6 py-4">
                      <select 
                        className="w-full h-10 rounded-xl border border-gray-100 bg-gray-50/30 px-3 text-xs focus:border-indigo-500 focus:outline-none transition-all"
                        value={item.product_variant_id}
                        onChange={(e) => updateLineItem(item.id, 'product_variant_id', e.target.value)}
                      >
                        <option value="">Select Variant</option>
                        {productsRes?.data.map(p => (
                          <optgroup key={p.id} label={p.title}>
                            {p.variants?.map(v => (
                              <option key={v.id} value={v.id}>{v.title} ({v.sku})</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                        className="w-full h-10 rounded-xl border border-gray-100 bg-gray-50/30 px-3 text-xs text-center focus:border-indigo-500 focus:outline-none transition-all"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 text-xs">$</span>
                        <input 
                          type="number"
                          value={item.unit_cost}
                          onChange={(e) => updateLineItem(item.id, 'unit_cost', e.target.value)}
                          className="w-full h-10 rounded-xl border border-gray-100 bg-gray-50/30 pl-6 pr-3 text-xs focus:border-indigo-500 focus:outline-none transition-all"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-bold text-gray-900">
                        ${(item.quantity * item.unit_cost).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => removeLineItem(item.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {lineItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm font-medium">No items added yet.</p>
                        <button onClick={addLineItem} className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-2 hover:underline">Click to add items</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Section: Summary Footer */}
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/20 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{lineItems.length} item(s)</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Cost</span>
              <span className="text-xl font-black text-indigo-600">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
