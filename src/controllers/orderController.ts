// Standardized Order Controller with response utilities
import { supabase } from '@/lib/supabase';
import { ApiResponse, sendSuccess, sendError } from '@/lib/response';
import { Order, CreateOrderDTO, OrderFilters } from '@/models/order';
import { createOrderSchema, updateOrderSchema, orderFiltersSchema } from '@/validations/orderValidation';
import { logger } from '@/lib/logger';

const FINANCIAL_STATUS_ORDER = {
  'pending': 0,
  'authorized': 1,
  'paid': 2,
  'partially_paid': 2,
  'refunded': 3,
  'partially_refunded': 3,
  'voided': 4
};

const FULFILLMENT_STATUS_ORDER = {
  'unfulfilled': 0,
  'partially_fulfilled': 1,
  'fulfilled': 2,
  'restocked': 3,
  'voided': 3
};

export class OrderController {
  static async getOrders(filters: any) {
    const startTime = Date.now();
    try {
      const validatedFilters = orderFiltersSchema.parse(filters);
      const { page, per_page, search, financial_status, fulfillment_status, location_id, from_date, to_date } = validatedFilters;

      let query = supabase
        .from('orders')
        .select('*, line_items:order_line_items(*)', { count: 'exact' });

      // Search
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Filtering
      if (financial_status) query = query.eq('financial_status', financial_status);
      if (fulfillment_status) query = query.eq('fulfillment_status', fulfillment_status);
      if (location_id) query = query.eq('location_id', location_id);

      // Date Filtering
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
      if (duration > 500) logger.warn(`Slow query: getOrders took ${duration}ms`);

      return sendSuccess('Orders fetched successfully', data, {
        total,
        page,
        per_page,
        total_pages: totalPages,
      });
    } catch (error: any) {
      return sendError(error.message || 'Failed to fetch orders');
    }
  }

  static async getOrderById(id: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, line_items:order_line_items(*), location:locations(*), fulfillments:fulfillments(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return sendError('Order not found', null, 404);

      return sendSuccess('Order fetched successfully', data);
    } catch (error: any) {
      return sendError(error.message || 'Failed to fetch order');
    }
  }

  static async createOrder(body: CreateOrderDTO) {
    try {
      const validatedData = createOrderSchema.parse(body);
      const { line_items, ...orderData } = validatedData;

      // 1. Generate Order Name (Simple approach: #ORD-timestamp)
      const orderName = `#ORD-${Date.now().toString().slice(-6)}`;

      // Calculate totals
      const subtotal = line_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.1; // 10% tax for demo
      const total = subtotal + tax;

      // 2. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          name: orderName,
          subtotal_price: subtotal,
          total_tax: tax,
          total_price: total,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Create Line Items
      const lineItemsToInsert = await Promise.all(line_items.map(async item => {
        let invItemId = item.inventory_item_id;
        
        // Fail-safe: Resolve inventory_item_id from variant if missing
        if (!invItemId) {
          const { data: invItem } = await supabase
            .from('inventory_items')
            .select('id')
            .eq('variant_id', item.product_variant_id)
            .single();
          invItemId = invItem?.id;
        }

        return {
          order_id: order.id,
          ...item,
          inventory_item_id: invItemId,
          fulfillable_quantity: item.quantity,
          tax_price: (item.price - (item.total_discount || 0)) * 0.1,
        };
      }));

      const { error: itemsError } = await supabase
        .from('order_line_items')
        .insert(lineItemsToInsert);

      if (itemsError) {
        // Rollback order (manual since no transaction in JS client)
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }

      return sendSuccess('Order created successfully', { ...order, line_items: lineItemsToInsert }, null, 201);
    } catch (error: any) {
      return sendError(error.message || 'Failed to create order');
    }
  }

  static async confirmOrder(id: string) {
    try {
      // 1. Fetch Order and Line Items
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*, line_items:order_line_items(*)')
        .eq('id', id)
        .single();

      if (fetchError || !order) throw new Error('Order not found');
      if (order.processed_at) return sendError('Order already processed');

      const locationId = order.location_id;
      if (!locationId) throw new Error('Order has no location assigned');

      // 2. Check Stock & Prepare Updates
      for (const item of order.line_items) {
        if (!item.product_variant_id) continue;

        // Fetch Inventory Item for Variant
        console.log(`DEBUG: Searching for variant_id: [${item.product_variant_id}] for item: ${item.title}`);
        const { data: invItem, error: invItemError } = await supabase
          .from('inventory_items')
          .select('id, sku')
          .eq('variant_id', item.product_variant_id)
          .single();

        if (invItemError || !invItem) {
          console.error(`DEBUG: Supabase Error for variant ${item.product_variant_id}:`, invItemError);
          logger.error(`ConfirmOrder: Inventory item not found for variant ${item.product_variant_id}. Error:`, invItemError);
          throw new Error(`Inventory item not found for variant ${item.title}`);
        }
        if (!invItem.tracked) continue;

        // Fetch Inventory Level at Location
        const { data: invLevel, error: invLevelError } = await supabase
            .from('inventory_levels')
            .select('*')
            .eq('inventory_item_id', invItem.id)
            .eq('location_id', locationId)
            .single();

        if (invLevelError || !invLevel) throw new Error(`No inventory level for ${item.title} at this location`);

        const available = invLevel.on_hand - invLevel.committed;
        if (available < item.quantity) {
            // Handle back-order logic if needed
            throw new Error(`Insufficient stock for ${item.title}. Available: ${available}, Needed: ${item.quantity}`);
        }

        // 3. Update Inventory Level (Increment Committed)
        const { error: updateLevelError } = await supabase
            .from('inventory_levels')
            .update({ 
                committed: invLevel.committed + item.quantity 
            })
            .eq('id', invLevel.id);

        if (updateLevelError) throw updateLevelError;

        // 4. Create Inventory Adjustment (Reservation/Committed)
        // Note: We don't decrement on_hand here, it happens during fulfillment.
        // But we record the adjustment for tracking.
        const { error: adjError } = await supabase
            .from('inventory_adjustments')
            .insert({
                inventory_item_id: invItem.id,
                location_id: locationId,
                delta: 0, // No physical change yet
                reason: 'sale',
                reference_document_type: 'order',
                reference_document_id: order.id,
            });
        
        if (adjError) throw adjError;
      }

      // 5. Update Order
      const { data: updatedOrder, error: updateOrderError } = await supabase
        .from('orders')
        .update({ 
            processed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateOrderError) throw updateOrderError;

      // 6. Create Fulfillment Order (The warehouse request)
      await supabase
        .from('fulfillment_orders')
        .insert({
            order_id: id,
            location_id: order.location_id,
            status: 'open',
            request_status: 'submitted'
        });

      return sendSuccess('Order confirmed and inventory adjusted', updatedOrder);
    } catch (error: any) {
      return sendError(error.message || 'Failed to confirm order');
    }
  }

  static async updateOrder(id: string, body: any) {
    try {
      const validatedData = updateOrderSchema.parse(body);

      // 1. Fetch current order
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !currentOrder) throw new Error('Order not found');

      // 2. Validate Transitions
      if (validatedData.financial_status) {
        const currentWeight = FINANCIAL_STATUS_ORDER[currentOrder.financial_status as keyof typeof FINANCIAL_STATUS_ORDER] || 0;
        const newWeight = FINANCIAL_STATUS_ORDER[validatedData.financial_status as keyof typeof FINANCIAL_STATUS_ORDER] || 0;
        if (newWeight < currentWeight && currentOrder.financial_status !== 'voided') {
          throw new Error(`Invalid financial status transition: ${currentOrder.financial_status} -> ${validatedData.financial_status}`);
        }
      }

      if (validatedData.fulfillment_status) {
        const currentWeight = FULFILLMENT_STATUS_ORDER[currentOrder.fulfillment_status as keyof typeof FULFILLMENT_STATUS_ORDER] || 0;
        const newWeight = FULFILLMENT_STATUS_ORDER[validatedData.fulfillment_status as keyof typeof FULFILLMENT_STATUS_ORDER] || 0;
        if (newWeight < currentWeight && currentOrder.fulfillment_status !== 'voided') {
          throw new Error(`Invalid fulfillment status transition: ${currentOrder.fulfillment_status} -> ${validatedData.fulfillment_status}`);
        }
      }

      const { data, error } = await supabase
        .from('orders')
        .update(validatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return sendSuccess('Order updated successfully', data);
    } catch (error: any) {
      return sendError(error.message || 'Failed to update order');
    }
  }

  static async cancelOrder(id: string) {
    try {
      // 1. Fetch Order and Line Items
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*, line_items:order_line_items(*)')
        .eq('id', id)
        .single();

      if (fetchError || !order) throw new Error('Order not found');
      if (order.financial_status === 'voided') return sendError('Order is already cancelled');

      // 2. Reverse Inventory if it was processed
      if (order.processed_at) {
        const locationId = order.location_id;
        for (const item of order.line_items) {
          if (!item.variant_id) continue;

          const { data: invItem } = await supabase
            .from('inventory_items')
            .select('id, tracked')
            .eq('variant_id', item.variant_id)
            .single();
          
          if (!invItem?.tracked) continue;

          const { data: invLevel } = await supabase
            .from('inventory_levels')
            .select('*')
            .eq('inventory_item_id', invItem.id)
            .eq('location_id', locationId)
            .single();

          if (!invLevel) continue;

          // Reverse commitment
          await supabase
            .from('inventory_levels')
            .update({ 
                committed: Math.max(0, invLevel.committed - item.quantity),
                on_hand: invLevel.on_hand + item.quantity // Restore stock
            })
            .eq('id', invLevel.id);

          // Write Cancel Adjustment
          await supabase
            .from('inventory_adjustments')
            .insert({
                inventory_item_id: invItem.id,
                location_id: locationId,
                delta: item.quantity,
                reason: 'cancel',
                reference_document_type: 'order',
                reference_document_id: order.id,
            });
        }
      }

      // 3. Update Order Status
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({ 
            financial_status: 'voided',
            fulfillment_status: 'voided',
            cancelled_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      return sendSuccess('Order cancelled successfully and inventory restored', updatedOrder);
    } catch (error: any) {
      return sendError(error.message || 'Failed to cancel order');
    }
  }

  static async deleteOrder(id: string) {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      return sendSuccess('Order deleted successfully');
    } catch (error: any) {
      return sendError(error.message || 'Failed to delete order');
    }
  }
}
