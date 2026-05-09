'use client';

import React from 'react';
import { PageHeader, StatsCard, Card, Badge } from '@/components/ui';
import {
  Package, ShoppingCart, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, FileText,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import Link from 'next/link';

import { useGetAlertsQuery } from '@/store/api/inventoryApi';
import { useGetProductSummaryQuery } from '@/store/api/productApi';
import { useGetOrdersQuery } from '@/store/api/orderApi';
import { useGetPurchaseOrdersQuery } from '@/store/api/purchaseOrderApi';
import { useGetAnalyticsQuery } from '@/store/api/dashboardApi';
import { format, subDays } from 'date-fns';

export default function DashboardPage() {
  const [fromDate, setFromDate] = React.useState<string>('');
  const [toDate, setToDate] = React.useState<string>('');

  const { data: analyticsResponse, isFetching: isAnalyticsFetching } = useGetAnalyticsQuery({
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const revenueData = analyticsResponse?.data?.revenueData || [];
  const ordersByCategory = analyticsResponse?.data?.ordersByCategory || [];
  const { data: productSummary } = useGetProductSummaryQuery();
  const { data: activeAlerts } = useGetAlertsQuery({ resolved: false, per_page: 5 });
  const { data: pendingOrders } = useGetOrdersQuery({ fulfillment_status: 'unfulfilled', per_page: 1 });
  // Let's assume open POs are in 'sent' or 'draft' status
  const { data: openPOs } = useGetPurchaseOrdersQuery({ status: 'sent', per_page: 1 });
  const { data: recentOrdersData } = useGetOrdersQuery({ per_page: 5 });

  const summary = productSummary?.data || {
    totalProducts: 0,
    totalVariants: 0,
    outOfStock: 0,
    totalValue: 0
  };

  const alertCount = activeAlerts?.meta?.total_count || 0;
  const pendingCount = pendingOrders?.meta?.total || 0;
  const openPOCount = openPOs?.meta?.total || 0;
  const recentOrdersList = recentOrdersData?.data || [];

  const getFinancialBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">Paid</Badge>;
      case 'pending': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 text-[10px]">Pending</Badge>;
      case 'refunded': return <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 text-[10px]">Refunded</Badge>;
      default: return <Badge variant="outline" className="text-[10px] capitalize">{status.replace('_', ' ')}</Badge>;
    }
  };

  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back! Here's what's happening with your inventory." />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total SKUs"
          value={summary.totalVariants.toString()}
          change={`${summary.totalProducts} parent products`}
          changeType="neutral"
          icon={<Package className="h-5 w-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={alertCount.toString()}
          change={alertCount > 0 ? "Requires attention" : "Stock healthy"}
          changeType={alertCount > 0 ? "negative" : "positive"}
          icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
          iconBg="bg-rose-50"
        />
        <StatsCard
          title="Pending Orders"
          value={pendingCount.toString()}
          change="Unfulfilled orders"
          changeType="neutral"
          icon={<ShoppingCart className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatsCard
          title="Open POs"
          value={openPOCount.toString()}
          change="Incoming stock"
          changeType="neutral"
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-xs text-gray-500">Revenue trend based on completed orders</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
              {isAnalyticsFetching && <span className="text-[10px] text-gray-400 ml-1">Loading...</span>}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Orders by Category</h3>
            <p className="text-xs text-gray-500">Top performing categories</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-xs text-gray-500">Latest transactions</p>
            </div>
            <Link href="/dashboard/orders" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrdersList.map((order: any) => (
              <div key={order.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Guest User'}
                    </p>
                    <p className="text-xs text-gray-400">{order.name} &bull; {format(new Date(order.created_at), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 mb-1">${Number(order.total_price).toFixed(2)}</p>
                  {getFinancialBadge(order.financial_status)}
                </div>
              </div>
            ))}
            {recentOrdersList.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-gray-400">
                No recent orders found.
              </div>
            )}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Low Stock Alerts</h3>
              <p className="text-xs text-gray-500">Items below threshold</p>
            </div>
            <Link href="/dashboard/inventory/low-stock" className="text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full hover:bg-red-200 transition-colors">
              {alertCount} items
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(activeAlerts?.data || []).map((alert: any) => {
              const currentLevel = alert.current_level || 0;
              const threshold = alert.threshold || 10;
              const percent = Math.min(100, Math.max(5, (currentLevel / threshold) * 100));
              
              return (
                <div key={alert.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.item?.variant?.title || 'Unknown Item'}</p>
                    <p className="text-xs text-gray-400">SKU: {alert.item?.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-[11px] font-medium text-gray-500 mb-1">
                      <span className="text-red-600 font-bold">{currentLevel}</span> / {threshold} available
                    </p>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-0.5 overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {alertCount === 0 && (
              <div className="px-6 py-10 text-center text-sm text-gray-400">
                No active alerts. All items are well-stocked.
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
