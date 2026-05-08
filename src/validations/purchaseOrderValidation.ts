import { z } from 'zod';

export const createPOLineItemSchema = z.object({
  inventory_item_id: z.string().uuid(),
  product_variant_id: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  unit_cost: z.number().nonnegative().default(0),
});

export const createPOSchema = z.object({
  supplier_id: z.string().uuid('Invalid supplier selected'),
  destination_location_id: z.string().uuid('Invalid location selected'),
  name: z.string().min(1, 'PO number/name is required'),
  note: z.string().optional(),
  currency_code: z.string().length(3).default('USD'),
  estimated_arrival_date: z.string().optional(),
  line_items: z.array(createPOLineItemSchema).min(1, 'At least one item is required'),
});

export const receiveGoodsSchema = z.object({
  line_items: z.array(z.object({
    id: z.string().uuid(),
    quantity_to_receive: z.number().int().nonnegative(),
  })).min(1, 'At least one item must be updated'),
});

export const poFiltersSchema = z.object({
  page: z.string().optional().transform(v => v ? parseInt(v) : 1),
  per_page: z.string().optional().transform(v => v ? parseInt(v) : 10),
  search: z.string().optional(),
  status: z.enum(['draft', 'sent', 'partial', 'received', 'closed']).optional(),
  supplier_id: z.string().optional(),
  location_id: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});
