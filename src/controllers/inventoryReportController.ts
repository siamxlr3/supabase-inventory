import { supabase } from '@/lib/supabase';
import { sendSuccess, sendError } from '@/lib/response';
import { logger } from '@/lib/logger';
import { subDays, parseISO, differenceInDays } from 'date-fns';

export class InventoryReportController {
  
  static async getStockLevels(queryParams: any) {
    try {
      const { page = 1, per_page = 20, search } = queryParams;

      let query = supabase
        .from('inventory_levels')
        .select(`
          id, on_hand, committed, incoming, updated_at,
          location:locations(name),
          item:inventory_items(
            sku, cost,
            variant:product_variants(
              title,
              product:products(title, product_type)
            )
          )
        `, { count: 'exact' })
        .gt('on_hand', 0);

      // Search functionality requires an RPC or complex filtering.
      // For simplicity, we just fetch paginated.
      
      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to).order('on_hand', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;

      return sendSuccess('Stock levels fetched successfully', data, {
        page: Number(page),
        per_page: Number(per_page),
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / Number(per_page))
      });
    } catch (error: any) {
      logger.error('InventoryReportController.getStockLevels', error);
      return sendError('Failed to fetch stock levels');
    }
  }

  static async getValuation() {
    try {
      // Fetch all inventory levels with cost
      const { data, error } = await supabase
        .from('inventory_levels')
        .select(`
          on_hand,
          item:inventory_items(
            cost,
            variant:product_variants(
              product:products(product_type)
            )
          )
        `)
        .gt('on_hand', 0);

      if (error) throw error;

      let totalValue = 0;
      const categoryMap: Record<string, { value: number, count: number }> = {};

      data.forEach(level => {
        const item = level.item as any;
        const cost = item?.cost || 0;
        const onHand = level.on_hand;
        const value = onHand * cost;

        totalValue += value;

        // Ensure safe access to nested properties
        let productType = 'Uncategorized';
        
        // Typing workaround for deeply nested Supabase response
        if (item?.variant?.product?.product_type) {
            productType = item.variant.product.product_type;
        }

        if (!categoryMap[productType]) {
          categoryMap[productType] = { value: 0, count: 0 };
        }
        categoryMap[productType].value += value;
        categoryMap[productType].count += onHand;
      });

      const valuationByCategory = Object.entries(categoryMap).map(([category, stats]) => ({
        category,
        value: stats.value,
        count: stats.count
      })).sort((a, b) => b.value - a.value);

      return sendSuccess('Valuation fetched successfully', {
        totalValue,
        valuationByCategory
      });
    } catch (error: any) {
      logger.error('InventoryReportController.getValuation', error);
      return sendError('Failed to fetch valuation');
    }
  }

  static async getAgingItems(queryParams: any) {
    try {
      const days = Number(queryParams.days) || 30;
      const cutoffDate = subDays(new Date(), days).toISOString();

      // 1. Get all inventory items that HAVE moved in the last N days
      const { data: recentAdjustments, error: adjError } = await supabase
        .from('inventory_adjustments')
        .select('inventory_item_id')
        .gte('happened_at', cutoffDate);

      if (adjError) throw adjError;

      const activeItemIds = new Set(recentAdjustments.map(a => a.inventory_item_id));

      // 2. Get all inventory levels where on_hand > 0
      const { data: allLevels, error: lvlError } = await supabase
        .from('inventory_levels')
        .select(`
          id, on_hand, updated_at,
          location:locations(name),
          item:inventory_items(
            id, sku, cost,
            variant:product_variants(
              title,
              product:products(title, product_type)
            )
          )
        `)
        .gt('on_hand', 0);

      if (lvlError) throw lvlError;

      // 3. Filter for aging items (not in activeItemIds)
      const agingItems = allLevels.filter(level => !activeItemIds.has((level.item as any)?.id));

      // Calculate days since last movement (we approximate using updated_at of the level, 
      // or if we really want, we could query the MAX(happened_at) for these items, but that's an N+1 query.
      // We will just use updated_at as a proxy for now).
      const enrichedAgingItems = agingItems.map(item => ({
        ...item,
        days_aging: differenceInDays(new Date(), parseISO(item.updated_at))
      })).sort((a, b) => b.days_aging - a.days_aging);

      return sendSuccess('Aging items fetched successfully', enrichedAgingItems);
    } catch (error: any) {
      logger.error('InventoryReportController.getAgingItems', error);
      return sendError('Failed to fetch aging items');
    }
  }

  static async getAdjustments(queryParams: any) {
    try {
      const { page = 1, per_page = 20, reason, from_date, to_date } = queryParams;

      let query = supabase
        .from('inventory_adjustments')
        .select(`
          id, delta, reason, happened_at, reference_document_type,
          location:locations(name),
          item:inventory_items(
            sku,
            variant:product_variants(
              title,
              product:products(title)
            )
          )
        `, { count: 'exact' });

      if (reason && reason !== 'all') query = query.eq('reason', reason);
      if (from_date) query = query.gte('happened_at', from_date);
      if (to_date) query = query.lte('happened_at', to_date);

      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to).order('happened_at', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;

      return sendSuccess('Adjustments fetched successfully', data, {
        page: Number(page),
        per_page: Number(per_page),
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / Number(per_page))
      });
    } catch (error: any) {
      logger.error('InventoryReportController.getAdjustments', error);
      return sendError('Failed to fetch adjustments');
    }
  }
}
