import { supabase } from '@/lib/supabase';
import { sendSuccess, sendError } from '@/lib/response';
import { 
  createPOSchema, 
  poFiltersSchema 
} from '@/validations/purchaseOrderValidation';
import { logger } from '@/lib/logger';

export class PurchaseOrderController {
  static async getAll(filters: any) {
    const startTime = Date.now();
    try {
      const validatedFilters = poFiltersSchema.parse(filters);
      const { page, per_page, search, status, supplier_id, location_id, from_date, to_date } = validatedFilters;

      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(id, name),
          destination:locations(id, name)
        `, { count: 'exact' });

      if (search) query = query.ilike('name', `%${search}%`);
      if (status) query = query.eq('status', status);
      if (supplier_id) query = query.eq('supplier_id', supplier_id);
      if (location_id) query = query.eq('destination_location_id', location_id);
      if (from_date) query = query.gte('created_at', from_date);
      if (to_date) query = query.lte('created_at', to_date);

      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;

      const duration = Date.now() - startTime;
      if (duration > 500) logger.warn(`Slow query: PO.getAll took ${duration}ms`);

      return sendSuccess('Purchase orders fetched', data, {
        total: count || 0,
        page,
        per_page,
        total_pages: Math.ceil((count || 0) / per_page)
      });
    } catch (error: any) {
      return sendError(error.message);
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*),
          destination:locations(*),
          line_items:purchase_order_line_items(
            *,
            product_variant:product_variants(id, title, sku)
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return sendError('Purchase order not found', null, 404);
      return sendSuccess('Purchase order details', data);
    } catch (error: any) {
      return sendError(error.message);
    }
  }

  /**
   * Create PO + immediately receive all items in one atomic operation.
   * Creates the PO, inserts line items (with quantity_received = quantity),
   * increments on_hand inventory, and records adjustments.
   */
  static async createAndReceive(body: any) {
    try {
      const validatedData = createPOSchema.parse(body);
      const { line_items, ...poData } = validatedData;

      const totalCost = line_items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

      // 1. Create PO with status = received
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({ ...poData, total_cost: totalCost, status: 'received' })
        .select()
        .maybeSingle();

      if (poError) {
        if (poError.code === '23505') return sendError('A PO with this name already exists', null, 400);
        throw poError;
      }

      // 2. Create Line Items with quantity_received = quantity
      const lineItemsToInsert = line_items.map(item => ({
        ...item,
        purchase_order_id: po.id,
        quantity_received: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_line_items')
        .insert(lineItemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Update inventory for each line item
      for (const item of line_items) {
        const { data: level } = await supabase
          .from('inventory_levels')
          .select('on_hand')
          .eq('inventory_item_id', item.inventory_item_id)
          .eq('location_id', poData.destination_location_id)
          .maybeSingle();

        if (level) {
          await supabase
            .from('inventory_levels')
            .update({ on_hand: level.on_hand + item.quantity })
            .eq('inventory_item_id', item.inventory_item_id)
            .eq('location_id', poData.destination_location_id);
        } else {
          await supabase
            .from('inventory_levels')
            .insert({
              inventory_item_id: item.inventory_item_id,
              location_id: poData.destination_location_id,
              on_hand: item.quantity,
              committed: 0,
              incoming: 0
            });
        }

        // Record adjustment
        await supabase
          .from('inventory_adjustments')
          .insert({
            inventory_item_id: item.inventory_item_id,
            location_id: poData.destination_location_id,
            delta: item.quantity,
            reason: 'received'
          });
      }

      return sendSuccess('Purchase order created and goods received', po, null, 201);
    } catch (error: any) {
      return sendError(error.message);
    }
  }

  static async receive(id: string) {
    try {
      // 1. Fetch PO and Line Items
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .select('*, line_items:purchase_order_line_items(*)')
        .eq('id', id)
        .maybeSingle();

      if (poError || !po) throw new Error('Purchase order not found');
      if (po.status === 'received') return sendError('Purchase order already received', null, 400);

      // 2. Update inventory for each line item
      for (const item of po.line_items) {
        if (!item.inventory_item_id) continue;

        const { data: level } = await supabase
          .from('inventory_levels')
          .select('on_hand')
          .eq('inventory_item_id', item.inventory_item_id)
          .eq('location_id', po.destination_location_id)
          .maybeSingle();

        if (level) {
          await supabase
            .from('inventory_levels')
            .update({ on_hand: level.on_hand + item.quantity })
            .eq('inventory_item_id', item.inventory_item_id)
            .eq('location_id', po.destination_location_id);
        } else {
          await supabase
            .from('inventory_levels')
            .insert({
              inventory_item_id: item.inventory_item_id,
              location_id: po.destination_location_id,
              on_hand: item.quantity,
              committed: 0,
              incoming: 0
            });
        }

        // Update line item to show it's received
        await supabase
          .from('purchase_order_line_items')
          .update({ quantity_received: item.quantity })
          .eq('id', item.id);

        // Record adjustment
        await supabase
          .from('inventory_adjustments')
          .insert({
            inventory_item_id: item.inventory_item_id,
            location_id: po.destination_location_id,
            delta: item.quantity,
            reason: 'received',
            reference_document_type: 'purchase_order',
            reference_document_id: po.id
          });
      }

      // 3. Update PO status
      const { data: updatedPo, error: updateError } = await supabase
        .from('purchase_orders')
        .update({ status: 'received' })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;

      return sendSuccess('Purchase order received successfully', updatedPo);
    } catch (error: any) {
      return sendError(error.message);
    }
  }

  static async send(id: string) {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) return sendError('Purchase order not found', null, 404);

      return sendSuccess('Purchase order marked as sent', data);
    } catch (error: any) {
      return sendError(error.message);
    }
  }

  static async delete(id: string) {
    try {
      const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
      if (error) throw error;
      return sendSuccess('Purchase order deleted');
    } catch (error: any) {
      return sendError(error.message);
    }
  }
}
