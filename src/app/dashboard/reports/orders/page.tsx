'use client';

import React, { useState } from 'react';
import { PageHeader, Card, StatsCard, Button, DataTable } from '@/components/ui';
import { Download, ShoppingBag, DollarSign, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetOrderOverviewReportQuery, useGetTopSellersReportQuery } from '@/store/api/orderReportApi';

export default function OrderReportPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  const { data: overviewRes, isLoading: overviewLoading } = useGetOrderOverviewReportQuery({ period });
  const { data: topSellersRes, isLoading: sellersLoading } = useGetTopSellersReportQuery();

  const overview = overviewRes?.data;
  const kpis = overview?.kpis || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, uniqueCustomers: 0 };
  const rates = overview?.rates || { fulfillmentRate: 0, cancellationRate: 0, refundRate: 0 };
  const chartData = overview?.chartData || [];
  
  const topSellers = topSellersRes?.data || [];

  return (
    <>
      <PageHeader
        title="Order Report"
        description="Comprehensive analysis of sales and order fulfillment"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }, { label: 'Orders' }]}
        actions={<Button size="sm" leftIcon={<Download className="h-4 w-4" />}>Export CSV</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total Revenue" 
          value={overviewLoading ? '...' : `$${kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          change="Gross processed" changeType="neutral" 
          icon={<DollarSign className="h-5 w-5 text-indigo-600" />} 
        />
        <StatsCard 
          title="Order Volume" 
          value={overviewLoading ? '...' : kpis.totalOrders.toLocaleString()} 
          change="Completed checkouts" changeType="neutral" 
          icon={<ShoppingBag className="h-5 w-5 text-emerald-600" />} 
        />
        <StatsCard 
          title="Avg. Order Value" 
          value={overviewLoading ? '...' : `$${kpis.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          change="Revenue per order" changeType="neutral" 
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />} 
        />
        <StatsCard 
          title="Unique Customers" 
          value={overviewLoading ? '...' : kpis.uniqueCustomers.toLocaleString()} 
          change="Distinct buyers" changeType="neutral" 
          icon={<Users className="h-5 w-5 text-amber-600" />} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-gray-900">Order Volume & Revenue</h3>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-md py-1 px-2 bg-white outline-none"
            >
              <option value="day">By Day</option>
              <option value="week">By Week</option>
              <option value="month">By Month</option>
            </select>
          </div>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar yAxisId="left" dataKey="volume" name="Volume (Orders)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">No data available for this view</div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Operational Stats</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="w-1/2">
                <p className="text-xs font-medium text-gray-500">Fulfillment Rate</p>
                <p className="text-lg font-bold text-gray-900">{rates.fulfillmentRate.toFixed(1)}%</p>
              </div>
              <div className="h-1.5 w-1/2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rates.fulfillmentRate}%` }} />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="w-1/2">
                <p className="text-xs font-medium text-gray-500">Cancellation Rate</p>
                <p className="text-lg font-bold text-gray-900">{rates.cancellationRate.toFixed(1)}%</p>
              </div>
              <div className="h-1.5 w-1/2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${rates.cancellationRate}%` }} />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="w-1/2">
                <p className="text-xs font-medium text-gray-500">Refund Rate</p>
                <p className="text-lg font-bold text-gray-900">{rates.refundRate.toFixed(1)}%</p>
              </div>
              <div className="h-1.5 w-1/2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${rates.refundRate}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Top Selling Variants</h3>
        </div>
        <DataTable
          columns={[
            { key: 'rank', header: 'Rank', cell: (_, idx) => <span className="text-gray-400 font-bold">#{idx + 1}</span> },
            { key: 'title', header: 'Product Variant', cell: (row) => <span className="font-medium text-gray-900">{row.title}</span> },
            { key: 'qty', header: 'Quantity Sold', cell: (row) => <span className="font-bold">{row.qty}</span> },
            { key: 'revenue', header: 'Gross Revenue', cell: (row) => <span className="text-emerald-600 font-medium">${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> },
          ]}
          data={topSellers}
        />
      </Card>
    </>
  );
}
