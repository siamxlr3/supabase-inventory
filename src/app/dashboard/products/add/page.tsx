'use client';

import React, { useState, useRef } from 'react';
import { PageHeader, Card, Button, Input, Select, Textarea, Badge } from '@/components/ui';
import { Save, X, Loader2, Plus, Trash2, RefreshCw, Package, ArrowRight, ArrowLeft, ImagePlus, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateProductMutation, useUpdateProductMutation, useUploadProductImageMutation } from '@/store/api/productApi';
import { toast } from 'react-hot-toast';

interface Option {
  id: string;
  name: string;
  values: string[];
}

interface VariantDetail {
  title: string;
  sku: string;
  barcode: string;
  price: string;
  compare_at_price: string;
  weight: string;
  weight_unit: string;
  position: number;
  taxable: boolean;
  requires_shipping: boolean;
  tracked: boolean;
  cost: string;
  country_code_of_origin: string;
  harmonized_system_code: string;
}

export default function UnifiedProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState<string | null>(null);
  
  // API Mutations
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation();

  // Image State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 State: Product Info
  const [formData, setFormData] = useState({
    title: '',
    vendor: '',
    product_type: '',
    status: 'draft',
    handle: '',
    description: '',
  });

  // Step 2 State: Variants
  const [options, setOptions] = useState<Option[]>([
    { id: '1', name: 'Size', values: ['Small', 'Medium', 'Large'] },
    { id: '2', name: 'Color', values: ['Black', 'White'] },
  ]);
  const [variantDetails, setVariantDetails] = useState<Record<string, VariantDetail>>({});

  // Handlers for Step 1
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (id === 'title' && !formData.handle) {
      setFormData(prev => ({ 
        ...prev, 
        handle: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') 
      }));
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadImage(fd).unwrap();
      setImageUrl(result.data.url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.data?.message || 'Image upload failed');
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNextStep = async () => {
    if (!formData.title || !formData.handle) {
      toast.error('Title and Handle are required');
      return;
    }

    try {
      const result = await createProduct({ ...formData, image_url: imageUrl }).unwrap();
      setProductId(result.data.id);
      setStep(2);
      toast.success('Basic info saved. Now configure variants.');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create product');
    }
  };

  // Handlers for Step 2
  const addOption = () => setOptions([...options, { id: Date.now().toString(), name: '', values: [] }]);
  const removeOption = (id: string) => setOptions(options.filter(o => o.id !== id));
  const updateOptionName = (id: string, name: string) => setOptions(options.map(o => o.id === id ? { ...o, name } : o));
  const addValue = (optionId: string, value: string) => {
    if (!value) return;
    setOptions(options.map(o => o.id === optionId ? { ...o, values: [...o.values, value] } : o));
  };
  const removeValue = (optionId: string, value: string) => {
    setOptions(options.map(o => o.id === optionId ? { ...o, values: o.values.filter(v => v !== value) } : o));
  };

  const generateVariants = () => {
    const activeOptions = options.filter(o => o.name && o.values.length > 0);
    if (activeOptions.length === 0) return [];
    
    let results: string[][] = [[]];
    activeOptions.forEach(opt => {
      const nextResults: string[][] = [];
      results.forEach(res => {
        opt.values.forEach(val => {
          nextResults.push([...res, val]);
        });
      });
      results = nextResults;
    });
    return results;
  };

  const handleTagInput = (optionId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = e.currentTarget.value.trim().replace(/,$/, '');
      if (value) {
        addValue(optionId, value);
        e.currentTarget.value = '';
      }
    }
  };

  const variants = generateVariants();

  const handleDetailChange = (title: string, field: keyof VariantDetail, value: any) => {
    setVariantDetails(prev => ({
      ...prev,
      [title]: {
        ...(prev[title] || { 
          title, sku: '', barcode: '', price: '0.00', compare_at_price: '',
          weight: '0.0', weight_unit: 'kg', position: 0, taxable: true,
          requires_shipping: true, tracked: true, cost: '0.00', 
          country_code_of_origin: '', harmonized_system_code: '' 
        }),
        [field]: value
      }
    }));
  };

  const handleFinalSave = async () => {
    if (!productId) return;

    const finalVariants = variants.map((v, i) => {
      const title = v.join(' / ');
      const detail = variantDetails[title] || { 
        title, sku: '', barcode: '', price: '0.00', compare_at_price: '',
        weight: '0.0', weight_unit: 'kg', position: i, taxable: true,
        requires_shipping: true, tracked: true, cost: '0.00',
        country_code_of_origin: '', harmonized_system_code: ''
      };

      return {
        ...detail,
        price: parseFloat(detail.price) || 0,
        compare_at_price: detail.compare_at_price ? parseFloat(detail.compare_at_price) : null,
        weight: parseFloat(detail.weight) || 0,
        inventory: {
          cost: parseFloat(detail.cost) || 0,
          country_code_of_origin: detail.country_code_of_origin || null,
          harmonized_system_code: detail.harmonized_system_code || null,
          tracked: detail.tracked
        },
        option_values: v.map((val, idx) => ({
          option_name: options[idx].name,
          value: val
        }))
      };
    });
    
    try {
      await updateProduct({
        id: productId,
        body: {
          ...formData,
          image_url: imageUrl,
          options: options.map((o, idx) => ({ name: o.name, position: idx })),
          variants: finalVariants
        }
      }).unwrap();
      
      toast.success('Product and variants saved successfully!');
      router.push('/dashboard/products');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to save variants.');
    }
  };

  return (
    <>
      <PageHeader
        title={step === 1 ? "Add Product" : "Configure Variants"}
        description={step === 1 ? "Step 1: General Information" : "Step 2: Options & Combinations"}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Products', href: '/dashboard/products' },
          { label: step === 1 ? 'Add Product' : 'Configure Variants' },
        ]}
        actions={
          <>
            {step === 1 ? (
              <>
                <Link href="/dashboard/products">
                  <Button variant="outline" size="sm" leftIcon={<X className="h-4 w-4" />}>Cancel</Button>
                </Link>
                <Button 
                  size="sm" 
                  onClick={handleNextStep} 
                  disabled={isCreating}
                  rightIcon={isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                >
                  {isCreating ? 'Saving...' : 'Next: Variants'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
                <Button 
                  size="sm" 
                  onClick={handleFinalSave} 
                  disabled={isUpdating}
                  leftIcon={isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                >
                  {isUpdating ? 'Saving...' : 'Finalize Product'}
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="flex flex-col space-y-6">
        {/* Step Indicators */}
        <div className="flex items-center gap-4 mb-2">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
        </div>

        {step === 1 ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Top Row: Image (2/3) and Status (1/3) */}
            <div className="xl:col-span-2">
              <Card className="border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visual Identity</h3>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <div className="max-w-xl mx-auto w-full">
                    {imagePreview ? (
                      <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                        <div className="relative w-full aspect-[21/9] bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagePreview} alt="Product preview" className="w-full h-full object-contain p-4" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 bg-white rounded-full text-gray-700 hover:scale-110 transition-transform shadow-xl"
                            title="Replace image"
                          >
                            <Upload className="h-5 w-5" />
                          </button>
                          <button
                            onClick={removeImage}
                            className="p-3 bg-white rounded-full text-red-600 hover:scale-110 transition-transform shadow-xl"
                            title="Remove image"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Uploading...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full aspect-[21/9] rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-400 bg-gray-50/50 hover:bg-indigo-50/20 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group"
                      >
                        <div className="h-16 w-16 rounded-full bg-white border border-gray-100 group-hover:border-indigo-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                          <ImagePlus className="h-7 w-7 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-600 group-hover:text-indigo-700">Click to upload product image</p>
                          <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tight">Support: JPEG, PNG, WebP · Max 5MB</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div className="xl:col-span-1">
              <Card className="border-gray-100 shadow-sm h-full flex flex-col">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Classification</h3>
                </div>
                <div className="p-6 space-y-8">
                  <Select id="status" label="Publishing Status" value={formData.status} onChange={handleChange} options={[{ label: 'Draft', value: 'draft' }, { label: 'Active', value: 'active' }, { label: 'Archived', value: 'archived' }]} />
                  <Input label="Category / Type" id="product_type" placeholder="e.g. Electronics" value={formData.product_type} onChange={handleChange} />
                </div>
              </Card>
            </div>

            {/* Bottom Row: General Information */}
            <div className="xl:col-span-3">
              <Card className="border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Basic Details</h3>
                </div>
                <div className="p-6 space-y-8">
                  <Input label="Product Name" id="title" placeholder="e.g. Wireless Mouse Pro" value={formData.title} onChange={handleChange} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <Input label="Handle (SEO Friendly URL)" id="handle" placeholder="e.g. wireless-mouse-pro" value={formData.handle} onChange={handleChange} />
                    <Input label="Vendor / Manufacturer" id="vendor" placeholder="e.g. Logitech" value={formData.vendor} onChange={handleChange} />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Product Options</h3>
                  <p className="text-xs text-gray-500 mt-1">Add options like Size, Color, or Material</p>
                </div>
                <Button variant="outline" size="sm" onClick={addOption} leftIcon={<Plus className="h-3.5 w-3.5" />}>Add Option</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {options.map((option) => (
                  <div key={option.id} className="group relative p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
                    <button 
                      onClick={() => removeOption(option.id)} 
                      className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Option Name</label>
                        <input 
                          className="h-[34px] w-full rounded-lg border border-gray-200 px-3 text-xs font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
                          placeholder="e.g. Size"
                          value={option.name}
                          onChange={(e) => updateOptionName(option.id, e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Values</label>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {option.values.map((v) => (
                            <Badge key={v} variant="default" className="pl-2 pr-1 py-1 gap-1.5 bg-indigo-50 text-indigo-700 border-indigo-100">
                              {v}
                              <button onClick={() => removeValue(option.id, v)} className="hover:text-indigo-900 bg-white/50 rounded-full p-0.5">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <input 
                          className="h-[34px] w-full rounded-lg border border-gray-100 bg-gray-50 px-3 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                          placeholder="Type and press Enter..."
                          onKeyDown={(e) => handleTagInput(option.id, e)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {options.length === 0 && (
                  <div className="col-span-full border-2 border-dashed border-gray-100 rounded-xl p-12 text-center">
                    <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-6 w-6 text-gray-300" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">No options added</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-4">Add your first option to start generating variants</p>
                    <Button variant="outline" size="sm" onClick={addOption}>Add your first option</Button>
                  </div>
                )}
              </div>
            </Card>

            <Card padding="none">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Preview & Configure Variants</h3>
                  <p className="text-xs text-gray-500">{variants.length} combinations generated</p>
                </div>
                <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-3 w-3" />}>Regenerate</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                      <th className="px-6 py-4 w-44">Variant</th>
                      <th className="px-6 py-4 w-80">SKU + Barcode</th>
                      <th className="px-6 py-4 w-64">Pricing</th>
                      <th className="px-6 py-4 w-56">Cost</th>
                      <th className="px-6 py-4 w-72">Logistics</th>
                      <th className="px-6 py-4 w-72">Settings</th>
                      <th className="px-6 py-4">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {variants.map((v, i) => {
                      const title = v.join(' / ');
                      const detail = variantDetails[title] || { 
                        title, sku: '', barcode: '', price: '0.00', compare_at_price: '', 
                        cost: '0.00', country_code_of_origin: '', harmonized_system_code: '',
                        weight: '0.0', weight_unit: 'kg', position: i, taxable: true, 
                        requires_shipping: true, tracked: true 
                      };
                      return (
                        <tr key={i} className="text-sm hover:bg-gray-50/30 transition-all">
                          <td className="px-6 py-5 align-top pt-8">
                            <div className="flex flex-wrap gap-1.5">
                              {v.map(val => (
                                <Badge key={val} variant="secondary" className="text-[10px] px-2 py-0.5 bg-white border-gray-200 text-gray-700 shadow-sm font-medium">{val}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-5 space-y-2 align-top">
                            <input className="h-[34px] w-full rounded-lg border border-gray-200 px-3 text-xs font-mono focus:border-indigo-500 focus:outline-none placeholder:text-gray-300 transition-all" placeholder="SKU" value={detail.sku} onChange={(e) => handleDetailChange(title, 'sku', e.target.value)} />
                            <input className="h-[34px] w-full rounded-lg border border-gray-200 px-3 text-xs font-mono focus:border-indigo-500 focus:outline-none placeholder:text-gray-300 transition-all" placeholder="Barcode" value={detail.barcode} onChange={(e) => handleDetailChange(title, 'barcode', e.target.value)} />
                          </td>
                          <td className="px-6 py-5 space-y-2 align-top">
                            <div className="relative">
                              <span className="absolute left-3 top-[9px] text-xs text-gray-400 font-medium">$</span>
                              <input className="h-[34px] w-full rounded-lg border border-gray-200 pl-6 pr-3 text-xs font-semibold focus:border-indigo-500 focus:outline-none transition-all" placeholder="Price" value={detail.price} onChange={(e) => handleDetailChange(title, 'price', e.target.value)} />
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-[9px] text-xs text-gray-400 font-medium">$</span>
                              <input className="h-[34px] w-full rounded-lg border border-gray-200 border-dashed pl-6 pr-3 text-xs text-gray-400 focus:border-indigo-500 focus:outline-none transition-all" placeholder="Compare" value={detail.compare_at_price} onChange={(e) => handleDetailChange(title, 'compare_at_price', e.target.value)} />
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="relative">
                              <span className="absolute left-3 top-[9px] text-xs text-gray-400 font-medium">$</span>
                              <input className="h-[34px] w-full rounded-lg border border-gray-200 pl-6 pr-3 text-xs font-medium text-indigo-600 focus:border-indigo-500 focus:outline-none transition-all" placeholder="0.00" value={detail.cost} onChange={(e) => handleDetailChange(title, 'cost', e.target.value)} />
                            </div>
                          </td>
                          <td className="px-6 py-5 space-y-2 align-top">
                            <input className="h-[34px] w-full rounded-lg border border-gray-200 px-3 text-xs uppercase focus:border-indigo-500 focus:outline-none placeholder:text-gray-300 transition-all" placeholder="Origin (US)" value={detail.country_code_of_origin} onChange={(e) => handleDetailChange(title, 'country_code_of_origin', e.target.value.toUpperCase())} maxLength={2} />
                            <input className="h-[34px] w-full rounded-lg border border-gray-200 px-3 text-xs focus:border-indigo-500 focus:outline-none placeholder:text-gray-300 transition-all" placeholder="HS Code" value={detail.harmonized_system_code} onChange={(e) => handleDetailChange(title, 'harmonized_system_code', e.target.value)} />
                          </td>
                          <td className="px-6 py-5 align-top pt-8">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                              <label className="flex items-center gap-2 cursor-pointer group/chk">
                                <input type="checkbox" checked={detail.tracked} onChange={(e) => handleDetailChange(title, 'tracked', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                <span className="text-xs font-semibold text-gray-600 group-hover/chk:text-indigo-600 transition-colors">Track</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer group/chk">
                                <input type="checkbox" checked={detail.requires_shipping} onChange={(e) => handleDetailChange(title, 'requires_shipping', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                <span className="text-xs font-semibold text-gray-600 group-hover/chk:text-indigo-600 transition-colors">Ship</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer group/chk">
                                <input type="checkbox" checked={detail.taxable} onChange={(e) => handleDetailChange(title, 'taxable', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                <span className="text-xs font-semibold text-gray-600 group-hover/chk:text-indigo-600 transition-colors">Tax</span>
                              </label>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top pt-7">
                            <div className="flex items-center">
                              <input className="h-[34px] w-14 rounded-l-lg border border-r-0 border-gray-200 px-3 text-xs font-medium focus:border-indigo-500 focus:outline-none transition-all" value={detail.weight} onChange={(e) => handleDetailChange(title, 'weight', e.target.value)} />
                              <select 
                                className="h-[34px] rounded-r-lg border border-gray-200 bg-gray-50 px-2 text-[10px] font-bold text-gray-500 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                                value={detail.weight_unit}
                                onChange={(e) => handleDetailChange(title, 'weight_unit', e.target.value)}
                              >
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
