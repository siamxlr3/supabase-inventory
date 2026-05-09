'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  Button, 
  Badge, 
  TableSkeleton,
  Card 
} from '@/components/ui';
import { SearchInput } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { 
  Truck, 
  Package, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ListOrdered,
  MapPin,
  ClipboardList,
  PackageSearch
} from 'lucide-react';
import { 
  useGetFulfillmentOrdersQuery 
} from '@/store/api/fulfillmentApi';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FulfillmentForm } from '@/components/orders/FulfillmentForm';
import { useRealtime } from '@/hooks/useRealtime';

export default function FulfillmentsPage() {
  // Real-time subscriptions
  useRealtime('fulfillment_orders', ['Fulfillment', 'Order']);
  useRealtime('fulfillments', ['Fulfillment', 'Order']);

  const [activeTab, setActiveTab] = useState<'queue' | 'shipments'>('queue');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  // State for fulfillment modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: queueResponse, isLoading: isQueueLoading } = useGetFulfillmentOrdersQuery({
    page,
    status: activeTab === 'queue' ? 'open' : 'all',
    search: debouncedSearch,
    from_date: fromDate,
    to_date: toDate
  });

  const orders = queueResponse?.data || [];
  const meta = queueResponse?.meta || { total: 0, total_pages: 1 };

  // Safety: Track processed fulfillment order IDs to prevent duplicates in UI
  const processedFOIds = new Set();
  const flatRows: any[] = [];
  
  orders.forEach((fo: any) => {
    if (processedFOIds.has(fo.id)) return;
    processedFOIds.add(fo.id);
    
    const order = fo.order;
    const shipments = order?.fulfillments || [];
    
    // Filter shipments by search if on shipments tab
    const filteredShipments = activeTab === 'shipments' && search 
        ? shipments.filter((s: any) => 
            s.tracking_number?.toLowerCase().includes(search.toLowerCase()) || 
            s.tracking_company?.toLowerCase().includes(search.toLowerCase())
          )
        : shipments;

    if (filteredShipments.length === 0) {
        if (activeTab === 'queue') {
            flatRows.push({
                fo,
                order,
                shipment: null,
                shipmentIndex: 0,
                totalShipments: 1
            });
        }
    } else {
        filteredShipments.forEach((s: any, sIdx: number) => {
            flatRows.push({
                fo,
                order,
                shipment: s,
                shipmentIndex: sIdx,
                totalShipments: filteredShipments.length
            });
        });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: any = {
      shipped: { className: 'bg-blue-50 text-blue-700 border-blue-100' },
      delivered: { className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      pending: { className: 'bg-amber-50 text-amber-700 border-amber-100' },
      open: { className: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    };
    const style = variants[status] || variants.pending;
    return <Badge variant="outline" className={cn("capitalize text-[10px] px-2 py-0", style.className)}>{status}</Badge>;
  };

  return (
    <>
      <PageHeader
        title="Fulfillments"
        description="Centralized warehouse operations and shipment tracking"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fulfillments' },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export Data</Button>
        }
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Requests</p>
              <h3 className="text-2xl font-bold text-gray-900">{queueResponse?.meta?.total || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Shipments</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {orders.reduce((acc: number, fo: any) => acc + (fo.order?.fulfillments?.filter((f: any) => f.status === 'shipped').length || 0), 0)}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-gray-100 shadow-sm bg-indigo-600 border-none">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Completed Today</p>
              <h3 className="text-2xl font-bold text-white">
                {orders.reduce((acc: number, fo: any) => acc + (fo.order?.fulfillments?.filter((f: any) => f.status === 'delivered').length || 0), 0)}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs and Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 pt-4 border-b border-gray-50 flex items-center gap-8 bg-gray-50/30">
          <button 
            onClick={() => { setActiveTab('queue'); setPage(1); }}
            className={cn(
              "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
              activeTab === 'queue' ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Warehouse Queue
            {activeTab === 'queue' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
          </button>
          <button 
            onClick={() => { setActiveTab('shipments'); setPage(1); }}
            className={cn(
              "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
              activeTab === 'shipments' ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Shipment History
            {activeTab === 'shipments' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex-1 max-w-md">
            <SearchInput 
              placeholder={activeTab === 'queue' ? "Search warehouse queue..." : "Search tracking numbers..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
                <input 
                    type="date" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-medium focus:border-indigo-500 focus:outline-none"
                />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
                <input 
                    type="date" 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-medium focus:border-indigo-500 focus:outline-none"
                />
            </div>
            <Button variant="outline" size="sm" onClick={() => { setFromDate(''); setToDate(''); }} className="text-gray-400">Clear</Button>
            <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>Advanced</Button>
          </div>
        </div>

        {isQueueLoading ? (
          <div className="p-8">
            <TableSkeleton columns={8} rows={8} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Warehouse / Request</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Order / Date</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Req Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Shipment / Carrier</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Tracking</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Ship Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {flatRows.length === 0 ? (
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td colSpan={7} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <PackageSearch className="h-8 w-8 text-gray-200" />
                          <p className="text-sm font-bold text-gray-900">No fulfillment data found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    flatRows.map((row, i) => {
                      const { fo, order, shipment, shipmentIndex, totalShipments } = row;
                      const isFirstShipment = shipmentIndex === 0;

                      return (
                        <motion.tr 
                          key={`${fo.id}-${shipmentIndex}`}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "hover:bg-gray-50/30 transition-colors text-xs",
                            isFirstShipment && i > 0 ? "border-t border-gray-200" : ""
                          )}
                        >
                          {/* Fulfillment Order / Warehouse - Grouped */}
                          {isFirstShipment && (
                            <>
                              <td className="px-4 py-3 align-top bg-white/50" rowSpan={totalShipments}>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                                    <MapPin className="h-3 w-3 text-indigo-500" />
                                    <span>{fo.location?.name}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top bg-white/50" rowSpan={totalShipments}>
                                <div className="flex flex-col">
                                  <span className="text-gray-900 font-bold">{order?.name}</span>
                                  <span className="text-[10px] text-gray-400">{format(new Date(fo.created_at), 'MMM d, h:mm a')}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top bg-white/50" rowSpan={totalShipments}>
                                {getStatusBadge(fo.status)}
                              </td>
                            </>
                          )}

                          {/* Shipment details - Individual rows */}
                          <td className="px-4 py-3 align-top border-l border-gray-50/50">
                            {shipment ? (
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-700 capitalize">{shipment.tracking_company || 'Standard'}</span>
                                </div>
                            ) : (
                                <span className="text-gray-400 italic">No shipments yet</span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            {shipment?.tracking_number ? (
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-gray-600 font-medium">{shipment.tracking_number}</span>
                                    {shipment.tracking_url && (
                                        <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600">
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            {shipment ? getStatusBadge(shipment.status) : null}
                          </td>
                          <td className="px-4 py-3 align-top text-right">
                             {isFirstShipment && fo.status === 'open' && (
                                <div className="flex items-center justify-end gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => setSelectedOrder(order)}
                                        className="text-[10px] h-7 px-3 bg-indigo-50/50 border-indigo-100 text-indigo-700 hover:bg-indigo-100"
                                    >
                                        Fulfill Items
                                    </Button>
                                    <Link href={`/dashboard/orders/${fo.order_id}`}>
                                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </Link>
                                </div>
                             )}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400">
            Showing {flatRows.length} shipment records
          </p>
          <Pagination 
            currentPage={page} 
            totalPages={meta.total_pages || 1} 
            onPageChange={setPage} 
          />
        </div>
      </div>

      {/* Fulfillment Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
            <FulfillmentForm 
                order={selectedOrder} 
                onClose={() => setSelectedOrder(null)} 
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
