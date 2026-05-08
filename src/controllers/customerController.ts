import { supabase } from '@/lib/supabase';
import { sendSuccess, sendError } from '@/lib/response';
import { createCustomerSchema, updateCustomerSchema, customerQuerySchema } from '@/validations/customerValidation';
import { logger } from '@/lib/logger';

export class CustomerController {
  static async getAll(query: any) {
    try {
      const validated = customerQuerySchema.parse(query);
      const { search, status, from_date, to_date, page, per_page } = validated;

      let supabaseQuery = supabase
        .from('customers')
        .select('*', { count: 'exact' });

      // Filtering
      if (status) {
        supabaseQuery = supabaseQuery.eq('status', status);
      }

      if (from_date) {
        supabaseQuery = supabaseQuery.gte('created_at', from_date);
      }

      if (to_date) {
        supabaseQuery = supabaseQuery.lte('created_at', to_date);
      }

      // Search (Email, Phone, Name)
      if (search) {
        supabaseQuery = supabaseQuery.or(`email.ilike.%${search}%,phone.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      // Pagination
      const from = (page - 1) * per_page;
      const to = from + per_page - 1;

      const { data, error, count } = await supabaseQuery
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return sendSuccess('Customers fetched successfully', data, {
        total: count,
        page,
        per_page,
        total_pages: Math.ceil((count || 0) / per_page),
      });
    } catch (error: any) {
      logger.error('CustomerController.getAll', error);
      return sendError(error.message || 'Failed to fetch customers');
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return sendError('Customer not found', null, 404);

      return sendSuccess('Customer fetched successfully', data);
    } catch (error: any) {
      logger.error('CustomerController.getById', error);
      return sendError(error.message || 'Failed to fetch customer');
    }
  }

  static async create(body: any) {
    try {
      const validated = createCustomerSchema.parse(body);

      const { data, error } = await supabase
        .from('customers')
        .insert(validated)
        .select()
        .single();

      if (error) throw error;

      return sendSuccess('Customer created successfully', data, null, 201);
    } catch (error: any) {
      logger.error('CustomerController.create', error);
      return sendError(error.message || 'Failed to create customer');
    }
  }

  static async update(id: string, body: any) {
    try {
      const validated = updateCustomerSchema.parse(body);

      const { data, error } = await supabase
        .from('customers')
        .update(validated)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return sendError('Customer not found', null, 404);

      return sendSuccess('Customer updated successfully', data);
    } catch (error: any) {
      logger.error('CustomerController.update', error);
      return sendError(error.message || 'Failed to update customer');
    }
  }

  static async delete(id: string) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return sendSuccess('Customer deleted successfully');
    } catch (error: any) {
      logger.error('CustomerController.delete', error);
      return sendError(error.message || 'Failed to delete customer');
    }
  }
}
