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
  Save, 
  Building2, 
  Mail, 
  Phone, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { useCreateSupplierMutation, useUpdateSupplierMutation } from '@/store/api/supplierApi';
import { Supplier, CreateSupplierDTO } from '@/models/supplier';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface SupplierFormProps {
  supplier?: Supplier;
  onClose: () => void;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onClose }) => {
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const isLoading = isCreating || isUpdating;

  const [formData, setFormData] = useState<CreateSupplierDTO>({
    name: supplier?.name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    currency_code: supplier?.currency_code || 'USD',
    payment_terms: supplier?.payment_terms || '',
    status: supplier?.status || 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (supplier) {
        await updateSupplier({ id: supplier.id, body: formData }).unwrap();
        toast.success('Supplier updated successfully');
      } else {
        await createSupplier(formData).unwrap();
        toast.success('Supplier created successfully');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.data?.message || 'Something went wrong');
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
          <Building2 className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
            {supplier ? 'Edit Supplier' : 'Add New Supplier'}
          </h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Input 
              label="Supplier Name" 
              placeholder="e.g. Acme Corp"
              leftIcon={<Building2 className="h-4 w-4" />}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <Input 
            label="Email Address" 
            type="email"
            placeholder="contact@acme.com"
            leftIcon={<Mail className="h-4 w-4" />}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />

          <Input 
            label="Phone Number" 
            placeholder="+1 (555) 000-0000"
            leftIcon={<Phone className="h-4 w-4" />}
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />

          <Select 
            label="Default Currency"
            value={formData.currency_code}
            onChange={(e) => setFormData({...formData, currency_code: e.target.value})}
            options={[
              { label: 'USD - US Dollar', value: 'USD' },
              { label: 'EUR - Euro', value: 'EUR' },
              { label: 'GBP - British Pound', value: 'GBP' },
              { label: 'CAD - Canadian Dollar', value: 'CAD' },
              { label: 'AUD - Australian Dollar', value: 'AUD' },
            ]}
          />

          <Select 
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />

          <div className="md:col-span-2">
            <Input 
              label="Payment Terms" 
              placeholder="e.g. Net 30, Due on Receipt"
              leftIcon={<CreditCard className="h-4 w-4" />}
              value={formData.payment_terms}
              onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={isLoading}
            leftIcon={isLoading ? <Loader size="sm" /> : <Save className="h-4 w-4" />}
          >
            {isLoading ? 'Saving...' : 'Save Supplier'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
