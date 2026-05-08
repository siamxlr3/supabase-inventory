import { supabase } from '@/lib/supabase';
import { createAdjustmentSchema, adjustmentQuerySchema } from '@/validations/adjustmentValidation';
import { sendSuccess, sendError } from '@/lib/response';
import { logger } from '@/lib/logger';

export class AdjustmentController {
  /**
   * Create a new inventory adjustment and update stock levels.
   */
  static async create(body: any) {
    try {
      const validated = createAdjustmentSchema.parse(body);
      const { inventory_item_id, location_id, delta, reason, reference_document_type, reference_document_id } = validated;

      // 1. Insert Adjustment Record
      const { data: adjustment, error: adjError } = await supabase
        .from('inventory_adjustments')
        .insert({
          inventory_item_id,
          location_id,
          delta,
          reason,
          reference_document_type,
          reference_document_id,
          happened_at: validated.happened_at || new Date().toISOString()
        })
        .select()
        .single();

      if (adjError) throw adjError;

      // 2. Update Inventory Levels (Upsert)
      const { data: currentLevel, error: levelFetchError } = await supabase
        .from('inventory_levels')
        .select('*')
        .eq('inventory_item_id', inventory_item_id)
        .eq('location_id', location_id)
        .single();

      if (levelFetchError && levelFetchError.code !== 'PGRST116') throw levelFetchError;

      let updatedLevel;
      if (!currentLevel) {
        const { data, error } = await supabase
          .from('inventory_levels')
          .insert({
            inventory_item_id,
            location_id,
            on_hand: delta,
            committed: 0,
            incoming: 0
          })
          .select()
          .single();
        if (error) throw error;
        updatedLevel = data;
      } else {
        const { data, error } = await supabase
          .from('inventory_levels')
          .update({
            on_hand: currentLevel.on_hand + delta,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentLevel.id)
          .select()
          .single();
        if (error) throw error;
        updatedLevel = data;
      }

      // 3. Low Stock Check & Alert Triggering
      // We need reorder_point from the variant or product. 
      // For this implementation, we'll assume a threshold or fetch it.
      await this.checkLowStock(inventory_item_id, location_id, updatedLevel);

      return sendSuccess('Inventory adjusted successfully', { adjustment, level: updatedLevel });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return sendError('Validation failed', error.errors, 400);
      }
      logger.error('AdjustmentController.create', error);
      return sendError(error.message || 'Failed to adjust inventory');
    }
  }

  /**
   * Check if available stock falls below threshold and create alert.
   */
  private static async checkLowStock(itemId: string, locationId: string, level: any) {
    try {
      const available = level.on_hand - level.committed;
      
      // In a real system, we'd fetch the reorder_point from the product_variants table.
      const { data: variant } = await supabase
        .from('product_variants')
        .select('title')
        .eq('id', (await supabase.from('inventory_items').select('variant_id').eq('id', itemId).single()).data?.variant_id)
        .single();

      const THRESHOLD = 10; // Default threshold for demo

      if (available <= THRESHOLD) {
        // Check if an unresolved alert already exists to prevent spam
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('inventory_item_id', itemId)
          .eq('location_id', locationId)
          .eq('resolved', false)
          .maybeSingle();

        if (!existingAlert) {
          await supabase.from('alerts').insert({
            inventory_item_id: itemId,
            location_id: locationId,
            type: 'low_stock',
            message: `Low stock alert for ${variant?.title || 'item'}. Available: ${available}, Threshold: ${THRESHOLD}`,
            resolved: false
          });
        }
      } else {
        // Auto-resolve alert if stock recovered
        await supabase
          .from('alerts')
          .update({ resolved: true, updated_at: new Date().toISOString() })
          .eq('inventory_item_id', itemId)
          .eq('location_id', locationId)
          .eq('resolved', false);
      }
    } catch (err) {
      logger.error('AdjustmentController.checkLowStock', err);
    }
  }

  /**
   * Get adjustment history.
   */
  static async getAll(queryParams: any) {
    try {
      const validated = adjustmentQuerySchema.parse(queryParams);
      const { page, per_page, inventory_item_id, location_id, reason, from_date, to_date } = validated;

      let query = supabase
        .from('inventory_adjustments')
        .select(`
          *,
          location:locations(name),
          item:inventory_items(sku)
        `, { count: 'exact' });

      if (inventory_item_id) query = query.eq('inventory_item_id', inventory_item_id);
      if (location_id) query = query.eq('location_id', location_id);
      if (reason) query = query.eq('reason', reason);
      if (from_date) query = query.gte('happened_at', from_date);
      if (to_date) query = query.lte('happened_at', to_date);

      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to).order('happened_at', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;

      return sendSuccess('Adjustments fetched successfully', data, {
        page,
        per_page,
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / per_page)
      });
    } catch (error: any) {
      logger.error('AdjustmentController.getAll', error);
      return sendError(error.message || 'Failed to fetch adjustments');
    }
  }
}
