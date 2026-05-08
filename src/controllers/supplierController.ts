import { supabase } from '@/lib/supabase';
import { ApiResponse, sendSuccess, sendError } from '@/lib/response';
import { Supplier, CreateSupplierDTO, UpdateSupplierDTO } from '@/models/supplier';
import { createSupplierSchema, updateSupplierSchema, supplierFiltersSchema } from '@/validations/supplierValidation';
import { logger } from '@/lib/logger';

export class SupplierController {
  static async getAll(filters: any) {
    const startTime = Date.now();
    try {
      const validatedFilters = supplierFiltersSchema.parse(filters);
      const { page, per_page, search, status, from_date, to_date } = validatedFilters;

      let query = supabase
        .from('suppliers')
        .select('*', { count: 'exact' });

      // Search (Name, Email, Phone)
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
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
      if (duration > 500) logger.warn(`Slow query: SupplierController.getAll took ${duration}ms`);

      return sendSuccess('Suppliers fetched successfully', data, {
        total,
        page,
        per_page,
        total_pages: totalPages,
      });
    } catch (error: any) {
      return sendError(error.message || 'Failed to fetch suppliers');
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return sendError('Supplier not found', null, 404);

      return sendSuccess('Supplier fetched successfully', data);
    } catch (error: any) {
      return sendError(error.message || 'Failed to fetch supplier');
    }
  }

  static async create(body: CreateSupplierDTO) {
    try {
      const validatedData = createSupplierSchema.parse(body);

      const { data, error } = await supabase
        .from('suppliers')
        .insert(validatedData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') return sendError('A supplier with this email already exists', null, 400);
        throw error;
      }

      return sendSuccess('Supplier created successfully', data, null, 201);
    } catch (error: any) {
      return sendError(error.message || 'Failed to create supplier');
    }
  }

  static async update(id: string, body: UpdateSupplierDTO) {
    try {
      const validatedData = updateSupplierSchema.parse(body);

      const { data, error } = await supabase
        .from('suppliers')
        .update(validatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') return sendError('A supplier with this email already exists', null, 400);
        throw error;
      }

      if (!data) return sendError('Supplier not found', null, 404);

      return sendSuccess('Supplier updated successfully', data);
    } catch (error: any) {
      return sendError(error.message || 'Failed to update supplier');
    }
  }

  static async delete(id: string) {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return sendSuccess('Supplier deleted successfully');
    } catch (error: any) {
      return sendError(error.message || 'Failed to delete supplier');
    }
  }
}
