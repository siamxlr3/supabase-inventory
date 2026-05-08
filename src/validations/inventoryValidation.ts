import { z } from 'zod';

export const inventoryQuerySchema = z.object({
  page: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().default(1)),
  per_page: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().max(1000).default(10)),
  inventory_item_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional(),
  low_stock_only: z.preprocess((v) => v === 'true', z.boolean().default(false)),
});

export const updateStockSchema = z.object({
  inventory_item_id: z.string().uuid(),
  location_id: z.string().uuid(),
  on_hand: z.number().int().optional(),
  committed: z.number().int().optional(),
  incoming: z.number().int().optional(),
});
