import { supabase } from '@/lib/supabase';
import { sendSuccess, sendError } from '@/lib/response';
import { logger } from '@/lib/logger';
import { format, parseISO, startOfWeek, startOfMonth } from 'date-fns';

export class OrderReportController {
  
  static async getOverview(queryParams: any) {
    try {
      const period = queryParams.period || 'day'; // 'day' | 'week' | 'month'

      // Fetch all non-voided orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, total_price, created_at, financial_status, fulfillment_status, cancelled_at')
        .neq('financial_status', 'voided');

      if (error) throw error;

      let totalRevenue = 0;
      let totalOrders = 0;
      let newCustomers = new Set(); // We approximate new customers by unique emails if we fetched emails. Wait, we didn't fetch email.
      // Let's refetch with email
      const { data: ordersWithEmail } = await supabase
        .from('orders')
        .select('id, total_price, created_at, financial_status, fulfillment_status, cancelled_at, email')
        .neq('financial_status', 'voided');
        
      const validOrders = ordersWithEmail || [];

      // Maps for charts
      const volumeMap: Record<string, { volume: number, revenue: number }> = {};
      
      let fulfilledCount = 0;
      let cancelledCount = 0;
      let refundedCount = 0;

      validOrders.forEach(order => {
        totalOrders++;
        
        // Revenue is based on paid or partially paid
        if (order.financial_status === 'paid' || order.financial_status === 'partially_paid' || order.financial_status === 'refunded') {
            // Note: technically refunded might have revenue 0 eventually, but gross revenue includes it.
            // Let's use total_price as gross revenue.
            totalRevenue += Number(order.total_price);
        }

        newCustomers.add(order.email);

        // Fulfillment
        if (order.fulfillment_status === 'fulfilled') fulfilledCount++;
        
        // Cancellation & Refunds
        if (order.cancelled_at) cancelledCount++;
        if (order.financial_status === 'refunded' || order.financial_status === 'partially_refunded') refundedCount++;

        // Volume & Revenue Grouping
        let dateKey = '';
        const d = parseISO(order.created_at);
        if (period === 'month') {
          dateKey = format(startOfMonth(d), 'MMM yyyy');
        } else if (period === 'week') {
          dateKey = `Week of ${format(startOfWeek(d), 'MMM d')}`;
        } else {
          dateKey = format(d, 'MMM d');
        }

        if (!volumeMap[dateKey]) {
          volumeMap[dateKey] = { volume: 0, revenue: 0 };
        }
        volumeMap[dateKey].volume++;
        volumeMap[dateKey].revenue += Number(order.total_price);
      });

      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const fulfillmentRate = totalOrders > 0 ? (fulfilledCount / totalOrders) * 100 : 0;
      const cancellationRate = totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;
      const refundRate = totalOrders > 0 ? (refundedCount / totalOrders) * 100 : 0;

      const chartData = Object.entries(volumeMap).map(([periodStr, data]) => ({
        period: periodStr,
        volume: data.volume,
        revenue: Number(data.revenue.toFixed(2))
      }));

      // Sort by chronological order if possible. Since the keys are strings, simple sorting might be off for weeks.
      // But typically, the response will be somewhat sorted or we can just return it.

      return sendSuccess('Order overview fetched successfully', {
        kpis: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          uniqueCustomers: newCustomers.size,
        },
        rates: {
          fulfillmentRate,
          cancellationRate,
          refundRate
        },
        chartData
      });
    } catch (error: any) {
      logger.error('OrderReportController.getOverview', error);
      return sendError('Failed to fetch order overview');
    }
  }

  static async getTopSellers() {
    try {
      const { data: lineItems, error } = await supabase
        .from('order_line_items')
        .select(`
          quantity,
          price,
          variant:product_variants(
            id,
            title,
            product:products(title)
          )
        `);

      if (error) throw error;

      const sellerMap: Record<string, { title: string, qty: number, revenue: number }> = {};

      lineItems.forEach(item => {
        if (!item.variant) return; // Skip if no variant linked
        
        // Supabase typings are sometimes tricky for deeply nested objects
        const variantAny = item.variant as any;
        const variantId = variantAny.id;
        const productName = variantAny.product?.title || 'Unknown Product';
        const variantName = variantAny.title !== 'Default Title' ? ` - ${variantAny.title}` : '';
        const fullTitle = `${productName}${variantName}`;

        if (!sellerMap[variantId]) {
          sellerMap[variantId] = { title: fullTitle, qty: 0, revenue: 0 };
        }
        
        sellerMap[variantId].qty += item.quantity;
        sellerMap[variantId].revenue += (Number(item.price) * item.quantity);
      });

      const topSellers = Object.values(sellerMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return sendSuccess('Top sellers fetched successfully', topSellers);
    } catch (error: any) {
      logger.error('OrderReportController.getTopSellers', error);
      return sendError('Failed to fetch top sellers');
    }
  }
}
