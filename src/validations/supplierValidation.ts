import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  currency_code: z.string().length(3, 'Currency code must be 3 characters').default('USD'),
  payment_terms: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const supplierFiltersSchema = z.object({
  page: z.string().optional().transform(v => v ? parseInt(v) : 1),
  per_page: z.string().optional().transform(v => v ? parseInt(v) : 10),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});
