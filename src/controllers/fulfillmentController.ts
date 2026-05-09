import { supabase } from '@/lib/supabase';
import { ApiResponse, sendSuccess, sendError } from '@/lib/response';
import { Fulfillment, CreateFulfillmentDTO, FulfillmentFilters } from '@/models/fulfillment';
import { createFulfillmentSchema, updateFulfillmentSchema, fulfillmentFiltersSchema } from '@/validations/fulfillmentValidation';
import { logger } from '@/lib/logger';

export class FulfillmentController {
  static async getFulfillments(filters: any) {
    const startTime = Date.now();
    try {
      const validatedFilters = fulfillmentFiltersSchema.parse(filters);
      const { page, per_page, search, status, from_date, to_date } = validatedFilters;

      let query = supabase
        .from('fulfillments')
        .select('*, line_items:fulfillment_line_items(*)', { count: 'exact' });

      // Search (Tracking Number, Company)
      if (search) {
        query = query.or(`tracking_number.ilike.%${search}%,tracking_company.ilike.%${search}%`);
      }

      // Filtering
      if (status) query = query.eq('status', status);
      if (from_date) query = query.gte('created_at', from_date);
      if (to_date) query = query.lte('created_at', to_date);

      // Pagination
      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / per_page);

      const duration = Date.now() - startTime;
      if (duration > 500) logger.warn(`Slow query: getFulfillments took ${duration}ms`);

      return sendSuccess('Fulfillments fetched successfully', data, {
        total,
        page,
        per_page,
        total_pages: totalPages,
      });
    } catch (error: any) {
      return sendError(error.message || 'Failed to fetch fulfillments');
    }
  }

  static async getFulfillmentOrders(filters: any) {
    const startTime = Date.now();
    try {
      const { page = 1, per_page = 10, status = 'open' } = filters;

      let query = supabase
        .from('fulfillment_orders')
        .select('*, order:orders(*, line_items:order_line_items(*), fulfillments:fulfillments(*)), location:locations(*)', { count: 'exact' });

      if (status !== 'all') query = query.eq('status', status);

      const from = (parseInt(page) - 1) * parseInt(per_page);
      const to = from + parseInt(per_page) - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;

      const duration = Date.now() - startTime;
      if (duration > 500) logger.warn(`Slow query: getFulfillmentOrders took ${duration}ms`);

      return sendSuccess('Fulfillment orders fetched successfully', data, {
        total: count || 0,
        page: parseInt(page),
        per_page: parseInt(per_page),
        total_pages: Math.ceil((count || 0) / parseInt(per_page)),
      });
    } catch (error: any) {
      return sendError(error.message || 'Failed to fetch fulfillment orders');
    }
  }

  static async createFulfillment(body: CreateFulfillmentDTO) {
    try {
      const validatedData = createFulfillmentSchema.parse(body);
      const { order_id, line_items, ...fulfillmentData } = validatedData;

      // 1. Fetch Order and Line Items to validate quantities
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, line_items:order_line_items(*)')
        .eq('id', order_id)
        .single();

      if (orderError || !order) throw new Error('Order not found');

      // 2. Create Fulfillment
      const { data: fulfillment, error: fillError } = await supabase
        .from('fulfillments')
        .insert({
          order_id,
          ...fulfillmentData,
          status: 'shipped' // Default to shipped when created for now
        })
        .select()
        .single();

      if (fillError) throw fillError;

      // 3. Process Line Items and Inventory
      for (const item of line_items) {
        const orderLineItem = order.line_items.find((li: any) => li.id === item.order_line_item_id);
        if (!orderLineItem) throw new Error(`Order line item ${item.order_line_item_id} not found`);

        // Insert Fulfillment Line Item
        await supabase
          .from('fulfillment_line_items')
          .insert({
            fulfillment_id: fulfillment.id,
            order_line_item_id: item.order_line_item_id,
            quantity: item.quantity,
          });

        // Update Fulfillable Quantity on Order Line Item
        await supabase
          .from('order_line_items')
          .update({ 
            fulfillable_quantity: Math.max(0, orderLineItem.fulfillable_quantity - item.quantity) 
          })
          .eq('id', item.order_line_item_id);

        // Fallback for older orders without inventory_item_id directly on line item
        let invItemId = orderLineItem.inventory_item_id;
        if (!invItemId && orderLineItem.variant_id) {
            const { data: invItem } = await supabase
              .from('inventory_items')
              .select('id')
              .eq('variant_id', orderLineItem.variant_id)
              .single();
            if (invItem) invItemId = invItem.id;
        }

        // Decrement On Hand and Committed Qty on Inventory Level
        if (invItemId) {
            const locId = orderLineItem.location_id || order.location_id;
            const { data: invLevel, error: levelError } = await supabase
                .from('inventory_levels')
                .select('id, on_hand, committed')
                .eq('inventory_item_id', invItemId)
                .eq('location_id', locId)
                .single();

            if (invLevel) {
                await supabase
                    .from('inventory_levels')
                    .update({ 
                        on_hand: Math.max(0, invLevel.on_hand - item.quantity),
                        committed: Math.max(0, invLevel.committed - item.quantity) 
                    })
                    .eq('id', invLevel.id);
                
                // Record Adjustment
                await supabase
                    .from('inventory_adjustments')
                    .insert({
                        inventory_item_id: invItemId,
                        location_id: locId,
                        delta: -item.quantity,
                        reason: 'sale'
                    });
            }
        }
      }

      // 4. Update Order Fulfillment Status
      const { data: allFills } = await supabase
        .from('fulfillment_line_items')
        .select('quantity, order_line_item_id, fulfillments!inner(order_id)')
        .eq('fulfillments.order_id', order_id);

      const fulfilledMap: Record<string, number> = {};
      allFills?.forEach(f => {
        fulfilledMap[f.order_line_item_id] = (fulfilledMap[f.order_line_item_id] || 0) + f.quantity;
      });

      const isFullyFulfilled = order.line_items.every((li: any) => 
        (fulfilledMap[li.id] || 0) >= li.quantity
      );

      await supabase
        .from('orders')
        .update({ 
          fulfillment_status: isFullyFulfilled ? 'fulfilled' : 'partially_fulfilled' 
        })
        .eq('id', order_id);

      return sendSuccess('Fulfillment created successfully', fulfillment, null, 201);
    } catch (error: any) {
      logger.error('FulfillmentController.createFulfillment', error);
      return sendError(error.message || 'Failed to create fulfillment');
    }
  }

  static async updateFulfillment(id: string, body: any) {
    try {
      const validatedData = updateFulfillmentSchema.parse(body);

      const { data, error } = await supabase
        .from('fulfillments')
        .update(validatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return sendError('Fulfillment not found', null, 404);

      return sendSuccess('Fulfillment updated successfully', data);
    } catch (error: any) {
      return sendError(error.message || 'Failed to update fulfillment');
    }
  }

  static async deleteFulfillment(id: string) {
    try {
      const { error } = await supabase.from('fulfillments').delete().eq('id', id);
      if (error) throw error;
      return sendSuccess('Fulfillment deleted successfully');
    } catch (error: any) {
      return sendError(error.message || 'Failed to delete fulfillment');
    }
  }
}
