'use client';

import React, { useState } from 'react';
import { PageHeader, Card, Button, Input, Select, Textarea, DataTable } from '@/components/ui';
import { Save, X, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function CreateOrderPage() {
  const [items, setItems] = useState([
    { id: 1, name: 'Wireless Mouse Pro', sku: 'WMP-001', price: 49.99, quantity: 2, total: 99.98 },
  ]);

  return (
    <>
      <PageHeader
        title="Create Order"
        description="Manually create a new customer order"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders', href: '/dashboard/orders' },
          { label: 'Create Order' },
        ]}
        actions={
          <>
            <Link href="/dashboard/orders">
              <Button variant="outline" size="sm" leftIcon={<X className="h-4 w-4" />}>Cancel</Button>
            </Link>
            <Button size="sm" leftIcon={<Save className="h-4 w-4" />}>Create Order</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card padding="none">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Order Items</h3>
              <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>Add Item</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.sku}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <input type="number" value={item.quantity} className="w-20 h-8 rounded border border-gray-200 px-2 text-sm focus:outline-none focus:border-indigo-300" />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">${item.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50/50 flex flex-col items-end space-y-2">
              <div className="flex justify-between w-full max-w-[240px] text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-medium text-gray-900">$99.98</span>
              </div>
              <div className="flex justify-between w-full max-w-[240px] text-sm">
                <span className="text-gray-500">Shipping:</span>
                <span className="font-medium text-gray-900">$10.00</span>
              </div>
              <div className="flex justify-between w-full max-w-[240px] pt-2 border-t border-gray-200 text-base font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-indigo-600">$109.98</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment & Notes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Select
                label="Payment Method"
                id="payment"
                options={[
                  { label: 'Credit Card', value: 'card' },
                  { label: 'PayPal', value: 'paypal' },
                  { label: 'Bank Transfer', value: 'bank' },
                  { label: 'Cash on Delivery', value: 'cod' },
                ]}
              />
              <Select
                label="Payment Status"
                id="p_status"
                options={[
                  { label: 'Paid', value: 'paid' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Unpaid', value: 'unpaid' },
                ]}
              />
            </div>
            <Textarea label="Order Notes" id="notes" placeholder="Add any specific instructions or internal notes..." />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Customer Details</h3>
              <button className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1">
                <UserPlus className="h-3 w-3" /> New
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-indigo-300"
                />
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">john.doe@example.com</p>
                <p className="text-xs text-gray-400 mt-2">123 Main St, New York, NY 10001</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Shipping Method</h3>
            <Select
              id="shipping"
              options={[
                { label: 'Standard Shipping (3-5 days)', value: 'standard' },
                { label: 'Express Shipping (1-2 days)', value: 'express' },
                { label: 'Local Pickup', value: 'pickup' },
              ]}
            />
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Tags</h3>
            <Input id="tags" placeholder="e.g. VIP, Urgent, International" />
          </Card>
        </div>
      </div>
    </>
  );
}
