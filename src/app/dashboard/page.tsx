'use client';

import React from 'react';
import { PageHeader, StatsCard, Card } from '@/components/ui';
import {
  DollarSign, Package, ShoppingCart, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Eye,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 4200, orders: 120 },
  { month: 'Feb', revenue: 5100, orders: 145 },
  { month: 'Mar', revenue: 4800, orders: 132 },
  { month: 'Apr', revenue: 6200, orders: 178 },
  { month: 'May', revenue: 7100, orders: 201 },
  { month: 'Jun', revenue: 6800, orders: 190 },
  { month: 'Jul', revenue: 8200, orders: 245 },
];

const ordersByCategory = [
  { name: 'Electronics', value: 420 },
  { name: 'Apparel', value: 380 },
  { name: 'Home', value: 290 },
  { name: 'Sports', value: 210 },
  { name: 'Books', value: 180 },
];

const recentOrders = [
  { id: 'ORD-1234', customer: 'John Doe', amount: '$245.00', status: 'completed', time: '2m ago' },
  { id: 'ORD-1233', customer: 'Jane Smith', amount: '$189.50', status: 'processing', time: '15m ago' },
  { id: 'ORD-1232', customer: 'Bob Johnson', amount: '$520.00', status: 'pending', time: '1h ago' },
  { id: 'ORD-1231', customer: 'Alice Brown', amount: '$78.25', status: 'shipped', time: '2h ago' },
  { id: 'ORD-1230', customer: 'Charlie Wilson', amount: '$340.00', status: 'completed', time: '3h ago' },
];

const lowStockItems = [
  { name: 'Wireless Mouse Pro', sku: 'WMP-001', stock: 3, threshold: 10 },
  { name: 'USB-C Hub 7-in-1', sku: 'UCH-007', stock: 5, threshold: 15 },
  { name: 'Laptop Stand Aluminum', sku: 'LSA-012', stock: 2, threshold: 8 },
  { name: 'Mechanical Keyboard', sku: 'MKB-003', stock: 7, threshold: 20 },
];

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700',
  processing: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  shipped: 'bg-indigo-50 text-indigo-700',
};

import { useGetAlertsQuery, useGetInventoryLevelsQuery } from '@/store/api/inventoryApi';
import { useGetProductsQuery, useGetProductSummaryQuery } from '@/store/api/productApi';

export default function DashboardPage() {
  const { data: productSummary } = useGetProductSummaryQuery();
  const { data: activeAlerts } = useGetAlertsQuery({ resolved: false, per_page: 5 });
  const { data: inventoryLevels } = useGetInventoryLevelsQuery({ per_page: 1 });

  const summary = productSummary?.data || {
    totalProducts: 0,
    totalVariants: 0,
    outOfStock: 0,
    totalValue: 0
  };

  const alertCount = activeAlerts?.meta?.total_count || 0;

  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back! Here's what's happening with your inventory." />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Revenue"
          value="$0.00"
          change="+0% from last month"
          changeType="neutral"
          icon={<DollarSign className="h-5 w-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
        />
        <StatsCard
          title="Total Orders"
          value="0"
          change="+0% from last month"
          changeType="neutral"
          icon={<ShoppingCart className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatsCard
          title="Products in Stock"
          value={summary.totalProducts.toString()}
          change={`${summary.totalVariants} variants`}
          changeType="neutral"
          icon={<Package className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={alertCount.toString()}
          change={alertCount > 0 ? `${alertCount} critical issues` : "All systems normal"}
          changeType={alertCount > 0 ? "negative" : "positive"}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-xs text-gray-500">Monthly revenue trend</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3" /> +12.5%
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
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
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
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{order.amount}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Low Stock Alerts</h3>
              <p className="text-xs text-gray-500">Items below threshold</p>
            </div>
            <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {alertCount} items
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {(activeAlerts?.data || []).map((alert: any) => (
              <div key={alert.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.item?.variant?.title}</p>
                  <p className="text-xs text-gray-400">SKU: {alert.item?.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">Low Stock</p>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `30%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
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
