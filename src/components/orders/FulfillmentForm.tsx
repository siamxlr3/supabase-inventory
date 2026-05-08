'use client';

import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Select, 
  Loader,
  Card
} from '@/components/ui';
import { 
  X, 
  Truck, 
  Package, 
  Hash, 
  Link as LinkIcon,
  CheckCircle2
} from 'lucide-react';
import { useCreateFulfillmentMutation } from '@/store/api/fulfillmentApi';
import { Order } from '@/models/order';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface FulfillmentFormProps {
  order: Order;
  onClose: () => void;
}

export const FulfillmentForm: React.FC<FulfillmentFormProps> = ({ order, onClose }) => {
  const [createFulfillment, { isLoading: isSubmitting }] = useCreateFulfillmentMutation();
  const [formData, setFormData] = useState({
    tracking_number: '',
    tracking_company: '',
    tracking_url: '',
  });

  // Track quantities to fulfill for each line item
  const [itemsToFulfill, setItemsToFulfill] = useState<Record<string, number>>(
    order.line_items?.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {}) || {}
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const line_items = Object.entries(itemsToFulfill)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        order_line_item_id: id,
        quantity: qty,
      }));

    if (line_items.length === 0) {
      return toast.error('Please specify quantities for at least one item');
    }

    try {
      await createFulfillment({
        order_id: order.id,
        ...formData,
        line_items,
      }).unwrap();
      toast.success('Fulfillment created and stock adjusted');
      onClose();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create fulfillment');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden max-w-2xl w-full mx-4"
    >
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Create Fulfillment</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Tracking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Tracking Number" 
            placeholder="e.g. 1Z999AA10123456784"
            leftIcon={<Hash className="h-4 w-4" />}
            value={formData.tracking_number}
            onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
          />
          <Input 
            label="Carrier / Company" 
            placeholder="e.g. FedEx, UPS, DHL"
            leftIcon={<Truck className="h-4 w-4" />}
            value={formData.tracking_company}
            onChange={(e) => setFormData({...formData, tracking_company: e.target.value})}
          />
          <div className="md:col-span-2">
            <Input 
              label="Tracking URL" 
              placeholder="https://tracker.com/shipment/..."
              leftIcon={<LinkIcon className="h-4 w-4" />}
              value={formData.tracking_url}
              onChange={(e) => setFormData({...formData, tracking_url: e.target.value})}
            />
          </div>
        </div>

        {/* Item Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-gray-400" />
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Quantities to Ship</h4>
          </div>
          <div className="divide-y divide-gray-50 border rounded-2xl overflow-hidden">
            {order.line_items?.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between bg-white">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-400 font-mono italic">Order Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400">Ship:</span>
                  <input 
                    type="number"
                    min="0"
                    max={item.quantity}
                    value={itemsToFulfill[item.id] || 0}
                    onChange={(e) => setItemsToFulfill({ ...itemsToFulfill, [item.id]: parseInt(e.target.value) || 0 })}
                    className="w-16 h-8 text-center text-xs font-bold border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Discard</Button>
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={isSubmitting}
            leftIcon={isSubmitting ? <Loader size="sm" /> : <CheckCircle2 className="h-4 w-4" />}
          >
            {isSubmitting ? 'Processing...' : 'Mark as Shipped'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
