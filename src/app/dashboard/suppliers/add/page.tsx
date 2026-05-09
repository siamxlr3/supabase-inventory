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
  X, 
  Building2, 
  Mail, 
  Phone, 
  CreditCard,
  Globe,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateSupplierMutation } from '@/store/api/supplierApi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AddSupplierPage() {
  const router = useRouter();
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currency_code: 'USD',
    payment_terms: '',
    status: 'active' as 'active' | 'inactive',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier(formData).unwrap();
      toast.success('Supplier created successfully');
      router.push('/dashboard/suppliers');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create supplier');
    }
  };

  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <>
      <PageHeader
        title="Add New Supplier"
        description="Onboard a new vendor and configure procurement terms"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Suppliers', href: '/dashboard/suppliers' },
          { label: 'Add Supplier' },
        ]}
        actions={
          <>
            <Link href="/dashboard/suppliers">
              <Button variant="outline" size="sm">Cancel</Button>
            </Link>
            <Button 
              size="sm" 
              onClick={handleSubmit} 
              disabled={isCreating}
              leftIcon={isCreating ? <Loader size="sm" /> : <Save className="h-4 w-4" />}
            >
              {isCreating ? 'Creating...' : 'Save Supplier'}
            </Button>
          </>
        }
      />

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">General Information</h3>
            </div>
            <div className="p-6 space-y-6">
              <Input 
                label="Supplier Name" 
                placeholder="e.g. Global Logistics Inc"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Email Address" 
                  type="email"
                  placeholder="contact@global.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
                <Input 
                  label="Phone Number" 
                  placeholder="+1 (555) 000-0000"
                  leftIcon={<Phone className="h-4 w-4" />}
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Financial Terms</h3>
            </div>
            <div className="p-6 space-y-6">
              <Input 
                label="Payment Terms" 
                placeholder="e.g. Net 30, Due on Receipt"
                value={formData.payment_terms}
                onChange={(e) => handleChange('payment_terms', e.target.value)}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status & Region</h3>
            </div>
            <div className="p-6 space-y-6">
              <Select 
                label="Current Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />
              <Select 
                label="Settlement Currency"
                value={formData.currency_code}
                onChange={(e) => handleChange('currency_code', e.target.value)}
                options={[
                  { label: 'USD - US Dollar', value: 'USD' },
                  { label: 'EUR - Euro', value: 'EUR' },
                  { label: 'GBP - British Pound', value: 'GBP' },
                  { label: 'CAD - Canadian Dollar', value: 'CAD' },
                ]}
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
