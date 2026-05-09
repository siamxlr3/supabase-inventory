'use client';

import React, { useState } from 'react';
import { PageHeader, Card, StatsCard, Button, DataTable, Badge } from '@/components/ui';
import { Download, BarChart3, TrendingUp, Package, Clock, History, Box, Search, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

import { 
  useGetStockLevelsReportQuery, 
  useGetValuationReportQuery, 
  useGetAgingItemsReportQuery, 
  useGetAdjustmentsReportQuery 
} from '@/store/api/inventoryReportApi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'];

export default function InventoryReportPage() {
  const [activeTab, setActiveTab] = useState<'valuation' | 'levels' | 'aging' | 'adjustments'>('valuation');

  // Parameters
  const [agingDays, setAgingDays] = useState(30);
  const [adjReason, setAdjReason] = useState('all');

  // Queries
  const { data: valRes, isLoading: valLoading } = useGetValuationReportQuery(undefined, { skip: activeTab !== 'valuation' });
  const { data: levelsRes, isLoading: levelsLoading } = useGetStockLevelsReportQuery(undefined, { skip: activeTab !== 'levels' });
  const { data: agingRes, isLoading: agingLoading } = useGetAgingItemsReportQuery({ days: agingDays }, { skip: activeTab !== 'aging' });
  const { data: adjRes, isLoading: adjLoading } = useGetAdjustmentsReportQuery({ reason: adjReason }, { skip: activeTab !== 'adjustments' });

  const valData = valRes?.data;
  const levelsData = levelsRes?.data || [];
  const agingData = agingRes?.data || [];
  const adjData = adjRes?.data || [];

  return (
    <>
      <PageHeader
        title="Inventory Report"
        description="Comprehensive analysis of stock, valuation, and movements"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }, { label: 'Inventory' }]}
        actions={<Button size="sm" leftIcon={<Download className="h-4 w-4" />}>Export CSV</Button>}
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 space-x-8">
        <button 
          onClick={() => setActiveTab('valuation')}
          className={`pb-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'valuation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <BarChart3 className="h-4 w-4" /> Valuation Overview
        </button>
        <button 
          onClick={() => setActiveTab('levels')}
          className={`pb-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'levels' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <Box className="h-4 w-4" /> Stock Levels
        </button>
        <button 
          onClick={() => setActiveTab('aging')}
          className={`pb-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'aging' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <Clock className="h-4 w-4" /> Aging Items
        </button>
        <button 
          onClick={() => setActiveTab('adjustments')}
          className={`pb-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'adjustments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <History className="h-4 w-4" /> Adjustment History
        </button>
      </div>

      {activeTab === 'valuation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard 
              title="Total Stock Value" 
              value={valLoading ? '...' : `$${(valData?.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
              change="Based on unit cost" changeType="neutral" 
              icon={<BarChart3 className="h-5 w-5 text-indigo-600" />} 
            />
            <StatsCard 
              title="Total SKUs" 
              value={valLoading ? '...' : valData?.valuationByCategory?.length.toString() || '0'} 
              change="Active product categories" changeType="neutral" 
              icon={<Package className="h-5 w-5 text-emerald-600" />} 
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-1 flex flex-col items-center justify-center">
              <h3 className="text-sm font-semibold text-gray-900 mb-6 self-start w-full">Valuation Distribution</h3>
              <div className="h-64 w-full">
                {valData?.valuationByCategory && valData.valuationByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={valData.valuationByCategory}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {valData.valuationByCategory.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-gray-400">No data available</div>
                )}
              </div>
            </Card>

            <Card className="xl:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Valuation by Category</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium text-right">Items Count</th>
                      <th className="pb-3 font-medium text-right">Total Value</th>
                      <th className="pb-3 font-medium text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {valData?.valuationByCategory?.map((cat: any, i: number) => (
                      <tr key={cat.category}>
                        <td className="py-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="font-medium text-gray-900">{cat.category}</span>
                        </td>
                        <td className="py-3 text-right text-gray-600">{cat.count.toLocaleString()}</td>
                        <td className="py-3 text-right font-medium text-gray-900">${cat.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-right text-gray-500">
                          {((cat.value / (valData.totalValue || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'levels' && (
        <Card padding="none">
          <DataTable
            columns={[
              { key: 'product', header: 'Product', cell: (row: any) => <div className="font-medium text-gray-900">{row.item?.variant?.product?.title || 'Unknown'} {row.item?.variant?.title !== 'Default Title' ? `- ${row.item?.variant?.title}` : ''}</div> },
              { key: 'sku', header: 'SKU', cell: (row: any) => <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">{row.item?.sku || 'N/A'}</span> },
              { key: 'location', header: 'Location', cell: (row: any) => row.location?.name || 'Unknown' },
              { key: 'on_hand', header: 'On Hand', cell: (row: any) => <span className="font-bold text-gray-900">{row.on_hand}</span> },
              { key: 'committed', header: 'Committed' },
              { key: 'available', header: 'Available', cell: (row: any) => <span className="text-indigo-600 font-medium">{row.on_hand - row.committed}</span> },
              { key: 'updated_at', header: 'Last Counted', cell: (row: any) => format(new Date(row.updated_at), 'MMM d, yyyy') },
            ]}
            data={levelsData}
          />
        </Card>
      )}

      {activeTab === 'aging' && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
            <span className="text-sm font-medium text-gray-700">Threshold:</span>
            <select 
              value={agingDays} 
              onChange={(e) => setAgingDays(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-md py-1.5 px-3 bg-white"
            >
              <option value={15}>15 Days</option>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
            <p className="text-xs text-gray-500 ml-2">Items that have had 0 movement (sales, returns, receipts) in this timeframe.</p>
          </div>
          <DataTable
            columns={[
              { key: 'product', header: 'Product', cell: (row: any) => <div className="font-medium text-gray-900">{row.item?.variant?.product?.title || 'Unknown'}</div> },
              { key: 'sku', header: 'SKU', cell: (row: any) => <span className="text-xs text-gray-500 font-mono">{row.item?.sku || 'N/A'}</span> },
              { key: 'location', header: 'Location', cell: (row: any) => row.location?.name || 'Unknown' },
              { key: 'on_hand', header: 'Current Stock', cell: (row: any) => <span className="font-medium">{row.on_hand}</span> },
              { key: 'value', header: 'Tied Value', cell: (row: any) => <span className="text-red-600 font-medium">${(row.on_hand * (row.item?.cost || 0)).toFixed(2)}</span> },
              { key: 'days', header: 'Days Stagnant', cell: (row: any) => <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-100">{row.days_aging} days</Badge> },
            ]}
            data={agingData}
          />
        </Card>
      )}

      {activeTab === 'adjustments' && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
            <span className="text-sm font-medium text-gray-700">Filter Reason:</span>
            <select 
              value={adjReason} 
              onChange={(e) => setAdjReason(e.target.value)}
              className="text-sm border border-gray-200 rounded-md py-1.5 px-3 bg-white focus:outline-none"
            >
              <option value="all">All Adjustments</option>
              <option value="sale">Sales (Orders)</option>
              <option value="return">Returns / Refunds</option>
              <option value="received">Stock Received (POs)</option>
              <option value="damaged">Damaged Goods</option>
              <option value="correction">Manual Correction</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: 'date', header: 'Date', cell: (row: any) => format(new Date(row.happened_at), 'MMM d, yyyy h:mm a') },
              { key: 'sku', header: 'SKU', cell: (row: any) => <span className="text-xs text-gray-500 font-mono">{row.item?.sku || 'N/A'}</span> },
              { key: 'location', header: 'Location', cell: (row: any) => row.location?.name || 'Unknown' },
              { key: 'reason', header: 'Reason', cell: (row: any) => <span className="capitalize text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded-md text-gray-700">{row.reason}</span> },
              { key: 'ref', header: 'Reference', cell: (row: any) => <span className="text-xs text-indigo-600 font-medium">{row.reference_document_id ? `${row.reference_document_type} #${row.reference_document_id.slice(0,8)}` : 'Manual'}</span> },
              { key: 'delta', header: 'Delta', cell: (row: any) => (
                <span className={`font-bold ${row.delta > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {row.delta > 0 ? '+' : ''}{row.delta}
                </span>
              )},
            ]}
            data={adjData}
          />
        </Card>
      )}
    </>
  );
}
