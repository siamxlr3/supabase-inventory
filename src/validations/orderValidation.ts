import { z } from 'zod';

export const createOrderSchema = z.object({
  customer_id: z.string().uuid().optional(),
  email: z.string().email(),
  location_id: z.string().uuid(),
  payment_method: z.string().optional(),
  payment_reference: z.string().optional(),
  financial_status: z.enum(['pending', 'authorized', 'paid', 'partially_paid', 'refunded', 'voided', 'partially_refunded']).optional(),
  currency: z.string().length(3).optional(),
  line_items: z.array(z.object({
    product_variant_id: z.string().uuid(),
    inventory_item_id: z.string().uuid().optional(),
    location_id: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(),
    total_discount: z.number().nonnegative().optional(),
    requires_shipping: z.boolean().optional(),
    title: z.string(),
    sku: z.string().optional(),
  })).min(1, 'At least one line item is required'),
});

export const updateOrderSchema = z.object({
  financial_status: z.enum(['pending', 'authorized', 'paid', 'partially_paid', 'refunded', 'voided', 'partially_refunded']).optional(),
  fulfillment_status: z.enum(['unfulfilled', 'partially_fulfilled', 'fulfilled', 'restocked', 'voided']).optional(),
  cancel_reason: z.string().optional(),
});

export const orderFiltersSchema = z.object({
  page: z.string().optional().transform(v => v ? parseInt(v) : 1),
  per_page: z.string().optional().transform(v => v ? parseInt(v) : 10),
  search: z.string().optional(),
  financial_status: z.string().optional(),
  fulfillment_status: z.string().optional(),
  location_id: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});
