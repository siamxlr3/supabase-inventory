import { z } from 'zod';

const reasonEnum = z.enum(['sale', 'return', 'received', 'damaged', 'correction', 'cycle_count']);

export const createAdjustmentSchema = z.object({
  inventory_item_id: z.string().uuid(),
  location_id: z.string().uuid(),
  delta: z.number().int(),
  reason: reasonEnum,
  reference_document_type: z.string().optional(),
  reference_document_id: z.string().optional(),
  happened_at: z.string().datetime().optional(),
});

export const adjustmentQuerySchema = z.object({
  page: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().default(1)),
  per_page: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().max(100).default(10)),
  inventory_item_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional(),
  reason: reasonEnum.optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});
