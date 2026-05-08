import { supabase } from '@/lib/supabase';
import { sendSuccess, sendError } from '@/lib/response';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const alertQuerySchema = z.object({
  page: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().default(1)),
  per_page: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().max(100).default(10)),
  resolved: z.preprocess((v) => v === 'true', z.boolean().optional()),
  location_id: z.string().uuid().optional(),
});

export class AlertController {
  /**
   * Get all alerts with filtering.
   */
  static async getAll(queryParams: any) {
    try {
      const validated = alertQuerySchema.parse(queryParams);
      const { page, per_page, resolved, location_id } = validated;

      let query = supabase
        .from('alerts')
        .select(`
          *,
          location:locations(name),
          item:inventory_items(
            sku,
            variant:product_variants(title)
          )
        `, { count: 'exact' });

      if (resolved !== undefined) query = query.eq('resolved', resolved);
      if (location_id) query = query.eq('location_id', location_id);

      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;

      return sendSuccess('Alerts fetched successfully', data, {
        page,
        per_page,
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / per_page)
      });
    } catch (error: any) {
      logger.error('AlertController.getAll', error);
      return sendError(error.message || 'Failed to fetch alerts');
    }
  }

  /**
   * Manually resolve an alert.
   */
  static async resolve(id: string) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ resolved: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return sendSuccess('Alert resolved successfully', data);
    } catch (error: any) {
      logger.error('AlertController.resolve', error);
      return sendError(error.message || 'Failed to resolve alert');
    }
  }
}
