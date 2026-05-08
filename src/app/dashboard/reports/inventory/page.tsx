'use client';

import React from 'react';
import { PageHeader, Card, StatsCard, Button, DataTable, Badge } from '@/components/ui';
import { Download, BarChart3, TrendingUp, TrendingDown, Package, PieChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const data = [
  { day: 'Mon', value: 2400 },
  { day: 'Tue', value: 1398 },
  { day: 'Wed', value: 9800 },
  { day: 'Thu', value: 3908 },
  { day: 'Fri', value: 4800 },
  { day: 'Sat', value: 3800 },
  { day: 'Sun', value: 4300 },
];

const categoryDistribution = [
  { name: 'Electronics', value: 45, color: '#6366f1' },
  { name: 'Accessories', value: 25, color: '#10b981' },
  { name: 'Audio', value: 15, color: '#f59e0b' },
  { name: 'Lighting', value: 10, color: '#3b82f6' },
  { name: 'Others', value: 5, color: '#6b7280' },
];

export default function InventoryReportPage() {
  return (
    <>
      <PageHeader
        title="Inventory Report"
        description="Detailed analysis of stock levels and valuation"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }, { label: 'Inventory' }]}
        actions={<Button size="sm" leftIcon={<Download className="h-4 w-4" />}>Download PDF</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Stock Value" value="$1.24M" change="+8.5%" changeType="positive" icon={<BarChart3 className="h-5 w-5 text-indigo-600" />} />
        <StatsCard title="Turnover Rate" value="4.2x" change="+0.8x" changeType="positive" icon={<TrendingUp className="h-5 w-5 text-emerald-600" />} />
        <StatsCard title="Dead Stock Value" value="$12,450" change="-2%" changeType="positive" icon={<TrendingDown className="h-5 w-5 text-red-600" />} />
        <StatsCard title="Unique SKUs" value="1,248" change="+42 new" changeType="neutral" icon={<Package className="h-5 w-5 text-blue-600" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-gray-900">Stock Valuation Trend</h3>
            <Select id="range" className="w-32" options={[{ label: 'Last 7 Days', value: '7' }, { label: 'Last 30 Days', value: '30' }]} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={0.1} fill="#6366f1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Stock by Category</h3>
          <div className="space-y-4">
            {categoryDistribution.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-600">{cat.name}</span>
                  <span className="text-gray-900">{cat.value}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${cat.value}%`, backgroundColor: cat.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><PieChart className="h-3.5 w-3.5" /> Distribution Matrix</div>
            <button className="text-indigo-600 font-medium hover:underline">Full Details</button>
          </div>
        </Card>
      </div>

      <DataTable
        columns={[
          { key: 'category', header: 'Category' },
          { key: 'count', header: 'Product Count' },
          { key: 'value', header: 'Total Value' },
          { key: 'change', header: 'Value Change (MTD)', cell: (row) => <span className={row.positive ? 'text-emerald-600' : 'text-red-600'}>{row.change}</span> },
        ]}
        data={[
          { category: 'Electronics', count: '450', value: '$720,000', change: '+12.5%', positive: true },
          { category: 'Accessories', count: '320', value: '$180,000', change: '+5.2%', positive: true },
          { category: 'Audio', count: '180', value: '$120,000', change: '-2.1%', positive: false },
          { category: 'Lighting', count: '120', value: '$95,000', change: '+8.7%', positive: true },
        ]}
      />
    </>
  );
}
import { Select } from '@/components/ui/Input';
