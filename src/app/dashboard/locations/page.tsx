'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  DataTable, 
  Button, 
  Badge, 
  Card, 
  Input,
  Modal,
  Loader
} from '@/components/ui';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  ChevronRight,
  Truck
} from 'lucide-react';
import { 
  useGetLocationsQuery, 
  useCreateLocationMutation, 
  useUpdateLocationMutation, 
  useDeleteLocationMutation 
} from '@/store/api/locationApi';
import { Location } from '@/models/location';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const { data, isLoading, isFetching } = useGetLocationsQuery({
    page,
    search,
  });

  const [createLocation, { isLoading: isCreating }] = useCreateLocationMutation();
  const [updateLocation, { isLoading: isUpdating }] = useUpdateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();

  const handleOpenModal = (location?: Location) => {
    setSelectedLocation(location || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLocation(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(id).unwrap();
        toast.success('Location deleted successfully');
      } catch (err) {
        // Error handled by baseApi
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get('name') as string,
      address1: formData.get('address1') as string,
      city: formData.get('city') as string,
      country_code: formData.get('country_code') as string,
      active: formData.get('active') === 'on',
      fulfills_online_orders: formData.get('fulfills_online_orders') === 'on',
    };

    try {
      if (selectedLocation) {
        await updateLocation({ id: selectedLocation.id, body }).unwrap();
        toast.success('Location updated successfully');
      } else {
        await createLocation(body).unwrap();
        toast.success('Location created successfully');
      }
      handleCloseModal();
    } catch (err) {
      // Error handled by baseApi
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Location',
      cell: (row: Location) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">{row.city}, {row.country_code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'address1',
      header: 'Address',
      cell: (row: Location) => (
        <span className="text-sm text-gray-600">{row.address1}</span>
      ),
    },
    {
      key: 'fulfills_online_orders',
      header: 'Fulfillment',
      cell: (row: Location) => (
        <div className="flex items-center gap-2">
          {row.fulfills_online_orders ? (
            <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
              <Truck className="h-3 w-3 mr-1" /> Online
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-400">Store Only</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      cell: (row: Location) => (
        <div className="flex items-center gap-2">
          {row.active ? (
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium">Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-400">
              <XCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Inactive</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (row: Location) => (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleOpenModal(row)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDelete(row.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Inventory Locations"
        description="Manage your warehouses, retail stores, and fulfillment centers."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Locations' },
        ]}
        actions={
          <Button 
            onClick={() => handleOpenModal()} 
            leftIcon={<Plus className="h-4 w-4" />}
            className="shadow-sm shadow-indigo-100"
          >
            Add Location
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-100">Total Locations</p>
              <h3 className="text-2xl font-bold">{data?.meta?.total_count || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Units</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {data?.data?.filter(l => l.active).length || 0}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fulfillment Centers</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {data?.data?.filter(l => l.fulfills_online_orders).length || 0}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-gray-100 overflow-hidden" padding="none">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, city or address..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>
              Filters
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading || isFetching}
          pagination={{
            currentPage: page,
            totalPages: data?.meta?.total_pages || 1,
            onPageChange: setPage,
          }}
          emptyState={
            <div className="py-20 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No locations found</h3>
              <p className="text-sm text-gray-500 mt-1">Start by adding a new warehouse or store location.</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => handleOpenModal()}
              >
                Add Your First Location
              </Button>
            </div>
          }
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedLocation ? 'Edit Location' : 'Add New Location'}
        description="Locations are required before you can manage inventory stock."
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              name="name"
              label="Location Name"
              placeholder="e.g. Main Warehouse"
              defaultValue={selectedLocation?.name}
              required
            />
            <Input
              name="address1"
              label="Address"
              placeholder="e.g. 123 Business Way"
              defaultValue={selectedLocation?.address1}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="city"
                label="City"
                placeholder="e.g. New York"
                defaultValue={selectedLocation?.city}
                required
              />
              <Input
                name="country_code"
                label="Country Code"
                placeholder="e.g. US"
                defaultValue={selectedLocation?.country_code}
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-indigo-600 shadow-sm group-hover:border-indigo-200 transition-colors">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Active Status</p>
                  <p className="text-xs text-gray-500">Allow inventory to be tracked here</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                name="active" 
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                defaultChecked={selectedLocation ? selectedLocation.active : true}
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-indigo-600 shadow-sm group-hover:border-indigo-200 transition-colors">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Fulfill Online Orders</p>
                  <p className="text-xs text-gray-500">Use this stock for e-commerce sales</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                name="fulfills_online_orders" 
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                defaultChecked={selectedLocation?.fulfills_online_orders}
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating || isUpdating}>
              {selectedLocation ? 'Update Location' : 'Create Location'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
