import { z } from 'zod';

/**
 * Zod schemas for Location validation.
 */

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(100),
  address1: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country_code: z.string().min(2, 'Valid country code is required').max(5),
  active: z.boolean().default(true),
  fulfills_online_orders: z.boolean().default(false),
});

export const updateLocationSchema = createLocationSchema.partial();

export const locationQuerySchema = z.object({
  page: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().default(1)),
  per_page: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().max(100).default(10)),
  search: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  active: z.preprocess((v) => {
    if (v === 'true') return true;
    if (v === 'false') return false;
    return undefined;
  }, z.boolean().optional()),
  from_date: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  to_date: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
});
