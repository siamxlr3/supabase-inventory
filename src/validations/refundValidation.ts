import { z } from 'zod';

export const createRefundSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  note: z.string().optional(),
  restock: z.boolean().default(true),
  duties_refunded: z.number().min(0).optional().default(0),
  line_items: z.array(
    z.object({
      order_line_item_id: z.string().uuid('Invalid line item ID'),
      quantity: z.number().int().positive('Quantity must be greater than zero'),
      restocked: z.boolean().optional().default(true),
    })
  ).min(1, 'At least one line item is required for a refund'),
});

export const refundQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});
