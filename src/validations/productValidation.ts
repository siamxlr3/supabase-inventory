import { z } from 'zod';

export const productStatusSchema = z.enum(['draft', 'active', 'archived']);

export const productOptionSchema = z.object({
  name: z.string().min(1, 'Option name is required'),
  position: z.number().optional().default(0),
});

export const productVariantSchema = z.object({
  title: z.string().min(1, 'Variant title is required'),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  price: z.number().min(0).default(0),
  compare_at_price: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  weight_unit: z.string().default('kg'),
  position: z.number().optional().default(0),
  taxable: z.boolean().default(true),
  requires_shipping: z.boolean().default(true),
  option_values: z.array(z.object({
    option_name: z.string(), // To link to the options array
    value: z.string()
  })).optional(),
  inventory: z.object({
    cost: z.number().min(0).default(0),
    country_code_of_origin: z.string().nullable().optional(),
    harmonized_system_code: z.string().nullable().optional(),
    tracked: z.boolean().default(true),
  }).optional()
});

export const createProductSchema = z.object({
  title: z.string().min(1, 'Product title is required'),
  vendor: z.string().nullable().optional(),
  product_type: z.string().nullable().optional(),
  status: productStatusSchema.optional(),
  handle: z.string().min(1, 'Handle is required'),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  options: z.array(productOptionSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().default(1)),
  per_page: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().max(100).default(10)),
  search: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  status: z.preprocess((v) => (v === '' ? undefined : v), productStatusSchema.optional()),
  vendor: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  type: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  start_date: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  end_date: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
});
