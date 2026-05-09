'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useGetCustomerQuery, useUpdateCustomerMutation } from '@/store/api/customerApi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Customer } from '@/models/customer';

interface CustomerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zip_code: string;
  status: 'active' | 'inactive';
  fulfills_online_orders: boolean;
}

export default function EditCustomerPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const { data: response, isLoading: isLoadingCustomer } = useGetCustomerQuery(id as string);
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const [formData, setFormData] = useState<CustomerFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zip_code: '',
    status: 'active',
    fulfills_online_orders: false,
  });

  useEffect(() => {
    if (response?.data) {
      const customer = response.data;
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || '',
        zip_code: customer.zip_code || '',
        status: customer.status || 'active',
        fulfills_online_orders: customer.fulfills_online_orders || false,
      });
    }
  }, [response]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [id]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCustomer({ id: id as string, body: formData as Partial<Customer> }).unwrap();
      toast.success('Customer updated successfully');
      router.push('/dashboard/customers');
    } catch (err) {
      // Error handled by baseApi
    }
  };

  if (isLoadingCustomer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader className="h-8 w-8 text-indigo-600" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading customer profile...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit ${formData.first_name} ${formData.last_name}`}
        description="Update customer details and preferences"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Customers', href: '/dashboard/customers' },
          { label: 'Edit Customer' },
        ]}
        actions={
          <>
            <Link href="/dashboard/customers">
              <Button variant="outline" size="sm" leftIcon={<X className="h-4 w-4" />}>Cancel</Button>
            </Link>
            <Button 
              size="sm" 
              onClick={handleSubmit} 
              disabled={isUpdating}
              leftIcon={isUpdating ? <Loader size="sm" /> : <Save className="h-4 w-4" />}
            >
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Personal Information</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input 
                    label="First Name" 
                    id="first_name" 
                    placeholder="e.g. John" 
                    value={formData.first_name} 
                    onChange={handleChange} 
                    required 
                  />
                  <Input 
                    label="Last Name" 
                    id="last_name" 
                    placeholder="e.g. Doe" 
                    value={formData.last_name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        required
                        className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address & Location</h3>
              </div>
              <div className="p-6 space-y-6">
                <Input 
                  label="Street Address" 
                  id="address" 
                  placeholder="123 Main St, Apt 4" 
                  value={formData.address} 
                  onChange={handleChange} 
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Input 
                    label="City" 
                    id="city" 
                    placeholder="New York" 
                    value={formData.city} 
                    onChange={handleChange} 
                  />
                  <Input 
                    label="Country" 
                    id="country" 
                    placeholder="United States" 
                    value={formData.country} 
                    onChange={handleChange} 
                  />
                  <Input 
                    label="ZIP / Postal Code" 
                    id="zip_code" 
                    placeholder="10001" 
                    value={formData.zip_code} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-8">
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Settings</h3>
              </div>
              <div className="p-6 space-y-8">
                <Select 
                  label="Member Status" 
                  id="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' }
                  ]}
                />
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">Online Orders</span>
                    <span className="text-[10px] text-gray-400">Allow web fulfillment</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="fulfills_online_orders"
                      checked={formData.fulfills_online_orders}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </Card>

            <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
              <h4 className="text-[11px] font-bold text-indigo-900 uppercase tracking-widest mb-2">History</h4>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Profile created on {response?.data?.created_at ? format(new Date(response.data.created_at), 'MMMM d, yyyy') : '—'}.
                Last updated on {response?.data?.updated_at ? format(new Date(response.data.updated_at), 'MMMM d, yyyy') : '—'}.
              </p>
            </div>
          </div>
        </div>

      </form>
    </>
  );
}
