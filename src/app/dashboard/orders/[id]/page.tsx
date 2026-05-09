'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Badge, 
  Loader 
} from '@/components/ui';
import { 
  ArrowLeft, 
  Package, 
  ShoppingCart,
  Truck, 
  CreditCard, 
  Mail, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Hash,
  MapPin,
  Clock,
  Printer,
  ChevronRight,
  X,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useGetOrderQuery, useConfirmOrderMutation, useCancelOrderMutation, useDeleteOrderMutation, useUpdateOrderMutation } from '@/store/api/orderApi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { FinancialStatus } from '@/models/order';

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: response, isLoading: isLoadingOrder } = useGetOrderQuery(id as string);
  const [confirmOrder, { isLoading: isConfirming }] = useConfirmOrderMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [showFulfillmentForm, setShowFulfillmentForm] = useState(false);

  const order = response?.data;

  const handleConfirm = async () => {
    try {
      await confirmOrder(id as string).unwrap();
      toast.success('Order confirmed. Inventory has been updated.');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to confirm order');
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order? Inventory will be restored and status will be set to Voided.')) {
        try {
            await cancelOrder(id as string).unwrap();
            toast.success('Order cancelled and inventory restored');
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to cancel order');
        }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this order? This cannot be undone.')) {
      try {
        await deleteOrder(id as string).unwrap();
        toast.success('Order deleted successfully');
        router.push('/dashboard/orders');
      } catch (err) {
        toast.error('Failed to delete order');
      }
    }
  };

  if (isLoadingOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader className="h-8 w-8 text-indigo-600" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Order not found</h3>
        <p className="text-sm text-gray-500 mb-6">The order you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => router.push('/dashboard/orders')}>Back to Orders</Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={order.name}
        description={`Order processed on ${format(new Date(order.created_at), 'MMMM d, yyyy')}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders', href: '/dashboard/orders' },
          { label: order.name },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>Print</Button>
            {!order.processed_at && order.financial_status !== 'voided' && (
              <Button 
                size="sm" 
                onClick={handleConfirm} 
                disabled={isConfirming}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                leftIcon={isConfirming ? <Loader size="sm" /> : <CheckCircle2 className="h-4 w-4" />}
              >
                {isConfirming ? 'Processing...' : 'Confirm Order'}
              </Button>
            )}
            {!order.processed_at && (
              <>
                {order.financial_status !== 'voided' && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancel} 
                        disabled={isCancelling} 
                        className="text-amber-600 border-amber-100 hover:bg-amber-50"
                        leftIcon={isCancelling ? <Loader size="sm" /> : <X className="h-4 w-4" />}
                    >
                        Cancel Order
                    </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting} className="text-red-600 border-red-100 hover:bg-red-50">Delete</Button>
              </>
            )}
          </>
        }
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Line Items</h3>
              </div>
              <Badge variant="outline" className="text-[10px]">{order.line_items?.length} items</Badge>
            </div>
            <div className="divide-y divide-gray-50">
              {order.line_items?.map((item) => (
                <div key={item.id} className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                    <p className="text-[10px] text-gray-400 font-mono tracking-tight">{item.sku || 'No SKU'}</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Qty</p>
                      <p className="text-sm font-bold text-gray-900">x{item.quantity}</p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Total</p>
                      <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50/50 border-t border-gray-50">
              <div className="max-w-[240px] ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900">${parseFloat(order.subtotal_price.toString()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Tax</span>
                  <span className="font-bold text-gray-900">${parseFloat(order.total_tax.toString()).toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Total</span>
                  <span className="text-xl font-bold text-indigo-600">${parseFloat(order.total_price.toString()).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Details</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Status</span>
                  <select 
                    value={order.financial_status}
                    onChange={async (e) => {
                        try {
                            await updateOrder({ 
                                id: order.id, 
                                body: { financial_status: e.target.value as FinancialStatus } 
                            }).unwrap();
                            toast.success('Payment status updated');
                        } catch (err: any) {
                            toast.error(err.data?.message || 'Failed to update payment status');
                        }
                    }}
                    disabled={isUpdating || order.financial_status === 'voided'}
                    className={cn(
                        "text-[10px] font-bold uppercase tracking-wider rounded-lg border-none bg-transparent focus:ring-0 cursor-pointer p-0 text-right",
                        order.financial_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                    )}
                  >
                    <option value="pending">Pending</option>
                    <option value="authorized">Authorized</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partial</option>
                    <option value="refunded">Refunded</option>
                    <option value="voided" disabled>Voided</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Method</span>
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">{order.payment_method?.replace('_', ' ') || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Reference</span>
                  <span className="text-[10px] font-mono text-gray-400">{order.payment_reference || '—'}</span>
                </div>
              </div>
            </Card>

            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fulfillment</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Status</span>
                  <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider", order.fulfillment_status === 'fulfilled' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100')}>
                    <span className={cn("h-1 w-1 rounded-full", order.fulfillment_status === 'fulfilled' ? 'bg-emerald-500' : 'bg-amber-500')} />
                    {order.fulfillment_status.replace('_', ' ')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Location</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs font-bold text-gray-900">{order.location?.name || 'Unknown Location'}</span>
                  </div>
                </div>
              </div>
            </Card>

            {(order as any).fulfillments?.length > 0 && (
              <Card className="border-gray-100 shadow-sm overflow-hidden bg-white">
                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipments</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {(order as any).fulfillments.map((f: any) => (
                    <div key={f.id} className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{f.tracking_company || 'Standard'}</span>
                        <Badge variant="outline" className="text-[10px] py-0">{f.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{f.tracking_number || 'No Tracking'}</span>
                        {f.tracking_url && (
                          <a href={f.tracking_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card className="border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {order.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{order.email}</p>
                  <p className="text-[10px] text-gray-400 italic">Customer details from record</p>
                </div>
              </div>
              <Button variant="outline" className="w-full text-xs h-9">View Customer Profile</Button>
            </div>
          </Card>

          <Card className="border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Timeline</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
                <div className="flex gap-4 relative">
                  <div className="h-4 w-4 rounded-full bg-emerald-500 border-4 border-white flex-shrink-0 z-10" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900">Order Created</p>
                    <p className="text-[10px] text-gray-400">{format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>
                {order.processed_at && (
                  <div className="flex gap-4 relative">
                    <div className="h-4 w-4 rounded-full bg-emerald-500 border-4 border-white flex-shrink-0 z-10" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-900">Inventory Allocated</p>
                      <p className="text-[10px] text-gray-400">{format(new Date(order.processed_at), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>
                )}
                {!order.processed_at && (
                  <div className="flex gap-4 relative">
                    <div className="h-4 w-4 rounded-full bg-amber-400 border-4 border-white flex-shrink-0 z-10" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-900">Awaiting Confirmation</p>
                      <p className="text-[10px] text-gray-400">Order is in draft status</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
            <h4 className="text-[11px] font-bold text-indigo-900 uppercase tracking-widest mb-2">Order Summary</h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              This order will deduct inventory from your primary store location once confirmed. 
              Stock validation will be performed during the confirmation step.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
