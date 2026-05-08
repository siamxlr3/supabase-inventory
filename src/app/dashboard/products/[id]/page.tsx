'use client';

import React from 'react';
import { PageHeader, Card, Button, Badge, StatusBadge } from '@/components/ui';
import { Edit, Package, ArrowLeft, Loader2, Globe, Tag, User, Hash, Ruler } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useGetProductQuery } from '@/store/api/productApi';

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data, isLoading } = useGetProductQuery(id as string);

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  if (!data?.data) return <div className="p-8 text-center text-gray-500">Product not found.</div>;

  const product = data.data;

  return (
    <>
      <PageHeader
        title={product.title}
        description={`Product ID: ${product.id}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Products', href: '/dashboard/products' },
          { label: product.title },
        ]}
        actions={
          <>
            <Link href="/dashboard/products">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
            </Link>
            <Link href={`/dashboard/products/${id}/edit`}>
              <Button size="sm" leftIcon={<Edit className="h-4 w-4" />}>Edit Product</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{product.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={product.status} />
                  <Badge variant="outline">{product.product_type || 'General'}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 italic">
                  {product.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><Globe className="h-4 w-4" /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Handle</p>
                    <p className="text-sm font-medium text-gray-700">{product.handle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><User className="h-4 w-4" /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Vendor</p>
                    <p className="text-sm font-medium text-gray-700">{product.vendor || 'Internal'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="none">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Variants & Inventory</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <tr>
                    <th className="px-6 py-3">Variant Title</th>
                    <th className="px-6 py-3 text-center"><Hash className="h-3 w-3 mx-auto" /> SKU</th>
                    <th className="px-6 py-3 text-right"><Tag className="h-3 w-3 ml-auto" /> Price</th>
                    <th className="px-6 py-3 text-right">Cost</th>
                    <th className="px-6 py-3 text-center">Fulfillment</th>
                    <th className="px-6 py-3">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {product.variants?.map((v: any) => (
                    <tr key={v.id} className="text-sm hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{v.title}</span>
                        <div className="flex gap-2 mt-1">
                          {v.inventory?.country_code_of_origin && <span className="text-[9px] bg-gray-100 px-1 rounded font-bold text-gray-500 uppercase">Origin: {v.inventory.country_code_of_origin}</span>}
                          {v.inventory?.harmonized_system_code && <span className="text-[9px] bg-gray-100 px-1 rounded font-bold text-gray-500 uppercase">HS: {v.inventory.harmonized_system_code}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-xs text-gray-500">{v.sku || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-gray-900">${parseFloat(v.price).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 font-mono text-xs">
                        ${parseFloat(v.inventory?.cost || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] text-gray-400">{v.weight}{v.weight_unit}</span>
                          <Badge variant="outline" className="text-[9px] h-4">{v.requires_shipping ? 'Shipping' : 'Digital'}</Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={v.inventory?.tracked ? 'default' : 'outline'}>
                          {v.inventory?.tracked ? 'Tracked' : 'Untracked'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Organization</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Product Type</p>
                <Badge variant="outline" className="w-full justify-start py-1">{product.product_type || 'Uncategorized'}</Badge>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Created At</p>
                <p className="text-sm text-gray-600 font-medium">{new Date(product.created_at).toLocaleDateString()} at {new Date(product.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Variants</span>
                <span className="font-bold text-gray-900">{product.variants?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Options</span>
                <span className="font-bold text-gray-900">{product.options?.length || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
