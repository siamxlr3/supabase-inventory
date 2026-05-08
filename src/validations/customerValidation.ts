import { z } from 'zod';

export const createCustomerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  fulfills_online_orders: z.boolean().default(false),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  per_page: z.string().transform(Number).default('10'),
});
