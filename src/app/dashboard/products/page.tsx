'use client';

import React, { useState } from 'react';
import { PageHeader, Button, Badge, StatusBadge, TableSkeleton } from '@/components/ui';
import { SearchInput } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Plus, Download, Filter, Edit, Trash2, Package, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGetProductsQuery, useDeleteProductMutation } from '@/store/api/productApi';
import { toast } from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isFetching, refetch } = useGetProductsQuery({
    page,
    search: debouncedSearch,
    status: status === 'all' ? undefined : status,
  });

  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted successfully');
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  const products = data?.data || [];
  const totalPages = data?.meta?.total_pages || 1;

  // Flatten products into variant-level rows for the table
  const flatRows: { product: any; variant: any; variantIndex: number; totalVariants: number }[] = [];
  products.forEach((product: any) => {
    const variants = product.variants || [];
    if (variants.length === 0) {
      flatRows.push({ product, variant: null, variantIndex: 0, totalVariants: 1 });
    } else {
      variants.forEach((v: any, idx: number) => {
        flatRows.push({ product, variant: v, variantIndex: idx, totalVariants: variants.length });
      });
    }
  });

  return (
    <>
      <PageHeader
        title="All Products"
        description="Manage your product catalog and inventory"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Products' },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RotateCcw className={isFetching ? "animate-spin h-4 w-4" : "h-4 w-4"} />}>Refresh</Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export</Button>
            <Link href="/dashboard/products/add">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Product</Button>
            </Link>
          </>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-full sm:w-72">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by title or handle..."
              />
            </div>
            <div className="flex items-center gap-2">
              <select 
                className="h-9 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                value={status || 'all'}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>More Filters</Button>
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton columns={12} rows={8} />
          </div>
        ) : flatRows.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-medium">No products found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Product / Type</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Handle</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Vendor</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Variant</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">SKU / Barcode</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Price / Compare</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Weight</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Ship / Tax / Track</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Cost</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Origin / HS</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Published</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {flatRows.map((row, i) => {
                  const { product, variant, variantIndex, totalVariants } = row;
                  const isFirstVariant = variantIndex === 0;
                  const v = variant;

                  return (
                    <tr 
                      key={`${product.id}-${variantIndex}`} 
                      className={`hover:bg-gray-50/50 transition-colors text-xs ${isFirstVariant && variantIndex > 0 ? 'border-t-2 border-gray-200' : ''}`}
                    >
                      {/* Product-level cells — only render on first variant */}
                      {isFirstVariant && (
                        <>
                          <td className="px-4 py-3 align-top" rowSpan={totalVariants}>
                            <div className="flex items-start gap-2.5">
                              {product.image_url ? (
                                <div className="h-9 w-9 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 mt-0.5 relative">
                                  <Image src={product.image_url} alt={product.title} fill className="object-cover" sizes="36px" />
                                </div>
                              ) : (
                                <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Package className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate max-w-[160px]">{product.title}</p>
                                <Badge variant="outline" className="text-[9px] mt-1 h-4">{product.product_type || 'General'}</Badge>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top" rowSpan={totalVariants}>
                            <code className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 font-mono">{product.handle}</code>
                          </td>
                          <td className="px-4 py-3 align-top" rowSpan={totalVariants}>
                            <span className="text-xs text-gray-700">{product.vendor || '—'}</span>
                          </td>
                        </>
                      )}

                      {/* Variant-level cells — render for every variant */}
                      <td className="px-4 py-3">
                        {v ? (
                          <span className="text-xs font-medium text-gray-900">{v.title}</span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No variants</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {v ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-mono text-gray-700">{v.sku || '—'}</span>
                            {v.barcode && <span className="text-[9px] font-mono text-gray-400">{v.barcode}</span>}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {v ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-900">${parseFloat(v.price || 0).toFixed(2)}</span>
                            {v.compare_at_price && (
                              <span className="text-[10px] text-gray-400 line-through">${parseFloat(v.compare_at_price).toFixed(2)}</span>
                            )}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {v ? (
                          <span className="text-xs text-gray-600">{v.weight || 0} {v.weight_unit || 'kg'}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {v ? (
                          <div className="flex items-center gap-1.5">
                            <Badge variant={v.requires_shipping ? 'default' : 'outline'} className="text-[8px] h-[18px] px-1.5">
                              {v.requires_shipping ? 'Ship' : 'No'}
                            </Badge>
                            <Badge variant={v.taxable ? 'default' : 'outline'} className="text-[8px] h-[18px] px-1.5">
                              {v.taxable ? 'Tax' : 'No'}
                            </Badge>
                            <Badge variant={v.inventory?.[0]?.tracked ? 'default' : 'outline'} className="text-[8px] h-[18px] px-1.5">
                              {v.inventory?.[0]?.tracked ? 'Track' : 'No'}
                            </Badge>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {v ? (
                          <span className="text-xs font-medium text-indigo-600">${parseFloat(v.inventory?.[0]?.cost || 0).toFixed(2)}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {v ? (
                          <div className="flex items-center gap-2">
                            {v.inventory?.[0]?.country_code_of_origin ? (
                              <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-600 uppercase whitespace-nowrap">{v.inventory[0].country_code_of_origin}</span>
                            ) : <span className="text-[10px] text-gray-300">—</span>}
                            {v.inventory?.[0]?.harmonized_system_code ? (
                              <span className="text-[9px] font-mono text-gray-500 whitespace-nowrap bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{v.inventory[0].harmonized_system_code}</span>
                            ) : null}
                          </div>
                        ) : '—'}
                      </td>

                      {/* Product-level cells (end) — only render on first variant */}
                      {isFirstVariant && (
                        <>
                          <td className="px-4 py-3 align-top" rowSpan={totalVariants}>
                            <StatusBadge status={product.status} />
                          </td>
                          <td className="px-4 py-3 align-top" rowSpan={totalVariants}>
                            <span className="text-[10px] text-gray-500">
                              {product.published_at 
                                ? format(new Date(product.published_at), 'MMM d, yyyy')
                                : <span className="text-gray-300">—</span>
                              }
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top" rowSpan={totalVariants}>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                                className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                title="Edit"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(product.id)}
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </p>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </>
  );
}
