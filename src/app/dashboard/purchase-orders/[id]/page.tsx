'use client';

import React from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Badge, 
  Loader
} from '@/components/ui';
import { 
  Package, 
  CheckCircle2, 
  Trash2, 
  Building2,
  MapPin,
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  useGetPurchaseOrderByIdQuery, 
  useDeletePurchaseOrderMutation
} from '@/store/api/purchaseOrderApi';
import { toast } from 'react-hot-toast';

export default function PODetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: response, isLoading } = useGetPurchaseOrderByIdQuery(id as string, {
    skip: !id || id === 'undefined'
  });
  const [deletePO, { isLoading: isDeleting }] = useDeletePurchaseOrderMutation();

  const po = response?.data;

  const handleDelete = async () => {
    if (window.confirm('Delete this purchase order?')) {
      try {
        await deletePO(id as string).unwrap();
        toast.success('Purchase order deleted');
        router.push('/dashboard/purchase-orders');
      } catch (err) {
        toast.error('Failed to delete PO');
      }
    }
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader size="lg" /></div>;
  if (!po) return <div className="p-12 text-center text-gray-400">Purchase order not found.</div>;

  const isReceived = po.status === 'received';

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={`Purchase Order: ${po.name}`}
        description={`Created on ${new Date(po.created_at).toLocaleDateString()}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase Orders', href: '/dashboard/purchase-orders' },
          { label: po.name }
        ]}
        actions={
          <div className="flex gap-2">
            {!isReceived && (
              <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting} className="text-red-500 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Badge variant={isReceived ? 'success' : 'default'} className="px-4 py-2 text-xs font-bold uppercase tracking-widest gap-2">
              {isReceived ? <CheckCircle2 className="h-4 w-4" /> : <Package className="h-4 w-4" />}
              {po.status}
            </Badge>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto">
        <Card className="overflow-hidden border-gray-100 shadow-sm">
          {/* Order Info */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supplier</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{po.supplier?.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{po.destination?.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Arrival</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {po.estimated_arrival_date ? new Date(po.estimated_arrival_date).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Currency</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{po.currency_code}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center shrink-0">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                <Badge 
                  variant={isReceived ? 'success' : 'default'} 
                  className="mt-1 uppercase text-[10px] font-black tracking-widest"
                >
                  {po.status}
                </Badge>
              </div>
            </div>
            {po.note && (
              <div className="flex items-start gap-3 md:col-span-2 lg:col-span-1">
                <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Note</p>
                  <p className="text-sm text-gray-600 mt-0.5 italic">"{po.note}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="px-6 py-4 border-t border-b border-gray-100 bg-gray-50/30">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Line Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3 text-center">Ordered</th>
                  <th className="px-6 py-3 text-center">Received</th>
                  <th className="px-6 py-3 text-right">Unit Cost</th>
                  <th className="px-6 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {po.line_items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{item.product_variant?.title || '—'}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{item.product_variant?.sku || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium">{item.quantity}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge 
                        variant={item.quantity_received >= item.quantity ? 'success' : 'warning'}
                        className="px-2 py-0.5 text-[10px]"
                      >
                        {item.quantity_received}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">${Number(item.unit_cost).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      ${(item.quantity * Number(item.unit_cost)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Footer */}
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/20 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{po.line_items?.length || 0} item(s)</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Cost</span>
              <span className="text-xl font-black text-indigo-600">${Number(po.total_cost).toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
