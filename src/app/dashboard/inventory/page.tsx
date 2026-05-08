'use client';

import React from 'react';
import { PageHeader, Card, Button } from '@/components/ui';
import { 
  Warehouse, 
  Package, 
  ClipboardList, 
  AlertTriangle, 
  BarChart3, 
  ArrowRight,
  TrendingUp,
  MapPin,
  History
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const inventoryModules = [
  {
    title: 'Stock by Product',
    description: 'Detailed view of quantities per product variant across all locations.',
    icon: <Package className="h-6 w-6 text-indigo-600" />,
    href: '/dashboard/inventory/by-product',
    bg: 'bg-indigo-50',
  },
  {
    title: 'Stock by Location',
    description: 'Monitor storage utilization and physical distribution at each facility.',
    icon: <MapPin className="h-6 w-6 text-emerald-600" />,
    href: '/dashboard/inventory/by-location',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Adjustments History',
    description: 'Permanent audit trail of manual stock changes and corrections.',
    icon: <History className="h-6 w-6 text-blue-600" />,
    href: '/dashboard/inventory/adjustments',
    bg: 'bg-blue-50',
  },
  {
    title: 'Low Stock Alerts',
    description: 'Track items falling below safe reorder thresholds across your sites.',
    icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
    href: '/dashboard/inventory/low-stock',
    bg: 'bg-red-50',
  }
];

export default function InventoryDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory Management" 
        description="Overview of your global stock levels, warehouses, and fulfillment status."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventoryModules.map((module, index) => (
          <motion.div
            key={module.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={module.href}>
              <Card className="h-full hover:shadow-lg hover:border-indigo-200 transition-all group cursor-pointer border-gray-100">
                <div className={`h-12 w-12 rounded-2xl ${module.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {module.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">{module.description}</p>
                <div className="flex items-center text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                  Access Module <ArrowRight className="h-3 w-3" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Inventory Health</h3>
              <p className="text-sm text-gray-500">Live system status across all sites</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'System Synchronization', status: 'Optimal', color: 'bg-green-500' },
              { label: 'Data Consistency', status: '100%', color: 'bg-indigo-500' },
              { label: 'Alert Latency', status: '< 50ms', color: 'bg-blue-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-sm font-medium text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{item.status}</span>
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-indigo-600 text-white border-none relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2">Automated Audit</h3>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
              Every stock movement is recorded with a permanent delta log, ensuring 100% traceability for your inventory.
            </p>
            <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50">
              Download Report
            </Button>
          </div>
          <Warehouse className="absolute -right-4 -bottom-4 h-32 w-32 text-indigo-500/30 -rotate-12" />
        </Card>
      </div>
    </div>
  );
}
