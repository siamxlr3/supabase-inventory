'use client';

import React from 'react';
import { PageHeader, Card, Button, Input, Select, Textarea } from '@/components/ui';
import { Save, X, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CreatePOPage() {
  return (
    <>
      <PageHeader
        title="Create Purchase Order"
        description="Issue a new purchase order to a supplier"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Procurement', href: '/dashboard/purchase-orders' },
          { label: 'Create PO' },
        ]}
        actions={
          <>
            <Link href="/dashboard/purchase-orders">
              <Button variant="outline" size="sm" leftIcon={<X className="h-4 w-4" />}>Cancel</Button>
            </Link>
            <Button size="sm" leftIcon={<Save className="h-4 w-4" />}>Submit PO</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Supplier Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Select Supplier"
                id="supplier"
                options={[
                  { label: 'Select supplier', value: '' },
                  { label: 'Logitech', value: 'logitech' },
                  { label: 'Anker', value: 'anker' },
                  { label: 'Satechi', value: 'satechi' },
                ]}
              />
              <Input label="Expected Delivery Date" id="expected" type="date" />
            </div>
          </Card>

          <Card padding="none">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">PO Items</h3>
              <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>Add Item</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Unit Cost</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">Wireless Mouse Pro</p>
                      <p className="text-xs text-gray-400">SKU: WMP-001</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">$25.00</td>
                    <td className="px-6 py-4">
                      <input type="number" defaultValue={100} className="w-20 h-8 rounded border border-gray-200 px-2 text-sm focus:outline-none focus:border-indigo-300" />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">$2,500.00</td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50/50 flex flex-col items-end space-y-2">
              <div className="flex justify-between w-full max-w-[240px] text-sm font-bold">
                <span className="text-gray-900">Total PO Value:</span>
                <span className="text-indigo-600">$2,500.00</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
            <Textarea label="Purchase Notes" id="notes" placeholder="Add any specific instructions for the supplier..." />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Ship to Location</h3>
            <Select
              id="location"
              options={[
                { label: 'Main Warehouse', value: 'wh-001' },
                { label: 'West Coast Hub', value: 'wh-002' },
              ]}
            />
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">PO Metadata</h3>
            <div className="space-y-4">
              <Input label="Reference Number" id="ref" placeholder="e.g. REF-12345" />
              <Select
                label="Tax Rule"
                id="tax"
                options={[
                  { label: 'Standard (10%)', value: '10' },
                  { label: 'Exempt', value: '0' },
                ]}
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
