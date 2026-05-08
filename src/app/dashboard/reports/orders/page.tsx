'use client';

import React from 'react';
import { PageHeader, Card, StatsCard, Button, DataTable } from '@/components/ui';
import { Download, ShoppingBag, DollarSign, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const orderVolume = [
  { day: 'Mon', volume: 120 },
  { day: 'Tue', volume: 150 },
  { day: 'Wed', volume: 140 },
  { day: 'Thu', volume: 180 },
  { day: 'Fri', volume: 210 },
  { day: 'Sat', volume: 160 },
  { day: 'Sun', volume: 110 },
];

export default function OrderReportPage() {
  return (
    <>
      <PageHeader
        title="Order Report"
        description="Comprehensive analysis of sales and order fulfillment"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }, { label: 'Orders' }]}
        actions={<Button size="sm" leftIcon={<Download className="h-4 w-4" />}>Export CSV</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Revenue" value="$48,250" change="+12.5%" changeType="positive" icon={<DollarSign className="h-5 w-5 text-indigo-600" />} />
        <StatsCard title="Order Volume" value="1,248" change="+8.2%" changeType="positive" icon={<ShoppingBag className="h-5 w-5 text-emerald-600" />} />
        <StatsCard title="Avg. Order Value" value="$38.60" change="+$2.40" changeType="positive" icon={<TrendingUp className="h-5 w-5 text-blue-600" />} />
        <StatsCard title="New Customers" value="245" change="+15" changeType="positive" icon={<Users className="h-5 w-5 text-amber-600" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="xl:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Daily Order Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Fulfillment Stats</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-500">On-time Delivery</p>
                <p className="text-lg font-bold text-gray-900">94.2%</p>
              </div>
              <div className="h-1.5 w-32 bg-gray-100 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.2%' }} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-500">Pick Accuracy</p>
                <p className="text-lg font-bold text-gray-900">99.8%</p>
              </div>
              <div className="h-1.5 w-32 bg-gray-100 rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '99.8%' }} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-500">Return Rate</p>
                <p className="text-lg font-bold text-gray-900">1.2%</p>
              </div>
              <div className="h-1.5 w-32 bg-gray-100 rounded-full">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '1.2%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        columns={[
          { key: 'period', header: 'Period' },
          { key: 'orders', header: 'Total Orders' },
          { key: 'revenue', header: 'Revenue' },
          { key: 'growth', header: 'Growth %', cell: (row) => <span className="text-emerald-600 font-medium">{row.growth}</span> },
        ]}
        data={[
          { period: 'Last 7 Days', orders: '1,248', revenue: '$48,250', growth: '+12.5%' },
          { period: 'Prior Period', orders: '1,109', revenue: '$42,880', growth: '+8.2%' },
          { period: 'Year Over Year', orders: '4,850', revenue: '$185,400', growth: '+25.4%' },
        ]}
      />
    </>
  );
}
