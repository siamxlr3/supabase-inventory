import { supabase } from '@/lib/supabase';
import { createLocationSchema, updateLocationSchema, locationQuerySchema } from '@/validations/locationValidation';
import { sendSuccess, sendError } from '@/lib/response';
import { logger } from '@/lib/logger';

/**
 * Controller for handling Location-related business logic and database queries.
 * Handles validation, filtering, pagination, and optimized Supabase queries.
 */
export class LocationController {
  /**
   * Get all locations with search, filtering, and pagination.
   */
  static async getAll(queryParams: any) {
    try {
      const validated = locationQuerySchema.parse(queryParams);
      const { page, per_page, search, active, from_date, to_date } = validated;

      let query = supabase
        .from('locations')
        .select('*', { count: 'exact' });

      // Search (Optimized using GIN indices on name and address1)
      if (search) {
        query = query.or(`name.ilike.%${search}%,address1.ilike.%${search}%,city.ilike.%${search}%`);
      }

      // Filtering
      if (active !== undefined) {
        query = query.eq('active', active);
      }

      // Date Filtering
      if (from_date) query = query.gte('created_at', from_date);
      if (to_date) query = query.lte('created_at', to_date);

      // Pagination
      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return sendSuccess('Locations fetched successfully', data, {
        page,
        per_page,
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / per_page),
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const formattedErrors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return sendError('Validation failed', formattedErrors, 400);
      }
      logger.error('LocationController.getAll', error);
      return sendError(error.message || 'Failed to fetch locations');
    }
  }

  /**
   * Get a single location by ID.
   */
  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return sendError('Location not found', null, 404);

      return sendSuccess('Location fetched successfully', data);
    } catch (error: any) {
      logger.error('LocationController.getById', error);
      return sendError(error.message || 'Failed to fetch location');
    }
  }

  /**
   * Create a new location.
   */
  static async create(body: any) {
    try {
      const validated = createLocationSchema.parse(body);

      const { data, error } = await supabase
        .from('locations')
        .insert(validated)
        .select()
        .single();

      if (error) throw error;

      return sendSuccess('Location created successfully', data, {}, 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const formattedErrors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return sendError('Validation failed', formattedErrors, 400);
      }
      logger.error('LocationController.create', error);
      return sendError(error.message || 'Failed to create location');
    }
  }

  /**
   * Update an existing location.
   */
  static async update(id: string, body: any) {
    try {
      const validated = updateLocationSchema.parse(body);

      const { data, error } = await supabase
        .from('locations')
        .update(validated)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return sendError('Location not found', null, 404);

      return sendSuccess('Location updated successfully', data);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const formattedErrors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return sendError('Validation failed', formattedErrors, 400);
      }
      logger.error('LocationController.update', error);
      return sendError(error.message || 'Failed to update location');
    }
  }

  /**
   * Delete a location.
   */
  static async delete(id: string) {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) {
        // Handle Foreign Key Constraint Violation (PostgreSQL code 23503)
        if (error.code === '23503') {
          return sendError(
            'Cannot delete location because it has associated inventory or adjustment history. Please remove those records first.',
            error,
            409
          );
        }
        throw error;
      }

      return sendSuccess('Location deleted successfully');
    } catch (error: any) {
      logger.error('LocationController.delete', error);
      return sendError(error.message || 'Failed to delete location');
    }
  }
}
