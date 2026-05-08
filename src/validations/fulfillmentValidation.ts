import { z } from 'zod';

export const createFulfillmentSchema = z.object({
  order_id: z.string().uuid(),
  fulfillment_order_id: z.string().uuid().optional(),
  tracking_number: z.string().max(255).optional(),
  tracking_company: z.string().max(255).optional(),
  tracking_url: z.string().url().optional().or(z.literal('')),
  line_items: z.array(z.object({
    order_line_item_id: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1, 'At least one item must be fulfilled'),
});

export const updateFulfillmentSchema = z.object({
  status: z.enum(['pending', 'shipped', 'delivered', 'cancelled']).optional(),
  tracking_number: z.string().max(255).optional(),
  tracking_company: z.string().max(255).optional(),
  tracking_url: z.string().url().optional().or(z.literal('')),
});

export const fulfillmentFiltersSchema = z.object({
  page: z.string().optional().transform(v => v ? parseInt(v) : 1),
  per_page: z.string().optional().transform(v => v ? parseInt(v) : 10),
  search: z.string().optional(),
  status: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});
