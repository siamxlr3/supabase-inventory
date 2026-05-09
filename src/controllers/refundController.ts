import { supabase } from '@/lib/supabase';
import { createRefundSchema, refundQuerySchema } from '@/validations/refundValidation';
import { sendSuccess, sendError } from '@/lib/response';
import { logger } from '@/lib/logger';

export class RefundController {
  static async getAll(queryParams: any) {
    try {
      const validated = refundQuerySchema.parse(queryParams);
      const { page, per_page, search, status, from_date, to_date } = validated;

      let query;

      if (search) {
        // When searching by customer name/email, we must use an inner join on customers
        query = supabase
          .from('refunds')
          .select(`
            *,
            order:orders(name, email),
            customer:customers!inner(first_name, last_name, email)
          `, { count: 'exact' })
          .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`, { foreignTable: 'customers' });
      } else {
        query = supabase
          .from('refunds')
          .select(`
            *,
            order:orders(name, email),
            customer:customers(first_name, last_name, email)
          `, { count: 'exact' });
      }

      if (status) query = query.eq('status', status);
      if (from_date) query = query.gte('created_at', from_date);
      if (to_date) query = query.lte('created_at', to_date);

      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;

      return sendSuccess('Refunds fetched successfully', data, {
        page,
        per_page,
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / per_page)
      });
    } catch (error: any) {
      if (error.name === 'ZodError') return sendError('Validation failed', error.errors, 400);
      logger.error('RefundController.getAll', error);
      return sendError(error.message || 'Failed to fetch refunds');
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('refunds')
        .select(`
          *,
          order:orders(*),
          customer:customers(*),
          line_items:refund_line_items(
            *,
            order_line_item:order_line_items(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return sendError('Refund not found', null, 404);

      return sendSuccess('Refund fetched successfully', data);
    } catch (error: any) {
      logger.error('RefundController.getById', error);
      return sendError(error.message || 'Failed to fetch refund');
    }
  }

  static async create(body: any) {
    try {
      const validated = createRefundSchema.parse(body);

      // 1. Fetch Order and Line Items to validate quantities and amounts
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, line_items:order_line_items(*)')
        .eq('id', validated.order_id)
        .single();

      if (orderError || !order) throw new Error('Order not found');

      let totalRefundAmount = validated.duties_refunded;
      const lineItemsToInsert = [];

      for (const item of validated.line_items) {
        const orderLineItem = order.line_items.find((li: any) => li.id === item.order_line_item_id);
        if (!orderLineItem) throw new Error(`Line item ${item.order_line_item_id} not found in this order`);
        if (item.quantity > orderLineItem.quantity) throw new Error(`Cannot refund more than ordered for item ${orderLineItem.title}`);

        // Calculate proportional refund amount per line item based on quantity
        const amount = (orderLineItem.price - (orderLineItem.total_discount / orderLineItem.quantity)) * item.quantity;
        totalRefundAmount += amount;

        lineItemsToInsert.push({
          order_line_item_id: item.order_line_item_id,
          quantity: item.quantity,
          restocked: item.restocked ?? validated.restock,
          amount: amount,
          _inventory_item_id: orderLineItem.inventory_item_id,
          _variant_id: orderLineItem.product_variant_id
        });
      }

      // 2. Create Refund Record
      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .insert({
          order_id: validated.order_id,
          customer_id: order.customer_id,
          note: validated.note,
          restock: validated.restock,
          duties_refunded: validated.duties_refunded,
          total_amount: totalRefundAmount,
          status: 'completed'
        })
        .select()
        .single();

      if (refundError) throw refundError;

      // 3. Create Refund Line Items
      const { error: lineItemsError } = await supabase
        .from('refund_line_items')
        .insert(
          lineItemsToInsert.map(li => ({
            refund_id: refund.id,
            order_line_item_id: li.order_line_item_id,
            quantity: li.quantity,
            restocked: li.restocked,
            amount: li.amount
          }))
        );

      if (lineItemsError) throw lineItemsError;

      // 4. Update Order Financial Status
      // If we refunded the full original order amount, status = refunded, else partially_refunded
      // Note: we might have multiple refunds per order, so we'd technically sum all refunds. 
      // For simplicity here, we assume it's partially_refunded if totalRefundAmount < order.total_price.
      const newStatus = totalRefundAmount >= order.total_price ? 'refunded' : 'partially_refunded';
      await supabase
        .from('orders')
        .update({ financial_status: newStatus })
        .eq('id', order.id);

      // 5. Handle Inventory Adjustments (Restock / Damaged)
      const locationId = order.location_id;
      if (locationId) {
        for (const li of lineItemsToInsert) {
          if (!li._variant_id) continue;
          
          let invItemId = li._inventory_item_id;
          if (!invItemId) {
              const { data: invItem } = await supabase.from('inventory_items').select('id').eq('variant_id', li._variant_id).single();
              if (invItem) invItemId = invItem.id;
          }

          if (invItemId) {
              const reason = li.restocked ? 'return' : 'damaged';
              const delta = li.restocked ? li.quantity : 0; // If damaged, we don't return it to on_hand stock, we just record a damage adjustment

              // Insert adjustment
              await supabase.from('inventory_adjustments').insert({
                  inventory_item_id: invItemId,
                  location_id: locationId,
                  delta: delta,
                  reason: reason,
                  reference_document_type: 'refund',
                  reference_document_id: refund.id
              });

              // Update inventory levels ONLY if we are restocking
              if (delta > 0) {
                  const { data: invLevel } = await supabase
                      .from('inventory_levels')
                      .select('id, on_hand')
                      .eq('inventory_item_id', invItemId)
                      .eq('location_id', locationId)
                      .single();

                  if (invLevel) {
                      await supabase.from('inventory_levels').update({
                          on_hand: invLevel.on_hand + delta
                      }).eq('id', invLevel.id);
                  }
              }
          }
        }
      }

      return sendSuccess('Refund created successfully', refund, null, 201);
    } catch (error: any) {
      if (error.name === 'ZodError') return sendError('Validation failed', error.errors, 400);
      logger.error('RefundController.create', error);
      return sendError(error.message || 'Failed to create refund');
    }
  }
}
