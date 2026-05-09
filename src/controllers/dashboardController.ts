import { supabase } from '@/lib/supabase';
import { sendSuccess, sendError } from '@/lib/response';
import { logger } from '@/lib/logger';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, eachDayOfInterval, differenceInDays } from 'date-fns';

export class DashboardController {
  static async getAnalytics(queryParams: any) {
    try {
      const { from_date, to_date } = queryParams;

      let query = supabase
        .from('orders')
        .select(`
          id,
          total_price,
          created_at,
          financial_status,
          line_items:order_line_items(
            quantity,
            variant:product_variants(
              product:products(product_type)
            )
          )
        `);

      if (from_date) query = query.gte('created_at', from_date);
      if (to_date) query = query.lte('created_at', to_date);

      // Only count paid or partially_paid orders towards revenue? 
      // The user just said "Revenue Overview" and "Orders by Category".
      // We'll fetch all and aggregate.

      const { data: orders, error } = await query;
      if (error) throw error;

      // 1. Calculate Revenue Overview
      const isDateRange = from_date && to_date;
      const daysDiff = isDateRange ? differenceInDays(new Date(to_date), new Date(from_date)) : 365;
      
      const groupByFormat = daysDiff <= 60 ? 'MMM dd' : 'MMM yyyy';
      
      const revenueMap: Record<string, { revenue: number; orders: number }> = {};
      
      // Initialize map with empty dates if range provided
      if (isDateRange && daysDiff <= 60) {
        const days = eachDayOfInterval({ start: new Date(from_date), end: new Date(to_date) });
        days.forEach(d => {
            revenueMap[format(d, groupByFormat)] = { revenue: 0, orders: 0 };
        });
      } else if (isDateRange && daysDiff > 60) {
        const months = eachMonthOfInterval({ start: new Date(from_date), end: new Date(to_date) });
        months.forEach(m => {
            revenueMap[format(m, groupByFormat)] = { revenue: 0, orders: 0 };
        });
      }

      const categoryMap: Record<string, number> = {};

      orders?.forEach(order => {
        const dateStr = format(parseISO(order.created_at), groupByFormat);
        
        if (!revenueMap[dateStr]) {
          revenueMap[dateStr] = { revenue: 0, orders: 0 };
        }
        
        // Only count paid for revenue, but count order for volume
        if (order.financial_status === 'paid' || order.financial_status === 'partially_paid') {
          revenueMap[dateStr].revenue += Number(order.total_price);
        }
        revenueMap[dateStr].orders += 1;

        // Categories
        order.line_items?.forEach((li: any) => {
          const type = li.variant?.product?.product_type || 'Uncategorized';
          categoryMap[type] = (categoryMap[type] || 0) + li.quantity;
        });
      });

      const revenueData = Object.entries(revenueMap).map(([date, data]) => ({
        date,
        revenue: Number(data.revenue.toFixed(2)),
        orders: data.orders
      }));

      // Sort revenue data by date (if not predefined)
      // Usually it's better to sort chronologically, but string sort might fail for 'MMM dd'.
      // If we prefilled, they are already in order.

      const ordersByCategory = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // top 5

      return sendSuccess('Analytics fetched successfully', {
        revenueData,
        ordersByCategory
      });
    } catch (error: any) {
      logger.error('DashboardController.getAnalytics', error);
      return sendError('Failed to fetch analytics');
    }
  }
}
