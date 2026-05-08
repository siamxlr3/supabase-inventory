import { supabase } from '@/lib/supabase';
import { inventoryQuerySchema } from '@/validations/inventoryValidation';
import { sendSuccess, sendError } from '@/lib/response';
import { logger } from '@/lib/logger';

export class InventoryController {
  /**
   * Get inventory items with their levels across locations.
   */
  static async getAll(queryParams: any) {
    try {
      const validated = inventoryQuerySchema.parse(queryParams);
      const { page, per_page, search, location_id } = validated;

      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          product_variants(
            title,
            products(title)
          ),
          levels:inventory_levels(
            *,
            location:locations(name, city)
          )
        `, { count: 'exact' });

      if (search) {
        query = query.or(`sku.ilike.%${search}%`);
      }

      // Pagination
      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to).order('sku', { ascending: true });

      const { data, error, count } = await query;
      if (error) throw error;

      // Flatten or structure the data for the frontend
      // If location_id is provided, we filter the levels
      const results = (data || []).map(item => {
        const levels = location_id 
          ? (item.levels || []).filter((l: any) => l.location_id === location_id)
          : (item.levels || []);
          
        return {
          id: item.id,
          sku: item.sku,
          variant: item.product_variants,
          levels: levels.map((l: any) => ({
            ...l,
            available: l.on_hand - l.committed
          }))
        };
      });

      // If the user wants a flat list (Item @ Location), we flatten it
      const flatResults: any[] = [];
      results.forEach(item => {
        const variant = item.variant;
        const product = (variant as any)?.products;
        
        if (item.levels.length === 0) {
          flatResults.push({
            inventory_item_id: item.id,
            sku: item.sku,
            item: { sku: item.sku, variant: { ...variant, product } },
            on_hand: 0,
            committed: 0,
            incoming: 0,
            available: 0,
            location: { name: 'Not Stocked' }
          });
        } else {
          item.levels.forEach((l: any) => {
            flatResults.push({
              ...l,
              inventory_item_id: item.id,
              item: { sku: item.sku, variant: { ...variant, product } }
            });
          });
        }
      });

      return sendSuccess('Inventory fetched successfully', flatResults, {
        page,
        per_page,
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / per_page)
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return sendError('Validation failed', error.errors, 400);
      }
      logger.error('InventoryController.getAll', error);
      return sendError(error.message || 'Failed to fetch inventory');
    }
  }

  /**
   * Get single inventory level by item and location.
   */
  static async getByItemAndLocation(itemId: string, locationId: string) {
    try {
      const { data, error } = await supabase
        .from('inventory_levels')
        .select('*')
        .eq('inventory_item_id', itemId)
        .eq('location_id', locationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return sendSuccess('Inventory level fetched successfully', data || null);
    } catch (error: any) {
      logger.error('InventoryController.getByItemAndLocation', error);
      return sendError(error.message || 'Failed to fetch inventory level');
    }
  }
}
