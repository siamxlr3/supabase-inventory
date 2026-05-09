'use client';

import React, { useState } from 'react';
import { PageHeader, Button } from '@/components/ui';
import { Input, SearchInput } from '@/components/ui/Input';
import { useCreateRefundMutation } from '@/store/api/refundApi';
import { useGetOrdersQuery } from '@/store/api/orderApi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Package, Search, Plus, Save, Minus } from 'lucide-react';
import Link from 'next/link';

export default function InitiateReturnPage() {
  const router = useRouter();
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Refund form state
  const [note, setNote] = useState('');
  const [restock, setRestock] = useState(true);
  const [dutiesRefunded, setDutiesRefunded] = useState(0);
  const [lineItems, setLineItems] = useState<Record<string, number>>({});
  
  const { data: ordersData, isLoading: isOrdersLoading } = useGetOrdersQuery({ search: orderSearch, per_page: 5 });
  const [createRefund, { isLoading: isSubmitting }] = useCreateRefundMutation();
  
  const orders = ordersData?.data || [];
  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;

  const handleLineItemQtyChange = (id: string, max: number, val: string) => {
    const qty = parseInt(val, 10);
    if (isNaN(qty) || qty < 0) return;
    if (qty > max) {
      toast.error(`Maximum returnable quantity for this item is ${max}`);
      return;
    }
    
    setLineItems(prev => ({
      ...prev,
      [id]: qty
    }));
  };

  const calculateTotalRefund = () => {
    if (!selectedOrder) return 0;
    let total = Number(dutiesRefunded) || 0;
    
    Object.entries(lineItems).forEach(([id, qty]) => {
      if (qty > 0) {
        const item = selectedOrder.line_items.find((li: any) => li.id === id);
        if (item) {
          const pricePerItem = item.price - (item.total_discount / item.quantity);
          total += pricePerItem * qty;
        }
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    if (!selectedOrderId) {
      toast.error('Please select an order');
      return;
    }

    const itemsToRefund = Object.entries(lineItems)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        order_line_item_id: id,
        quantity: qty,
        restocked: restock
      }));

    if (itemsToRefund.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    try {
      await createRefund({
        order_id: selectedOrderId,
        note,
        restock,
        duties_refunded: Number(dutiesRefunded) || 0,
        line_items: itemsToRefund
      }).unwrap();
      
      toast.success('Return processed successfully');
      router.push('/dashboard/returns');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to process return');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <PageHeader
        title="Initiate Return"
        description="Process a customer return and refund"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Returns', href: '/dashboard/returns' },
          { label: 'Initiate Return' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Selection Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-[14px] font-semibold text-gray-900">Select Order</h3>
            </div>
            <div className="p-5">
              {!selectedOrderId ? (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full h-10 pl-9 pr-4 text-[13px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      placeholder="Search order by # or customer email..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                  </div>

                  {isOrdersLoading ? (
                    <div className="text-sm text-gray-500 text-center py-4">Searching orders...</div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-2">
                      {orders.map(order => (
                        <div 
                          key={order.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            // Initialize line items with 0
                            const initItems: Record<string, number> = {};
                            order.line_items.forEach((li: any) => { initItems[li.id] = 0; });
                            setLineItems(initItems);
                          }}
                        >
                          <div>
                            <p className="font-medium text-gray-900">{order.name}</p>
                            <p className="text-[12px] text-gray-500">{order.customer?.email || order.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[13px] font-medium">${order.total_price}</p>
                            <span className="text-[10px] uppercase text-gray-400">{order.financial_status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : orderSearch ? (
                    <div className="text-sm text-gray-500 text-center py-4">No orders found matching your search.</div>
                  ) : null}
                </>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Selected Order</p>
                    <p className="font-semibold text-indigo-700">{selectedOrder?.name}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedOrderId(null);
                      setLineItems({});
                    }}
                  >
                    Change Order
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Card */}
          {selectedOrderId && selectedOrder && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-[14px] font-semibold text-gray-900">Return Items</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const allItems: Record<string, number> = {};
                    selectedOrder.line_items.forEach((li: any) => { allItems[li.id] = li.quantity; });
                    setLineItems(allItems);
                  }}
                >
                  Return All
                </Button>
              </div>
              <div className="p-0">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-5 py-3 font-medium text-gray-500">Item</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-right">Price</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-center">Qty to Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.line_items.map((item: any) => {
                      const maxQty = item.quantity;
                      const currentQty = lineItems[item.id] || 0;
                      const priceAfterDiscount = item.price - (item.total_discount / maxQty);
                      
                      return (
                        <tr key={item.id}>
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-500">Ordered: {maxQty}</p>
                          </td>
                          <td className="px-5 py-4 text-right font-medium">
                            ${priceAfterDiscount.toFixed(2)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                className="h-7 w-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                onClick={() => handleLineItemQtyChange(item.id, maxQty, String(currentQty - 1))}
                                disabled={currentQty <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <input 
                                type="number" 
                                className="h-7 w-12 text-center border-gray-200 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={currentQty}
                                onChange={(e) => handleLineItemQtyChange(item.id, maxQty, e.target.value)}
                                min="0"
                                max={maxQty}
                              />
                              <button 
                                className="h-7 w-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                onClick={() => handleLineItemQtyChange(item.id, maxQty, String(currentQty + 1))}
                                disabled={currentQty >= maxQty}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Configuration & Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-[14px] font-semibold text-gray-900">Return Configuration</h3>
            </div>
            <div className="p-5 space-y-5">
              
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-gray-700 flex justify-between">
                  <span>Restock items</span>
                </label>
                <div className="flex items-center gap-3">
                  <button 
                    className={`flex-1 py-2 rounded-lg border text-[13px] font-medium transition-colors ${restock ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
                    onClick={() => setRestock(true)}
                  >
                    Yes, return to stock
                  </button>
                  <button 
                    className={`flex-1 py-2 rounded-lg border text-[13px] font-medium transition-colors ${!restock ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-600'}`}
                    onClick={() => setRestock(false)}
                  >
                    No, item is damaged
                  </button>
                </div>
                <p className="text-xs text-gray-500">If restocked, inventory on-hand will increase automatically.</p>
              </div>

              <div className="space-y-1.5">
                <Input
                  label="Refund Duties/Shipping (Optional)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={dutiesRefunded || ''}
                  onChange={(e) => setDutiesRefunded(parseFloat(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1.5">
                <Input
                  label="Internal Note"
                  placeholder="Reason for return..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Refund Summary</h3>
            <div className="space-y-3 mb-5 border-b border-gray-200 pb-4">
              <div className="flex justify-between text-[13px] text-gray-600">
                <span>Returned Items</span>
                <span>${(calculateTotalRefund() - (Number(dutiesRefunded) || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-gray-600">
                <span>Duties / Shipping</span>
                <span>${(Number(dutiesRefunded) || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center font-semibold text-gray-900 text-lg mb-6">
              <span>Total Refund</span>
              <span>${calculateTotalRefund().toFixed(2)}</span>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleSubmit} 
              isLoading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Process Refund
            </Button>
            <div className="mt-3 text-center">
              <Link href="/dashboard/returns" className="text-[13px] text-gray-500 hover:text-gray-900">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
