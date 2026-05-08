'use client';

import React, { useState, useEffect } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  Select, 
  Loader,
  Badge 
} from '@/components/ui';
import { 
  Save, 
  X, 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Search,
  Package,
  MapPin,
  CreditCard,
  Mail,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateOrderMutation } from '@/store/api/orderApi';
import { useGetLocationsQuery } from '@/store/api/locationApi';
import { useGetProductsQuery } from '@/store/api/productApi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AddOrderPage() {
  const router = useRouter();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const { data: locationsResponse } = useGetLocationsQuery({});
  const { data: productsResponse, isLoading: isLoadingProducts } = useGetProductsQuery({ per_page: 50 });

  const [formData, setFormData] = useState({
    email: '',
    location_id: '',
    payment_method: 'credit_card',
    currency: 'USD',
  });

  const [lineItems, setLineItems] = useState<{
    variant_id: string;
    quantity: number;
    price: number;
    title: string;
    sku?: string;
  }[]>([]);

  // Set default location
  useEffect(() => {
    if (locationsResponse?.data?.length && !formData.location_id) {
      setFormData(prev => ({ ...prev, location_id: locationsResponse.data[0].id }));
    }
  }, [locationsResponse]);

  const addLineItem = (variant: any) => {
    const exists = lineItems.find(item => item.variant_id === variant.id);
    if (exists) {
      setLineItems(lineItems.map(item => 
        item.variant_id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setLineItems([...lineItems, {
        variant_id: variant.id,
        quantity: 1,
        price: parseFloat(variant.price),
        title: variant.title,
        sku: variant.sku
      }]);
    }
    toast.success(`Added ${variant.title}`);
  };

  const removeLineItem = (variantId: string) => {
    setLineItems(lineItems.filter(item => item.variant_id !== variantId));
  };

  const updateQuantity = (variantId: string, qty: number) => {
    if (qty < 1) return;
    setLineItems(lineItems.map(item => 
      item.variant_id === variantId ? { ...item, quantity: qty } : item
    ));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      return toast.error('Please add at least one item');
    }
    if (!formData.location_id) {
      return toast.error('Please select a fulfillment location');
    }

    try {
      await createOrder({
        ...formData,
        line_items: lineItems
      }).unwrap();
      toast.success('Order created successfully');
      router.push('/dashboard/orders');
    } catch (err) {
      // Error handled by RTK Query / Global toast
    }
  };

  return (
    <>
      <PageHeader
        title="Create New Order"
        description="Draft a new customer order and allocate inventory"
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
            <Button 
              size="sm" 
              onClick={handleSubmit} 
              disabled={isCreating}
              leftIcon={isCreating ? <Loader size="sm" /> : <Save className="h-4 w-4" />}
            >
              {isCreating ? 'Creating...' : 'Create Order'}
            </Button>
          </>
        }
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Line Items & Selection */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Line Items</h3>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{lineItems.length} Items</span>
            </div>
            
            <div className="divide-y divide-gray-50">
              <AnimatePresence initial={false}>
                {lineItems.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <Package className="h-6 w-6 text-gray-200" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No items added yet</p>
                    <p className="text-xs text-gray-300 mt-1">Select products from the catalog to add them to this order</p>
                  </div>
                ) : (
                  lineItems.map((item) => (
                    <motion.div 
                      key={item.variant_id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 flex items-center gap-4"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{item.sku || 'No SKU'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-50 text-gray-500 border-r border-gray-200"
                          >-</button>
                          <input 
                            type="number" 
                            className="w-10 text-center text-xs font-bold focus:outline-none"
                            value={item.quantity}
                            readOnly
                          />
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-50 text-gray-500 border-l border-gray-200"
                          >+</button>
                        </div>
                        <div className="w-20 text-right">
                          <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-[10px] text-gray-400">${item.price.toFixed(2)} ea</p>
                        </div>
                        <button 
                          onClick={() => removeLineItem(item.variant_id)}
                          className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </Card>

          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Catalog</h3>
            </div>
            <div className="p-0 max-h-[400px] overflow-y-auto">
              {isLoadingProducts ? (
                <div className="p-8 text-center"><Loader size="sm" /></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {productsResponse?.data?.map(product => (
                    <div key={product.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">{product.title}</span>
                        <Badge variant="outline" className="text-[9px] h-4">{product.vendor}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {product.variants?.map((variant: any) => (
                          <button
                            key={variant.id}
                            onClick={() => addLineItem({ ...variant, productTitle: product.title })}
                            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all text-left group"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{variant.title}</p>
                              <p className="text-[10px] text-gray-400 font-mono">${parseFloat(variant.price).toFixed(2)}</p>
                            </div>
                            <Plus className="h-3.5 w-3.5 text-gray-300 group-hover:text-indigo-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Customer & Payment */}
        <div className="space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <Input 
                label="Email Address" 
                placeholder=""
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <Select 
                label="Fulfillment Location"
                value={formData.location_id}
                onChange={(e) => setFormData({...formData, location_id: e.target.value})}
                options={locationsResponse?.data?.map(loc => ({ label: loc.name, value: loc.id })) || []}
              />
            </div>
          </Card>

          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Method</h3>
            </div>
            <div className="p-6 space-y-4">
              <Select 
                label="Method"
                value={formData.payment_method}
                onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                options={[
                  { label: 'Credit Card', value: 'credit_card' },
                  { label: 'Bank Transfer', value: 'bank_transfer' },
                  { label: 'Cash on Delivery', value: 'cod' },
                  { label: 'Internal Account', value: 'internal' }
                ]}
              />
            </div>
          </Card>

          <Card className="border-indigo-100 shadow-sm overflow-hidden bg-indigo-50/30">
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-indigo-900/60 uppercase tracking-widest text-[10px]">Subtotal</span>
                <span className="text-indigo-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-indigo-100 flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Total</span>
                <span className="text-xl font-bold text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
